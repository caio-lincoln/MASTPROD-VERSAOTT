// Cria (ou atualiza a senha de) um usuário de acesso.
// Uso: node scripts/create-user.mjs <email> <senha> [nome] [role]
//   role: admin (vê todas as empresas) | user (só empresas vinculadas). Padrão: admin.
// Sem argumentos, usa SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD do .env.local.
import { readFileSync, existsSync } from "node:fs"
import bcrypt from "bcryptjs"
import pg from "pg"

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}

const [, , argEmail, argPassword, argName, argRole] = process.argv
const email = (argEmail || process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase()
const password = argPassword || process.env.SEED_ADMIN_PASSWORD
const nome = argName || "Administrador"
const role = argRole || "admin"

if (!email || !password) {
  console.error("Uso: node scripts/create-user.mjs <email> <senha> [nome] [admin|user]")
  process.exit(1)
}

const url = process.env.DATABASE_URL
const client = new pg.Client({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1|\.railway\.internal/.test(url) ? false : { rejectUnauthorized: false },
})
await client.connect()
const hash = await bcrypt.hash(password, 12)
await client.query(
  `INSERT INTO app_users (email, nome, senha_hash, role)
   VALUES ($1, $2, $3, $4)
   ON CONFLICT (email) DO UPDATE SET senha_hash = EXCLUDED.senha_hash, role = EXCLUDED.role, ativo = TRUE`,
  [email, nome, hash, role]
)
await client.end()
console.log(`Usuário ${email} (${role}) pronto.`)
