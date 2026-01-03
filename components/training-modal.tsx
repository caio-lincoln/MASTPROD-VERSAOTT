"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Building2, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TrainingModalProps {
  open: boolean
  onClose: () => void
}

const mockCompanies = [
  { id: 1, name: "Empresa Alpha Ltda", cnpj: "12.345.678/0001-90" },
  { id: 2, name: "Beta Indústria S.A.", cnpj: "23.456.789/0001-01" },
  { id: 3, name: "Gamma Serviços", cnpj: "34.567.890/0001-12" },
  { id: 4, name: "Delta Construções", cnpj: "45.678.901/0001-23" },
  { id: 5, name: "Epsilon Tecnologia", cnpj: "56.789.012/0001-34" },
]

const mockEmployees = [
  { id: 1, name: "João Silva", position: "Eletricista", department: "Manutenção", companyId: 1 },
  { id: 2, name: "Maria Santos", position: "Supervisora", department: "Segurança", companyId: 1 },
  { id: 3, name: "Carlos Oliveira", position: "Operador", department: "Produção", companyId: 2 },
  { id: 4, name: "Ana Paula", position: "Técnica", department: "Qualidade", companyId: 2 },
  { id: 5, name: "Pedro Costa", position: "Soldador", department: "Produção", companyId: 3 },
  { id: 6, name: "Juliana Lima", position: "Analista", department: "RH", companyId: 3 },
  { id: 7, name: "Roberto Alves", position: "Motorista", department: "Logística", companyId: 4 },
  { id: 8, name: "Fernanda Souza", position: "Engenheira", department: "Projetos", companyId: 4 },
  { id: 9, name: "Ricardo Santos", position: "Operador", department: "Produção", companyId: 5 },
  { id: 10, name: "Camila Rocha", position: "Auxiliar", department: "Administrativo", companyId: 5 },
  { id: 11, name: "Marcos Ferreira", position: "Técnico", department: "Manutenção", companyId: 1 },
  { id: 12, name: "Patrícia Dias", position: "Coordenadora", department: "Qualidade", companyId: 2 },
]

export function TrainingModal({ open, onClose }: TrainingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    instructor: "",
    date: "",
    description: "",
    companyId: "",
  })

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])
  const [employeeSearch, setEmployeeSearch] = useState("")

  const filteredEmployees = useMemo(() => {
    if (!formData.companyId) return []

    return mockEmployees
      .filter((emp) => emp.companyId === Number.parseInt(formData.companyId))
      .filter(
        (emp) =>
          emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.position.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.department.toLowerCase().includes(employeeSearch.toLowerCase()),
      )
  }, [formData.companyId, employeeSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Training data:", { ...formData, employees: selectedEmployees })
    onClose()
  }

  const toggleAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id))
    }
  }

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Novo Treinamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Nome do Treinamento *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-300">
                    Carga Horária *
                  </Label>
                  <Input
                    id="duration"
                    placeholder="Ex: 8h"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor" className="text-slate-300">
                    Instrutor *
                  </Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-300">
                    Data *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-300">
                  Empresa *
                </Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, companyId: value })
                    setSelectedEmployees([])
                    setEmployeeSearch("")
                  }}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-xs text-slate-400">{company.cnpj}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.companyId && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Funcionários Participantes *</Label>
                    <span className="text-sm text-slate-400">{selectedEmployees.length} selecionado(s)</span>
                  </div>

                  {/* Campo de busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Buscar funcionários..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  {/* Lista de funcionários */}
                  <div className="border border-slate-700 rounded-lg bg-slate-800/50">
                    <div className="p-3 border-b border-slate-700 flex items-center gap-2">
                      <Checkbox
                        id="select-all"
                        checked={filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                        onCheckedChange={toggleAllEmployees}
                        className="border-slate-600 data-[state=checked]:bg-emerald-500"
                      />
                      <Label htmlFor="select-all" className="text-sm font-medium text-slate-300 cursor-pointer">
                        Selecionar todos ({filteredEmployees.length})
                      </Label>
                    </div>

                    <ScrollArea className="h-[240px]">
                      <div className="p-2 space-y-1">
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((employee) => (
                            <div
                              key={employee.id}
                              className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-700/50 transition-colors"
                            >
                              <Checkbox
                                id={`employee-${employee.id}`}
                                checked={selectedEmployees.includes(employee.id)}
                                onCheckedChange={() => toggleEmployee(employee.id)}
                                className="border-slate-600 data-[state=checked]:bg-emerald-500"
                              />
                              <Label
                                htmlFor={`employee-${employee.id}`}
                                className="flex items-center gap-3 flex-1 cursor-pointer"
                              >
                                <div className="p-2 rounded-lg bg-slate-700">
                                  <User className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-white">{employee.name}</div>
                                  <div className="text-xs text-slate-400">
                                    {employee.position} • {employee.department}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Nenhum funcionário encontrado</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {selectedEmployees.length === 0 && (
                    <p className="text-sm text-amber-400 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      Selecione pelo menos um funcionário para o treinamento
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.companyId || selectedEmployees.length === 0}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Treinamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
