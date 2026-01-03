"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Calendar, Users, FileText, Eye, CheckCircle, PlayCircle, XCircle, Clock } from "lucide-react"
import { TrainingModal } from "@/components/training-modal"
import { Pagination } from "@/components/pagination"
import { TrainingDetailsModal } from "@/components/training-details-modal"
import { TrainingCancelModal } from "@/components/training-cancel-modal"

const mockTrainings = [
  {
    id: 1,
    name: "NR-35 - Trabalho em Altura",
    duration: "8h",
    employees: 15,
    status: "Em andamento",
    date: "2024-01-15",
    instructor: "João Silva",
    description: "Treinamento completo sobre trabalho em altura, uso de EPIs e procedimentos de segurança.",
    linkedEmployees: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    linkedCompanies: [1, 2],
    cancelReason: null,
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    name: "NR-10 - Eletricidade",
    duration: "40h",
    employees: 22,
    status: "Concluído",
    date: "2024-01-10",
    instructor: "Maria Santos",
    description: "Segurança em instalações e serviços em eletricidade.",
    linkedEmployees: [1, 3, 5, 7, 9, 11],
    linkedCompanies: [1],
    cancelReason: null,
    createdAt: "2024-01-05",
  },
  {
    id: 3,
    name: "CIPA - Prevenção de Acidentes",
    duration: "20h",
    employees: 8,
    status: "Agendado",
    date: "2024-01-20",
    instructor: "Carlos Oliveira",
    description: "Formação de membros da CIPA.",
    linkedEmployees: [2, 4, 6, 8],
    linkedCompanies: [2, 3],
    cancelReason: null,
    createdAt: "2024-01-08",
  },
  {
    id: 4,
    name: "NR-33 - Espaços Confinados",
    duration: "16h",
    employees: 12,
    status: "Cancelado",
    date: "2024-01-18",
    instructor: "Ana Paula",
    description: "Segurança e saúde nos trabalhos em espaços confinados.",
    linkedEmployees: [1, 5, 9],
    linkedCompanies: [1],
    cancelReason: "Falta de quórum mínimo de participantes",
    createdAt: "2024-01-12",
  },
  {
    id: 5,
    name: "Primeiros Socorros",
    duration: "8h",
    employees: 30,
    status: "Concluído",
    date: "2024-01-05",
    instructor: "Dr. Fernando",
    description: "Técnicas básicas de primeiros socorros.",
    linkedEmployees: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    linkedCompanies: [1, 2, 3],
    cancelReason: null,
    createdAt: "2023-12-28",
  },
]

const mockEmployees = [
  { id: 1, name: "João Silva", position: "Eletricista", department: "Manutenção" },
  { id: 2, name: "Maria Santos", position: "Supervisora", department: "Segurança" },
  { id: 3, name: "Carlos Oliveira", position: "Operador", department: "Produção" },
  { id: 4, name: "Ana Paula", position: "Técnica", department: "Qualidade" },
  { id: 5, name: "Pedro Costa", position: "Soldador", department: "Produção" },
  { id: 6, name: "Juliana Lima", position: "Analista", department: "RH" },
  { id: 7, name: "Roberto Alves", position: "Motorista", department: "Logística" },
  { id: 8, name: "Fernanda Souza", position: "Engenheira", department: "Projetos" },
  { id: 9, name: "Ricardo Santos", position: "Operador", department: "Produção" },
  { id: 10, name: "Camila Rocha", position: "Auxiliar", department: "Administrativo" },
  { id: 11, name: "Marcos Ferreira", position: "Técnico", department: "Manutenção" },
  { id: 12, name: "Patrícia Dias", position: "Coordenadora", department: "Qualidade" },
  { id: 13, name: "André Martins", position: "Operador", department: "Produção" },
  { id: 14, name: "Beatriz Costa", position: "Auxiliar", department: "Limpeza" },
  { id: 15, name: "Lucas Pereira", position: "Ajudante", department: "Manutenção" },
]

const mockCompanies = [
  { id: 1, name: "Tech Solutions Ltda", cnpj: "12.345.678/0001-90" },
  { id: 2, name: "Industrial Brasil S.A.", cnpj: "98.765.432/0001-10" },
  { id: 3, name: "Serviços Gerais ME", cnpj: "45.678.901/0001-23" },
]

const ITEMS_PER_PAGE = 10

export default function TrainingsPage() {
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [trainings, setTrainings] = useState(mockTrainings)
  const [currentPage, setCurrentPage] = useState(1)
  const [detailsModal, setDetailsModal] = useState<number | null>(null)
  const [cancelModal, setCancelModal] = useState<number | null>(null)

  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  }, [trainings, search])

  const totalPages = Math.ceil(filteredTrainings.length / ITEMS_PER_PAGE)

  const paginatedTrainings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTrainings.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredTrainings, currentPage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setTrainings((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }

  const handleCancel = (id: number, reason: string) => {
    setTrainings((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Cancelado", cancelReason: reason } : t)))
    setCancelModal(null)
  }

  const getTrainingDetails = (id: number) => {
    const training = trainings.find((t) => t.id === id)
    if (!training) return null

    return {
      ...training,
      employees: mockEmployees.filter((e) => training.linkedEmployees.includes(e.id)),
      companies: mockCompanies.filter((c) => training.linkedCompanies.includes(c.id)),
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Treinamentos</h2>
          <p className="text-slate-400">Gerencie os treinamentos de segurança</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Treinamento
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar treinamentos..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedTrainings.map((training) => (
              <div
                key={training.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{training.name}</h3>
                    <p className="text-sm text-slate-400">Instrutor: {training.instructor}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      training.status === "Concluído"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : training.status === "Em andamento"
                          ? "bg-blue-500/10 text-blue-400"
                          : training.status === "Agendado"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {training.status}
                  </span>
                </div>

                {training.cancelReason && (
                  <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">
                      <strong>Motivo do cancelamento:</strong> {training.cancelReason}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{training.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{training.employees} funcionários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{training.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailsModal(training.id)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Visualizar
                  </Button>

                  {training.status === "Agendado" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(training.id, "Em andamento")}
                      className="border-blue-700 text-blue-400 hover:bg-blue-900/20 bg-transparent"
                    >
                      <PlayCircle className="w-3 h-3 mr-1" />
                      Iniciar
                    </Button>
                  )}

                  {training.status === "Em andamento" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(training.id, "Concluído")}
                      className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/20 bg-transparent"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluir
                    </Button>
                  )}

                  {training.status !== "Cancelado" && training.status !== "Concluído" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCancelModal(training.id)}
                      className="border-red-700 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                  )}

                  {training.status === "Concluído" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(training.id, "Agendado")}
                      className="border-amber-700 text-amber-400 hover:bg-amber-900/20 bg-transparent"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Reagendar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTrainings.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredTrainings.length}
            />
          )}
        </CardContent>
      </Card>

      <TrainingModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {detailsModal && (
        <TrainingDetailsModal
          training={getTrainingDetails(detailsModal)}
          open={!!detailsModal}
          onClose={() => setDetailsModal(null)}
        />
      )}

      {cancelModal && (
        <TrainingCancelModal
          open={!!cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirm={(reason) => handleCancel(cancelModal, reason)}
        />
      )}
    </div>
  )
}
