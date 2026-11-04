import "server-only"
import type { PoolClient } from "pg"
import { withTransaction } from "@/lib/server/db"
import { HttpError } from "@/lib/server/access"
import { cleanInscricao, empregadorIde, onlyDigits } from "../events/common"
import { buildS2240XML } from "../events/S-2240/builder"
import { validateS2240 } from "../events/S-2240/validator"
import { COD_AUSENCIA_AGENTE, type S2240Data } from "../events/S-2240/types"
import { resolverVinculo } from "./vinculos"

/** Payload enviado pela tela de criação do S-2240. */
export interface S2240Input {
  empresaId: string
  funcionarioId: string
  matricula?: string | null // atualiza funcionarios.matricula_esocial quando informada
  ambienteId?: string | null
  novoAmbiente?: { nome?: string; localAmb: "1" | "2"; dscSetor: string; tpInsc: "1" | "3" | "4"; nrInsc: string } | null
  dtIniCondicao: string
  dtFimCondicao?: string | null
  dscAtivDes: string
  agentes: {
    riscoId?: string | null
    codAgNoc: string
    dscAgNoc?: string | null
    tpAval?: "1" | "2" | null
    intConc?: number | null
    limTol?: number | null
    unMed?: number | null
    tecMedicao?: string | null
    nrProcJud?: string | null
    utilizEPC?: "0" | "1" | "2" | null
    eficEpc?: "S" | "N" | null
    utilizEPI?: "0" | "1" | "2" | null
    eficEpi?: "S" | "N" | null
    epis?: string[]
    epiCompl?: {
      medProtecao: "S" | "N"
      condFuncto: "S" | "N"
      usoInint: "S" | "N"
      przValid: "S" | "N"
      periodicTroca: "S" | "N"
      higienizacao: "S" | "N"
    } | null
  }[]
  responsavelIds?: string[]
  novoResponsavel?: { nome: string; cpf: string; ideOC: "1" | "4" | "9"; dscOC?: string | null; nrOC: string; ufOC: string } | null
  obsCompl?: string | null
  indRetif?: "1" | "2"
  nrRecibo?: string | null
}

export class ValidationError extends HttpError {
  constructor(public errors: string[]) {
    super(422, errors.join("\n"))
  }
}

/** Monta os dados do S-2240 a partir do que está gravado no banco. */
export async function loadS2240Data(
  client: PoolClient,
  exposicaoId: string,
  retif?: { indRetif: "1" | "2"; nrRecibo?: string | null }
): Promise<S2240Data> {
  const { rows: [x] } = await client.query(
    `SELECT x.*, e.cnpj, e.natureza_juridica, f.cpf,
            COALESCE(x.matricula, f.matricula_esocial) AS matricula_vinculo,
            COALESCE((SELECT v.cod_categoria FROM funcionario_vinculos v
                       WHERE v.funcionario_id = f.id AND v.matricula = COALESCE(x.matricula, f.matricula_esocial)), f.cod_categoria) AS categ_vinculo,
            a.local_amb, a.dsc_setor, a.tp_insc AS amb_tp_insc, a.nr_insc AS amb_nr_insc
       FROM exposicoes_trabalhador x
       JOIN empresas e ON e.id = x.empresa_id
       JOIN funcionarios f ON f.id = x.funcionario_id
       JOIN ambientes_trabalho a ON a.id = x.ambiente_id
      WHERE x.id = $1`,
    [exposicaoId]
  )
  if (!x) throw new HttpError(404, "Exposição não encontrada.")

  const { rows: agentes } = await client.query(
    "SELECT * FROM exposicao_agentes WHERE exposicao_id = $1 ORDER BY ordem, created_at",
    [exposicaoId]
  )
  const { rows: epis } = await client.query(
    `SELECT ae.agente_id, ae.doc_aval FROM exposicao_agente_epis ae
       JOIN exposicao_agentes a ON a.id = ae.agente_id
      WHERE a.exposicao_id = $1 ORDER BY ae.created_at`,
    [exposicaoId]
  )
  const { rows: responsaveis } = await client.query(
    `SELECT r.* FROM exposicao_responsaveis xr
       JOIN responsaveis_registros_ambientais r ON r.id = xr.responsavel_id
      WHERE xr.exposicao_id = $1 ORDER BY r.nome`,
    [exposicaoId]
  )

  const toDate = (v: Date | string | null) =>
    v === null ? null : typeof v === "string" ? v.slice(0, 10) : v.toISOString().slice(0, 10)
  const num = (v: string | null) => (v === null || v === undefined ? null : Number(v))

  return {
    empregador: empregadorIde(x.cnpj, x.natureza_juridica),
    indRetif: retif?.indRetif ?? "1",
    nrRecibo: retif?.nrRecibo ?? null,
    trabalhador: { cpf: x.cpf, matricula: x.matricula_vinculo, codCateg: x.categ_vinculo },
    dtIniCondicao: toDate(x.dt_ini_condicao)!,
    dtFimCondicao: toDate(x.dt_fim_condicao),
    ambientes: [{ localAmb: x.local_amb, dscSetor: x.dsc_setor, tpInsc: x.amb_tp_insc, nrInsc: x.amb_nr_insc }],
    dscAtivDes: x.dsc_ativ_des,
    agentes: agentes.map((a) => ({
      codAgNoc: a.cod_ag_noc,
      dscAgNoc: a.dsc_ag_noc,
      tpAval: a.tp_aval,
      intConc: num(a.int_conc),
      limTol: num(a.lim_tol),
      unMed: a.un_med === null ? null : Number(a.un_med),
      tecMedicao: a.tec_medicao,
      nrProcJud: a.nr_proc_jud,
      epcEpi:
        a.cod_ag_noc === COD_AUSENCIA_AGENTE || !a.utiliz_epc
          ? null
          : {
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
            },
    })),
    responsaveis: responsaveis.map((r) => ({
      cpfResp: r.cpf,
      ideOC: r.ide_oc,
      dscOC: r.dsc_oc,
      nrOC: r.nr_oc,
      ufOC: r.uf_oc,
    })),
    obsCompl: x.obs_compl,
  }
}

