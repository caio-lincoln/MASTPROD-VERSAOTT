import "server-only"
import { query, withTransaction } from "@/lib/server/db"
import { HttpError } from "@/lib/server/access"
import { consolidate, parseEsocialFiles, type InputFile, type TrabalhadorImportado } from "../import/parser"
import { vinculoDe } from "../import/sst-mappers"
import { importarHistoricoSst } from "./sst-history"
import forge from "node-forge"

/**
 * Lê o certificado que assinou o S-1000. Quando é o e-CNPJ da própria empresa
 * (CN "NOME:CNPJ"), traz a razão social e o município do titular.
 */
function dadosDoCertificado(base64: string | null, cnpjEmpresa: string) {
  if (!base64) return null
  try {
    const der = forge.util.decode64(base64)
    const cert = forge.pki.certificateFromAsn1(forge.asn1.fromDer(der))
    const attr = (name: string) => String(cert.subject.getField(name)?.value ?? "").trim() || null
    const cn = attr("CN") ?? ""
    const [, nome, doc] = cn.match(/^(.+):([A-Z0-9]{14}|\d{11})$/i) ?? []
    if (!nome || doc.toUpperCase() !== cnpjEmpresa.replace(/[^0-9A-Za-z]/g, "").toUpperCase()) return null
    return { nome: nome.trim(), cidade: attr("L"), uf: attr("ST")?.toUpperCase().slice(0, 2) ?? null }
  } catch {
    return null
  }
}

export type Situacao = "novo" | "atualizado" | "sem_alteracao"

export interface LinhaPrevia {
  cpf: string
  nome: string | null
  matricula: string | null
  cargo: string | null
  dataAdmissao: string | null
  dataDesligamento: string | null
  afastamentoInicio: string | null
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
  eventosExcluidos: number
  eventosRetificados: number
  exclusoesSemRecibo: number
  s2240JaEnviados: number
  estabelecimentos: number
  /** Histórico de SST (S-2210, S-2220, S-2240) encontrado nos arquivos */
  sst: { tipo: string; novos: number; jaImportados: number }[]
  /** Eventos de SST de trabalhador sem cadastro (será criado com o CPF) */
  sstSemTrabalhador: number
  /** Dados do empregador lidos do S-1000 (recibo e certificado do titular) */
  empregadorExtraido: { nome: string | null; natJurid: string | null; cidade: string | null; uf: string | null } | null
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
  afastamento_inicio: string | null
  status: string
}

const onlyDigits = (v: string | null | undefined) => String(v ?? "").replace(/\D/g, "")

// Só eventos de início/fim de vínculo dizem se o trabalhador está desligado; só o S-2230 diz se está afastado.
// Sem eles no arquivo, o que já está cadastrado é mantido.
const temEventoDeVinculo = (w: TrabalhadorImportado) => w.eventos.some((e) => ["S-2200", "S-2300", "S-2299", "S-2399"].includes(e))
const temEventoDeAfastamento = (w: TrabalhadorImportado) => w.eventos.includes("S-2230")

function statusFor(w: TrabalhadorImportado): "ativo" | "inativo" {
  return w.dataDesligamento ? "inativo" : "ativo"
}

