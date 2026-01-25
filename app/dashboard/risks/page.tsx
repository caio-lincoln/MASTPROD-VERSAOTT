"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, AlertTriangle, Eye, Edit, Trash2, Building2, Filter } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { RiskModal } from "@/components/risk-modal"
import { RiskDetailsModal } from "@/components/risk-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"
import { DashboardHeader, ContentContainer, StatusBadge } from "../esocial/components/visual-components"
import { cn } from "@/lib/utils"

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <DashboardHeader 
        title="Riscos Ocupacionais" 
        subtitle="Identificação e controle de riscos"
      >
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Risco
        </Button>
      </DashboardHeader>

      <ContentContainer className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar riscos por nome ou tipo..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
          <Select value={selectedCompany} onValueChange={handleCompanyFilter}>
            <SelectTrigger className="w-full md:w-[250px] bg-slate-800/50 border-slate-700 text-white">
              <Building2 className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 animate-pulse">Carregando riscos...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
            {error}
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedRisks.map((risk) => (
              <div
                key={risk.id}
                className="glass-card p-5 rounded-xl hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50 hover:border-primary/30"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                      <AlertTriangle className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{risk.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building2 className="w-3 h-3" />
                        <span>{companies.find((c) => c.id === risk.companyId)?.name || ""}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>Setor: {risk.sector}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getSeverityColor(risk.severity))}>
                      {risk.severity}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                      {risk.type}
                    </span>
                    <StatusBadge status={risk.status} />
                  </div>
                </div>

                <div className="bg-slate-900/20 rounded-lg p-4 mb-4 border border-slate-700/30">
                  <p className="text-sm text-slate-300 mb-2"><span className="text-slate-500 font-medium">Medidas de Controle:</span> {risk.measures}</p>
                  <p className="text-sm text-slate-300"><span className="text-slate-500 font-medium">Descrição:</span> {risk.description}</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                    onClick={() => setViewingRisk(risk)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-primary hover:bg-primary/10"
                    onClick={() => setEditingRisk(risk)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDeleteRisk(risk.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredRisks.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredRisks.length}
            />
          </div>
        )}
      </ContentContainer>

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
