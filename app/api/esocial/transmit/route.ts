import type { NextRequest } from "next/server"
import forge from "node-forge"
import { SignedXml } from "xml-crypto"
import { createClient } from "@supabase/supabase-js"
import type {
  ESocialTransmissionRequest,
  ESocialTransmissionResponse,
  ESocialTransmissionError,
  ESocialCertificatePayload,
  ESocialOccurrence,
} from "@/lib/esocial/transmission/contract"
import { ESOCIAL_COMM_PACKAGE } from "@/lib/esocial/config"
import { decryptCertificateSecret } from "@/lib/esocial/certificates/secret"
import { sendSoapRequest } from "@/lib/esocial/transmission/soap-client"

export const runtime = "nodejs"

type ESocialEnvironment = "production" | "homologation"

interface ESocialCertificateInfo {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
}

interface ESocialCertificateMaterial {
  info: ESocialCertificateInfo
  certPem: string
  privateKeyPem: string
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function bad(msg: string, status = 400) {
  const error: ESocialTransmissionError = {
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
    throw new Error("Variáveis SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas para transmissão eSocial.")
  }

  const client = createClient(url, service, {
    auth: { persistSession: false, detectSessionInUrl: false },
  })
  return client
}

function stripXmlDeclaration(xml: string): string {
  return xml.replace(/^\s*<\?xml[^>]*\?>\s*/i, "")
}

function syncTpAmbWithEnvironment(xml: string, environment: ESocialEnvironment): string {
  const desired = environment === "production" ? "1" : "2"
  if (!xml.includes("<tpAmb")) {
    return xml
  }
  return xml.replace(/<tpAmb>\s*\d+\s*<\/tpAmb>/, `<tpAmb>${desired}</tpAmb>`)
}

function extractEventId(eventXml: string): string {
  const match = eventXml.match(/<\w+[^>]*\sId="([^"]+)"/)
  if (!match) {
    throw new Error("Id do evento não encontrado no XML do evento eSocial")
  }
  return match[1]
}

function buildLoteEventosXml(signedEventXml: string, tpInsc: string, nrInsc: string): string {
  const innerEventXml = stripXmlDeclaration(signedEventXml.trim())
  const eventId = extractEventId(innerEventXml)

  // O XML do lote NÃO deve ter declaração XML (<?xml ...?>) pois será inserido no corpo SOAP
  let xml = `<eSocial xmlns="${ESOCIAL_COMM_PACKAGE.namespaces.envioLoteEventos}">`
  xml += `<envioLoteEventos grupo="1">`
  xml += `<ideEmpregador><tpInsc>${tpInsc}</tpInsc><nrInsc>${nrInsc}</nrInsc></ideEmpregador>`
  xml += `<ideTransmissor><tpInsc>${tpInsc}</tpInsc><nrInsc>${nrInsc}</nrInsc></ideTransmissor>`
  xml += `<eventos>`
  xml += `<evento Id="${eventId}">`
  xml += innerEventXml
  xml += `</evento>`
  xml += `</eventos>`
  xml += `</envioLoteEventos>`
  xml += `</eSocial>`
  return xml
}

function buildSoapEnvelope(loteXml: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`
  xml += `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="${
    ESOCIAL_COMM_PACKAGE.wsdl.enviarLoteEventos.targetNamespace
  }">`
  xml += `<soap:Header/>`
  xml += `<soap:Body>`
  xml += `<v1:EnviarLoteEventos>`
  xml += `<v1:loteEventos>`
  xml += loteXml
  xml += `</v1:loteEventos>`
  xml += `</v1:EnviarLoteEventos>`
  xml += `</soap:Body>`
  xml += `</soap:Envelope>`
  return xml
}

function extractFirstTagValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i")
  const match = re.exec(xml)
  return match ? match[1].trim() : null
}

function extractOccurrencesFromRetornoEnvio(xml: string): ESocialOccurrence[] {
  const ocorrenciasBlock = extractFirstTagValue(xml, "ocorrencias")
  if (!ocorrenciasBlock) {
    return []
  }
  const ocorrencias: ESocialOccurrence[] = []
  const re = /<ocorrencia>([\s\S]*?)<\/ocorrencia>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(ocorrenciasBlock)) !== null) {
    const block = match[1]
    const codigo = extractFirstTagValue(block, "codigo")
    const descricao = extractFirstTagValue(block, "descricao")
    const tipo = extractFirstTagValue(block, "tipo")
    const localizacao = extractFirstTagValue(block, "localizacao")
    if (codigo && descricao && tipo) {
      ocorrencias.push({
        codigo,
        descricao,
        tipo,
        localizacao: localizacao || undefined,
      })
    }
  }
  return ocorrencias
}

