import "server-only"
import { query, queryOne } from "@/lib/server/db"
import { HttpError } from "@/lib/server/access"
import { ValidationError, createS2240Event, type S2240Input } from "./s2240"

/**
 * S-2240 em lote: gera o evento para vários trabalhadores a partir de um modelo
 * (uma exposição já existente) ou do S-2240 anterior do próprio trabalhador.
 */

export interface Pendente {
  /** Id do vínculo (uma pessoa pode ter mais de um vínculo ativo) */
  id: string
  funcionarioId: string
  nome: string
  cpf: string
  matricula: string
  cargo: string | null
  dataAdmissao: string | null
  anterior: { exposicaoId: string; setor: string; agentes: string; dtIni: string } | null
}

export interface Modelo {
  exposicaoId: string
  setor: string
  atividade: string
  agentes: string
  total: number
}

/** Vínculos ativos sem S-2240 para a sua matrícula (o S-2240 é por vínculo). */
export async function listarPendentes(empresaId: string) {
  const pendentes = await query<any>(
    `SELECT v.id AS vinculo_id, f.id, f.nome, f.cpf, v.matricula AS matricula_esocial,
            COALESCE(v.cargo, f.cargo) AS cargo, COALESCE(v.data_admissao, f.data_admissao) AS data_admissao,
            ant.exposicao_id, ant.dsc_setor, ant.agentes, ant.dt_ini
       FROM funcionario_vinculos v
       JOIN funcionarios f ON f.id = v.funcionario_id AND f.status <> 'cancelado'
       LEFT JOIN LATERAL (
         SELECT x.id AS exposicao_id, a.dsc_setor, x.dt_ini_condicao AS dt_ini,
                (SELECT string_agg(g.cod_ag_noc, ', ' ORDER BY g.ordem) FROM exposicao_agentes g WHERE g.exposicao_id = x.id) AS agentes
           FROM exposicoes_trabalhador x
           JOIN ambientes_trabalho a ON a.id = x.ambiente_id
          WHERE x.funcionario_id = f.id
          ORDER BY x.dt_ini_condicao DESC, x.created_at DESC
          LIMIT 1
       ) ant ON TRUE
      WHERE v.empresa_id = $1
        AND v.status = 'ativo'
        AND v.matricula IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM esocial_eventos ev
           WHERE ev.funcionario_id = f.id
             AND ev.tipo_evento = 'S-2240'
             AND position('<matricula>' || v.matricula || '</matricula>' IN coalesce(ev.xml_envio, '')) > 0
        )
      ORDER BY f.nome, v.data_admissao`,
    [empresaId]
  )

  const modelos = await query<any>(
    `WITH e AS (
       SELECT x.id, x.ambiente_id, a.dsc_setor, x.dsc_ativ_des, x.dt_ini_condicao,
              coalesce((SELECT string_agg(g.cod_ag_noc, ', ' ORDER BY g.ordem) FROM exposicao_agentes g WHERE g.exposicao_id = x.id), '') AS agentes
         FROM exposicoes_trabalhador x
         JOIN ambientes_trabalho a ON a.id = x.ambiente_id
        WHERE x.empresa_id = $1
     )
     SELECT DISTINCT ON (ambiente_id, agentes, dsc_ativ_des)
            id, dsc_setor, dsc_ativ_des, agentes,
            count(*) OVER (PARTITION BY ambiente_id, agentes, dsc_ativ_des) AS total
       FROM e
      ORDER BY ambiente_id, agentes, dsc_ativ_des, dt_ini_condicao DESC`,
    [empresaId]
  )

  const responsaveis = await query<any>(
    `SELECT id, nome, cpf, ide_oc, dsc_oc, nr_oc, uf_oc
       FROM responsaveis_registros_ambientais WHERE empresa_id = $1 AND ativo ORDER BY nome`,
    [empresaId]
  )

  // Sugestão de data mínima: início do primeiro S-2240 da empresa (aproxima o início da
  // obrigatoriedade dos eventos de SST, antes da qual o eSocial não aceita a condição)
  const primeiro = await queryOne<{ min: string | null }>(
    "SELECT min(dt_ini_condicao)::text AS min FROM exposicoes_trabalhador WHERE empresa_id = $1 AND origem = 'esocial'",
    [empresaId]
  )

  return {
    dataMinimaSugerida: primeiro?.min ?? null,
    pendentes: pendentes.map<Pendente>((p) => ({
      id: p.vinculo_id,
      funcionarioId: p.id,
      nome: p.nome,
      cpf: p.cpf,
      matricula: p.matricula_esocial,
      cargo: p.cargo,
      dataAdmissao: p.data_admissao,
      anterior: p.exposicao_id ? { exposicaoId: p.exposicao_id, setor: p.dsc_setor, agentes: p.agentes ?? "", dtIni: p.dt_ini } : null,
    })),
    modelos: modelos
      .map<Modelo>((m) => ({ exposicaoId: m.id, setor: m.dsc_setor, atividade: m.dsc_ativ_des, agentes: m.agentes, total: Number(m.total) }))
      .sort((a, b) => b.total - a.total),
    responsaveis,
  }
}

