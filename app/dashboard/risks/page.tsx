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
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "Alto":
        return "bg-primary/10 text-primary border-primary/20"
      case "Médio":
        return "bg-warning/10 text-warning border-warning/20"
      case "Baixo":
        return "bg-success/10 text-success border-success/20"
      default:
        return "bg-slate-100 text-slate-600 border-slate-200"
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <DashboardHeader 
        title="Riscos Ocupacionais" 
        subtitle="Identificação e controle de riscos"
      >
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Risco
        </Button>
      </DashboardHeader>

      <ContentContainer className="border-0 bg-transparent p-0 shadow-none">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar riscos por nome ou tipo..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-border text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
          <Select value={selectedCompany} onValueChange={handleCompanyFilter}>
            <SelectTrigger className="w-full md:w-[250px] bg-white border-border text-foreground">
              <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
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
            <p className="text-muted-foreground animate-pulse">Carregando riscos...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive mb-4">
            {error}
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedRisks.map((risk) => (
              <div
                key={risk.id}
                className="bg-white p-5 rounded-lg hover:shadow-sm transition-all duration-300 group border border-border"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-white border border-slate-200 group-hover:border-primary/30 group-hover:bg-slate-50 transition-colors">
                      <AlertTriangle className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{risk.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building2 className="w-3 h-3" />
                        <span>{companies.find((c) => c.id === risk.companyId)?.name || ""}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>Setor: {risk.sector}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getSeverityColor(risk.severity))}>
                      {risk.severity}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200">
                      {risk.type}
                    </span>
                    <StatusBadge status={risk.status} />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2"><span className="text-muted-foreground font-medium">Medidas de Controle:</span> {risk.measures}</p>
                  <p className="text-sm text-muted-foreground"><span className="text-muted-foreground font-medium">Descrição:</span> {risk.description}</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-slate-100"
                    onClick={() => setViewingRisk(risk)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary hover:bg-blue-50"
                    onClick={() => setEditingRisk(risk)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-700 hover:bg-red-50"
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
