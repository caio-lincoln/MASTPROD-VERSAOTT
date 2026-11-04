"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Plus, Save, X } from "lucide-react"
import { toast } from "sonner"
import { DashboardHeader, ContentContainer } from "@/app/dashboard/esocial/components/visual-components"
import { Choice, Field, TextInput, UFS } from "@/components/esocial-form-parts"
import { db } from "@/lib/data-client"

/**
 * Cadastros usados no S-2240: responsáveis pelos registros ambientais e ambientes de trabalho.
 * Os importados do eSocial chegam sem o nome do responsável (o evento só traz o CPF).
 */

interface Responsavel {
  id?: string
  empresa_id: string
  nome: string
  cpf: string
  ide_oc: string | null
  dsc_oc: string | null
  nr_oc: string | null
  uf_oc: string | null
  ativo: boolean
}

interface Ambiente {
  id?: string
  empresa_id: string
  nome: string
  local_amb: string
  dsc_setor: string
  tp_insc: string
  nr_insc: string
  ativo: boolean
}

const CONSELHOS = [["4", "CREA"], ["1", "CRM"], ["9", "Outro"]] as const
const conselho = (v: string | null) => CONSELHOS.find(([k]) => k === v)?.[1] ?? "-"
const nomePendente = (nome: string) => nome.startsWith("Responsável CPF")

