import { HttpError, assertCompanyAccess, errorResponse, requireUser } from "@/lib/server/access"
import { importarEsocial } from "@/lib/esocial/server/importer"

export const runtime = "nodejs"

const MAX_TOTAL_BYTES = 80 * 1024 * 1024

/**
 * Importa trabalhadores a partir dos XMLs/ZIP baixados do eSocial.
 * multipart/form-data: empresaId, gravar ("1" grava; senão só pré-visualiza), arquivos (1..n).
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const form = await req.formData()
    const empresaId = String(form.get("empresaId") ?? "")
    await assertCompanyAccess(user, empresaId)

    const uploads = form.getAll("arquivos").filter((v): v is File => typeof v === "object" && "arrayBuffer" in v)
    if (!uploads.length) throw new HttpError(400, "Selecione o ZIP ou os XMLs baixados do eSocial.")
    const total = uploads.reduce((sum, f) => sum + f.size, 0)
    if (total > MAX_TOTAL_BYTES) throw new HttpError(413, "Arquivos maiores que 80 MB. Divida a importação em partes.")

    const files = await Promise.all(uploads.map(async (f) => ({ name: f.name, data: new Uint8Array(await f.arrayBuffer()) })))
    const result = await importarEsocial({
      empresaId,
      userId: user.id,
      files,
      gravar: form.get("gravar") === "1",
    })
    return Response.json(result)
  } catch (err) {
    return errorResponse(err)
  }
}
