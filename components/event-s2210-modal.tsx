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

interface EventS2210ModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EventS2210Modal({ isOpen, onClose }: EventS2210ModalProps) {
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [accidentDate, setAccidentDate] = useState("")
  const [accidentTime, setAccidentTime] = useState("")
  const [accidentType, setAccidentType] = useState("")
  const [bodyPart, setBodyPart] = useState("")
  const [accidentCause, setAccidentCause] = useState("")
  const [description, setDescription] = useState("")
  const [initialDiagnosis, setInitialDiagnosis] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [doctorCrm, setDoctorCrm] = useState("")
  const [doctorUf, setDoctorUf] = useState("")
  const [deathOccurred, setDeathOccurred] = useState("")

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
    console.log("Criando evento S-2210...")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Novo Evento S-2210 - Comunicação de Acidente de Trabalho
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Informe os dados sobre acidente ou doença ocupacional (CAT)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Identificação */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Identificação
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
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
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
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

          {/* Dados do Acidente */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-emerald-400">Dados do Acidente</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accidentDate">Data do Acidente *</Label>
                <Input
                  id="accidentDate"
                  type="date"
                  value={accidentDate}
                  onChange={(e) => setAccidentDate(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accidentTime">Hora do Acidente *</Label>
                <Input
                  id="accidentTime"
                  type="time"
                  value={accidentTime}
                  onChange={(e) => setAccidentTime(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accidentType">Tipo de Acidente *</Label>
                <Select value={accidentType} onValueChange={setAccidentType}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="tipico">Acidente Típico</SelectItem>
                    <SelectItem value="trajeto">Acidente de Trajeto</SelectItem>
                    <SelectItem value="doenca">Doença Ocupacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyPart">Parte do Corpo Atingida *</Label>
                <Input
                  id="bodyPart"
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  placeholder="Ex: Mão direita, Perna esquerda..."
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="accidentCause">Causa do Acidente *</Label>
                <Input
                  id="accidentCause"
                  value={accidentCause}
                  onChange={(e) => setAccidentCause(e.target.value)}
                  placeholder="Descreva a causa principal"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição do Acidente *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva detalhadamente como o acidente ocorreu..."
                  className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Atendimento Médico */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-emerald-400">Atendimento Médico</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="initialDiagnosis">Diagnóstico Inicial *</Label>
                <Input
                  id="initialDiagnosis"
                  value={initialDiagnosis}
                  onChange={(e) => setInitialDiagnosis(e.target.value)}
                  placeholder="CID-10 e descrição"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorName">Nome do Médico *</Label>
                <Input
                  id="doctorName"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Nome completo"
                  className="bg-slate-800 border-slate-700 text-white"
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
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorUf">UF *</Label>
                <Select value={doctorUf} onValueChange={setDoctorUf}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="SP">SP</SelectItem>
                    <SelectItem value="RJ">RJ</SelectItem>
                    <SelectItem value="MG">MG</SelectItem>
                    <SelectItem value="RS">RS</SelectItem>
                    <SelectItem value="BA">BA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deathOccurred">Houve Óbito? *</Label>
                <Select value={deathOccurred} onValueChange={setDeathOccurred}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-950/30 border border-red-900/50">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-300">
              A CAT deve ser comunicada ao INSS até o primeiro dia útil seguinte ao acidente
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-950/30 border border-blue-900/50">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-blue-300">
              Este evento será gerado conforme layout oficial do eSocial S-2210 versão S-1.3
            </p>
          </div>

          <div className="flex justify-end gap-3">
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
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              Gerar Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
