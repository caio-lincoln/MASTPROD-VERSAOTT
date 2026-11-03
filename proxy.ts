import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/session"

// Rotas de API que não exigem login
const PUBLIC_API = ["/api/auth/login", "/api/auth/logout", "/api/uptimerobot"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const user = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  if (user) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: { message: "Sessão expirada. Faça login novamente." } }, { status: 401 })
  }
  const loginUrl = new URL("/login", req.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
