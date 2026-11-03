import "server-only"
import { query, withTransaction } from "@/lib/server/db"
import { HttpError } from "@/lib/server/access"
import { consolidate, parseEsocialFiles, type InputFile, type TrabalhadorImportado } from "../import/parser"

export type Situacao = "novo" | "atualizado" | "sem_alteracao"

export interface LinhaPrevia {
  cpf: string
  nome: string | null
  matricula: string | null
  cargo: string | null
  dataAdmissao: string | null
  dataDesligamento: string | null
  situacao: Situacao
  avisos: string[]
}

export interface ResultadoImportacao {
  empresa: { id: string; razaoSocial: string; cnpj: string }
  arquivosLidos: number
  arquivosIgnorados: number
  erros: string[]
  eventos: Record<string, number>
  eventosDeOutroEmpregador: number
  s2240JaEnviados: number
  estabelecimentos: number
  totais: { trabalhadores: number; novos: number; atualizados: number; semAlteracao: number; ativos: number; desligados: number; semMatricula: number }
  linhas: LinhaPrevia[]
  gravado: boolean
}

interface FuncionarioAtual {
  id: string
  cpf: string
  nome: string
  matricula_esocial: string | null
  cargo: string | null
  data_admissao: string | null
  data_desligamento: string | null
  status: string
}

const onlyDigits = (v: string | null | undefined) => String(v ?? "").replace(/\D/g, "")

function statusFor(w: TrabalhadorImportado): "ativo" | "inativo" {
  return w.dataDesligamento ? "inativo" : "ativo"
}

function compare(w: TrabalhadorImportado, atual: FuncionarioAtual | undefined): { situacao: Situacao; avisos: string[] } {
  const avisos: string[] = []
  if (!w.matricula && !w.semVinculo) avisos.push("Sem matrícula nos arquivos: inclua o S-2200 ou o S-1200 deste trabalhador.")
  if (!w.nome) avisos.push("Nome não encontrado (só há S-1200); preencha depois no cadastro.")
  if (!atual) return { situacao: "novo", avisos }
  if (atual.matricula_esocial && w.matricula && atual.matricula_esocial !== w.matricula) {
    avisos.push(`Matrícula muda de ${atual.matricula_esocial} para ${w.matricula} (valor do eSocial prevalece).`)
  }
  const mudou =
    (w.nome && w.nome !== atual.nome) ||
    (w.matricula && w.matricula !== atual.matricula_esocial) ||
    (w.cargo && w.cargo !== atual.cargo) ||
    (w.dataAdmissao && w.dataAdmissao !== atual.data_admissao) ||
    (w.dataDesligamento ?? null) !== (atual.data_desligamento ?? null) ||
    statusFor(w) !== (atual.status === "ativo" ? "ativo" : "inativo")
  return { situacao: mudou ? "atualizado" : "sem_alteracao", avisos }
}

