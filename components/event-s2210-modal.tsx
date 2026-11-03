"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { createSstEvent } from "@/lib/esocial/transmission/gateway"
import { TIPOS_ACIDENTE, TIPOS_CAT, TIPOS_LOCAL } from "@/lib/esocial/events/S-2210"
import { Choice, ErrorList, Field, SIM_NAO, Section, TextInput, TrabalhadorSection, UFS, useTrabalhador } from "./esocial-form-parts"

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

const hhmm = (v: string) => v.replace(/\D/g, "").slice(0, 4)
const vazio = (v: string) => (v.trim() ? v.trim() : null)
const digitos = (v: string, n: number) => v.replace(/\D/g, "").slice(0, n)

const inicial = {
  dtAcid: "",
  tpAcid: "1",
  hrAcid: "",
  hrsTrabAntesAcid: "",
  tpCat: "1",
  nrRecCatOrig: "",
  indCatObito: "N",
  dtObito: "",
  indComunPolicia: "N",
  codSitGeradora: "",
  iniciatCAT: "1",
  obsCAT: "",
  ultDiaTrab: "",
  houveAfast: "",
}

const localInicial = {
  tpLocal: "1",
  dscLocal: "",
  tpLograd: "",
  dscLograd: "",
  nrLograd: "",
  complemento: "",
  bairro: "",
  cep: "",
  codMunic: "",
  uf: "",
  pais: "",
  codPostal: "",
  localTpInsc: "1",
  localNrInsc: "",
}

const atestadoInicial = {
  dtAtendimento: "",
  hrAtendimento: "",
  indInternacao: "N",
  durTrat: "",
  indAfast: "N",
  dscLesao: "",
  dscCompLesao: "",
  diagProvavel: "",
  codCID: "",
  observacao: "",
  nmEmit: "",
  ideOC: "1",
  nrOC: "",
  ufOC: "",
}

