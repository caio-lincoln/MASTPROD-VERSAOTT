import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { queryOne } from "@/lib/server/db"
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/server/session"

export const runtime = "nodejs"

const DUMMY_HASH = bcrypt.hashSync("senha-inexistente", 12)

export async function POST(req: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: { message: "Requisição inválida." } }, { status: 400 })
  }

  const email = String(body.email ?? "").trim().toLowerCase()
  const password = String(body.password ?? "")
  if (!email || !password) {
    return Response.json({ error: { message: "Informe e-mail e senha." } }, { status: 400 })
  }

  const user = await queryOne<{ id: string; email: string; nome: string; role: "admin" | "user"; senha_hash: string }>(
    "SELECT id, email, nome, role, senha_hash FROM app_users WHERE email = $1 AND ativo",
    [email]
  )

  // Compara mesmo sem usuário para não revelar quais e-mails existem pelo tempo de resposta
  const ok = await bcrypt.compare(password, user?.senha_hash ?? DUMMY_HASH)
  if (!user || !ok) {
    return Response.json({ error: { message: "E-mail ou senha inválidos." } }, { status: 401 })
  }

  const sessionUser = { id: user.id, email: user.email, nome: user.nome, role: user.role }
  const token = await createSessionToken(sessionUser)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, sessionCookieOptions)

  return Response.json({ user: sessionUser })
}
