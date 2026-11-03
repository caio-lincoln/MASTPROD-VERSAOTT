import { CNPJ_PATTERN, ambienteAtual, cleanInscricao, eventNamespace, generateEventId, onlyDigits } from "../common"
import { DATE, HORA, RECIBO, UFS, buildBaseXml, optTag, tag, validateBase, type EventoSstBase } from "../sst-common"

/**
 * S-2210 - Comunicação de Acidente de Trabalho (evtCAT), leiaute S-1.3.
 */

/** Conteúdo da CAT, gravado em cats.dados. */
export interface CatDados {
  dtAcid: string
  tpAcid: "1" | "2" | "3" // 1 típico, 2 doença, 3 trajeto
  hrAcid?: string | null // HHMM
  hrsTrabAntesAcid?: string | null // HHMM
  tpCat: "1" | "2" | "3" // 1 inicial, 2 reabertura, 3 comunicação de óbito
  indCatObito: "S" | "N"
  dtObito?: string | null
  indComunPolicia: "S" | "N"
  codSitGeradora: string // Tabela 15 ou 16 (9 dígitos)
  iniciatCAT: "1" | "2" | "3" // 1 empregador, 2 ordem judicial, 3 órgão fiscalizador
  obsCAT?: string | null
  ultDiaTrab?: string | null
  houveAfast?: "S" | "N" | null
  local: {
    tpLocal: "1" | "2" | "3" | "4" | "5" | "6" | "9"
    dscLocal?: string | null
    tpLograd?: string | null
    dscLograd: string
    nrLograd: string
    complemento?: string | null
    bairro?: string | null
    cep?: string | null
    codMunic?: string | null
    uf?: string | null
    pais?: string | null
    codPostal?: string | null
    ideLocalAcid?: { tpInsc: "1" | "3" | "4"; nrInsc: string } | null
  }
  parteAtingida: { codParteAting: string; lateralidade: "0" | "1" | "2" | "3" } // Tabela 13
  codAgntCausador: string // Tabela 14 ou 15
  atestado: {
    dtAtendimento: string
    hrAtendimento: string // HHMM
    indInternacao: "S" | "N"
    durTrat: number // dias
    indAfast: "S" | "N"
    dscLesao: string // Tabela 17 (9 dígitos)
    dscCompLesao?: string | null
    diagProvavel?: string | null
    codCID: string
    observacao?: string | null
    emitente: { nmEmit: string; ideOC: "1" | "2" | "3"; nrOC: string; ufOC?: string | null } // 1 CRM, 2 CRO, 3 RMS
  }
  nrRecCatOrig?: string | null
}

export interface S2210Data extends EventoSstBase {
  cat: CatDados
}

export const TIPOS_ACIDENTE = [
  ["1", "Típico"],
  ["2", "Doença"],
  ["3", "Trajeto"],
] as const

export const TIPOS_CAT = [
  ["1", "Inicial"],
  ["2", "Reabertura"],
  ["3", "Comunicação de óbito"],
] as const

export const TIPOS_LOCAL = [
  ["1", "Estabelecimento do empregador no Brasil"],
  ["2", "Estabelecimento do empregador no exterior"],
  ["3", "Estabelecimento de terceiros"],
  ["4", "Via pública"],
  ["5", "Área rural"],
  ["6", "Embarcação"],
  ["9", "Outros"],
] as const

const COD9 = /^\d{9}$/
const NO_BRASIL = ["1", "3", "4", "5", "6", "9"]

