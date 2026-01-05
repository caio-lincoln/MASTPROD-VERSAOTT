"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, AlertTriangle, Eye, Edit, Trash2, Building2 } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { RiskModal } from "@/components/risk-modal"
import { RiskDetailsModal } from "@/components/risk-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"

type CompanyRow = { id: string; razao_social: string }
type RiskRow = {
  id: string
  nome_risco: string
  severidade: string | null
  tipo: string | null
  probabilidade: string | null
  descricao: string | null
  fonte_geradora: string | null
  consequencias: string | null
  setor: string | null
  medidas_controle: string | null
  data_identificacao: string | null
  responsavel: string | null
  empresa_id: string
  status: "ativo" | "inativo" | "cancelado"
}

const ITEMS_PER_PAGE = 10

export default function RisksPage() {
  const [search, setSearch] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [risks, setRisks] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<any | null>(null)
  const [viewingRisk, setViewingRisk] = useState<any | null>(null)
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data: empresas } = await supabase.from("empresas").select("id, razao_social")
      setCompanies((empresas as CompanyRow[]).map((e) => ({ id: e.id, name: e.razao_social })))
      const { data: riscos } = await supabase.from("riscos_ocupacionais").select("*").order("created_at", { ascending: false })
      const mapped = (riscos as RiskRow[]).map((r) => ({
        id: r.id,
        name: r.nome_risco,
        type: r.tipo || "",
        severity: r.severidade || "",
        sector: r.setor || "",
        measures: r.medidas_controle || "",
        companyId: r.empresa_id,
        companyName: "",
        description: r.descricao || "",
        source: r.fonte_geradora || "",
        consequences: r.consequencias || "",
        probability: r.probabilidade || "",
        identifiedDate: r.data_identificacao || "",
        responsibleName: r.responsavel || "",
        status: r.status === "ativo" ? "Ativo" : r.status === "inativo" ? "Inativo" : "Cancelado",
      }))
      setRisks(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
      const matchesCompany = selectedCompany === "all" || r.companyId === selectedCompany
      return matchesSearch && matchesCompany
    })
  }, [risks, search, selectedCompany])

  const totalPages = Math.ceil(filteredRisks.length / ITEMS_PER_PAGE)

  const paginatedRisks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredRisks.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredRisks, currentPage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCompanyFilter = (value: string) => {
    setSelectedCompany(value)
    setCurrentPage(1)
  }

  const handleCreateRisk = (data: any) => {
    const run = async () => {
      await supabase.from("riscos_ocupacionais").insert({
        nome_risco: data.name,
        tipo: data.type,
        severidade: data.severity,
        setor: data.sector,
        medidas_controle: data.measures,
        empresa_id: data.companyId,
        descricao: data.description,
        fonte_geradora: data.source,
        consequencias: data.consequences,
        probabilidade: data.probability,
        data_identificacao: data.identifiedDate,
        responsavel: data.responsibleName,
        status: "ativo",
      })
      setCreateModalOpen(false)
      const { data: riscos } = await supabase.from("riscos_ocupacionais").select("*").order("created_at", { ascending: false })
      const mapped = (riscos as RiskRow[]).map((r) => ({
        id: r.id,
        name: r.nome_risco,
        type: r.tipo || "",
        severity: r.severidade || "",
        sector: r.setor || "",
        measures: r.medidas_controle || "",
        companyId: r.empresa_id,
        companyName: "",
        description: r.descricao || "",
        source: r.fonte_geradora || "",
        consequences: r.consequencias || "",
        probability: r.probabilidade || "",
        identifiedDate: r.data_identificacao || "",
        responsibleName: r.responsavel || "",
        status: r.status === "ativo" ? "Ativo" : r.status === "inativo" ? "Inativo" : "Cancelado",
      }))
      setRisks(mapped)
    }
    run()
  }

  const handleEditRisk = (data: any) => {
    const run = async () => {
      if (!editingRisk) return
      await supabase
        .from("riscos_ocupacionais")
        .update({
          nome_risco: data.name,
          tipo: data.type,
          severidade: data.severity,
          setor: data.sector,
          medidas_controle: data.measures,
          empresa_id: data.companyId,
          descricao: data.description,
          fonte_geradora: data.source,
          consequencias: data.consequences,
          probabilidade: data.probability,
          data_identificacao: data.identifiedDate,
          responsavel: data.responsibleName,
        })
        .eq("id", editingRisk.id)
      setEditingRisk(null)
      const { data: riscos } = await supabase.from("riscos_ocupacionais").select("*").order("created_at", { ascending: false })
      const mapped = (riscos as RiskRow[]).map((r) => ({
        id: r.id,
        name: r.nome_risco,
        type: r.tipo || "",
        severity: r.severidade || "",
        sector: r.setor || "",
        measures: r.medidas_controle || "",
        companyId: r.empresa_id,
        companyName: "",
        description: r.descricao || "",
        source: r.fonte_geradora || "",
        consequences: r.consequencias || "",
        probability: r.probabilidade || "",
        identifiedDate: r.data_identificacao || "",
        responsibleName: r.responsavel || "",
        status: r.status === "ativo" ? "Ativo" : r.status === "inativo" ? "Inativo" : "Cancelado",
      }))
      setRisks(mapped)
    }
    run()
  }

  const handleDeleteRisk = (id: number) => {
    const run = async () => {
      if (!confirm("Tem certeza que deseja excluir este risco?")) return
      await supabase.from("riscos_ocupacionais").delete().eq("id", id)
      const { data: riscos } = await supabase.from("riscos_ocupacionais").select("*").order("created_at", { ascending: false })
      const mapped = (riscos as RiskRow[]).map((r) => ({
        id: r.id,
        name: r.nome_risco,
        type: r.tipo || "",
        severity: r.severidade || "",
        sector: r.setor || "",
        measures: r.medidas_controle || "",
        companyId: r.empresa_id,
        companyName: "",
        description: r.descricao || "",
        source: r.fonte_geradora || "",
        consequences: r.consequencias || "",
        probability: r.probabilidade || "",
        identifiedDate: r.data_identificacao || "",
        responsibleName: r.responsavel || "",
        status: r.status === "ativo" ? "Ativo" : r.status === "inativo" ? "Inativo" : "Cancelado",
      }))
      setRisks(mapped)
    }
    run()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Crítico":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "Alto":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "Médio":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Baixo":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Riscos Ocupacionais</h2>
          <p className="text-slate-400">Identificação e controle de riscos</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Risco
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Filtrar por Empresa</Label>
              <Select value={selectedCompany} onValueChange={handleCompanyFilter}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">
                    Todas as empresas
                  </SelectItem>
                  {companies.map((company) => (
                    <SelectItem
                      key={company.id}
                      value={company.id}
                      className="text-white hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <span>{company.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar riscos por nome ou tipo..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-slate-400">Carregando...</div>}
          {error && <div className="text-red-400">{error}</div>}
          <div className="space-y-3">
            {paginatedRisks.map((risk) => (
              <div
                key={risk.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{risk.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">
                          {companies.find((c) => c.id === risk.companyId)?.name || ""}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">Setor: {risk.sector}</p>
                      <p className="text-sm text-slate-300">Medidas: {risk.measures}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(risk.severity)}`}
                    >
                      {risk.severity}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                      {risk.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingRisk(risk)}
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingRisk(risk)}
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRisk(risk.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredRisks.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredRisks.length}
            />
          )}
        </CardContent>
      </Card>

      <RiskModal
        open={createModalOpen || !!editingRisk}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false)
            setEditingRisk(null)
          }
        }}
        onSubmit={editingRisk ? handleEditRisk : handleCreateRisk}
        initialData={editingRisk}
        mode={editingRisk ? "edit" : "create"}
        companies={companies.map((c) => ({ id: c.id, name: c.name, cnpj: "" }))}
      />

      <RiskDetailsModal
        open={!!viewingRisk}
        onOpenChange={(open) => !open && setViewingRisk(null)}
        risk={viewingRisk}
      />
    </div>
  )
}
