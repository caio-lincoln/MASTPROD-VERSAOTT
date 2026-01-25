"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Calendar, Users, FileText, Eye, CheckCircle, PlayCircle, XCircle, Clock } from "lucide-react"
import { TrainingModal } from "@/components/training-modal"
import { Pagination } from "@/components/pagination"
import { TrainingDetailsModal } from "@/components/training-details-modal"
import { TrainingCancelModal } from "@/components/training-cancel-modal"
import { supabase } from "@/lib/supabaseClient"
import { DashboardHeader, ContentContainer, StatusBadge } from "@/app/dashboard/esocial/components/visual-components"
import { cn } from "@/lib/utils"

type TrainingRow = {
  id: string
  titulo: string
  descricao: string | null
  status: "agendado" | "em_andamento" | "concluido" | "cancelado"
  data_inicio: string | null
  data_fim: string | null
  empresa_id: string
  funcionario_id: string | null
  created_at: string
}

type CompanyRow = { id: string; razao_social: string; cnpj: string }
type EmployeeRow = { id: string; nome: string; cargo: string | null; departamento: string | null; empresa_id: string }

const ITEMS_PER_PAGE = 10

export default function TrainingsPage() {
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [trainings, setTrainings] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [detailsModal, setDetailsModal] = useState<number | null>(null)
  const [cancelModal, setCancelModal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data } = await supabase.from("treinamentos").select("*").order("created_at", { ascending: false })
      const mapped = (data as TrainingRow[]).map((t) => ({
        id: t.id,
        name: t.titulo,
        duration: "",
        employees: t.funcionario_id ? 1 : 0,
        status:
          t.status === "concluido"
            ? "Concluído"
            : t.status === "em_andamento"
              ? "Em andamento"
              : t.status === "agendado"
                ? "Agendado"
                : "Cancelado",
        date: (t.data_inicio || t.created_at || "").substring(0, 10),
        instructor: "",
        description: t.descricao || "",
        empresaId: t.empresa_id,
        funcionarioId: t.funcionario_id,
        cancelReason: null,
        createdAt: t.created_at,
      }))
      setTrainings(mapped)
      setLoading(false)
    }
    load()
  }, [])

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
    const run = async () => {
      const row = trainings.find((t) => t.id === id)
      if (!row) return
      const dbStatus =
        newStatus === "Concluído" ? "concluido" : newStatus === "Em andamento" ? "em_andamento" : newStatus === "Agendado" ? "agendado" : "cancelado"
      await supabase.from("treinamentos").update({ status: dbStatus }).eq("id", row.id)
      const { data } = await supabase.from("treinamentos").select("*").order("created_at", { ascending: false })
      const mapped = (data as TrainingRow[]).map((t) => ({
        id: t.id,
        name: t.titulo,
        duration: "",
        employees: t.funcionario_id ? 1 : 0,
        status:
          t.status === "concluido"
            ? "Concluído"
            : t.status === "em_andamento"
              ? "Em andamento"
              : t.status === "agendado"
                ? "Agendado"
                : "Cancelado",
        date: (t.data_inicio || t.created_at || "").substring(0, 10),
        instructor: "",
        description: t.descricao || "",
        empresaId: t.empresa_id,
        funcionarioId: t.funcionario_id,
        cancelReason: null,
        createdAt: t.created_at,
      }))
      setTrainings(mapped)
    }
    run()
  }

  const handleCancel = (id: number, reason: string) => {
    const run = async () => {
      const row = trainings.find((t) => t.id === id)
      if (!row) return
      await supabase.from("treinamentos").update({ status: "cancelado" }).eq("id", row.id)
      setCancelModal(null)
      const { data } = await supabase.from("treinamentos").select("*").order("created_at", { ascending: false })
      const mapped = (data as TrainingRow[]).map((t) => ({
        id: t.id,
        name: t.titulo,
        duration: "",
        employees: t.funcionario_id ? 1 : 0,
        status:
          t.status === "concluido"
            ? "Concluído"
            : t.status === "em_andamento"
              ? "Em andamento"
              : t.status === "agendado"
                ? "Agendado"
                : "Cancelado",
        date: (t.data_inicio || t.created_at || "").substring(0, 10),
        instructor: "",
        description: t.descricao || "",
        empresaId: t.empresa_id,
        funcionarioId: t.funcionario_id,
        cancelReason: null,
        createdAt: t.created_at,
      }))
      setTrainings(mapped)
    }
    run()
  }

  const getTrainingDetails = (id: number) => {
    const training = trainings.find((t) => t.id === id)
    if (!training) return null
    return training
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DashboardHeader
        title="Treinamentos"
        subtitle="Gerencie os treinamentos de segurança"
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Treinamento
        </Button>
      </DashboardHeader>

      <ContentContainer className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar treinamentos..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
        </div>

        <div className="space-y-3">
          {loading && <div className="text-slate-400">Carregando...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {paginatedTrainings.map((training) => (
            <div
              key={training.id}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{training.name}</h3>
                  <p className="text-sm text-slate-400">Instrutor: {training.instructor}</p>
                </div>
                <StatusBadge 
                  status={training.status} 
                  type={
                    training.status === "Concluído" ? "success" :
                    training.status === "Em andamento" ? "info" :
                    training.status === "Agendado" ? "warning" :
                    "error"
                  } 
                />
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
                    className="border-orange-700 text-orange-400 hover:bg-orange-900/20 bg-transparent"
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
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredTrainings.length}
            />
          </div>
        )}
      </ContentContainer>

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
