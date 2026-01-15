export type ESocialEventStatus = "pendente" | "processando" | "enviado" | "erro"

export interface Certificate {
  id: string
  name: string
  pfx_storage_path: string | null
  pfx_base64_encrypted: string | null
  fingerprint: string | null
  valid_from: string | null
  valid_to: string | null
  created_at: string
}

export interface CompanyCertificate {
  company_id: string
  certificate_id: string
  is_default: boolean
  created_at: string
}

export interface ESocialEventRecord {
  id: string
  empresa_id: string | null
  funcionario_id?: string | null
  tipo_evento: string
  xml_envio: string | null
  xml_retorno: string | null
  protocolo: string | null
  recibo: string | null
  mensagem_erro: string | null
  status: ESocialEventStatus
  certificate_id: string | null
  created_at: string
  updated_at: string
}

