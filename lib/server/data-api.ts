import "server-only"
import { getPool, query } from "./db"
import { HttpError, accessibleCompanyIds } from "./access"
import type { SessionUser } from "./session"

/**
 * Executor das consultas feitas pelo navegador via lib/data-client.ts.
 * Substitui o PostgREST/RLS do Supabase: só tabelas listadas aqui são acessíveis,
 * toda leitura/escrita é limitada às empresas do usuário e os valores são sempre
 * parametrizados. Regras de negócio mais complexas ficam em rotas próprias.
 */

type Scope =
  | { kind: "self" } // a própria linha é a empresa (empresas.id)
  | { kind: "column"; column: string } // coluna com o id da empresa
  | { kind: "subquery"; sql: (companiesParam: string) => string } // acesso herdado de outra tabela

interface TableConfig {
  scope: Scope
  readOnly?: boolean
  noInsert?: boolean
  hidden?: string[] // nunca lidas nem gravadas pelo navegador
}

const EXPOSICOES_DA_EMPRESA = (p: string) => `SELECT id FROM exposicoes_trabalhador WHERE empresa_id = ANY(${p})`

const TABLES: Record<string, TableConfig> = {
  empresas: { scope: { kind: "self" } },
  funcionarios: { scope: { kind: "column", column: "empresa_id" } },
  epis: { scope: { kind: "column", column: "empresa_id" } },
  treinamentos: { scope: { kind: "column", column: "empresa_id" } },
  riscos_ocupacionais: { scope: { kind: "column", column: "empresa_id" } },
  biblioteca_documentos: { scope: { kind: "column", column: "empresa_id" }, noInsert: true, hidden: ["conteudo"] },
  esocial_eventos: { scope: { kind: "column", column: "empresa_id" }, noInsert: true },
  esocial_logs: {
    scope: { kind: "subquery", sql: (p) => `event_id IN (SELECT id FROM esocial_eventos WHERE empresa_id = ANY(${p}))` },
    readOnly: true,
  },
  certificates: {
    scope: { kind: "subquery", sql: (p) => `id IN (SELECT certificate_id FROM company_certificates WHERE company_id = ANY(${p}))` },
    noInsert: true,
    hidden: ["pfx_base64_encrypted"],
  },
  company_certificates: { scope: { kind: "column", column: "company_id" }, noInsert: true },
  responsaveis_registros_ambientais: { scope: { kind: "column", column: "empresa_id" } },
  ambientes_trabalho: { scope: { kind: "column", column: "empresa_id" } },
  exposicoes_trabalhador: { scope: { kind: "column", column: "empresa_id" } },
  exposicao_agentes: { scope: { kind: "subquery", sql: (p) => `exposicao_id IN (${EXPOSICOES_DA_EMPRESA(p)})` } },
  exposicao_agente_epis: {
    scope: {
      kind: "subquery",
      sql: (p) => `agente_id IN (SELECT id FROM exposicao_agentes WHERE exposicao_id IN (${EXPOSICOES_DA_EMPRESA(p)}))`,
    },
  },
  exposicao_responsaveis: { scope: { kind: "subquery", sql: (p) => `exposicao_id IN (${EXPOSICOES_DA_EMPRESA(p)})` } },
  dashboard_metricas_por_empresa: { scope: { kind: "column", column: "empresa_id" }, readOnly: true },
}

// Colunas preenchidas pelo servidor, ignoradas se vierem do navegador
const SERVER_MANAGED = new Set(["id", "created_at", "updated_at", "user_id", "created_by"])

export interface DataRequest {
  table: string
  action: "select" | "insert" | "update" | "delete"
  select?: string
  filters?: { column: string; op: "eq" | "neq" | "in" | "is"; value: unknown }[]
  order?: { column: string; ascending?: boolean }[]
  limit?: number
  values?: Record<string, unknown> | Record<string, unknown>[]
  returning?: string | null
  single?: "single" | "maybe"
}

const IDENT = /^[a-z_][a-z0-9_]*$/

let columnCache: Map<string, Set<string>> | null = null

async function tableColumns(table: string): Promise<Set<string>> {
  if (!columnCache) {
    const rows = await query<{ table_name: string; column_name: string }>(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'"
    )
    columnCache = new Map()
    for (const r of rows) {
      if (!columnCache.has(r.table_name)) columnCache.set(r.table_name, new Set())
      columnCache.get(r.table_name)!.add(r.column_name)
    }
  }
  const cols = columnCache.get(table)
  if (!cols) throw new HttpError(400, `Tabela desconhecida: ${table}`)
  return cols
}

