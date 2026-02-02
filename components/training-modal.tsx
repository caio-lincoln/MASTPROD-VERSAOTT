"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Building2, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabaseClient"

interface TrainingModalProps {
  open: boolean
  onClose: () => void
}

type CompanyRow = { id: string; razao_social: string; cnpj: string }
type EmployeeRow = { id: string; nome: string; cargo: string | null; departamento: string | null; empresa_id: string }

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
  const [companies, setCompanies] = useState<Array<{ id: string; name: string; cnpj: string }>>([])
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; position: string; department: string; companyId: string }>>([])

  useEffect(() => {
    const load = async () => {
      const { data: empresas } = await supabase.from("empresas").select("id, razao_social, cnpj")
      setCompanies((empresas as CompanyRow[]).map((c) => ({ id: c.id, name: c.razao_social, cnpj: c.cnpj })))
      const { data: funcs } = await supabase.from("funcionarios").select("id, nome, cargo, departamento, empresa_id")
      setEmployees(
        (funcs as EmployeeRow[]).map((f) => ({
          id: f.id,
          name: f.nome,
          position: f.cargo || "",
          department: f.departamento || "",
          companyId: f.empresa_id,
        })),
      )
    }
    if (open) load()
  }, [open])

  const filteredEmployees = useMemo(() => {
    if (!formData.companyId) return []

    return employees
      .filter((emp) => emp.companyId === formData.companyId)
      .filter(
        (emp) =>
          emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.position.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.department.toLowerCase().includes(employeeSearch.toLowerCase()),
      )
  }, [formData.companyId, employeeSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const run = async () => {
      for (const empId of selectedEmployees) {
        await supabase.from("treinamentos").insert({
          titulo: formData.name,
          descricao: formData.description,
          status: "agendado",
          data_inicio: formData.date,
          empresa_id: formData.companyId,
          funcionario_id: empId,
          tipo_acao: "novo",
        })
      }
      onClose()
    }
    run()
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
      <DialogContent className="bg-background border-border text-foreground max-w-4xl max-h-[90vh] overflow-hidden flex flex-col sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Novo Treinamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-muted-foreground">
                    Nome do Treinamento *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white border-border text-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-muted-foreground">
                    Carga Horária *
                  </Label>
                  <Input
                    id="duration"
                    placeholder="Ex: 8h"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="bg-white border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor" className="text-muted-foreground">
                    Instrutor *
                  </Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="bg-white border-border text-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-muted-foreground">
                    Data *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-muted-foreground">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-border text-foreground resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-muted-foreground">
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
                  <SelectTrigger className="bg-white border-border text-foreground">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id} className="text-popover-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-xs text-muted-foreground">{company.cnpj}</div>
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
                    <Label className="text-muted-foreground">Funcionários Participantes *</Label>
                    <span className="text-sm text-muted-foreground">{selectedEmployees.length} selecionado(s)</span>
                  </div>

                  {/* Campo de busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar funcionários..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="pl-10 bg-white border-border text-foreground"
                    />
                  </div>

                  {/* Lista de funcionários */}
                  <div className="border border-border rounded-lg bg-white">
                    <div className="p-3 border-b border-border flex items-center gap-2">
                      <Checkbox
                        id="select-all"
                        checked={filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                        onCheckedChange={toggleAllEmployees}
                        className="border-input data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="select-all" className="text-sm font-medium text-muted-foreground cursor-pointer">
                        Selecionar todos ({filteredEmployees.length})
                      </Label>
                    </div>

                    <ScrollArea className="h-[240px]">
                      <div className="p-2 space-y-1">
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((employee) => (
                            <div
                              key={employee.id}
                              className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              <Checkbox
                                id={`employee-${employee.id}`}
                                checked={selectedEmployees.includes(Number(employee.id))}
                                onCheckedChange={() => toggleEmployee(Number(employee.id))}
                                className="border-input data-[state=checked]:bg-primary"
                              />
                              <Label
                                htmlFor={`employee-${employee.id}`}
                                className="flex items-center gap-3 flex-1 cursor-pointer"
                              >
                                <div className="p-2 rounded-lg bg-slate-100">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-foreground">{employee.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {employee.position} • {employee.department}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Nenhum funcionário encontrado</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {selectedEmployees.length === 0 && (
                    <p className="text-sm text-warning flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-warning" />
                      Selecione pelo menos um funcionário para o treinamento
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.companyId || selectedEmployees.length === 0}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Treinamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
