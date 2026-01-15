import crypto from "crypto"
import process from "process"
import { Buffer } from "buffer"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.ESOCIAL_CERT_ENCRYPTION_KEY

  if (!keyBase64) {
    throw new Error("ESOCIAL_CERT_ENCRYPTION_KEY não configurada para proteção de certificados A1.")
  }

  const key = Buffer.from(keyBase64, "base64")

  if (key.length !== 32) {
    throw new Error("ESOCIAL_CERT_ENCRYPTION_KEY deve ser uma chave de 32 bytes em Base64.")
  }

  return key
}

export interface CertificateSecretPayload {
  pfxBase64: string
  password: string
}

export function encryptCertificateSecret(payload: CertificateSecretPayload): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const plaintext = Buffer.from(JSON.stringify(payload), "utf8")
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decryptCertificateSecret(encoded: string): CertificateSecretPayload {
  const key = getEncryptionKey()
  const raw = Buffer.from(encoded, "base64")

  if (raw.length <= IV_LENGTH + TAG_LENGTH) {
    throw new Error("Dados criptografados do certificado A1 inválidos.")
  }

  const iv = raw.subarray(0, IV_LENGTH)
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")

  const parsed = JSON.parse(decrypted) as CertificateSecretPayload

  if (!parsed || !parsed.pfxBase64 || typeof parsed.password !== "string") {
    throw new Error("Conteúdo do segredo de certificado A1 inválido.")
  }

  return parsed
}
