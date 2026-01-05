"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Package, Calendar, Eye, Edit, XCircle, Building2 } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PPEModal } from "@/components/ppe-modal"
import { PPEDetailsModal } from "@/components/ppe-details-modal"
import { PPECancelModal } from "@/components/ppe-cancel-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">EPIs</h2>
          <p className="text-slate-400">Controle de Equipamentos de Proteção Individual</p>
        </div>
        <Button
          onClick={() => {
            setEditingPPE(null)
            setIsModalOpen(true)
          }}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo EPI
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-slate-400 mb-2 block">Selecione a Empresa</label>
                <Select
                  value={selectedCompany}
                  onValueChange={(value) => {
                    setSelectedCompany(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Todas as empresas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      Todas as empresas
                    </SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id} className="text-white">
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar EPIs por nome, CA ou tipo..."
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
            {paginatedPPE.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-slate-400 mb-1">
                      CA: {item.ca} | Tipo: {item.type}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="w-3 h-3" />
                      <span>{companies.find((c) => c.id === item.companyId)?.name || ""}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Adequado"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : item.status === "Cancelado"
                          ? "bg-slate-500/10 text-slate-400"
                          : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Package className="w-4 h-4" />
                    <span>Estoque: {item.quantity} unidades</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Package className="w-4 h-4" />
                    <span>Mínimo: {item.minQuantity} unidades</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Validade: {item.validity}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailsPPE(item)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  {!item.isCancelled && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPPE(item)
                          setIsModalOpen(true)
                        }}
                        className="border-emerald-700 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelPPE(item)}
                        className="border-red-700 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredPPE.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredPPE.length}
            />
          )}

          {filteredPPE.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum EPI encontrado para os filtros selecionados</p>
            </div>
          )}
        </CardContent>
      </Card>

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