function compare(w: TrabalhadorImportado, atual: FuncionarioAtual | undefined): { situacao: Situacao; avisos: string[] } {
  const avisos: string[] = []
  // Avisos consideram o que já está cadastrado: um ZIP parcial não "apaga" nome nem matrícula
  if (!w.matricula && !atual?.matricula_esocial && !w.semVinculo) avisos.push("Sem matrícula nos arquivos: inclua o S-2200 ou o S-1200 deste trabalhador.")
  if (!w.nome && !atual) avisos.push("Nome não encontrado (só há S-1200/S-1202); preencha depois no cadastro.")
  if (w.afastamentoInicio) avisos.push(`Afastado desde ${w.afastamentoInicio.split("-").reverse().join("/")} (motivo ${w.afastamentoMotivo ?? "?"}).`)
  if (!atual) return { situacao: "novo", avisos }
  if (atual.matricula_esocial && w.matricula && atual.matricula_esocial !== w.matricula) {
    avisos.push(`Matrícula muda de ${atual.matricula_esocial} para ${w.matricula} (valor do eSocial prevalece).`)
  }
  const mudou =
    (w.nome && w.nome !== atual.nome) ||
    (w.matricula && w.matricula !== atual.matricula_esocial) ||
    (w.cargo && w.cargo !== atual.cargo) ||
    (w.dataAdmissao && w.dataAdmissao !== atual.data_admissao) ||
    (temEventoDeVinculo(w) && (w.dataDesligamento ?? null) !== (atual.data_desligamento ?? null)) ||
    (temEventoDeAfastamento(w) && (w.afastamentoInicio ?? null) !== (atual.afastamento_inicio ?? null)) ||
    (temEventoDeVinculo(w) && atual.status !== "cancelado" && statusFor(w) !== (atual.status === "ativo" ? "ativo" : "inativo"))
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
    "SELECT id, cpf, nome, matricula_esocial, cargo, data_admissao, data_desligamento, afastamento_inicio, status FROM funcionarios WHERE empresa_id = $1",
    [empresa.id]
  )
  const porCpf = new Map(atuais.map((f) => [onlyDigits(f.cpf), f]))

  // Desligamento de vínculo antigo enviado com atraso (S-2299 retroativo): se o lote não traz
  // admissão e o cadastro já tem uma admissão posterior à data do desligamento, ele é de outro
  // vínculo e não pode desativar o trabalhador nem trocar a matrícula atual.
  for (const w of dados.trabalhadores) {
    const atual = porCpf.get(w.cpf)
    const temAdmissao = w.eventos.some((e) => e === "S-2200" || e === "S-2300")
    if (atual?.data_admissao && w.dataDesligamento && !temAdmissao && w.dataDesligamento < atual.data_admissao) {
      w.dataDesligamento = atual.data_desligamento
      w.matricula = atual.matricula_esocial
      w.eventos = w.eventos.filter((e) => e !== "S-2299" && e !== "S-2399")
    }
  }

  const linhas: LinhaPrevia[] = dados.trabalhadores.map((w) => {
    const { situacao, avisos } = compare(w, porCpf.get(w.cpf))
    const atual = porCpf.get(w.cpf)
    return {
      cpf: w.cpf,
      nome: w.nome ?? atual?.nome ?? null,
      matricula: w.matricula ?? atual?.matricula_esocial ?? null,
      cargo: w.cargo ?? atual?.cargo ?? null,
      dataAdmissao: w.dataAdmissao ?? atual?.data_admissao ?? null,
      dataDesligamento: temEventoDeVinculo(w) || !atual ? w.dataDesligamento : atual.data_desligamento,
      afastamentoInicio: temEventoDeAfastamento(w) || !atual ? w.afastamentoInicio : atual.afastamento_inicio,
      situacao,
      avisos,
    }
  })

  // Histórico de SST: o que já foi importado antes (mesmo Id de evento) não entra de novo
  const idsExistentes = new Set(
    (
      await query<{ id_evento: string }>(
        "SELECT id_evento FROM esocial_eventos WHERE empresa_id = $1 AND id_evento IS NOT NULL",
        [empresa.id]
      )
    ).map((r) => r.id_evento)
  )
  const sstNovos = dados.sst.filter((e) => !e.id || !idsExistentes.has(e.id))
  const cpfsConhecidos = new Set([...porCpf.keys(), ...dados.trabalhadores.map((w) => w.cpf)])
  const sstResumo = ["S-2240", "S-2220", "S-2210"].map((tipo) => {
    const todos = dados.sst.filter((e) => e.kind === tipo).length
    const novos = sstNovos.filter((e) => e.kind === tipo).length
    return { tipo, novos, jaImportados: todos - novos }
  })

  const resultado: ResultadoImportacao = {
    empresa: { id: empresa.id, razaoSocial: empresa.razao_social, cnpj: empresa.cnpj },
    arquivosLidos: parsed.arquivosLidos,
    arquivosIgnorados: parsed.ignorados.length,
    erros: parsed.erros,
    eventos: dados.contagem as Record<string, number>,
    eventosDeOutroEmpregador: dados.outroEmpregador,
    eventosExcluidos: dados.excluidos,
    eventosRetificados: dados.retificados,
    exclusoesSemRecibo: dados.exclusoesSemRecibo,
    s2240JaEnviados: dados.s2240Enviados,
    estabelecimentos: dados.estabelecimentos.length,
    sst: sstResumo,
    sstSemTrabalhador: sstNovos.filter((e) => !cpfsConhecidos.has(vinculoDe(e.node).cpf)).length,
    empregadorExtraido: dados.empregador
      ? (() => {
          const cert = dadosDoCertificado(dados.empregador!.certificadoAssinante, empresa.cnpj)
          return { nome: cert?.nome ?? null, natJurid: dados.empregador!.natJurid, cidade: cert?.cidade ?? null, uf: cert?.uf ?? null }
        })()
      : null,
    totais: {
      trabalhadores: linhas.length,
      novos: linhas.filter((l) => l.situacao === "novo").length,
      atualizados: linhas.filter((l) => l.situacao === "atualizado").length,
      semAlteracao: linhas.filter((l) => l.situacao === "sem_alteracao").length,
      ativos: linhas.filter((l) => !l.dataDesligamento).length,
      desligados: linhas.filter((l) => l.dataDesligamento).length,
      semMatricula: dados.trabalhadores.filter((w) => !w.matricula && !w.semVinculo && !porCpf.get(w.cpf)?.matricula_esocial).length,
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
            matricula_esocial, cod_categoria, cbo, sexo, data_desligamento, afastamento_inicio, afastamento_motivo,
            origem, esocial_sincronizado_em)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'esocial', NOW())
         ON CONFLICT (empresa_id, cpf) DO UPDATE SET
           nome = COALESCE($17, funcionarios.nome),
           data_nascimento = COALESCE(EXCLUDED.data_nascimento, funcionarios.data_nascimento),
           email = COALESCE(EXCLUDED.email, funcionarios.email),
           telefone = COALESCE(EXCLUDED.telefone, funcionarios.telefone),
           cargo = COALESCE(EXCLUDED.cargo, funcionarios.cargo),
           data_admissao = COALESCE(EXCLUDED.data_admissao, funcionarios.data_admissao),
           status = CASE WHEN funcionarios.status = 'cancelado' OR NOT $18 THEN funcionarios.status ELSE EXCLUDED.status END,
           matricula_esocial = COALESCE(EXCLUDED.matricula_esocial, funcionarios.matricula_esocial),
           cod_categoria = COALESCE(EXCLUDED.cod_categoria, funcionarios.cod_categoria),
           cbo = COALESCE(EXCLUDED.cbo, funcionarios.cbo),
           sexo = COALESCE(EXCLUDED.sexo, funcionarios.sexo),
           data_desligamento = CASE WHEN $18 THEN EXCLUDED.data_desligamento ELSE funcionarios.data_desligamento END,
           afastamento_inicio = CASE WHEN $19 THEN EXCLUDED.afastamento_inicio ELSE funcionarios.afastamento_inicio END,
           afastamento_motivo = CASE WHEN $19 THEN EXCLUDED.afastamento_motivo ELSE funcionarios.afastamento_motivo END,
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
          w.afastamentoInicio,
          w.afastamentoMotivo,
          w.nome,
          temEventoDeVinculo(w),
          temEventoDeAfastamento(w),
        ]
      )
    }

    await importarHistoricoSst(client, empresa.id, sstNovos, params.userId)

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
      const ext = resultado.empregadorExtraido
      // Nome só substitui um nome provisório (que é apenas o CNPJ), nunca um nome digitado
      const nomeProvisorio = onlyDigits(empresa.razao_social) === onlyDigits(empresa.cnpj)
      await client.query(
        `UPDATE empresas SET
           classificacao_tributaria = COALESCE(classificacao_tributaria, $2),
           inicio_validade = COALESCE(inicio_validade, $3::date),
           ind_coop = COALESCE(ind_coop, $4), ind_constr = COALESCE(ind_constr, $5),
           ind_des_folha = COALESCE(ind_des_folha, $6),
           ind_opt_reg_eletron = COALESCE(ind_opt_reg_eletron, $7),
           natureza_juridica = COALESCE(natureza_juridica, $8),
           razao_social = CASE WHEN $9::text IS NOT NULL AND $10 THEN $9 ELSE razao_social END,
           cidade = COALESCE(cidade, $11),
           estado = COALESCE(estado, $12),
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
          e.natJurid,
          ext?.nome ?? null,
          nomeProvisorio,
          ext?.cidade ?? null,
          ext?.uf ?? null,
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
