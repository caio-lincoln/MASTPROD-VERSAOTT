"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Building2, Users, MapPin, Eye, Edit, Trash2, Shield } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { CompanyModal } from "@/components/company-modal"
import { CompanyDetailsModal } from "@/components/company-details-modal"

const mockCompanies = [
  {
    id: 1,
    name: "Empresa Alpha Ltda",
    cnpj: "12.345.678/0001-90",
    employees: 120,
    city: "São Paulo",
    state: "SP",
    status: "Ativa",
    fromESocial: true,
    address: "Av. Paulista, 1000",
    phone: "(11) 3000-0000",
    email: "contato@alpha.com.br",
    responsible: "Carlos Silva",
    cnae: "6201-5/00",
    activityDescription: "Desenvolvimento de programas de computador sob encomenda",
  },
  {
    id: 2,
    name: "Beta Indústria S.A.",
    cnpj: "23.456.789/0001-01",
    employees: 85,
    city: "Rio de Janeiro",
    state: "RJ",
    status: "Ativa",
    fromESocial: true,
    address: "Rua Industrial, 500",
    phone: "(21) 3100-0000",
    email: "contato@beta.com.br",
    responsible: "Maria Santos",
    cnae: "2511-0/00",
    activityDescription: "Fabricação de estruturas metálicas",
  },
  {
    id: 3,
    name: "Gamma Serviços",
    cnpj: "34.567.890/0001-12",
    employees: 43,
    city: "Belo Horizonte",
    state: "MG",
    status: "Ativa",
    fromESocial: false,
    address: "Rua dos Serviços, 200",
    phone: "(31) 3200-0000",
    email: "contato@gamma.com.br",
    responsible: "João Oliveira",
    cnae: "8121-4/00",
    activityDescription: "Limpeza em prédios e em domicílios",
  },
  {
    id: 4,
    name: "Delta Construções",
    cnpj: "45.678.901/0001-23",
    employees: 95,
    city: "Curitiba",
    state: "PR",
    status: "Ativa",
    fromESocial: false,
    address: "Av. das Construções, 800",
    phone: "(41) 3300-0000",
    email: "contato@delta.com.br",
    responsible: "Pedro Costa",
    cnae: "4120-4/00",
    activityDescription: "Construção de edifícios",
  },
  {
    id: 5,
    name: "Epsilon Tecnologia",
    cnpj: "56.789.012/0001-34",
    employees: 67,
    city: "Porto Alegre",
    state: "RS",
    status: "Ativa",
    fromESocial: true,
    address: "Rua Tech, 300",
    phone: "(51) 3400-0000",
    email: "contato@epsilon.com.br",
    responsible: "Ana Lima",
    cnae: "6202-3/00",
    activityDescription: "Desenvolvimento e licenciamento de programas de computador customizáveis",
  },
  {
    id: 6,
    name: "Zeta Logística",
    cnpj: "67.890.123/0001-45",
    employees: 54,
    city: "Salvador",
    state: "BA",
    status: "Ativa",
    fromESocial: false,
    address: "Av. Logística, 600",
    phone: "(71) 3500-0000",
    email: "contato@zeta.com.br",
    responsible: "Ricardo Alves",
    cnae: "5250-8/05",
    activityDescription: "Operador de transporte multimodal - OTM",
  },
  {
    id: 7,
    name: "Eta Alimentos",
    cnpj: "78.901.234/0001-56",
    employees: 112,
    city: "Fortaleza",
    state: "CE",
    status: "Ativa",
    fromESocial: false,
    address: "Rua das Indústrias, 900",
    phone: "(85) 3600-0000",
    email: "contato@eta.com.br",
    responsible: "Fernanda Rocha",
    cnae: "1033-3/01",
    activityDescription: "Fabricação de sucos de frutas, hortaliças e legumes, exceto concentrados",
  },
  {
    id: 8,
    name: "Theta Consultoria",
    cnpj: "89.012.345/0001-67",
    employees: 38,
    city: "Brasília",
    state: "DF",
    status: "Ativa",
    fromESocial: false,
    address: "SCS Quadra 1, Bloco A",
    phone: "(61) 3700-0000",
    email: "contato@theta.com.br",
    responsible: "Lucas Martins",
    cnae: "7020-4/00",
    activityDescription: "Atividades de consultoria em gestão empresarial",
  },
  {
    id: 9,
    name: "Iota Química",
    cnpj: "90.123.456/0001-78",
    employees: 78,
    city: "Recife",
    state: "PE",
    status: "Ativa",
    fromESocial: true,
    address: "Distrito Industrial, 1500",
    phone: "(81) 3800-0000",
    email: "contato@iota.com.br",
    responsible: "Paula Ferreira",
    cnae: "2013-4/00",
    activityDescription: "Fabricação de gases industriais",
  },
  {
    id: 10,
    name: "Kappa Metalúrgica",
    cnpj: "01.234.567/0001-89",
    employees: 145,
    city: "Campinas",
    state: "SP",
    status: "Ativa",
    fromESocial: true,
    address: "Rodovia dos Bandeirantes, Km 80",
    phone: "(19) 3900-0000",
    email: "contato@kappa.com.br",
    responsible: "Roberto Nunes",
    cnae: "2441-5/01",
    activityDescription: "Produção de ferro-gusa",
  },
  {
    id: 11,
    name: "Lambda Transportes",
    cnpj: "12.345.678/0002-90",
    employees: 62,
    city: "Goiânia",
    state: "GO",
    status: "Ativa",
    fromESocial: false,
    address: "Av. Goiás, 2000",
    phone: "(62) 4000-0000",
    email: "contato@lambda.com.br",
    responsible: "Juliana Souza",
    cnae: "4930-2/02",
    activityDescription:
      "Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal, interestadual e internacional",
  },
]

