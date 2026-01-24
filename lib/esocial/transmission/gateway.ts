import {
  type ESocialTransmissionRequest,
  type ESocialTransmissionResponse,
  type ESocialConsultRequest,
  type ESocialConsultResponse,
} from "./contract"

export type ESocialTransmissionMode = "edge" | "node" | "auto"

function getTransmissionMode(): ESocialTransmissionMode {
  const raw =
    (process.env.NEXT_PUBLIC_ESOCIAL_TRANSMISSION_MODE as string | undefined) ||
    (process.env.ESOCIAL_TRANSMISSION_MODE as string | undefined) ||
    "node"

  const normalized = raw.toLowerCase()

  if (normalized === "edge" || normalized === "node" || normalized === "auto") {
    return normalized
  }

  return "node"
}

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada para transmissão eSocial.")
  }

  return url
}

function getEdgeTransmitUrl(): string {
  return `${getSupabaseUrl()}/functions/v1/esocial-transmit`
}

function getEdgeConsultUrl(): string {
  return `${getSupabaseUrl()}/functions/v1/esocial-consult`
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || ""
}

function getNodeTransmitUrl(): string {
  return `${getBaseUrl()}/api/esocial/transmit`
}

function getNodeConsultUrl(): string {
  return `${getBaseUrl()}/api/esocial/consult`
}

async function callJsonEndpoint<TRequest, TResponse>(url: string, payload: TRequest): Promise<TResponse> {
  console.log(`[Gateway] Chamando endpoint: ${url}`, payload)
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    let data: any = null

    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    }

    if (!response.ok) {
      const message = data?.mensagem || `Falha na chamada eSocial: HTTP ${response.status}`
      const error: any = new Error(message)
      error.httpStatus = response.status
      error.codigo = data?.codigo
      error.data = data
      throw error
    }

    return data as TResponse
  } catch (err) {
    const message = err instanceof Error ? String(err.message || "") : ""
    const lower = message.toLowerCase()

    if (lower.includes("failed to fetch") || lower.includes("network") || lower.includes("fetch failed")) {
      const isSupabase = url.includes("supabase.co")

      if (isSupabase) {
        throw new Error(
          "Falha ao chamar função eSocial no Supabase (esocial-transmit/esocial-consult). " +
            "Verifique se NEXT_PUBLIC_SUPABASE_URL está correto e se as funções Edge estão deployadas e ativas."
        )
      }

      throw new Error(
        `Falha ao chamar NodeApi de transmissão eSocial em "${url}". ` +
          "Verifique se NEXT_PUBLIC_ESOCIAL_NODE_TRANSMIT_URL / NEXT_PUBLIC_ESOCIAL_NODE_CONSULT_URL estão corretas, " +
          "se a API está em execução e se o CORS permite chamadas a partir do frontend."
      )
    }

    if (err instanceof Error) {
      throw err
    }

    throw new Error("Erro de rede na chamada eSocial.")
  }
}

function shouldFallbackToNode(err: any): boolean {
  const message = String(err?.message || "").toLowerCase()
  const codigo = String(err?.codigo || "").toUpperCase()
  const dataMessage = String(err?.data?.mensagem || "").toLowerCase()

  if (codigo === "TRANSMISSION_NOT_IMPLEMENTED") {
    return true
  }

  const combined = `${message} ${dataMessage}`

  const handshakeKeywords = [
    "tls",
    "handshake",
    "x509",
    "certificate",
    "certificado",
    "pkix",
    "unable_to_verify_leaf_signature",
    "self signed certificate",
  ]

  return handshakeKeywords.some((keyword) => combined.includes(keyword))
}

async function transmitViaEdge(request: ESocialTransmissionRequest): Promise<ESocialTransmissionResponse> {
  return callJsonEndpoint<ESocialTransmissionRequest, ESocialTransmissionResponse>(getEdgeTransmitUrl(), request)
}

async function transmitViaNode(request: ESocialTransmissionRequest): Promise<ESocialTransmissionResponse> {
  return callJsonEndpoint<ESocialTransmissionRequest, ESocialTransmissionResponse>(getNodeTransmitUrl(), request)
}

async function consultViaEdge(request: ESocialConsultRequest): Promise<ESocialConsultResponse> {
  return callJsonEndpoint<ESocialConsultRequest, ESocialConsultResponse>(getEdgeConsultUrl(), request)
}

async function consultViaNode(request: ESocialConsultRequest): Promise<ESocialConsultResponse> {
  return callJsonEndpoint<ESocialConsultRequest, ESocialConsultResponse>(getNodeConsultUrl(), request)
}

function hasNodeTransmitUrl(): boolean {
  return true
}

function hasNodeConsultUrl(): boolean {
  return true
}

export async function transmitEvent(request: ESocialTransmissionRequest): Promise<ESocialTransmissionResponse> {
  const mode = getTransmissionMode()

  if (mode === "edge") {
    return transmitViaEdge(request)
  }

  if (mode === "node") {
    return transmitViaNode(request)
  }

  try {
    return await transmitViaEdge(request)
  } catch (err) {
    if (!shouldFallbackToNode(err) || !hasNodeTransmitUrl()) {
      throw err
    }

    return transmitViaNode(request)
  }
}

export async function consultEvent(request: ESocialConsultRequest): Promise<ESocialConsultResponse> {
  const mode = getTransmissionMode()

  if (mode === "edge") {
    return consultViaEdge(request)
  }

  if (mode === "node") {
    return consultViaNode(request)
  }

  try {
    return await consultViaEdge(request)
  } catch (err) {
    if (!shouldFallbackToNode(err) || !hasNodeConsultUrl()) {
      throw err
    }

    return consultViaNode(request)
  }
}
