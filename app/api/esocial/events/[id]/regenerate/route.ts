import { queryOne } from "@/lib/server/db"
import { HttpError, assertCompanyAccess, errorResponse, requireUser } from "@/lib/server/access"
import { regenerateS1000XML } from "@/lib/esocial/events/S-1000"
import { ValidationError, regenerateS2240Xml } from "@/lib/esocial/server/s2240"

export const runtime = "nodejs"

/** Regera o XML de um evento pendente a partir dos dados atuais do cadastro. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const ev = await queryOne<{ empresa_id: string; tipo_evento: string }>(
      "SELECT empresa_id, tipo_evento FROM esocial_eventos WHERE id = $1",
      [id]
    )
    if (!ev) throw new HttpError(404, "Evento não encontrado.")
    await assertCompanyAccess(user, ev.empresa_id)

    if (ev.tipo_evento === "S-1000") {
      const result = await regenerateS1000XML(id)
      return Response.json(result, { status: result.success ? 200 : 422 })
    }
    if (ev.tipo_evento === "S-2240") {
      await regenerateS2240Xml(id)
      return Response.json({ success: true })
    }
    throw new HttpError(400, `Regeração não suportada para ${ev.tipo_evento}.`)
  } catch (err) {
    if (err instanceof ValidationError) {
      return Response.json({ success: false, errors: err.errors }, { status: 422 })
    }
    return errorResponse(err)
  }
}
