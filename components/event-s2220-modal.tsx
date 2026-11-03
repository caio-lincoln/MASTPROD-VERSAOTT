"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Activity, Plus, Trash2 } from "lucide-react"
import { db } from "@/lib/data-client"
import { createSstEvent } from "@/lib/esocial/transmission/gateway"
import { TIPOS_EXAME } from "@/lib/esocial/events/S-2220"
import { Choice, ErrorList, Field, Section, TextInput, TrabalhadorSection, UFS, useTrabalhador } from "./esocial-form-parts"

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

// Audiometria tonal (Tabela 27): pede ordem do exame e resultado
const AUDIOMETRIA = "0281"

interface ExameForm {
  dtExm: string
  procRealizado: string
  obsProc: string
  ordExame: string
  indResult: string
}

const novoExame = (dt = ""): ExameForm => ({ dtExm: dt, procRealizado: "", obsProc: "", ordExame: "", indResult: "" })
const vazio = (v: string) => (v.trim() ? v.trim() : null)

export default function EventS2220Modal({ isOpen, onClose, onCreated }: Props) {
  const t = useTrabalhador(isOpen)
  const [tpExame, setTpExame] = useState("")
  const [dtAso, setDtAso] = useState("")
  const [resAso, setResAso] = useState("1")
  const [exames, setExames] = useState<ExameForm[]>([novoExame()])
  const [medico, setMedico] = useState({ nmMed: "", nrCRM: "", ufCRM: "" })
  const [temResp, setTemResp] = useState(false)
  const [resp, setResp] = useState({ nmResp: "", cpfResp: "", nrCRM: "", ufCRM: "" })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Sugere médico emitente e coordenador do PCMSO a partir do último ASO da empresa
  useEffect(() => {
    if (!t.empresaId) return
    db.from("asos")
      .select("dados")
      .eq("empresa_id", t.empresaId)
      .order("dt_aso", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const d = data?.[0]?.dados
        if (!d) return
        setMedico({ nmMed: d.medico?.nmMed ?? "", nrCRM: d.medico?.nrCRM ?? "", ufCRM: d.medico?.ufCRM ?? "" })
        if (d.respMonit) {
          setTemResp(true)
          setResp({ nmResp: d.respMonit.nmResp ?? "", cpfResp: d.respMonit.cpfResp ?? "", nrCRM: d.respMonit.nrCRM ?? "", ufCRM: d.respMonit.ufCRM ?? "" })
        }
      })
  }, [t.empresaId])

  const updateExame = (i: number, patch: Partial<ExameForm>) =>
    setExames((list) => list.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))

  const reset = () => {
    t.reset()
    setTpExame("")
    setDtAso("")
    setResAso("1")
    setExames([novoExame()])
    setErrors([])
  }

  const handleClose = () => {
    if (saving) return
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!t.empresaId || !t.funcionarioId) {
      setErrors(["Selecione a empresa e o funcionário."])
      return
    }
    const dados = {
      tpExameOcup: tpExame,
      dtAso,
      resAso,
      exames: exames.map((x) => ({
        dtExm: x.dtExm || dtAso,
        procRealizado: x.procRealizado.trim(),
        obsProc: vazio(x.obsProc),
        ordExame: x.ordExame || null,
        indResult: x.indResult || null,
      })),
      medico: { nmMed: medico.nmMed.trim(), nrCRM: vazio(medico.nrCRM), ufCRM: medico.ufCRM || null },
      respMonit: temResp
        ? { nmResp: resp.nmResp.trim(), cpfResp: vazio(resp.cpfResp)?.replace(/\D/g, "") ?? null, nrCRM: resp.nrCRM.trim(), ufCRM: resp.ufCRM }
        : null,
    }
    try {
      setSaving(true)
      setErrors([])
      await createSstEvent("S-2220", { empresaId: t.empresaId, funcionarioId: t.funcionarioId, matricula: t.matricula || null, dados })
      reset()
      onCreated?.()
      onClose()
    } catch (err: any) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Erro ao gerar o evento."])
      document.getElementById("s2220-erros")?.scrollIntoView({ behavior: "smooth" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-background border-border text-foreground w-[calc(100vw-2rem)] max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-5 h-5 text-primary" />
            Evento S-2220: Monitoramento da Saúde do Trabalhador (ASO)
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Leiaute S-1.3. O XML é gerado e validado ao salvar; o envio é feito depois, na lista de eventos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div id="s2220-erros">
            <ErrorList errors={errors} />
          </div>

          <TrabalhadorSection t={t} />

          <Section title="Atestado de saúde ocupacional">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Tipo de exame *">
                <Choice value={tpExame} onChange={setTpExame} options={TIPOS_EXAME.map(([v, l]) => [v, `${v} - ${l}`] as const)} />
              </Field>
              <Field label="Data do ASO *">
                <TextInput type="date" value={dtAso} onChange={(e) => setDtAso(e.target.value)} required />
              </Field>
              <Field label="Resultado *">
                <Choice value={resAso} onChange={setResAso} options={[["1", "Apto"], ["2", "Inapto"]]} />
              </Field>
            </div>
          </Section>

          <Section title="Exames e procedimentos (Tabela 27)">
            {exames.map((x, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b border-dashed border-border pb-3">
                <Field label="Data *" className="md:col-span-3">
                  <TextInput type="date" value={x.dtExm} onChange={(e) => updateExame(i, { dtExm: e.target.value })} />
                </Field>
                <Field label="Código (4 dígitos) *" className="md:col-span-2">
                  <TextInput
                    value={x.procRealizado}
                    onChange={(e) => updateExame(i, { procRealizado: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    placeholder="0000"
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Observação" className="md:col-span-6">
                  <TextInput value={x.obsProc} onChange={(e) => updateExame(i, { obsProc: e.target.value })} maxLength={999} />
                </Field>
                <div className="md:col-span-1 flex justify-end">
                  {exames.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setExames(exames.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {x.procRealizado === AUDIOMETRIA && (
                  <>
                    <Field label="Ordem do exame *" className="md:col-span-4">
                      <Choice value={x.ordExame} onChange={(v) => updateExame(i, { ordExame: v })} options={[["1", "Referencial"], ["2", "Sequencial"]]} />
                    </Field>
                    <Field label="Resultado da audiometria *" className="md:col-span-4">
                      <Choice
                        value={x.indResult}
                        onChange={(v) => updateExame(i, { indResult: v })}
                        options={[["1", "Normal"], ["2", "Alterado"], ["3", "Estável"], ["4", "Agravamento"]]}
                      />
                    </Field>
                  </>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setExames([...exames, novoExame(dtAso)])}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar exame
            </Button>
            <p className="text-xs text-muted-foreground">
              Use os códigos da Tabela 27 do eSocial (procedimentos diagnósticos). Inclua o exame clínico e os complementares.
            </p>
          </Section>

          <Section title="Médico emitente do ASO">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Nome *" className="md:col-span-2">
                <TextInput value={medico.nmMed} onChange={(e) => setMedico({ ...medico, nmMed: e.target.value })} maxLength={70} />
              </Field>
              <Field label="CRM">
                <TextInput value={medico.nrCRM} onChange={(e) => setMedico({ ...medico, nrCRM: e.target.value })} maxLength={10} />
              </Field>
              <Field label="UF do CRM">
                <Choice value={medico.ufCRM} onChange={(v) => setMedico({ ...medico, ufCRM: v })} options={UFS.map((u) => [u, u] as const)} />
              </Field>
            </div>
          </Section>

          <Section title="Médico responsável pelo PCMSO">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={temResp} onChange={(e) => setTemResp(e.target.checked)} />
              Informar o médico responsável/coordenador do PCMSO
            </label>
            {temResp && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Field label="Nome *" className="md:col-span-2">
                  <TextInput value={resp.nmResp} onChange={(e) => setResp({ ...resp, nmResp: e.target.value })} maxLength={70} />
                </Field>
                <Field label="CPF">
                  <TextInput value={resp.cpfResp} onChange={(e) => setResp({ ...resp, cpfResp: e.target.value })} />
                </Field>
                <Field label="CRM *">
                  <TextInput value={resp.nrCRM} onChange={(e) => setResp({ ...resp, nrCRM: e.target.value })} maxLength={10} />
                </Field>
                <Field label="UF do CRM *">
                  <Choice value={resp.ufCRM} onChange={(v) => setResp({ ...resp, ufCRM: v })} options={UFS.map((u) => [u, u] as const)} />
                </Field>
              </div>
            )}
          </Section>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="border-border bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Gerando..." : "Gerar Evento S-2220"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
