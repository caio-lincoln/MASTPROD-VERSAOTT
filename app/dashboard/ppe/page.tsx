"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Package, Calendar, Eye, Edit, XCircle, Building2 } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PPEModal } from "@/components/ppe-modal"
import { PPEDetailsModal } from "@/components/ppe-details-modal"
import { PPECancelModal } from "@/components/ppe-cancel-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockPPE = [
  {
    id: 1,
    name: "Capacete de Segurança",
    ca: "12345",
    type: "Proteção da Cabeça",
    manufacturer: "SafetyPro",
    quantity: 150,
    minQuantity: 50,
    status: "Adequado",
    validity: "2025-06-30",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Capacete classe A para proteção contra impactos",
    isCancelled: false,
  },
  {
    id: 2,
    name: "Óculos de Proteção",
    ca: "23456",
    type: "Proteção dos Olhos",
    manufacturer: "VisionSafe",
    quantity: 200,
    minQuantity: 100,
    status: "Adequado",
    validity: "2025-08-15",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Óculos com lentes antirrisco e proteção UV",
    isCancelled: false,
  },
  {
    id: 3,
    name: "Luvas de Borracha",
    ca: "34567",
    type: "Proteção das Mãos",
    manufacturer: "GloveTech",
    quantity: 45,
    minQuantity: 80,
    status: "Crítico",
    validity: "2024-12-31",
    companyId: 2,
    companyName: "Beta Indústria S.A.",
    description: "Luvas de borracha natural isolante elétrico",
    isCancelled: false,
  },
  {
    id: 4,
    name: "Botina de Segurança",
    ca: "45678",
    type: "Proteção dos Pés",
    manufacturer: "BootSafe",
    quantity: 120,
    minQuantity: 60,
    status: "Adequado",
    validity: "2025-04-20",
    companyId: 2,
    companyName: "Beta Indústria S.A.",
    description: "Botina com biqueira de aço e solado antiderrapante",
    isCancelled: false,
  },
  {
    id: 5,
    name: "Protetor Auricular",
    ca: "56789",
    type: "Proteção Auditiva",
    manufacturer: "HearGuard",
    quantity: 180,
    minQuantity: 70,
    status: "Adequado",
    validity: "2025-09-10",
    companyId: 3,
    companyName: "Gamma Serviços",
    description: "Protetor tipo plug com cordão",
    isCancelled: false,
  },
  {
    id: 6,
    name: "Máscara PFF2",
    ca: "67890",
    type: "Proteção Respiratória",
    manufacturer: "RespireTech",
    quantity: 35,
    minQuantity: 100,
    status: "Crítico",
    validity: "2024-11-30",
    companyId: 3,
    companyName: "Gamma Serviços",
    description: "Máscara descartável com válvula de exalação",
    isCancelled: false,
  },
  {
    id: 7,
    name: "Cinto de Segurança",
    ca: "78901",
    type: "Proteção Contra Quedas",
    manufacturer: "HeightSafe",
    quantity: 90,
    minQuantity: 40,
    status: "Adequado",
    validity: "2025-05-15",
    companyId: 4,
    companyName: "Delta Construções",
    description: "Cinto paraquedista com talabarte duplo",
    isCancelled: false,
  },
  {
    id: 8,
    name: "Luvas de Vaqueta",
    ca: "89012",
    type: "Proteção das Mãos",
    manufacturer: "GloveTech",
    quantity: 160,
    minQuantity: 80,
    status: "Adequado",
    validity: "2025-07-20",
    companyId: 4,
    companyName: "Delta Construções",
    description: "Luvas em couro vaqueta reforçada",
    isCancelled: false,
  },
  {
    id: 9,
    name: "Avental de Raspa",
    ca: "90123",
    type: "Proteção do Tronco",
    manufacturer: "BodyGuard",
    quantity: 55,
    minQuantity: 30,
    status: "Adequado",
    validity: "2025-03-25",
    companyId: 1,
    companyName: "Empresa Alpha Ltda",
    description: "Avental em raspa de couro para soldador",
    isCancelled: false,
  },
  {
    id: 10,
    name: "Mangote de Proteção",
    ca: "01234",
    type: "Proteção dos Braços",
    manufacturer: "ArmSafe",
    quantity: 70,
    minQuantity: 40,
    status: "Adequado",
    validity: "2025-06-18",
    companyId: 2,
    companyName: "Beta Indústria S.A.",
    description: "Mangote em raspa para proteção térmica",
    isCancelled: false,
  },
  {
    id: 11,
    name: "Respirador Semi-Facial",
    ca: "11223",
    type: "Proteção Respiratória",
    manufacturer: "RespireTech",
    quantity: 42,
    minQuantity: 50,
    status: "Crítico",
    validity: "2024-12-15",
    companyId: 3,
    companyName: "Gamma Serviços",
    description: "Respirador com filtro químico P2",
    isCancelled: false,
  },
]

const mockCompanies = [
  { id: 1, name: "Empresa Alpha Ltda", cnpj: "12.345.678/0001-90" },
  { id: 2, name: "Beta Indústria S.A.", cnpj: "23.456.789/0001-01" },
  { id: 3, name: "Gamma Serviços", cnpj: "34.567.890/0001-12" },
  { id: 4, name: "Delta Construções", cnpj: "45.678.901/0001-23" },
]

const ITEMS_PER_PAGE = 10

export default function PPEPage() {
  const [search, setSearch] = useState("")
  const [ppe, setPPE] = useState(mockPPE)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPPE, setEditingPPE] = useState<(typeof mockPPE)[0] | null>(null)
  const [detailsPPE, setDetailsPPE] = useState<(typeof mockPPE)[0] | null>(null)
  const [cancelPPE, setCancelPPE] = useState<(typeof mockPPE)[0] | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string>("all")

  const filteredPPE = useMemo(() => {
    return ppe.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.ca.includes(search) ||
        item.type.toLowerCase().includes(search.toLowerCase())
      const matchesCompany = selectedCompany === "all" || item.companyId.toString() === selectedCompany
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
    if (editingPPE) {
      setPPE(ppe.map((p) => (p.id === editingPPE.id ? { ...ppeData, id: p.id } : p)))
    } else {
      setPPE([...ppe, { ...ppeData, id: ppe.length + 1 }])
    }
    setIsModalOpen(false)
    setEditingPPE(null)
  }

  const handleCancelPPE = (id: number, reason: string) => {
    setPPE(
      ppe.map((p) =>
        p.id === id
          ? {
              ...p,
              isCancelled: true,
              cancelReason: reason,
              status: "Cancelado",
            }
          : p,
      ),
    )
    setCancelPPE(null)
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
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="text-white">
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
                      <span>{item.companyName}</span>
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
        companies={mockCompanies}
      />

      <PPEDetailsModal ppe={detailsPPE} onClose={() => setDetailsPPE(null)} />

      <PPECancelModal ppe={cancelPPE} onClose={() => setCancelPPE(null)} onConfirm={handleCancelPPE} />
    </div>
  )
}
