import "server-only"
import forge from "node-forge"
import type { CertificateSecretPayload } from "./secret"

export interface CertificateInfo {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  /** CNPJ (e-CNPJ) ou CPF (e-CPF) do titular, quando identificável */
  documento: string | null
  fingerprint: string
}

export interface CertificateMaterial {
  info: CertificateInfo
  certPem: string
  privateKeyPem: string
}

/** Abre o .pfx (A1) com a senha e devolve dados, certificado e chave privada em PEM. */
export function loadPfx(payload: CertificateSecretPayload, options: { allowExpired?: boolean } = {}): CertificateMaterial {
  if (!payload.pfxBase64 || !payload.password) {
    throw new Error("Certificado A1 (.pfx) e senha são obrigatórios")
  }

  const binary = Buffer.from(payload.pfxBase64, "base64").toString("binary")
  if (!binary || binary.length < 100) {
    throw new Error("Certificado .pfx inválido ou corrompido")
  }

  let p12Asn1: forge.asn1.Asn1
  try {
    p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(binary, "raw"))
  } catch {
    throw new Error("Estrutura PKCS#12 do certificado inválida")
  }

  let p12: forge.pkcs12.Pkcs12Pfx
  try {
    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, payload.password)
  } catch {
    throw new Error("Senha do certificado A1 inválida")
  }

  const keyBag =
    (p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || [])[0] ||
    (p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] || [])[0]
  if (!keyBag?.key) {
    throw new Error("Chave privada não encontrada no certificado A1")
  }

  // O .pfx pode trazer a cadeia (AC); o certificado do titular é o que casa com a chave privada
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || []
  const privateKey = keyBag.key as forge.pki.rsa.PrivateKey
  const cert =
    certBags.map((b) => b.cert).find((c) => c && (c.publicKey as forge.pki.rsa.PublicKey).n?.equals(privateKey.n)) ||
    certBags[0]?.cert
  if (!cert) {
    throw new Error("Certificado não encontrado dentro do arquivo .pfx")
  }

  const now = Date.now()
  if (!options.allowExpired && cert.validity.notAfter.getTime() < now) {
    throw new Error(`Certificado expirado em ${cert.validity.notAfter.toLocaleDateString("pt-BR")}`)
  }
  if (cert.validity.notBefore.getTime() > now) {
    throw new Error("Certificado ainda não é válido")
  }

  const describe = (attrs: forge.pki.CertificateField[]) =>
    String(attrs.find((a) => a.name === "commonName")?.value ?? attrs.map((a) => `${a.shortName || a.name}=${a.value}`).join(", "))

  const subject = describe(cert.subject.attributes)
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()

  return {
    info: {
      subject,
      issuer: describe(cert.issuer.attributes),
      validFrom: cert.validity.notBefore.toISOString(),
      validTo: cert.validity.notAfter.toISOString(),
      // Padrão ICP-Brasil: CN = "NOME:CNPJ" (e-CNPJ) ou "NOME:CPF" (e-CPF)
      documento: subject.match(/:(\d{14}|\d{11})\s*$/)?.[1] ?? null,
      fingerprint: forge.md.sha256.create().update(der).digest().toHex(),
    },
    certPem: forge.pki.certificateToPem(cert),
    privateKeyPem: forge.pki.privateKeyToPem(keyBag.key),
  }
}