export function validateS2210(d: S2210Data): string[] {
  const e: string[] = []
  validateBase(d, e)
  const c = d.cat

  if (!DATE.test(c.dtAcid || "")) e.push("Data do acidente inválida.")
  if (!["1", "2", "3"].includes(c.tpAcid)) e.push("Informe o tipo de acidente.")
  if (c.tpAcid !== "2") {
    if (!HORA.test(c.hrAcid || "")) e.push("Informe a hora do acidente (HHMM).")
  } else if (c.hrAcid && !HORA.test(c.hrAcid)) e.push("Hora do acidente inválida (HHMM).")
  if (c.tpAcid === "1" && !/^\d{2}[0-5]\d$/.test(c.hrsTrabAntesAcid || "")) {
    e.push("Informe as horas trabalhadas antes do acidente (HHMM).")
  }
  if (!["1", "2", "3"].includes(c.tpCat)) e.push("Informe o tipo da CAT.")
  if ((c.tpCat === "2" || c.tpCat === "3") && !RECIBO.test(c.nrRecCatOrig || "")) {
    e.push("Reabertura ou comunicação de óbito exige o recibo da CAT de origem.")
  }
  if (c.indCatObito === "S" || c.tpCat === "3") {
    if (!DATE.test(c.dtObito || "")) e.push("Informe a data do óbito.")
    else if (c.dtAcid && c.dtObito! < c.dtAcid) e.push("Data do óbito anterior à data do acidente.")
  }
  if (!COD9.test(c.codSitGeradora || "")) e.push("Situação geradora (Tabela 15/16) deve ter 9 dígitos.")
  if (!["1", "2", "3"].includes(c.iniciatCAT)) e.push("Informe a iniciativa da CAT.")
  if (c.obsCAT && c.obsCAT.length > 999) e.push("Observação da CAT com mais de 999 caracteres.")
  if (c.ultDiaTrab && !DATE.test(c.ultDiaTrab)) e.push("Último dia trabalhado inválido.")

  const l = c.local
  if (!l?.dscLograd?.trim()) e.push("Informe o logradouro do local do acidente.")
  if (!l?.nrLograd?.trim()) e.push('Informe o número do local do acidente (use "S/N" se não houver).')
  if (l?.tpLocal === "2") {
    if (!/^\d{3}$/.test(l.pais || "")) e.push("Acidente no exterior: informe o país (código de 3 dígitos).")
  } else if (l && NO_BRASIL.includes(l.tpLocal)) {
    if (!l.uf || !UFS.includes(l.uf)) e.push("Informe a UF do local do acidente.")
    if (!/^\d{7}$/.test(l.codMunic || "")) e.push("Informe o município do local do acidente (código IBGE com 7 dígitos).")
    if (l.cep && !/^\d{8}$/.test(onlyDigits(l.cep))) e.push("CEP do local do acidente inválido.")
  }
  if (l && (l.tpLocal === "1" || l.tpLocal === "3")) {
    const ide = l.ideLocalAcid
    const nr = cleanInscricao(ide?.nrInsc)
    if (!ide || !(ide.tpInsc === "4" ? /^\d{12}$/.test(nr) : CNPJ_PATTERN.test(nr))) {
      e.push("Informe a inscrição (CNPJ/CAEPF/CNO) do estabelecimento onde ocorreu o acidente.")
    }
  }

  if (!COD9.test(c.parteAtingida?.codParteAting || "")) e.push("Parte do corpo atingida (Tabela 13) deve ter 9 dígitos.")
  if (!["0", "1", "2", "3"].includes(c.parteAtingida?.lateralidade)) e.push("Informe a lateralidade da parte atingida.")
  if (!COD9.test(c.codAgntCausador || "")) e.push("Agente causador (Tabela 14/15) deve ter 9 dígitos.")

  const a = c.atestado
  if (!DATE.test(a?.dtAtendimento || "")) e.push("Data do atendimento médico inválida.")
  else if (c.dtAcid && a.dtAtendimento < c.dtAcid) e.push("Atendimento médico anterior à data do acidente.")
  if (!HORA.test(a?.hrAtendimento || "")) e.push("Hora do atendimento médico inválida (HHMM).")
  if (!Number.isInteger(a?.durTrat) || a.durTrat < 0 || a.durTrat > 9999) e.push("Duração do tratamento (em dias) inválida.")
  if (!COD9.test(a?.dscLesao || "")) e.push("Natureza da lesão (Tabela 17) deve ter 9 dígitos.")
  if (!/^[A-Z]\d{2,3}$/.test((a?.codCID || "").replace(".", "").toUpperCase())) e.push("CID inválido (ex.: S61 ou S610).")
  if (!a?.emitente?.nmEmit?.trim() || a.emitente.nmEmit.trim().length < 2) e.push("Informe o nome do médico/dentista emitente do atestado.")
  if (!["1", "2", "3"].includes(a?.emitente?.ideOC)) e.push("Informe o conselho do emitente (CRM, CRO ou RMS).")
  if (!a?.emitente?.nrOC?.trim()) e.push("Informe o número de inscrição do emitente no conselho.")
  if (a?.emitente?.ufOC && !UFS.includes(a.emitente.ufOC)) e.push("UF do conselho do emitente inválida.")

  return e
}

