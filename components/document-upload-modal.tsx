"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, X, Loader2 } from "lucide-react"

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void> | void
  companies: Array<{ id: string; name: string; cnpj: string }>
}

export function DocumentUploadModal({ open, onOpenChange, onSubmit, companies }: DocumentUploadModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    companyId: "",
    companyName: "",
    description: "",
    version: "",
    tags: "",
    uploadedBy: "Administrador",
    size: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFormData({
        ...formData,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      })
    }
  }

  const handleCompanyChange = (value: string) => {
    const company = companies.find((c) => c.id.toString() === value)
    setFormData({
      ...formData,
      companyId: value,
      companyName: company?.name || "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.type || !formData.category || !formData.companyId || !selectedFile) {
      alert("Por favor, preencha todos os campos obrigatórios e selecione um arquivo")
      return
    }

    setIsSubmitting(true)

    // Read file as Base64
    const reader = new FileReader()
    reader.onload = async () => {
      const base64String = reader.result?.toString().split(',')[1] // remove data:application/pdf;base64, prefix
      
      try {
        await onSubmit({
          ...formData,
          companyId: formData.companyId,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          content_base64: base64String,
          content_type: selectedFile.type
        })

        // Reset form
        setFormData({
          name: "",
          type: "",
          category: "",
          companyId: "",
          companyName: "",
          description: "",
          version: "",
          tags: "",
          uploadedBy: "Administrador",
          size: "",
        })
        setSelectedFile(null)
      } catch (error) {
        console.error("Upload failed", error)
      } finally {
        setIsSubmitting(false)
      }
    }
    
    reader.onerror = () => {
      alert("Erro ao ler o arquivo")
      setIsSubmitting(false)
    }

    reader.readAsDataURL(selectedFile)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Adicione um novo documento à biblioteca digital
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Seleção de Arquivo */}
          <div className="space-y-2">
            <Label className="text-foreground">Arquivo *</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:border-primary/50 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
              />
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer w-full">
                {selectedFile ? (
                  <div className="flex items-center gap-3 text-primary w-full p-2">
                    <FileText className="w-8 h-8 flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{formData.size}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation() // Prevent triggering the file input
                        setSelectedFile(null)
                        setFormData({ ...formData, name: "", size: "" })
                      }}
                      className="ml-auto hover:bg-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-foreground font-medium mb-1">Clique para selecionar ou arraste o arquivo</p>
                    <p className="text-sm text-slate-500">PDF, Office, Imagens (máx. 50MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground">
                Tipo de Documento *
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-white border-input text-foreground focus:ring-primary/20">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border text-foreground">
                  <SelectItem value="Norma">Norma</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Programa">Programa</SelectItem>
                  <SelectItem value="Formulário">Formulário</SelectItem>
                  <SelectItem value="Procedimento">Procedimento</SelectItem>
                  <SelectItem value="Relatório">Relatório</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Categoria *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-white border-input text-foreground focus:ring-primary/20">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border text-foreground">
                  <SelectItem value="Legislação">Legislação</SelectItem>
                  <SelectItem value="Manuais">Manuais</SelectItem>
                  <SelectItem value="Programas">Programas</SelectItem>
                  <SelectItem value="Formulários">Formulários</SelectItem>
                  <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                  <SelectItem value="Relatórios">Relatórios</SelectItem>
                  <SelectItem value="Geral">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Empresa e Versão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground">
                Empresa Vinculada *
              </Label>
              <Select value={formData.companyId} onValueChange={handleCompanyChange}>
                <SelectTrigger className="bg-white border-input text-foreground focus:ring-primary/20">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border text-foreground">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version" className="text-foreground">
                Versão
              </Label>
              <Input
                id="version"
                placeholder="Ex: 1.0"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="bg-white border-input text-foreground focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o conteúdo do documento..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white border-input text-foreground min-h-[100px] focus-visible:ring-primary/20"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-foreground">
              Tags (separadas por vírgula)
            </Label>
            <Input
              id="tags"
              placeholder="Ex: NR-35, Altura, Segurança"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-white border-input text-foreground focus-visible:ring-primary/20"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-input text-muted-foreground hover:bg-slate-50 hover:text-foreground bg-transparent"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
