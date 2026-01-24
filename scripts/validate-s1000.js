const fs = require("fs")
const path = require("path")
const xsd = require("libxml-xsd")

const xmlPath = process.argv[2]

if (!xmlPath) {
  console.error("Uso: node scripts/validate-s1000.js caminho/do/arquivo-s1000.xml")
  process.exit(1)
}

const xmlContent = fs.readFileSync(xmlPath, "utf8")

const schemaPath = path.join(process.cwd(), "biblioteca", "xsds 1.2", "evtInfoEmpregador.xsd")

xsd.parseFile(schemaPath, (err, schema) => {
  if (err) {
    console.error("Erro ao carregar XSD S-1000:", err)
    process.exit(1)
  }

  schema.validate(xmlContent, (err2, validationErrors) => {
    if (err2) {
      console.error("Erro técnico na validação XSD:", err2)
      process.exit(1)
    }

    if (!validationErrors || validationErrors.length === 0) {
      console.log("XML S-1000 VÁLIDO segundo o XSD evtInfoEmpregador.v_S_01_02_00")
      process.exit(0)
    }

    console.error("XML S-1000 INVÁLIDO segundo o XSD. Erros:")
    for (const vErr of validationErrors) {
      console.error("-", vErr.message || vErr)
    }
    process.exit(1)
  })
})

