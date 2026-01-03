"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Download, Eye, Building2, Filter } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { DocumentUploadModal } from "@/components/document-upload-modal"
import { DocumentDetailsModal } from "@/components/document-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockDocuments = [
  {
    id: 1,
    name: "NR-35 Trabalho em Altura.pdf",
    type: "Norma",
    size: "2.4 MB",
    date: "2024-01-10",
    category: "Legislação",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Norma regulamentadora sobre trabalho em altura - requisitos mínimos e medidas de proteção",
    uploadedBy: "Carlos Silva",
    version: "1.0",
    tags: ["NR-35", "Altura", "Segurança"],
  },
  {
    id: 2,
    name: "Manual EPI - Luvas.pdf",
    type: "Manual",
    size: "1.8 MB",
    date: "2024-01-08",
    category: "Manuais",
    companyId: 2,
    companyName: "Beta Indústria S.A.",
    description: "Manual técnico de uso e conservação de luvas de proteção",
    uploadedBy: "Maria Santos",
    version: "2.1",
    tags: ["EPI", "Luvas", "Manual"],
  },
  {
    id: 3,
    name: "PPRA 2024.pdf",
    type: "Programa",
    size: "5.2 MB",
    date: "2024-01-05",
    category: "Programas",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Programa de Prevenção de Riscos Ambientais - Análise completa dos riscos",
    uploadedBy: "Carlos Silva",
    version: "3.0",
    tags: ["PPRA", "Riscos", "2024"],
  },
  {
    id: 4,
    name: "Checklist Inspeção.xlsx",
    type: "Formulário",
    size: "156 KB",
    date: "2024-01-03",
    category: "Formulários",
    companyId: 3,
    companyName: "Gamma Serviços",
    description: "Formulário de inspeção de segurança para ambientes de trabalho",
    uploadedBy: "João Oliveira",
    version: "1.5",
    tags: ["Checklist", "Inspeção", "Formulário"],
  },
  {
    id: 5,
    name: "NR-10 Eletricidade.pdf",
    type: "Norma",
    size: "3.1 MB",
    date: "2024-01-09",
    category: "Legislação",
    companyId: 2,
    companyName: "Beta Indústria S.A.",
    description: "Norma regulamentadora sobre segurança em instalações e serviços em eletricidade",
    uploadedBy: "Maria Santos",
    version: "1.0",
    tags: ["NR-10", "Eletricidade", "Segurança"],
  },
  {
    id: 6,
    name: "Procedimento Espaço Confinado.pdf",
    type: "Procedimento",
    size: "1.2 MB",
    date: "2024-01-07",
    category: "Procedimentos",
    companyId: 4,
    companyName: "Delta Construções",
    description: "Procedimento operacional padrão para trabalho em espaços confinados",
    uploadedBy: "Pedro Costa",
    version: "2.0",
    tags: ["Espaço Confinado", "Procedimento", "NR-33"],
  },
  {
    id: 7,
    name: "PCMSO 2024.pdf",
    type: "Programa",
    size: "4.8 MB",
    date: "2024-01-06",
    category: "Programas",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Programa de Controle Médico de Saúde Ocupacional",
    uploadedBy: "Carlos Silva",
    version: "3.0",
    tags: ["PCMSO", "Saúde", "2024"],
  },
  {
    id: 8,
    name: "Manual Capacete.pdf",
    type: "Manual",
    size: "890 KB",
    date: "2024-01-04",
    category: "Manuais",
    companyId: 5,
    companyName: "Epsilon Tecnologia",
    description: "Manual de uso e manutenção de capacetes de segurança",
    uploadedBy: "Ana Lima",
    version: "1.2",
    tags: ["EPI", "Capacete", "Manual"],
  },
  {
    id: 9,
    name: "NR-06 EPIs.pdf",
    type: "Norma",
    size: "2.7 MB",
    date: "2024-01-11",
    category: "Legislação",
    companyId: 3,
    companyName: "Gamma Serviços",
    description: "Norma regulamentadora sobre Equipamentos de Proteção Individual",
    uploadedBy: "João Oliveira",
    version: "1.0",
    tags: ["NR-06", "EPI", "Legislação"],
  },
  {
    id: 10,
    name: "Ficha Emergência.xlsx",
    type: "Formulário",
    size: "128 KB",
    date: "2024-01-02",
    category: "Formulários",
    companyId: 2,
    companyName: "Beta Indústria S.A.",
    description: "Ficha de registro para situações de emergência",
    uploadedBy: "Maria Santos",
    version: "1.0",
    tags: ["Emergência", "Formulário", "Segurança"],
  },
  {
    id: 11,
    name: "PGR - Programa Gerenciamento Riscos.pdf",
    type: "Programa",
    size: "6.5 MB",
    date: "2024-01-12",
    category: "Programas",
    companyId: 4,
    companyName: "Delta Construções",
    description: "Programa de Gerenciamento de Riscos - Identificação e controle de riscos ocupacionais",
    uploadedBy: "Pedro Costa",
    version: "1.0",
    tags: ["PGR", "Riscos", "Gerenciamento"],
  },
]

const mockCompanies = [
  { id: 1, name: "Empresa Alpha Ltda", cnpj: "12.345.678/0001-90" },
  { id: 2, name: "Beta Indústria S.A.", cnpj: "23.456.789/0001-01" },
  { id: 3, name: "Gamma Serviços", cnpj: "34.567.890/0001-12" },
  { id: 4, name: "Delta Construções", cnpj: "45.678.901/0001-23" },
  { id: 5, name: "Epsilon Tecnologia", cnpj: "56.789.012/0001-34" },
]

const ITEMS_PER_PAGE = 10

export default function LibraryPage() {
  const [search, setSearch] = useState("")
  const [documents, setDocuments] = useState(mockDocuments)
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<(typeof mockDocuments)[0] | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string>("all")

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
      const matchesCompany = selectedCompany === "all" || d.companyId === Number.parseInt(selectedCompany)
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

  const handleUploadDocument = (data: any) => {
    const newDocument = {
      ...data,
      id: documents.length + 1,
      date: new Date().toISOString().split("T")[0],
    }
    setDocuments([newDocument, ...documents])
    setUploadModalOpen(false)
  }

  const handleDownload = (doc: (typeof mockDocuments)[0]) => {
    alert(`Baixando: ${doc.name}`)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Biblioteca Digital</h2>
          <p className="text-slate-400">Documentos e normas de segurança</p>
        </div>
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Documento
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
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
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="pl-10 bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Filtrar por empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      Todas as empresas
                    </SelectItem>
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="text-white">
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
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                  {mockCompanies.find((c) => c.id === Number.parseInt(selectedCompany))?.name}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{doc.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300">{doc.category}</span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          <Building2 className="w-3 h-3" />
                          {doc.companyName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                      onClick={() => setViewingDocument(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum documento encontrado</p>
            </div>
          )}

          {filteredDocuments.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredDocuments.length}
            />
          )}
        </CardContent>
      </Card>

      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSubmit={handleUploadDocument}
        companies={mockCompanies}
      />

      <DocumentDetailsModal
        open={!!viewingDocument}
        onOpenChange={(open) => !open && setViewingDocument(null)}
        document={viewingDocument}
      />
    </div>
  )
}
