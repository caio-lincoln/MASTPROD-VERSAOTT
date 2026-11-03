import { unzipSync, strFromU8 } from "fflate"
import { XMLParser } from "fast-xml-parser"

/**
 * Leitura dos XMLs baixados do eSocial (portal "Download" ou webservice).
 * Aceita arquivos .xml e .zip (inclusive ZIP dentro de ZIP) e localiza os eventos
 * em qualquer nível do documento, já que o arquivo pode vir com o evento puro,
 * com o evento assinado ou embrulhado junto do retorno do processamento.
 */

export interface InputFile {
  name: string
  data: Uint8Array
}

export type EventKind =
  | "S-1000"
  | "S-1005"
  | "S-1200"
  | "S-1202"
  | "S-2200"
  | "S-2205"
  | "S-2206"
  | "S-2230"
  | "S-2240"
  | "S-2299"
  | "S-2300"
  | "S-2399"
  | "S-3000"
  | "S-2210"
  | "S-2220"

const EVENT_TAGS: Record<string, EventKind> = {
  evtInfoEmpregador: "S-1000",
  evtTabEstab: "S-1005",
  evtRemun: "S-1200",
  evtRmnRPPS: "S-1202",
  evtAdmissao: "S-2200",
  evtAltCadastral: "S-2205",
  evtAltContratual: "S-2206",
  evtAfastTemp: "S-2230",
  evtExpRisco: "S-2240",
  evtDeslig: "S-2299",
  evtTSVInicio: "S-2300",
  evtTSVTermino: "S-2399",
  evtExclusao: "S-3000",
  evtCAT: "S-2210",
  evtMonit: "S-2220",
}

export interface ParsedEvent {
  kind: EventKind
  id: string | null
  /** Recibo do evento, quando o arquivo traz o retorno do processamento junto */
  recibo: string | null
  /** XML original do arquivo, quando ele contém só este evento */
  raw: string | null
  file: string
  empregador: { tpInsc: string; nrInsc: string }
  node: any
}

export interface ParseResult {
  events: ParsedEvent[]
  arquivosLidos: number
  ignorados: string[] // arquivos sem evento reconhecido
  erros: string[] // arquivos que não puderam ser lidos
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  removeNSPrefix: true,
  parseTagValue: false, // mantém CPF/matrícula como texto (zeros à esquerda)
  parseAttributeValue: false,
  trimValues: true,
})

const isZip = (d: Uint8Array) => d.length > 3 && d[0] === 0x50 && d[1] === 0x4b && d[2] === 0x03 && d[3] === 0x04

function expand(file: InputFile, out: InputFile[], erros: string[], depth = 0) {
  if (isZip(file.data)) {
    if (depth > 3) {
      erros.push(`${file.name}: ZIPs aninhados demais`)
      return
    }
    let entries: Record<string, Uint8Array>
    try {
      entries = unzipSync(file.data)
    } catch {
      erros.push(`${file.name}: ZIP inválido ou corrompido`)
      return
    }
    for (const [name, data] of Object.entries(entries)) {
      if (name.endsWith("/")) continue
      expand({ name: `${file.name}/${name}`, data }, out, erros, depth + 1)
    }
    return
  }
  out.push(file)
}

function decodeXml(data: Uint8Array): string {
  // Os XMLs do eSocial são UTF-8; remove BOM se houver
  let text = strFromU8(data)
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  return text
}

/** nrRecibo dos retornos de processamento (retornoEvento/recibo), fora dos eventos. */
function collectRecibos(node: any, out: string[] = []): string[] {
  if (!node || typeof node !== "object") return out
  if (Array.isArray(node)) {
    node.forEach((n) => collectRecibos(n, out))
    return out
  }
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("@") || EVENT_TAGS[key]) continue
    if (key === "recibo") {
      for (const r of Array.isArray(value) ? value : [value]) {
        const nr = typeof r === "object" ? r?.nrRecibo : null
        if (nr) out.push(String(typeof nr === "object" ? nr["#text"] : nr).trim())
      }
      continue
    }
    collectRecibos(value, out)
  }
  return out
}

