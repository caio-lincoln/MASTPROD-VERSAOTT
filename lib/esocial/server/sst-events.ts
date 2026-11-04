import "server-only"
import type { PoolClient } from "pg"
import { withTransaction } from "@/lib/server/db"
import { HttpError } from "@/lib/server/access"
import { empregadorIde } from "../events/common"
import { buildS2220XML, validateS2220, type AsoDados } from "../events/S-2220"
import { buildS2210XML, validateS2210, type CatDados } from "../events/S-2210"
import { ValidationError } from "./s2240"
import { resolverVinculo } from "./vinculos"

/**
 * S-2220 (ASO) e S-2210 (CAT): o conteúdo do evento fica em JSONB (asos.dados / cats.dados)
 * no vocabulário do leiaute, e o XML é sempre gerado a partir dele.
 */

export interface SstInput<T> {
  empresaId: string
  funcionarioId: string
  matricula?: string | null
  dados: T
  indRetif?: "1" | "2"
  nrRecibo?: string | null
}

async function loadVinculo(client: PoolClient, empresaId: string, funcionarioId: string, matricula?: string | null) {
  const { rows: [f] } = await client.query(
    `SELECT f.id, f.cpf, f.matricula_esocial, f.cod_categoria, f.empresa_id, e.cnpj, e.natureza_juridica
       FROM funcionarios f JOIN empresas e ON e.id = f.empresa_id
      WHERE f.id = $1`,
    [funcionarioId]
  )
  if (!f || f.empresa_id !== empresaId) throw new HttpError(400, "Funcionário não pertence à empresa selecionada.")
  // Evento por vínculo: usa a matrícula escolhida sem trocar a principal do trabalhador
  const v = await resolverVinculo(client, empresaId, funcionarioId, matricula)
  return {
    empregador: empregadorIde(f.cnpj, f.natureza_juridica),
    trabalhador: { cpf: f.cpf, matricula: v.matricula, codCateg: v.codCategoria },
  }
}

async function insertEvento(
  client: PoolClient,
  p: { empresaId: string; funcionarioId: string; tipo: string; referenciaId: string; idEvento: string; xml: string; indRetif: string; nrRecibo?: string | null; userId: string }
) {
  const { rows: [ev] } = await client.query(
    `INSERT INTO esocial_eventos
       (empresa_id, funcionario_id, tipo_evento, referencia_id, id_evento, ind_retif, nr_recibo_retif, xml_envio, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendente', $9)
     RETURNING id, id_evento`,
    [p.empresaId, p.funcionarioId, p.tipo, p.referenciaId, p.idEvento, p.indRetif, p.nrRecibo ?? null, p.xml, p.userId]
  )
  return ev
}

export async function createS2220Event(userId: string, input: SstInput<AsoDados>) {
  return withTransaction(async (client) => {
    const base = await loadVinculo(client, input.empresaId, input.funcionarioId, input.matricula)
    const data = { ...base, indRetif: input.indRetif ?? "1", nrRecibo: input.nrRecibo, aso: input.dados }
    const errors = validateS2220(data)
    if (errors.length) throw new ValidationError(errors)

    const { rows: [aso] } = await client.query(
      `INSERT INTO asos (empresa_id, funcionario_id, tp_exame_ocup, dt_aso, res_aso, medico_nome, dados, created_by, matricula)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [input.empresaId, input.funcionarioId, input.dados.tpExameOcup, input.dados.dtAso, input.dados.resAso ?? null, input.dados.medico.nmMed, JSON.stringify(input.dados), userId, base.trabalhador.matricula]
    )
    const { id: idEvento, xml } = buildS2220XML(data)
    const evento = await insertEvento(client, {
      empresaId: input.empresaId,
      funcionarioId: input.funcionarioId,
      tipo: "S-2220",
      referenciaId: aso.id,
      idEvento,
      xml,
      indRetif: data.indRetif,
      nrRecibo: data.nrRecibo,
      userId,
    })
    return { evento, xml }
  })
}

export async function createS2210Event(userId: string, input: SstInput<CatDados>) {
  return withTransaction(async (client) => {
    const base = await loadVinculo(client, input.empresaId, input.funcionarioId, input.matricula)
    const data = { ...base, indRetif: input.indRetif ?? "1", nrRecibo: input.nrRecibo, cat: input.dados }
    const errors = validateS2210(data)
    if (errors.length) throw new ValidationError(errors)

    const { rows: [cat] } = await client.query(
      `INSERT INTO cats (empresa_id, funcionario_id, dt_acid, tp_acid, tp_cat, ind_obito, dados, created_by, matricula)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [input.empresaId, input.funcionarioId, input.dados.dtAcid, input.dados.tpAcid, input.dados.tpCat, input.dados.indCatObito === "S", JSON.stringify(input.dados), userId, base.trabalhador.matricula]
    )
    const { id: idEvento, xml } = buildS2210XML(data)
    const evento = await insertEvento(client, {
      empresaId: input.empresaId,
      funcionarioId: input.funcionarioId,
      tipo: "S-2210",
      referenciaId: cat.id,
      idEvento,
      xml,
      indRetif: data.indRetif,
      nrRecibo: data.nrRecibo,
      userId,
    })
    return { evento, xml }
  })
}

/** Regera o XML de um S-2220/S-2210 pendente a partir dos dados gravados (novo Id de evento). */
export async function regenerateSstXml(eventoId: string) {
  return withTransaction(async (client) => {
    const { rows: [ev] } = await client.query(
      "SELECT id, tipo_evento, empresa_id, funcionario_id, referencia_id, ind_retif, nr_recibo_retif, status FROM esocial_eventos WHERE id = $1",
      [eventoId]
    )
    if (!ev?.referencia_id) throw new HttpError(404, "Evento sem registro de origem.")
    if (ev.status === "enviado" || ev.status === "processado") {
      throw new HttpError(409, "Evento já enviado. Para corrigir, gere uma retificação.")
    }
    const tabela = ev.tipo_evento === "S-2220" ? "asos" : "cats"
    const { rows: [origem] } = await client.query(`SELECT matricula FROM ${tabela} WHERE id = $1`, [ev.referencia_id])
    const base = await loadVinculo(client, ev.empresa_id, ev.funcionario_id, origem?.matricula)
    const retif = { indRetif: ev.ind_retif ?? "1", nrRecibo: ev.nr_recibo_retif }
    let built: { id: string; xml: string }
    if (ev.tipo_evento === "S-2220") {
      const { rows: [aso] } = await client.query("SELECT dados FROM asos WHERE id = $1", [ev.referencia_id])
      const data = { ...base, ...retif, aso: aso.dados as AsoDados }
      const errors = validateS2220(data)
      if (errors.length) throw new ValidationError(errors)
      built = buildS2220XML(data)
    } else if (ev.tipo_evento === "S-2210") {
      const { rows: [cat] } = await client.query("SELECT dados FROM cats WHERE id = $1", [ev.referencia_id])
      const data = { ...base, ...retif, cat: cat.dados as CatDados }
      const errors = validateS2210(data)
      if (errors.length) throw new ValidationError(errors)
      built = buildS2210XML(data)
    } else {
      throw new HttpError(400, `Regeração não suportada para ${ev.tipo_evento}.`)
    }
    await client.query(
      "UPDATE esocial_eventos SET xml_envio = $1, id_evento = $2, status = 'pendente', mensagem_erro = NULL WHERE id = $3",
      [built.xml, built.id, eventoId]
    )
    return { xml: built.xml }
  })
}
