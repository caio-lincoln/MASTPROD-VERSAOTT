import { withTransaction } from "@/lib/server/db"
import { HttpError, assertCompanyAccess, errorResponse, requireUser } from "@/lib/server/access"
import { encryptCertificateSecret } from "@/lib/esocial/certificates/secret"
import { loadPfx } from "@/lib/esocial/certificates/pfx"

export const runtime = "nodejs"

/**
 * Cadastra o certificado A1 de uma empresa e o torna o padrão dela.
 * Body: { companyId, pfxBase64, password, name? }
 * O .pfx e a senha são guardados cifrados (AES-256-GCM); nada disso volta ao navegador.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const body = (await req.json()) as { companyId?: string; pfxBase64?: string; password?: string; name?: string }
    await assertCompanyAccess(user, body.companyId)
    if (!body.pfxBase64 || !body.password) {
      throw new HttpError(400, "Envie o arquivo .pfx e a senha do certificado.")
    }

    let material
    try {
      material = loadPfx({ pfxBase64: body.pfxBase64, password: body.password })
    } catch (err) {
      throw new HttpError(400, err instanceof Error ? err.message : "Certificado inválido")
    }
    const encrypted = encryptCertificateSecret({ pfxBase64: body.pfxBase64, password: body.password })

    const certificate = await withTransaction(async (client) => {
      const { rows: [cert] } = await client.query(
        `INSERT INTO certificates (name, pfx_base64_encrypted, fingerprint, valid_from, valid_to, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, fingerprint, valid_from, valid_to, created_at`,
        [
          body.name || material.info.subject,
          encrypted,
          material.info.fingerprint,
          material.info.validFrom,
          material.info.validTo,
          user.id,
        ]
      )
      await client.query("UPDATE company_certificates SET is_default = FALSE WHERE company_id = $1", [body.companyId])
      await client.query(
        "INSERT INTO company_certificates (company_id, certificate_id, is_default) VALUES ($1, $2, TRUE)",
        [body.companyId, cert.id]
      )
      return cert
    })

    return Response.json({
      certificate,
      info: {
        subject: material.info.subject,
        issuer: material.info.issuer,
        documento: material.info.documento,
        validTo: material.info.validTo,
      },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
