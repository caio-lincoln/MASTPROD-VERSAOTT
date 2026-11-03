import { errorResponse, requireUser } from "@/lib/server/access"

export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await requireUser()
    return Response.json({ user })
  } catch (err) {
    return errorResponse(err)
  }
}