/** Converte uma exposição gravada nos dados de entrada do S-2240 (ambiente, atividade, agentes, responsáveis). */
async function exposicaoComoModelo(exposicaoId: string, empresaId: string) {
  const x = await queryOne(
    "SELECT id, ambiente_id, dsc_ativ_des, obs_compl FROM exposicoes_trabalhador WHERE id = $1 AND empresa_id = $2",
    [exposicaoId, empresaId]
  )
  if (!x) throw new HttpError(400, "Modelo de S-2240 não encontrado nesta empresa.")
  const agentes = await query<any>("SELECT * FROM exposicao_agentes WHERE exposicao_id = $1 ORDER BY ordem", [exposicaoId])
  const epis = await query<any>(
    `SELECT ae.agente_id, ae.doc_aval FROM exposicao_agente_epis ae
       JOIN exposicao_agentes a ON a.id = ae.agente_id WHERE a.exposicao_id = $1`,
    [exposicaoId]
  )
  const resp = await query<{ responsavel_id: string }>("SELECT responsavel_id FROM exposicao_responsaveis WHERE exposicao_id = $1", [exposicaoId])
  const num = (v: string | null) => (v === null ? null : Number(v))

  return {
    ambienteId: x.ambiente_id as string,
    dscAtivDes: x.dsc_ativ_des as string,
    obsCompl: x.obs_compl as string | null,
    responsavelIds: resp.map((r) => r.responsavel_id),
    agentes: agentes.map((a) => ({
      codAgNoc: a.cod_ag_noc,
      dscAgNoc: a.dsc_ag_noc,
      tpAval: a.tp_aval,
      intConc: num(a.int_conc),
      limTol: num(a.lim_tol),
      unMed: a.un_med === null ? null : Number(a.un_med),
      tecMedicao: a.tec_medicao,
      nrProcJud: a.nr_proc_jud,
      utilizEPC: a.utiliz_epc,
      eficEpc: a.efic_epc,
      utilizEPI: a.utiliz_epi,
      eficEpi: a.efic_epi,
      epis: epis.filter((e) => e.agente_id === a.id).map((e) => e.doc_aval),
      epiCompl: a.med_protecao
        ? {
            medProtecao: a.med_protecao,
            condFuncto: a.cond_functo,
            usoInint: a.uso_inint,
            przValid: a.przo_valid,
            periodicTroca: a.periodic_troca,
            higienizacao: a.higienizacao,
          }
        : null,
    })) as S2240Input["agentes"],
  }
}

export interface LoteParams {
  empresaId: string
  /** Vínculos (ids de funcionario_vinculos) a gerar */
  vinculoIds: string[]
  /** Usa o S-2240 anterior do próprio trabalhador (readmissão) quando existir */
  copiarAnterior: boolean
  /** Exposição usada como modelo para quem não tem S-2240 anterior */
  modeloExposicaoId?: string | null
  /** Início da condição: data de admissão do vínculo atual ou uma data fixa */
  dataInicio: { tipo: "admissao" } | { tipo: "fixa"; data: string }
  /** A condição nunca começa antes desta data (início da obrigatoriedade de SST do empregador) */
  dataMinima?: string | null
  /** Substitui os responsáveis do modelo, se informado */
  responsavelIds?: string[] | null
}

export interface ResultadoLote {
  gerados: number
  falhas: { vinculoId: string; nome: string; erros: string[] }[]
}

export async function gerarLoteS2240(userId: string, p: LoteParams): Promise<ResultadoLote> {
  if (!p.vinculoIds?.length) throw new HttpError(400, "Selecione ao menos um trabalhador.")
  if (p.vinculoIds.length > 500) throw new HttpError(400, "No máximo 500 trabalhadores por lote.")
  if (p.dataInicio.tipo === "fixa" && !/^\d{4}-\d{2}-\d{2}$/.test(p.dataInicio.data)) {
    throw new HttpError(400, "Data de início inválida.")
  }

  const { pendentes } = await listarPendentes(p.empresaId)
  const porId = new Map(pendentes.map((x) => [x.id, x]))
  const cacheModelos = new Map<string, Awaited<ReturnType<typeof exposicaoComoModelo>>>()
  const modelo = async (id: string) => {
    if (!cacheModelos.has(id)) cacheModelos.set(id, await exposicaoComoModelo(id, p.empresaId))
    return cacheModelos.get(id)!
  }

  const resultado: ResultadoLote = { gerados: 0, falhas: [] }
  for (const vinculoId of p.vinculoIds) {
    const t = porId.get(vinculoId)
    if (!t) {
      resultado.falhas.push({ vinculoId, nome: "", erros: ["Trabalhador não está pendente (já tem S-2240 para a matrícula atual ou está inativo)."] })
      continue
    }
    try {
      const fonteId = p.copiarAnterior && t.anterior ? t.anterior.exposicaoId : p.modeloExposicaoId
      if (!fonteId) throw new ValidationError(["Sem S-2240 anterior e nenhum modelo escolhido."])
      const base = await modelo(fonteId)

      // A condição do vínculo atual não pode começar antes da admissão
      const admissao = t.dataAdmissao
      let dtIni = p.dataInicio.tipo === "fixa" ? p.dataInicio.data : admissao
      if (!dtIni) throw new ValidationError(["Trabalhador sem data de admissão; use uma data fixa."])
      if (admissao && dtIni < admissao) dtIni = admissao
      if (p.dataMinima && dtIni < p.dataMinima) dtIni = p.dataMinima

      await createS2240Event(userId, {
        empresaId: p.empresaId,
        funcionarioId: t.funcionarioId,
        matricula: t.matricula,
        ambienteId: base.ambienteId,
        dtIniCondicao: dtIni,
        dscAtivDes: base.dscAtivDes,
        agentes: base.agentes,
        responsavelIds: p.responsavelIds?.length ? p.responsavelIds : base.responsavelIds,
        obsCompl: base.obsCompl,
      })
      resultado.gerados++
    } catch (err) {
      const erros = err instanceof ValidationError ? err.errors : [err instanceof Error ? err.message : "Erro ao gerar"]
      resultado.falhas.push({ vinculoId, nome: t.nome, erros })
    }
  }
  return resultado
}
