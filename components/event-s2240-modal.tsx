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

interface EventS2240ModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EventS2240Modal({ isOpen, onClose }: EventS2240ModalProps) {
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [riskAgent, setRiskAgent] = useState("")
  const [riskType, setRiskType] = useState("")
  const [intensity, setIntensity] = useState("")
  const [technique, setTechnique] = useState("")
  const [epcUsed, setEpcUsed] = useState("")
  const [epiUsed, setEpiUsed] = useState("")
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
    // Aqui seria a lógica para criar o evento
    console.log("Criando evento S-2240...")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Novo Evento S-2240 - Condições Ambientais do Trabalho
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Informe os dados sobre exposição a agentes nocivos e condições ambientais
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Identificação */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-orange-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Identificação
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
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
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
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

          {/* Período de Exposição */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-orange-400">Período de Exposição</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Agente Nocivo */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-orange-400">Agente Nocivo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskType">Tipo de Risco *</Label>
                <Select value={riskType} onValueChange={setRiskType}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="fisico">Físico</SelectItem>
                    <SelectItem value="quimico">Químico</SelectItem>
                    <SelectItem value="biologico">Biológico</SelectItem>
                    <SelectItem value="ergonomico">Ergonômico</SelectItem>
                    <SelectItem value="acidente">Acidente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskAgent">Agente *</Label>
                <Input
                  id="riskAgent"
                  value={riskAgent}
                  onChange={(e) => setRiskAgent(e.target.value)}
                  placeholder="Ex: Ruído, Calor, Benzeno..."
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intensity">Intensidade/Concentração *</Label>
                <Input
                  id="intensity"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  placeholder="Ex: 85 dB, 30°C..."
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technique">Técnica de Medição *</Label>
                <Input
                  id="technique"
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  placeholder="Ex: Dosimetria, Termômetro..."
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Medidas de Controle */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-orange-400">Medidas de Controle</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="epcUsed">EPC Utilizado</Label>
                <Input
                  id="epcUsed"
                  value={epcUsed}
                  onChange={(e) => setEpcUsed(e.target.value)}
                  placeholder="Equipamentos de Proteção Coletiva"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epiUsed">EPI Utilizado *</Label>
                <Input
                  id="epiUsed"
                  value={epiUsed}
                  onChange={(e) => setEpiUsed(e.target.value)}
                  placeholder="Equipamentos de Proteção Individual"
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Informações adicionais sobre as condições ambientais..."
                  className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-950/30 border border-blue-900/50">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-blue-300">
              Este evento será gerado conforme layout oficial do eSocial S-2240 versão S-1.3
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Gerar Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
