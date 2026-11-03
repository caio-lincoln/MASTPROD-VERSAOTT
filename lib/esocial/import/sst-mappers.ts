import { arr, text } from "./parser"
import type { AsoDados } from "../events/S-2220"
import type { CatDados } from "../events/S-2210"

/**
 * Converte os eventos de SST baixados do eSocial (nó XML já lido) para o mesmo
 * formato de dados usado na geração dos eventos, para que o histórico importado
 * possa ser consultado, editado e retificado no MASTPROD.
 */

const opt = (v: any) => text(v) || null
const insc = (v: any) => text(v).replace(/[^0-9A-Za-z]/g, "").toUpperCase()

export interface VinculoImportado {
  cpf: string
  matricula: string | null
  codCateg: string | null
}

export function vinculoDe(node: any): VinculoImportado {
  return {
    cpf: text(node?.ideVinculo?.cpfTrab).replace(/\D/g, ""),
    matricula: opt(node?.ideVinculo?.matricula),
    codCateg: opt(node?.ideVinculo?.codCateg),
  }
}

export function asoDe(node: any): AsoDados {
  const ex = node?.exMedOcup ?? {}
  const aso = ex.aso ?? {}
  const resp = ex.respMonit
  return {
    tpExameOcup: text(ex.tpExameOcup) as AsoDados["tpExameOcup"],
    dtAso: text(aso.dtAso),
    resAso: (opt(aso.resAso) as AsoDados["resAso"]) ?? null,
    exames: arr<any>(aso.exame).map((e) => ({
      dtExm: text(e.dtExm),
      procRealizado: text(e.procRealizado),
      obsProc: opt(e.obsProc),
      ordExame: opt(e.ordExame) as any,
      indResult: opt(e.indResult) as any,
    })),
    medico: { nmMed: text(aso.medico?.nmMed), nrCRM: opt(aso.medico?.nrCRM), ufCRM: opt(aso.medico?.ufCRM) },
    respMonit: resp
      ? { cpfResp: opt(resp.cpfResp), nmResp: text(resp.nmResp), nrCRM: text(resp.nrCRM), ufCRM: text(resp.ufCRM) }
      : null,
  }
}

export function catDe(node: any): CatDados {
  const c = node?.cat ?? {}
  const l = c.localAcidente ?? {}
  const a = c.atestado ?? {}
  return {
    dtAcid: text(c.dtAcid),
    tpAcid: text(c.tpAcid) as CatDados["tpAcid"],
    hrAcid: opt(c.hrAcid),
    hrsTrabAntesAcid: opt(c.hrsTrabAntesAcid),
    tpCat: text(c.tpCat) as CatDados["tpCat"],
    indCatObito: (text(c.indCatObito) || "N") as "S" | "N",
    dtObito: opt(c.dtObito),
    indComunPolicia: (text(c.indComunPolicia) || "N") as "S" | "N",
    codSitGeradora: text(c.codSitGeradora),
    iniciatCAT: text(c.iniciatCAT) as CatDados["iniciatCAT"],
    obsCAT: opt(c.obsCAT),
    ultDiaTrab: opt(c.ultDiaTrab),
    houveAfast: opt(c.houveAfast) as any,
    local: {
      tpLocal: text(l.tpLocal) as CatDados["local"]["tpLocal"],
      dscLocal: opt(l.dscLocal),
      tpLograd: opt(l.tpLograd),
      dscLograd: text(l.dscLograd),
      nrLograd: text(l.nrLograd),
      complemento: opt(l.complemento),
      bairro: opt(l.bairro),
      cep: opt(l.cep),
      codMunic: opt(l.codMunic),
      uf: opt(l.uf),
      pais: opt(l.pais),
      codPostal: opt(l.codPostal),
      ideLocalAcid: l.ideLocalAcid ? { tpInsc: text(l.ideLocalAcid.tpInsc) as any, nrInsc: insc(l.ideLocalAcid.nrInsc) } : null,
    },
    parteAtingida: {
      codParteAting: text(c.parteAtingida?.codParteAting),
      lateralidade: (text(c.parteAtingida?.lateralidade) || "0") as any,
    },
    codAgntCausador: text(c.agenteCausador?.codAgntCausador),
    atestado: {
      dtAtendimento: text(a.dtAtendimento),
      hrAtendimento: text(a.hrAtendimento),
      indInternacao: (text(a.indInternacao) || "N") as "S" | "N",
      durTrat: Number(text(a.durTrat) || 0),
      indAfast: (text(a.indAfast) || "N") as "S" | "N",
      dscLesao: text(a.dscLesao),
      dscCompLesao: opt(a.dscCompLesao),
      diagProvavel: opt(a.diagProvavel),
      codCID: text(a.codCID),
      observacao: opt(a.observacao),
      emitente: {
        nmEmit: text(a.emitente?.nmEmit),
        ideOC: text(a.emitente?.ideOC) as any,
        nrOC: text(a.emitente?.nrOC),
        ufOC: opt(a.emitente?.ufOC),
      },
    },
    nrRecCatOrig: opt(c.catOrigem?.nrRecCatOrig),
  }
}

