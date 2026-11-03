import "server-only"
import { SignedXml } from "xml-crypto"
import { query, queryOne } from "@/lib/server/db"
import { HttpError } from "@/lib/server/access"
import { ESOCIAL_COMM_PACKAGE } from "../config"
import { decryptCertificateSecret } from "../certificates/secret"
import { loadPfx } from "../certificates/pfx"
import { sendSoapRequest } from "../transmission/soap-client"
import { ambienteAtual, empregadorIde, loteGroupFor } from "../events/common"
import type {
  ESocialConsultResponse,
  ESocialOccurrence,
  ESocialTransmissionResponse,
} from "../transmission/contract"

const ENDPOINTS = {
  production: {
    envio: "https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc",
    consulta: "https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc",
  },
  homologation: {
    envio: "https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc",
    consulta: "https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc",
  },
} as const

const CONSULTA_SOAP_ACTION =
  "http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos"

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

function compactXml(xml: string): string {
  return xml
    .replace(/^\s*<\?xml[^>]*\?>\s*/i, "")
    .replace(/>\s+</g, "><")
    .trim()
}

function syncTpAmb(xml: string, tpAmb: string): string {
  return xml.replace(/<tpAmb>\s*\d+\s*<\/tpAmb>/, `<tpAmb>${tpAmb}</tpAmb>`)
}

function signEventXml(xml: string, certPem: string, privateKeyPem: string): string {
  // A assinatura referencia o elemento do evento (URI="" = documento inteiro) e fica dentro de <eSocial>
  const rootXpath = "/*[local-name()='eSocial']"
  const signer = new SignedXml({
    privateKey: privateKeyPem,
    publicCert: certPem,
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    canonicalizationAlgorithm: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
  })
  signer.addReference({
    xpath: rootXpath,
    uri: "",
    isEmptyUri: true,
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
    transforms: [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
      "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
    ],
  })
  signer.computeSignature(xml, { location: { reference: rootXpath, action: "append" } })
  return signer.getSignedXml()
}

function buildLoteXml(params: {
  signedEventXml: string
  eventId: string
  grupo: string
  empregador: { tpInsc: string; nrInsc: string }
  transmissor: { tpInsc: string; nrInsc: string }
}): string {
  const { signedEventXml, eventId, grupo, empregador, transmissor } = params
  return (
    `<eSocial xmlns="${ESOCIAL_COMM_PACKAGE.namespaces.envioLoteEventos}">` +
    `<envioLoteEventos grupo="${grupo}">` +
    `<ideEmpregador><tpInsc>${empregador.tpInsc}</tpInsc><nrInsc>${empregador.nrInsc}</nrInsc></ideEmpregador>` +
    `<ideTransmissor><tpInsc>${transmissor.tpInsc}</tpInsc><nrInsc>${transmissor.nrInsc}</nrInsc></ideTransmissor>` +
    `<eventos><evento Id="${eventId}">${compactXml(signedEventXml)}</evento></eventos>` +
    `</envioLoteEventos></eSocial>`
  )
}

