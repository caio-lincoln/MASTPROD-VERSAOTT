import type { ESocialConsultResponse, ESocialTransmissionResponse } from "./contract"

/**
 * Chamadas do navegador para as rotas eSocial do próprio app.
 * Assinatura, certificado e ambiente (produção/restrita) ficam só no servidor.
 */

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.")
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error: any = new Error(
      data?.errors?.join("\n") || data?.error?.message || data?.mensagem || `Erro HTTP ${response.status}`
    )
    error.errors = data?.errors
    throw error
  }
  return data as T
}

export function transmitEvent(request: { eventId: string; certificateId?: string | null }) {
  return postJson<ESocialTransmissionResponse>("/api/esocial/transmit", request)
}

export function consultEvent(request: { eventId: string }) {
  return postJson<ESocialConsultResponse | { status: "aguardando"; protocolo: string; codigo: string; mensagem: string }>(
    "/api/esocial/consult",
    request
  )
}

export function createS1000Event(empresaId: string) {
  return postJson<{ success: boolean; eventId?: string; errors?: string[] }>("/api/esocial/events", {
    tipo: "S-1000",
    empresaId,
  })
}

export function createS2240Event(payload: Record<string, unknown>) {
  return postJson<{ success: boolean; eventId: string; idEvento: string; xml: string }>("/api/esocial/events", {
    tipo: "S-2240",
    ...payload,
  })
}

export function createSstEvent(
  tipo: "S-2220" | "S-2210",
  payload: { empresaId: string; funcionarioId: string; matricula?: string | null; dados: unknown }
) {
  return postJson<{ success: boolean; eventId: string; idEvento: string; xml: string }>("/api/esocial/events", {
    tipo,
    ...payload,
  })
}

export function regenerateEventXml(eventId: string) {
  return postJson<{ success: boolean; errors?: string[] }>(`/api/esocial/events/${eventId}/regenerate`, {})
}
