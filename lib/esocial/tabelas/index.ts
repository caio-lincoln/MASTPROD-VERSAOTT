/**
 * Tabelas oficiais do eSocial (leiaute S-1.3, consolidado até a NT 07/2026 rev. 24/09/2026),
 * extraídas de gov.br/esocial › Documentação técnica › Tabelas.
 * A Tabela 16 foi extinta: situação geradora e agente causador de doença estão na Tabela 15.
 */
import t13 from "./tabela-13.json"
import t14 from "./tabela-14.json"
import t15 from "./tabela-15.json"
import t17 from "./tabela-17.json"
import t24 from "./tabela-24.json"
import t27 from "./tabela-27.json"

export interface ItemTabela {
  codigo: string
  descricao: string
  grupo?: string
}

export const TABELAS = {
  "13": { titulo: "Tabela 13 - Parte do corpo atingida", itens: t13 as ItemTabela[] },
  "14": { titulo: "Tabela 14 - Agente causador do acidente de trabalho", itens: t14 as ItemTabela[] },
  "15": { titulo: "Tabela 15 - Situação geradora do acidente / agente causador e situação geradora de doença", itens: t15 as ItemTabela[] },
  "17": { titulo: "Tabela 17 - Natureza da lesão", itens: t17 as ItemTabela[] },
  "24": { titulo: "Tabela 24 - Agentes nocivos e atividades (aposentadoria especial)", itens: t24 as ItemTabela[] },
  "27": { titulo: "Tabela 27 - Procedimentos diagnósticos", itens: t27 as ItemTabela[] },
} as const

export type NumeroTabela = keyof typeof TABELAS

const indices = new Map<string, Map<string, ItemTabela>>()

export function itemDaTabela(tabela: NumeroTabela, codigo: string | null | undefined): ItemTabela | null {
  if (!codigo) return null
  let idx = indices.get(tabela)
  if (!idx) {
    idx = new Map(TABELAS[tabela].itens.map((i) => [i.codigo, i]))
    indices.set(tabela, idx)
  }
  return idx.get(codigo) ?? null
}

export const existeNaTabela = (tabela: NumeroTabela, codigo: string | null | undefined) => !!itemDaTabela(tabela, codigo)