/** Percorre a árvore e chama fn para cada evento reconhecido. */
function walk(node: any, fn: (tag: string, value: any) => void) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, fn))
    return
  }
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("@")) continue
    if (EVENT_TAGS[key]) {
      ;(Array.isArray(value) ? value : [value]).forEach((v) => fn(key, v))
      continue
    }
    walk(value, fn)
  }
}

export function parseEsocialFiles(files: InputFile[]): ParseResult {
  const flat: InputFile[] = []
  const erros: string[] = []
  files.forEach((f) => expand(f, flat, erros))

  const events: ParsedEvent[] = []
  const ignorados: string[] = []
  const vistos = new Set<string>()
  let arquivosLidos = 0

  for (const file of flat) {
    if (!/\.xml$/i.test(file.name) && !decodeXml(file.data.slice(0, 200)).trimStart().startsWith("<")) {
      ignorados.push(file.name)
      continue
    }
    let doc: any
    const xmlText = decodeXml(file.data)
    try {
      doc = parser.parse(xmlText)
    } catch {
      erros.push(`${file.name}: XML inválido`)
      continue
    }
    arquivosLidos++
    let found = 0
    const recibos = collectRecibos(doc)
    const doArquivo: ParsedEvent[] = []
    walk(doc, (tag, value) => {
      const id = value?.["@Id"] ?? null
      // O mesmo evento pode vir repetido (evento + retorno, ou arquivos duplicados)
      if (id && vistos.has(id)) return
      if (id) vistos.add(id)
      found++
      doArquivo.push({
        kind: EVENT_TAGS[tag],
        id,
        recibo: null,
        raw: null,
        file: file.name,
        empregador: {
          tpInsc: text(value?.ideEmpregador?.tpInsc),
          nrInsc: text(value?.ideEmpregador?.nrInsc),
        },
        node: value,
      })
    })
    // Só dá para ligar o recibo ao evento quando o arquivo traz um evento e seu retorno
    if (doArquivo.length === 1 && recibos.length === 1) doArquivo[0].recibo = recibos[0]
    if (doArquivo.length === 1) doArquivo[0].raw = xmlText
    events.push(...doArquivo)
    if (!found) ignorados.push(file.name)
  }

  return { events, arquivosLidos, ignorados, erros }
}

// ---------------------------------------------------------------------------
// Consolidação por trabalhador
// ---------------------------------------------------------------------------

export interface TrabalhadorImportado {
  cpf: string
  nome: string | null
  sexo: string | null
  dataNascimento: string | null
  email: string | null
  telefone: string | null
  matricula: string | null
  codCategoria: string | null
  cargo: string | null
  cbo: string | null
  dataAdmissao: string | null
  dataDesligamento: string | null
  semVinculo: boolean // TSVE (S-2300)
  ultimoPerApur: string | null // última competência com remuneração (S-1200/S-1202)
  afastamentoInicio: string | null // afastamento em aberto (S-2230 sem término)
  afastamentoMotivo: string | null // Tabela 18
  eventos: EventKind[]
}

export interface EmpregadorImportado {
  classTrib: string | null
  indCoop: string | null
  indConstr: string | null
  indDesFolha: string | null
  indOptRegEletron: string | null
  iniValid: string | null
}

export interface EstabelecimentoImportado {
  tpInsc: string
  nrInsc: string
  cnaePrep: string | null
  iniValid: string | null
  fimValid: string | null
  excluido: boolean
}

export interface ConsolidatedImport {
  trabalhadores: TrabalhadorImportado[]
  empregador: EmpregadorImportado | null
  estabelecimentos: EstabelecimentoImportado[]
  s2240Enviados: number
  contagem: Partial<Record<EventKind, number>>
  outroEmpregador: number // eventos descartados por serem de outro CNPJ
  excluidos: number // eventos anulados por S-3000
  retificados: number // eventos substituídos por retificação
  exclusoesSemRecibo: number // S-3000 cujo evento original não pôde ser identificado
  /** Eventos de SST vigentes (S-2210, S-2220, S-2240), para importar como histórico */
  sst: ParsedEvent[]
}