function getConfig(table: string): TableConfig {
  const config = TABLES[table]
  if (!config) throw new HttpError(403, `Tabela não permitida: ${table}`)
  return config
}

async function assertColumn(table: string, column: string): Promise<void> {
  const config = getConfig(table)
  if (!IDENT.test(column) || !(await tableColumns(table)).has(column) || config.hidden?.includes(column)) {
    throw new HttpError(400, `Coluna inválida: ${table}.${column}`)
  }
}

async function visibleColumns(table: string): Promise<string[]> {
  const hidden = new Set(getConfig(table).hidden ?? [])
  return [...(await tableColumns(table))].filter((c) => !hidden.has(c))
}

/** Divide "a, b, rel:tabela(x, y)" nas vírgulas de nível zero. */
function splitTopLevel(input: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ""
  for (const ch of input) {
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (ch === "," && depth === 0) {
      parts.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

/**
 * Monta a lista de colunas. Aceita "*", colunas simples e relações
 * "alias:tabela(col1, col2)", resolvidas pela chave estrangeira <alias>_id.
 */
async function buildSelectList(table: string, select: string | undefined, alias: string): Promise<string> {
  const items = splitTopLevel(select?.trim() || "*")
  const parts: string[] = []
  for (const item of items) {
    if (item === "*") {
      parts.push(...(await visibleColumns(table)).map((c) => `${alias}."${c}"`))
      continue
    }
    const rel = item.match(/^([a-z_][a-z0-9_]*)\s*:\s*([a-z_][a-z0-9_]*)\s*\(([\s\S]*)\)$/)
    if (rel) {
      const [, relAlias, relTable, relSelect] = rel
      const fk = `${relAlias}_id`
      await assertColumn(table, fk)
      getConfig(relTable)
      const inner = await buildSelectList(relTable, relSelect, "r")
      parts.push(
        `(SELECT row_to_json(x) FROM (SELECT ${inner} FROM "${relTable}" r WHERE r.id = ${alias}."${fk}") x) AS "${relAlias}"`
      )
      continue
    }
    await assertColumn(table, item)
    parts.push(`${alias}."${item}"`)
  }
  return parts.join(", ")
}

class Params {
  values: unknown[] = []
  add(value: unknown): string {
    this.values.push(value)
    return `$${this.values.length}`
  }
}

function scopeCondition(config: TableConfig, alias: string, params: Params, companies: string[] | null): string | null {
  if (companies === null) return null
  const p = params.add(companies)
  switch (config.scope.kind) {
    case "self":
      return `${alias}.id = ANY(${p}::uuid[])`
    case "column":
      return `${alias}."${config.scope.column}" = ANY(${p}::uuid[])`
    case "subquery":
      return `${alias}.${config.scope.sql(`${p}::uuid[]`)}`
  }
}

async function buildWhere(
  table: string,
  req: DataRequest,
  alias: string,
  params: Params,
  companies: string[] | null
): Promise<string> {
  const conditions: string[] = []
  for (const f of req.filters ?? []) {
    await assertColumn(table, f.column)
    const col = `${alias}."${f.column}"`
    switch (f.op) {
      case "eq":
        conditions.push(`${col} = ${params.add(f.value)}`)
        break
      case "neq":
        conditions.push(`${col} IS DISTINCT FROM ${params.add(f.value)}`)
        break
      case "in":
        if (!Array.isArray(f.value)) throw new HttpError(400, "Filtro 'in' exige lista.")
        conditions.push(`${col}::text = ANY(${params.add(f.value.map(String))}::text[])`)
        break
      case "is":
        if (f.value !== null) throw new HttpError(400, "Filtro 'is' aceita apenas null.")
        conditions.push(`${col} IS NULL`)
        break
      default:
        throw new HttpError(400, "Operador de filtro inválido.")
    }
  }
  const scope = scopeCondition(getConfig(table), alias, params, companies)
  if (scope) conditions.push(scope)
  return conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
}

function assertCompanyValue(config: TableConfig, row: Record<string, unknown>, companies: string[] | null) {
  if (companies === null || config.scope.kind !== "column") return
  const value = row[config.scope.column]
  if (value !== undefined && !companies.includes(String(value))) {
    throw new HttpError(403, "Sem acesso a esta empresa.")
  }
}

function shapeResult(rows: any[], single: DataRequest["single"]) {
  if (single === "single") {
    if (rows.length !== 1) throw new HttpError(406, rows.length ? "Mais de um registro encontrado." : "Registro não encontrado.")
    return rows[0]
  }
  if (single === "maybe") return rows[0] ?? null
  return rows
}

export async function executeDataRequest(user: SessionUser, req: DataRequest): Promise<unknown> {
  const config = getConfig(req.table)
  const table = req.table
  const companies = await accessibleCompanyIds(user)
  const params = new Params()

  if (req.action === "select") {
    const cols = await buildSelectList(table, req.select, "t")
    const where = await buildWhere(table, req, "t", params, companies)
    const order: string[] = []
    for (const o of req.order ?? []) {
      await assertColumn(table, o.column)
      order.push(`t."${o.column}" ${o.ascending === false ? "DESC" : "ASC"}`)
    }
    const limit = req.limit ? `LIMIT ${Math.min(Math.max(1, Math.floor(req.limit)), 5000)}` : ""
    const sql = `SELECT ${cols} FROM "${table}" t ${where} ${order.length ? `ORDER BY ${order.join(", ")}` : ""} ${limit}`
    const { rows } = await getPool().query(sql, params.values)
    return shapeResult(rows, req.single)
  }

  if (config.readOnly) throw new HttpError(403, `Tabela somente leitura: ${table}`)
  const returning = req.returning === null || req.returning === undefined ? null : await buildSelectList(table, req.returning, `"${table}"`)

  if (req.action === "insert") {
    if (config.noInsert) throw new HttpError(403, `Inclusão em ${table} só pela rota própria.`)
    const rows = Array.isArray(req.values) ? req.values : [req.values ?? {}]
    if (!rows.length) return []
    const inserted: any[] = []
    const client = await getPool().connect()
    try {
      await client.query("BEGIN")
      for (const raw of rows) {
        const row: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(raw)) {
          if (SERVER_MANAGED.has(k)) continue
          await assertColumn(table, k)
          row[k] = v
        }
        assertCompanyValue(config, row, companies)
        const columns = await tableColumns(table)
        if (columns.has("user_id")) row.user_id = user.id
        if (columns.has("created_by")) row.created_by = user.id
        const keys = Object.keys(row)
        const p = new Params()
        const sql = `INSERT INTO "${table}" (${keys.map((k) => `"${k}"`).join(", ")})
                     VALUES (${keys.map((k) => p.add(row[k])).join(", ")})
                     RETURNING "${table}".id AS "__row_id"${returning ? `, ${returning}` : ""}`
        const { rows: [created] } = await client.query(sql, p.values)
        const { __row_id: rowId, ...rest } = created
        inserted.push(rest)
        // Quem cadastra a empresa vira owner dela
        if (table === "empresas") {
          await client.query(
            `INSERT INTO usuarios_empresas (user_id, empresa_id, role) VALUES ($1, $2, 'owner')
             ON CONFLICT (user_id, empresa_id) DO NOTHING`,
            [user.id, rowId]
          )
        }
      }
      await client.query("COMMIT")
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
    return returning ? shapeResult(inserted, req.single) : null
  }

  if (!req.filters?.length) throw new HttpError(400, "Atualização/exclusão exige filtro.")

  if (req.action === "update") {
    const values: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(req.values ?? {})) {
      if (SERVER_MANAGED.has(k)) continue
      await assertColumn(table, k)
      values[k] = v
    }
    assertCompanyValue(config, values, companies)
    const keys = Object.keys(values)
    if (!keys.length) throw new HttpError(400, "Nada para atualizar.")
    const set = keys.map((k) => `"${k}" = ${params.add(values[k])}`).join(", ")
    const where = await buildWhere(table, req, `"${table}"`, params, companies)
    const sql = `UPDATE "${table}" SET ${set} ${where} RETURNING ${returning ?? "id"}`
    const { rows } = await getPool().query(sql, params.values)
    return returning ? shapeResult(rows, req.single) : null
  }

  if (req.action === "delete") {
    const where = await buildWhere(table, req, `"${table}"`, params, companies)
    const sql = `DELETE FROM "${table}" ${where} RETURNING ${returning ?? "id"}`
    const { rows } = await getPool().query(sql, params.values)
    return returning ? shapeResult(rows, req.single) : null
  }

  throw new HttpError(400, "Ação inválida.")
}
