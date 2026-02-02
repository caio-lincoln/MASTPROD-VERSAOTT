"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Building2, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Image, 
  FileSpreadsheet,
  Clock
} from "lucide-react"
import { Pagination } from "@/components/pagination"
import { DocumentUploadModal } from "@/components/document-upload-modal"
import { DocumentDetailsModal } from "@/components/document-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient"
import { DashboardHeader, ContentContainer } from "@/app/dashboard/esocial/components/visual-components"

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
  
  // Filters State
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      
      // Fetch companies first
      const { data: empresas } = await supabase.from("empresas").select("id, razao_social")
      const companiesList = (empresas as CompanyRow[]) || []
      setCompanies(companiesList.map((e) => ({ id: e.id, name: e.razao_social })))
      
      // Create a map for quick lookup
      const companyMap = new Map(companiesList.map(c => [c.id, c.razao_social]))

      // Fetch documents
      const { data: docs } = await supabase.from("biblioteca_documentos").select("*").order("data_upload", { ascending: false })
      
      const mapped = (docs as DocumentRow[] || []).map((d) => ({
        id: d.id,
        name: d.nome_arquivo,
        type: d.tipo || "Outro",
        size: d.tamanho ? `${(d.tamanho / (1024 * 1024)).toFixed(2)} MB` : "0 MB",
        date: d.data_upload ? new Date(d.data_upload).toLocaleDateString('pt-BR') : "-",
        category: d.categoria || "Geral",
        companyId: d.empresa_id,
        companyName: companyMap.get(d.empresa_id) || "Empresa desconhecida",
        description: d.descricao || "",
        uploadedBy: "",
        version: d.versao || "1.0",
        tags: d.tags || [],
        caminho_storage: d.caminho_storage,
      }))
      setDocuments(mapped)
      setLoading(false)
    }
    load()
  }, [])

  // Derived lists for filters
  const uniqueTypes = useMemo(() => {
    const types = new Set(documents.map(d => d.type))
    return Array.from(types).filter(Boolean).sort()
  }, [documents])

  const uniqueCategories = useMemo(() => {
    const cats = new Set(documents.map(d => d.category))
    return Array.from(cats).filter(Boolean).sort()
  }, [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) || 
        d.category.toLowerCase().includes(search.toLowerCase()) ||
        (d.tags && d.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())))
      
      const matchesCompany = selectedCompany === "all" || d.companyId === selectedCompany
      const matchesType = selectedType === "all" || d.type === selectedType
      const matchesCategory = selectedCategory === "all" || d.category === selectedCategory

      return matchesSearch && matchesCompany && matchesType && matchesCategory
    })
  }, [documents, search, selectedCompany, selectedType, selectedCategory])

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

  const handleTypeFilter = (value: string) => {
    setSelectedType(value)
    setCurrentPage(1)
  }

  const handleCategoryFilter = (value: string) => {
    setSelectedCategory(value)
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
    
    // Refresh list
    // Ideally extract the load function to reuse it, but duplicating for now to match style
    const { data: docs } = await supabase.from("biblioteca_documentos").select("*").order("data_upload", { ascending: false })
    // Re-fetch companies or use existing state? We need the map again. 
    // Since companies don't change often, let's just reuse the companyMap logic with current companies state if possible, 
    // but inside this function 'companies' state might be stale closure if not careful.
    // Simplest: just fetch docs and map using current companies state which is available in closure.
    
    const companyMap = new Map(companies.map(c => [c.id, c.name]))
    
    const mapped = (docs as DocumentRow[] || []).map((d) => ({
      id: d.id,
      name: d.nome_arquivo,
      type: d.tipo || "Outro",
      size: d.tamanho ? `${(d.tamanho / (1024 * 1024)).toFixed(2)} MB` : "0 MB",
      date: d.data_upload ? new Date(d.data_upload).toLocaleDateString('pt-BR') : "-",
      category: d.categoria || "Geral",
      companyId: d.empresa_id,
      companyName: companyMap.get(d.empresa_id) || "Empresa desconhecida",
      description: d.descricao || "",
      uploadedBy: "",
      version: d.versao || "1.0",
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

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('pdf')) return <FileText className="w-5 h-5" />
    if (t.includes('image') || t.includes('png') || t.includes('jpg')) return <Image className="w-5 h-5" />
    if (t.includes('xls') || t.includes('sheet')) return <FileSpreadsheet className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Biblioteca Digital"
        subtitle="Documentos e normas de segurança"
      >
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Documento
        </Button>
      </DashboardHeader>

      <ContentContainer className="border-0 bg-transparent p-0 shadow-none">
        {/* Filters */}
        <div className="mb-6 p-4 rounded-xl bg-white border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros Avançados</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white border-border text-foreground focus-visible:ring-primary/50 transition-colors duration-200"
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                <SelectTrigger className="pl-10 bg-white border-border text-foreground focus:ring-primary/50 focus:border-primary/50">
                  <SelectValue placeholder="Filtrar por Empresa" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border">
                  <SelectItem value="all">Todas as Empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={selectedType} onValueChange={handleTypeFilter}>
              <SelectTrigger className="bg-white border-border text-foreground focus:ring-primary/50 focus:border-primary/50">
                <SelectValue placeholder="Tipo de Documento" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border">
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="bg-white border-border text-foreground focus:ring-primary/50 focus:border-primary/50">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border">
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Exibindo documentos de:</span>
          <span className="text-sm font-medium text-primary">
            {filteredDocuments.length} documentos encontrados
          </span>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-white border border-border hover:border-primary/50 transition-all duration-300 group shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 group-hover:bg-slate-100 group-hover:text-primary group-hover:border-slate-300 transition-colors">
                      {getFileIcon(doc.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground line-clamp-1" title={doc.name}>
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs border border-slate-200">{doc.type}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-border">
                      <DropdownMenuItem onClick={() => setViewingDocument(doc)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(doc)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]" title={doc.companyName}>
                      {doc.companyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{doc.date}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 text-xs border border-slate-200">{doc.category}</span>
                  {doc.tags.slice(0, 2).map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 text-xs border border-slate-200">
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 2 && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs border border-slate-200">
                      +{doc.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Nenhum documento encontrado</p>
            <p className="text-sm text-slate-500 mt-2">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
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
