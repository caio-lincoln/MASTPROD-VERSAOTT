import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import forge from "npm:@sebastian-dieguez/node-forge"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface ESocialCertificatePayload {
  pfxBase64: string
  password: string
}

interface ESocialCertificateInfo {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function bad(msg: string, status = 400) {
  return json({ error: msg }, status)
}

async function validateAndDecodeCertificate(payload: ESocialCertificatePayload): Promise<ESocialCertificateInfo> {
  if (!payload.pfxBase64 || !payload.password) {
    throw new Error("Certificado A1 (.pfx) e senha são obrigatórios")
  }

  let binary: string
  try {
    binary = atob(payload.pfxBase64)
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

  return {
    subject,
    issuer,
    validFrom: notBefore.toISOString(),
    validTo: notAfter.toISOString(),
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return bad("Método não suportado", 405)
  }

  let body: ESocialCertificatePayload
  try {
    body = (await req.json()) as ESocialCertificatePayload
  } catch {
    return bad("JSON inválido", 400)
  }

  try {
    const info = await validateAndDecodeCertificate(body)
    return json(info)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao analisar certificado"
    return bad(message, 400)
  }
})

