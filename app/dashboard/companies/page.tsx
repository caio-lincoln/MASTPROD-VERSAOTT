"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Building2, Users, MapPin, Eye, Edit, Trash2, Shield } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { CompanyModal } from "@/components/company-modal"
import { CompanyDetailsModal } from "@/components/company-details-modal"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

type CompanyRow = {
  id: string
  razao_social: string
  cnpj: string
  cnae: string | null
  status: "ativo" | "inativo" | "cancelado"
  atividade_principal: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  telefone: string | null
  email: string | null
  responsavel: string | null
  origem: "manual" | "esocial"
  importada: boolean
  natureza_juridica: string | null
  classificacao_tributaria: string | null
  inicio_validade: string | null
}

type MetricsRow = {
  empresa_id: string
  total_funcionarios: number
  total_treinamentos_ativos: number
  total_epis_cadastrados: number
  total_riscos_identificados: number
}

const ITEMS_PER_PAGE = 10

const mapCompanies = (empresas: CompanyRow[], metricsMap: Map<string, MetricsRow>) => {
  return empresas.map((e) => ({
    id: e.id,
    name: e.razao_social,
    cnpj: e.cnpj,
    city: e.cidade || "",
    state: e.estado || "",
    status: e.status === "ativo" ? "Ativa" : e.status === "inativo" ? "Inativa" : "Cancelada",
    fromESocial: e.origem === "esocial" || e.importada === true,
    address: e.endereco || "",
    phone: e.telefone || "",
    email: e.email || "",
    responsible: e.responsavel || "",
    cnae: e.cnae || "",
    activityDescription: e.atividade_principal || "",
    employees: metricsMap.get(e.id)?.total_funcionarios ?? 0,
    legalNature: e.natureza_juridica || "",
    taxClassification: e.classificacao_tributaria || "",
    validityStartDate: e.inicio_validade ? e.inicio_validade.substring(0, 7) : "",
  }))
}

