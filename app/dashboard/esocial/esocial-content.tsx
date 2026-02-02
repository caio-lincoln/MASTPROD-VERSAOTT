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
  Activity,
  AlertTriangle,
  Search,
  CheckCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useESocialEvents, useESocialCompanies, ESocialEvent } from "@/hooks/use-esocial"
import { supabase } from "@/lib/supabaseClient"
import { createS1000Event, regenerateS1000XML } from "@/lib/esocial/events/S-1000"
import { Label } from "@/components/ui/label"
import { transmitEvent, consultEvent } from "@/lib/esocial/transmission/gateway"
import type {
  ESocialTransmissionRequest,
  ESocialTransmissionResponse,
  ESocialConsultResponse,
} from "@/lib/esocial/transmission/contract"
import { listCompanyCertificates, getDefaultCompanyCertificate, attachCertificateToEvent } from "@/lib/esocial/events/repository"
import type { Certificate } from "@/lib/esocial/events/types"

// Import Visual Components
import { 
  KpiCard, 
  DashboardHeader, 
  ContentContainer, 
  StatusBadge
} from "./components/visual-components"

// Mock modal components for demonstration purposes if actual components are not provided
const EventS2240Modal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">Criar Evento S-2240</h3>
            <p className="text-sm text-muted-foreground">Preencha os campos para criar um novo evento S-2240.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-muted-foreground">Formulário de criação de evento S-2240 aqui...</p>
          </div>
          <div className="p-6 border-t border-border">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-border text-muted-foreground hover:bg-slate-50 bg-white"
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
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">Criar Evento S-2220</h3>
            <p className="text-sm text-muted-foreground">Preencha os campos para criar um novo evento S-2220.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-muted-foreground">Formulário de criação de evento S-2220 aqui...</p>
          </div>
          <div className="p-6 border-t border-border">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-border text-muted-foreground hover:bg-slate-50 bg-white"
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
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">Criar Evento S-2210</h3>
            <p className="text-sm text-muted-foreground">Preencha os campos para criar um novo evento S-2210.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-muted-foreground">Formulário de criação de evento S-2210 aqui...</p>
          </div>
          <div className="p-6 border-t border-border">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-border text-muted-foreground hover:bg-slate-50 bg-white"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
)

