"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Package, Calendar, Eye, Edit, XCircle, Building2, Filter } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PPEModal } from "@/components/ppe-modal"
import { PPEDetailsModal } from "@/components/ppe-details-modal"
import { PPECancelModal } from "@/components/ppe-cancel-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { DashboardHeader, ContentContainer, StatusBadge } from "../esocial/components/visual-components"
import { cn } from "@/lib/utils"

type EpiRow = {
  id: string
  nome: string
  certificado_aprovacao: string | null
  tipo_protecao: string | null
  fabricante: string | null
  empresa_id: string
  qtd_estoque: number
  qtd_minima: number
  validade: string | null
  descricao: string | null
  status: "ativo" | "inativo" | "cancelado"
}
type CompanyRow = { id: string; razao_social: string }

const ITEMS_PER_PAGE = 10

export default function PPEPage() {
  const [search, setSearch] = useState("")
  const [ppe, setPPE] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPPE, setEditingPPE] = useState<any | null>(null)
  const [detailsPPE, setDetailsPPE] = useState<any | null>(null)
  const [cancelPPE, setCancelPPE] = useState<any | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data: empresas } = await supabase.from("empresas").select("id, razao_social")
      setCompanies((empresas as CompanyRow[]).map((e) => ({ id: e.id, name: e.razao_social })))
      const { data: epis } = await supabase.from("epis").select("*")
      const mapped = (epis as EpiRow[]).map((e) => ({
        id: e.id,
        name: e.nome,
        ca: e.certificado_aprovacao || "",
        type: e.tipo_protecao || "",
        manufacturer: e.fabricante || "",
        quantity: e.qtd_estoque,
        minQuantity: e.qtd_minima,
        status: e.status === "ativo" ? "Adequado" : e.status === "cancelado" ? "Cancelado" : "Inativo",
        validity: e.validade || "",
        companyId: e.empresa_id,
        companyName: "",
        description: e.descricao || "",
        isCancelled: e.status === "cancelado",
      }))
      setPPE(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const filteredPPE = useMemo(() => {
    return ppe.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.ca.includes(search) ||
        item.type.toLowerCase().includes(search.toLowerCase())
      const matchesCompany = selectedCompany === "all" || item.companyId === selectedCompany
      return matchesSearch && matchesCompany
    })
  }, [ppe, search, selectedCompany])

  const totalPages = Math.ceil(filteredPPE.length / ITEMS_PER_PAGE)

  const paginatedPPE = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPPE.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredPPE, currentPage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleSavePPE = (ppeData: any) => {
    const run = async () => {
      if (editingPPE) {
        await supabase
          .from("epis")
          .update({
            nome: ppeData.name,
            certificado_aprovacao: ppeData.ca,
            tipo_protecao: ppeData.type,
            fabricante: ppeData.manufacturer,
            empresa_id: ppeData.companyId,
            qtd_estoque: ppeData.quantity,
            qtd_minima: ppeData.minQuantity,
            validade: ppeData.validity,
            descricao: ppeData.description,
          })
          .eq("id", editingPPE.id)
      } else {
        await supabase.from("epis").insert({
          nome: ppeData.name,
          certificado_aprovacao: ppeData.ca,
          tipo_protecao: ppeData.type,
          fabricante: ppeData.manufacturer,
          empresa_id: ppeData.companyId,
          qtd_estoque: ppeData.quantity,
          qtd_minima: ppeData.minQuantity,
          validade: ppeData.validity,
          descricao: ppeData.description,
          status: "ativo",
        })
      }
      setIsModalOpen(false)
      setEditingPPE(null)
      const { data: epis } = await supabase.from("epis").select("*")
      const mapped = (epis as EpiRow[]).map((e) => ({
        id: e.id,
        name: e.nome,
        ca: e.certificado_aprovacao || "",
        type: e.tipo_protecao || "",
        manufacturer: e.fabricante || "",
        quantity: e.qtd_estoque,
        minQuantity: e.qtd_minima,
        status: e.status === "ativo" ? "Adequado" : e.status === "cancelado" ? "Cancelado" : "Inativo",
        validity: e.validade || "",
        companyId: e.empresa_id,
        companyName: "",
        description: e.descricao || "",
        isCancelled: e.status === "cancelado",
      }))
      setPPE(mapped)
    }
    run()
  }

  const handleCancelPPE = (id: number, reason: string) => {
    const run = async () => {
      await supabase.from("epis").update({ status: "cancelado" }).eq("id", id)
      setCancelPPE(null)
      const { data: epis } = await supabase.from("epis").select("*")
      const mapped = (epis as EpiRow[]).map((e) => ({
        id: e.id,
        name: e.nome,
        ca: e.certificado_aprovacao || "",
        type: e.tipo_protecao || "",
        manufacturer: e.fabricante || "",
        quantity: e.qtd_estoque,
        minQuantity: e.qtd_minima,
        status: e.status === "ativo" ? "Adequado" : e.status === "cancelado" ? "Cancelado" : "Inativo",
        validity: e.validade || "",
        companyId: e.empresa_id,
        companyName: "",
        description: e.descricao || "",
        isCancelled: e.status === "cancelado",
      }))
      setPPE(mapped)
    }
    run()
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <DashboardHeader 
        title="EPIs" 
        subtitle="Controle de Equipamentos de Proteção Individual"
      >
        <Button 
          onClick={() => {
            setEditingPPE(null)
            setIsModalOpen(true)
          }}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo EPI
        </Button>
      </DashboardHeader>

      <ContentContainer className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar EPIs por nome, CA ou tipo..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
          <Select
            value={selectedCompany}
            onValueChange={(value) => {
              setSelectedCompany(value)
              setCurrentPage(1)
            }}
          >
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
            <p className="text-slate-400 animate-pulse">Carregando EPIs...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
            {error}
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedPPE.map((item) => (
              <div
                key={item.id}
                className="glass-card p-5 rounded-xl hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50 hover:border-primary/30"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                      <Package className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-slate-400">CA: {item.ca}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>{item.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{companies.find((c) => c.id === item.companyId)?.name || ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <StatusBadge 
                    status={item.status} 
                    type={item.status === "Adequado" ? "success" : item.status === "Cancelado" ? "default" : "error"} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-slate-700/50 mb-4 bg-slate-900/20 rounded-lg px-4 mx-[-0.5rem]">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">Estoque: <span className={cn("font-medium", item.quantity <= item.minQuantity ? "text-red-400" : "text-white")}>{item.quantity}</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">Mínimo: <span className="text-white">{item.minQuantity}</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">Validade: {item.validity}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                    onClick={() => setDetailsPPE(item)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  {!item.isCancelled && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-orange-400 hover:bg-orange-500/10"
                        onClick={() => {
                          setEditingPPE(item)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setCancelPPE(item)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPPE.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredPPE.length}
            />
          </div>
        )}

        {filteredPPE.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum EPI encontrado para os filtros selecionados</p>
          </div>
        )}
      </ContentContainer>

      <PPEModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSavePPE}
        editingPPE={editingPPE}
        companies={companies.map((c) => ({ id: c.id, name: c.name, cnpj: "" }))}
      />

      <PPEDetailsModal ppe={detailsPPE} onClose={() => setDetailsPPE(null)} />

      <PPECancelModal ppe={cancelPPE} onClose={() => setCancelPPE(null)} onConfirm={handleCancelPPE} />
    </div>
  )
}