export async function importarEsocial(params: {
  empresaId: string
  userId: string
  files: InputFile[]
  gravar: boolean
}): Promise<ResultadoImportacao> {
  const [empresa] = await query<{ id: string; razao_social: string; cnpj: string; classificacao_tributaria: string | null; inicio_validade: string | null }>(
    "SELECT id, razao_social, cnpj, classificacao_tributaria, inicio_validade FROM empresas WHERE id = $1",
    [params.empresaId]
  )
  if (!empresa) throw new HttpError(404, "Empresa não encontrada.")

  const parsed = parseEsocialFiles(params.files)
  if (!parsed.events.length) {
    throw new HttpError(
      422,
      "Nenhum evento do eSocial encontrado nos arquivos. Envie o ZIP baixado do portal eSocial (Download) ou os XMLs dos eventos."
    )
  }
  const dados = consolidate(parsed.events, empresa.cnpj)
  if (!dados.trabalhadores.length && dados.outroEmpregador) {
    throw new HttpError(
      422,
      `Os eventos enviados são de outro empregador (CNPJ diferente de ${empresa.cnpj}). Confira se escolheu a empresa certa.`
    )
  }

  const atuais = await query<FuncionarioAtual>(
    "SELECT id, cpf, nome, matricula_esocial, cargo, data_admissao, data_desligamento, status FROM funcionarios WHERE empresa_id = $1",
    [empresa.id]
  )
  const porCpf = new Map(atuais.map((f) => [onlyDigits(f.cpf), f]))

  const linhas: LinhaPrevia[] = dados.trabalhadores.map((w) => {
    const { situacao, avisos } = compare(w, porCpf.get(w.cpf))
    return {
      cpf: w.cpf,
      nome: w.nome,
      matricula: w.matricula,
      cargo: w.cargo,
      dataAdmissao: w.dataAdmissao,
      dataDesligamento: w.dataDesligamento,
      situacao,
      avisos,
    }
  })

  const resultado: ResultadoImportacao = {
    empresa: { id: empresa.id, razaoSocial: empresa.razao_social, cnpj: empresa.cnpj },
    arquivosLidos: parsed.arquivosLidos,
    arquivosIgnorados: parsed.ignorados.length,
    erros: parsed.erros,
    eventos: dados.contagem as Record<string, number>,
    eventosDeOutroEmpregador: dados.outroEmpregador,
    s2240JaEnviados: dados.s2240Enviados,
    estabelecimentos: dados.estabelecimentos.length,
    totais: {
      trabalhadores: linhas.length,
      novos: linhas.filter((l) => l.situacao === "novo").length,
      atualizados: linhas.filter((l) => l.situacao === "atualizado").length,
      semAlteracao: linhas.filter((l) => l.situacao === "sem_alteracao").length,
      ativos: dados.trabalhadores.filter((w) => !w.dataDesligamento).length,
      desligados: dados.trabalhadores.filter((w) => w.dataDesligamento).length,
      semMatricula: dados.trabalhadores.filter((w) => !w.matricula && !w.semVinculo).length,
    },
    linhas,
    gravado: false,
  }

  if (!params.gravar) return resultado

  await withTransaction(async (client) => {
    for (const w of dados.trabalhadores) {
      // Valores do eSocial prevalecem; campos ausentes no XML não apagam o que já está cadastrado
      await client.query(
        `INSERT INTO funcionarios
           (empresa_id, nome, cpf, data_nascimento, email, telefone, cargo, data_admissao, status,
            matricula_esocial, cod_categoria, cbo, sexo, data_desligamento, origem, esocial_sincronizado_em)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'esocial', NOW())
         ON CONFLICT (empresa_id, cpf) DO UPDATE SET
           nome = COALESCE(EXCLUDED.nome, funcionarios.nome),
           data_nascimento = COALESCE(EXCLUDED.data_nascimento, funcionarios.data_nascimento),
           email = COALESCE(EXCLUDED.email, funcionarios.email),
           telefone = COALESCE(EXCLUDED.telefone, funcionarios.telefone),
           cargo = COALESCE(EXCLUDED.cargo, funcionarios.cargo),
           data_admissao = COALESCE(EXCLUDED.data_admissao, funcionarios.data_admissao),
           status = CASE WHEN funcionarios.status = 'cancelado' THEN funcionarios.status ELSE EXCLUDED.status END,
           matricula_esocial = COALESCE(EXCLUDED.matricula_esocial, funcionarios.matricula_esocial),
           cod_categoria = COALESCE(EXCLUDED.cod_categoria, funcionarios.cod_categoria),
           cbo = COALESCE(EXCLUDED.cbo, funcionarios.cbo),
           sexo = COALESCE(EXCLUDED.sexo, funcionarios.sexo),
           data_desligamento = EXCLUDED.data_desligamento,
           esocial_sincronizado_em = NOW()`,
        [
          empresa.id,
          w.nome ?? `Trabalhador CPF ${w.cpf}`,
          w.cpf,
          w.dataNascimento,
          w.email,
          w.telefone,
          w.cargo,
          w.dataAdmissao,
          statusFor(w),
          w.matricula,
          w.codCategoria,
          w.cbo,
          w.sexo,
          w.dataDesligamento,
        ]
      )
    }

    for (const est of dados.estabelecimentos) {
      if (est.excluido) {
        await client.query("DELETE FROM estabelecimentos WHERE empresa_id = $1 AND tp_insc = $2 AND nr_insc = $3", [
          empresa.id,
          est.tpInsc,
          est.nrInsc,
        ])
        continue
      }
      await client.query(
        `INSERT INTO estabelecimentos (empresa_id, tp_insc, nr_insc, cnae_prep, ini_valid, fim_valid)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (empresa_id, tp_insc, nr_insc) DO UPDATE
           SET cnae_prep = COALESCE(EXCLUDED.cnae_prep, estabelecimentos.cnae_prep),
               ini_valid = EXCLUDED.ini_valid, fim_valid = EXCLUDED.fim_valid`,
        [empresa.id, est.tpInsc, est.nrInsc, est.cnaePrep, est.iniValid, est.fimValid]
      )
    }

    // S-1000: completa só o que estiver vazio no cadastro da empresa
    if (dados.empregador) {
      const e = dados.empregador
      await client.query(
        `UPDATE empresas SET
           classificacao_tributaria = COALESCE(classificacao_tributaria, $2),
           inicio_validade = COALESCE(inicio_validade, $3::date),
           ind_coop = COALESCE(ind_coop, $4), ind_constr = COALESCE(ind_constr, $5),
           ind_des_folha = COALESCE(ind_des_folha, $6),
           ind_opt_reg_eletron = COALESCE(ind_opt_reg_eletron, $7),
           esocial_status = 'REGISTRADO'
         WHERE id = $1`,
        [
          empresa.id,
          e.classTrib,
          e.iniValid ? `${e.iniValid}-01` : null,
          e.indCoop === null ? null : e.indCoop !== "0",
          e.indConstr === null ? null : e.indConstr === "1",
          e.indDesFolha === null ? null : e.indDesFolha !== "0",
          e.indOptRegEletron,
        ]
      )
    }

    await client.query(
      "INSERT INTO esocial_importacoes (empresa_id, arquivos, resumo, created_by) VALUES ($1, $2, $3, $4)",
      [
        empresa.id,
        params.files.map((f) => f.name),
        JSON.stringify({ ...resultado, linhas: undefined, gravado: true }),
        params.userId,
      ]
    )
  })

  return { ...resultado, gravado: true }
}
