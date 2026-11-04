import { assertCompanyAccess, errorResponse, requireUser } from "@/lib/server/access"
import { gerarLoteS2240, listarPendentes, type LoteParams } from "@/lib/esocial/server/s2240-batch"

export const runtime = "nodejs"

/** GET ?empresaId=...: trabalhadores ativos sem S-2240 para a matrícula atual, modelos e responsáveis. */
export async function GET(req: Request) {
  try {
    const user = await requireUser()
    const empresaId = new URL(req.url).searchParams.get("empresaId") ?? ""
    await assertCompanyAccess(user, empresaId)
    return Response.json(await listarPendentes(empresaId))
  } catch (err) {
    return errorResponse(err)
  }
}

/** POST: gera os S-2240 (status "pendente", ainda não enviados) para os trabalhadores escolhidos. */
export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const body = (await req.json()) as LoteParams
    await assertCompanyAccess(user, body.empresaId)
    return Response.json(await gerarLoteS2240(user.id, body))
  } catch (err) {
    return errorResponse(err)
  }
}
