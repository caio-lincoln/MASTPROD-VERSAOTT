"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2, Wind } from "lucide-react"
import { db } from "@/lib/data-client"
import { createS2240Event } from "@/lib/esocial/transmission/gateway"

interface EventS2240ModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

const NOVO = "__novo__"
const AUSENCIA = "09.01.001"

// Sugestões da Tabela 24; qualquer outro código pode ser digitado
const AGENTES_SUGERIDOS = [
  { cod: "09.01.001", dsc: "Ausência de agente nocivo ou de atividades previstas no Anexo IV do Decreto 3.048/1999" },
  { cod: "02.01.001", dsc: "Ruído" },
  { cod: "01.01.001", dsc: "Arsênio e seus compostos" },
  { cod: "01.02.001", dsc: "Asbestos (ou amianto)" },
  { cod: "01.03.001", dsc: "Benzeno e seus compostos tóxicos" },
]

const UNIDADES = [
  ["1", "dose diária de ruído"], ["2", "dB (linear)"], ["3", "dB(C)"], ["4", "dB(A)"], ["5", "m/s²"],
  ["6", "m/s^1,75"], ["7", "ppm"], ["8", "mg/m³"], ["9", "f/cm³"], ["10", "ºC"], ["11", "m/s"],
  ["12", "porcentual"], ["13", "lux"], ["14", "ufc/m³"], ["15", "dose diária"], ["16", "dose mensal"],
  ["17", "dose trimestral"], ["18", "dose anual"], ["19", "W/m²"], ["20", "A/m"], ["21", "mT"], ["22", "μT"],
  ["23", "mA"], ["24", "kV/m"], ["25", "V/m"], ["26", "J/m²"], ["27", "mJ/cm²"], ["28", "mSv"],
  ["29", "mppdc"], ["30", "UR (%)"],
] as const

const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ")

const REQUISITOS_EPI = [
  ["medProtecao", "Tentou-se priorizar medidas de proteção coletiva/administrativas"],
  ["condFuncto", "Observadas as condições de funcionamento e uso ininterrupto"],
  ["usoInint", "EPI utilizado de forma ininterrupta durante a jornada"],
  ["przValid", "Observado o prazo de validade do CA"],
  ["periodicTroca", "Observada a periodicidade de troca"],
  ["higienizacao", "Observada a higienização do EPI"],
] as const

type SN = "S" | "N"

interface AgenteForm {
  codAgNoc: string
  dscAgNoc: string
  tpAval: "" | "1" | "2"
  intConc: string
  limTol: string
  unMed: string
  tecMedicao: string
  nrProcJud: string
  utilizEPC: "0" | "1" | "2"
  eficEpc: "" | SN
  utilizEPI: "0" | "1" | "2"
  eficEpi: "" | SN
  epis: string
  epiCompl: Record<(typeof REQUISITOS_EPI)[number][0], SN>
}

const novoAgente = (): AgenteForm => ({
  codAgNoc: "",
  dscAgNoc: "",
  tpAval: "",
  intConc: "",
  limTol: "",
  unMed: "",
  tecMedicao: "",
  nrProcJud: "",
  utilizEPC: "0",
  eficEpc: "",
  utilizEPI: "0",
  eficEpi: "",
  epis: "",
  epiCompl: { medProtecao: "S", condFuncto: "S", usoInint: "S", przValid: "S", periodicTroca: "S", higienizacao: "S" },
})

