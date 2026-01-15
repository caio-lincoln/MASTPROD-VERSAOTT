import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

type ESocialEnvironment = "production" | "homologation"

interface ESocialConsultRequest {
  eventId: string
  environment: ESocialEnvironment
}

interface ESocialConsultSuccess {
  status: "processado"
  protocolo: string
  recibo: string
  codigo: string
  mensagem: string
}

interface ESocialConsultError {
  status: "rejeitado"
  codigo: string
  mensagem: string
}

type ESocialConsultResponse = ESocialConsultSuccess | ESocialConsultError

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function bad(msg: string, status = 400) {
  return json({ status: "rejeitado", codigo: "LOCAL_VALIDATION", mensagem: msg }, status)
}

function getClients() {
  const url = Deno.env.get("SUPABASE_URL")!
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const client = createClient(url, service, {
    auth: { persistSession: false, detectSessionInUrl: false },
  })
  return client
}

function extractFirstTagValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i")
  const match = re.exec(xml)
  return match ? match[1].trim() : null
}

function parseConsultarLoteEventosResponse(soapXml: string): ESocialConsultResponse {
  const codigoResposta = extractFirstTagValue(soapXml, "cdResposta")
  const descResposta = extractFirstTagValue(soapXml, "descResposta")
  const protocoloEnvio = extractFirstTagValue(soapXml, "protocoloEnvio")

  if (!codigoResposta || !descResposta) {
    return {
      status: "rejeitado",
      codigo: "RETORNO_INVALIDO",
      mensagem: "Retorno do eSocial não contém cdResposta ou descResposta válidos",
    }
  }

  // Para o retorno de processamento, códigos 201/202 indicam lote recebido/em processamento;
  // o recibo do evento vem dentro de retornoEvento (RetornoEvento-v1_2_0).
  const reciboNumero = extractFirstTagValue(soapXml, "nrRecibo") || ""

  if (codigoResposta === "201" || codigoResposta === "202") {
    return {
      status: "processado",
      protocolo: protocoloEnvio || "",
      recibo: reciboNumero,
      codigo: codigoResposta,
      mensagem: descResposta,
    }
  }

  return {
    status: "rejeitado",
    codigo: codigoResposta,
    mensagem: descResposta,
  }
}

function buildConsultaLoteEventosXml(protocoloEnvio: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`
  xml += `<eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">`
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
    .select("id, protocolo")
    .eq("id", req.eventId)
    .maybeSingle()

  if (eventError || !eventRow) {
    throw new Error("Evento eSocial não encontrado para consulta de processamento")
  }

  if (!eventRow.protocolo) {
    throw new Error("Evento eSocial ainda não possui protocolo de envio para consulta")
  }

  const consultaXml = buildConsultaLoteEventosXml(eventRow.protocolo)

  const endpoint =
    req.environment === "production"
      ? "https://webservices.envio.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc"
      : "https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc"

  const soapEnvelope = buildSoapEnvelope(consultaXml)

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction:
        "http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos",
    },
    body: soapEnvelope,
  })

  const responseText = await response.text()
  const parsed = parseConsultarLoteEventosResponse(responseText)

  if (parsed.status === "processado") {
    await client
      .from("esocial_eventos")
      .update({
        status: "enviado",
        recibo: parsed.recibo || null,
        xml_retorno: responseText,
        mensagem_erro: null,
      })
      .eq("id", req.eventId)
  } else {
    await client
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return bad("Método não suportado", 405)
  }

  let body: ESocialConsultRequest
  try {
    body = (await req.json()) as ESocialConsultRequest
  } catch {
    return bad("JSON inválido", 400)
  }

  if (!body.eventId || !body.environment) {
    return bad("Campos obrigatórios ausentes no request", 400)
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
})