const EventS1000Modal = ({ isOpen, onClose, companies, onSuccess }: { isOpen: boolean; onClose: () => void; companies: any[]; onSuccess: () => void }) => {
  const [selectedCompany, setSelectedCompany] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!selectedCompany) return
    setLoading(true)
    setError(null)
    try {
      const res = await createS1000Event(selectedCompany)
      if ((res as any).success) {
        onSuccess()
        onClose()
      } else if ((res as any).errors) {
        setError((res as any).errors.join("\n"))
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white border border-border rounded-lg max-w-md w-full p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4">Gerar S-1000</h3>
          <p className="text-sm text-muted-foreground mb-4">Selecione a empresa para gerar o evento inicial S-1000.</p>
          
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-700" />
              <AlertTitle className="text-red-700">Erro de Validação</AlertTitle>
              <AlertDescription className="text-red-700 text-sm whitespace-pre-line mt-1">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Selecione a Empresa</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-full bg-white border-border text-foreground">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.razao_social} ({c.cnpj})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onClose} disabled={loading} className="border-border text-muted-foreground hover:bg-slate-50 bg-white">
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!selectedCompany || loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? "Gerando..." : "Gerar XML"}
              </Button>
            </div>
          </div>
        </div>
      </div>
  )
}

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
  const [showCreateS1000Modal, setShowCreateS1000Modal] = useState(false)
  const [currentPageS1005, setCurrentPageS1005] = useState(1)
  const [currentPageS1020, setCurrentPageS1020] = useState(1)

  const [showSendModal, setShowSendModal] = useState(false)
  const [sendModalEvent, setSendModalEvent] = useState<any | null>(null)
  const [sendModalCertificates, setSendModalCertificates] = useState<Certificate[]>([])
  const [sendModalDefaultCertificate, setSendModalDefaultCertificate] = useState<Certificate | null>(null)
  const [selectedCertificateId, setSelectedCertificateId] = useState<string>("")
  const [useDefaultCertificate, setUseDefaultCertificate] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Hooks para dados reais
  const { events, loading: loadingEvents, refresh: refreshEvents } = useESocialEvents()
  const { companies: allCompanies, loading: loadingCompanies, refresh: refreshCompanies } = useESocialCompanies()

  const mapEvent = (e: ESocialEvent) => ({
    id: e.id,
    eventType: e.tipo_evento,
    companyId: (e as any).empresa_id,
    certificateId: (e as any).certificate_id,
    employee: e.funcionario?.nome || (e.tipo_evento.startsWith('S-1') ? 'Cadastro Patronal' : `Evento ${e.tipo_evento} - ${e.id.substring(0,8)}...`),
    date: new Date(e.created_at).toLocaleDateString("pt-BR"),
    status: e.status.charAt(0).toUpperCase() + e.status.slice(1),
    company: e.empresa?.razao_social || "Desconhecida",
    protocol: e.protocolo,
    xml: e.xml_envio,
    xmlReturn: e.xml_retorno,
    receipt: e.recibo,
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
        return <CheckCircle2 className="w-4 h-4 text-success" />
      case "Pendente":
        return <Clock className="w-4 h-4 text-warning" />
      case "Erro":
        return <XCircle className="w-4 h-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enviado":
        return "bg-green-50 text-green-700"
      case "Pendente":
        return "bg-amber-50 text-amber-700"
      case "Erro":
        return "bg-red-50 text-red-700"
      default:
        return "bg-slate-100 text-slate-600"
    }
  }

  const handleDownloadXML = (event: any, kind: "envio" | "retorno" = "envio") => {
    const xmlContent = kind === "envio" ? event.xml : event.xmlReturn
    if (!xmlContent) {
      alert("XML não disponível para este evento")
      return
    }
    const blob = new Blob([xmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download =
      kind === "envio"
        ? `evento-${event.id}-${event.date}-envio.xml`
        : `evento-${event.id}-${event.date}-retorno.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  const openSendModal = async (event: any) => {
    try {
      setSendError(null)
      setUseDefaultCertificate(false)
      setSelectedCertificateId("")
      setSendModalCertificates([])
      setSendModalDefaultCertificate(null)
      setSendModalEvent(event)
      setShowSendModal(true)

      if (!event.companyId) {
        setSendError("Evento não está vinculado a uma empresa. Não é possível selecionar certificado.")
        return
      }

      const certificates = await listCompanyCertificates(event.companyId)
      setSendModalCertificates(certificates)

      const defaultCert = await getDefaultCompanyCertificate(event.companyId)
      setSendModalDefaultCertificate(defaultCert)

      if (event.certificateId) {
        setSelectedCertificateId(event.certificateId)
      } else if (defaultCert) {
        setSelectedCertificateId(defaultCert.id)
        setUseDefaultCertificate(true)
      }
    } catch (error: any) {
      setSendError(error.message || "Erro ao carregar certificados da empresa.")
    }
  }

  const handleSendEvent = async () => {
    if (!sendModalEvent) {
      return
    }

    try {
      setSendLoading(true)
      setSendError(null)

      if (!selectedCertificateId) {
        setSendError("Selecione um certificado para envio.")
        setSendLoading(false)
        return
      }

      if (!sendModalEvent.certificateId || sendModalEvent.certificateId !== selectedCertificateId) {
        await attachCertificateToEvent(sendModalEvent.id, selectedCertificateId)
      }

      const payload: ESocialTransmissionRequest = {
        eventType: sendModalEvent.eventType,
        eventId: sendModalEvent.id,
        environment: "homologation",
        xml: sendModalEvent.xml,
      }

      const result: ESocialTransmissionResponse = await transmitEvent(payload)

      await refreshEvents()

      if (result.status === "enviado") {
        alert(`Lote enviado com sucesso. Protocolo: ${result.protocolo}`)
      } else {
        alert(`Erro no envio: [${result.codigo}] ${result.mensagem}`)
      }

      setShowSendModal(false)
      setSendModalEvent(null)
    } catch (err: any) {
      console.error("Erro ao marcar evento para envio:", err)
      
      let message = err.message || "Erro desconhecido ao enviar evento."
      
      // Tratamento específico para erro de conexão/fetch que pode não ter sido capturado ou formatado
      if (message.includes("Failed to fetch") || message.includes("Network request failed")) {
        message = "Não foi possível conectar ao servidor. Verifique se a API está rodando e acessível."
      }

      setSendError(message)
    } finally {
      setSendLoading(false)
    }
  }

  const handleToggleUseDefaultCertificate = () => {
    if (!sendModalDefaultCertificate) {
      return
    }

    const next = !useDefaultCertificate
    setUseDefaultCertificate(next)

    if (next) {
      setSelectedCertificateId(sendModalDefaultCertificate.id)
    }
  }

  const handleChangeSelectedCertificate = (value: string) => {
    setSelectedCertificateId(value)
    if (sendModalDefaultCertificate && value !== sendModalDefaultCertificate.id) {
      setUseDefaultCertificate(false)
    }
  }

  const handleCloseSendModal = () => {
    if (sendLoading) return
    setShowSendModal(false)
    setSendModalEvent(null)
    setSendModalCertificates([])
    setSendModalDefaultCertificate(null)
    setSelectedCertificateId("")
    setUseDefaultCertificate(false)
    setSendError(null)
  }

  const handleSendEventClick = (event: any) => {
    openSendModal(event)
  }

  const handleResendEventClick = (event: any) => {
    openSendModal(event)
  }

  const handleGenerateXML = async (event: any) => {
    try {
      if (event.eventType === 'S-1000') {
        const res = await regenerateS1000XML(event.id)
        if (res && !res.success && res.errors) {
          alert(res.errors.join('\n'))
          return
        }
        await refreshEvents()
        alert('XML do evento S-1000 gerado e salvo com sucesso.')
        return
      }

      alert('Geração automática de XML ainda não está implementada para este tipo de evento.')
    } catch (err) {
      console.error('Erro ao gerar XML do evento:', err)
      alert('Erro ao gerar XML do evento.')
    }
  }

  const handleDeleteEvent = async (event: any) => {
    if (!confirm(`Deseja realmente excluir o evento de ${event.employee}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('esocial_eventos')
        .delete()
        .eq('id', event.id)

      if (error) {
        throw error
      }

      await refreshEvents()
    } catch (err) {
      console.error('Erro ao excluir evento eSocial:', err)
      alert('Erro ao excluir evento.')
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

  const handleConsultProcessing = async (event: any) => {
    if (!event.id) {
      return
    }

    try {
      const response = await consultEvent({
        eventId: event.id,
        environment: "homologation",
      })

      await refreshEvents()

      if (response.status === "processado") {
        alert(`Evento processado com sucesso.\nCódigo: ${response.codigo}\nRecibo: ${response.recibo}`)
      } else {
        alert(`Erro na consulta: [${response.codigo}] ${response.mensagem}`)
      }
    } catch (err: any) {
      console.error("Erro na consulta de processamento do evento eSocial:", err)
      alert(err.message || "Erro ao consultar processamento do evento.")
    }
  }

  const renderEventCard = (event: any, type: string) => {
    const hasError = event.status === "Erro"
    const isPending = event.status === "Pendente"
    const canConsult = event.protocol && (event.status === "Enviado" || event.status === "Processando")

    return (
      <div key={event.id} className="bg-white border border-border rounded-lg p-5 group hover:border-primary/30 transition-all duration-300 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-foreground mb-1.5 text-lg group-hover:text-primary transition-colors">{event.employee}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span>{event.company}</span>
            </div>
          </div>
          <StatusBadge status={event.status} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 bg-slate-50 p-2 rounded-lg border border-border">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <span>
            {type === "s2240" && `Risco: ${event.risk}`}
            {type === "s2220" && `Exame: ${event.exam}`}
            {type === "s2210" && `Tipo: ${event.type}`}
            {type === "s1000" && `Cadastro de Empregador`}
            {type === "s1005" && `Estabelecimentos`}
            {type === "s1020" && `Lotações`}
          </span>
        </div>

        {event.protocol && (
          <div className="text-xs text-muted-foreground mb-4 font-mono bg-slate-50 p-1.5 rounded border border-border inline-block">
            Protocolo: {event.protocol}
          </div>
        )}

        {hasError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-700" />
            <AlertTitle className="text-red-700 text-xs font-bold">Erro no envio</AlertTitle>
            <AlertDescription className="text-red-700 text-xs mt-1">{event.errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-slate-100 h-8"
            onClick={() => setDetailsModal(event)}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Detalhes
          </Button>

          {isPending && (
            <>
              <Button
                size="sm"
                className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 h-8"
                onClick={() => handleGenerateXML(event)}
              >
                <FileCode className="w-3.5 h-3.5 mr-1.5" />
                Gerar XML
              </Button>
              <Button
                size="sm"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 h-8"
                onClick={() => handleSendEventClick(event)}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Enviar
              </Button>
            </>
          )}

          {canConsult && (
            <Button
              size="sm"
              className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 h-8"
              onClick={() => handleConsultProcessing(event)}
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Consultar
            </Button>
          )}

          {event.xml && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-slate-100 h-8"
              onClick={() => handleDownloadXML(event)}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              XML
            </Button>
          )}

          {hasError && (
            <Button
              size="sm"
              className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 h-8"
              onClick={() => handleResendEventClick(event)}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Reenviar
            </Button>
          )}

          <div className="ml-auto">
             <Button
              size="sm"
              variant="ghost"
              className="text-red-700 hover:text-red-800 hover:bg-red-50 h-8 px-2"
              onClick={() => handleDeleteEvent(event)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate stats for KPIs
  const totalSent = events.filter(e => e.status === 'Enviado' || e.status === 'Processado').length
  const totalErrors = events.filter(e => e.status === 'Erro').length
  const totalPending = events.filter(e => e.status === 'Pendente').length

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <DashboardHeader 
        title="eSocial Pro" 
        subtitle="Gestão de Eventos e Transmissão Governamental"
      >
        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden md:flex h-8 bg-white border-border text-muted-foreground hover:bg-slate-50 hover:text-foreground">
                <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                Últimos 30 dias
            </Button>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 flex items-center h-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
                Ambiente de Homologação
            </span>
        </div>
      </DashboardHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Eventos Enviados" 
          value={totalSent} 
          icon={CheckCircle} 
          trend="+12% essa semana" 
          trendUp={true}
          description="Total de eventos transmitidos com sucesso"
        />
        <KpiCard 
          title="Erros de Transmissão" 
          value={totalErrors} 
          icon={AlertTriangle} 
          trend="-5% essa semana" 
          trendUp={true}
          className="bg-red-50 border-red-200"
          description="Eventos retornados com erro pelo governo"
        />
        <KpiCard 
          title="Aguardando Envio" 
          value={totalPending} 
          icon={Clock} 
          trend="Ação necessária" 
          trendUp={false}
          description="Eventos gerados aguardando assinatura"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-white/5 mb-6">
            <TabsList className="bg-transparent p-0 h-auto gap-6 justify-start w-full overflow-x-auto">
            <TabsTrigger 
                value="overview" 
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-3 text-muted-foreground data-[state=active]:text-primary transition-all hover:text-white"
            >
                Visão Geral
            </TabsTrigger>
            <TabsTrigger 
                value="s2240" 
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-3 text-muted-foreground data-[state=active]:text-primary transition-all hover:text-white"
            >
                S-2240 (Riscos)
            </TabsTrigger>
            <TabsTrigger 
                value="s2220" 
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-3 text-muted-foreground data-[state=active]:text-primary transition-all hover:text-white"
            >
                S-2220 (ASO)
            </TabsTrigger>
            <TabsTrigger 
                value="s2210" 
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-3 text-muted-foreground data-[state=active]:text-primary transition-all hover:text-white"
            >
                S-2210 (CAT)
            </TabsTrigger>
            <TabsTrigger 
                value="mandatory" 
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-3 text-muted-foreground data-[state=active]:text-primary transition-all hover:text-white"
            >
                Obrigatórios
            </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <ContentContainer
            title="Empresas Vinculadas"
            action={
                <Button
                  size="sm"
                  onClick={() => setShowLinkCompanyModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Vincular Empresa
                </Button>
            }
          >
              <div className="relative mt-2 mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresas vinculadas..."
                  value={companySearch}
                  onChange={(e) => handleCompanySearch(e.target.value)}
                  className="pl-10 bg-white border-border text-foreground focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              
              <div className="space-y-3">
                {paginatedLinkedCompanies.length > 0 ? (
                  paginatedLinkedCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white border border-border hover:border-primary/30 hover:bg-slate-50 transition-all duration-300 group"
                    >
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground text-lg">{company.razao_social}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200">{company.cnpj}</span>
                          <span>•</span>
                          <span>{company.total_funcionarios || 0} funcionários</span>
                          <span>•</span>
                          <span>{company.cidade || 'N/A'}/{company.estado || 'UF'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnlinkCompany(company.id)}
                          className="text-red-700 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-border">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    {companySearch ? "Nenhuma empresa encontrada" : "Nenhuma empresa vinculada"}
                  </div>
                )}
              </div>

              {filteredLinkedCompanies.length > 0 && (
                <div className="mt-6">
                    <Pagination
                    currentPage={companyPage}
                    totalPages={totalCompanyPages}
                    onPageChange={setCompanyPage}
                    itemsPerPage={COMPANIES_PER_PAGE}
                    totalItems={filteredLinkedCompanies.length}
                    />
                </div>
              )}
          </ContentContainer>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Small Stat Cards for Event Types */}
             {[
                { title: "S-2240 - Riscos", events: s2240Events, icon: AlertTriangle, color: "text-primary" },
                { title: "S-2220 - ASO", events: s2220Events, icon: Activity, color: "text-info" },
                { title: "S-2210 - CAT", events: s2210Events, icon: AlertCircle, color: "text-destructive" }
             ].map((item, idx) => (
                <div key={idx} className="bg-white border border-border rounded-lg p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground">{item.title}</h4>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                <div className="text-2xl font-bold text-foreground mb-3">{item.events.length}</div>
                <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1 text-success bg-white px-2 py-0.5 rounded-full border border-border">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <span className="text-slate-600">{item.events.filter((e) => e.status === "Enviado").length}</span>
                    </span>
                    <span className="flex items-center gap-1 text-destructive bg-white px-2 py-0.5 rounded-full border border-border">
                        <XCircle className="w-3 h-3 text-destructive" />
                        <span className="text-slate-600">{item.events.filter((e) => e.status === "Erro").length}</span>
                    </span>
                </div>
                </div>
             ))}
          </div>
        </TabsContent>

        <TabsContent value="s2240" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <ContentContainer
            title="S-2240 - Condições Ambientais"
            action={
                <Button
                  size="sm"
                  onClick={() => setShowCreateS2240Modal(true)}
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
            }
          >
              <div className="relative mt-2 mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por funcionário ou risco..."
                  value={searchS2240}
                  onChange={(e) => {
                    setSearchS2240(e.target.value)
                    setCurrentPageS2240(1)
                  }}
                  className="pl-10 bg-white border-border text-foreground focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-4">{paginatedS2240.map((event) => renderEventCard(event, "s2240"))}</div>
              {filteredS2240.length > 0 && (
                <div className="mt-6">
                    <Pagination
                    currentPage={currentPageS2240}
                    totalPages={totalPagesS2240}
                    onPageChange={setCurrentPageS2240}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredS2240.length}
                    />
                </div>
              )}
              {filteredS2240.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-border">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Nenhum evento encontrado
                  </div>
                )}
          </ContentContainer>
        </TabsContent>

        <TabsContent value="s2220" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <ContentContainer
            title="S-2220 - Monitoramento da Saúde"
            action={
                <Button
                  size="sm"
                  onClick={() => setShowCreateS2220Modal(true)}
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
            }
          >
              <div className="relative mt-2 mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por funcionário ou exame..."
                  value={searchS2220}
                  onChange={(e) => {
                    setSearchS2220(e.target.value)
                    setCurrentPageS2220(1)
                  }}
                  className="pl-10 bg-white border-border text-foreground focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-4">{paginatedS2220.map((event) => renderEventCard(event, "s2220"))}</div>
              {filteredS2220.length > 0 && (
                <div className="mt-6">
                    <Pagination
                    currentPage={currentPageS2220}
                    totalPages={totalPagesS2220}
                    onPageChange={setCurrentPageS2220}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredS2220.length}
                    />
                </div>
              )}
               {filteredS2220.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-border">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Nenhum evento encontrado
                  </div>
                )}
          </ContentContainer>
        </TabsContent>

        <TabsContent value="s2210" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <ContentContainer
            title="S-2210 - Comunicação de Acidente de Trabalho"
            action={
                <Button
                  size="sm"
                  onClick={() => setShowCreateS2210Modal(true)}
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
            }
          >
              <div className="relative mt-2 mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por funcionário..."
                  value={searchS2210}
                  onChange={(e) => {
                    setSearchS2210(e.target.value)
                    setCurrentPageS2210(1)
                  }}
                  className="pl-10 bg-white border-border text-foreground focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-4">{paginatedS2210.map((event) => renderEventCard(event, "s2210"))}</div>
              {filteredS2210.length > 0 && (
                <div className="mt-6">
                    <Pagination
                    currentPage={currentPageS2210}
                    totalPages={totalPagesS2210}
                    onPageChange={setCurrentPageS2210}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredS2210.length}
                    />
                </div>
              )}
               {filteredS2210.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-border">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Nenhum evento encontrado
                  </div>
                )}
          </ContentContainer>
        </TabsContent>

        <TabsContent value="mandatory" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="p-1 rounded-xl inline-flex mb-6 bg-slate-100 border border-border">
             {['s1000', 's1005', 's1020'].map((tab) => (
                 <button
                    key={tab}
                    onClick={() => setMandatoryTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        mandatoryTab === tab 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                 >
                    {tab.toUpperCase()}
                 </button>
             ))}
          </div>

          {mandatoryTab === 's1000' && (
            <ContentContainer
                title="S-1000 - Informações do Empregador"
                action={
                    <Button
                      size="sm"
                      onClick={() => setShowCreateS1000Modal(true)}
                      className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Evento
                    </Button>
                }
            >
                 <div className="relative mt-2 mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por empresa..."
                      value={searchS1000}
                      onChange={(e) => {
                        setSearchS1000(e.target.value)
                        setCurrentPageS1000(1)
                      }}
                      className="pl-10 bg-white border-border text-foreground focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-4">{paginatedS1000.map((event) => renderEventCard(event, "s1000"))}</div>
                  {filteredS1000.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                        currentPage={currentPageS1000}
                        totalPages={totalPagesS1000}
                        onPageChange={setCurrentPageS1000}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={filteredS1000.length}
                        />
                    </div>
                  )}
                  {filteredS1000.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-border">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        Nenhum evento S-1000 encontrado
                    </div>
                  )}
            </ContentContainer>
          )}

          {mandatoryTab === 's1005' && (
             <ContentContainer
                title="S-1005 - Tabela de Estabelecimentos"
                action={
                    <Button
                      size="sm"
                      onClick={() => alert("Funcionalidade de criar S-1005 em desenvolvimento")}
                      className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Evento
                    </Button>
                }
            >
                 <div className="relative mt-2 mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por empresa..."
                      value={searchS1005}
                      onChange={(e) => {
                        setSearchS1005(e.target.value)
                        setCurrentPageS1005(1)
                      }}
                      className="pl-10 bg-white border-border text-foreground focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-4">{paginatedS1005.map((event) => renderEventCard(event, "s1005"))}</div>
                  {filteredS1005.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                        currentPage={currentPageS1005}
                        totalPages={totalPagesS1005}
                        onPageChange={setCurrentPageS1005}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={filteredS1005.length}
                        />
                    </div>
                  )}
                  {filteredS1005.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-border">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        Nenhum evento S-1005 encontrado
                    </div>
                  )}
            </ContentContainer>
          )}

          {mandatoryTab === 's1020' && (
             <ContentContainer
                title="S-1020 - Tabela de Lotações Tributárias"
                action={
                    <Button
                      size="sm"
                      onClick={() => alert("Funcionalidade de criar S-1020 em desenvolvimento")}
                      className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Evento
                    </Button>
                }
            >
                 <div className="relative mt-2 mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por empresa..."
                      value={searchS1020}
                      onChange={(e) => {
                        setSearchS1020(e.target.value)
                        setCurrentPageS1020(1)
                      }}
                      className="pl-10 bg-white border-border text-foreground focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-4">{paginatedS1020.map((event) => renderEventCard(event, "s1020"))}</div>
                  {filteredS1020.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                        currentPage={currentPageS1020}
                        totalPages={totalPagesS1020}
                        onPageChange={setCurrentPageS1020}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={filteredS1020.length}
                        />
                    </div>
                  )}
                  {filteredS1020.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-border">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        Nenhum evento S-1020 encontrado
                    </div>
                  )}
            </ContentContainer>
          )}
        </TabsContent>
      </Tabs>

      {showSendModal && sendModalEvent && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-popover border border-border rounded-lg max-w-md w-full p-6 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">Enviar evento eSocial</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione o certificado A1 para transmissão do evento.
            </p>

            {sendError && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-700" />
                <AlertTitle className="text-red-700">Erro</AlertTitle>
                <AlertDescription className="text-red-700 text-sm whitespace-pre-line mt-1">
                  {sendError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-1 text-sm bg-white p-3 rounded-lg border border-border">
                <div className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">Empresa</div>
                <div className="text-foreground font-medium">{sendModalEvent.company}</div>
                <div className="text-muted-foreground text-xs mt-1 border-t border-border pt-1">
                  Evento {sendModalEvent.eventType} • ID {sendModalEvent.id}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Certificado da empresa</Label>
                <Select
                  value={selectedCertificateId}
                  onValueChange={handleChangeSelectedCertificate}
                  disabled={sendModalCertificates.length === 0 || sendLoading}
                >
                  <SelectTrigger className="w-full bg-white border-border text-foreground">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sendModalCertificates.map((cert) => (
                      <SelectItem key={cert.id} value={cert.id}>
                        {cert.name}
                        {cert.valid_to
                          ? ` • válido até ${new Date(cert.valid_to).toLocaleDateString("pt-BR")}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sendModalCertificates.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Nenhum certificado cadastrado para esta empresa. Cadastre um certificado antes de enviar.
                  </p>
                )}
              </div>

              {sendModalDefaultCertificate && (
                <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded border border-blue-100">
                  <input
                    id="use-default-cert"
                    type="checkbox"
                    className="rounded border-blue-300 bg-white text-blue-600 focus:ring-blue-500"
                    checked={useDefaultCertificate}
                    onChange={handleToggleUseDefaultCertificate}
                    disabled={sendLoading}
                  />
                  <label htmlFor="use-default-cert" className="text-muted-foreground cursor-pointer">
                    Usar certificado padrão da empresa ({sendModalDefaultCertificate.name})
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseSendModal}
                  disabled={sendLoading}
                  className="border-border text-muted-foreground hover:bg-accent bg-transparent"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendEvent}
                  disabled={
                    sendLoading ||
                    !selectedCertificateId ||
                    sendModalCertificates.length === 0
                  }
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {sendLoading ? "Enviando..." : "Confirmar envio"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateS2240Modal && (
        <EventS2240Modal isOpen={showCreateS2240Modal} onClose={() => setShowCreateS2240Modal(false)} />
      )}

      {showCreateS2220Modal && (
        <EventS2220Modal isOpen={showCreateS2220Modal} onClose={() => setShowCreateS2220Modal(false)} />
      )}

      {showCreateS2210Modal && (
        <EventS2210Modal isOpen={showCreateS2210Modal} onClose={() => setShowCreateS2210Modal(false)} />
      )}

      {showCreateS1000Modal && (
        <EventS1000Modal 
          isOpen={showCreateS1000Modal} 
          onClose={() => setShowCreateS1000Modal(false)} 
          companies={allCompanies}
          onSuccess={() => {
            refreshEvents()
          }}
        />
      )}

      {showLinkCompanyModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setShowLinkCompanyModal(false)}
        >
          <div
            className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">Vincular Empresa ao e-Social</h3>
              <p className="text-sm text-muted-foreground">Selecione uma empresa para vincular aos eventos e-Social</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {availableCompanies.length > 0 ? (
                  availableCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 p-4 rounded-lg bg-white border border-border hover:border-primary transition-all cursor-pointer group"
                      onClick={() => handleLinkCompany(company.id)}
                    >
                      <div className="p-2 rounded-lg bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{company.razao_social}</h4>
                        <p className="text-sm text-muted-foreground">
                          CNPJ: {company.cnpj} • {company.total_funcionarios || 0} funcionários • {company.cidade || 'N/A'}/{company.estado || 'UF'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Vincular
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Todas as empresas já estão vinculadas</div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <Button
                onClick={() => setShowLinkCompanyModal(false)}
                variant="outline"
                className="w-full border-border text-muted-foreground hover:bg-accent hover:text-foreground bg-transparent"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!detailsModal} onOpenChange={() => setDetailsModal(null)}>
        <DialogContent className="bg-background border-border text-foreground w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto shadow-sm">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento</DialogTitle>
            <DialogDescription className="text-muted-foreground">Informações completas do evento e-Social</DialogDescription>
          </DialogHeader>

          {detailsModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Funcionário</label>
                  <p className="text-foreground font-medium break-words">{detailsModal.employee}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={detailsModal.status} />
                    {detailsModal.receipt && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/20">
                        Processado (recibo recebido)
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Data</label>
                  <p className="text-foreground">{detailsModal.date}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Empresa</label>
                  <p className="text-foreground break-words">{detailsModal.company}</p>
                </div>
                {detailsModal.risk && (
                  <div className="sm:col-span-2">
                    <label className="text-sm text-muted-foreground">Risco</label>
                    <p className="text-foreground break-words">{detailsModal.risk}</p>
                  </div>
                )}
                {detailsModal.exam && (
                  <div className="sm:col-span-2">
                    <label className="text-sm text-muted-foreground">Exame</label>
                    <p className="text-foreground break-words">{detailsModal.exam}</p>
                  </div>
                )}
                {detailsModal.type && (
                  <div className="sm:col-span-2">
                    <label className="text-sm text-muted-foreground">Tipo</label>
                    <p className="text-foreground break-words">{detailsModal.type}</p>
                  </div>
                )}
                {detailsModal.protocol && (
                  <div className="sm:col-span-2">
                    <label className="text-sm text-muted-foreground">Protocolo</label>
                    <p className="text-foreground font-mono text-sm break-all bg-slate-50 p-2 rounded border border-border">{detailsModal.protocol}</p>
                  </div>
                )}
              </div>

              {detailsModal.receipt && (
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground">Recibo</label>
                  <p className="text-foreground font-mono text-sm break-all bg-slate-50 p-2 rounded border border-border">{detailsModal.receipt}</p>
                </div>
              )}

        {detailsModal.errorMessage && (
                <Alert className="bg-destructive/10 border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertTitle className="text-destructive">Erro no envio</AlertTitle>
                  <AlertDescription className="text-destructive/90 break-words mt-1">
                    {detailsModal.errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {detailsModal.xml && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">XML do Evento</label>
                  <pre className="bg-slate-50 p-4 rounded-lg border border-border text-xs text-muted-foreground overflow-x-auto max-h-60 overflow-y-auto">
                    <code className="break-all whitespace-pre-wrap font-mono">{detailsModal.xml}</code>
                  </pre>
                </div>
              )}

              {detailsModal.xmlReturn && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">XML de Retorno</label>
                  <pre className="bg-card p-4 rounded-lg border border-border text-xs text-muted-foreground overflow-x-auto max-h-60 overflow-y-auto shadow-inner">
                    <code className="break-all whitespace-pre-wrap font-mono">{detailsModal.xmlReturn}</code>
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
                {detailsModal.xml && (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                    onClick={() => handleDownloadXML(detailsModal)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar XML de Envio
                  </Button>
                )}
                {detailsModal.xmlReturn && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-sm"
                    onClick={() => handleDownloadXML(detailsModal, "retorno")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar XML de Retorno
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent hover:text-foreground w-full sm:w-auto bg-transparent"
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
