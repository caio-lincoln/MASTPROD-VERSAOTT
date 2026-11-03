import { errorResponse, requireUser } from "@/lib/server/access"
import { executeDataRequest, type DataRequest } from "@/lib/server/data-api"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const body = (await req.json()) as DataRequest
    const data = await executeDataRequest(user, body)
    return Response.json({ data })
  } catch (err) {
    return errorResponse(err)
  }
}
