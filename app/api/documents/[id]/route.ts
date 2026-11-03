import { queryOne } from "@/lib/server/db"
import { HttpError, assertCompanyAccess, errorResponse, requireUser } from "@/lib/server/access"

export const runtime = "nodejs"

/** Download de documento da biblioteca. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const doc = await queryOne<{ empresa_id: string; nome_arquivo: string; mime_type: string | null; conteudo: Buffer | null }>(
      "SELECT empresa_id, nome_arquivo, mime_type, conteudo FROM biblioteca_documentos WHERE id = $1",
      [id]
    )
    if (!doc) throw new HttpError(404, "Documento não encontrado.")
    await assertCompanyAccess(user, doc.empresa_id)
    if (!doc.conteudo) throw new HttpError(404, "Documento sem arquivo armazenado.")

    return new Response(new Uint8Array(doc.conteudo), {
      headers: {
        "Content-Type": doc.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.nome_arquivo)}`,
      },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
