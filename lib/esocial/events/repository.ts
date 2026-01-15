import { supabase } from "@/lib/supabaseClient"
import type { Certificate, CompanyCertificate, ESocialEventRecord } from "./types"

export async function listCompanyCertificates(companyId: string): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("company_certificates")
    .select(
      `
      certificate:certificates (
        id,
        name,
        pfx_storage_path,
        pfx_base64_encrypted,
        fingerprint,
        valid_from,
        valid_to,
        created_at
      )
    `
    )
    .eq("company_id", companyId)

  if (error) {
    throw error
  }

  const rows = (data || []) as { certificate: Certificate }[]
  return rows.map((row) => row.certificate)
}

export async function getDefaultCompanyCertificate(companyId: string): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from("company_certificates")
    .select(
      `
      is_default,
      certificate:certificates (
        id,
        name,
        pfx_storage_path,
        pfx_base64_encrypted,
        fingerprint,
        valid_from,
        valid_to,
        created_at
      )
    `
    )
    .eq("company_id", companyId)
    .eq("is_default", true)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return (data as { certificate: Certificate }).certificate
}

export async function attachCertificateToEvent(eventId: string, certificateId: string): Promise<ESocialEventRecord> {
  const { data, error } = await supabase
    .from("esocial_eventos")
    .update({
      certificate_id: certificateId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data as ESocialEventRecord
}

