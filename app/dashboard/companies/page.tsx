"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Building2, Users, MapPin, Eye, Edit, Trash2, Shield, Filter } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { CompanyModal } from "@/components/company-modal"
import { CompanyDetailsModal } from "@/components/company-details-modal"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { DashboardHeader, ContentContainer, StatusBadge } from "../esocial/components/visual-components"

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
  ind_coop: boolean | null
  ind_constr: boolean | null
  ind_des_folha: boolean | null
  ind_ent_ed: boolean | null
  ind_ett: boolean | null
  ind_prod_rural: boolean | null
  ind_pps: boolean | null
  ind_cpf: boolean | null
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
    indCoop: e.ind_coop || false,
    indConstr: e.ind_constr || false,
    indDesFolha: e.ind_des_folha || false,
    indEntEd: e.ind_ent_ed || false,
    indEtt: e.ind_ett || false,
    indProdRural: e.ind_prod_rural || false,
    indPPS: e.ind_pps || false,
    indCPF: e.ind_cpf || false,
  }))
}

async function upsertCompanyCertificate(params: {
  companyId: string
  companyName: string
  cnpj: string
  certificateFile: File | null
  removeExisting: boolean
  certificatePassword: string | null
}) {
  const { companyId, companyName, certificateFile, removeExisting, certificatePassword } = params

  const shouldClearDefault = removeExisting || !!certificateFile

  if (shouldClearDefault) {
    const { error: clearError } = await supabase
      .from("company_certificates")
      .update({ is_default: false })
      .eq("company_id", companyId)
      .eq("is_default", true)

    if (clearError) {
      console.error("Erro ao atualizar vínculo de certificado da empresa:", clearError)
      toast.error("Erro ao atualizar vínculo de certificado da empresa.")
      return
    }
  }

  if (!certificateFile) {
    return
  }

  const path = `${companyId}/${Date.now()}-${certificateFile.name}`

  let validFrom: string | null = null
  let validTo: string | null = null
  let encryptedSecret: string | null = null

  try {
    const arrayBuffer = await certificateFile.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i])
    }
    const pfxBase64 = btoa(binary)

    const password = certificatePassword || ""

    if (password) {
      const resp = await fetch("/api/esocial/cert-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pfxBase64,
          password,
        }),
      })

      if (resp.ok) {
        const data = (await resp.json()) as {
          validFrom: string
          validTo: string
          encryptedSecret?: string
        }
        validFrom = data.validFrom
        validTo = data.validTo
        encryptedSecret = data.encryptedSecret ?? null
      } else {
        let errorBody: unknown = null
        try {
          errorBody = await resp.json()
        } catch {
          errorBody = null
        }
        console.error("Erro na NodeAPI de metadados do certificado:", errorBody)
      }
    }
  } catch (err) {
    console.error("Erro ao tentar extrair validade do certificado:", err)
  }

  const { error: uploadError } = await supabase.storage.from("certificados").upload(path, certificateFile, {
    cacheControl: "3600",
    upsert: false,
    contentType: certificateFile.type || "application/x-pkcs12",
  })

  if (uploadError) {
    console.error("Erro ao enviar certificado para o Storage:", uploadError)
    toast.error("Erro ao enviar certificado para o Storage.")
    return
  }

  const { data: cert, error: certError } = await supabase
    .from("certificates")
    .insert({
      name: `${companyName} - Certificado`,
      pfx_storage_path: path,
      pfx_base64_encrypted: encryptedSecret,
      fingerprint: null,
      valid_from: validFrom,
      valid_to: validTo,
    })
    .select("id")
    .single()

  if (certError || !cert) {
    console.error("Erro ao registrar certificado no banco:", certError)
    toast.error("Erro ao registrar certificado no banco.")
    return
  }

  const { error: linkError } = await supabase
    .from("company_certificates")
    .insert({
      company_id: companyId,
      certificate_id: cert.id,
      is_default: true,
    })

  if (linkError) {
    console.error("Erro ao vincular certificado à empresa:", linkError)
    toast.error("Erro ao vincular certificado à empresa.")
  }
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
          user_id: user.id,
          ind_coop: data.indCoop,
          ind_constr: data.indConstr,
          ind_des_folha: data.indDesFolha,
          ind_ent_ed: data.indEntEd,
          ind_ett: data.indEtt,
          ind_prod_rural: data.indProdRural,
          ind_pps: data.indPPS,
          ind_cpf: data.indCPF
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

      const certificateFile = data.certificateFile as File | null
      const certificatePassword = data.certificatePassword as string | null

      if (certificateFile) {
        await upsertCompanyCertificate({
          companyId: newCompany.id,
          companyName: data.name,
          cnpj: data.cnpj,
          certificateFile,
          removeExisting: false,
          certificatePassword: certificatePassword || null,
        })
      }

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
    const certificateFile = data.certificateFile as File | null
    const removeCertificate = data.removeCertificate as boolean | undefined
    const certificatePassword = data.certificatePassword as string | null

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

    await upsertCompanyCertificate({
      companyId: editingCompany.id,
      companyName: data.name,
      cnpj: data.cnpj,
      certificateFile: certificateFile || null,
      removeExisting: !!removeCertificate,
      certificatePassword: certificatePassword || null,
    })

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <DashboardHeader 
        title="Empresas" 
        subtitle="Gerencie as empresas vinculadas"
      >
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </DashboardHeader>

      <ContentContainer>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresas por nome ou CNPJ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
            />
          </div>
          <Button variant="outline" className="border-border bg-white text-muted-foreground hover:bg-slate-50 hover:text-foreground">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {paginatedCompanies.map((company) => (
              <div
                key={company.id}
                className="p-5 rounded-xl bg-white border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-border group-hover:border-primary/30 group-hover:bg-blue-50 transition-colors">
                      <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{company.name}</h3>
                        {company.fromESocial && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            <Shield className="w-3 h-3" />
                            eSocial
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">{company.cnpj}</span>
                        {company.cnae && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span>CNAE: {company.cnae}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <StatusBadge status={company.status} />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-border/50">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{company.employees} funcionários</span>
                    </div>
                    {(company.city || company.state) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {company.city}{company.city && company.state ? " - " : ""}{company.state}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewingCompany(company)}
                      className="flex-1 md:flex-none text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    {!company.fromESocial && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCompany(company)}
                          className="flex-1 md:flex-none text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCompany(company.id)}
                          className="flex-1 md:flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
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

          {paginatedCompanies.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma empresa encontrada</h3>
              <p className="text-muted-foreground">Tente ajustar seus filtros ou adicione uma nova empresa.</p>
            </div>
          )}

          {filteredCompanies.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredCompanies.length}
              />
            </div>
          )}
        </div>
      </ContentContainer>

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
