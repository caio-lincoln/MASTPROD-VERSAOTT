"use client"

export interface AuthUser {
  id: string
  email: string
  nome: string
  role: "admin" | "user"
}

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error?.message || `Erro HTTP ${res.status}`)
  }
  return data
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const data = await postJson("/api/auth/login", { email, password })
  return data.user as AuthUser
}

export async function signOut(): Promise<void> {
  await postJson("/api/auth/logout")
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me")
  if (!res.ok) return null
  const data = await res.json()
  return data.user as AuthUser
}
