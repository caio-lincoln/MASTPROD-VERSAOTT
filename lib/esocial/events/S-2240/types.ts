import type { EmpregadorIde } from "../common"

/** Dados do evento S-2240 (evtExpRisco), já no vocabulário do leiaute. */
export interface S2240Data {
  empregador: EmpregadorIde
  indRetif: "1" | "2"
  nrRecibo?: string | null
  trabalhador: {
    cpf: string
    matricula?: string | null
    codCateg?: string | null
  }
  dtIniCondicao: string // AAAA-MM-DD
  dtFimCondicao?: string | null
  ambientes: S2240Ambiente[]
  dscAtivDes: string
  agentes: S2240Agente[]
  responsaveis: S2240Responsavel[]
  obsCompl?: string | null
}

export interface S2240Ambiente {
  localAmb: "1" | "2"
  dscSetor: string
  tpInsc: "1" | "3" | "4"
  nrInsc: string
}

export interface S2240Agente {
  codAgNoc: string
  dscAgNoc?: string | null
  tpAval?: "1" | "2" | null
  intConc?: number | null
  limTol?: number | null
  unMed?: number | null
  tecMedicao?: string | null
  nrProcJud?: string | null
  epcEpi?: {
    utilizEPC: "0" | "1" | "2"
    eficEpc?: "S" | "N" | null
    utilizEPI: "0" | "1" | "2"
    eficEpi?: "S" | "N" | null
    epis: string[] // docAval (CA)
    epiCompl?: {
      medProtecao: "S" | "N"
      condFuncto: "S" | "N"
      usoInint: "S" | "N"
      przValid: "S" | "N"
      periodicTroca: "S" | "N"
      higienizacao: "S" | "N"
    } | null
  } | null
}

export interface S2240Responsavel {
  cpfResp: string
  ideOC?: "1" | "4" | "9" | null
  dscOC?: string | null
  nrOC?: string | null
  ufOC?: string | null
}

export const COD_AUSENCIA_AGENTE = "09.01.001"
