// Banco PostgreSQL local para desenvolvimento (cluster próprio em .localdb/, porta 5433).
// Uso: node scripts/localdb.mjs <init|start|stop|status>
// Binários: variável PG_BIN ou o PostgreSQL 18 padrão do Windows.
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"

const PG_BIN = process.env.PG_BIN || "C:\\Program Files\\PostgreSQL\\18\\bin"
const DATA_DIR = path.resolve(".localdb", "data")
const LOG_FILE = path.resolve(".localdb", "postgres.log")
const PORT = process.env.LOCALDB_PORT || "5433"
const DB_NAME = "mastprod"

const bin = (name) => path.join(PG_BIN, process.platform === "win32" ? `${name}.exe` : name)
const run = (name, args) => execFileSync(bin(name), args, { stdio: "inherit" })

function isRunning() {
  try {
    execFileSync(bin("pg_ctl"), ["-D", DATA_DIR, "status"], { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

function start() {
  if (!existsSync(DATA_DIR)) {
    console.error("Cluster não inicializado. Rode: npm run db:init")
    process.exit(1)
  }
  if (isRunning()) {
    console.log(`PostgreSQL local já está rodando na porta ${PORT}.`)
    return
  }
  // stdio "ignore": no Windows o postgres herdaria o terminal e o comando nunca terminaria
  execFileSync(bin("pg_ctl"), ["-D", DATA_DIR, "-o", `-p ${PORT}`, "-l", LOG_FILE, "-w", "start"], { stdio: "ignore" })
  console.log(`PostgreSQL local rodando na porta ${PORT}.`)
}

const command = process.argv[2]

switch (command) {
  case "init":
    if (existsSync(DATA_DIR)) {
      console.log("Cluster já existe em .localdb/data.")
    } else {
      run("initdb", ["-D", DATA_DIR, "-U", "postgres", "-A", "trust", "-E", "UTF8", "--locale=C"])
    }
    start()
    try {
      run("createdb", ["-h", "localhost", "-p", PORT, "-U", "postgres", DB_NAME])
    } catch {
      console.log(`Banco "${DB_NAME}" já existe.`)
    }
    console.log(`\nDATABASE_URL=postgres://postgres@localhost:${PORT}/${DB_NAME}`)
    break
  case "start":
    start()
    break
  case "stop":
    if (isRunning()) run("pg_ctl", ["-D", DATA_DIR, "-m", "fast", "stop"])
    break
  case "status":
    console.log(isRunning() ? `Rodando na porta ${PORT}` : "Parado")
    break
  default:
    console.log("Uso: node scripts/localdb.mjs <init|start|stop|status>")
}