function soapEnvelope(operation: string, wrapper: string, ns: string, body: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="${ns}">` +
    `<soap:Header/><soap:Body><v1:${operation}><v1:${wrapper}>${body}</v1:${wrapper}></v1:${operation}></soap:Body>` +
    `</soap:Envelope>`
  )
}

function firstTag(xml: string, tagName: string): string | null {
  const match = new RegExp(`<(?:\\w+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${tagName}>`, "i").exec(xml)
  return match ? match[1].trim() : null
}

function allBlocks(xml: string, tagName: string): string[] {
  const re = new RegExp(`<(?:\\w+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${tagName}>`, "gi")
  return [...xml.matchAll(re)].map((m) => m[1])
}

function parseOccurrences(xml: string): ESocialOccurrence[] {
  return allBlocks(xml, "ocorrencia")
    .map((block) => ({
      codigo: firstTag(block, "codigo") ?? "",
      descricao: firstTag(block, "descricao") ?? "",
      tipo: firstTag(block, "tipo") ?? "",
      localizacao: firstTag(block, "localizacao") ?? undefined,
    }))
    .filter((o) => o.codigo || o.descricao)
}

function describeOccurrences(base: string, ocorrencias: ESocialOccurrence[]): string {
  if (!ocorrencias.length) return base
  const lines = ocorrencias.map((o) => `[${o.codigo}] ${o.descricao}${o.localizacao ? ` (${o.localizacao})` : ""}`)
  return `${base}\n${lines.join("\n")}`
}

// ---------------------------------------------------------------------------
// Certificado
// ---------------------------------------------------------------------------

async function loadEventCertificate(certificateId: string) {
  const row = await queryOne<{ pfx_base64_encrypted: string | null }>(
    "SELECT pfx_base64_encrypted FROM certificates WHERE id = $1",
    [certificateId]
  )
  if (!row) throw new HttpError(404, "Certificado digital não encontrado.")
  if (!row.pfx_base64_encrypted) {
    throw new HttpError(400, "Certificado sem material criptográfico. Recadastre o .pfx informando a senha.")
  }
  const secret = decryptCertificateSecret(row.pfx_base64_encrypted)
  return { secret, material: loadPfx(secret) }
}

// ---------------------------------------------------------------------------
// Envio
// ---------------------------------------------------------------------------

export async function transmitEventById(eventId: string, certificateId?: string | null): Promise<ESocialTransmissionResponse> {
  const ev = await queryOne(
    `SELECT ev.id, ev.tipo_evento, ev.xml_envio, ev.status, ev.certificate_id, ev.empresa_id,
            e.cnpj, e.natureza_juridica
       FROM esocial_eventos ev JOIN empresas e ON e.id = ev.empresa_id
      WHERE ev.id = $1`,
    [eventId]
  )
  if (!ev) throw new HttpError(404, "Evento eSocial não encontrado.")
  if (!ev.xml_envio?.includes("<eSocial")) throw new HttpError(400, "Evento sem XML gerado.")
  if (ev.status === "enviado" || ev.status === "processado") {
    throw new HttpError(409, "Evento já enviado. Consulte o processamento ou gere uma retificação.")
  }

  // Certificado: o escolhido na tela, o já vinculado ao evento ou o padrão da empresa
  let certId = certificateId || ev.certificate_id
  if (!certId) {
    const def = await queryOne<{ certificate_id: string }>(
      "SELECT certificate_id FROM company_certificates WHERE company_id = $1 AND is_default",
      [ev.empresa_id]
    )
    certId = def?.certificate_id
  }
  if (!certId) throw new HttpError(400, "A empresa não tem certificado digital cadastrado.")
  const linked = await queryOne(
    "SELECT 1 FROM company_certificates WHERE company_id = $1 AND certificate_id = $2",
    [ev.empresa_id, certId]
  )
  if (!linked) throw new HttpError(403, "Certificado não pertence a esta empresa.")

  const { secret, material } = await loadEventCertificate(certId)
  const { tpAmb, environment } = ambienteAtual()
  const endpoint = ENDPOINTS[environment].envio

  const empregador = empregadorIde(ev.cnpj, ev.natureza_juridica)
  // Transmissor = titular do certificado (e-CNPJ: 14 dígitos; e-CPF: 11)
  const docTransmissor = material.info.documento ?? empregador.documento
  const transmissor = { tpInsc: docTransmissor.length === 11 ? "2" : "1", nrInsc: docTransmissor }

  const eventXml = syncTpAmb(compactXml(ev.xml_envio), tpAmb)
  const xmlEventId = eventXml.match(/\sId="([^"]+)"/)?.[1]
  if (!xmlEventId) throw new HttpError(400, "Id do evento não encontrado no XML.")

  const signed = signEventXml(eventXml, material.certPem, material.privateKeyPem)
  const lote = buildLoteXml({
    signedEventXml: signed,
    eventId: xmlEventId,
    grupo: loteGroupFor(ev.tipo_evento),
    empregador,
    transmissor,
  })
  const envelope = soapEnvelope(
    "EnviarLoteEventos",
    "loteEventos",
    ESOCIAL_COMM_PACKAGE.wsdl.enviarLoteEventos.targetNamespace,
    lote
  )

  await query(
    `INSERT INTO esocial_logs (event_id, event_type, environment, endpoint, cert_subject, cert_issuer,
                               cert_valid_from, cert_valid_to, comm_package_version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      eventId,
      ev.tipo_evento,
      environment,
      endpoint,
      material.info.subject,
      material.info.issuer,
      material.info.validFrom,
      material.info.validTo,
      ESOCIAL_COMM_PACKAGE.communicationPackageVersion,
    ]
  )
  await query("UPDATE esocial_eventos SET certificate_id = $1, status = 'processando' WHERE id = $2", [certId, eventId])

  let responseText: string
  try {
    responseText = await sendSoapRequest(endpoint, ESOCIAL_COMM_PACKAGE.wsdl.enviarLoteEventos.soapAction, envelope, {
      pfx: Buffer.from(secret.pfxBase64, "base64"),
      passphrase: secret.password,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Falha de comunicação com o eSocial"
    await query("UPDATE esocial_eventos SET status = 'erro', mensagem_erro = $1 WHERE id = $2", [msg, eventId])
    throw new HttpError(502, msg)
  }

  const result = parseEnvioResponse(responseText)
  if (result.status === "enviado") {
    await query(
      "UPDATE esocial_eventos SET status = 'enviado', protocolo = $1, xml_retorno = $2, mensagem_erro = NULL WHERE id = $3",
      [result.protocolo, responseText, eventId]
    )
  } else {
    await query("UPDATE esocial_eventos SET status = 'erro', mensagem_erro = $1, xml_retorno = $2 WHERE id = $3", [
      result.mensagem,
      responseText,
      eventId,
    ])
  }
  return result
}

function parseEnvioResponse(soapXml: string): ESocialTransmissionResponse {
  const cdResposta = firstTag(soapXml, "cdResposta")
  const descResposta = firstTag(soapXml, "descResposta") ?? ""
  if (!cdResposta) {
    const fault = firstTag(soapXml, "faultstring")
    return {
      status: "rejeitado",
      codigo: fault ? "SOAP_FAULT" : "RETORNO_INVALIDO",
      mensagem: fault ? `Erro SOAP no eSocial: ${fault}` : `Retorno inválido do eSocial: ${soapXml.slice(0, 500)}`,
    }
  }
  const ocorrencias = parseOccurrences(soapXml)
  // 201 = lote recebido com sucesso (processamento assíncrono)
  if (cdResposta === "201") {
    return {
      status: "enviado",
      protocolo: firstTag(soapXml, "protocoloEnvio") ?? "",
      recibo: "",
      codigo: cdResposta,
      mensagem: descResposta,
      ocorrencias,
    }
  }
  return { status: "rejeitado", codigo: cdResposta, mensagem: describeOccurrences(descResposta, ocorrencias), ocorrencias }
}

// ---------------------------------------------------------------------------
// Consulta do processamento
// ---------------------------------------------------------------------------

export type ConsultResult =
  | ESocialConsultResponse
  | { status: "aguardando"; protocolo: string; codigo: string; mensagem: string }

export async function consultEventById(eventId: string): Promise<ConsultResult> {
  const ev = await queryOne("SELECT id, protocolo, certificate_id FROM esocial_eventos WHERE id = $1", [eventId])
  if (!ev) throw new HttpError(404, "Evento eSocial não encontrado.")
  if (!ev.protocolo) throw new HttpError(400, "Evento ainda não tem protocolo de envio.")
  if (!ev.certificate_id) throw new HttpError(400, "Evento sem certificado vinculado.")

  const { secret } = await loadEventCertificate(ev.certificate_id)
  const { environment } = ambienteAtual()
  const body =
    `<eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">` +
    `<consultaLoteEventos><protocoloEnvio>${ev.protocolo}</protocoloEnvio></consultaLoteEventos></eSocial>`
  const envelope = soapEnvelope(
    "ConsultarLoteEventos",
    "consulta",
    "http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0",
    body
  )

  let responseText: string
  try {
    responseText = await sendSoapRequest(ENDPOINTS[environment].consulta, CONSULTA_SOAP_ACTION, envelope, {
      pfx: Buffer.from(secret.pfxBase64, "base64"),
      passphrase: secret.password,
    })
  } catch (err) {
    throw new HttpError(502, err instanceof Error ? err.message : "Falha de comunicação com o eSocial")
  }

  const cdLote = firstTag(responseText, "cdResposta")
  const descLote = firstTag(responseText, "descResposta") ?? ""
  if (!cdLote) {
    const fault = firstTag(responseText, "faultstring")
    throw new HttpError(502, fault ? `Erro SOAP no eSocial: ${fault}` : "Retorno inválido do eSocial na consulta.")
  }

  // 101 = lote aguardando processamento
  if (cdLote === "101") {
    return { status: "aguardando", protocolo: ev.protocolo, codigo: cdLote, mensagem: descLote }
  }

  // Resultado do evento: retornoEvento/processamento (201/202 = sucesso, com recibo)
  const retornoEvento = allBlocks(responseText, "retornoEvento")[0] ?? responseText
  const processamento = allBlocks(retornoEvento, "processamento")[0] ?? retornoEvento
  const cdEvento = firstTag(processamento, "cdResposta") ?? cdLote
  const descEvento = firstTag(processamento, "descResposta") ?? descLote
  const recibo = firstTag(retornoEvento, "nrRecibo")
  const ocorrencias = parseOccurrences(processamento)

  if ((cdEvento === "201" || cdEvento === "202") && recibo) {
    await query(
      "UPDATE esocial_eventos SET status = 'processado', recibo = $1, mensagem_erro = NULL, xml_retorno = $2 WHERE id = $3",
      [recibo, responseText, eventId]
    )
    return { status: "processado", protocolo: ev.protocolo, recibo, codigo: cdEvento, mensagem: descEvento }
  }

  const mensagem = describeOccurrences(descEvento || descLote, ocorrencias)
  await query("UPDATE esocial_eventos SET status = 'rejeitado', mensagem_erro = $1, xml_retorno = $2 WHERE id = $3", [
    mensagem,
    responseText,
    eventId,
  ])
  return { status: "rejeitado", codigo: cdEvento, mensagem }
}
