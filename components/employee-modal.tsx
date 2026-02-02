"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  initialData?: any
  mode: "create" | "edit"
  companies: Array<{ id: number; name: string; cnpj: string }>
}

export function EmployeeModal({ open, onOpenChange, onSubmit, initialData, mode, companies }: EmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    position: "",
    department: "",
    companyId: "",
    admission: "",
    birthDate: "",
    address: "",
    city: "",
    state: "",
    status: "Ativo",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        cpf: initialData.cpf || "",
        position: initialData.position || "",
        department: initialData.department || "",
        companyId: initialData.companyId?.toString() || "",
        admission: initialData.admission || "",
        birthDate: initialData.birthDate || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        status: initialData.status || "Ativo",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        position: "",
        department: "",
        companyId: "",
        admission: "",
        birthDate: "",
        address: "",
        city: "",
        state: "",
        status: "Ativo",
      })
    }
  }, [initialData, open])

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
    }
    return value
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields if necessary or rely on HTML required attribute
    // Here we ensure companyId is a valid number, default to 0 if invalid
    const companyId = Number.parseInt(formData.companyId)
    
    onSubmit({
      ...formData,
      companyId: Number.isNaN(companyId) ? 0 : companyId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === "create" ? "Novo Funcionário" : "Editar Funcionário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
              Informações Básicas
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">
                Nome Completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-input text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-muted-foreground">
                  CPF *
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  className="bg-white border-input text-foreground"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-muted-foreground">
                  Data de Nascimento *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="bg-white border-input text-foreground"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">Contato</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-input text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-muted-foreground">
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  className="bg-white border-input text-foreground"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                />
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
              Informações Profissionais
            </h3>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-muted-foreground">
                Empresa *
              </Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              >
                <SelectTrigger className="bg-white border-input text-foreground">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name} - {company.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position" className="text-muted-foreground">
                  Cargo *
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="bg-white border-input text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-muted-foreground">
                  Departamento *
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="bg-white border-input text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admission" className="text-muted-foreground">
                Data de Admissão *
              </Label>
              <Input
                id="admission"
                type="date"
                value={formData.admission}
                onChange={(e) => setFormData({ ...formData, admission: e.target.value })}
                className="bg-white border-input text-foreground"
                required
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">Endereço</h3>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-muted-foreground">
                Endereço *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-white border-input text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-muted-foreground">
                  Cidade *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-white border-input text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-muted-foreground">
                  Estado *
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="bg-white border-input text-foreground"
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 w-full md:w-auto"
            >
              {mode === "create" ? "Cadastrar Funcionário" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
