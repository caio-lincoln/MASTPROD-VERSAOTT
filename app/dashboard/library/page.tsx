"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Download, Eye, Building2, Filter } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { DocumentUploadModal } from "@/components/document-upload-modal"
import { DocumentDetailsModal } from "@/components/document-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { DashboardHeader, ContentContainer, StatusBadge } from "@/app/dashboard/esocial/components/visual-components"
import { cn } from "@/lib/utils"

type CompanyRow = { id: string; razao_social: string }
type DocumentRow = {
  id: string
  nome_arquivo: string
  tipo: string | null
  categoria: string | null
  versao: string | null
  descricao: string | null
  empresa_id: string
  tamanho: number | null
  data_upload: string
  enviado_por: string | null
  tags: string[] | null
  caminho_storage: string
}

const ITEMS_PER_PAGE = 10

export default function LibraryPage() {
  const [search, setSearch] = useState("")
  const [documents, setDocuments] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<any | null>(null)
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
      const { data: docs } = await supabase.from("biblioteca_documentos").select("*").order("data_upload", { ascending: false })
      const mapped = (docs as DocumentRow[]).map((d) => ({
        id: d.id,
        name: d.nome_arquivo,
        type: d.tipo || "",
        size: d.tamanho ? `${(d.tamanho / (1024 * 1024)).toFixed(1)} MB` : "",
        date: d.data_upload?.substring(0, 10),
        category: d.categoria || "",
        companyId: d.empresa_id,
        companyName: "",
        description: d.descricao || "",
        uploadedBy: "",
        version: d.versao || "",
        tags: d.tags || [],
        caminho_storage: d.caminho_storage,
      }))
      setDocuments(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
      const matchesCompany = selectedCompany === "all" || d.companyId === selectedCompany
      return matchesSearch && matchesCompany
    })
  }, [documents, search, selectedCompany])

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredDocuments, currentPage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value)
    setCurrentPage(1)
  }

  const handleUploadDocument = async (data: any) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token || ""
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin_onboarding`
    const resp = await fetch(`${base}/upload-document`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        empresa_id: data.companyId,
        file_name: data.name,
        content_base64: data.content_base64,
        content_type: data.content_type,
        tipo: data.type,
        categoria: data.category,
        versao: data.version,
        descricao: data.description,
        tags: data.tags,
      }),
    })
    if (!resp.ok) return
    setUploadModalOpen(false)
    const { data: docs } = await supabase.from("documentos").select("*").order("data_upload", { ascending: false })
    const mapped = (docs as DocumentRow[]).map((d) => ({
      id: d.id,
      name: d.nome_arquivo,
      type: d.tipo || "",
      size: d.tamanho ? `${(d.tamanho / (1024 * 1024)).toFixed(1)} MB` : "",
      date: d.data_upload?.substring(0, 10),
      category: d.categoria || "",
      companyId: d.empresa_id,
      companyName: "",
      description: d.descricao || "",
      uploadedBy: "",
      version: d.versao || "",
      tags: d.tags || [],
      caminho_storage: d.caminho_storage,
    }))
    setDocuments(mapped)
  }

  const handleDownload = async (doc: any) => {
    const { data, error } = await supabase.storage.from("documentos").createSignedUrl(doc.caminho_storage, 60)
    if (error || !data) return
    window.open(data.signedUrl, "_blank")
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DashboardHeader
        title="Biblioteca Digital"
        subtitle="Documentos e normas de segurança"
      >
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Documento
        </Button>
      </DashboardHeader>

      <ContentContainer className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none">
        <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Filtros Avançados</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar documentos..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-primary/50 focus:border-primary/50">
                    <SelectValue placeholder="Filtrar por empresa" />
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

            {selectedCompany !== "all" && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Exibindo documentos de:</span>
                <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 font-medium border border-orange-500/20">
                  {companies.find((c) => c.id === selectedCompany)?.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {loading && <div className="text-slate-400">Carregando...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {paginatedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 text-lg">{doc.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{doc.type}</span>
                      <span className="text-slate-600">•</span>
                      <span>{doc.size}</span>
                      <span className="text-slate-600">•</span>
                      <span>{doc.date}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">{doc.category}</span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-xs border border-orange-500/20">
                        <Building2 className="w-3 h-3" />
                        {companies.find((c) => c.id === doc.companyId)?.name || ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={() => setViewingDocument(doc)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-800/50">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 text-lg">Nenhum documento encontrado</p>
          </div>
        )}

        {filteredDocuments.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredDocuments.length}
            />
          </div>
        )}
      </ContentContainer>

      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSubmit={handleUploadDocument}
        companies={companies.map((c) => ({ id: c.id, name: c.name, cnpj: "" }))}
      />

      <DocumentDetailsModal
        open={!!viewingDocument}
        onOpenChange={(open) => !open && setViewingDocument(null)}
        document={viewingDocument}
      />
    </div>
  )
}
