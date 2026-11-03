import { HttpError, assertCompanyAccess, errorResponse, requireUser } from "@/lib/server/access"
import { createS1000Event } from "@/lib/esocial/events/S-1000"
import { ValidationError, createS2240Event, type S2240Input } from "@/lib/esocial/server/s2240"

export const runtime = "nodejs"

/**
 * Cria um evento eSocial (XML gerado e validado no servidor, status "pendente").
 * Body: { tipo: "S-1000", empresaId } | { tipo: "S-2240", ...S2240Input }
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const body = (await req.json()) as { tipo?: string; empresaId?: string } & Partial<S2240Input>
    await assertCompanyAccess(user, body.empresaId)

    if (body.tipo === "S-1000") {
      const result = await createS1000Event(body.empresaId!, user.id)
      return Response.json(result, { status: result.success ? 200 : 422 })
    }

    if (body.tipo === "S-2240") {
      const result = await createS2240Event(user.id, body as S2240Input)
      return Response.json({ success: true, eventId: result.evento.id, idEvento: result.evento.id_evento, xml: result.xml })
    }

    throw new HttpError(400, `Tipo de evento não suportado: ${body.tipo}`)
  } catch (err) {
    if (err instanceof ValidationError) {
      return Response.json({ success: false, errors: err.errors }, { status: 422 })
    }
    return errorResponse(err)
  }
}
