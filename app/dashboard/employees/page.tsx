"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, Phone, Briefcase, Eye, Edit, Trash2, Building2 } from "lucide-react"
import { EmployeeModal } from "@/components/employee-modal"
import { EmployeeDetailsModal } from "@/components/employee-details-modal"
import { EmployeeCancelModal } from "@/components/employee-cancel-modal"
import { Pagination } from "@/components/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockEmployees = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@empresa.com",
    phone: "(11) 98765-4321",
    position: "Eletricista",
    department: "Manutenção",
    status: "Ativo",
    companyId: 1,
    cpf: "123.456.789-01",
    admission: "2020-01-15",
    birthDate: "1985-05-20",
    address: "Rua das Flores, 100",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@empresa.com",
    phone: "(11) 98765-4322",
    position: "Supervisora",
    department: "Segurança",
    status: "Ativo",
    companyId: 1,
    cpf: "234.567.890-12",
    admission: "2019-03-10",
    birthDate: "1982-08-15",
    address: "Av. Paulista, 500",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos@empresa.com",
    phone: "(11) 98765-4323",
    position: "Operador",
    department: "Produção",
    status: "Ativo",
    companyId: 2,
    cpf: "345.678.901-23",
    admission: "2021-06-20",
    birthDate: "1990-11-30",
    address: "Rua Industrial, 200",
    city: "Rio de Janeiro",
    state: "RJ",
  },
  {
    id: 4,
    name: "Ana Paula",
    email: "ana@empresa.com",
    phone: "(11) 98765-4324",
    position: "Técnica",
    department: "Qualidade",
    status: "Férias",
    companyId: 2,
    cpf: "456.789.012-34",
    admission: "2018-09-05",
    birthDate: "1987-02-14",
    address: "Rua do Comércio, 300",
    city: "Rio de Janeiro",
    state: "RJ",
  },
  {
    id: 5,
    name: "Pedro Costa",
    email: "pedro@empresa.com",
    phone: "(11) 98765-4325",
    position: "Soldador",
    department: "Produção",
    status: "Ativo",
    companyId: 3,
    cpf: "567.890.123-45",
    admission: "2022-01-10",
    birthDate: "1992-07-25",
    address: "Av. das Nações, 400",
    city: "Belo Horizonte",
    state: "MG",
  },
  {
    id: 6,
    name: "Juliana Lima",
    email: "juliana@empresa.com",
    phone: "(11) 98765-4326",
    position: "Analista",
    department: "RH",
    status: "Ativo",
    companyId: 3,
    cpf: "678.901.234-56",
    admission: "2020-11-15",
    birthDate: "1988-04-10",
    address: "Rua dos Serviços, 150",
    city: "Belo Horizonte",
    state: "MG",
  },
  {
    id: 7,
    name: "Roberto Alves",
    email: "roberto@empresa.com",
    phone: "(11) 98765-4327",
    position: "Motorista",
    department: "Logística",
    status: "Ativo",
    companyId: 4,
    cpf: "789.012.345-67",
    admission: "2019-07-20",
    birthDate: "1983-12-05",
    address: "Av. das Construções, 600",
    city: "Curitiba",
    state: "PR",
  },
  {
    id: 8,
    name: "Fernanda Souza",
    email: "fernanda@empresa.com",
    phone: "(11) 98765-4328",
    position: "Engenheira",
    department: "Projetos",
    status: "Ativo",
    companyId: 5,
    cpf: "890.123.456-78",
    admission: "2021-02-01",
    birthDate: "1991-09-18",
    address: "Rua Tech, 250",
    city: "Porto Alegre",
    state: "RS",
  },
  {
    id: 9,
    name: "Ricardo Santos",
    email: "ricardo@empresa.com",
    phone: "(11) 98765-4329",
    position: "Operador",
    department: "Produção",
    status: "Ativo",
    companyId: 6,
    cpf: "901.234.567-89",
    admission: "2020-05-15",
    birthDate: "1989-03-22",
    address: "Av. Logística, 500",
    city: "Salvador",
    state: "BA",
  },
  {
    id: 10,
    name: "Camila Rocha",
    email: "camila@empresa.com",
    phone: "(11) 98765-4330",
    position: "Auxiliar",
    department: "Administrativo",
    status: "Ativo",
    companyId: 7,
    cpf: "012.345.678-90",
    admission: "2022-03-10",
    birthDate: "1994-06-30",
    address: "Rua das Indústrias, 800",
    city: "Fortaleza",
    state: "CE",
  },
  {
    id: 11,
    name: "Marcos Ferreira",
    email: "marcos@empresa.com",
    phone: "(11) 98765-4331",
    position: "Técnico",
    department: "Manutenção",
    status: "Ativo",
    companyId: 1,
    cpf: "123.456.789-02",
    admission: "2021-08-20",
    birthDate: "1986-10-12",
    address: "Rua das Flores, 200",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: 12,
    name: "Patrícia Dias",
    email: "patricia@empresa.com",
    phone: "(11) 98765-4332",
    position: "Coordenadora",
    department: "Qualidade",
    status: "Férias",
    companyId: 2,
    cpf: "234.567.890-13",
    admission: "2018-12-01",
    birthDate: "1984-01-25",
    address: "Av. Industrial, 350",
    city: "Rio de Janeiro",
    state: "RJ",
  },
]

const mockCompanies = [
  { id: 1, name: "Empresa Alpha Ltda", cnpj: "12.345.678/0001-90" },
  { id: 2, name: "Beta Indústria S.A.", cnpj: "23.456.789/0001-01" },
  { id: 3, name: "Gamma Serviços", cnpj: "34.567.890/0001-12" },
  { id: 4, name: "Delta Construções", cnpj: "45.678.901/0001-23" },
  { id: 5, name: "Epsilon Tecnologia", cnpj: "56.789.012/0001-34" },
  { id: 6, name: "Zeta Logística", cnpj: "67.890.123/0001-45" },
  { id: 7, name: "Eta Alimentos", cnpj: "78.901.234/0001-56" },
]

const ITEMS_PER_PAGE = 10

export default function EmployeesPage() {
  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [employees, setEmployees] = useState(mockEmployees)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingEmployee, setViewingEmployee] = useState<(typeof mockEmployees)[0] | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<(typeof mockEmployees)[0] | null>(null)
  const [cancelingEmployee, setCancelingEmployee] = useState<(typeof mockEmployees)[0] | null>(null)

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase())

      const matchesCompany = companyFilter === "all" || e.companyId === Number.parseInt(companyFilter)

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

  const handleCreateEmployee = (data: any) => {
    const newEmployee = {
      ...data,
      id: employees.length + 1,
    }
    setEmployees([...employees, newEmployee])
    setModalOpen(false)
  }

  const handleEditEmployee = (data: any) => {
    setEmployees(employees.map((e) => (e.id === editingEmployee?.id ? { ...e, ...data } : e)))
    setEditingEmployee(null)
  }

  const handleCancelEmployee = (reason: string) => {
    if (cancelingEmployee) {
      setEmployees(
        employees.map((e) =>
          e.id === cancelingEmployee.id
            ? { ...e, status: "Cancelado", cancelReason: reason, cancelDate: new Date().toISOString() }
            : e,
        ),
      )
      setCancelingEmployee(null)
    }
  }

  const getCompanyName = (companyId: number) => {
    return mockCompanies.find((c) => c.id === companyId)?.name || "N/A"
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
                  {mockCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
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
        companies={mockCompanies}
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