function parseEnviarLoteEventosResponse(soapXml: string): ESocialTransmissionResponse {
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

    // Tenta extrair qualquer mensagem de erro do corpo
    const anyMessage = extractFirstTagValue(soapXml, "message") || soapXml.substring(0, 500)

    return {
      status: "rejeitado",
      codigo: "RETORNO_INVALIDO",
      mensagem: `Retorno do eSocial inválido (sem cdResposta). Conteúdo parcial: ${anyMessage}`,
    }
  }

  if (codigoResposta === "201") {
    return {
      status: "enviado",
      protocolo: protocoloEnvio || "",
      recibo: "",
      codigo: codigoResposta,
      mensagem: descResposta,
      ocorrencias: extractOccurrencesFromRetornoEnvio(soapXml),
    }
  }

  const ocorrencias = extractOccurrencesFromRetornoEnvio(soapXml)
  let mensagem = descResposta
  if (ocorrencias.length > 0) {
    const primeira = ocorrencias[0]
    const detalheBase = `[${primeira.codigo}] ${primeira.descricao}`
    const detalhe = primeira.localizacao ? `${detalheBase} (${primeira.localizacao})` : detalheBase
    mensagem = `${descResposta} - Detalhe: ${detalhe}`
  }

  return {
    status: "rejeitado",
    codigo: codigoResposta,
    mensagem,
    ocorrencias,
  }
}

async function validateAndDecodeCertificate(payload: ESocialCertificatePayload): Promise<ESocialCertificateMaterial> {
  if (!payload.pfxBase64 || !payload.password) {
    throw new Error("Certificado A1 (.pfx) e senha são obrigatórios")
  }

  let binary: string
  try {
    binary = Buffer.from(payload.pfxBase64, "base64").toString("binary")
  } catch {
    throw new Error("Certificado em Base64 inválido")
  }

  if (!binary || binary.length < 100) {
    throw new Error("Certificado .pfx inválido ou corrompido")
  }

  let p12Asn1: forge.asn1.Asn1
  try {
    const der = forge.util.createBuffer(binary, "binary")
    p12Asn1 = forge.asn1.fromDer(der)
  } catch {
    throw new Error("Estrutura PKCS#12 do certificado inválida")
  }

  let p12: forge.pkcs12.Pkcs12Pfx
  try {
    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, payload.password)
  } catch {
    throw new Error("Senha do certificado A1 inválida")
  }

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag }) as Record<string, forge.pkcs12.Bag[]>
  const certBagArray = certBags[forge.pki.oids.certBag]

  if (!certBagArray || certBagArray.length === 0) {
    throw new Error("Certificado não encontrado dentro do arquivo .pfx")
  }

  const cert = certBagArray[0].cert

  const subjectAttrs = cert.subject.attributes
  const issuerAttrs = cert.issuer.attributes

  const subjectCN = subjectAttrs.find((a) => a.name === "commonName")?.value
  const issuerCN = issuerAttrs.find((a) => a.name === "commonName")?.value

  const subject =
    subjectCN ||
    subjectAttrs
      .map((a) => `${a.shortName || a.name}=${a.value}`)
      .join(", ")

  const issuer =
    issuerCN ||
    issuerAttrs
      .map((a) => `${a.shortName || a.name}=${a.value}`)
      .join(", ")

  const notBefore = cert.validity.notBefore
  const notAfter = cert.validity.notAfter

  const now = new Date()

  if (notAfter.getTime() < now.getTime()) {
    throw new Error("Certificado expirado")
  }

  if (notBefore.getTime() > now.getTime()) {
    throw new Error("Certificado ainda não é válido")
  }

  const info: ESocialCertificateInfo = {
    subject,
    issuer,
    validFrom: notBefore.toISOString(),
    validTo: notAfter.toISOString(),
  }

  const pkcs8Bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag }) as Record<
    string,
    forge.pkcs12.Bag[]
  >
  const keyBags = p12.getBags({ bagType: forge.pki.oids.keyBag }) as Record<string, forge.pkcs12.Bag[]>

  const pkcs8Array = pkcs8Bags[forge.pki.oids.pkcs8ShroudedKeyBag] || []
  const keyArray = keyBags[forge.pki.oids.keyBag] || []

  const keyBag = pkcs8Array[0] || keyArray[0]

  if (!keyBag || !keyBag.key) {
    throw new Error("Chave privada não encontrada no certificado A1")
  }

  const certPem = forge.pki.certificateToPem(cert)
  const privateKeyPem = forge.pki.privateKeyToPem(keyBag.key)

  return {
    info,
    certPem,
    privateKeyPem,
  }
}

function signESocialXML(xml: string, certPem: string, privateKeyPem: string): string {
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
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
    transforms: [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
      "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
    ],
  })

  signer.computeSignature(xml, {
    location: { reference: rootXpath, action: "append" },
  })

  return signer.getSignedXml()
}

