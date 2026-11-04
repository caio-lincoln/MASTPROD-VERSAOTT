"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Info, Layers } from "lucide-react"
import { db } from "@/lib/data-client"
import { Choice, ErrorList, Field, Section, TextInput } from "./esocial-form-parts"

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

interface Pendente {
  id: string // vínculo
  funcionarioId: string
  nome: string
  cpf: string
  matricula: string
  cargo: string | null
  dataAdmissao: string | null
  anterior: { exposicaoId: string; setor: string; agentes: string; dtIni: string } | null
}

interface Modelo {
  exposicaoId: string
  setor: string
  atividade: string
  agentes: string
  total: number
}

interface Responsavel {
  id: string
  nome: string
  cpf: string
  ide_oc: string | null
  nr_oc: string | null
  uf_oc: string | null
}

interface Resultado {
  gerados: number
  falhas: { vinculoId: string; nome: string; erros: string[] }[]
}

const fmtData = (d: string | null) => (d ? d.split("-").reverse().join("/") : "-")

export default function S2240BatchModal({ isOpen, onClose, onCreated }: Props) {
  const [empresas, setEmpresas] = useState<{ id: string; razao_social: string; cnpj: string }[]>([])
  const [empresaId, setEmpresaId] = useState("")
  const [pendentes, setPendentes] = useState<Pendente[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [filtro, setFiltro] = useState("")
  const [copiarAnterior, setCopiarAnterior] = useState(true)
  const [modeloId, setModeloId] = useState("")
  const [tipoData, setTipoData] = useState<"admissao" | "fixa">("admissao")
  const [dataFixa, setDataFixa] = useState("")
  const [dataMinima, setDataMinima] = useState("")
  const [respOverride, setRespOverride] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [erros, setErros] = useState<string[]>([])
  const [resultado, setResultado] = useState<Resultado | null>(null)

  useEffect(() => {
    if (!isOpen) return
    db.from("empresas").select("id, razao_social, cnpj").order("razao_social").then(({ data }) => setEmpresas(data || []))
  }, [isOpen])

  const carregar = async (id: string) => {
    setCarregando(true)
    setErros([])
    setResultado(null)
    try {
      const res = await fetch(`/api/esocial/s2240/lote?empresaId=${id}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error?.message || "Erro ao carregar pendências.")
      setPendentes(body.pendentes)
      setModelos(body.modelos)
      setResponsaveis(body.responsaveis)
      setSelecionados(new Set(body.pendentes.map((p: Pendente) => p.id)))
      setModeloId(body.modelos[0]?.exposicaoId ?? "")
      setRespOverride([])
      setDataMinima(body.dataMinimaSugerida ?? "")
    } catch (err: any) {
      setErros([err.message])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (empresaId) carregar(empresaId)
  }, [empresaId])

  const visiveis = useMemo(() => {
    const f = filtro.trim().toLowerCase()
    if (!f) return pendentes
    return pendentes.filter((p) =>
      [p.nome, p.cpf, p.matricula, p.cargo ?? "", p.anterior?.setor ?? ""].some((v) => v.toLowerCase().includes(f))
    )
  }, [pendentes, filtro])

  const selecionadosLista = pendentes.filter((p) => selecionados.has(p.id))
  const usamModelo = selecionadosLista.filter((p) => !(copiarAnterior && p.anterior)).length
  const todosVisiveisMarcados = visiveis.length > 0 && visiveis.every((p) => selecionados.has(p.id))

  const alternarVisiveis = () => {
    const next = new Set(selecionados)
    for (const p of visiveis) {
      if (todosVisiveisMarcados) next.delete(p.id)
      else next.add(p.id)
    }
    setSelecionados(next)
  }

  const gerar = async () => {
    setErros([])
    if (!selecionadosLista.length) return setErros(["Selecione ao menos um trabalhador."])
    if (usamModelo && !modeloId) return setErros(["Escolha o modelo para quem não tem S-2240 anterior."])
    if (tipoData === "fixa" && !dataFixa) return setErros(["Informe a data de início."])
    setGerando(true)
    try {
      const res = await fetch("/api/esocial/s2240/lote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresaId,
          vinculoIds: selecionadosLista.map((p) => p.id),
          copiarAnterior,
          modeloExposicaoId: modeloId || null,
          dataInicio: tipoData === "fixa" ? { tipo: "fixa", data: dataFixa } : { tipo: "admissao" },
          responsavelIds: respOverride.length ? respOverride : null,
          dataMinima: dataMinima || null,
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error?.message || "Erro ao gerar o lote.")
      setResultado(body)
      onCreated?.()
      await carregar(empresaId)
    } catch (err: any) {
      setErros([err.message])
    } finally {
      setGerando(false)
    }
  }

  const fechar = () => {
    if (gerando) return
    setEmpresaId("")
    setPendentes([])
    setResultado(null)
    setErros([])
    setFiltro("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && fechar()}>
      <DialogContent className="bg-background border-border text-foreground w-[calc(100vw-2rem)] max-w-5xl sm:max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Layers className="w-5 h-5 text-primary" />
            S-2240 em lote
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gera o S-2240 dos trabalhadores ativos que ainda não têm o evento para a matrícula atual. Os eventos ficam pendentes; o
            envio é feito depois, na lista.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <ErrorList errors={erros} title="Não foi possível gerar" />

          {resultado && (
            <Alert className={resultado.falhas.length ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>
                {resultado.gerados} S-2240 gerado(s){resultado.falhas.length > 0 && `, ${resultado.falhas.length} com problema`}
              </AlertTitle>
              {resultado.falhas.length > 0 && (
                <AlertDescription className="text-sm">
                  <ul className="list-disc pl-4 mt-1 space-y-1 max-h-40 overflow-y-auto">
                    {resultado.falhas.map((f) => (
                      <li key={f.vinculoId}>
                        <strong>{f.nome || f.vinculoId}</strong>: {f.erros.join("; ")}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              )}
            </Alert>
          )}

          <Field label="Empresa *">
            <Choice
              value={empresaId}
              onChange={setEmpresaId}
              options={empresas.map((e) => [e.id, `${e.razao_social} (${e.cnpj})`] as const)}
              placeholder="Selecione a empresa"
            />
          </Field>

          {empresaId && !carregando && pendentes.length === 0 && !erros.length && (
            <Alert className="bg-emerald-50 border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <AlertDescription className="text-emerald-800">Todos os trabalhadores ativos já têm S-2240 para a matrícula atual.</AlertDescription>
            </Alert>
          )}

          {pendentes.length > 0 && (
            <>
              <Section title="Como gerar">
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={copiarAnterior} onChange={(e) => setCopiarAnterior(e.target.checked)} />
                  <span>
                    Readmitidos: repetir o <strong>S-2240 anterior</strong> do próprio trabalhador (mesmo ambiente, atividade e agentes).
                    <span className="text-muted-foreground"> {pendentes.filter((p) => p.anterior).length} têm S-2240 anterior.</span>
                  </span>
                </label>
                <Field label={`Modelo para quem não tem S-2240 anterior (${usamModelo} selecionado(s))`}>
                  <Choice
                    value={modeloId}
                    onChange={setModeloId}
                    options={modelos.map(
                      (m) => [m.exposicaoId, `${m.setor} · ${m.agentes || "sem agentes"} · usado ${m.total}x`] as const
                    )}
                    placeholder={modelos.length ? "Escolha um modelo" : "Nenhum S-2240 existente para usar como modelo"}
                  />
                  {modeloId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Atividade: {modelos.find((m) => m.exposicaoId === modeloId)?.atividade}
                    </p>
                  )}
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Início da condição *">
                    <Choice
                      value={tipoData}
                      onChange={(v) => setTipoData(v as "admissao" | "fixa")}
                      options={[["admissao", "Data de admissão do vínculo atual"], ["fixa", "Data fixa (nunca antes da admissão)"]]}
                    />
                  </Field>
                  {tipoData === "fixa" && (
                    <Field label="Data">
                      <TextInput type="date" value={dataFixa} onChange={(e) => setDataFixa(e.target.value)} />
                    </Field>
                  )}
                  <Field label="Não começar antes de">
                    <TextInput type="date" value={dataMinima} onChange={(e) => setDataMinima(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Início da obrigatoriedade de SST no eSocial para a empresa. Sugerido: início do primeiro S-2240 já enviado.
                    </p>
                  </Field>
                </div>
                {responsaveis.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm">Responsável pelos registros (deixe em branco para manter o do modelo):</p>
                    {responsaveis.map((r) => (
                      <label key={r.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={respOverride.includes(r.id)}
                          onChange={(e) =>
                            setRespOverride(e.target.checked ? [...respOverride, r.id] : respOverride.filter((x) => x !== r.id))
                          }
                        />
                        {r.nome} · CPF {r.cpf}
                        {r.nr_oc && ` · ${r.ide_oc === "1" ? "CRM" : r.ide_oc === "4" ? "CREA" : "Conselho"} ${r.nr_oc}/${r.uf_oc}`}
                      </label>
                    ))}
                  </div>
                )}
                <Alert className="bg-slate-50 border-border">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Confira se o modelo vale para os trabalhadores selecionados: o S-2240 declara a exposição real de cada um. Use o
                    filtro abaixo para separar por cargo ou setor e gere um lote por modelo.
                  </AlertDescription>
                </Alert>
              </Section>

              <div className="flex flex-wrap items-center gap-3">
                <TextInput
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Filtrar por nome, CPF, matrícula, cargo ou setor anterior"
                  className="max-w-md"
                />
                <span className="text-sm text-muted-foreground">
                  {selecionados.size} de {pendentes.length} selecionado(s)
                </span>
              </div>

              <div className="rounded-lg border border-border overflow-x-auto bg-white max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-muted-foreground sticky top-0">
                    <tr>
                      <th className="p-2">
                        <input type="checkbox" checked={todosVisiveisMarcados} onChange={alternarVisiveis} aria-label="Selecionar todos" />
                      </th>
                      <th className="p-2">Nome</th>
                      <th className="p-2">Matrícula</th>
                      <th className="p-2">Cargo</th>
                      <th className="p-2">Admissão</th>
                      <th className="p-2">S-2240 anterior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiveis.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selecionados.has(p.id)}
                            onChange={(e) => {
                              const next = new Set(selecionados)
                              if (e.target.checked) next.add(p.id)
                              else next.delete(p.id)
                              setSelecionados(next)
                            }}
                          />
                        </td>
                        <td className="p-2">{p.nome}</td>
                        <td className="p-2">{p.matricula}</td>
                        <td className="p-2">{p.cargo ?? "-"}</td>
                        <td className="p-2 whitespace-nowrap">{fmtData(p.dataAdmissao)}</td>
                        <td className="p-2 text-xs">
                          {p.anterior ? `${p.anterior.setor} · ${p.anterior.agentes}` : <span className="text-muted-foreground">nenhum</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={fechar} disabled={gerando}>
            Fechar
          </Button>
          {pendentes.length > 0 && (
            <Button type="button" onClick={gerar} disabled={gerando || carregando || !selecionados.size}>
              {gerando ? "Gerando..." : `Gerar ${selecionados.size} S-2240`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