const toNumber = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")))

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 min-w-0 ${className ?? ""}`}>
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  )
}

function Choice({
  value,
  onChange,
  options,
  placeholder = "Selecione",
}: {
  value: string
  onChange: (v: string) => void
  options: readonly (readonly [string, string])[]
  placeholder?: string
}) {
  return (
    // O Radix chama onValueChange("") quando o valor chega antes da opção existir; ignorar evita perder a seleção
    <Select value={value || undefined} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="w-full min-w-0 bg-white border-border text-foreground [&>span]:truncate">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border text-foreground max-h-72">
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4 p-4 rounded-lg bg-white border border-border">
    <h3 className="font-medium text-primary">{title}</h3>
    {children}
  </div>
)

export default function EventS2240Modal({ isOpen, onClose, onCreated }: EventS2240ModalProps) {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [ambientes, setAmbientes] = useState<any[]>([])
  const [responsaveis, setResponsaveis] = useState<any[]>([])
  const [episEmpresa, setEpisEmpresa] = useState<any[]>([])

  const [empresaId, setEmpresaId] = useState("")
  const [funcionarioId, setFuncionarioId] = useState("")
  const [matricula, setMatricula] = useState("")
  const [dtIni, setDtIni] = useState("")
  const [dtFim, setDtFim] = useState("")
  const [ambienteId, setAmbienteId] = useState("")
  const [novoAmb, setNovoAmb] = useState({ localAmb: "1", dscSetor: "", tpInsc: "1", nrInsc: "" })
  const [dscAtivDes, setDscAtivDes] = useState("")
  const [agentes, setAgentes] = useState<AgenteForm[]>([novoAgente()])
  const [respSelecionados, setRespSelecionados] = useState<string[]>([])
  const [novoResp, setNovoResp] = useState({ ativo: false, nome: "", cpf: "", ideOC: "4", dscOC: "", nrOC: "", ufOC: "" })
  const [obs, setObs] = useState("")

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) return
    db.from("empresas").select("id, razao_social, cnpj").order("razao_social").then(({ data }) => setEmpresas(data || []))
  }, [isOpen])

  useEffect(() => {
    setFuncionarioId("")
    setAmbienteId("")
    setRespSelecionados([])
    if (!empresaId) return
    const empresa = empresas.find((e) => e.id === empresaId)
    setNovoAmb((a) => ({ ...a, nrInsc: String(empresa?.cnpj || "").replace(/\D/g, "") }))
    db.from("funcionarios").select("id, nome, cpf, cargo, matricula_esocial, status").eq("empresa_id", empresaId).order("nome")
      .then(({ data }) => setFuncionarios((data || []).filter((f: any) => f.status !== "cancelado")))
    db.from("ambientes_trabalho").select("*").eq("empresa_id", empresaId).eq("ativo", true).order("nome")
      .then(({ data }) => {
        setAmbientes(data || [])
        setAmbienteId(data?.length ? data[0].id : NOVO)
      })
    db.from("responsaveis_registros_ambientais").select("*").eq("empresa_id", empresaId).eq("ativo", true).order("nome")
      .then(({ data }) => {
        setResponsaveis(data || [])
        setNovoResp((r) => ({ ...r, ativo: !data?.length }))
      })
    db.from("epis").select("id, nome, certificado_aprovacao").eq("empresa_id", empresaId).eq("status", "ativo")
      .then(({ data }) => setEpisEmpresa((data || []).filter((e: any) => e.certificado_aprovacao)))
  }, [empresaId, empresas])

  useEffect(() => {
    const f = funcionarios.find((x) => x.id === funcionarioId)
    setMatricula(f?.matricula_esocial || "")
  }, [funcionarioId, funcionarios])

  const somenteAusencia = agentes.length === 1 && agentes[0].codAgNoc === AUSENCIA

  const updateAgente = (i: number, patch: Partial<AgenteForm>) =>
    setAgentes((list) => list.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))

  const reset = () => {
    setEmpresaId("")
    setFuncionarioId("")
    setDtIni("")
    setDtFim("")
    setDscAtivDes("")
    setAgentes([novoAgente()])
    setObs("")
    setErrors([])
    setNovoResp({ ativo: false, nome: "", cpf: "", ideOC: "4", dscOC: "", nrOC: "", ufOC: "" })
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    if (!empresaId || !funcionarioId) {
      setErrors(["Selecione a empresa e o funcionário."])
      return
    }

    const payload = {
      empresaId,
      funcionarioId,
      matricula: matricula.trim() || null,
      ambienteId: ambienteId && ambienteId !== NOVO ? ambienteId : null,
      novoAmbiente: ambienteId === NOVO ? novoAmb : null,
      dtIniCondicao: dtIni,
      dtFimCondicao: dtFim || null,
      dscAtivDes,
      agentes: agentes.map((a) => {
        if (a.codAgNoc === AUSENCIA) return { codAgNoc: AUSENCIA }
        return {
          codAgNoc: a.codAgNoc.trim(),
          dscAgNoc: a.dscAgNoc,
          tpAval: a.tpAval || null,
          intConc: toNumber(a.intConc),
          limTol: toNumber(a.limTol),
          unMed: a.unMed ? Number(a.unMed) : null,
          tecMedicao: a.tecMedicao,
          nrProcJud: a.nrProcJud || null,
          utilizEPC: a.utilizEPC,
          eficEpc: a.eficEpc || null,
          utilizEPI: a.utilizEPI,
          eficEpi: a.eficEpi || null,
          epis: a.epis.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
          epiCompl: a.utilizEPI === "2" ? a.epiCompl : null,
        }
      }),
      responsavelIds: respSelecionados,
      novoResponsavel: novoResp.ativo
        ? {
            nome: novoResp.nome,
            cpf: novoResp.cpf,
            ideOC: novoResp.ideOC,
            dscOC: novoResp.dscOC || null,
            nrOC: novoResp.nrOC,
            ufOC: novoResp.ufOC,
          }
        : null,
      obsCompl: obs || null,
    }

    try {
      setSaving(true)
      await createS2240Event(payload)
      reset()
      onCreated?.()
      onClose()
    } catch (err: any) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Erro ao gerar o evento."])
      document.getElementById("s2240-erros")?.scrollIntoView({ behavior: "smooth" })
    } finally {
      setSaving(false)
    }
  }

  const empresaOptions = useMemo(() => empresas.map((e) => [e.id, `${e.razao_social} (${e.cnpj})`] as const), [empresas])
  const funcionarioOptions = useMemo(
    () => funcionarios.map((f) => [f.id, `${f.nome} - CPF ${f.cpf}${f.cargo ? ` - ${f.cargo}` : ""}`] as const),
    [funcionarios]
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-background border-border text-foreground w-[calc(100vw-2rem)] max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wind className="w-5 h-5 text-primary" />
            Evento S-2240: Condições Ambientais do Trabalho
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Exposição do trabalhador a agentes nocivos (leiaute S-1.3). O XML é gerado e validado ao salvar; o envio é feito depois, na lista de eventos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div id="s2240-erros">
            {errors.length > 0 && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-700" />
                <AlertTitle className="text-red-700">Corrija antes de gerar o evento</AlertTitle>
                <AlertDescription className="text-red-700 text-sm">
                  <ul className="list-disc pl-4 space-y-1 mt-1">
                    {errors.map((er, i) => (
                      <li key={i} className="whitespace-pre-line">{er}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Section title="Trabalhador">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Empresa *">
                <Choice value={empresaId} onChange={setEmpresaId} options={empresaOptions} placeholder="Selecione a empresa" />
              </Field>
              <Field label="Funcionário *">
                <Choice
                  value={funcionarioId}
                  onChange={setFuncionarioId}
                  options={funcionarioOptions}
                  placeholder={empresaId ? "Selecione o funcionário" : "Escolha a empresa primeiro"}
                />
              </Field>
              <Field label="Matrícula no eSocial *" className="md:col-span-2">
                <Input
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="A mesma matrícula enviada no S-2200 pela folha/contabilidade"
                  maxLength={30}
                  className="bg-white border-border"
                />
              </Field>
            </div>
          </Section>

          <Section title="Período da condição">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Data de início *">
                <Input type="date" value={dtIni} onChange={(e) => setDtIni(e.target.value)} required className="bg-white border-border" />
              </Field>
              <Field label="Data de fim">
                <Input type="date" value={dtFim} onChange={(e) => setDtFim(e.target.value)} className="bg-white border-border" />
              </Field>
            </div>
          </Section>

          <Section title="Ambiente de trabalho">
            <Field label="Ambiente *">
              <Choice
                value={ambienteId}
                onChange={setAmbienteId}
                options={[
                  ...ambientes.map((a) => [a.id, `${a.nome} - ${a.dsc_setor}`] as const),
                  [NOVO, "+ Cadastrar novo ambiente"] as const,
                ]}
                placeholder={empresaId ? "Selecione" : "Escolha a empresa primeiro"}
              />
            </Field>
            {ambienteId === NOVO && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Local *">
                  <Choice
                    value={novoAmb.localAmb}
                    onChange={(v) => setNovoAmb({ ...novoAmb, localAmb: v })}
                    options={[["1", "1 - Estabelecimento do próprio empregador"], ["2", "2 - Estabelecimento de terceiros"]]}
                  />
                </Field>
                <Field label="Setor *">
                  <Input
                    value={novoAmb.dscSetor}
                    onChange={(e) => setNovoAmb({ ...novoAmb, dscSetor: e.target.value })}
                    maxLength={100}
                    placeholder="Ex.: Produção - Linha de prensas"
                    className="bg-white border-border"
                  />
                </Field>
                <Field label="Tipo de inscrição do local *">
                  <Choice
                    value={novoAmb.tpInsc}
                    onChange={(v) => setNovoAmb({ ...novoAmb, tpInsc: v })}
                    options={[["1", "CNPJ"], ["3", "CAEPF"], ["4", "CNO"]]}
                  />
                </Field>
                <Field label="Inscrição do local *">
                  <Input
                    value={novoAmb.nrInsc}
                    onChange={(e) => setNovoAmb({ ...novoAmb, nrInsc: e.target.value })}
                    placeholder="CNPJ do estabelecimento (14 dígitos)"
                    className="bg-white border-border"
                  />
                </Field>
              </div>
            )}
            <Field label="Atividades desempenhadas *">
              <Textarea
                value={dscAtivDes}
                onChange={(e) => setDscAtivDes(e.target.value)}
                maxLength={999}
                placeholder="Descreva as atividades com verbos no infinitivo. Ex.: Operar prensa hidráulica, abastecer a linha..."
                className="bg-white border-border min-h-[80px]"
              />
            </Field>
          </Section>

          <Section title="Agentes nocivos (Tabela 24)">
            {agentes.map((a, i) => {
              const ausencia = a.codAgNoc === AUSENCIA
              return (
                <div key={i} className="space-y-4 p-4 rounded-md border border-dashed border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Agente {i + 1}</span>
                    {agentes.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAgentes(agentes.filter((_, idx) => idx !== i))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Sugestões">
                      <Choice
                        value={AGENTES_SUGERIDOS.some((s) => s.cod === a.codAgNoc) ? a.codAgNoc : ""}
                        onChange={(v) => {
                          const s = AGENTES_SUGERIDOS.find((x) => x.cod === v)
                          updateAgente(i, { codAgNoc: v, dscAgNoc: v === AUSENCIA ? "" : s?.dsc ?? "" })
                        }}
                        options={AGENTES_SUGERIDOS.map((s) => [s.cod, `${s.cod} - ${s.dsc}`] as const)}
                        placeholder="Escolha ou digite o código"
                      />
                    </Field>
                    <Field label="Código *">
                      <Input
                        value={a.codAgNoc}
                        onChange={(e) => updateAgente(i, { codAgNoc: e.target.value })}
                        placeholder="00.00.000"
                        className="bg-white border-border"
                      />
                    </Field>
                    {!ausencia && (
                      <Field label="Descrição do agente *">
                        <Input
                          value={a.dscAgNoc}
                          onChange={(e) => updateAgente(i, { dscAgNoc: e.target.value })}
                          maxLength={100}
                          className="bg-white border-border"
                        />
                      </Field>
                    )}
                  </div>

                  {!ausencia && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Tipo de avaliação *">
                          <Choice
                            value={a.tpAval}
                            onChange={(v) => updateAgente(i, { tpAval: v as AgenteForm["tpAval"] })}
                            options={[["1", "1 - Quantitativa"], ["2", "2 - Qualitativa"]]}
                          />
                        </Field>
                        {a.tpAval === "1" && (
                          <>
                            <Field label="Intensidade/concentração *">
                              <Input value={a.intConc} onChange={(e) => updateAgente(i, { intConc: e.target.value })} inputMode="decimal" className="bg-white border-border" />
                            </Field>
                            <Field label="Limite de tolerância">
                              <Input value={a.limTol} onChange={(e) => updateAgente(i, { limTol: e.target.value })} inputMode="decimal" className="bg-white border-border" />
                            </Field>
                            <Field label="Unidade de medida *">
                              <Choice value={a.unMed} onChange={(v) => updateAgente(i, { unMed: v })} options={UNIDADES} />
                            </Field>
                            <Field label="Técnica de medição *" className="md:col-span-2">
                              <Input
                                value={a.tecMedicao}
                                onChange={(e) => updateAgente(i, { tecMedicao: e.target.value })}
                                maxLength={40}
                                placeholder="Ex.: NHO 01 - dosimetria"
                                className="bg-white border-border"
                              />
                            </Field>
                          </>
                        )}
                        {a.codAgNoc === "05.01.001" && (
                          <Field label="Nº do processo judicial/administrativo *">
                            <Input value={a.nrProcJud} onChange={(e) => updateAgente(i, { nrProcJud: e.target.value })} className="bg-white border-border" />
                          </Field>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Field label="EPC *">
                          <Choice
                            value={a.utilizEPC}
                            onChange={(v) => updateAgente(i, { utilizEPC: v as AgenteForm["utilizEPC"] })}
                            options={[["0", "Não se aplica"], ["1", "Não implementa"], ["2", "Implementa"]]}
                          />
                        </Field>
                        {a.utilizEPC === "2" && (
                          <Field label="EPC eficaz? *">
                            <Choice value={a.eficEpc} onChange={(v) => updateAgente(i, { eficEpc: v as SN })} options={[["S", "Sim"], ["N", "Não"]]} />
                          </Field>
                        )}
                        <Field label="EPI *">
                          <Choice
                            value={a.utilizEPI}
                            onChange={(v) => updateAgente(i, { utilizEPI: v as AgenteForm["utilizEPI"] })}
                            options={[["0", "Não se aplica"], ["1", "Não utilizado"], ["2", "Utilizado"]]}
                          />
                        </Field>
                        {a.utilizEPI === "2" && (
                          <Field label="EPI eficaz? *">
                            <Choice value={a.eficEpi} onChange={(v) => updateAgente(i, { eficEpi: v as SN })} options={[["S", "Sim"], ["N", "Não"]]} />
                          </Field>
                        )}
                      </div>

                      {a.utilizEPI === "2" && (
                        <div className="space-y-4">
                          <Field label="CA dos EPIs * (separe por vírgula)">
                            <Input
                              value={a.epis}
                              onChange={(e) => updateAgente(i, { epis: e.target.value })}
                              placeholder="Ex.: 12345, 67890"
                              className="bg-white border-border"
                            />
                          </Field>
                          {episEmpresa.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {episEmpresa.map((epi) => (
                                <Button
                                  key={epi.id}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const atuais = a.epis.split(",").map((s) => s.trim()).filter(Boolean)
                                    if (!atuais.includes(epi.certificado_aprovacao)) {
                                      updateAgente(i, { epis: [...atuais, epi.certificado_aprovacao].join(", ") })
                                    }
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" /> {epi.nome} (CA {epi.certificado_aprovacao})
                                </Button>
                              ))}
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {REQUISITOS_EPI.map(([key, label]) => (
                              <Field key={key} label={label}>
                                <Choice
                                  value={a.epiCompl[key]}
                                  onChange={(v) => updateAgente(i, { epiCompl: { ...a.epiCompl, [key]: v as SN } })}
                                  options={[["S", "Sim"], ["N", "Não"]]}
                                />
                              </Field>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
            {!somenteAusencia && (
              <Button type="button" variant="outline" onClick={() => setAgentes([...agentes, novoAgente()])}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar agente
              </Button>
            )}
          </Section>

          <Section title="Responsável pelos registros ambientais">
            {responsaveis.length > 0 && (
              <div className="space-y-2">
                {responsaveis.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={respSelecionados.includes(r.id)}
                      onChange={(e) =>
                        setRespSelecionados(e.target.checked ? [...respSelecionados, r.id] : respSelecionados.filter((x) => x !== r.id))
                      }
                    />
                    {r.nome} - CPF {r.cpf} - {r.ide_oc === "1" ? "CRM" : r.ide_oc === "4" ? "CREA" : r.dsc_oc} {r.nr_oc}/{r.uf_oc}
                  </label>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={novoResp.ativo} onChange={(e) => setNovoResp({ ...novoResp, ativo: e.target.checked })} />
              Cadastrar novo responsável
            </label>
            {novoResp.ativo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Nome *" className="md:col-span-2">
                  <Input value={novoResp.nome} onChange={(e) => setNovoResp({ ...novoResp, nome: e.target.value })} className="bg-white border-border" />
                </Field>
                <Field label="CPF *">
                  <Input value={novoResp.cpf} onChange={(e) => setNovoResp({ ...novoResp, cpf: e.target.value })} className="bg-white border-border" />
                </Field>
                <Field label="Órgão de classe *">
                  <Choice
                    value={novoResp.ideOC}
                    onChange={(v) => setNovoResp({ ...novoResp, ideOC: v })}
                    options={[["4", "CREA"], ["1", "CRM"], ["9", "Outro"]]}
                  />
                </Field>
                {novoResp.ideOC === "9" && (
                  <Field label="Sigla do órgão *">
                    <Input value={novoResp.dscOC} onChange={(e) => setNovoResp({ ...novoResp, dscOC: e.target.value })} className="bg-white border-border" />
                  </Field>
                )}
                <Field label="Nº de inscrição *">
                  <Input value={novoResp.nrOC} onChange={(e) => setNovoResp({ ...novoResp, nrOC: e.target.value })} className="bg-white border-border" />
                </Field>
                <Field label="UF *">
                  <Choice value={novoResp.ufOC} onChange={(v) => setNovoResp({ ...novoResp, ufOC: v })} options={UFS.map((u) => [u, u] as const)} />
                </Field>
              </div>
            )}
          </Section>

          <Field label="Observações">
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              maxLength={999}
              className="bg-white border-border min-h-[80px]"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="border-border bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Gerando..." : "Gerar Evento S-2240"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
