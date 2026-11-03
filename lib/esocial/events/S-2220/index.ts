import { ambienteAtual, eventNamespace, generateEventId, isValidCpf, onlyDigits } from "../common"
import { DATE, UFS, buildBaseXml, optTag, tag, validateBase, type EventoSstBase } from "../sst-common"

/**
 * S-2220 - Monitoramento da Saúde do Trabalhador (evtMonit), leiaute S-1.3.
 */

/** Conteúdo do ASO, gravado em asos.dados. */
export interface AsoDados {
  tpExameOcup: "0" | "1" | "2" | "3" | "4" | "9"
  dtAso: string
  resAso?: "1" | "2" | null
  exames: {
    dtExm: string
    procRealizado: string // Tabela 27 (4 dígitos)
    obsProc?: string | null
    ordExame?: "1" | "2" | null // 1 referencial, 2 sequencial (audiometria)
    indResult?: "1" | "2" | "3" | "4" | null // 1 normal, 2 alterado, 3 estável, 4 agravamento
  }[]
  medico: { nmMed: string; nrCRM?: string | null; ufCRM?: string | null }
  respMonit?: { cpfResp?: string | null; nmResp: string; nrCRM: string; ufCRM: string } | null
}

export interface S2220Data extends EventoSstBase {
  aso: AsoDados
}

export const TIPOS_EXAME = [
  ["0", "Admissional"],
  ["1", "Periódico"],
  ["2", "Retorno ao trabalho"],
  ["3", "Mudança de risco ocupacional"],
  ["4", "Monitoração pontual"],
  ["9", "Demissional"],
] as const

// Audiometria tonal: o leiaute pede a ordem do exame e o resultado (referencial x sequencial)
const AUDIOMETRIA = "0281"

export function validateS2220(d: S2220Data): string[] {
  const e: string[] = []
  validateBase(d, e)
  const a = d.aso
  if (!TIPOS_EXAME.some(([v]) => v === a.tpExameOcup)) e.push("Informe o tipo do exame ocupacional.")
  if (!DATE.test(a.dtAso || "")) e.push("Data do ASO inválida.")
  if (a.resAso !== "1" && a.resAso !== "2") e.push("Informe o resultado do ASO (apto ou inapto).")

  if (!a.exames.length) e.push("Informe ao menos um exame/procedimento realizado.")
  if (a.exames.length > 99) e.push("No máximo 99 exames por ASO.")
  a.exames.forEach((x, i) => {
    const n = `Exame ${i + 1}`
    if (!DATE.test(x.dtExm || "")) e.push(`${n}: data inválida.`)
    else if (a.dtAso && x.dtExm > a.dtAso) e.push(`${n}: data posterior à data do ASO.`)
    if (!/^\d{4}$/.test(x.procRealizado || "")) e.push(`${n}: código do procedimento (Tabela 27) deve ter 4 dígitos.`)
    if (x.obsProc && x.obsProc.length > 999) e.push(`${n}: observação com mais de 999 caracteres.`)
    if (x.procRealizado === AUDIOMETRIA) {
      if (!x.ordExame) e.push(`${n}: audiometria exige a ordem do exame (referencial ou sequencial).`)
      if (!x.indResult) e.push(`${n}: audiometria exige o resultado (normal, alterado, estável ou agravamento).`)
    }
  })

  const m = a.medico
  if (!m?.nmMed?.trim() || m.nmMed.trim().length < 2) e.push("Informe o nome do médico emitente do ASO.")
  if (m?.nrCRM && m.nrCRM.length > 10) e.push("CRM do médico emitente com mais de 10 caracteres.")
  if (!!m?.nrCRM !== !!m?.ufCRM) e.push("Informe o CRM e a UF do CRM do médico emitente juntos.")
  if (m?.ufCRM && !UFS.includes(m.ufCRM)) e.push("UF do CRM do médico emitente inválida.")

  const r = a.respMonit
  if (r) {
    if (!r.nmResp?.trim() || r.nmResp.trim().length < 2) e.push("Informe o nome do médico responsável pelo PCMSO.")
    if (r.cpfResp && !isValidCpf(r.cpfResp)) e.push("CPF do médico responsável pelo PCMSO inválido.")
    if (!r.nrCRM?.trim() || r.nrCRM.length > 10) e.push("CRM do médico responsável pelo PCMSO inválido.")
    if (!UFS.includes(r.ufCRM)) e.push("UF do CRM do médico responsável pelo PCMSO inválida.")
  }
  return e
}

export function buildS2220XML(d: S2220Data, verProc = process.env.ESOCIAL_VER_PROC || "1.0.0"): { id: string; xml: string } {
  const id = generateEventId(d.empregador)
  const a = d.aso
  let x = `<eSocial xmlns="${eventNamespace("evtMonit")}"><evtMonit Id="${id}">`
  x += buildBaseXml(d, ambienteAtual().tpAmb, verProc)
  x += "<exMedOcup>"
  x += tag("tpExameOcup", a.tpExameOcup)
  x += "<aso>"
  x += tag("dtAso", a.dtAso)
  x += optTag("resAso", a.resAso)
  for (const ex of a.exames) {
    x += "<exame>"
    x += tag("dtExm", ex.dtExm)
    x += tag("procRealizado", ex.procRealizado)
    x += optTag("obsProc", ex.obsProc?.trim())
    x += optTag("ordExame", ex.ordExame)
    x += optTag("indResult", ex.indResult)
    x += "</exame>"
  }
  x += "<medico>"
  x += tag("nmMed", a.medico.nmMed.trim())
  x += optTag("nrCRM", a.medico.nrCRM?.trim())
  x += optTag("ufCRM", a.medico.ufCRM)
  x += "</medico>"
  x += "</aso>"
  if (a.respMonit) {
    const r = a.respMonit
    x += "<respMonit>"
    x += optTag("cpfResp", r.cpfResp ? onlyDigits(r.cpfResp) : null)
    x += tag("nmResp", r.nmResp.trim())
    x += tag("nrCRM", r.nrCRM.trim())
    x += tag("ufCRM", r.ufCRM)
    x += "</respMonit>"
  }
  x += "</exMedOcup></evtMonit></eSocial>"
  return { id, xml: x }
}
