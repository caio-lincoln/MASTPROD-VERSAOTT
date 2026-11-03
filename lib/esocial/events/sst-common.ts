import { escapeXml, isValidCpf, onlyDigits, type EmpregadorIde } from "./common"

/** Identificação do vínculo (T_ideVinculo_sst), comum a S-2210, S-2220 e S-2240. */
export interface VinculoSst {
  cpf: string
  matricula?: string | null
  codCateg?: string | null
}

export interface EventoSstBase {
  empregador: EmpregadorIde
  indRetif: "1" | "2"
  nrRecibo?: string | null
  trabalhador: VinculoSst
}

export const tag = (name: string, value: unknown) => `<${name}>${escapeXml(value)}</${name}>`
export const optTag = (name: string, value: unknown) =>
  value === null || value === undefined || value === "" ? "" : tag(name, value)

export const DATE = /^\d{4}-\d{2}-\d{2}$/
export const HORA = /^([01]\d|2[0-3])[0-5]\d$/ // HHMM
export const RECIBO = /^1\.\d\.\d{19}$/
export const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ")

export function validateBase(d: EventoSstBase, e: string[]) {
  if (d.indRetif === "2" && !RECIBO.test(d.nrRecibo || "")) {
    e.push("Retificação exige o número do recibo do evento original (formato 1.X.XXXXXXXXXXXXXXXXXXX).")
  }
  if (!isValidCpf(d.trabalhador.cpf)) e.push("CPF do trabalhador inválido.")
  if (!d.trabalhador.matricula && !d.trabalhador.codCateg) {
    e.push("Informe a matrícula do trabalhador (a mesma enviada no S-2200/S-2300) ou a categoria.")
  }
  if (d.trabalhador.matricula && d.trabalhador.matricula.length > 30) e.push("Matrícula com mais de 30 caracteres.")
}

/** ideEvento + ideEmpregador + ideVinculo, na ordem do XSD. */
export function buildBaseXml(d: EventoSstBase, tpAmb: string, verProc: string): string {
  let x = "<ideEvento>"
  x += tag("indRetif", d.indRetif)
  if (d.indRetif === "2") x += tag("nrRecibo", d.nrRecibo)
  x += tag("tpAmb", tpAmb)
  x += tag("procEmi", "1")
  x += tag("verProc", verProc)
  x += "</ideEvento>"
  x += `<ideEmpregador>${tag("tpInsc", d.empregador.tpInsc)}${tag("nrInsc", d.empregador.nrInsc)}</ideEmpregador>`
  x += "<ideVinculo>"
  x += tag("cpfTrab", onlyDigits(d.trabalhador.cpf))
  if (d.trabalhador.matricula) x += tag("matricula", d.trabalhador.matricula)
  else x += tag("codCateg", d.trabalhador.codCateg)
  x += "</ideVinculo>"
  return x
}
