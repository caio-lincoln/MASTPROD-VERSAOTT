import "server-only"
import type { PoolClient } from "pg"
import { text, type ParsedEvent } from "../import/parser"
import { asoDe, catDe, exposicaoDe, vinculoDe } from "../import/sst-mappers"

const onlyDigits = (v: string | null | undefined) => String(v ?? "").replace(/\D/g, "")

/**
 * Grava o histórico de SST baixado do eSocial (S-2240, S-2220, S-2210) com o recibo original,
 * para consulta e para futuras retificações. Chamado dentro da transação da importação.
 */
export async function importarHistoricoSst(client: PoolClient, empresaId: string, eventos: ParsedEvent[], userId: string) {
  if (!eventos.length) return
  const { rows } = await client.query<{ id: string; cpf: string }>("SELECT id, cpf FROM funcionarios WHERE empresa_id = $1", [empresaId])
  const funcPorCpf = new Map(rows.map((r) => [onlyDigits(r.cpf), r.id]))

  const funcionarioId = async (v: ReturnType<typeof vinculoDe>) => {
    let id = funcPorCpf.get(v.cpf)
    if (!id) {
      // Trabalhador sem S-2200 nos arquivos: cria com o CPF para não perder o histórico
      const { rows: [f] } = await client.query(
        `INSERT INTO funcionarios (empresa_id, nome, cpf, matricula_esocial, cod_categoria, status, origem, esocial_sincronizado_em)
         VALUES ($1, $2, $3, $4, $5, 'ativo', 'esocial', NOW())
         ON CONFLICT (empresa_id, cpf) DO UPDATE SET esocial_sincronizado_em = NOW()
         RETURNING id`,
        [empresaId, `Trabalhador CPF ${v.cpf}`, v.cpf, v.matricula, v.codCateg]
      )
      id = f.id as string
      funcPorCpf.set(v.cpf, id)
    }
    return id
  }

  const registrarEvento = (e: ParsedEvent, tipo: string, funcId: string, referenciaId: string) =>
    client.query(
      `INSERT INTO esocial_eventos
         (empresa_id, funcionario_id, tipo_evento, referencia_id, id_evento, ind_retif, xml_envio, recibo, status, origem, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'processado', 'esocial', $9)
       ON CONFLICT (empresa_id, id_evento) WHERE id_evento IS NOT NULL DO NOTHING`,
      [empresaId, funcId, tipo, referenciaId, e.id, text(e.node?.ideEvento?.indRetif) || "1", e.raw, e.recibo, userId]
    )

  for (const e of eventos) {
    const vinculo = vinculoDe(e.node)
    if (vinculo.cpf.length !== 11) continue
    const funcId = await funcionarioId(vinculo)

    if (e.kind === "S-2220") {
      const aso = asoDe(e.node)
      const { rows: [r] } = await client.query(
        `INSERT INTO asos (empresa_id, funcionario_id, tp_exame_ocup, dt_aso, res_aso, medico_nome, dados, origem, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'esocial', $8) RETURNING id`,
        [empresaId, funcId, aso.tpExameOcup, aso.dtAso, aso.resAso, aso.medico.nmMed || null, JSON.stringify(aso), userId]
      )
      await registrarEvento(e, "S-2220", funcId, r.id)
      continue
    }

    if (e.kind === "S-2210") {
      const cat = catDe(e.node)
      const { rows: [r] } = await client.query(
        `INSERT INTO cats (empresa_id, funcionario_id, dt_acid, tp_acid, tp_cat, ind_obito, dados, origem, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'esocial', $8) RETURNING id`,
        [empresaId, funcId, cat.dtAcid, cat.tpAcid, cat.tpCat, cat.indCatObito === "S", JSON.stringify(cat), userId]
      )
      await registrarEvento(e, "S-2210", funcId, r.id)
      continue
    }

    if (e.kind !== "S-2240") continue
    const x = exposicaoDe(e.node)
    if (!x.ambiente) continue
    const amb = x.ambiente

    // Reaproveita o ambiente com o mesmo setor e local
    const { rows: [ambExistente] } = await client.query(
      "SELECT id FROM ambientes_trabalho WHERE empresa_id = $1 AND dsc_setor = $2 AND nr_insc = $3 AND local_amb = $4 LIMIT 1",
      [empresaId, amb.dscSetor, amb.nrInsc, amb.localAmb]
    )
    const ambienteId: string =
      ambExistente?.id ??
      (
        await client.query(
          `INSERT INTO ambientes_trabalho (empresa_id, nome, local_amb, dsc_setor, tp_insc, nr_insc)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [empresaId, amb.dscSetor, amb.localAmb, amb.dscSetor, amb.tpInsc, amb.nrInsc]
        )
      ).rows[0].id

    const { rows: [exp] } = await client.query(
      `INSERT INTO exposicoes_trabalhador
         (empresa_id, funcionario_id, ambiente_id, dt_ini_condicao, dt_fim_condicao, dsc_ativ_des, obs_compl, status, origem, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'importado', 'esocial', $8) RETURNING id`,
      [empresaId, funcId, ambienteId, x.dtIniCondicao, x.dtFimCondicao, x.dscAtivDes, x.obsCompl, userId]
    )

    for (const [i, a] of x.agentes.entries()) {
      const c = a.epiCompl
      const { rows: [ag] } = await client.query(
        `INSERT INTO exposicao_agentes
           (exposicao_id, cod_ag_noc, dsc_ag_noc, tp_aval, int_conc, lim_tol, un_med, tec_medicao, nr_proc_jud,
            utiliz_epc, efic_epc, utiliz_epi, efic_epi,
            med_protecao, cond_functo, uso_inint, przo_valid, periodic_troca, higienizacao, ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING id`,
        [
          exp.id, a.codAgNoc, a.dscAgNoc, a.tpAval, a.intConc, a.limTol, a.unMed, a.tecMedicao, a.nrProcJud,
          a.utilizEPC, a.eficEpc, a.utilizEPI, a.eficEpi,
          c?.medProtecao ?? null, c?.condFuncto ?? null, c?.usoInint ?? null, c?.przValid ?? null,
          c?.periodicTroca ?? null, c?.higienizacao ?? null, i,
        ]
      )
      for (const doc of a.epis) {
        await client.query("INSERT INTO exposicao_agente_epis (agente_id, doc_aval) VALUES ($1, $2)", [ag.id, doc])
      }
    }

    for (const r of x.responsaveis) {
      if (r.cpf.length !== 11) continue
      // respReg não traz o nome: cria com o CPF e mantém o nome se o responsável já existir
      const { rows: [resp] } = await client.query(
        `INSERT INTO responsaveis_registros_ambientais (empresa_id, nome, cpf, ide_oc, dsc_oc, nr_oc, uf_oc)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (empresa_id, cpf) DO UPDATE SET
           ide_oc = COALESCE(EXCLUDED.ide_oc, responsaveis_registros_ambientais.ide_oc),
           dsc_oc = COALESCE(EXCLUDED.dsc_oc, responsaveis_registros_ambientais.dsc_oc),
           nr_oc = COALESCE(EXCLUDED.nr_oc, responsaveis_registros_ambientais.nr_oc),
           uf_oc = COALESCE(EXCLUDED.uf_oc, responsaveis_registros_ambientais.uf_oc)
         RETURNING id`,
        [empresaId, `Responsável CPF ${r.cpf}`, r.cpf, r.ideOC, r.dscOC, r.nrOC, r.ufOC]
      )
      await client.query(
        "INSERT INTO exposicao_responsaveis (exposicao_id, responsavel_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [exp.id, resp.id]
      )
    }
    await registrarEvento(e, "S-2240", funcId, exp.id)
  }
}
