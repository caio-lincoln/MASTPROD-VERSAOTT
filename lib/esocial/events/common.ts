/**
 * Regras compartilhadas pelos eventos do eSocial (leiaute S-1.3).
 */

/** Versão de leiaute aceita em produção (S-1.2 deixou de ser recebida em 03/02/2025). */
export const LEIAUTE_VERSION = "v_S_01_03_00"

export function eventNamespace(evento: string): string {
  return `http://www.esocial.gov.br/schema/evt/${evento}/${LEIAUTE_VERSION}`
}

/** Grupo do lote (envioLoteEventos/@grupo): 1 = tabelas, 2 = não periódicos, 3 = periódicos. */
export function loteGroupFor(tipoEvento: string): "1" | "2" | "3" {
  const code = Number(tipoEvento.replace(/\D/g, ""))
  if (code >= 1000 && code < 1100) return "1"
  if (code >= 1200 && code < 1300) return "3"
  return "2"
}

// Naturezas jurídicas (administração pública) que usam o CNPJ completo como identificação
const NAT_JURID_CNPJ_COMPLETO = ["1015", "1040", "1074", "1163", "1341"]

export interface EmpregadorIde {
  tpInsc: "1" | "2"
  /** Valor de ideEmpregador/nrInsc: raiz do CNPJ (8), CNPJ completo (14) ou CPF (11) */
  nrInsc: string
  /** Documento completo (14 ou 11 dígitos) */
  documento: string
}

export function empregadorIde(cnpjOuCpf: string, naturezaJuridica?: string | null): EmpregadorIde {
  const documento = String(cnpjOuCpf || "").replace(/\D/g, "")
  if (documento.length === 11) {
    return { tpInsc: "2", nrInsc: documento, documento }
  }
  if (documento.length !== 14) {
    throw new Error("CNPJ/CPF do empregador inválido.")
  }
  const natJurid = String(naturezaJuridica || "").replace(/\D/g, "")
  const completo = NAT_JURID_CNPJ_COMPLETO.includes(natJurid)
  return { tpInsc: "1", nrInsc: completo ? documento : documento.slice(0, 8), documento }
}

/**
 * Id do evento: "ID" + tpInsc(1) + nrInsc(14, completado com zeros à direita)
 * + AAAAMMDDHHMMSS + sequencial(5) = 36 caracteres.
 */
export function generateEventId(ide: EmpregadorIde, now = new Date(), seq?: number): string {
  const nr = ide.nrInsc.padEnd(14, "0")
  const pad = (n: number, len = 2) => String(n).padStart(len, "0")
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const sequencial = pad(seq ?? Math.floor(Math.random() * 99999) + 1, 5)
  const id = `ID${ide.tpInsc}${nr}${stamp}${sequencial}`
  if (id.length !== 36) {
    throw new Error(`Id de evento com tamanho inválido (${id.length}).`)
  }
  return id
}

/** tpAmb a partir de ESOCIAL_AMBIENTE: "producao" => 1, qualquer outro => 2 (produção restrita). */
export function ambienteAtual(): { tpAmb: "1" | "2"; environment: "production" | "homologation" } {
  const raw = (process.env.ESOCIAL_AMBIENTE || "").toLowerCase()
  return raw === "producao" || raw === "production"
    ? { tpAmb: "1", environment: "production" }
    : { tpAmb: "2", environment: "homologation" }
}

export function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/** Decimal no formato do XSD (ponto, até 4 casas, sem zeros supérfluos). */
export function formatDecimal(value: number | string): string {
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."))
  if (!Number.isFinite(n)) throw new Error(`Número inválido: ${value}`)
  return String(Number(n.toFixed(4)))
}

export function onlyDigits(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "")
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const digit = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10])
}
