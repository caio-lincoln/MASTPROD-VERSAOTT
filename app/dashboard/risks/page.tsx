"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, AlertTriangle, Eye, Edit, Trash2, Building2 } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { RiskModal } from "@/components/risk-modal"
import { RiskDetailsModal } from "@/components/risk-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const mockRisks = [
  {
    id: 1,
    name: "Ruído excessivo",
    type: "Físico",
    severity: "Alto",
    sector: "Produção",
    measures: "Uso de protetores auriculares",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Nível de ruído acima de 85 dB(A) identificado na linha de produção",
    source: "Máquinas industriais em operação contínua",
    consequences: "Perda auditiva induzida por ruído (PAIR)",
    probability: "Alta",
    identifiedDate: "2024-01-15",
    responsibleName: "João Silva",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Produtos químicos",
    type: "Químico",
    severity: "Médio",
    sector: "Laboratório",
    measures: "EPI adequado e ventilação",
    companyId: 2,
    companyName: "Beta Indústria S.A.",
    description: "Exposição a solventes orgânicos durante processos de limpeza",
    source: "Manuseio de produtos químicos",
    consequences: "Intoxicação, irritação de vias respiratórias",
    probability: "Média",
    identifiedDate: "2024-01-20",
    responsibleName: "Maria Santos",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Trabalho em altura",
    type: "Acidente",
    severity: "Crítico",
    sector: "Manutenção",
    measures: "Cinto de segurança e treinamento NR-35",
    companyId: 4,
    companyName: "Delta Construções",
    description: "Trabalho em alturas superiores a 2 metros sem proteção adequada",
    source: "Manutenção de estruturas e instalações",
    consequences: "Quedas com lesões graves ou fatais",
    probability: "Média",
    identifiedDate: "2024-02-01",
    responsibleName: "Pedro Costa",
    status: "Ativo",
  },
  {
    id: 4,
    name: "Postura inadequada",
    type: "Ergonômico",
    severity: "Baixo",
    sector: "Administrativo",
    measures: "Ginástica laboral",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Má postura durante jornada de trabalho em escritório",
    source: "Mobiliário inadequado e ausência de pausas",
    consequences: "Dores musculares, LER/DORT",
    probability: "Alta",
    identifiedDate: "2024-02-10",
    responsibleName: "Carlos Silva",
    status: "Ativo",
  },
  {
    id: 5,
    name: "Radiação não ionizante",
    type: "Físico",
    severity: "Médio",
    sector: "Soldagem",
    measures: "Proteção facial e EPIs",
    companyId: 10,
    companyName: "Kappa Metalúrgica",
    description: "Exposição a radiação UV durante processos de soldagem",
    source: "Operações de soldagem elétrica",
    consequences: "Queimaduras, lesões oculares",
    probability: "Alta",
    identifiedDate: "2024-02-15",
    responsibleName: "Roberto Nunes",
    status: "Ativo",
  },
  {
    id: 6,
    name: "Poeira de sílica",
    type: "Químico",
    severity: "Alto",
    sector: "Corte",
    measures: "Máscara PFF2 e ventilação local",
    companyId: 10,
    companyName: "Kappa Metalúrgica",
    description: "Poeira de sílica cristalina respirável no ambiente de trabalho",
    source: "Corte e polimento de materiais",
    consequences: "Silicose pulmonar",
    probability: "Alta",
    identifiedDate: "2024-02-20",
    responsibleName: "Roberto Nunes",
    status: "Ativo",
  },
  {
    id: 7,
    name: "Máquinas sem proteção",
    type: "Acidente",
    severity: "Crítico",
    sector: "Produção",
    measures: "Instalação de grades de proteção",
    companyId: 2,
    companyName: "Beta Indústria S.A.",
    description: "Equipamentos sem dispositivos de proteção adequados",
    source: "Máquinas e equipamentos industriais",
    consequences: "Amputações, esmagamentos",
    probability: "Média",
    identifiedDate: "2024-03-01",
    responsibleName: "Maria Santos",
    status: "Ativo",
  },
  {
    id: 8,
    name: "Levantamento de peso",
    type: "Ergonômico",
    severity: "Médio",
    sector: "Logística",
    measures: "Treinamento e equipamentos auxiliares",
    companyId: 6,
    companyName: "Zeta Logística",
    description: "Movimentação manual de cargas pesadas sem auxílio mecânico",
    source: "Operações de carga e descarga",
    consequences: "Lesões na coluna, hérnias",
    probability: "Alta",
    identifiedDate: "2024-03-05",
    responsibleName: "Ricardo Alves",
    status: "Ativo",
  },
  {
    id: 9,
    name: "Calor excessivo",
    type: "Físico",
    severity: "Alto",
    sector: "Fundição",
    measures: "Hidratação e pausas regulares",
    companyId: 10,
    companyName: "Kappa Metalúrgica",
    description: "Temperatura elevada em ambiente de trabalho",
    source: "Fornos e processos de fundição",
    consequences: "Desidratação, intermação",
    probability: "Alta",
    identifiedDate: "2024-03-10",
    responsibleName: "Roberto Nunes",
    status: "Ativo",
  },
  {
    id: 10,
    name: "Agentes biológicos",
    type: "Biológico",
    severity: "Médio",
    sector: "Limpeza",
    measures: "Luvas e higienização constante",
    companyId: 3,
    companyName: "Gamma Serviços",
    description: "Exposição a vírus, bactérias e fungos",
    source: "Limpeza de ambientes contaminados",
    consequences: "Infecções diversas",
    probability: "Média",
    identifiedDate: "2024-03-15",
    responsibleName: "João Oliveira",
    status: "Ativo",
  },
  {
    id: 11,
    name: "Eletricidade",
    type: "Acidente",
    severity: "Crítico",
    sector: "Elétrica",
    measures: "NR-10 e bloqueio de energia",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Risco de choque elétrico em instalações energizadas",
    source: "Manutenção elétrica e operações em painéis",
    consequences: "Choque elétrico, queimaduras, morte",
    probability: "Baixa",
    identifiedDate: "2024-03-20",
    responsibleName: "Carlos Silva",
    status: "Ativo",
  },
]