export default function SstCadastrosPage() {
  const [empresas, setEmpresas] = useState<{ id: string; razao_social: string; cnpj: string }[]>([])
  const [empresaId, setEmpresaId] = useState("")
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [ambientes, setAmbientes] = useState<Ambiente[]>([])
  const [editResp, setEditResp] = useState<Responsavel | null>(null)
  const [editAmb, setEditAmb] = useState<Ambiente | null>(null)
  const [uso, setUso] = useState<Record<string, number>>({})

  useEffect(() => {
    db.from("empresas")
      .select("id, razao_social, cnpj")
      .order("razao_social")
      .then(({ data }) => {
        setEmpresas(data || [])
        if (data?.length === 1) setEmpresaId(data[0].id)
      })
  }, [])

  const carregar = async (id: string) => {
    const [{ data: r }, { data: a }, { data: x }] = await Promise.all([
      db.from("responsaveis_registros_ambientais").select("*").eq("empresa_id", id).order("nome"),
      db.from("ambientes_trabalho").select("*").eq("empresa_id", id).order("nome"),
      db.from("exposicoes_trabalhador").select("ambiente_id").eq("empresa_id", id),
    ])
    setResponsaveis(r || [])
    setAmbientes(a || [])
    const contagem: Record<string, number> = {}
    for (const row of x || []) contagem[row.ambiente_id] = (contagem[row.ambiente_id] ?? 0) + 1
    setUso(contagem)
  }

  useEffect(() => {
    if (empresaId) carregar(empresaId)
  }, [empresaId])

  const salvarResp = async () => {
    if (!editResp) return
    const r = editResp
    const valores = {
      empresa_id: empresaId,
      nome: r.nome.trim(),
      cpf: r.cpf.replace(/\D/g, ""),
      ide_oc: r.ide_oc || null,
      dsc_oc: r.ide_oc === "9" ? r.dsc_oc?.trim() || null : null,
      nr_oc: r.nr_oc?.trim() || null,
      uf_oc: r.uf_oc || null,
      ativo: r.ativo,
    }
    if (!valores.nome || valores.cpf.length !== 11) return toast.error("Informe o nome e um CPF com 11 dígitos.")
    const { error } = r.id
      ? await db.from("responsaveis_registros_ambientais").update(valores).eq("id", r.id)
      : await db.from("responsaveis_registros_ambientais").insert(valores)
    if (error) return toast.error(error.message)
    toast.success("Responsável salvo.")
    setEditResp(null)
    carregar(empresaId)
  }

  const salvarAmb = async () => {
    if (!editAmb) return
    const a = editAmb
    const valores = {
      empresa_id: empresaId,
      nome: a.nome.trim() || a.dsc_setor.trim(),
      local_amb: a.local_amb,
      dsc_setor: a.dsc_setor.trim(),
      tp_insc: a.tp_insc,
      nr_insc: a.nr_insc.replace(/[^0-9A-Za-z]/g, "").toUpperCase(),
      ativo: a.ativo,
    }
    if (!valores.dsc_setor || !valores.nr_insc) return toast.error("Informe o setor e a inscrição do local.")
    const { error } = a.id
      ? await db.from("ambientes_trabalho").update(valores).eq("id", a.id)
      : await db.from("ambientes_trabalho").insert(valores)
    if (error) return toast.error(error.message)
    toast.success("Ambiente salvo.")
    setEditAmb(null)
    carregar(empresaId)
  }

  const empresa = empresas.find((e) => e.id === empresaId)
  const pendentes = responsaveis.filter((r) => nomePendente(r.nome)).length

  return (
    <div className="space-y-6">
      <DashboardHeader title="Ambientes e Responsáveis" subtitle="Cadastros usados no S-2240 (condições ambientais)" />

      <div className="max-w-xl">
        <Field label="Empresa">
          <Choice
            value={empresaId}
            onChange={setEmpresaId}
            options={empresas.map((e) => [e.id, `${e.razao_social} (${e.cnpj})`] as const)}
            placeholder="Selecione a empresa"
          />
        </Field>
      </div>

      {empresaId && (
        <>
          <ContentContainer className="border-0 bg-transparent p-0 shadow-none">
            <div className="p-6 rounded-xl bg-white border border-border space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold">Responsáveis pelos registros ambientais</h3>
                  <p className="text-sm text-muted-foreground">
                    Engenheiro/técnico/médico que assina o LTCAT/PGR (respReg do S-2240).
                    {pendentes > 0 && <span className="text-amber-700"> {pendentes} importado(s) do eSocial sem nome: complete abaixo.</span>}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditResp({ empresa_id: empresaId, nome: "", cpf: "", ide_oc: "4", dsc_oc: null, nr_oc: "", uf_oc: "", ativo: true })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Novo responsável
                </Button>
              </div>

              {editResp && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <Field label="Nome *" className="md:col-span-2">
                    <TextInput value={nomePendente(editResp.nome) ? "" : editResp.nome} placeholder={nomePendente(editResp.nome) ? "Nome não veio no eSocial" : ""} onChange={(e) => setEditResp({ ...editResp, nome: e.target.value })} />
                  </Field>
                  <Field label="CPF *">
                    <TextInput value={editResp.cpf} onChange={(e) => setEditResp({ ...editResp, cpf: e.target.value })} disabled={!!editResp.id} />
                  </Field>
                  <Field label="Conselho">
                    <Choice value={editResp.ide_oc ?? ""} onChange={(v) => setEditResp({ ...editResp, ide_oc: v })} options={CONSELHOS} />
                  </Field>
                  <Field label="Nº no conselho">
                    <TextInput value={editResp.nr_oc ?? ""} onChange={(e) => setEditResp({ ...editResp, nr_oc: e.target.value })} />
                  </Field>
                  <Field label="UF">
                    <Choice value={editResp.uf_oc ?? ""} onChange={(v) => setEditResp({ ...editResp, uf_oc: v })} options={UFS.map((u) => [u, u] as const)} />
                  </Field>
                  {editResp.ide_oc === "9" && (
                    <Field label="Sigla do conselho">
                      <TextInput value={editResp.dsc_oc ?? ""} onChange={(e) => setEditResp({ ...editResp, dsc_oc: e.target.value })} />
                    </Field>
                  )}
                  <div className="md:col-span-6 flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditResp(null)}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
                    <Button size="sm" onClick={salvarResp}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground bg-slate-50">
                    <tr><th className="p-2">Nome</th><th className="p-2">CPF</th><th className="p-2">Conselho</th><th className="p-2">Situação</th><th className="p-2" /></tr>
                  </thead>
                  <tbody>
                    {responsaveis.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="p-2">{nomePendente(r.nome) ? <span className="text-amber-700">Sem nome (importado)</span> : r.nome}</td>
                        <td className="p-2">{r.cpf}</td>
                        <td className="p-2">{r.nr_oc ? `${conselho(r.ide_oc)} ${r.nr_oc}/${r.uf_oc ?? ""}` : "-"}</td>
                        <td className="p-2">{r.ativo ? "Ativo" : "Inativo"}</td>
                        <td className="p-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setEditResp(r)}><Pencil className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                    {!responsaveis.length && <tr><td colSpan={5} className="p-3 text-muted-foreground">Nenhum responsável cadastrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </ContentContainer>

          <ContentContainer className="border-0 bg-transparent p-0 shadow-none">
            <div className="p-6 rounded-xl bg-white border border-border space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold">Ambientes de trabalho</h3>
                  <p className="text-sm text-muted-foreground">Setor e local (infoAmb do S-2240). Ambientes em uso não podem ser excluídos, só inativados.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setEditAmb({ empresa_id: empresaId, nome: "", local_amb: "1", dsc_setor: "", tp_insc: "1", nr_insc: (empresa?.cnpj ?? "").replace(/[^0-9A-Za-z]/g, ""), ativo: true })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> Novo ambiente
                </Button>
              </div>

              {editAmb && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <Field label="Nome interno" className="md:col-span-2">
                    <TextInput value={editAmb.nome} onChange={(e) => setEditAmb({ ...editAmb, nome: e.target.value })} />
                  </Field>
                  <Field label="Setor (dscSetor) *" className="md:col-span-2">
                    <TextInput value={editAmb.dsc_setor} maxLength={100} onChange={(e) => setEditAmb({ ...editAmb, dsc_setor: e.target.value })} />
                  </Field>
                  <Field label="Local *">
                    <Choice value={editAmb.local_amb} onChange={(v) => setEditAmb({ ...editAmb, local_amb: v })} options={[["1", "Estab. próprio"], ["2", "Estab. de terceiros"]]} />
                  </Field>
                  <Field label="Situação">
                    <Choice value={editAmb.ativo ? "1" : "0"} onChange={(v) => setEditAmb({ ...editAmb, ativo: v === "1" })} options={[["1", "Ativo"], ["0", "Inativo"]]} />
                  </Field>
                  <Field label="Tipo de inscrição *">
                    <Choice value={editAmb.tp_insc} onChange={(v) => setEditAmb({ ...editAmb, tp_insc: v })} options={[["1", "CNPJ"], ["3", "CAEPF"], ["4", "CNO"]]} />
                  </Field>
                  <Field label="Inscrição *" className="md:col-span-2">
                    <TextInput value={editAmb.nr_insc} onChange={(e) => setEditAmb({ ...editAmb, nr_insc: e.target.value })} />
                  </Field>
                  <div className="md:col-span-3 flex items-end justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditAmb(null)}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
                    <Button size="sm" onClick={salvarAmb}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground bg-slate-50">
                    <tr><th className="p-2">Setor</th><th className="p-2">Local</th><th className="p-2">Inscrição</th><th className="p-2">S-2240</th><th className="p-2">Situação</th><th className="p-2" /></tr>
                  </thead>
                  <tbody>
                    {ambientes.map((a) => (
                      <tr key={a.id} className="border-t border-border">
                        <td className="p-2">{a.dsc_setor}</td>
                        <td className="p-2">{a.local_amb === "1" ? "Próprio" : "Terceiros"}</td>
                        <td className="p-2">{a.nr_insc}</td>
                        <td className="p-2">{uso[a.id!] ?? 0}</td>
                        <td className="p-2">{a.ativo ? "Ativo" : "Inativo"}</td>
                        <td className="p-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => setEditAmb(a)}><Pencil className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))}
                    {!ambientes.length && <tr><td colSpan={6} className="p-3 text-muted-foreground">Nenhum ambiente cadastrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </ContentContainer>
        </>
      )}
    </div>
  )
}
