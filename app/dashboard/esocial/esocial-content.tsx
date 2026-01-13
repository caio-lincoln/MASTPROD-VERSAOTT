"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Send,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  Trash2,
  FileCode,
  AlertCircle,
  Plus,
  Settings,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useESocialEvents, useESocialCompanies, ESocialEvent } from "@/hooks/use-esocial"
import { supabase } from "@/lib/supabaseClient"

// Mock modal components for demonstration purposes if actual components are not provided
const EventS2240Modal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white mb-2">Criar Evento S-2240</h3>
            <p className="text-sm text-slate-400">Preencha os campos para criar um novo evento S-2240.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-slate-400">Formulário de criação de evento S-2240 aqui...</p>
          </div>
          <div className="p-6 border-t border-slate-800">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
)
const EventS2220Modal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white mb-2">Criar Evento S-2220</h3>
            <p className="text-sm text-slate-400">Preencha os campos para criar um novo evento S-2220.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-slate-400">Formulário de criação de evento S-2220 aqui...</p>
          </div>
          <div className="p-6 border-t border-slate-800">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
)
const EventS2210Modal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white mb-2">Criar Evento S-2210</h3>
            <p className="text-sm text-slate-400">Preencha os campos para criar um novo evento S-2210.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-slate-400">Formulário de criação de evento S-2210 aqui...</p>
          </div>
          <div className="p-6 border-t border-slate-800">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
)

const ITEMS_PER_PAGE = 10
const COMPANIES_PER_PAGE = 5

