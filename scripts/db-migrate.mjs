// Aplica db/migrations/*.sql em ordem, registrando em schema_migrations.
// Usa DATABASE_URL (lido de .env.local quando existir). No Railway, rode como pre-deploy.
import { readdirSync, readFileSync, existsSync } from "node:fs"
import path from "node:path"
import pg from "pg"

loadEnvFile(".env.local")

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL não definida.")
  process.exit(1)
}

const client = new pg.Client({ connectionString: url, ssl: sslFor(url) })
await client.connect()

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`)
  const { rows } = await client.query("SELECT name FROM schema_migrations")
  const applied = new Set(rows.map((r) => r.name))

  const dir = path.resolve("db", "migrations")
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = readFileSync(path.join(dir, file), "utf8")
    console.log(`Aplicando ${file}...`)
    await client.query("BEGIN")
    try {
      await client.query(sql)
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file])
      await client.query("COMMIT")
    } catch (err) {
      await client.query("ROLLBACK")
      throw new Error(`${file}: ${err.message}`)
    }
  }
  console.log("Migrations em dia.")
} finally {
  await client.end()
}

function sslFor(connectionString) {
  return /localhost|127\.0\.0\.1|\.railway\.internal/.test(connectionString) ? false : { rejectUnauthorized: false }
}

function loadEnvFile(file) {
  if (!existsSync(file)) return
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}
