"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Download, FileArchive, Info } from "lucide-react"
import { toast } from "sonner"
import { db } from "@/lib/data-client"

interface Props {
  isOpen: boolean
  onClose: () => void
  onImported?: () => void
}

interface Linha {
  cpf: string
  nome: string | null
  matricula: string | null
  cargo: string | null
  dataAdmissao: string | null
  dataDesligamento: string | null
  situacao: "novo" | "atualizado" | "sem_alteracao"
  avisos: string[]
}

interface Resultado {
  empresa: { razaoSocial: string; cnpj: string }
  arquivosLidos: number
  arquivosIgnorados: number
  erros: string[]
  eventos: Record<string, number>
  eventosDeOutroEmpregador: number
  eventosExcluidos: number
  eventosRetificados: number
  exclusoesSemRecibo: number
  s2240JaEnviados: number
  estabelecimentos: number
  sst: { tipo: string; novos: number; jaImportados: number }[]
  sstSemTrabalhador: number
  empregadorExtraido: { nome: string | null; natJurid: string | null; cidade: string | null; uf: string | null } | null
  totais: { trabalhadores: number; novos: number; atualizados: number; semAlteracao: number; ativos: number; desligados: number; semMatricula: number }
  linhas: Linha[]
  gravado: boolean
}

const SITUACAO = {
  novo: { label: "Novo", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  atualizado: { label: "Atualiza", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  sem_alteracao: { label: "Igual", cls: "bg-slate-50 text-slate-600 border-slate-200" },
} as const

const fmtData = (d: string | null) => (d ? d.split("-").reverse().join("/") : "-")
const fmtCpf = (c: string) => c.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")

export default function EsocialImportModal({ isOpen, onClose, onImported }: Props) {
  const [empresas, setEmpresas] = useState<{ id: string; razao_social: string; cnpj: string }[]>([])
  const [empresaId, setEmpresaId] = useState("")
  const [arquivos, setArquivos] = useState<File[]>([])
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState<"" | "analisar" | "gravar">("")
  const [erro, setErro] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<"todos" | "novo" | "atualizado" | "avisos">("todos")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    db.from("empresas").select("id, razao_social, cnpj").order("razao_social").then(({ data }) => setEmpresas(data || []))
  }, [isOpen])

  const reset = () => {
    setArquivos([])
    setResultado(null)
    setErro(null)
    setFiltro("todos")
    if (inputRef.current) inputRef.current.value = ""
  }

  const fechar = () => {
    if (loading) return
    reset()
    setEmpresaId("")
    onClose()
  }

  const enviar = async (gravar: boolean) => {
    if (!empresaId || !arquivos.length) {
      setErro("Escolha a empresa e os arquivos.")
      return
    }
    setErro(null)
    setLoading(gravar ? "gravar" : "analisar")
    try {
      const form = new FormData()
      form.append("empresaId", empresaId)
      form.append("gravar", gravar ? "1" : "0")
      arquivos.forEach((f) => form.append("arquivos", f))
      const res = await fetch("/api/esocial/import", { method: "POST", body: form })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.error?.message || `Erro HTTP ${res.status}`)
      setResultado(body)
      if (gravar) {
        toast.success(`Importação concluída: ${body.totais.novos} novos, ${body.totais.atualizados} atualizados.`)
        onImported?.()
      }
    } catch (err: any) {
      setErro(err.message || "Falha na importação.")
    } finally {
      setLoading("")
    }
  }

  const linhasFiltradas = useMemo(() => {
    const linhas = resultado?.linhas ?? []
    if (filtro === "todos") return linhas
    if (filtro === "avisos") return linhas.filter((l) => l.avisos.length)
    return linhas.filter((l) => l.situacao === filtro)
  }, [resultado, filtro])

  const tamanhoTotal = arquivos.reduce((s, f) => s + f.size, 0)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && fechar()}>
      <DialogContent className="bg-background border-border text-foreground w-[calc(100vw-2rem)] max-w-5xl sm:max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="w-5 h-5 text-primary" />
            Importar trabalhadores do eSocial
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Use o ZIP baixado no portal do eSocial (Empregador Web → Download) ou os XMLs dos eventos S-2200, S-2205,
            S-2206, S-2230, S-2299, S-2300, S-1200, S-1202 e S-3000. Nada é gravado antes de você conferir a prévia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 min-w-0">
              <Label>Empresa *</Label>
              <Select
                value={empresaId || undefined}
                onValueChange={(v) => {
                  if (!v) return
                  setEmpresaId(v)
                  setResultado(null)
                }}
              >
                <SelectTrigger className="w-full min-w-0 bg-white [&>span]:truncate">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.razao_social} ({e.cnpj})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 min-w-0">
              <Label>Arquivos (.zip ou .xml) *</Label>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".zip,.xml,application/zip,text/xml,application/xml"
                onChange={(e) => {
                  setArquivos(Array.from(e.target.files ?? []))
                  setResultado(null)
                }}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary"
              />
              {arquivos.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileArchive className="w-3 h-3" /> {arquivos.length} arquivo(s), {(tamanhoTotal / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>
          </div>

          <Alert className="bg-slate-50 border-border">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p>
                Dica: o <strong>S-1200 do último mês</strong> traz todos os trabalhadores que receberam salário (CPF e matrícula). Os{" "}
                <strong>S-2200</strong> completam nome, cargo e admissão. Quanto mais eventos no ZIP, mais completo o cadastro.
              </p>
            </AlertDescription>
          </Alert>

          {erro && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-700" />
              <AlertTitle className="text-red-700">Não foi possível importar</AlertTitle>
              <AlertDescription className="text-red-700 text-sm whitespace-pre-line">{erro}</AlertDescription>
            </Alert>
          )}

          {resultado && (
            <div className="space-y-4">
              {resultado.gravado && (
                <Alert className="bg-emerald-50 border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <AlertTitle className="text-emerald-700">Importação gravada</AlertTitle>
                  <AlertDescription className="text-emerald-700 text-sm">
                    Os trabalhadores de {resultado.empresa.razaoSocial} já aparecem na lista e no formulário do S-2240.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Trabalhadores", resultado.totais.trabalhadores],
                  ["Novos", resultado.totais.novos],
                  ["Atualizados", resultado.totais.atualizados],
                  ["Desligados", resultado.totais.desligados],
                ].map(([label, valor]) => (
                  <div key={label} className="rounded-lg border border-border bg-white p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold">{valor}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                {resultado.arquivosLidos} XML(s) lidos ·{" "}
                {Object.entries(resultado.eventos)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ") || "nenhum evento de trabalhador"}
                {resultado.estabelecimentos > 0 && ` · ${resultado.estabelecimentos} estabelecimento(s)`}
                {resultado.eventosExcluidos > 0 && ` · ${resultado.eventosExcluidos} excluído(s) por S-3000`}
                {resultado.eventosRetificados > 0 && ` · ${resultado.eventosRetificados} retificado(s)`}
              </p>

              {resultado.empregadorExtraido && (resultado.empregadorExtraido.nome || resultado.empregadorExtraido.natJurid) && (
                <p className="text-sm">
                  Empregador no eSocial: <strong>{resultado.empregadorExtraido.nome ?? resultado.empresa.razaoSocial}</strong>
                  {resultado.empregadorExtraido.natJurid && ` · natureza jurídica ${resultado.empregadorExtraido.natJurid}`}
                  {resultado.empregadorExtraido.cidade && ` · ${resultado.empregadorExtraido.cidade}/${resultado.empregadorExtraido.uf ?? ""}`}
                  <span className="text-muted-foreground"> (completa os campos vazios do cadastro)</span>
                </p>
              )}

              {resultado.sst.some((s) => s.novos + s.jaImportados > 0) && (
                <div className="rounded-lg border border-border bg-white p-3 text-sm">
                  <p className="font-medium mb-1">Histórico de SST já enviado ao eSocial</p>
                  <ul className="text-muted-foreground space-y-0.5">
                    {resultado.sst
                      .filter((s) => s.novos + s.jaImportados > 0)
                      .map((s) => (
                        <li key={s.tipo}>
                          {s.tipo === "S-2240" ? "S-2240 (condições ambientais)" : s.tipo === "S-2220" ? "S-2220 (ASO)" : "S-2210 (CAT)"}:{" "}
                          <strong>{s.novos}</strong> novo(s){s.jaImportados > 0 && `, ${s.jaImportados} já importado(s)`}
                        </li>
                      ))}
                  </ul>
                  {resultado.sstSemTrabalhador > 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      {resultado.sstSemTrabalhador} evento(s) de trabalhador sem cadastro: ele será criado com o CPF.
                    </p>
                  )}
                </div>
              )}

              {(resultado.eventosDeOutroEmpregador > 0 || resultado.exclusoesSemRecibo > 0 || resultado.totais.semMatricula > 0 || resultado.erros.length > 0) && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-700" />
                  <AlertDescription className="text-amber-800 text-sm space-y-1">
                    {resultado.eventosDeOutroEmpregador > 0 && (
                      <p>{resultado.eventosDeOutroEmpregador} evento(s) de outro CNPJ foram ignorados.</p>
                    )}
                    {resultado.exclusoesSemRecibo > 0 && (
                      <p>
                        {resultado.exclusoesSemRecibo} exclusão(ões) S-3000 não puderam ser aplicadas porque o evento original veio sem
                        recibo; confira esses trabalhadores.
                      </p>
                    )}
                    {resultado.totais.semMatricula > 0 && (
                      <p>{resultado.totais.semMatricula} trabalhador(es) sem matrícula: o S-2240 deles exige a matrícula.</p>
                    )}
                    {resultado.erros.map((e) => (
                      <p key={e}>{e}</p>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["todos", "Todos"],
                    ["novo", "Novos"],
                    ["atualizado", "Atualizados"],
                    ["avisos", "Com avisos"],
                  ] as const
                ).map(([v, l]) => (
                  <Button key={v} type="button" size="sm" variant={filtro === v ? "default" : "outline"} onClick={() => setFiltro(v)}>
                    {l}
                  </Button>
                ))}
              </div>

              <div className="rounded-lg border border-border overflow-x-auto bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="p-2">Nome</th>
                      <th className="p-2">CPF</th>
                      <th className="p-2">Matrícula</th>
                      <th className="p-2">Cargo</th>
                      <th className="p-2">Admissão</th>
                      <th className="p-2">Desligamento</th>
                      <th className="p-2">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasFiltradas.slice(0, 300).map((l) => (
                      <tr key={l.cpf} className="border-t border-border align-top">
                        <td className="p-2">
                          {l.nome ?? <span className="text-muted-foreground">(sem nome)</span>}
                          {l.avisos.map((a) => (
                            <p key={a} className="text-xs text-amber-700">{a}</p>
                          ))}
                        </td>
                        <td className="p-2 whitespace-nowrap">{fmtCpf(l.cpf)}</td>
                        <td className="p-2">{l.matricula ?? "-"}</td>
                        <td className="p-2">{l.cargo ?? "-"}</td>
                        <td className="p-2 whitespace-nowrap">{fmtData(l.dataAdmissao)}</td>
                        <td className="p-2 whitespace-nowrap">{fmtData(l.dataDesligamento)}</td>
                        <td className="p-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${SITUACAO[l.situacao].cls}`}>
                            {SITUACAO[l.situacao].label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {linhasFiltradas.length > 300 && (
                  <p className="p-2 text-xs text-muted-foreground">Mostrando 300 de {linhasFiltradas.length}. Todos serão importados.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={fechar} disabled={!!loading}>
            {resultado?.gravado ? "Fechar" : "Cancelar"}
          </Button>
          {!resultado?.gravado && (
            resultado ? (
              <Button type="button" onClick={() => enviar(true)} disabled={!!loading || !resultado.totais.trabalhadores}>
                {loading === "gravar" ? "Gravando..." : `Confirmar importação (${resultado.totais.novos + resultado.totais.atualizados})`}
              </Button>
            ) : (
              <Button type="button" onClick={() => enviar(false)} disabled={!!loading || !empresaId || !arquivos.length}>
                {loading === "analisar" ? "Analisando..." : "Analisar arquivos"}
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