/** Grava a exposição, gera e valida o XML e cria o evento S-2240 pendente de envio. */
export async function createS2240Event(userId: string, input: S2240Input) {
  return withTransaction(async (client) => {
    const { rows: [func] } = await client.query(
      "SELECT id, empresa_id FROM funcionarios WHERE id = $1",
      [input.funcionarioId]
    )
    if (!func || func.empresa_id !== input.empresaId) {
      throw new HttpError(400, "Funcionário não pertence à empresa selecionada.")
    }
    // O S-2240 é por vínculo: usa a matrícula escolhida sem trocar a principal do trabalhador
    const vinculo = await resolverVinculo(client, input.empresaId, input.funcionarioId, input.matricula)

    // Ambiente: existente ou novo
    let ambienteId = input.ambienteId || null
    if (ambienteId) {
      const { rows } = await client.query("SELECT id FROM ambientes_trabalho WHERE id = $1 AND empresa_id = $2", [
        ambienteId,
        input.empresaId,
      ])
      if (!rows.length) throw new HttpError(400, "Ambiente de trabalho não encontrado nesta empresa.")
    } else if (input.novoAmbiente) {
      const a = input.novoAmbiente
      const { rows: [created] } = await client.query(
        `INSERT INTO ambientes_trabalho (empresa_id, nome, local_amb, dsc_setor, tp_insc, nr_insc)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [input.empresaId, a.nome?.trim() || a.dscSetor.trim(), a.localAmb, a.dscSetor.trim(), a.tpInsc, cleanInscricao(a.nrInsc)]
      )
      ambienteId = created.id
    } else {
      throw new ValidationError(["Informe o ambiente de trabalho."])
    }

    // Responsáveis: existentes e/ou novo (reaproveita pelo CPF)
    const responsavelIds = [...(input.responsavelIds ?? [])]
    if (input.novoResponsavel) {
      const r = input.novoResponsavel
      const { rows: [resp] } = await client.query(
        `INSERT INTO responsaveis_registros_ambientais (empresa_id, nome, cpf, ide_oc, dsc_oc, nr_oc, uf_oc)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (empresa_id, cpf) DO UPDATE
           SET nome = EXCLUDED.nome, ide_oc = EXCLUDED.ide_oc, dsc_oc = EXCLUDED.dsc_oc,
               nr_oc = EXCLUDED.nr_oc, uf_oc = EXCLUDED.uf_oc, ativo = TRUE
         RETURNING id`,
        [input.empresaId, r.nome.trim(), onlyDigits(r.cpf), r.ideOC, r.dscOC ?? null, r.nrOC.trim(), r.ufOC.toUpperCase()]
      )
      if (!responsavelIds.includes(resp.id)) responsavelIds.push(resp.id)
    }
    if (responsavelIds.length) {
      const { rows } = await client.query(
        "SELECT id FROM responsaveis_registros_ambientais WHERE id = ANY($1::uuid[]) AND empresa_id = $2",
        [responsavelIds, input.empresaId]
      )
      if (rows.length !== new Set(responsavelIds).size) throw new HttpError(400, "Responsável não pertence à empresa.")
    }

    const { rows: [exposicao] } = await client.query(
      `INSERT INTO exposicoes_trabalhador
         (empresa_id, funcionario_id, ambiente_id, dt_ini_condicao, dt_fim_condicao, dsc_ativ_des, obs_compl, status, created_by, matricula)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pronto', $8, $9) RETURNING id`,
      [
        input.empresaId,
        input.funcionarioId,
        ambienteId,
        input.dtIniCondicao || null,
        input.dtFimCondicao || null,
        input.dscAtivDes ?? "",
        input.obsCompl || null,
        userId,
        vinculo.matricula,
      ]
    )

    for (const [i, a] of input.agentes.entries()) {
      const usaEpi = a.utilizEPI === "2"
      const c = usaEpi ? a.epiCompl : null
      const { rows: [agente] } = await client.query(
        `INSERT INTO exposicao_agentes
           (exposicao_id, risco_id, cod_ag_noc, dsc_ag_noc, tp_aval, int_conc, lim_tol, un_med, tec_medicao, nr_proc_jud,
            utiliz_epc, efic_epc, utiliz_epi, efic_epi,
            med_protecao, cond_functo, uso_inint, przo_valid, periodic_troca, higienizacao, ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING id`,
        [
          exposicao.id,
          a.riscoId || null,
          a.codAgNoc,
          a.dscAgNoc || null,
          a.tpAval || null,
          a.tpAval === "1" ? a.intConc ?? null : null,
          a.tpAval === "1" ? a.limTol ?? null : null,
          a.tpAval === "1" && a.unMed ? String(a.unMed) : null,
          a.tpAval === "1" ? a.tecMedicao || null : null,
          a.nrProcJud || null,
          a.utilizEPC || null,
          a.utilizEPC === "2" ? a.eficEpc || null : null,
          a.utilizEPI || null,
          usaEpi ? a.eficEpi || null : null,
          c?.medProtecao ?? null,
          c?.condFuncto ?? null,
          c?.usoInint ?? null,
          c?.przValid ?? null,
          c?.periodicTroca ?? null,
          c?.higienizacao ?? null,
          i,
        ]
      )
      if (usaEpi) {
        for (const doc of (a.epis ?? []).map((v) => v.trim()).filter(Boolean)) {
          await client.query("INSERT INTO exposicao_agente_epis (agente_id, doc_aval) VALUES ($1, $2)", [agente.id, doc])
        }
      }
    }

    for (const respId of new Set(responsavelIds)) {
      await client.query("INSERT INTO exposicao_responsaveis (exposicao_id, responsavel_id) VALUES ($1, $2)", [
        exposicao.id,
        respId,
      ])
    }

    const data = await loadS2240Data(client, exposicao.id, { indRetif: input.indRetif ?? "1", nrRecibo: input.nrRecibo })
    const errors = validateS2240(data)
    if (errors.length) throw new ValidationError(errors)

    const { id: idEvento, xml } = buildS2240XML(data)
    const { rows: [evento] } = await client.query(
      `INSERT INTO esocial_eventos
         (empresa_id, funcionario_id, tipo_evento, referencia_id, id_evento, ind_retif, nr_recibo_retif, xml_envio, status, created_by)
       VALUES ($1, $2, 'S-2240', $3, $4, $5, $6, $7, 'pendente', $8)
       RETURNING id, id_evento, status`,
      [input.empresaId, input.funcionarioId, exposicao.id, idEvento, data.indRetif, data.nrRecibo ?? null, xml, userId]
    )

    return { evento, exposicaoId: exposicao.id, xml }
  })
}

/** Regera o XML de um S-2240 a partir dos dados gravados (novo Id de evento). */
export async function regenerateS2240Xml(eventoId: string) {
  return withTransaction(async (client) => {
    const { rows: [ev] } = await client.query(
      "SELECT id, referencia_id, ind_retif, nr_recibo_retif, status FROM esocial_eventos WHERE id = $1",
      [eventoId]
    )
    if (!ev?.referencia_id) throw new HttpError(404, "Evento S-2240 sem exposição vinculada.")
    if (ev.status === "enviado" || ev.status === "processado") {
      throw new HttpError(409, "Evento já enviado. Para corrigir, gere uma retificação.")
    }
    const data = await loadS2240Data(client, ev.referencia_id, { indRetif: ev.ind_retif, nrRecibo: ev.nr_recibo_retif })
    const errors = validateS2240(data)
    if (errors.length) throw new ValidationError(errors)
    const { id: idEvento, xml } = buildS2240XML(data)
    await client.query(
      "UPDATE esocial_eventos SET xml_envio = $1, id_evento = $2, status = 'pendente', mensagem_erro = NULL WHERE id = $3",
      [xml, idEvento, eventoId]
    )
    return { xml }
  })
}