export interface ExposicaoImportada {
  dtIniCondicao: string
  dtFimCondicao: string | null
  ambiente: { localAmb: string; dscSetor: string; tpInsc: string; nrInsc: string } | null
  dscAtivDes: string
  obsCompl: string | null
  agentes: {
    codAgNoc: string
    dscAgNoc: string | null
    tpAval: string | null
    intConc: string | null
    limTol: string | null
    unMed: string | null
    tecMedicao: string | null
    nrProcJud: string | null
    utilizEPC: string | null
    eficEpc: string | null
    utilizEPI: string | null
    eficEpi: string | null
    epis: string[]
    epiCompl: Record<string, string | null> | null
  }[]
  responsaveis: { cpf: string; ideOC: string | null; dscOC: string | null; nrOC: string | null; ufOC: string | null }[]
}

export function exposicaoDe(node: any): ExposicaoImportada {
  const x = node?.infoExpRisco ?? {}
  const amb = arr<any>(x.infoAmb)[0]
  return {
    dtIniCondicao: text(x.dtIniCondicao),
    dtFimCondicao: opt(x.dtFimCondicao),
    ambiente: amb
      ? { localAmb: text(amb.localAmb), dscSetor: text(amb.dscSetor), tpInsc: text(amb.tpInsc), nrInsc: insc(amb.nrInsc) }
      : null,
    dscAtivDes: text(x.infoAtiv?.dscAtivDes),
    obsCompl: opt(x.obs?.obsCompl),
    agentes: arr<any>(x.agNoc).map((a) => {
      const ep = a.epcEpi ?? {}
      const c = ep.epiCompl
      return {
        codAgNoc: text(a.codAgNoc),
        dscAgNoc: opt(a.dscAgNoc),
        tpAval: opt(a.tpAval),
        intConc: opt(a.intConc),
        limTol: opt(a.limTol),
        unMed: opt(a.unMed),
        tecMedicao: opt(a.tecMedicao),
        nrProcJud: opt(a.nrProcJud),
        utilizEPC: opt(ep.utilizEPC),
        eficEpc: opt(ep.eficEpc),
        utilizEPI: opt(ep.utilizEPI),
        eficEpi: opt(ep.eficEpi),
        epis: arr<any>(ep.epi).map((e) => text(e.docAval)).filter(Boolean),
        epiCompl: c
          ? {
              medProtecao: opt(c.medProtecao),
              condFuncto: opt(c.condFuncto),
              usoInint: opt(c.usoInint),
              przValid: opt(c.przValid),
              periodicTroca: opt(c.periodicTroca),
              higienizacao: opt(c.higienizacao),
            }
          : null,
      }
    }),
    responsaveis: arr<any>(x.respReg).map((r) => ({
      cpf: text(r.cpfResp).replace(/\D/g, ""),
      ideOC: opt(r.ideOC),
      dscOC: opt(r.dscOC),
      nrOC: opt(r.nrOC),
      ufOC: opt(r.ufOC),
    })),
  }
}