export function text(v: any): string {
  if (v === undefined || v === null) return ""
  if (typeof v === "object") return String(v["#text"] ?? "")
  return String(v).trim()
}

const opt = (v: any) => text(v) || null
export const arr = <T,>(v: T | T[] | undefined): T[] => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v])
const digits = (v: any) => text(v).replace(/\D/g, "")

/** Data do fato, para aplicar os eventos na ordem em que aconteceram. */
function eventDate(e: ParsedEvent): string {
  const n = e.node
  switch (e.kind) {
    case "S-2200":
      return text(n.vinculo?.infoRegimeTrab?.infoCeletista?.dtAdm) || text(n.vinculo?.infoRegimeTrab?.infoEstatutario?.dtExercicio) || "0000"
    case "S-2300":
      return text(n.infoTSVInicio?.dtInicio) || "0000"
    case "S-2205":
    case "S-2206":
      return text(n.alteracao?.dtAlteracao) || text(n.altContratual?.dtAlteracao) || "0000"
    case "S-2299":
      return text(n.infoDeslig?.dtDeslig) || "9999"
    case "S-2399":
      return text(n.infoTSVTermino?.dtTerm) || "9999"
    case "S-1200":
    case "S-1202":
      return `${text(n.ideEvento?.perApur)}-31`
    case "S-2230":
      return text(n.infoAfastamento?.iniAfastamento?.dtIniAfast) || text(n.infoAfastamento?.fimAfastamento?.dtTermAfast) || "0000"
    default:
      return "0000"
  }
}

export function belongsTo(empregadorDoc: string, nrInsc: string): boolean {
  // CNPJ pode ser alfanumérico: compara sem pontuação, preservando letras
  const doc = empregadorDoc.replace(/[^0-9A-Za-z]/g, "").toUpperCase()
  const nr = nrInsc.replace(/[^0-9A-Za-z]/g, "").toUpperCase()
  if (!nr) return false
  return doc === nr || (nr.length === 8 && doc.startsWith(nr))
}

