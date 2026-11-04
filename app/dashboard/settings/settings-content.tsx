"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Upload, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { DashboardHeader, ContentContainer } from "@/app/dashboard/esocial/components/visual-components"
import { Choice } from "@/components/esocial-form-parts"
import { db } from "@/lib/data-client"

interface Props {
  environment: "production" | "homologation"
  leiaute: string
  verProc: string
}

interface CertRow {
  is_default: boolean
  certificate: { id: string; name: string; valid_from: string | null; valid_to: string | null; created_at: string } | null
}

const DIA = 24 * 60 * 60 * 1000

function situacao(validTo: string | null) {
  if (!validTo) return { label: "Validade desconhecida", cls: "text-muted-foreground", icon: AlertTriangle }
  const dias = Math.floor((new Date(validTo).getTime() - Date.now()) / DIA)
  if (dias < 0) return { label: "Vencido", cls: "text-destructive", icon: XCircle }
  if (dias <= 30) return { label: `Vence em ${dias} dia(s)`, cls: "text-amber-600", icon: AlertTriangle }
  return { label: "Válido", cls: "text-emerald-700", icon: CheckCircle2 }
}

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "-")

export default function SettingsContent({ environment, leiaute, verProc }: Props) {
  const [empresas, setEmpresas] = useState<{ id: string; razao_social: string; cnpj: string }[]>([])
  const [empresaId, setEmpresaId] = useState("")
  const [certs, setCerts] = useState<CertRow[]>([])
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [senha, setSenha] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  useEffect(() => {
    db.from("empresas")
      .select("id, razao_social, cnpj")
      .order("razao_social")
      .then(({ data }) => {
        setEmpresas(data || [])
        if (data?.length === 1) setEmpresaId(data[0].id)
      })
  }, [])

  const carregarCerts = async (id: string) => {
    const { data } = await db
      .from("company_certificates")
      .select("is_default, certificate:certificates(id, name, valid_from, valid_to, created_at)")
      .eq("company_id", id)
    const rows = ((data || []) as CertRow[]).sort((a, b) => Number(b.is_default) - Number(a.is_default))
    setCerts(rows)
  }

  useEffect(() => {
    if (empresaId) carregarCerts(empresaId)
    else setCerts([])
  }, [empresaId])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId || !arquivo || !senha) {
      toast.error("Escolha a empresa, o arquivo do certificado e informe a senha.")
      return
    }
    setEnviando(true)
    try {
      const bytes = new Uint8Array(await arquivo.arrayBuffer())
      let binary = ""
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
      const empresa = empresas.find((x) => x.id === empresaId)
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: empresaId, name: `${empresa?.razao_social ?? "Empresa"} - Certificado`, pfxBase64: btoa(binary), password: senha }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.error?.message || "Erro ao cadastrar certificado.")
      const doc: string | null = body?.info?.documento ?? null
      const cnpjEmpresa = (empresa?.cnpj ?? "").replace(/[^0-9A-Za-z]/g, "").toUpperCase()
      if (doc && cnpjEmpresa && doc !== cnpjEmpresa) {
        toast.warning(`Certificado cadastrado, mas é de outro documento (${doc}). Para transmitir por terceiros é preciso procuração eletrônica.`)
      } else {
        toast.success(`Certificado cadastrado como padrão (válido até ${fmt(body?.info?.validTo)}).`)
      }
      setArquivo(null)
      setSenha("")
      setInputKey((k) => k + 1) // limpa o campo de arquivo
      await carregarCerts(empresaId)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const padrao = certs.find((c) => c.is_default)?.certificate ?? null
  const sitPadrao = situacao(padrao?.valid_to ?? null)

  return (
    <div className="space-y-6">
      <DashboardHeader title="Configurações" subtitle="Certificados digitais e informações do sistema" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentContainer className="border-0 bg-transparent p-0 shadow-none h-full">
          <div className="p-6 rounded-xl bg-white border border-border h-full space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-primary" />
                Certificado digital (eSocial)
              </h3>
              <p className="text-muted-foreground text-sm">
                Certificado A1 (.pfx/.p12) usado para assinar e transmitir os eventos de cada empresa.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Choice
                value={empresaId}
                onChange={setEmpresaId}
                options={empresas.map((e) => [e.id, `${e.razao_social} (${e.cnpj})`] as const)}
                placeholder="Selecione a empresa"
              />
            </div>

            {empresaId && (
              <div className="p-4 rounded-xl bg-slate-50 border border-border">
                <div className="flex items-center gap-3">
                  <sitPadrao.icon className={`w-5 h-5 ${padrao ? sitPadrao.cls : "text-destructive"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {padrao ? `${padrao.name}` : "Nenhum certificado padrão"}
                    </p>
                    <p className={`text-xs ${padrao ? sitPadrao.cls : "text-muted-foreground"}`}>
                      {padrao ? `${sitPadrao.label} · válido de ${fmt(padrao.valid_from)} até ${fmt(padrao.valid_to)}` : "Cadastre o certificado abaixo para poder transmitir."}
                    </p>
                  </div>
                </div>
                {certs.length > 1 && (
                  <ul className="mt-3 text-xs text-muted-foreground space-y-1">
                    {certs
                      .filter((c) => !c.is_default && c.certificate)
                      .map((c) => (
                        <li key={c.certificate!.id}>
                          Anterior: {c.certificate!.name} · até {fmt(c.certificate!.valid_to)} ({situacao(c.certificate!.valid_to).label})
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            <form onSubmit={enviar} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="certificate" className="text-muted-foreground">Novo certificado (.pfx ou .p12)</Label>
                <Input
                  key={inputKey}
                  id="certificate"
                  type="file"
                  accept=".pfx,.p12"
                  onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                  className="bg-white border-border text-foreground cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground">Senha do certificado</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="off"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite a senha"
                  className="bg-white border-border text-foreground"
                />
              </div>
              <Button type="submit" disabled={enviando || !empresaId} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Upload className="w-4 h-4 mr-2" />
                {enviando ? "Validando..." : "Cadastrar como certificado padrão"}
              </Button>
              <p className="text-xs text-muted-foreground">
                O arquivo e a senha são validados e guardados cifrados (AES-256); nunca voltam para o navegador.
              </p>
            </form>
          </div>
        </ContentContainer>

        <ContentContainer className="border-0 bg-transparent p-0 shadow-none h-full">
          <div className="p-6 rounded-xl bg-white border border-border h-full">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1">Informações do Sistema</h3>
              <p className="text-muted-foreground text-sm">Ambiente de transmissão e versões</p>
            </div>
            <div className="space-y-3">
              {[
                ["Ambiente eSocial", environment === "production" ? "PRODUÇÃO (envios valem oficialmente)" : "Produção restrita (testes)"],
                // v_S_01_03_00 -> S-1.3
                ["Leiaute dos eventos", `S-${leiaute.match(/(\d+)_(\d+)/)?.slice(1, 3).map(Number).join(".") ?? leiaute}`],
                ["Versão do aplicativo (verProc)", verProc],
              ].map(([k, v]) => (
                <div key={k} className="p-4 rounded-xl bg-slate-50 border border-border flex justify-between items-center gap-4">
                  <span className="text-sm text-muted-foreground">{k}</span>
                  <span className={`text-sm font-medium text-right ${k === "Ambiente eSocial" && environment === "production" ? "text-red-700" : "text-foreground"}`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ContentContainer>
      </div>
    </div>
  )
}