export default function CompaniesPage() {
  const [search, setSearch] = useState("")
  const [companies, setCompanies] = useState<Array<any>>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<any | null>(null)
  const [viewingCompany, setViewingCompany] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data: empresas, error: errEmp } = await supabase.from("empresas").select("*")
      if (errEmp) {
        setError("Erro ao carregar empresas")
        setLoading(false)
        return
      }
      const { data: metrics } = await supabase.from("dashboard_metricas_por_empresa").select("*")
      const metricsMap = new Map<string, MetricsRow>()
      metrics?.forEach((m: any) => metricsMap.set(m.empresa_id, m))
      const mapped = mapCompanies(empresas as CompanyRow[], metricsMap)
      setCompanies(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.cnpj.includes(search))
  }, [companies, search])

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE)

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCompanies, currentPage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCreateCompany = async (data: any) => {
    try {
      setLoading(true)
      console.log("Criando empresa com dados:", data)

      // Verificar sessão antes de prosseguir
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !sessionData.session) {
        console.error("Erro de sessão:", sessionError)
        toast.error("Sessão inválida ou expirada. Faça login novamente.")
        setLoading(false)
        return
      }

      // Tenta refresh se o token estiver prestes a expirar (opcional, mas seguro)
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      const session = refreshData.session || sessionData.session
      const user = session?.user

      if (refreshError) {
         console.warn("Erro ao atualizar sessão:", refreshError)
      }

      if (!user) {
        toast.error("Usuário não autenticado.")
        setLoading(false)
        return
      }

      // Inserção direta no banco de dados (bypass Edge Function por solicitação do usuário)
      // 1. Inserir empresa
      const { data: newCompany, error: createError } = await supabase
        .from("empresas")
        .insert({
          razao_social: data.name,
          cnpj: data.cnpj,
          cnae: data.cnae,
          atividade_principal: data.activityDescription,
          endereco: data.address,
          cidade: data.city,
          estado: data.state,
          telefone: data.phone,
          email: data.email,
          responsavel: data.responsible,
          classificacao_tributaria: data.taxClassification,
          natureza_juridica: data.legalNature,
          inicio_validade: data.validityStartDate ? `${data.validityStartDate}-01` : null,
          origem: 'manual',
          importada: false,
          status: 'ativo',
          user_id: user.id
        })
        .select()
        .single()

      if (createError) {
        console.error("Erro ao criar empresa (DB):", createError)
        toast.error(`Erro ao criar empresa: ${createError.message}`)
        setLoading(false)
        return
      }

      console.log("Empresa criada:", newCompany)

      // 2. Vincular usuário à empresa
      const { error: linkError } = await supabase
        .from("usuarios_empresas")
        .insert({
          empresa_id: newCompany.id,
          user_id: user.id,
          role: 'owner'
        })

      if (linkError) {
        console.error("Erro ao vincular usuário à empresa:", linkError)
        toast.error(`Empresa criada, mas erro ao vincular usuário: ${linkError.message}`)
        // Opcional: tentar deletar a empresa criada para evitar órfãos?
        // Por enquanto, apenas avisar.
      } else {
        toast.success("Empresa criada com sucesso!")
      }

      setCreateModalOpen(false)
      
      // Recarregar dados
      const { data: empresas, error: errEmp } = await supabase.from("empresas").select("*")
      if (errEmp) throw errEmp

      const { data: metrics } = await supabase.from("dashboard_metricas_por_empresa").select("*")
      const metricsMap = new Map<string, MetricsRow>()
      metrics?.forEach((m: any) => metricsMap.set(m.empresa_id, m))
      
      const mapped = mapCompanies(empresas as CompanyRow[], metricsMap)
      setCompanies(mapped)
    } catch (err: any) {
      console.error("Exceção ao criar empresa:", err)
      toast.error(`Erro inesperado: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCompany = async (data: any) => {
    if (!editingCompany) return
    await supabase
      .from("empresas")
      .update({
        razao_social: data.name,
        cnpj: data.cnpj,
        cnae: data.cnae,
        atividade_principal: data.activityDescription,
        endereco: data.address,
        cidade: data.city,
        estado: data.state,
        telefone: data.phone,
        email: data.email,
        responsavel: data.responsible,
        classificacao_tributaria: data.taxClassification,
        natureza_juridica: data.legalNature,
        inicio_validade: data.validityStartDate ? `${data.validityStartDate}-01` : null,
      })
      .eq("id", editingCompany.id)
    setEditingCompany(null)
    const { data: empresas } = await supabase.from("empresas").select("*")
    const { data: metrics } = await supabase.from("dashboard_metricas_por_empresa").select("*")
    const metricsMap = new Map<string, MetricsRow>()
    metrics?.forEach((m: any) => metricsMap.set(m.empresa_id, m))
    const mapped = mapCompanies(empresas as CompanyRow[], metricsMap)
    setCompanies(mapped)
  }

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return

    // Tentativa de exclusão direta via Client (aproveitando RLS policies)
    const { error: deleteError } = await supabase.from("empresas").delete().eq("id", id)

    if (deleteError) {
      console.error("Erro ao excluir empresa:", deleteError)
      alert(`Erro ao excluir empresa: ${deleteError.message}`)
      
      // Fallback para Edge Function se falhar por permissão (caso RLS não esteja propagado ou usuário seja service_role simulado)
      // Mas como configuramos RLS, o delete direto deve funcionar.
      // Se quiser manter a Edge Function como fallback:
      /*
      const token = (await supabase.auth.getSession()).data.session?.access_token || ""
      const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin_onboarding`
      const resp = await fetch(`${base}/delete-company`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ empresa_id: id }),
      })
      if (!resp.ok) {
        const errText = await resp.text()
        alert(`Falha na exclusão via servidor: ${errText}`)
        return
      }
      */
      return
    }

    // Sucesso - Recarregar dados
    const { data: empresas } = await supabase.from("empresas").select("*")
    const { data: metrics } = await supabase.from("dashboard_metricas_por_empresa").select("*")
    const metricsMap = new Map<string, MetricsRow>()
    metrics?.forEach((m: any) => metricsMap.set(m.empresa_id, m))
    const mapped = mapCompanies(empresas as CompanyRow[], metricsMap)
    setCompanies(mapped)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Empresas</h2>
          <p className="text-slate-400">Gerencie as empresas vinculadas</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar empresas por nome ou CNPJ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-slate-400">Carregando...</div>}
          {error && <div className="text-red-400">{error}</div>}
          <div className="space-y-3">
            {paginatedCompanies.map((company) => (
              <div
                key={company.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                        {company.fromESocial && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                            <Shield className="w-3 h-3" />
                            e-Social
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">CNPJ: {company.cnpj}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      {company.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{company.employees} funcionários</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {company.city} - {company.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewingCompany(company)}
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    {!company.fromESocial && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCompany(company)}
                          className="border-slate-700 hover:bg-slate-800"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCompany(company.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCompanies.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredCompanies.length}
            />
          )}
        </CardContent>
      </Card>

      <CompanyModal
        open={createModalOpen || !!editingCompany}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false)
            setEditingCompany(null)
          }
        }}
        onSubmit={editingCompany ? handleEditCompany : handleCreateCompany}
        initialData={editingCompany}
        mode={editingCompany ? "edit" : "create"}
        isLoading={loading}
      />

      <CompanyDetailsModal
        open={!!viewingCompany}
        onOpenChange={(open) => !open && setViewingCompany(null)}
        company={viewingCompany}
      />
    </div>
  )
}