export default function EventS2210Modal({ isOpen, onClose, onCreated }: Props) {
  const t = useTrabalhador(isOpen)
  const [cat, setCat] = useState(inicial)
  const [local, setLocal] = useState(localInicial)
  const [parte, setParte] = useState({ codParteAting: "", lateralidade: "0" })
  const [codAgntCausador, setCodAgntCausador] = useState("")
  const [atestado, setAtestado] = useState(atestadoInicial)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Local do acidente começa no estabelecimento da própria empresa
  useEffect(() => {
    if (t.empresa) setLocal((l) => ({ ...l, localNrInsc: t.empresa!.cnpj.replace(/[^0-9A-Za-z]/g, "").toUpperCase() }))
  }, [t.empresa])

  const exterior = local.tpLocal === "2"
  const localComInscricao = local.tpLocal === "1" || local.tpLocal === "3"
  const reaberturaOuObito = cat.tpCat === "2" || cat.tpCat === "3"
  const obito = cat.indCatObito === "S" || cat.tpCat === "3"

  const reset = () => {
    t.reset()
    setCat(inicial)
    setLocal(localInicial)
    setParte({ codParteAting: "", lateralidade: "0" })
    setCodAgntCausador("")
    setAtestado(atestadoInicial)
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
      dtAcid: cat.dtAcid,
      tpAcid: cat.tpAcid,
      hrAcid: vazio(cat.hrAcid),
      hrsTrabAntesAcid: vazio(cat.hrsTrabAntesAcid),
      tpCat: cat.tpCat,
      indCatObito: cat.tpCat === "3" ? "S" : cat.indCatObito,
      dtObito: obito ? vazio(cat.dtObito) : null,
      indComunPolicia: cat.indComunPolicia,
      codSitGeradora: cat.codSitGeradora,
      iniciatCAT: cat.iniciatCAT,
      obsCAT: vazio(cat.obsCAT),
      ultDiaTrab: vazio(cat.ultDiaTrab),
      houveAfast: cat.houveAfast || null,
      local: {
        tpLocal: local.tpLocal,
        dscLocal: vazio(local.dscLocal),
        tpLograd: vazio(local.tpLograd),
        dscLograd: local.dscLograd.trim(),
        nrLograd: local.nrLograd.trim(),
        complemento: vazio(local.complemento),
        bairro: vazio(local.bairro),
        cep: exterior ? null : vazio(local.cep),
        codMunic: exterior ? null : vazio(local.codMunic),
        uf: exterior ? null : local.uf || null,
        pais: exterior ? vazio(local.pais) : null,
        codPostal: exterior ? vazio(local.codPostal) : null,
        ideLocalAcid: localComInscricao ? { tpInsc: local.localTpInsc, nrInsc: local.localNrInsc } : null,
      },
      parteAtingida: parte,
      codAgntCausador,
      atestado: {
        dtAtendimento: atestado.dtAtendimento,
        hrAtendimento: atestado.hrAtendimento,
        indInternacao: atestado.indInternacao,
        durTrat: atestado.durTrat === "" ? NaN : Number(atestado.durTrat),
        indAfast: atestado.indAfast,
        dscLesao: atestado.dscLesao,
        dscCompLesao: vazio(atestado.dscCompLesao),
        diagProvavel: vazio(atestado.diagProvavel),
        codCID: atestado.codCID.trim(),
        observacao: vazio(atestado.observacao),
        emitente: { nmEmit: atestado.nmEmit.trim(), ideOC: atestado.ideOC, nrOC: atestado.nrOC.trim(), ufOC: atestado.ufOC || null },
      },
      nrRecCatOrig: reaberturaOuObito ? vazio(cat.nrRecCatOrig) : null,
    }
    try {
      setSaving(true)
      setErrors([])
      await createSstEvent("S-2210", { empresaId: t.empresaId, funcionarioId: t.funcionarioId, matricula: t.matricula || null, dados })
      reset()
      onCreated?.()
      onClose()
    } catch (err: any) {
      setErrors(err.errors?.length ? err.errors : [err.message || "Erro ao gerar o evento."])
      document.getElementById("s2210-erros")?.scrollIntoView({ behavior: "smooth" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-background border-border text-foreground w-[calc(100vw-2rem)] max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Evento S-2210: Comunicação de Acidente de Trabalho (CAT)
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Leiaute S-1.3. Prazo legal: até o 1º dia útil seguinte ao acidente (imediato em caso de óbito). Os códigos seguem as
            tabelas 13 a 17 do eSocial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div id="s2210-erros">
            <ErrorList errors={errors} />
          </div>

          <TrabalhadorSection t={t} />

          <Section title="Acidente">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Data *">
                <TextInput type="date" value={cat.dtAcid} onChange={(e) => setCat({ ...cat, dtAcid: e.target.value })} required />
              </Field>
              <Field label="Tipo de acidente *">
                <Choice value={cat.tpAcid} onChange={(v) => setCat({ ...cat, tpAcid: v })} options={TIPOS_ACIDENTE} />
              </Field>
              <Field label={cat.tpAcid === "2" ? "Hora (HHMM)" : "Hora (HHMM) *"}>
                <TextInput value={cat.hrAcid} onChange={(e) => setCat({ ...cat, hrAcid: hhmm(e.target.value) })} placeholder="0830" inputMode="numeric" />
              </Field>
              <Field label={cat.tpAcid === "1" ? "Horas trabalhadas antes *" : "Horas trabalhadas antes"}>
                <TextInput
                  value={cat.hrsTrabAntesAcid}
                  onChange={(e) => setCat({ ...cat, hrsTrabAntesAcid: hhmm(e.target.value) })}
                  placeholder="0230"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Tipo de CAT *">
                <Choice value={cat.tpCat} onChange={(v) => setCat({ ...cat, tpCat: v })} options={TIPOS_CAT} />
              </Field>
              {reaberturaOuObito && (
                <Field label="Recibo da CAT de origem *" className="md:col-span-2">
                  <TextInput value={cat.nrRecCatOrig} onChange={(e) => setCat({ ...cat, nrRecCatOrig: e.target.value.trim() })} placeholder="1.2.0000000000000000000" />
                </Field>
              )}
              <Field label="Houve óbito? *">
                <Choice value={cat.tpCat === "3" ? "S" : cat.indCatObito} onChange={(v) => setCat({ ...cat, indCatObito: v })} options={SIM_NAO} />
              </Field>
              {obito && (
                <Field label="Data do óbito *">
                  <TextInput type="date" value={cat.dtObito} onChange={(e) => setCat({ ...cat, dtObito: e.target.value })} />
                </Field>
              )}
              <Field label="Comunicado à polícia? *">
                <Choice value={cat.indComunPolicia} onChange={(v) => setCat({ ...cat, indComunPolicia: v })} options={SIM_NAO} />
              </Field>
              <Field label="Situação geradora (Tab. 15/16) *">
                <TextInput
                  value={cat.codSitGeradora}
                  onChange={(e) => setCat({ ...cat, codSitGeradora: digitos(e.target.value, 9) })}
                  placeholder="9 dígitos"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Iniciativa da CAT *">
                <Choice
                  value={cat.iniciatCAT}
                  onChange={(v) => setCat({ ...cat, iniciatCAT: v })}
                  options={[["1", "Empregador"], ["2", "Ordem judicial"], ["3", "Órgão fiscalizador"]]}
                />
              </Field>
              <Field label="Último dia trabalhado">
                <TextInput type="date" value={cat.ultDiaTrab} onChange={(e) => setCat({ ...cat, ultDiaTrab: e.target.value })} />
              </Field>
              <Field label="Houve afastamento?">
                <Choice value={cat.houveAfast} onChange={(v) => setCat({ ...cat, houveAfast: v })} options={SIM_NAO} />
              </Field>
            </div>
            <Field label="Observações">
              <Textarea value={cat.obsCAT} onChange={(e) => setCat({ ...cat, obsCAT: e.target.value })} maxLength={999} className="bg-white border-border" />
            </Field>
          </Section>

          <Section title="Local do acidente">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Tipo de local *" className="md:col-span-2">
                <Choice value={local.tpLocal} onChange={(v) => setLocal({ ...local, tpLocal: v })} options={TIPOS_LOCAL} />
              </Field>
              <Field label="Descrição do local" className="md:col-span-2">
                <TextInput value={local.dscLocal} onChange={(e) => setLocal({ ...local, dscLocal: e.target.value })} maxLength={255} placeholder="Ex.: Galpão de produção, linha 2" />
              </Field>
              {localComInscricao && (
                <>
                  <Field label="Tipo de inscrição do local *">
                    <Choice value={local.localTpInsc} onChange={(v) => setLocal({ ...local, localTpInsc: v })} options={[["1", "CNPJ"], ["3", "CAEPF"], ["4", "CNO"]]} />
                  </Field>
                  <Field label="Inscrição do local *">
                    <TextInput value={local.localNrInsc} onChange={(e) => setLocal({ ...local, localNrInsc: e.target.value })} />
                  </Field>
                </>
              )}
              <Field label="Tipo de logradouro">
                <TextInput value={local.tpLograd} onChange={(e) => setLocal({ ...local, tpLograd: e.target.value })} maxLength={4} placeholder="R, AV..." />
              </Field>
              <Field label="Logradouro *">
                <TextInput value={local.dscLograd} onChange={(e) => setLocal({ ...local, dscLograd: e.target.value })} maxLength={100} />
              </Field>
              <Field label="Número *">
                <TextInput value={local.nrLograd} onChange={(e) => setLocal({ ...local, nrLograd: e.target.value })} maxLength={10} placeholder="S/N" />
              </Field>
              <Field label="Complemento">
                <TextInput value={local.complemento} onChange={(e) => setLocal({ ...local, complemento: e.target.value })} maxLength={30} />
              </Field>
              <Field label="Bairro">
                <TextInput value={local.bairro} onChange={(e) => setLocal({ ...local, bairro: e.target.value })} maxLength={90} />
              </Field>
              {exterior ? (
                <>
                  <Field label="País (código) *">
                    <TextInput value={local.pais} onChange={(e) => setLocal({ ...local, pais: digitos(e.target.value, 3) })} placeholder="3 dígitos" />
                  </Field>
                  <Field label="Código postal">
                    <TextInput value={local.codPostal} onChange={(e) => setLocal({ ...local, codPostal: e.target.value })} maxLength={12} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="CEP">
                    <TextInput value={local.cep} onChange={(e) => setLocal({ ...local, cep: digitos(e.target.value, 8) })} inputMode="numeric" />
                  </Field>
                  <Field label="Município (IBGE) *">
                    <TextInput value={local.codMunic} onChange={(e) => setLocal({ ...local, codMunic: digitos(e.target.value, 7) })} placeholder="7 dígitos" inputMode="numeric" />
                  </Field>
                  <Field label="UF *">
                    <Choice value={local.uf} onChange={(v) => setLocal({ ...local, uf: v })} options={UFS.map((u) => [u, u] as const)} />
                  </Field>
                </>
              )}
            </div>
          </Section>

          <Section title="Lesão">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Parte atingida (Tab. 13) *">
                <TextInput value={parte.codParteAting} onChange={(e) => setParte({ ...parte, codParteAting: digitos(e.target.value, 9) })} placeholder="9 dígitos" inputMode="numeric" />
              </Field>
              <Field label="Lateralidade *">
                <Choice
                  value={parte.lateralidade}
                  onChange={(v) => setParte({ ...parte, lateralidade: v })}
                  options={[["0", "Não aplicável"], ["1", "Esquerda"], ["2", "Direita"], ["3", "Ambas"]]}
                />
              </Field>
              <Field label="Agente causador (Tab. 14/15) *">
                <TextInput value={codAgntCausador} onChange={(e) => setCodAgntCausador(digitos(e.target.value, 9))} placeholder="9 dígitos" inputMode="numeric" />
              </Field>
            </div>
          </Section>

          <Section title="Atestado médico">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label="Data do atendimento *">
                <TextInput type="date" value={atestado.dtAtendimento} onChange={(e) => setAtestado({ ...atestado, dtAtendimento: e.target.value })} />
              </Field>
              <Field label="Hora (HHMM) *">
                <TextInput value={atestado.hrAtendimento} onChange={(e) => setAtestado({ ...atestado, hrAtendimento: hhmm(e.target.value) })} placeholder="0915" inputMode="numeric" />
              </Field>
              <Field label="Internação? *">
                <Choice value={atestado.indInternacao} onChange={(v) => setAtestado({ ...atestado, indInternacao: v })} options={SIM_NAO} />
              </Field>
              <Field label="Duração do tratamento (dias) *">
                <TextInput value={atestado.durTrat} onChange={(e) => setAtestado({ ...atestado, durTrat: digitos(e.target.value, 4) })} inputMode="numeric" />
              </Field>
              <Field label="Afastamento? *">
                <Choice value={atestado.indAfast} onChange={(v) => setAtestado({ ...atestado, indAfast: v })} options={SIM_NAO} />
              </Field>
              <Field label="Natureza da lesão (Tab. 17) *">
                <TextInput value={atestado.dscLesao} onChange={(e) => setAtestado({ ...atestado, dscLesao: digitos(e.target.value, 9) })} placeholder="9 dígitos" inputMode="numeric" />
              </Field>
              <Field label="CID *">
                <TextInput value={atestado.codCID} onChange={(e) => setAtestado({ ...atestado, codCID: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) })} placeholder="S610" />
              </Field>
              <Field label="Diagnóstico provável">
                <TextInput value={atestado.diagProvavel} onChange={(e) => setAtestado({ ...atestado, diagProvavel: e.target.value })} maxLength={100} />
              </Field>
              <Field label="Complemento da lesão" className="md:col-span-2">
                <TextInput value={atestado.dscCompLesao} onChange={(e) => setAtestado({ ...atestado, dscCompLesao: e.target.value })} maxLength={200} />
              </Field>
              <Field label="Observação" className="md:col-span-2">
                <TextInput value={atestado.observacao} onChange={(e) => setAtestado({ ...atestado, observacao: e.target.value })} maxLength={255} />
              </Field>
              <Field label="Emitente (médico/dentista) *" className="md:col-span-2">
                <TextInput value={atestado.nmEmit} onChange={(e) => setAtestado({ ...atestado, nmEmit: e.target.value })} maxLength={70} />
              </Field>
              <Field label="Conselho *">
                <Choice value={atestado.ideOC} onChange={(v) => setAtestado({ ...atestado, ideOC: v })} options={[["1", "CRM"], ["2", "CRO"], ["3", "RMS"]]} />
              </Field>
              <Field label="Nº no conselho *">
                <TextInput value={atestado.nrOC} onChange={(e) => setAtestado({ ...atestado, nrOC: e.target.value })} maxLength={14} />
              </Field>
              <Field label="UF do conselho">
                <Choice value={atestado.ufOC} onChange={(v) => setAtestado({ ...atestado, ufOC: v })} options={UFS.map((u) => [u, u] as const)} />
              </Field>
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="border-border bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Gerando..." : "Gerar Evento S-2210"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
