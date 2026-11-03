import { SignJWT, jwtVerify } from "jose"

// Sem "server-only": também é usado pelo proxy.ts
export const SESSION_COOKIE = "mp_session"
const SESSION_TTL_SECONDS = 60 * 60 * 12

export interface SessionUser {
  id: string
  email: string
  nome: string
  role: "admin" | "user"
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET não configurada (mínimo 32 caracteres).")
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, nome: user.nome, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] })
    if (!payload.sub) return null
    return {
      id: payload.sub,
      email: String(payload.email ?? ""),
      nome: String(payload.nome ?? ""),
      role: payload.role === "admin" ? "admin" : "user",
    }
  } catch {
    return null
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
}
