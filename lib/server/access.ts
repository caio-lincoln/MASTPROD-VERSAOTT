import "server-only"
import { cookies } from "next/headers"
import { query } from "./db"
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from "./session"

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function requireUser(): Promise<SessionUser> {
  const store = await cookies()
  const user = await verifySessionToken(store.get(SESSION_COOKIE)?.value)
  if (!user) {
    throw new HttpError(401, "Sessão expirada. Faça login novamente.")
  }
  return user
}

/** Empresas que o usuário pode acessar; null = todas (admin). */
export async function accessibleCompanyIds(user: SessionUser): Promise<string[] | null> {
  if (user.role === "admin") return null
  const rows = await query<{ id: string }>(
    `SELECT empresa_id AS id FROM usuarios_empresas WHERE user_id = $1
     UNION
     SELECT id FROM empresas WHERE user_id = $1`,
    [user.id]
  )
  return rows.map((r) => r.id)
}

export async function assertCompanyAccess(user: SessionUser, companyId: string | null | undefined): Promise<void> {
  if (!companyId) {
    throw new HttpError(400, "Empresa não informada.")
  }
  const allowed = await accessibleCompanyIds(user)
  if (allowed && !allowed.includes(companyId)) {
    throw new HttpError(403, "Sem acesso a esta empresa.")
  }
}

export function errorResponse(err: unknown): Response {
  // Erros do Postgres (violação de unicidade, check, trigger) são erros de dados, não do servidor
  const isPgError = typeof (err as { code?: unknown })?.code === "string" && /^[0-9A-Z]{5}$/.test((err as { code: string }).code)
  const status = err instanceof HttpError ? err.status : isPgError ? 400 : 500
  const message = err instanceof Error ? err.message : "Erro interno"
  if (status === 500) console.error(err)
  return Response.json({ error: { message } }, { status })
}
