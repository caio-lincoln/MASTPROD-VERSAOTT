"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, Phone, Briefcase, Eye, Edit, Trash2, Building2, Filter } from "lucide-react"
import { EmployeeModal } from "@/components/employee-modal"
import { EmployeeDetailsModal } from "@/components/employee-details-modal"
import { EmployeeCancelModal } from "@/components/employee-cancel-modal"
import { Pagination } from "@/components/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { DashboardHeader, ContentContainer, StatusBadge } from "../esocial/components/visual-components"

type EmployeeRow = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  cargo: string | null
  departamento: string | null
  status: "ativo" | "inativo" | "cancelado"
  empresa_id: string
  cpf: string
  data_admissao: string | null
  data_nascimento: string | null
  endereco: string | null
}

type CompanyRow = { id: string; razao_social: string }

const ITEMS_PER_PAGE = 10

export default function EmployeesPage() {
  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null)
  const [cancelingEmployee, setCancelingEmployee] = useState<any | null>(null)
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data: empresas } = await supabase.from("empresas").select("id, razao_social")
      setCompanies((empresas as CompanyRow[]).map((e) => ({ id: e.id, name: e.razao_social })))
      const { data: funcionarios } = await supabase.from("funcionarios").select("*")
      const mapped = (funcionarios as EmployeeRow[]).map((f) => ({
        id: f.id,
        name: f.nome,
        email: f.email || "",
        phone: f.telefone || "",
        position: f.cargo || "",
        department: f.departamento || "",
        status: f.status === "ativo" ? "Ativo" : f.status === "inativo" ? "Inativo" : "Cancelado",
        companyId: f.empresa_id,
        cpf: f.cpf,
        admission: f.data_admissao || "",
        birthDate: f.data_nascimento || "",
        address: f.endereco || "",
      }))
      setEmployees(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase())

      const matchesCompany = companyFilter === "all" || e.companyId === companyFilter

      return matchesSearch && matchesCompany
    })
  }, [employees, search, companyFilter])

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredEmployees, currentPage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCompanyFilter = (value: string) => {
    setCompanyFilter(value)
    setCurrentPage(1)
  }

  const handleCreateEmployee = async (data: any) => {
    await supabase.from("funcionarios").insert({
      nome: data.name,
      email: data.email,
      telefone: data.phone,
      cargo: data.position,
      departamento: data.department,
      status: "ativo",
      empresa_id: data.companyId,
      cpf: data.cpf,
      data_admissao: data.admission,
      data_nascimento: data.birthDate,
      endereco: data.address,
    })
    setModalOpen(false)
    const { data: funcionarios } = await supabase.from("funcionarios").select("*")
    const mapped = (funcionarios as EmployeeRow[]).map((f) => ({
      id: f.id,
      name: f.nome,
      email: f.email || "",
      phone: f.telefone || "",
      position: f.cargo || "",
      department: f.departamento || "",
      status: f.status === "ativo" ? "Ativo" : f.status === "inativo" ? "Inativo" : "Cancelado",
      companyId: f.empresa_id,
      cpf: f.cpf,
      admission: f.data_admissao || "",
      birthDate: f.data_nascimento || "",
      address: f.endereco || "",
    }))
    setEmployees(mapped)
  }

  const handleEditEmployee = async (data: any) => {
    if (!editingEmployee) return
    await supabase
      .from("funcionarios")
      .update({
        nome: data.name,
        email: data.email,
        telefone: data.phone,
        cargo: data.position,
        departamento: data.department,
        empresa_id: data.companyId,
        cpf: data.cpf,
        data_admissao: data.admission,
        data_nascimento: data.birthDate,
        endereco: data.address,
      })
      .eq("id", editingEmployee.id)
    setEditingEmployee(null)
    const { data: funcionarios } = await supabase.from("funcionarios").select("*")
    const mapped = (funcionarios as EmployeeRow[]).map((f) => ({
      id: f.id,
      name: f.nome,
      email: f.email || "",
      phone: f.telefone || "",
      position: f.cargo || "",
      department: f.departamento || "",
      status: f.status === "ativo" ? "Ativo" : f.status === "inativo" ? "Inativo" : "Cancelado",
      companyId: f.empresa_id,
      cpf: f.cpf,
      admission: f.data_admissao || "",
      birthDate: f.data_nascimento || "",
      address: f.endereco || "",
    }))
    setEmployees(mapped)
  }

  const handleCancelEmployee = async (reason: string) => {
    if (!cancelingEmployee) return
    await supabase.from("funcionarios").update({ status: "cancelado" }).eq("id", cancelingEmployee.id)
    setCancelingEmployee(null)
    const { data: funcionarios } = await supabase.from("funcionarios").select("*")
    const mapped = (funcionarios as EmployeeRow[]).map((f) => ({
      id: f.id,
      name: f.nome,
      email: f.email || "",
      phone: f.telefone || "",
      position: f.cargo || "",
      department: f.departamento || "",
      status: f.status === "ativo" ? "Ativo" : f.status === "inativo" ? "Inativo" : "Cancelado",
      companyId: f.empresa_id,
      cpf: f.cpf,
      admission: f.data_admissao || "",
      birthDate: f.data_nascimento || "",
      address: f.endereco || "",
    }))
    setEmployees(mapped)
  }

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || "N/A"
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <DashboardHeader 
        title="Funcionários" 
        subtitle="Gestão de colaboradores e vínculos"
      >
        <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]">
          <Plus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
      </DashboardHeader>

      <ContentContainer className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, cargo ou email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
          <Select value={companyFilter} onValueChange={handleCompanyFilter}>
            <SelectTrigger className="w-full md:w-[250px] bg-slate-800/50 border-slate-700 text-white">
              <Building2 className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 animate-pulse">Carregando funcionários...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="glass-card p-5 rounded-xl hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50 hover:border-primary/30"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-lg font-bold text-slate-300 shadow-inner group-hover:from-primary/20 group-hover:to-primary/10 group-hover:border-primary/30 group-hover:text-primary transition-all">
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{employee.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-3 h-3" />
                        <span>{employee.position}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>{employee.department}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={employee.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-slate-700/50 mb-4 bg-slate-900/20 rounded-lg px-4 mx-[-0.5rem]">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300 truncate" title={employee.email}>{employee.email || "Sem email"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">{employee.phone || "Sem telefone"}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                    onClick={() => {
                      setViewingEmployee(employee)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Detalhes
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      setEditingEmployee(employee)
                      setModalOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  {employee.status !== "Cancelado" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        setCancelingEmployee(employee)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Inativar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredEmployees.length}
          />
        </div>
      </ContentContainer>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingEmployee(null)
        }}
        onSuccess={() => {
          setModalOpen(false)
          setEditingEmployee(null)
          window.location.reload()
        }}
        employee={editingEmployee}
        companies={companies}
      />

      <EmployeeDetailsModal
        isOpen={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee}
      />

      <EmployeeCancelModal
        isOpen={!!cancelingEmployee}
        onClose={() => setCancelingEmployee(null)}
        onSuccess={() => {
          setCancelingEmployee(null)
          window.location.reload()
        }}
        employee={cancelingEmployee}
      />
    </div>
  )
}
