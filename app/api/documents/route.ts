import { queryOne } from "@/lib/server/db"
import { HttpError, assertCompanyAccess, errorResponse, requireUser } from "@/lib/server/access"

export const runtime = "nodejs"

const MAX_BYTES = 15 * 1024 * 1024

/** Upload de documento da biblioteca. O arquivo é guardado no próprio banco (coluna bytea). */
export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const body = (await req.json()) as {
      empresa_id?: string
      file_name?: string
      content_base64?: string
      content_type?: string
      tipo?: string
      categoria?: string
      versao?: string
      descricao?: string
      tags?: string[]
    }
    await assertCompanyAccess(user, body.empresa_id)
    if (!body.file_name || !body.content_base64) {
      throw new HttpError(400, "Arquivo não enviado.")
    }
    const content = Buffer.from(body.content_base64, "base64")
    if (content.length > MAX_BYTES) {
      throw new HttpError(413, "Arquivo maior que 15 MB.")
    }

    const doc = await queryOne(
      `INSERT INTO biblioteca_documentos
         (empresa_id, nome_arquivo, tipo, categoria, versao, descricao, tamanho, enviado_por, tags, mime_type, conteudo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        body.empresa_id,
        body.file_name,
        body.tipo ?? null,
        body.categoria ?? null,
        body.versao ?? null,
        body.descricao ?? null,
        content.length,
        user.id,
        Array.isArray(body.tags) ? body.tags : [],
        body.content_type || "application/octet-stream",
        content,
      ]
    )
    return Response.json({ success: true, documento_id: doc?.id })
  } catch (err) {
    return errorResponse(err)
  }
}