export function consolidate(events: ParsedEvent[], empregadorDoc: string): ConsolidatedImport {
  const contagem: Partial<Record<EventKind, number>> = {}
  let outroEmpregador = 0
  const proprios = events.filter((e) => {
    if (!belongsTo(empregadorDoc, e.empregador.nrInsc)) {
      outroEmpregador++
      return false
    }
    contagem[e.kind] = (contagem[e.kind] ?? 0) + 1
    return true
  })

  // S-3000 anula o evento do recibo informado; retificação (indRetif=2) substitui o original
  const anulados = new Set<string>()
  let exclusoesSemRecibo = 0
  const recibosConhecidos = new Set(proprios.map((e) => e.recibo).filter(Boolean) as string[])
  for (const e of proprios) {
    if (e.kind === "S-3000") {
      const nr = text(e.node.infoExclusao?.nrRecEvt)
      if (nr && recibosConhecidos.has(nr)) anulados.add(nr)
      else exclusoesSemRecibo++
    }
  }
  let retificados = 0
  for (const e of proprios) {
    const nr = text(e.node.ideEvento?.nrRecibo)
    if (text(e.node.ideEvento?.indRetif) === "2" && nr && recibosConhecidos.has(nr) && !anulados.has(nr)) {
      anulados.add(nr)
      retificados++
    }
  }
  const excluidos = proprios.filter((e) => e.kind !== "S-3000" && e.recibo && anulados.has(e.recibo)).length - retificados
  const vigentes = proprios.filter((e) => e.kind !== "S-3000" && !(e.recibo && anulados.has(e.recibo)))

  const workers = new Map<string, TrabalhadorImportado>()
  const get = (cpf: string) => {
    let w = workers.get(cpf)
    if (!w) {
      w = {
        cpf,
        nome: null,
        sexo: null,
        dataNascimento: null,
        email: null,
        telefone: null,
        matricula: null,
        codCategoria: null,
        cargo: null,
        cbo: null,
        dataAdmissao: null,
        dataDesligamento: null,
        semVinculo: false,
        ultimoPerApur: null,
        afastamentoInicio: null,
        afastamentoMotivo: null,
        eventos: [],
      }
      workers.set(cpf, w)
    }
    return w
  }
  const dadosPessoais = (w: TrabalhadorImportado, t: any) => {
    if (!t) return
    w.nome = opt(t.nmTrab) ?? w.nome
    w.sexo = opt(t.sexo) ?? w.sexo
    w.dataNascimento = opt(t.nascimento?.dtNascto) ?? w.dataNascimento
    w.email = opt(t.contato?.emailPrinc) ?? w.email
    w.telefone = opt(t.contato?.fonePrinc) ?? w.telefone
  }
  const contrato = (w: TrabalhadorImportado, c: any) => {
    if (!c) return
    w.cargo = opt(c.nmCargo) ?? opt(c.nmFuncao) ?? w.cargo
    w.cbo = opt(c.CBOCargo) ?? opt(c.CBOFuncao) ?? w.cbo
    w.codCategoria = opt(c.codCateg) ?? w.codCategoria
  }

  let empregador: EmpregadorImportado | null = null
  const estabelecimentos = new Map<string, EstabelecimentoImportado>()
  let s2240Enviados = 0

  const ordered = [...vigentes].sort((a, b) => eventDate(a).localeCompare(eventDate(b)))
  for (const e of ordered) {
    const n = e.node
    switch (e.kind) {
      case "S-1000": {
        const bloco = n.infoEmpregador?.inclusao ?? n.infoEmpregador?.alteracao
        const cad = bloco?.infoCadastro
        if (cad) {
          empregador = {
            classTrib: opt(cad.classTrib),
            indCoop: opt(cad.indCoop),
            indConstr: opt(cad.indConstr),
            indDesFolha: opt(cad.indDesFolha),
            indOptRegEletron: opt(cad.indOptRegEletron),
            iniValid: opt(bloco.idePeriodo?.iniValid),
          }
        }
        break
      }
      case "S-1005": {
        const info = n.infoEstab ?? {}
        const bloco = info.inclusao ?? info.alteracao ?? info.exclusao
        const ide = bloco?.ideEstab
        if (!ide) break
        const key = `${text(ide.tpInsc)}:${text(ide.nrInsc).replace(/[^0-9A-Za-z]/g, "").toUpperCase()}`
        estabelecimentos.set(key, {
          tpInsc: text(ide.tpInsc),
          nrInsc: text(ide.nrInsc).replace(/[^0-9A-Za-z]/g, "").toUpperCase(),
          cnaePrep: opt(bloco?.dadosEstab?.cnaePrep),
          iniValid: opt(ide.iniValid),
          fimValid: opt(ide.fimValid),
          excluido: !!info.exclusao,
        })
        break
      }
      case "S-2200": {
        const w = get(digits(n.trabalhador?.cpfTrab))
        w.eventos.push(e.kind)
        dadosPessoais(w, n.trabalhador)
        w.matricula = opt(n.vinculo?.matricula) ?? w.matricula
        w.dataAdmissao = eventDate(e) !== "0000" ? eventDate(e) : w.dataAdmissao
        w.dataDesligamento = null // nova admissão reabre o vínculo
        w.semVinculo = false
        contrato(w, n.vinculo?.infoContrato)
        break
      }
      case "S-2300": {
        const w = get(digits(n.trabalhador?.cpfTrab))
        w.eventos.push(e.kind)
        dadosPessoais(w, n.trabalhador)
        w.matricula = opt(n.infoTSVInicio?.matricula) ?? w.matricula
        w.codCategoria = opt(n.infoTSVInicio?.codCateg) ?? w.codCategoria
        w.dataAdmissao = opt(n.infoTSVInicio?.dtInicio) ?? w.dataAdmissao
        w.dataDesligamento = null
        w.semVinculo = true
        contrato(w, n.infoTSVInicio?.infoComplementares?.cargoFuncao)
        break
      }
      case "S-2205": {
        const w = get(digits(n.ideTrabalhador?.cpfTrab))
        w.eventos.push(e.kind)
        dadosPessoais(w, n.alteracao?.dadosTrabalhador)
        break
      }
      case "S-2206": {
        const w = get(digits(n.ideVinculo?.cpfTrab))
        w.eventos.push(e.kind)
        const mat = opt(n.ideVinculo?.matricula)
        if (!w.matricula || !mat || mat === w.matricula) {
          w.matricula = mat ?? w.matricula
          contrato(w, n.altContratual?.vinculo?.infoContrato)
        }
        break
      }
      case "S-2299": {
        const w = get(digits(n.ideVinculo?.cpfTrab))
        w.eventos.push(e.kind)
        const mat = opt(n.ideVinculo?.matricula)
        if (!w.matricula || !mat || mat === w.matricula) {
          w.matricula = mat ?? w.matricula
          w.dataDesligamento = opt(n.infoDeslig?.dtDeslig)
        }
        break
      }
      case "S-2399": {
        const w = get(digits(n.ideTrabSemVinculo?.cpfTrab))
        w.eventos.push(e.kind)
        w.dataDesligamento = opt(n.infoTSVTermino?.dtTerm)
        break
      }
      case "S-2230": {
        const w = get(digits(n.ideVinculo?.cpfTrab))
        w.eventos.push(e.kind)
        const ini = n.infoAfastamento?.iniAfastamento
        const fim = n.infoAfastamento?.fimAfastamento
        if (fim?.dtTermAfast) {
          w.afastamentoInicio = null
          w.afastamentoMotivo = null
        } else if (ini?.dtIniAfast) {
          w.afastamentoInicio = opt(ini.dtIniAfast)
          w.afastamentoMotivo = opt(ini.codMotAfast)
        }
        break
      }
      case "S-1200":
      case "S-1202": {
        const w = get(digits(n.ideTrabalhador?.cpfTrab))
        w.eventos.push(e.kind)
        // nmTrab/dtNascto só vêm quando o trabalhador não tem S-2200 (infoComplem)
        w.nome = w.nome ?? opt(n.ideTrabalhador?.infoComplem?.nmTrab)
        w.dataNascimento = w.dataNascimento ?? opt(n.ideTrabalhador?.infoComplem?.dtNascto)
        const perApur = text(n.ideEvento?.perApur)
        if (perApur && (!w.ultimoPerApur || perApur > w.ultimoPerApur)) w.ultimoPerApur = perApur
        if (!w.matricula) {
          for (const dm of arr<any>(n.dmDev)) {
            for (const est of arr<any>(dm.infoPerApur?.ideEstabLot ?? dm.infoPerApur?.ideEstab)) {
              for (const rem of arr<any>(est.remunPerApur)) {
                if (!w.matricula && opt(rem.matricula)) w.matricula = opt(rem.matricula)
              }
            }
            w.codCategoria = w.codCategoria ?? opt(dm.codCateg)
          }
        }
        break
      }
      case "S-2240":
        s2240Enviados++
        break
    }
  }

  const trabalhadores = [...workers.values()]
    .filter((w) => w.cpf.length === 11)
    .sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? ""))

  return {
    trabalhadores,
    empregador,
    estabelecimentos: [...estabelecimentos.values()],
    s2240Enviados,
    contagem,
    outroEmpregador,
    excluidos,
    retificados,
    exclusoesSemRecibo,
    sst: vigentes.filter((e) => e.kind === "S-2210" || e.kind === "S-2220" || e.kind === "S-2240"),
  }
}
