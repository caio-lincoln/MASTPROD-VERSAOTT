import { ambienteAtual, escapeXml, eventNamespace, formatDecimal, generateEventId, onlyDigits } from "../common"
import { COD_AUSENCIA_AGENTE, type S2240Data } from "./types"

const tag = (name: string, value: unknown) => `<${name}>${escapeXml(value)}</${name}>`
const optTag = (name: string, value: unknown) =>
  value === null || value === undefined || value === "" ? "" : tag(name, value)

/**
 * Gera o XML (sem assinatura) do S-2240 no leiaute S-1.3, na ordem do XSD evtExpRisco.
 * Saída compacta (sem quebras de linha), como o eSocial espera.
 */
export function buildS2240XML(d: S2240Data, verProc = process.env.ESOCIAL_VER_PROC || "1.0.0"): { id: string; xml: string } {
  const id = generateEventId(d.empregador)
  const ausencia = d.agentes.length === 1 && d.agentes[0].codAgNoc === COD_AUSENCIA_AGENTE

  let x = `<eSocial xmlns="${eventNamespace("evtExpRisco")}">`
  x += `<evtExpRisco Id="${id}">`

  x += "<ideEvento>"
  x += tag("indRetif", d.indRetif)
  if (d.indRetif === "2") x += tag("nrRecibo", d.nrRecibo)
  x += tag("tpAmb", ambienteAtual().tpAmb)
  x += tag("procEmi", "1")
  x += tag("verProc", verProc)
  x += "</ideEvento>"

  x += "<ideEmpregador>"
  x += tag("tpInsc", d.empregador.tpInsc)
  x += tag("nrInsc", d.empregador.nrInsc)
  x += "</ideEmpregador>"

  x += "<ideVinculo>"
  x += tag("cpfTrab", onlyDigits(d.trabalhador.cpf))
  if (d.trabalhador.matricula) x += tag("matricula", d.trabalhador.matricula)
  else x += tag("codCateg", d.trabalhador.codCateg)
  x += "</ideVinculo>"

  x += "<infoExpRisco>"
  x += tag("dtIniCondicao", d.dtIniCondicao)
  x += optTag("dtFimCondicao", d.dtFimCondicao)

  for (const a of d.ambientes) {
    x += "<infoAmb>"
    x += tag("localAmb", a.localAmb)
    x += tag("dscSetor", a.dscSetor.trim())
    x += tag("tpInsc", a.tpInsc)
    x += tag("nrInsc", onlyDigits(a.nrInsc))
    x += "</infoAmb>"
  }

  x += `<infoAtiv>${tag("dscAtivDes", d.dscAtivDes.trim())}</infoAtiv>`

  for (const a of d.agentes) {
    x += "<agNoc>"
    x += tag("codAgNoc", a.codAgNoc)
    if (!ausencia) {
      x += optTag("dscAgNoc", a.dscAgNoc?.trim())
      x += tag("tpAval", a.tpAval)
      if (a.tpAval === "1") {
        x += tag("intConc", formatDecimal(a.intConc as number))
        if (a.limTol !== null && a.limTol !== undefined) x += tag("limTol", formatDecimal(a.limTol))
        x += tag("unMed", a.unMed)
        x += tag("tecMedicao", a.tecMedicao?.trim())
      }
      x += optTag("nrProcJud", a.nrProcJud?.trim())

      const ep = a.epcEpi
      if (ep) {
        x += "<epcEpi>"
        x += tag("utilizEPC", ep.utilizEPC)
        if (ep.utilizEPC === "2") x += tag("eficEpc", ep.eficEpc)
        x += tag("utilizEPI", ep.utilizEPI)
        if (ep.utilizEPI === "2") {
          x += tag("eficEpi", ep.eficEpi)
          for (const doc of ep.epis.map((v) => v.trim()).filter(Boolean)) {
            x += `<epi>${tag("docAval", doc)}</epi>`
          }
          if (ep.epiCompl) {
            const c = ep.epiCompl
            x += "<epiCompl>"
            x += tag("medProtecao", c.medProtecao)
            x += tag("condFuncto", c.condFuncto)
            x += tag("usoInint", c.usoInint)
            x += tag("przValid", c.przValid)
            x += tag("periodicTroca", c.periodicTroca)
            x += tag("higienizacao", c.higienizacao)
            x += "</epiCompl>"
          }
        }
        x += "</epcEpi>"
      }
    }
    x += "</agNoc>"
  }

  for (const r of d.responsaveis) {
    x += "<respReg>"
    x += tag("cpfResp", onlyDigits(r.cpfResp))
    if (r.ideOC) {
      x += tag("ideOC", r.ideOC)
      if (r.ideOC === "9") x += tag("dscOC", r.dscOC?.trim())
      x += tag("nrOC", r.nrOC?.trim())
      x += tag("ufOC", r.ufOC)
    }
    x += "</respReg>"
  }

  if (d.obsCompl?.trim()) x += `<obs>${tag("obsCompl", d.obsCompl.trim())}</obs>`

  x += "</infoExpRisco>"
  x += "</evtExpRisco>"
  x += "</eSocial>"

  return { id, xml: x }
}
