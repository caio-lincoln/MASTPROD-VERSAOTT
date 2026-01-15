import https from "https"
import { URL } from "url"

export async function sendSoapRequest(
  endpoint: string,
  soapAction: string,
  xmlBody: string,
  cert: { pfx: Buffer; passphrase: string }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint)
    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: soapAction,
        "Content-Length": Buffer.byteLength(xmlBody),
      },
      pfx: cert.pfx,
      passphrase: cert.passphrase,
      // Garante que o Node.js confie na cadeia de certificação do governo (ICP-Brasil)
      // Em alguns ambientes pode ser necessário adicionar a cadeia de CA, mas geralmente o Node já tem.
      rejectUnauthorized: true, 
    }

    const req = https.request(options, (res) => {
      let data = ""
      res.setEncoding("utf8")
      
      res.on("data", (chunk) => {
        data += chunk
      })

      res.on("end", () => {
        // Se recebermos 403 ou outros erros HTTP, retornamos o corpo mesmo assim
        // para que a aplicação possa tratar (ex: mostrar mensagem de erro)
        // O status code pode ser útil, mas o contrato atual espera string.
        // Se quiser lançar erro no 403, podemos checar res.statusCode
        resolve(data)
      })
    })

    req.on("error", (err) => {
      reject(new Error(`Erro de rede na comunicação com eSocial: ${err.message}`))
    })

    // Timeout de 60 segundos
    req.setTimeout(60000, () => {
      req.destroy(new Error("Timeout na conexão com eSocial"))
    })

    req.write(xmlBody)
    req.end()
  })
}
