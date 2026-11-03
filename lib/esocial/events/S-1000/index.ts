import "server-only"
import { query, queryOne } from "@/lib/server/db"
import { HttpError } from "@/lib/server/access"
import { mapToS1000 } from "./mapper"
import { validateS1000 } from "./validator"
import { buildS1000XML } from "./builder"

function extractId(xml: string): string | null {
  return xml.match(/\sId="([^"]+)"/)?.[1] ?? null
}

export async function createS1000Event(companyId: string, userId: string) {
  const empresa = await queryOne("SELECT * FROM empresas WHERE id = $1", [companyId])
  if (!empresa) {
    throw new HttpError(404, "Empresa não encontrada.")
  }

  const s1000Props = mapToS1000(empresa)
  const validationErrors = validateS1000(s1000Props)
  if (validationErrors.length > 0) {
    return { success: false, errors: validationErrors }
  }

  const xml = buildS1000XML(s1000Props)
  const [eventData] = await query(
    `INSERT INTO esocial_eventos (empresa_id, tipo_evento, id_evento, xml_envio, status, created_by)
     VALUES ($1, 'S-1000', $2, $3, 'pendente', $4) RETURNING id`,
    [companyId, extractId(xml), xml, userId]
  )

  return { success: true, xml, data: s1000Props, eventId: eventData.id }
}

export async function regenerateS1000XML(eventId: string) {
  const eventRow = await queryOne("SELECT id, empresa_id FROM esocial_eventos WHERE id = $1", [eventId])
  if (!eventRow?.empresa_id) {
    throw new HttpError(404, "Evento S-1000 não encontrado ou sem empresa vinculada.")
  }

  const empresa = await queryOne("SELECT * FROM empresas WHERE id = $1", [eventRow.empresa_id])
  if (!empresa) {
    throw new HttpError(404, "Empresa não encontrada.")
  }

  const s1000Props = mapToS1000(empresa)
  const validationErrors = validateS1000(s1000Props)
  if (validationErrors.length > 0) {
    return { success: false, errors: validationErrors }
  }

  const xml = buildS1000XML(s1000Props)
  await query(
    "UPDATE esocial_eventos SET xml_envio = $1, id_evento = $2, status = 'pendente', mensagem_erro = NULL WHERE id = $3",
    [xml, extractId(xml), eventId]
  )

  return { success: true, xml, data: s1000Props }
}
