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
      <DialogContent className="bg-background border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle>{editingPPE ? "Editar EPI" : "Novo EPI"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editingPPE ? "Atualize as informações do EPI" : "Preencha os dados para cadastrar um novo EPI"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-muted-foreground">
              Empresa *
            </Label>
            <Select value={formData.companyId} onValueChange={handleCompanyChange}>
              <SelectTrigger className={`bg-white border-border text-foreground ${errors.companyId ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()} className="text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-xs text-muted-foreground">{company.cnpj}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companyId && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.companyId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do EPI */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">
                Nome do EPI *
              </Label>
              <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Capacete de Segurança"
              className={`bg-white border-border text-foreground ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
            </div>

            {/* CA */}
            <div className="space-y-2">
              <Label htmlFor="ca" className="text-muted-foreground">
                Certificado de Aprovação (CA) *
              </Label>
              <Input
              id="ca"
              value={formData.ca}
              onChange={(e) => setFormData({ ...formData, ca: e.target.value })}
              placeholder="Ex: 12345"
              className={`bg-white border-border text-foreground ${errors.ca ? "border-destructive" : ""}`}
            />
            {errors.ca && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.ca}
              </p>
            )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-muted-foreground">
                Tipo de Proteção *
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className={`bg-white border-border text-foreground ${errors.type ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {ppeTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-foreground">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.type}
                </p>
              )}
            </div>

            {/* Fabricante */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-muted-foreground">
                Fabricante *
              </Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Ex: SafetyPro"
                className={`bg-white border-border text-foreground ${errors.manufacturer ? "border-destructive" : ""}`}
              />
              {errors.manufacturer && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.manufacturer}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-muted-foreground">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as características e especificações do EPI..."
              className="bg-white border-border text-foreground min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-muted-foreground">
                Quantidade em Estoque *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                className={`bg-white border-border text-foreground ${errors.quantity ? "border-destructive" : ""}`}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Quantidade Mínima */}
            <div className="space-y-2">
              <Label htmlFor="minQuantity" className="text-muted-foreground">
                Quantidade Mínima *
              </Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                placeholder="0"
                className={`bg-white border-border text-foreground ${errors.minQuantity ? "border-destructive" : ""}`}
              />
              {errors.minQuantity && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.minQuantity}
                </p>
              )}
            </div>

            {/* Validade */}
            <div className="space-y-2">
              <Label htmlFor="validity" className="text-muted-foreground">
                Data de Validade *
              </Label>
              <Input
                id="validity"
                type="date"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                className={`bg-white border-border text-foreground ${errors.validity ? "border-destructive" : ""}`}
              />
              {errors.validity && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.validity}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90"
          >
            {editingPPE ? "Atualizar" : "Cadastrar"} EPI
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