export default function ESocialContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchS2240, setSearchS2240] = useState("")
  const [searchS2220, setSearchS2220] = useState("")
  const [searchS2210, setSearchS2210] = useState("")
  const [currentPageS2240, setCurrentPageS2240] = useState(1)
  const [currentPageS2220, setCurrentPageS2220] = useState(1)
  const [currentPageS2210, setCurrentPageS2210] = useState(1)

  const [detailsModal, setDetailsModal] = useState<any>(null)
  const [showLinkCompanyModal, setShowLinkCompanyModal] = useState(false)
  const [companySearch, setCompanySearch] = useState("")
  const [companyPage, setCompanyPage] = useState(1)

  const [showCreateS2240Modal, setShowCreateS2240Modal] = useState(false)
  const [showCreateS2220Modal, setShowCreateS2220Modal] = useState(false)
  const [showCreateS2210Modal, setShowCreateS2210Modal] = useState(false)
  const [mandatoryTab, setMandatoryTab] = useState("s1000")
  
  // Mandatory Events Search/Pagination States
  const [searchS1000, setSearchS1000] = useState("")
  const [searchS1005, setSearchS1005] = useState("")
  const [searchS1020, setSearchS1020] = useState("")
  const [currentPageS1000, setCurrentPageS1000] = useState(1)
  const [currentPageS1005, setCurrentPageS1005] = useState(1)
  const [currentPageS1020, setCurrentPageS1020] = useState(1)

  // Hooks para dados reais
  const { events, loading: loadingEvents, refresh: refreshEvents } = useESocialEvents()
  const { companies: allCompanies, loading: loadingCompanies, refresh: refreshCompanies } = useESocialCompanies()

  // Mapeamento de dados para o formato esperado pela UI
  const mapEvent = (e: ESocialEvent) => ({
    id: e.id,
    employee: e.funcionario?.nome || "Desconhecido",
    date: new Date(e.created_at).toLocaleDateString("pt-BR"),
    status: e.status.charAt(0).toUpperCase() + e.status.slice(1),
    company: e.empresa?.razao_social || "Desconhecida",
    protocol: e.protocolo,
    xml: e.xml_envio,
    errorMessage: e.mensagem_erro,
    // Placeholders pois essas infos estariam no XML
    risk: "Ver detalhes",
    exam: "Ver detalhes",
    type: "Ver detalhes"
  })

  const s2240Events = useMemo(() => events.filter(e => e.tipo_evento === 'S-2240').map(mapEvent), [events])
  const s2220Events = useMemo(() => events.filter(e => e.tipo_evento === 'S-2220').map(mapEvent), [events])
  const s2210Events = useMemo(() => events.filter(e => e.tipo_evento === 'S-2210').map(mapEvent), [events])
  const s1000Events = useMemo(() => events.filter(e => e.tipo_evento === 'S-1000').map(mapEvent), [events])
  const s1005Events = useMemo(() => events.filter(e => e.tipo_evento === 'S-1005').map(mapEvent), [events])
  const s1020Events = useMemo(() => events.filter(e => e.tipo_evento === 'S-1020').map(mapEvent), [events])

  // Filtragem e Paginação S-2240
  const filteredS2240 = useMemo(() => {
    return s2240Events.filter(
      (e) =>
        e.employee.toLowerCase().includes(searchS2240.toLowerCase())
    )
  }, [searchS2240, s2240Events])

  const totalPagesS2240 = Math.ceil(filteredS2240.length / ITEMS_PER_PAGE)
  const paginatedS2240 = useMemo(() => {
    const startIndex = (currentPageS2240 - 1) * ITEMS_PER_PAGE
    return filteredS2240.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS2240, currentPageS2240])

  // Filtragem e Paginação S-2220
  const filteredS2220 = useMemo(() => {
    return s2220Events.filter(
      (e) =>
        e.employee.toLowerCase().includes(searchS2220.toLowerCase())
    )
  }, [searchS2220, s2220Events])

  const totalPagesS2220 = Math.ceil(filteredS2220.length / ITEMS_PER_PAGE)
  const paginatedS2220 = useMemo(() => {
    const startIndex = (currentPageS2220 - 1) * ITEMS_PER_PAGE
    return filteredS2220.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS2220, currentPageS2220])

  // Filtragem e Paginação S-2210
  const filteredS2210 = useMemo(() => {
    return s2210Events.filter(
      (e) =>
        e.employee.toLowerCase().includes(searchS2210.toLowerCase())
    )
  }, [searchS2210, s2210Events])

  const totalPagesS2210 = Math.ceil(filteredS2210.length / ITEMS_PER_PAGE)
  const paginatedS2210 = useMemo(() => {
    const startIndex = (currentPageS2210 - 1) * ITEMS_PER_PAGE
    return filteredS2210.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS2210, currentPageS2210])

  // Filtragem e Paginação S-1000
  const filteredS1000 = useMemo(() => {
    return s1000Events.filter(
      (e) =>
        e.company.toLowerCase().includes(searchS1000.toLowerCase()) || 
        e.status.toLowerCase().includes(searchS1000.toLowerCase())
    )
  }, [searchS1000, s1000Events])

  const totalPagesS1000 = Math.ceil(filteredS1000.length / ITEMS_PER_PAGE)
  const paginatedS1000 = useMemo(() => {
    const startIndex = (currentPageS1000 - 1) * ITEMS_PER_PAGE
    return filteredS1000.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS1000, currentPageS1000])

  // Filtragem e Paginação S-1005
  const filteredS1005 = useMemo(() => {
    return s1005Events.filter(
      (e) =>
        e.company.toLowerCase().includes(searchS1005.toLowerCase())
    )
  }, [searchS1005, s1005Events])

  const totalPagesS1005 = Math.ceil(filteredS1005.length / ITEMS_PER_PAGE)
  const paginatedS1005 = useMemo(() => {
    const startIndex = (currentPageS1005 - 1) * ITEMS_PER_PAGE
    return filteredS1005.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS1005, currentPageS1005])

  // Filtragem e Paginação S-1020
  const filteredS1020 = useMemo(() => {
    return s1020Events.filter(
      (e) =>
        e.company.toLowerCase().includes(searchS1020.toLowerCase())
    )
  }, [searchS1020, s1020Events])

  const totalPagesS1020 = Math.ceil(filteredS1020.length / ITEMS_PER_PAGE)
  const paginatedS1020 = useMemo(() => {
    const startIndex = (currentPageS1020 - 1) * ITEMS_PER_PAGE
    return filteredS1020.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS1020, currentPageS1020])

  // Empresas Vinculadas
  const linkedCompanies = useMemo(() => {
    return allCompanies.filter(c => c.origem === 'esocial' || c.esocial_status !== 'NAO_REGISTRADO')
  }, [allCompanies])

  const filteredLinkedCompanies = useMemo(() => {
    return linkedCompanies.filter(
      (c) => c.razao_social.toLowerCase().includes(companySearch.toLowerCase()) || c.cnpj.includes(companySearch),
    )
  }, [linkedCompanies, companySearch])

  const totalCompanyPages = Math.ceil(filteredLinkedCompanies.length / COMPANIES_PER_PAGE)
  const paginatedLinkedCompanies = useMemo(() => {
    const startIndex = (companyPage - 1) * COMPANIES_PER_PAGE
    return filteredLinkedCompanies.slice(startIndex, startIndex + COMPANIES_PER_PAGE)
  }, [filteredLinkedCompanies, companyPage])

  // Empresas Disponíveis para Vínculo
  const availableCompanies = useMemo(() => {
    return allCompanies.filter(c => c.origem !== 'esocial' && (!c.esocial_status || c.esocial_status === 'NAO_REGISTRADO'))
  }, [allCompanies])


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Enviado":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      case "Pendente":
        return <Clock className="w-4 h-4 text-amber-400" />
      case "Erro":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enviado":
        return "bg-emerald-500/10 text-emerald-400"
      case "Pendente":
        return "bg-amber-500/10 text-amber-400"
      case "Erro":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-slate-500/10 text-slate-400"
    }
  }

  const handleDownloadXML = (event: any) => {
    if (!event.xml) {
      alert("XML não disponível para este evento")
      return
    }
    const blob = new Blob([event.xml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `evento-${event.id}-${event.date}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSendEvent = (event: any) => {
    alert(`Enviando evento ${event.id} - ${event.employee}`)
  }

  const handleGenerateXML = (event: any) => {
    alert(`Gerando XML para evento ${event.id} - ${event.employee}`)
  }

  const handleDeleteEvent = (event: any) => {
    if (confirm(`Deseja realmente excluir o evento de ${event.employee}?`)) {
      alert(`Evento ${event.id} excluído`)
    }
  }

  const handleLinkCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ origem: 'esocial', esocial_status: 'REGISTRADO' })
        .eq('id', companyId)

      if (error) throw error
      refreshCompanies()
      setShowLinkCompanyModal(false)
    } catch (error) {
      console.error('Erro ao vincular empresa:', error)
      alert('Erro ao vincular empresa')
    }
  }

  const handleUnlinkCompany = async (companyId: string) => {
    if (!confirm('Deseja realmente desvincular esta empresa?')) return
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ esocial_status: 'NAO_REGISTRADO' })
        .eq('id', companyId)

      if (error) throw error
      refreshCompanies()
    } catch (error) {
      console.error('Erro ao desvincular empresa:', error)
      alert('Erro ao desvincular empresa')
    }
  }

  const handleCompanySearch = (value: string) => {
    setCompanySearch(value)
    setCompanyPage(1)
  }

  const renderEventCard = (event: any, type: string) => {
    const hasError = event.status === "Erro"
    const isPending = event.status === "Pendente"

    return (
      <div key={event.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{event.employee}</h4>
            <p className="text-sm text-slate-400">{event.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(event.status)}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{event.date}</span>
          </div>
          <span>
            {type === "s2240" && `Risco: ${event.risk}`}
            {type === "s2220" && `Exame: ${event.exam}`}
            {type === "s2210" && `Tipo: ${event.type}`}
          </span>
        </div>

        {event.protocol && <div className="text-xs text-slate-500 mb-3">Protocolo: {event.protocol}</div>}

        {hasError && (
          <Alert className="mb-3 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">Erro no envio</AlertTitle>
            <AlertDescription className="text-red-300/80 text-sm">{event.errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            onClick={() => setDetailsModal(event)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Detalhes
          </Button>

          {isPending && (
            <>
              <Button
                size="sm"
                className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
                onClick={() => handleGenerateXML(event)}
              >
                <FileCode className="w-3 h-3 mr-1" />
                Gerar XML
              </Button>
              <Button
                size="sm"
                className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
                onClick={() => handleSendEvent(event)}
              >
                <Send className="w-3 h-3 mr-1" />
                Enviar
              </Button>
            </>
          )}

          {event.xml && (
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
              onClick={() => handleDownloadXML(event)}
            >
              <Download className="w-3 h-3 mr-1" />
              Baixar XML
            </Button>
          )}

          {hasError && (
            <Button
              size="sm"
              className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20"
              onClick={() => handleSendEvent(event)}
            >
              <Send className="w-3 h-3 mr-1" />
              Reenviar
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent"
            onClick={() => handleDeleteEvent(event)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Excluir
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">e-Social</h2>
          <p className="text-slate-400">Gestão de eventos do e-Social</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="s2240" className="data-[state=active]:bg-slate-800">
            S-2240
          </TabsTrigger>
          <TabsTrigger value="s2220" className="data-[state=active]:bg-slate-800">
            S-2220
          </TabsTrigger>
          <TabsTrigger value="s2210" className="data-[state=active]:bg-slate-800">
            S-2210
          </TabsTrigger>
          <TabsTrigger value="mandatory" className="data-[state=active]:bg-slate-800">
            Eventos Obrigatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Empresas Vinculadas</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowLinkCompanyModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Vincular Empresa
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar empresas vinculadas..."
                  value={companySearch}
                  onChange={(e) => handleCompanySearch(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paginatedLinkedCompanies.length > 0 ? (
                  paginatedLinkedCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{company.razao_social}</h4>
                        <p className="text-sm text-slate-400">
                          CNPJ: {company.cnpj} • {company.total_funcionarios || 0} funcionários • {company.cidade || 'N/A'}/{company.estado || 'UF'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configurar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnlinkCompany(company.id)}
                          className="border-red-900 text-red-400 hover:bg-red-950 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    {companySearch ? "Nenhuma empresa encontrada" : "Nenhuma empresa vinculada"}
                  </div>
                )}
              </div>

              {filteredLinkedCompanies.length > 0 && (
                <Pagination
                  currentPage={companyPage}
                  totalPages={totalCompanyPages}
                  onPageChange={setCompanyPage}
                  itemsPerPage={COMPANIES_PER_PAGE}
                  totalItems={filteredLinkedCompanies.length}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">S-2240 - Exposição a Riscos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{s2240Events.length}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400">
                    {s2240Events.filter((e) => e.status === "Enviado").length} enviados
                  </span>
                  <span className="text-red-400">
                    {s2240Events.filter((e) => e.status === "Erro").length} erros
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">S-2220 - Exames Médicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{s2220Events.length}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400">
                    {s2220Events.filter((e) => e.status === "Enviado").length} enviados
                  </span>
                  <span className="text-red-400">
                    {s2220Events.filter((e) => e.status === "Erro").length} erros
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">S-2210 - Acidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{s2210Events.length}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400">
                    {s2210Events.filter((e) => e.status === "Enviado").length} enviados
                  </span>
                  <span className="text-red-400">
                    {s2210Events.filter((e) => e.status === "Erro").length} erros
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="s2240" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    S-2240 - Condições Ambientais do Trabalho
                  </CardTitle>
                  <p className="text-sm text-slate-400 mt-2">Relatório de exposição a riscos ocupacionais</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreateS2240Modal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar por funcionário ou risco..."
                  value={searchS2240}
                  onChange={(e) => {
                    setSearchS2240(e.target.value)
                    setCurrentPageS2240(1)
                  }}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">{paginatedS2240.map((event) => renderEventCard(event, "s2240"))}</div>
              {filteredS2240.length > 0 && (
                <Pagination
                  currentPage={currentPageS2240}
                  totalPages={totalPagesS2240}
                  onPageChange={setCurrentPageS2240}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredS2240.length}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="s2220" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    S-2220 - Monitoramento da Saúde
                  </CardTitle>
                  <p className="text-sm text-slate-400 mt-2">Registros de exames médicos ocupacionais</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreateS2220Modal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar por funcionário ou tipo de exame..."
                  value={searchS2220}
                  onChange={(e) => {
                    setSearchS2220(e.target.value)
                    setCurrentPageS2220(1)
                  }}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">{paginatedS2220.map((event) => renderEventCard(event, "s2220"))}</div>
              {filteredS2220.length > 0 && (
                <Pagination
                  currentPage={currentPageS2220}
                  totalPages={totalPagesS2220}
                  onPageChange={setCurrentPageS2220}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredS2220.length}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="s2210" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    S-2210 - Comunicação de Acidente de Trabalho
                  </CardTitle>
                  <p className="text-sm text-slate-400 mt-2">Registros de acidentes de trabalho</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreateS2210Modal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar por funcionário ou tipo de acidente..."
                  value={searchS2210}
                  onChange={(e) => {
                    setSearchS2210(e.target.value)
                    setCurrentPageS2210(1)
                  }}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">{paginatedS2210.map((event) => renderEventCard(event, "s2210"))}</div>
              {filteredS2210.length > 0 && (
                <Pagination
                  currentPage={currentPageS2210}
                  totalPages={totalPagesS2210}
                  onPageChange={setCurrentPageS2210}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredS2210.length}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mandatory" className="space-y-4">
          <Tabs value={mandatoryTab} onValueChange={setMandatoryTab} className="w-full">
            <TabsList className="bg-slate-900 border border-slate-800 mb-4">
              <TabsTrigger value="s1000" className="data-[state=active]:bg-slate-800">
                S-1000
              </TabsTrigger>
              <TabsTrigger value="s1005" className="data-[state=active]:bg-slate-800">
                S-1005
              </TabsTrigger>
              <TabsTrigger value="s1020" className="data-[state=active]:bg-slate-800">
                S-1020
              </TabsTrigger>
            </TabsList>

            <TabsContent value="s1000" className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        S-1000 - Informações do Empregador
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-2">Cadastro do empregador e informações tributárias</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => alert("Funcionalidade de criar S-1000 em desenvolvimento")}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Evento
                    </Button>
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Buscar por empresa ou status..."
                      value={searchS1000}
                      onChange={(e) => {
                        setSearchS1000(e.target.value)
                        setCurrentPageS1000(1)
                      }}
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">{paginatedS1000.map((event) => renderEventCard(event, "s1000"))}</div>
                  {filteredS1000.length > 0 && (
                    <Pagination
                      currentPage={currentPageS1000}
                      totalPages={totalPagesS1000}
                      onPageChange={setCurrentPageS1000}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={filteredS1000.length}
                    />
                  )}
                  {filteredS1000.length === 0 && (
                    <div className="text-center py-8 text-slate-400">Nenhum evento S-1000 encontrado</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="s1005" className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        S-1005 - Tabela de Estabelecimentos
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-2">Cadastro de estabelecimentos, obras ou unidades</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => alert("Funcionalidade de criar S-1005 em desenvolvimento")}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Evento
                    </Button>
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Buscar por empresa..."
                      value={searchS1005}
                      onChange={(e) => {
                        setSearchS1005(e.target.value)
                        setCurrentPageS1005(1)
                      }}
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">{paginatedS1005.map((event) => renderEventCard(event, "s1005"))}</div>
                  {filteredS1005.length > 0 && (
                    <Pagination
                      currentPage={currentPageS1005}
                      totalPages={totalPagesS1005}
                      onPageChange={setCurrentPageS1005}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={filteredS1005.length}
                    />
                  )}
                  {filteredS1005.length === 0 && (
                    <div className="text-center py-8 text-slate-400">Nenhum evento S-1005 encontrado</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="s1020" className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        S-1020 - Tabela de Lotações Tributárias
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-2">Cadastro de lotações tributárias</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => alert("Funcionalidade de criar S-1020 em desenvolvimento")}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Evento
                    </Button>
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Buscar por empresa..."
                      value={searchS1020}
                      onChange={(e) => {
                        setSearchS1020(e.target.value)
                        setCurrentPageS1020(1)
                      }}
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">{paginatedS1020.map((event) => renderEventCard(event, "s1020"))}</div>
                  {filteredS1020.length > 0 && (
                    <Pagination
                      currentPage={currentPageS1020}
                      totalPages={totalPagesS1020}
                      onPageChange={setCurrentPageS1020}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={filteredS1020.length}
                    />
                  )}
                  {filteredS1020.length === 0 && (
                    <div className="text-center py-8 text-slate-400">Nenhum evento S-1020 encontrado</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {showCreateS2240Modal && (
        <EventS2240Modal isOpen={showCreateS2240Modal} onClose={() => setShowCreateS2240Modal(false)} />
      )}

      {showCreateS2220Modal && (
        <EventS2220Modal isOpen={showCreateS2220Modal} onClose={() => setShowCreateS2220Modal(false)} />
      )}

      {showCreateS2210Modal && (
        <EventS2210Modal isOpen={showCreateS2210Modal} onClose={() => setShowCreateS2210Modal(false)} />
      )}

      {showLinkCompanyModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setShowLinkCompanyModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white mb-2">Vincular Empresa ao e-Social</h3>
              <p className="text-sm text-slate-400">Selecione uma empresa para vincular aos eventos e-Social</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {availableCompanies.length > 0 ? (
                  availableCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-600 transition-all cursor-pointer"
                      onClick={() => handleLinkCompany(company.id)}
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{company.razao_social}</h4>
                        <p className="text-sm text-slate-400">
                          CNPJ: {company.cnpj} • {company.total_funcionarios || 0} funcionários • {company.cidade || 'N/A'}/{company.estado || 'UF'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Vincular
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">Todas as empresas já estão vinculadas</div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-800">
              <Button
                onClick={() => setShowLinkCompanyModal(false)}
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!detailsModal} onOpenChange={() => setDetailsModal(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento</DialogTitle>
            <DialogDescription className="text-slate-400">Informações completas do evento e-Social</DialogDescription>
          </DialogHeader>

          {detailsModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Funcionário</label>
                  <p className="text-white font-medium break-words">{detailsModal.employee}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(detailsModal.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(detailsModal.status)}`}
                    >
                      {detailsModal.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Data</label>
                  <p className="text-white">{detailsModal.date}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Empresa</label>
                  <p className="text-white break-words">{detailsModal.company}</p>
                </div>
                {detailsModal.risk && (
                  <div className="sm:col-span-2">
                    <label className="text-sm text-slate-400">Risco</label>
                    <p className="text-white break-words">{detailsModal.risk}</p>
                  </div>
                )}
                {detailsModal.exam && (
                  <div className="sm:col-span-2">
                    <label className="text-sm text-slate-400">Exame</label>
                    <p className="text-white break-words">{detailsModal.exam}</p>
                  </div>
                )}
                {detailsModal.type && (
                  <div className="sm:col-span-2">
                    <label className="text-sm text-slate-400">Tipo</label>
                    <p className="text-white break-words">{detailsModal.type}</p>
                  </div>
                )}
                {detailsModal.protocol && (
                  <div className="sm:col-span-2">
                    <label className="text-sm text-slate-400">Protocolo</label>
                    <p className="text-white font-mono text-sm break-all">{detailsModal.protocol}</p>
                  </div>
                )}
              </div>

              {detailsModal.errorMessage && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertTitle className="text-red-400">Erro no envio</AlertTitle>
                  <AlertDescription className="text-red-300/80 break-words">
                    {detailsModal.errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {detailsModal.xml && (
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">XML do Evento</label>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 overflow-x-auto max-h-60 overflow-y-auto">
                    <code className="break-all whitespace-pre-wrap">{detailsModal.xml}</code>
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-700">
                {detailsModal.xml && (
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
                    onClick={() => handleDownloadXML(detailsModal)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar XML
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 w-full sm:w-auto bg-transparent"
                  onClick={() => setDetailsModal(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
