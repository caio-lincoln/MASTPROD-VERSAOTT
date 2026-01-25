"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

interface PPEModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: any) => void
  editingPPE: any
  companies: { id: number; name: string; cnpj: string }[]
}

const ppeTypes = [
  "Proteção da Cabeça",
  "Proteção dos Olhos",
  "Proteção das Mãos",
  "Proteção dos Pés",
  "Proteção Auditiva",
  "Proteção Respiratória",
  "Proteção Contra Quedas",
  "Proteção do Tronco",
  "Proteção dos Braços",
]

export function PPEModal({ open, onOpenChange, onSave, editingPPE, companies }: PPEModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    ca: "",
    type: "",
    manufacturer: "",
    description: "",
    quantity: "",
    minQuantity: "",
    validity: "",
    companyId: "",
    companyName: "",
    status: "Adequado",
    isCancelled: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingPPE) {
      setFormData({
        name: editingPPE.name || "",
        ca: editingPPE.ca || "",
        type: editingPPE.type || "",
        manufacturer: editingPPE.manufacturer || "",
        description: editingPPE.description || "",
        quantity: editingPPE.quantity?.toString() || "",
        minQuantity: editingPPE.minQuantity?.toString() || "",
        validity: editingPPE.validity || "",
        companyId: editingPPE.companyId?.toString() || "",
        companyName: editingPPE.companyName || "",
        status: editingPPE.status || "Adequado",
        isCancelled: editingPPE.isCancelled || false,
      })
    } else {
      setFormData({
        name: "",
        ca: "",
        type: "",
        manufacturer: "",
        description: "",
        quantity: "",
        minQuantity: "",
        validity: "",
        companyId: "",
        companyName: "",
        status: "Adequado",
        isCancelled: false,
      })
    }
    setErrors({})
  }, [editingPPE, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório"
    if (!formData.ca.trim()) newErrors.ca = "CA é obrigatório"
    if (!formData.type) newErrors.type = "Tipo é obrigatório"
    if (!formData.manufacturer.trim()) newErrors.manufacturer = "Fabricante é obrigatório"
    if (!formData.quantity || Number.isNaN(Number.parseInt(formData.quantity)) || Number.parseInt(formData.quantity) < 0)
      newErrors.quantity = "Quantidade válida é obrigatória"
    if (!formData.minQuantity || Number.isNaN(Number.parseInt(formData.minQuantity)) || Number.parseInt(formData.minQuantity) < 0)
      newErrors.minQuantity = "Quantidade mínima válida é obrigatória"
    if (!formData.validity) newErrors.validity = "Data de validade é obrigatória"
    if (!formData.companyId) newErrors.companyId = "Empresa é obrigatória"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const quantity = Number.parseInt(formData.quantity)
    const minQuantity = Number.parseInt(formData.minQuantity)
    const status = quantity < minQuantity ? "Crítico" : "Adequado"

    onSave({
      ...formData,
      quantity,
      minQuantity,
      companyId: Number.parseInt(formData.companyId),
      status,
    })
  }

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find((c) => c.id.toString() === companyId)
    setFormData({
      ...formData,
      companyId,
      companyName: company?.name || "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPPE ? "Editar EPI" : "Novo EPI"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {editingPPE ? "Atualize as informações do EPI" : "Preencha os dados para cadastrar um novo EPI"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-slate-300">
              Empresa *
            </Label>
            <Select value={formData.companyId} onValueChange={handleCompanyChange}>
              <SelectTrigger className={`bg-slate-800/50 border-slate-700 text-white ${errors.companyId ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()} className="text-white">
                    <div className="flex flex-col">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-xs text-slate-400">{company.cnpj}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companyId && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.companyId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do EPI */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Nome do EPI *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Capacete de Segurança"
                className={`bg-slate-800/50 border-slate-700 text-white ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* CA */}
            <div className="space-y-2">
              <Label htmlFor="ca" className="text-slate-300">
                Certificado de Aprovação (CA) *
              </Label>
              <Input
                id="ca"
                value={formData.ca}
                onChange={(e) => setFormData({ ...formData, ca: e.target.value })}
                placeholder="Ex: 12345"
                className={`bg-slate-800/50 border-slate-700 text-white ${errors.ca ? "border-red-500" : ""}`}
              />
              {errors.ca && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.ca}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-300">
                Tipo de Proteção *
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className={`bg-slate-800/50 border-slate-700 text-white ${errors.type ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {ppeTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-white">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.type}
                </p>
              )}
            </div>

            {/* Fabricante */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-slate-300">
                Fabricante *
              </Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Ex: SafetyPro"
                className={`bg-slate-800/50 border-slate-700 text-white ${errors.manufacturer ? "border-red-500" : ""}`}
              />
              {errors.manufacturer && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.manufacturer}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as características e especificações do EPI..."
              className="bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-slate-300">
                Quantidade em Estoque *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                className={`bg-slate-800/50 border-slate-700 text-white ${errors.quantity ? "border-red-500" : ""}`}
              />
              {errors.quantity && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Quantidade Mínima */}
            <div className="space-y-2">
              <Label htmlFor="minQuantity" className="text-slate-300">
                Quantidade Mínima *
              </Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                placeholder="0"
                className={`bg-slate-800/50 border-slate-700 text-white ${errors.minQuantity ? "border-red-500" : ""}`}
              />
              {errors.minQuantity && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.minQuantity}
                </p>
              )}
            </div>

            {/* Validade */}
            <div className="space-y-2">
              <Label htmlFor="validity" className="text-slate-300">
                Data de Validade *
              </Label>
              <Input
                id="validity"
                type="date"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                className={`bg-slate-800/50 border-slate-700 text-white ${errors.validity ? "border-red-500" : ""}`}
              />
              {errors.validity && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.validity}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            {editingPPE ? "Atualizar" : "Cadastrar"} EPI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
