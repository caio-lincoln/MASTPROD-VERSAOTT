import "server-only"
import { Pool, types, type PoolClient, type QueryResultRow } from "pg"

// DATE como texto "AAAA-MM-DD": evita deslocamento de dia por fuso horário
types.setTypeParser(1082, (value) => value)

// Pool único por processo (sobrevive ao hot reload do Next em dev)
const globalForDb = globalThis as unknown as { mastprodPool?: Pool }

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada.")
  }
  const isLocal = /localhost|127\.0\.0\.1|\.railway\.internal/.test(connectionString)
  return new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
  })
}

export function getPool(): Pool {
  if (!globalForDb.mastprodPool) {
    globalForDb.mastprodPool = createPool()
  }
  return globalForDb.mastprodPool
}

export async function query<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query<T>(text, params)
  return result.rows
}

export async function queryOne<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}
