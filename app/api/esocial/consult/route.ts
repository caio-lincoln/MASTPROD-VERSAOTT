import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type {
  ESocialConsultRequest,
  ESocialConsultResponse,
  ESocialConsultError,
} from "@/lib/esocial/transmission/contract"
import { sendSoapRequest } from "@/lib/esocial/transmission/soap-client"
import { decryptCertificateSecret } from "@/lib/esocial/certificates/secret"

export const runtime = "nodejs"

type ESocialEnvironment = "production" | "homologation"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function bad(msg: string, status = 400) {
  const error: ESocialConsultError = {
    status: "rejeitado",
    codigo: "LOCAL_VALIDATION",
    mensagem: msg,
  }
  return json(error, status)
}

function getClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !service) {
    throw new Error("Variáveis SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas para consulta eSocial.")
  }

  const client = createClient(url, service, {
    auth: { persistSession: false, detectSessionInUrl: false },
  })
  return client
}

function extractFirstTagValue(xml: string, tagName: string): string | null {
  // Regex ajustado para suportar namespaces (ex: <esocial:nrRecibo> ou <nrRecibo>)
  const re = new RegExp(`<([\\w]+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/([\\w]+:)?${tagName}>`, "i")
  const match = re.exec(xml)
  return match ? match[2].trim() : null
}

function parseConsultarLoteEventosResponse(soapXml: string): ESocialConsultResponse {
  const codigoResposta = extractFirstTagValue(soapXml, "cdResposta")
  const descResposta = extractFirstTagValue(soapXml, "descResposta")
  const protocoloEnvio = extractFirstTagValue(soapXml, "protocoloEnvio")

  if (!codigoResposta || !descResposta) {
    const faultString = extractFirstTagValue(soapXml, "faultstring")
    if (faultString) {
      return {
        status: "rejeitado",
        codigo: "SOAP_FAULT",
        mensagem: `Erro SOAP no eSocial: ${faultString}`,
      }
    }

    const anyMessage = extractFirstTagValue(soapXml, "message") || soapXml.substring(0, 500)

    return {
      status: "rejeitado",
      codigo: "RETORNO_INVALIDO",
      mensagem: `Retorno do eSocial inválido (sem cdResposta). Conteúdo parcial: ${anyMessage}`,
    }
  }

  const reciboNumero = extractFirstTagValue(soapXml, "nrRecibo")

  if (codigoResposta === "201" || codigoResposta === "202") {
    if (reciboNumero) {
      return {
        status: "processado",
        protocolo: protocoloEnvio || "",
        recibo: reciboNumero,
        codigo: codigoResposta,
        mensagem: descResposta,
      }
    }

    // Se o lote foi processado (201) mas não tem recibo, provável erro no evento
    const ocorrencias = extractFirstTagValue(soapXml, "ocorrencias")
    if (ocorrencias) {
      const codigoErro = extractFirstTagValue(ocorrencias, "codigo")
      const descErro = extractFirstTagValue(ocorrencias, "descricao")
      return {
        status: "rejeitado",
        codigo: codigoErro || "ERRO_PROCESSAMENTO",
        mensagem: descErro || "Erro processamento evento",
      }
    }

    return {
      status: "rejeitado",
      codigo: "201_SEM_RECIBO",
      mensagem: "Lote processado, mas sem recibo ou ocorrências identificadas.",
    }
  }

  return {
    status: "rejeitado",
    codigo: codigoResposta,
    mensagem: descResposta,
  }
}

function buildConsultaLoteEventosXml(protocoloEnvio: string): string {
  // O XML da consulta NÃO deve ter declaração XML (<?xml ...?>) pois será inserido no corpo SOAP
  let xml = `<eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">`
  xml += `<consultaLoteEventos>`
  xml += `<protocoloEnvio>${protocoloEnvio}</protocoloEnvio>`
  xml += `</consultaLoteEventos>`
  xml += `</eSocial>`
  return xml
}

function buildSoapEnvelope(bodyXml: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`
  xml += `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">`
  xml += `<soap:Header/>`
  xml += `<soap:Body>`
  xml += `<v1:ConsultarLoteEventos>`
  xml += `<v1:consulta>`
  xml += bodyXml
  xml += `</v1:consulta>`
  xml += `</v1:ConsultarLoteEventos>`
  xml += `</soap:Body>`
  xml += `</soap:Envelope>`
  return xml
}

async function consultESocialProcessing(req: ESocialConsultRequest): Promise<ESocialConsultResponse> {
  const client = getClients()

  const { data: eventRow, error: eventError } = await client
    .from("esocial_eventos")
    .select("id, protocolo, certificate_id")
    .eq("id", req.eventId)
    .maybeSingle()

  if (eventError || !eventRow) {
    throw new Error("Evento eSocial não encontrado para consulta de processamento")
  }

  if (!eventRow.protocolo) {
    throw new Error("Evento eSocial ainda não possui protocolo de envio para consulta")
  }

  if (!eventRow.certificate_id) {
    throw new Error("Evento eSocial não possui certificado vinculado para consulta")
  }

  const { data: certRow, error: certError } = await client
    .from("certificates")
    .select("id, pfx_base64_encrypted")
    .eq("id", eventRow.certificate_id)
    .maybeSingle()

  if (certError || !certRow) {
    throw new Error("Certificado digital vinculado ao evento eSocial não encontrado")
  }

  if (!certRow.pfx_base64_encrypted) {
    throw new Error("Certificado digital não possui material criptográfico para consulta. Recadastre o certificado com senha.")
  }

  const certificatePayload = decryptCertificateSecret(certRow.pfx_base64_encrypted)

  const consultaXml = buildConsultaLoteEventosXml(eventRow.protocolo)

  const endpoint =
    req.environment === "production"
      ? "https://webservices.envio.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc"
      : "https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc"

  const soapEnvelope = buildSoapEnvelope(consultaXml)

  const responseText = await sendSoapRequest(
    endpoint,
    "http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos",
    soapEnvelope,
    {
      pfx: Buffer.from(certificatePayload.pfxBase64, "base64"),
      passphrase: certificatePayload.password,
    }
  )

  const parsed = parseConsultarLoteEventosResponse(responseText)

  const clientUpdate = getClients()

  if (parsed.status === "processado") {
    await clientUpdate
      .from("esocial_eventos")
      .update({
        status: "enviado",
        recibo: parsed.recibo,
        mensagem_erro: null,
        xml_retorno: responseText,
      })
      .eq("id", req.eventId)
  } else {
    await clientUpdate
      .from("esocial_eventos")
      .update({
        status: "erro",
        mensagem_erro: parsed.mensagem,
        xml_retorno: responseText,
      })
      .eq("id", req.eventId)
  }

  return parsed
}

export async function OPTIONS() {
  return new Response("ok", { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  let body: ESocialConsultRequest
  try {
    body = (await req.json()) as ESocialConsultRequest
  } catch {
    return bad("JSON inválido", 400)
  }

  if (!body.eventId || !body.environment) {
    return bad("Campos obrigatórios ausentes no request", 400)
  }

  if (body.environment !== "production" && body.environment !== "homologation") {
    return bad("Ambiente eSocial inválido. Use 'production' ou 'homologation'.", 400)
  }

  try {
    const result = await consultESocialProcessing(body)
    return json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno na consulta"
    const errorResponse: ESocialConsultError = {
      status: "rejeitado",
      codigo: "CONSULT_ERROR",
      mensagem: message,
    }
    return json(errorResponse, 500)
  }
}