export function buildS2210XML(d: S2210Data, verProc = process.env.ESOCIAL_VER_PROC || "1.0.0"): { id: string; xml: string } {
  const id = generateEventId(d.empregador)
  const c = d.cat
  const l = c.local
  const a = c.atestado
  let x = `<eSocial xmlns="${eventNamespace("evtCAT")}"><evtCAT Id="${id}">`
  x += buildBaseXml(d, ambienteAtual().tpAmb, verProc)
  x += "<cat>"
  x += tag("dtAcid", c.dtAcid)
  x += tag("tpAcid", c.tpAcid)
  x += optTag("hrAcid", c.hrAcid)
  x += optTag("hrsTrabAntesAcid", c.hrsTrabAntesAcid)
  x += tag("tpCat", c.tpCat)
  x += tag("indCatObito", c.indCatObito)
  if (c.indCatObito === "S" || c.tpCat === "3") x += optTag("dtObito", c.dtObito)
  x += tag("indComunPolicia", c.indComunPolicia)
  x += tag("codSitGeradora", c.codSitGeradora)
  x += tag("iniciatCAT", c.iniciatCAT)
  x += optTag("obsCAT", c.obsCAT?.trim())
  x += optTag("ultDiaTrab", c.ultDiaTrab)
  x += optTag("houveAfast", c.houveAfast)

  x += "<localAcidente>"
  x += tag("tpLocal", l.tpLocal)
  x += optTag("dscLocal", l.dscLocal?.trim())
  x += optTag("tpLograd", l.tpLograd?.trim())
  x += tag("dscLograd", l.dscLograd.trim())
  x += tag("nrLograd", l.nrLograd.trim())
  x += optTag("complemento", l.complemento?.trim())
  x += optTag("bairro", l.bairro?.trim())
  x += optTag("cep", l.cep ? onlyDigits(l.cep) : null)
  if (l.tpLocal !== "2") {
    x += optTag("codMunic", l.codMunic)
    x += optTag("uf", l.uf)
  } else {
    x += optTag("pais", l.pais)
    x += optTag("codPostal", l.codPostal?.trim())
  }
  if (l.ideLocalAcid && (l.tpLocal === "1" || l.tpLocal === "3")) {
    x += `<ideLocalAcid>${tag("tpInsc", l.ideLocalAcid.tpInsc)}${tag("nrInsc", cleanInscricao(l.ideLocalAcid.nrInsc))}</ideLocalAcid>`
  }
  x += "</localAcidente>"

  x += `<parteAtingida>${tag("codParteAting", c.parteAtingida.codParteAting)}${tag("lateralidade", c.parteAtingida.lateralidade)}</parteAtingida>`
  x += `<agenteCausador>${tag("codAgntCausador", c.codAgntCausador)}</agenteCausador>`

  x += "<atestado>"
  x += tag("dtAtendimento", a.dtAtendimento)
  x += tag("hrAtendimento", a.hrAtendimento)
  x += tag("indInternacao", a.indInternacao)
  x += tag("durTrat", a.durTrat)
  x += tag("indAfast", a.indAfast)
  x += tag("dscLesao", a.dscLesao)
  x += optTag("dscCompLesao", a.dscCompLesao?.trim())
  x += optTag("diagProvavel", a.diagProvavel?.trim())
  x += tag("codCID", a.codCID.replace(".", "").toUpperCase())
  x += optTag("observacao", a.observacao?.trim())
  x += "<emitente>"
  x += tag("nmEmit", a.emitente.nmEmit.trim())
  x += tag("ideOC", a.emitente.ideOC)
  x += tag("nrOC", a.emitente.nrOC.trim())
  x += optTag("ufOC", a.emitente.ufOC)
  x += "</emitente>"
  x += "</atestado>"

  if (c.nrRecCatOrig) x += `<catOrigem>${tag("nrRecCatOrig", c.nrRecCatOrig)}</catOrigem>`
  x += "</cat></evtCAT></eSocial>"
  return { id, xml: x }
}
