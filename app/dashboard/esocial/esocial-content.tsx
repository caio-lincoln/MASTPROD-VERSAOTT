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

// Assume these modal components are defined elsewhere and imported
// import EventS2240Modal from './EventS2240Modal';
// import EventS2220Modal from './EventS2220Modal';
// import EventS2210Modal from './EventS2210Modal';

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
            {/* Placeholder for form fields */}
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
            {/* Placeholder for form fields */}
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
            {/* Placeholder for form fields */}
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

const mockEvents = {
  s2240: [
    {
      id: 1,
      employee: "João Silva",
      date: "2024-01-15",
      status: "Enviado",
      risk: "Ruído excessivo",
      company: "Empresa Alpha Ltda",
      protocol: "1.1.2024.000001",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtExpRisco><ideEvento>...</ideEvento></evtExpRisco></eSocial>`,
      errorMessage: null,
    },
    {
      id: 2,
      employee: "Maria Santos",
      date: "2024-01-14",
      status: "Pendente",
      risk: "Produtos químicos",
      company: "Beta Indústria S.A.",
      protocol: null,
      xml: null,
      errorMessage: null,
    },
    {
      id: 3,
      employee: "Carlos Oliveira",
      date: "2024-01-13",
      status: "Enviado",
      risk: "Radiação não ionizante",
      company: "Empresa Alpha Ltda",
      protocol: "1.1.2024.000002",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtExpRisco><ideEvento>...</ideEvento></evtExpRisco></eSocial>`,
      errorMessage: null,
    },
    {
      id: 4,
      employee: "Ana Paula",
      date: "2024-01-12",
      status: "Enviado",
      risk: "Calor excessivo",
      company: "Gamma Serviços",
      protocol: "1.1.2024.000003",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtExpRisco><ideEvento>...</ideEvento></evtExpRisco></eSocial>`,
      errorMessage: null,
    },
    {
      id: 5,
      employee: "Pedro Costa",
      date: "2024-01-11",
      status: "Erro",
      risk: "Poeira de sílica",
      company: "Beta Indústria S.A.",
      protocol: null,
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtExpRisco><ideEvento>...</ideEvento></evtExpRisco></eSocial>`,
      errorMessage: "Erro na validação: Campo CPF do trabalhador é obrigatório. Código: REGRA_VALIDA_CPF_TRABALHADOR",
    },
    {
      id: 6,
      employee: "Juliana Lima",
      date: "2024-01-10",
      status: "Enviado",
      risk: "Vibrações",
      company: "Empresa Alpha Ltda",
      protocol: "1.1.2024.000004",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: null,
    },
    {
      id: 7,
      employee: "Carlos Oliveira",
      date: "2024-01-16",
      status: "Enviado",
      exam: "Admissional",
      company: "Empresa Alpha Ltda",
      protocol: "2.2.2024.000001",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: null,
    },
    {
      id: 8,
      employee: "Ana Paula",
      date: "2024-01-12",
      status: "Erro",
      exam: "Periódico",
      company: "Gamma Serviços",
      protocol: null,
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: "Erro na validação: Data do exame posterior à data de envio. Código: REGRA_VALIDA_DATA_EXAME",
    },
    {
      id: 9,
      employee: "Pedro Costa",
      date: "2024-01-11",
      status: "Enviado",
      exam: "Retorno ao trabalho",
      company: "Beta Indústria S.A.",
      protocol: "2.2.2024.000002",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: null,
    },
    {
      id: 10,
      employee: "Juliana Lima",
      date: "2024-01-09",
      status: "Enviado",
      exam: "Periódico",
      company: "Gamma Serviços",
      protocol: "2.2.2024.000003",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: null,
    },
    {
      id: 11,
      employee: "Roberto Alves",
      date: "2024-01-07",
      status: "Pendente",
      exam: "Demissional",
      company: "Empresa Alpha Ltda",
      protocol: null,
      xml: null,
      errorMessage: null,
    },
    {
      id: 12,
      employee: "Fernanda Souza",
      date: "2024-01-06",
      status: "Enviado",
      exam: "Admissional",
      company: "Beta Indústria S.A.",
      protocol: "2.2.2024.000004",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: null,
    },
    {
      id: 13,
      employee: "Ricardo Santos",
      date: "2024-01-05",
      status: "Enviado",
      exam: "Retorno ao trabalho",
      company: "Gamma Serviços",
      protocol: "2.2.2024.000005",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: null,
    },
    {
      id: 14,
      employee: "Patrícia Dias",
      date: "2024-01-04",
      status: "Erro",
      exam: "Mudança de função",
      company: "Empresa Alpha Ltda",
      protocol: null,
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: "Erro na validação: CRM do médico inválido. Código: REGRA_VALIDA_CRM_MEDICO",
    },
    {
      id: 15,
      employee: "Lucas Martins",
      date: "2024-01-03",
      status: "Enviado",
      exam: "Admissional",
      company: "Gamma Serviços",
      protocol: "2.2.2024.000007",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtMonit><ideEvento>...</ideEvento></evtMonit></eSocial>`,
      errorMessage: null,
    },
    {
      id: 16,
      employee: "Pedro Costa",
      date: "2024-01-10",
      status: "Enviado",
      type: "Acidente típico",
      company: "Beta Indústria S.A.",
      protocol: "3.1.2024.000001",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtCAT><ideEvento>...</ideEvento></evtCAT></eSocial>`,
      errorMessage: null,
    },
    {
      id: 17,
      employee: "Juliana Lima",
      date: "2024-01-09",
      status: "Pendente",
      type: "Acidente de trajeto",
      company: "Empresa Alpha Ltda",
      protocol: null,
      xml: null,
      errorMessage: null,
    },
    {
      id: 18,
      employee: "Roberto Alves",
      date: "2024-01-08",
      status: "Enviado",
      type: "Doença ocupacional",
      company: "Gamma Serviços",
      protocol: "3.1.2024.000002",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtCAT><ideEvento>...</ideEvento></evtCAT></eSocial>`,
      errorMessage: null,
    },
    {
      id: 19,
      employee: "Fernanda Souza",
      date: "2024-01-07",
      status: "Enviado",
      type: "Acidente típico",
      company: "Beta Indústria S.A.",
      protocol: "3.1.2024.000003",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtCAT><ideEvento>...</ideEvento></evtCAT></eSocial>`,
      errorMessage: null,
    },
    {
      id: 20,
      employee: "Ricardo Santos",
      date: "2024-01-06",
      status: "Erro",
      type: "Acidente de trajeto",
      company: "Empresa Alpha Ltda",
      protocol: null,
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtCAT><ideEvento>...</ideEvento></evtCAT></eSocial>`,
      errorMessage: "Erro na validação: Descrição do acidente é obrigatória. Código: REGRA_VALIDA_DESC_ACIDENTE",
    },
    {
      id: 21,
      employee: "Camila Rocha",
      date: "2024-01-05",
      status: "Enviado",
      type: "Acidente típico",
      company: "Gamma Serviços",
      protocol: "3.1.2024.000004",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtCAT><ideEvento>...</ideEvento></evtCAT></eSocial>`,
      errorMessage: null,
    },
    {
      id: 22,
      employee: "Marcos Ferreira",
      date: "2024-01-04",
      status: "Pendente",
      type: "Doença ocupacional",
      company: "Beta Indústria S.A.",
      protocol: null,
      xml: null,
      errorMessage: null,
    },
    {
      id: 23,
      employee: "Patrícia Dias",
      date: "2024-01-03",
      status: "Enviado",
      type: "Acidente típico",
      company: "Empresa Alpha Ltda",
      protocol: "3.1.2024.000005",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtCAT><ideEvento>...</ideEvento></evtCAT></eSocial>`,
      errorMessage: null,
    },
    {
      id: 24,
      employee: "Lucas Martins",
      date: "2024-01-02",
      status: "Enviado",
      type: "Acidente de trajeto",
      company: "Gamma Serviços",
      protocol: "3.1.2024.000006",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtCAT><ideEvento>...</ideEvento></evtCAT></eSocial>`,
      errorMessage: null,
    },
    {
      id: 25,
      employee: "Beatriz Silva",
      date: "2024-01-01",
      status: "Enviado",
      type: "Doença ocupacional",
      company: "Beta Indústria S.A.",
      protocol: "3.1.2024.000007",
      xml: `<?xml version="1.0" encoding="UTF-8"?><eSocial><evtCAT><ideEvento>...</ideEvento></evtCAT></eSocial>`,
      errorMessage: null,
    },
    {
      id: 26,
      employee: "Thiago Costa",
      date: "2023-12-30",
      status: "Pendente",
      type: "Acidente típico",
      company: "Empresa Alpha Ltda",
      protocol: null,
      xml: null,
      errorMessage: null,
    },
  ],
  s2220: [],
  s2210: [],
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
  const [errorModal, setErrorModal] = useState<any>(null)
  const [linkedCompanyIds, setLinkedCompanyIds] = useState<number[]>([1, 2, 3])
  const [showLinkCompanyModal, setShowLinkCompanyModal] = useState(false)
  const [companySearch, setCompanySearch] = useState("")
  const [companyPage, setCompanyPage] = useState(1)

  const [showCreateS2240Modal, setShowCreateS2240Modal] = useState(false)
  const [showCreateS2220Modal, setShowCreateS2220Modal] = useState(false)
  const [showCreateS2210Modal, setShowCreateS2210Modal] = useState(false)

  const allCompanies = useMemo(
    () => [
      {
        id: 1,
        name: "Empresa Alpha Ltda",
        cnpj: "12.345.678/0001-90",
        employees: 120,
        city: "São Paulo",
        state: "SP",
        status: "Ativa",
      },
      {
        id: 2,
        name: "Beta Indústria S.A.",
        cnpj: "23.456.789/0001-01",
        employees: 85,
        city: "Rio de Janeiro",
        state: "RJ",
        status: "Ativa",
      },
      {
        id: 3,
        name: "Gamma Serviços",
        cnpj: "34.567.890/0001-12",
        employees: 43,
        city: "Belo Horizonte",
        state: "MG",
        status: "Ativa",
      },
      {
        id: 4,
        name: "Delta Construções",
        cnpj: "45.678.901/0001-23",
        employees: 95,
        city: "Curitiba",
        state: "PR",
        status: "Ativa",
      },
      {
        id: 5,
        name: "Epsilon Tecnologia",
        cnpj: "56.789.012/0001-34",
        employees: 67,
        city: "Porto Alegre",
        state: "RS",
        status: "Ativa",
      },
      {
        id: 6,
        name: "Zeta Logística",
        cnpj: "67.890.123/0001-45",
        employees: 54,
        city: "Salvador",
        state: "BA",
        status: "Ativa",
      },
      {
        id: 7,
        name: "Eta Alimentos",
        cnpj: "78.901.234/0001-56",
        employees: 112,
        city: "Fortaleza",
        state: "CE",
        status: "Ativa",
      },
      {
        id: 8,
        name: "Theta Consultoria",
        cnpj: "89.012.345/0001-67",
        employees: 38,
        city: "Brasília",
        state: "DF",
        status: "Ativa",
      },
    ],
    [],
  )

  const filteredS2240 = useMemo(() => {
    return mockEvents.s2240.filter(
      (e) =>
        e.employee.toLowerCase().includes(searchS2240.toLowerCase()) ||
        e.risk.toLowerCase().includes(searchS2240.toLowerCase()),
    )
  }, [searchS2240])

  const totalPagesS2240 = Math.ceil(filteredS2240.length / ITEMS_PER_PAGE)
  const paginatedS2240 = useMemo(() => {
    const startIndex = (currentPageS2240 - 1) * ITEMS_PER_PAGE
    return filteredS2240.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS2240, currentPageS2240])

  const filteredS2220 = useMemo(() => {
    return mockEvents.s2220.filter(
      (e) =>
        e.employee.toLowerCase().includes(searchS2220.toLowerCase()) ||
        e.exam.toLowerCase().includes(searchS2220.toLowerCase()),
    )
  }, [searchS2220])

  const totalPagesS2220 = Math.ceil(filteredS2220.length / ITEMS_PER_PAGE)
  const paginatedS2220 = useMemo(() => {
    const startIndex = (currentPageS2220 - 1) * ITEMS_PER_PAGE
    return filteredS2220.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS2220, currentPageS2220])

  const filteredS2210 = useMemo(() => {
    return mockEvents.s2210.filter(
      (e) =>
        e.employee.toLowerCase().includes(searchS2210.toLowerCase()) ||
        e.type.toLowerCase().includes(searchS2210.toLowerCase()),
    )
  }, [searchS2210])

  const totalPagesS2210 = Math.ceil(filteredS2210.length / ITEMS_PER_PAGE)
  const paginatedS2210 = useMemo(() => {
    const startIndex = (currentPageS2210 - 1) * ITEMS_PER_PAGE
    return filteredS2210.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredS2210, currentPageS2210])

  const linkedCompanies = useMemo(() => {
    return allCompanies.filter((c) => linkedCompanyIds.includes(c.id))
  }, [linkedCompanyIds])

  const filteredLinkedCompanies = useMemo(() => {
    return linkedCompanies.filter(
      (c) => c.name.toLowerCase().includes(companySearch.toLowerCase()) || c.cnpj.includes(companySearch),
    )
  }, [linkedCompanies, companySearch])

  const totalCompanyPages = Math.ceil(filteredLinkedCompanies.length / COMPANIES_PER_PAGE)
  const paginatedLinkedCompanies = useMemo(() => {
    const startIndex = (companyPage - 1) * COMPANIES_PER_PAGE
    return filteredLinkedCompanies.slice(startIndex, startIndex + COMPANIES_PER_PAGE)
  }, [filteredLinkedCompanies, companyPage])

  const availableCompanies = useMemo(() => {
    return allCompanies.filter((c) => !linkedCompanyIds.includes(c.id))
  }, [linkedCompanyIds])

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

  const handleLinkCompany = (companyId: number) => {
    setLinkedCompanyIds([...linkedCompanyIds, companyId])
    setShowLinkCompanyModal(false)
  }

  const handleUnlinkCompany = (companyId: number) => {
    setLinkedCompanyIds(linkedCompanyIds.filter((id) => id !== companyId))
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
        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
          <Send className="w-4 h-4 mr-2" />
          Enviar Eventos em Lote
        </Button>
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
                        <h4 className="font-semibold text-white">{company.name}</h4>
                        <p className="text-sm text-slate-400">
                          CNPJ: {company.cnpj} • {company.employees} funcionários • {company.city}/{company.state}
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
                <div className="text-3xl font-bold text-white mb-2">{mockEvents.s2240.length}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400">
                    {mockEvents.s2240.filter((e) => e.status === "Enviado").length} enviados
                  </span>
                  <span className="text-red-400">
                    {mockEvents.s2240.filter((e) => e.status === "Erro").length} erros
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">S-2220 - Exames Médicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{mockEvents.s2220.length}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400">
                    {mockEvents.s2220.filter((e) => e.status === "Enviado").length} enviados
                  </span>
                  <span className="text-red-400">
                    {mockEvents.s2220.filter((e) => e.status === "Erro").length} erros
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">S-2210 - Acidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{mockEvents.s2210.length}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400">
                    {mockEvents.s2210.filter((e) => e.status === "Enviado").length} enviados
                  </span>
                  <span className="text-red-400">
                    {mockEvents.s2210.filter((e) => e.status === "Erro").length} erros
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
                        <h4 className="font-semibold text-white">{company.name}</h4>
                        <p className="text-sm text-slate-400">
                          CNPJ: {company.cnpj} • {company.employees} funcionários • {company.city}/{company.state}
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
