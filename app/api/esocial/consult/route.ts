import { queryOne } from "@/lib/server/db"
import { HttpError, assertCompanyAccess, errorResponse, requireUser } from "@/lib/server/access"
import { consultEventById } from "@/lib/esocial/server/transmission"

export const runtime = "nodejs"

/** Consulta o processamento do lote de um evento já enviado. Body: { eventId } */
export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const body = (await req.json()) as { eventId?: string }
    if (!body.eventId) throw new HttpError(400, "Evento não informado.")
    const ev = await queryOne<{ empresa_id: string }>("SELECT empresa_id FROM esocial_eventos WHERE id = $1", [body.eventId])
    if (!ev) throw new HttpError(404, "Evento não encontrado.")
    await assertCompanyAccess(user, ev.empresa_id)

    const result = await consultEventById(body.eventId)
    return Response.json(result)
  } catch (err) {
    return errorResponse(err)
  }
}
