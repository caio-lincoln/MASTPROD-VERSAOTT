"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"

interface RiskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  initialData?: any
  mode: "create" | "edit"
  companies: Array<{ id: string; name: string; cnpj: string }>
}

export function RiskModal({ open, onOpenChange, onSubmit, initialData, mode, companies }: RiskModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    severity: "",
    sector: "",
    measures: "",
    companyId: "",
    companyName: "",
    description: "",
    source: "",
    consequences: "",
    probability: "",
    identifiedDate: "",
    responsibleName: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        companyId: initialData.companyId?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        type: "",
        severity: "",
        sector: "",
        measures: "",
        companyId: "",
        companyName: "",
        description: "",
        source: "",
        consequences: "",
        probability: "",
        identifiedDate: "",
        responsibleName: "",
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.name ||
      !formData.type ||
      !formData.severity ||
      !formData.companyId ||
      !formData.description ||
      !formData.measures ||
      !formData.responsibleName
    ) {
      alert("Por favor, preencha todos os campos obrigatórios!")
      return
    }
    onSubmit(formData)
  }

  const handleCompanyChange = (value: string) => {
    const company = companies.find((c) => c.id.toString() === value)
    setFormData({
      ...formData,
      companyId: value,
      companyName: company?.name || "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo Risco Ocupacional" : "Editar Risco Ocupacional"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha as informações detalhadas sobre o risco identificado
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção: Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">Informações Básicas</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">
                  Empresa <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.companyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id.toString()}
                        className="text-white hover:bg-slate-700"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{company.name}</span>
                          <span className="text-xs text-slate-400">{company.cnpj}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">
                  Nome do Risco <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ruído excessivo"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">
                  Tipo <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="Físico" className="text-white hover:bg-slate-700">
                      Físico
                    </SelectItem>
                    <SelectItem value="Químico" className="text-white hover:bg-slate-700">
                      Químico
                    </SelectItem>
                    <SelectItem value="Biológico" className="text-white hover:bg-slate-700">
                      Biológico
                    </SelectItem>
                    <SelectItem value="Ergonômico" className="text-white hover:bg-slate-700">
                      Ergonômico
                    </SelectItem>
                    <SelectItem value="Acidente" className="text-white hover:bg-slate-700">
                      Acidente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">
                  Severidade <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="Baixo" className="text-white hover:bg-slate-700">
                      Baixo
                    </SelectItem>
                    <SelectItem value="Médio" className="text-white hover:bg-slate-700">
                      Médio
                    </SelectItem>
                    <SelectItem value="Alto" className="text-white hover:bg-slate-700">
                      Alto
                    </SelectItem>
                    <SelectItem value="Crítico" className="text-white hover:bg-slate-700">
                      Crítico
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Probabilidade</Label>
                <Select
                  value={formData.probability}
                  onValueChange={(value) => setFormData({ ...formData, probability: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="Baixa" className="text-white hover:bg-slate-700">
                      Baixa
                    </SelectItem>
                    <SelectItem value="Média" className="text-white hover:bg-slate-700">
                      Média
                    </SelectItem>
                    <SelectItem value="Alta" className="text-white hover:bg-slate-700">
                      Alta
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Setor</Label>
                <Input
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Ex: Produção"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Data de Identificação</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="date"
                    value={formData.identifiedDate}
                    onChange={(e) => setFormData({ ...formData, identifiedDate: e.target.value })}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Detalhamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Detalhamento do Risco</h3>

            <div>
              <Label className="text-slate-300">
                Descrição <span className="text-red-400">*</span>
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva detalhadamente o risco identificado"
                className="bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-slate-300">Fonte Geradora</Label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Ex: Máquinas industriais em operação"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Possíveis Consequências</Label>
              <Textarea
                value={formData.consequences}
                onChange={(e) => setFormData({ ...formData, consequences: e.target.value })}
                placeholder="Descreva as possíveis consequências da exposição ao risco"
                className="bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
              />
            </div>
          </div>

          {/* Seção: Controle e Medidas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Controle e Medidas</h3>

            <div>
              <Label className="text-slate-300">
                Medidas de Controle <span className="text-red-400">*</span>
              </Label>
              <Textarea
                value={formData.measures}
                onChange={(e) => setFormData({ ...formData, measures: e.target.value })}
                placeholder="Descreva as medidas de controle implementadas ou recomendadas"
                className="bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-slate-300">
                Responsável <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.responsibleName}
                onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                placeholder="Nome do responsável pela gestão do risco"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {mode === "create" ? "Criar Risco" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