const ITEMS_PER_PAGE = 10

export default function CompaniesPage() {
  const [search, setSearch] = useState("")
  const [companies, setCompanies] = useState(mockCompanies)
  const [currentPage, setCurrentPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<(typeof mockCompanies)[0] | null>(null)
  const [viewingCompany, setViewingCompany] = useState<(typeof mockCompanies)[0] | null>(null)

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.cnpj.includes(search))
  }, [companies, search])

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE)

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCompanies, currentPage])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCreateCompany = (data: any) => {
    const newCompany = {
      ...data,
      id: companies.length + 1,
      fromESocial: false,
      status: "Ativa",
    }
    setCompanies([...companies, newCompany])
    setCreateModalOpen(false)
  }

  const handleEditCompany = (data: any) => {
    setCompanies(companies.map((c) => (c.id === editingCompany?.id ? { ...c, ...data } : c)))
    setEditingCompany(null)
  }

  const handleDeleteCompany = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta empresa?")) {
      setCompanies(companies.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Empresas</h2>
          <p className="text-slate-400">Gerencie as empresas vinculadas</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar empresas por nome ou CNPJ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedCompanies.map((company) => (
              <div
                key={company.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                        {company.fromESocial && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                            <Shield className="w-3 h-3" />
                            e-Social
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">CNPJ: {company.cnpj}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                      {company.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{company.employees} funcionários</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {company.city} - {company.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewingCompany(company)}
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </Button>
                    {!company.fromESocial && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCompany(company)}
                          className="border-slate-700 hover:bg-slate-800"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCompany(company.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCompanies.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredCompanies.length}
            />
          )}
        </CardContent>
      </Card>

      <CompanyModal
        open={createModalOpen || !!editingCompany}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false)
            setEditingCompany(null)
          }
        }}
        onSubmit={editingCompany ? handleEditCompany : handleCreateCompany}
        initialData={editingCompany}
        mode={editingCompany ? "edit" : "create"}
      />

      <CompanyDetailsModal
        open={!!viewingCompany}
        onOpenChange={(open) => !open && setViewingCompany(null)}
        company={viewingCompany}
      />
    </div>
  )
}