const mockCompanies = [
  { id: 1, name: "Empresa Alpha Ltda", cnpj: "12.345.678/0001-90" },
  { id: 2, name: "Beta Indústria S.A.", cnpj: "23.456.789/0001-01" },
  { id: 3, name: "Gamma Serviços", cnpj: "34.567.890/0001-12" },
  { id: 4, name: "Delta Construções", cnpj: "45.678.901/0001-23" },
  { id: 5, name: "Epsilon Tecnologia", cnpj: "56.789.012/0001-34" },
  { id: 6, name: "Zeta Logística", cnpj: "67.890.123/0001-45" },
  { id: 10, name: "Kappa Metalúrgica", cnpj: "01.234.567/0001-89" },
]

const ITEMS_PER_PAGE = 10

export default function RisksPage() {
  const [search, setSearch] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [risks, setRisks] = useState(mockRisks)
  const [currentPage, setCurrentPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<(typeof mockRisks)[0] | null>(null)
  const [viewingRisk, setViewingRisk] = useState<(typeof mockRisks)[0] | null>(null)

  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
      const matchesCompany = selectedCompany === "all" || r.companyId.toString() === selectedCompany
      return matchesSearch && matchesCompany
    })
  }, [risks, search, selectedCompany])

  const totalPages = Math.ceil(filteredRisks.length / ITEMS_PER_PAGE)

  const paginatedRisks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredRisks.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredRisks, currentPage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCompanyFilter = (value: string) => {
    setSelectedCompany(value)
    setCurrentPage(1)
  }

  const handleCreateRisk = (data: any) => {
    const newRisk = {
      ...data,
      id: risks.length + 1,
      status: "Ativo",
    }
    setRisks([...risks, newRisk])
    setCreateModalOpen(false)
  }

  const handleEditRisk = (data: any) => {
    setRisks(risks.map((r) => (r.id === editingRisk?.id ? { ...r, ...data } : r)))
    setEditingRisk(null)
  }

  const handleDeleteRisk = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este risco?")) {
      setRisks(risks.filter((r) => r.id !== id))
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Crítico":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "Alto":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "Médio":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Baixo":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Riscos Ocupacionais</h2>
          <p className="text-slate-400">Identificação e controle de riscos</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Risco
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Filtrar por Empresa</Label>
              <Select value={selectedCompany} onValueChange={handleCompanyFilter}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">
                    Todas as empresas
                  </SelectItem>
                  {mockCompanies.map((company) => (
                    <SelectItem
                      key={company.id}
                      value={company.id.toString()}
                      className="text-white hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <span>{company.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar riscos por nome ou tipo..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedRisks.map((risk) => (
              <div
                key={risk.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{risk.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">{risk.companyName}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">Setor: {risk.sector}</p>
                      <p className="text-sm text-slate-300">Medidas: {risk.measures}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(risk.severity)}`}
                    >
                      {risk.severity}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                      {risk.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingRisk(risk)}
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingRisk(risk)}
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRisk(risk.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredRisks.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredRisks.length}
            />
          )}
        </CardContent>
      </Card>

      <RiskModal
        open={createModalOpen || !!editingRisk}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false)
            setEditingRisk(null)
          }
        }}
        onSubmit={editingRisk ? handleEditRisk : handleCreateRisk}
        initialData={editingRisk}
        mode={editingRisk ? "edit" : "create"}
        companies={mockCompanies}
      />

      <RiskDetailsModal
        open={!!viewingRisk}
        onOpenChange={(open) => !open && setViewingRisk(null)}
        risk={viewingRisk}
      />
    </div>
  )
}
