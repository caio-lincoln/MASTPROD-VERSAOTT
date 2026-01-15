export type ESocialEnvironment = "production" | "homologation"

export interface ESocialCertificatePayload {
  pfxBase64: string
  password: string
}

export interface ESocialTransmissionRequest {
  eventType: string
  eventId: string
  environment: ESocialEnvironment
  xml: string
  certificate?: ESocialCertificatePayload
}

export interface ESocialTransmissionSuccess {
  status: "enviado"
  protocolo: string
  recibo: string
  codigo: string
  mensagem: string
}

export interface ESocialTransmissionError {
  status: "rejeitado"
  codigo: string
  mensagem: string
}

export type ESocialTransmissionResponse =
  | ESocialTransmissionSuccess
  | ESocialTransmissionError

export interface ESocialConsultRequest {
  eventId: string
  environment: ESocialEnvironment
}

export interface ESocialConsultSuccess {
  status: "processado"
  protocolo: string
  recibo: string
  codigo: string
  mensagem: string
}

export interface ESocialConsultError {
  status: "rejeitado"
  codigo: string
  mensagem: string
}

export type ESocialConsultResponse =
  | ESocialConsultSuccess
  | ESocialConsultError
