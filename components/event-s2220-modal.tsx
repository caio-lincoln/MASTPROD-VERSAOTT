"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, FileText, Building2 } from "lucide-react"

interface EventS2220ModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EventS2220Modal({ isOpen, onClose }: EventS2220ModalProps) {
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [examDate, setExamDate] = useState("")
  const [examType, setExamType] = useState("")
  const [examResult, setExamResult] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [doctorCrm, setDoctorCrm] = useState("")
  const [doctorUf, setDoctorUf] = useState("")
  const [pcmsoCoordinator, setPcmsoCoordinator] = useState("")
  const [observations, setObservations] = useState("")

  const allCompanies = useMemo(
    () => [
      { id: 1, name: "TechCorp Solutions", cnpj: "12.345.678/0001-90" },
      { id: 2, name: "IndustrialMax Ltda", cnpj: "98.765.432/0001-10" },
      { id: 3, name: "ServiçoPro Brasil", cnpj: "11.222.333/0001-44" },
    ],
    [],
  )

  const allEmployees = useMemo(
    () => [
      { id: 1, name: "Carlos Silva", cpf: "123.456.789-00", role: "Operador de Máquinas", companyId: 1 },
      { id: 2, name: "Maria Santos", cpf: "987.654.321-00", role: "Técnica de Segurança", companyId: 1 },
      { id: 3, name: "João Oliveira", cpf: "456.789.123-00", role: "Soldador", companyId: 2 },
      { id: 4, name: "Ana Costa", cpf: "321.654.987-00", role: "Eletricista", companyId: 2 },
    ],
    [],
  )

  const filteredEmployees = useMemo(() => {
    if (!selectedCompany) return []
    return allEmployees.filter((emp) => emp.companyId === Number.parseInt(selectedCompany))
  }, [selectedCompany, allEmployees])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Criando evento S-2220...")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-border text-foreground max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Novo Evento S-2220 - Monitoramento da Saúde do Trabalhador
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informe os dados sobre exames médicos ocupacionais (ASO)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Identificação da Empresa */}
        <div className="space-y-4 p-4 rounded-lg bg-white border border-border">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Identificação
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {allCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name} - {company.cnpj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee">Funcionário *</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={!selectedCompany}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {filteredEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dados do Exame */}
          <div className="space-y-4 p-4 rounded-lg bg-white border border-border">
            <h3 className="font-semibold text-primary">Dados do Exame</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examDate">Data do Exame *</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="bg-background border-input text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="examType">Tipo de Exame *</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="admissional">Admissional</SelectItem>
                    <SelectItem value="periodico">Periódico</SelectItem>
                    <SelectItem value="retorno">Retorno ao Trabalho</SelectItem>
                    <SelectItem value="mudanca">Mudança de Função</SelectItem>
                    <SelectItem value="demissional">Demissional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="examResult">Resultado *</Label>
                <Select value={examResult} onValueChange={setExamResult}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="Selecione o resultado" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="apto">Apto</SelectItem>
                    <SelectItem value="inapto">Inapto</SelectItem>
                    <SelectItem value="apto_restricao">Apto com Restrição</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Médico Examinador */}
          <div className="space-y-4 p-4 rounded-lg bg-white border border-border">
            <h3 className="font-semibold text-primary">Médico Examinador</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="doctorName">Nome do Médico *</Label>
                <Input
                  id="doctorName"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Nome completo"
                  className="bg-background border-input text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorCrm">CRM *</Label>
                <Input
                  id="doctorCrm"
                  value={doctorCrm}
                  onChange={(e) => setDoctorCrm(e.target.value)}
                  placeholder="000000"
                  className="bg-background border-input text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorUf">UF *</Label>
                <Select value={doctorUf} onValueChange={setDoctorUf}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="BA">BA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="pcmsoCoordinator">Médico Coordenador do PCMSO *</Label>
                <Input
                  id="pcmsoCoordinator"
                  value={pcmsoCoordinator}
                  onChange={(e) => setPcmsoCoordinator(e.target.value)}
                  placeholder="Nome do médico coordenador"
                  className="bg-background border-input text-foreground"
                  required
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4 p-4 rounded-lg bg-white border border-border">
            <h3 className="font-semibold text-primary">Observações Adicionais</h3>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Informações adicionais sobre o exame..."
                className="bg-background border-input text-foreground min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-700" />
            <p className="text-sm text-blue-700">
              Este evento será gerado conforme layout oficial do eSocial S-2220 versão S-1.3
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-input text-muted-foreground hover:bg-slate-50 hover:text-foreground bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Gerar Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
