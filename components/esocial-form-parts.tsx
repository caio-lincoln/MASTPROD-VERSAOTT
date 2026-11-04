"use client"

import type React from "react"
import { useEffect, useId, useMemo, useState } from "react"
import { TABELAS, itemDaTabela, type ItemTabela, type NumeroTabela } from "@/lib/esocial/tabelas"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { db } from "@/lib/data-client"

export const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ")
export const SIM_NAO = [["S", "Sim"], ["N", "Não"]] as const

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 min-w-0 ${className ?? ""}`}>
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  )
}

export function Choice({
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

export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4 p-4 rounded-lg bg-white border border-border">
    <h3 className="font-medium text-primary">{title}</h3>
    {children}
  </div>
)

export function TextInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} className={`bg-white border-border ${props.className ?? ""}`} />
}

/**
 * Código de uma tabela oficial do eSocial com busca por código ou descrição.
 * Aceita mais de uma tabela (ex.: agente causador: Tabela 14 ou 15).
 */
export function TabelaInput({
  tabela,
  value,
  onChange,
  placeholder = "Digite o código ou parte da descrição",
}: {
  tabela: NumeroTabela | NumeroTabela[]
  value: string
  onChange: (codigo: string, item: ItemTabela | null) => void
  placeholder?: string
}) {
  const id = useId()
  const tabelas = Array.isArray(tabela) ? tabela : [tabela]
  const buscar = (codigo: string) => tabelas.map((t) => itemDaTabela(t, codigo)).find(Boolean) ?? null
  const rotulo = (i: ItemTabela) => `${i.codigo} - ${i.descricao}`
  const atual = buscar(value)
  const [texto, setTexto] = useState(atual ? rotulo(atual) : value)

  useEffect(() => {
    const item = buscar(value)
    if (item) setTexto(rotulo(item))
    else if (!value) setTexto("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, tabelas.join(",")])

  return (
    <div className="space-y-1 min-w-0">
      <TextInput
        list={id}
        value={texto}
        placeholder={placeholder}
        onChange={(e) => {
          const t = e.target.value
          setTexto(t)
          const codigo = t.split(" - ")[0].trim()
          onChange(codigo, buscar(codigo))
        }}
      />
      <datalist id={id}>
        {tabelas.flatMap((t) =>
          TABELAS[t].itens.map((i) => <option key={`${t}-${i.codigo}`} value={rotulo(i)} />)
        )}
      </datalist>
      {value && !atual && <p className="text-xs text-amber-700">Código não encontrado na {tabelas.map((t) => `Tabela ${t}`).join(" / ")}.</p>}
    </div>
  )
}

export function ErrorList({ errors, title = "Corrija antes de gerar o evento" }: { errors: string[]; title?: string }) {
  if (!errors.length) return null
  return (
    <Alert className="bg-red-50 border-red-200">
      <AlertCircle className="h-4 w-4 text-red-700" />
      <AlertTitle className="text-red-700">{title}</AlertTitle>
      <AlertDescription className="text-red-700 text-sm">
        <ul className="list-disc pl-4 space-y-1 mt-1">
          {errors.map((er, i) => (
            <li key={i} className="whitespace-pre-line">{er}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

export interface EmpresaOpt {
  id: string
  razao_social: string
  cnpj: string
}

export interface FuncionarioOpt {
  id: string
  nome: string
  cpf: string
  cargo: string | null
  matricula_esocial: string | null
  status: string
}

/** Seleção de empresa e trabalhador, comum aos eventos de SST. */
export function useTrabalhador(isOpen: boolean) {
  const [empresas, setEmpresas] = useState<EmpresaOpt[]>([])
  const [funcionarios, setFuncionarios] = useState<FuncionarioOpt[]>([])
  const [empresaId, setEmpresaId] = useState("")
  const [funcionarioId, setFuncionarioId] = useState("")
  const [matricula, setMatricula] = useState("")

  useEffect(() => {
    if (!isOpen) return
    db.from("empresas").select("id, razao_social, cnpj").order("razao_social").then(({ data }) => setEmpresas(data || []))
  }, [isOpen])

  useEffect(() => {
    setFuncionarioId("")
    if (!empresaId) {
      setFuncionarios([])
      return
    }
    db.from("funcionarios")
      .select("id, nome, cpf, cargo, matricula_esocial, status")
      .eq("empresa_id", empresaId)
      .order("nome")
      .then(({ data }) => setFuncionarios((data || []).filter((f: FuncionarioOpt) => f.status !== "cancelado")))
  }, [empresaId])

  // Vínculos ativos do trabalhador: com mais de um, a matrícula é escolhida numa lista
  const [vinculos, setVinculos] = useState<{ matricula: string; cargo: string | null; data_admissao: string | null }[]>([])
  useEffect(() => {
    setMatricula(funcionarios.find((f) => f.id === funcionarioId)?.matricula_esocial || "")
    setVinculos([])
    if (!funcionarioId) return
    db.from("funcionario_vinculos")
      .select("matricula, cargo, data_admissao")
      .eq("funcionario_id", funcionarioId)
      .eq("status", "ativo")
      .order("data_admissao", { ascending: false })
      .then(({ data }) => setVinculos((data || []).filter((v: { matricula: string | null }) => v.matricula)))
  }, [funcionarioId, funcionarios])

  const empresa = empresas.find((e) => e.id === empresaId) ?? null
  const empresaOptions = useMemo(() => empresas.map((e) => [e.id, `${e.razao_social} (${e.cnpj})`] as const), [empresas])
  const funcionarioOptions = useMemo(
    () => funcionarios.map((f) => [f.id, `${f.nome} - CPF ${f.cpf}${f.cargo ? ` - ${f.cargo}` : ""}`] as const),
    [funcionarios]
  )

  const reset = () => {
    setEmpresaId("")
    setFuncionarioId("")
    setMatricula("")
  }

  return {
    empresa,
    empresaId,
    setEmpresaId,
    funcionarioId,
    setFuncionarioId,
    matricula,
    setMatricula,
    vinculos,
    empresaOptions,
    funcionarioOptions,
    reset,
  }
}

export function TrabalhadorSection({ t }: { t: ReturnType<typeof useTrabalhador> }) {
  return (
    <Section title="Trabalhador">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Empresa *">
          <Choice value={t.empresaId} onChange={t.setEmpresaId} options={t.empresaOptions} placeholder="Selecione a empresa" />
        </Field>
        <Field label="Funcionário *">
          <Choice
            value={t.funcionarioId}
            onChange={t.setFuncionarioId}
            options={t.funcionarioOptions}
            placeholder={t.empresaId ? "Selecione o funcionário" : "Escolha a empresa primeiro"}
          />
        </Field>
        {t.vinculos.length > 1 ? (
          <Field label={`Vínculo * (${t.vinculos.length} ativos: o evento é por matrícula)`} className="md:col-span-2">
            <Choice
              value={t.matricula}
              onChange={t.setMatricula}
              options={t.vinculos.map(
                (v) =>
                  [
                    v.matricula,
                    `Matrícula ${v.matricula}${v.cargo ? ` · ${v.cargo}` : ""}${v.data_admissao ? ` · desde ${v.data_admissao.split("-").reverse().join("/")}` : ""}`,
                  ] as const
              )}
            />
          </Field>
        ) : (
          <Field label="Matrícula no eSocial *" className="md:col-span-2">
            <TextInput
              value={t.matricula}
              onChange={(e) => t.setMatricula(e.target.value)}
              placeholder="A mesma matrícula enviada no S-2200 pela folha/contabilidade"
              maxLength={30}
            />
          </Field>
        )}
      </div>
    </Section>
  )
}