async function transmitToESocial(req: ESocialTransmissionRequest): Promise<ESocialTransmissionResponse> {
  const client = getClients()

  if (!req.xml || !req.xml.includes("<eSocial")) {
    throw new Error("XML eSocial inválido ou ausente")
  }

  const { data: eventRow, error: eventLookupError } = await client
    .from("esocial_eventos")
    .select("empresa_id, certificate_id")
    .eq("id", req.eventId)
    .maybeSingle()

  if (eventLookupError || !eventRow || !eventRow.empresa_id) {
    throw new Error("Evento eSocial não encontrado ou sem empresa vinculada para transmissão")
  }

  if (!eventRow.certificate_id) {
    throw new Error("Evento eSocial não possui certificado vinculado para transmissão")
  }

  const { data: certRow, error: certError } = await client
    .from("certificates")
    .select("id, pfx_base64_encrypted")
    .eq("id", eventRow.certificate_id)
    .maybeSingle()

  if (certError || !certRow) {
    throw new Error("Certificado digital vinculado ao evento eSocial não encontrado")
  }

  const storedSecret = certRow.pfx_base64_encrypted

  if (!storedSecret && !req.certificate) {
    throw new Error(
      "Certificado digital vinculado ao evento eSocial não possui material criptográfico armazenado. " +
        "Cadastre novamente o certificado A1 informando a senha para habilitar a transmissão automática."
    )
  }

  const certificatePayload: ESocialCertificatePayload = req.certificate
    ? req.certificate
    : decryptCertificateSecret(storedSecret as string)

  const cert = await validateAndDecodeCertificate(certificatePayload)

  const { data: empresaRow, error: empresaError } = await client
    .from("empresas")
    .select("cnpj")
    .eq("id", eventRow.empresa_id)
    .maybeSingle()

  if (empresaError || !empresaRow || !empresaRow.cnpj) {
    throw new Error("Empresa vinculada ao evento eSocial não encontrada ou sem CNPJ cadastrado")
  }

  const nrInscRaw = String(empresaRow.cnpj).replace(/\D/g, "")

  if (nrInscRaw.length !== 11 && nrInscRaw.length !== 14) {
    throw new Error("Número de inscrição do empregador inválido para o eSocial")
  }

  const tpInsc = nrInscRaw.length === 14 ? "1" : "2"
  let nrInsc = nrInscRaw

  // Regra geral do eSocial: Para CNPJ (tpInsc=1), o nrInsc do empregador no lote
  // deve ser apenas a raiz (8 posições), exceto para órgãos públicos específicos (S-1000).
  if (tpInsc === "1") {
    // Por padrão, usa 8 dígitos (Raiz)
    nrInsc = nrInscRaw.substring(0, 8)

    // Verifica se é um evento S-1000 com natureza jurídica especial que exige 14 dígitos
    const natJuridMatch = req.xml.match(/<natJurid>(\d+)<\/natJurid>/)
    if (natJuridMatch) {
      const natJurid = natJuridMatch[1]
      // Códigos que exigem CNPJ completo (14 dígitos) conforme MOS
      const natJuridFullCnpj = ["1015", "1040", "1074", "1163", "1341"]
      if (natJuridFullCnpj.includes(natJurid)) {
        nrInsc = nrInscRaw // Mantém 14 dígitos
      }
    }
  }

  const endpoint =
    req.environment === "production"
      ? "https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc"
      : "https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc"

  await client
    .from("esocial_logs")
    .insert({
      event_id: req.eventId,
      event_type: req.eventType,
      environment: req.environment,
      endpoint,
      cert_subject: cert.info.subject,
      cert_issuer: cert.info.issuer,
      cert_valid_from: cert.info.validFrom,
      cert_valid_to: cert.info.validTo,
      comm_package_version: ESOCIAL_COMM_PACKAGE.communicationPackageVersion,
    })

  const xmlWithCorrectAmb = syncTpAmbWithEnvironment(req.xml, req.environment)
  const signedXml = signESocialXML(xmlWithCorrectAmb, cert.certPem, cert.privateKeyPem)
  const loteXml = buildLoteEventosXml(signedXml, tpInsc, nrInsc)
  const soapEnvelope = buildSoapEnvelope(loteXml)

  const responseText = await sendSoapRequest(
    endpoint,
    ESOCIAL_COMM_PACKAGE.wsdl.enviarLoteEventos.soapAction,
    soapEnvelope,
    {
      pfx: Buffer.from(certificatePayload.pfxBase64, "base64"),
      passphrase: certificatePayload.password,
    }
  )

  const parsed = parseEnviarLoteEventosResponse(responseText)

  if (parsed.status === "enviado") {
    await client
      .from("esocial_eventos")
      .update({
        status: "enviado",
        protocolo: parsed.protocolo,
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

export async function POST(req: NextRequest) {
  let body: ESocialTransmissionRequest
  try {
    body = (await req.json()) as ESocialTransmissionRequest
  } catch {
    return bad("JSON inválido", 400)
  }

  if (!body.eventType || !body.eventId || !body.environment || !body.xml) {
    return bad("Campos obrigatórios ausentes no request", 400)
  }

  if (body.environment !== "production" && body.environment !== "homologation") {
    return bad("Ambiente eSocial inválido. Use 'production' ou 'homologation'.", 400)
  }

  try {
    const result = await transmitToESocial(body)
    return json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno na transmissão"
    const errorResponse: ESocialTransmissionError = {
      status: "rejeitado",
      codigo: "TRANSMISSION_NOT_IMPLEMENTED",
      mensagem: message,
    }
    return json(errorResponse, 500)
  }
}
