"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, FileText, Building2, Wind } from "lucide-react"

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
  const [environmentType, setEnvironmentType] = useState("")

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
      <DialogContent className="bg-background border-border text-foreground max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wind className="w-5 h-5 text-primary" />
            Evento S-2240: Condições Ambientais do Trabalho
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informe os dados sobre exposição a agentes nocivos e condições ambientais
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4 p-4 rounded-lg bg-white border border-border">
            <h3 className="font-medium text-primary">Período de Exposição</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Início *</Label>
                <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white border-border text-foreground"
                      required
                    />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border-border text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-lg bg-white border border-border">
            <h3 className="font-medium text-primary">Agentes Nocivos</h3>
            <div className="space-y-2">
              <Label htmlFor="environmentType">Tipo de Ambiente *</Label>
              <Select value={environmentType} onValueChange={setEnvironmentType}>
                <SelectTrigger className="bg-white border-border text-foreground">
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="1">1 - Estabelecimento do próprio empregador</SelectItem>
                  <SelectItem value="2">2 - Estabelecimento de terceiros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="riskAgent">Agente Nocivo *</Label>
                <Input
                  id="riskAgent"
                  value={riskAgent}
                  onChange={(e) => setRiskAgent(e.target.value)}
                  placeholder="Ex: Ruído, Calor, Benzeno..."
                  className="bg-white border-border text-foreground"
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
                  className="bg-white border-border text-foreground"
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
                  className="bg-white border-border text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epcUsed">EPC Utilizado</Label>
                <Input
                  id="epcUsed"
                  value={epcUsed}
                  onChange={(e) => setEpcUsed(e.target.value)}
                  placeholder="Equipamentos de Proteção Coletiva"
                  className="bg-white border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epiUsed">EPI Utilizado *</Label>
                <Input
                  id="epiUsed"
                  value={epiUsed}
                  onChange={(e) => setEpiUsed(e.target.value)}
                  placeholder="Equipamentos de Proteção Individual"
                  className="bg-white border-border text-foreground"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Informações adicionais sobre as condições ambientais..."
              className="bg-white border-border text-foreground min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Gerar Evento S-2240
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
