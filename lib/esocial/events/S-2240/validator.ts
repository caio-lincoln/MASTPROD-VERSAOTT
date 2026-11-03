import { isValidCpf, onlyDigits } from "../common"
import { COD_AUSENCIA_AGENTE, type S2240Data } from "./types"

// Agentes que exigem limite de tolerância na avaliação quantitativa
const EXIGE_LIM_TOL = ["01.18.001", "02.01.014"]
// Agente incluído por decisão judicial/administrativa: exige número do processo
const EXIGE_PROCESSO = "05.01.001"

const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Regras do leiaute S-1.3 do S-2240. Retorna a lista de erros (vazia = válido). */
export function validateS2240(d: S2240Data): string[] {
  const e: string[] = []

  if (d.indRetif === "2" && !d.nrRecibo) e.push("Retificação exige o número do recibo do evento original.")

  // Trabalhador
  if (!isValidCpf(d.trabalhador.cpf)) e.push("CPF do trabalhador inválido.")
  if (!d.trabalhador.matricula && !d.trabalhador.codCateg) {
    e.push("Informe a matrícula do trabalhador (a mesma enviada no S-2200/S-2300) ou a categoria.")
  }
  if (d.trabalhador.matricula && d.trabalhador.matricula.length > 30) e.push("Matrícula com mais de 30 caracteres.")

  // Período
  if (!DATE.test(d.dtIniCondicao || "")) e.push("Data de início da condição inválida.")
  if (d.dtFimCondicao) {
    if (!DATE.test(d.dtFimCondicao)) e.push("Data de fim da condição inválida.")
    else if (d.dtFimCondicao < d.dtIniCondicao) e.push("Data de fim anterior à data de início.")
  }

  // Ambiente
  if (!d.ambientes.length) e.push("Informe o ambiente de trabalho.")
  if (d.ambientes.length > 9) e.push("No máximo 9 ambientes por evento.")
  d.ambientes.forEach((a, i) => {
    const n = `Ambiente ${i + 1}`
    if (!a.dscSetor?.trim()) e.push(`${n}: descreva o setor.`)
    if (a.dscSetor && a.dscSetor.length > 100) e.push(`${n}: descrição do setor com mais de 100 caracteres.`)
    const nr = onlyDigits(a.nrInsc)
    const esperado = a.tpInsc === "4" ? 12 : 14
    if (nr.length !== esperado) e.push(`${n}: inscrição do local deve ter ${esperado} dígitos.`)
  })

  // Atividade
  if (!d.dscAtivDes?.trim()) e.push("Descreva as atividades desempenhadas.")
  if (d.dscAtivDes && d.dscAtivDes.length > 999) e.push("Descrição das atividades com mais de 999 caracteres.")

  // Agentes nocivos
  if (!d.agentes.length) e.push(`Informe ao menos um agente nocivo (ou ${COD_AUSENCIA_AGENTE} - ausência de agente).`)
  const temAusencia = d.agentes.some((a) => a.codAgNoc === COD_AUSENCIA_AGENTE)
  if (temAusencia && d.agentes.length > 1) {
    e.push(`O código ${COD_AUSENCIA_AGENTE} (ausência de agente nocivo) não pode ser combinado com outros agentes.`)
  }
  const codigos = new Set<string>()
  d.agentes.forEach((a, i) => {
    const n = `Agente ${i + 1} (${a.codAgNoc || "sem código"})`
    if (!/^\d{2}\.\d{2}\.\d{3}$/.test(a.codAgNoc || "")) {
      e.push(`${n}: código da Tabela 24 inválido (formato 00.00.000).`)
      return
    }
    if (codigos.has(a.codAgNoc)) e.push(`${n}: agente repetido no mesmo evento.`)
    codigos.add(a.codAgNoc)
    if (a.codAgNoc === COD_AUSENCIA_AGENTE) return

    if (!a.dscAgNoc?.trim()) e.push(`${n}: descreva o agente nocivo.`)
    if (a.dscAgNoc && a.dscAgNoc.length > 100) e.push(`${n}: descrição com mais de 100 caracteres.`)
    if (a.tpAval !== "1" && a.tpAval !== "2") e.push(`${n}: informe o tipo de avaliação (quantitativa ou qualitativa).`)
    if (a.tpAval === "1") {
      if (a.intConc === null || a.intConc === undefined || Number.isNaN(a.intConc)) e.push(`${n}: informe a intensidade/concentração.`)
      if (!a.unMed) e.push(`${n}: informe a unidade de medida.`)
      if (!a.tecMedicao?.trim()) e.push(`${n}: informe a técnica de medição.`)
      if (EXIGE_LIM_TOL.includes(a.codAgNoc) && (a.limTol === null || a.limTol === undefined)) {
        e.push(`${n}: informe o limite de tolerância.`)
      }
    }
    if (a.codAgNoc === EXIGE_PROCESSO && !a.nrProcJud?.trim()) e.push(`${n}: informe o número do processo judicial/administrativo.`)

    const ep = a.epcEpi
    if (!ep) {
      e.push(`${n}: informe a utilização de EPC/EPI.`)
      return
    }
    if (ep.utilizEPC === "2" && !ep.eficEpc) e.push(`${n}: informe se o EPC é eficaz.`)
    if (ep.utilizEPI === "2") {
      if (!ep.eficEpi) e.push(`${n}: informe se o EPI é eficaz.`)
      if (!ep.epis.filter((x) => x.trim()).length) e.push(`${n}: informe ao menos um EPI (CA ou documento de avaliação).`)
      if (ep.epis.length > 50) e.push(`${n}: no máximo 50 EPIs por agente.`)
      if (!ep.epiCompl) e.push(`${n}: preencha os requisitos da NR-06 para o EPI.`)
    }
  })

  // Responsáveis pelos registros ambientais
  if (!d.responsaveis.length) e.push("Informe o responsável pelos registros ambientais.")
  if (d.responsaveis.length > 9) e.push("No máximo 9 responsáveis por evento.")
  d.responsaveis.forEach((r, i) => {
    const n = `Responsável ${i + 1}`
    if (!isValidCpf(r.cpfResp)) e.push(`${n}: CPF inválido.`)
    if (!temAusencia && !r.ideOC) e.push(`${n}: informe o órgão de classe (CRM, CREA ou outro).`)
    if (r.ideOC) {
      if (r.ideOC === "9" && !r.dscOC?.trim()) e.push(`${n}: informe a sigla do órgão de classe.`)
      if (!r.nrOC?.trim()) e.push(`${n}: informe o número de inscrição no órgão de classe.`)
      if (!/^[A-Z]{2}$/.test(r.ufOC || "")) e.push(`${n}: informe a UF do órgão de classe.`)
    }
  })

  if (d.obsCompl && d.obsCompl.length > 999) e.push("Observação com mais de 999 caracteres.")

  return e
}
