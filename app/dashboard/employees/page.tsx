"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, Phone, Briefcase, Eye, Edit, Trash2, Building2 } from "lucide-react"
import { EmployeeModal } from "@/components/employee-modal"
import { EmployeeDetailsModal } from "@/components/employee-details-modal"
import { EmployeeCancelModal } from "@/components/employee-cancel-modal"
import { Pagination } from "@/components/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Funcionários</h2>
          <p className="text-slate-400">Gerencie o cadastro de funcionários</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Filtrar por Empresa</label>
              <Select value={companyFilter} onValueChange={handleCompanyFilter}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todas as Empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar funcionários por nome, email ou cargo..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-slate-400">Carregando...</div>}
          {error && <div className="text-red-400">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{employee.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Briefcase className="w-3 h-3" />
                      <span>
                        {employee.position} • {employee.department}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                      <Building2 className="w-3 h-3" />
                      <span>{getCompanyName(employee.companyId)}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status === "Ativo"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : employee.status === "Férias"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {employee.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{employee.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingEmployee(employee)}
                    className="flex-1 border-slate-700 hover:bg-slate-800"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Visualizar
                  </Button>
                  {employee.status !== "Cancelado" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEmployee(employee)}
                        className="flex-1 border-slate-700 hover:bg-slate-800"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelingEmployee(employee)}
                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum funcionário encontrado</p>
            </div>
          )}

          {filteredEmployees.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredEmployees.length}
            />
          )}
        </CardContent>
      </Card>

      <EmployeeModal
        open={modalOpen || !!editingEmployee}
        onOpenChange={(open) => {
          if (!open) {
            setModalOpen(false)
            setEditingEmployee(null)
          }
        }}
        onSubmit={editingEmployee ? handleEditEmployee : handleCreateEmployee}
        initialData={editingEmployee}
        mode={editingEmployee ? "edit" : "create"}
        companies={companies.map((c) => ({ id: c.id, name: c.name, cnpj: "" }))}
      />

      <EmployeeDetailsModal
        open={!!viewingEmployee}
        onOpenChange={(open) => !open && setViewingEmployee(null)}
        employee={viewingEmployee}
        companyName={viewingEmployee ? getCompanyName(viewingEmployee.companyId) : ""}
      />

      <EmployeeCancelModal
        open={!!cancelingEmployee}
        onOpenChange={(open) => !open && setCancelingEmployee(null)}
        onConfirm={handleCancelEmployee}
        employeeName={cancelingEmployee?.name || ""}
      />
    </div>
  )
}
