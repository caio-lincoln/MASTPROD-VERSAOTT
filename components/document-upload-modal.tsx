"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, X } from "lucide-react"

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.type || !formData.category || !formData.companyId) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    onSubmit({
      ...formData,
      companyId: formData.companyId, // Ensure this is a string as per updated types
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
          <DialogDescription className="text-slate-400">
            Adicione um novo documento à biblioteca digital
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Seleção de Arquivo */}
          <div className="space-y-2">
            <Label className="text-slate-300">Arquivo *</Label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                {selectedFile ? (
                  <div className="flex items-center gap-3 text-orange-400">
                    <FileText className="w-8 h-8" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-slate-400">{formData.size}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedFile(null)
                        setFormData({ ...formData, name: "", size: "" })
                      }}
                      className="ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-500 mb-3" />
                    <p className="text-slate-300 font-medium mb-1">Clique para selecionar ou arraste o arquivo</p>
                    <p className="text-sm text-slate-500">PDF, DOC, DOCX, XLS, XLSX, TXT (máx. 50MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-300">
                Tipo de Documento *
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="Norma" className="text-white">
                    Norma
                  </SelectItem>
                  <SelectItem value="Manual" className="text-white">
                    Manual
                  </SelectItem>
                  <SelectItem value="Programa" className="text-white">
                    Programa
                  </SelectItem>
                  <SelectItem value="Formulário" className="text-white">
                    Formulário
                  </SelectItem>
                  <SelectItem value="Procedimento" className="text-white">
                    Procedimento
                  </SelectItem>
                  <SelectItem value="Relatório" className="text-white">
                    Relatório
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-300">
                Categoria *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="Legislação" className="text-white">
                    Legislação
                  </SelectItem>
                  <SelectItem value="Manuais" className="text-white">
                    Manuais
                  </SelectItem>
                  <SelectItem value="Programas" className="text-white">
                    Programas
                  </SelectItem>
                  <SelectItem value="Formulários" className="text-white">
                    Formulários
                  </SelectItem>
                  <SelectItem value="Procedimentos" className="text-white">
                    Procedimentos
                  </SelectItem>
                  <SelectItem value="Relatórios" className="text-white">
                    Relatórios
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Empresa e Versão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-slate-300">
                Empresa Vinculada *
              </Label>
              <Select value={formData.companyId} onValueChange={handleCompanyChange}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()} className="text-white">
                      {company.name} - {company.cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version" className="text-slate-300">
                Versão
              </Label>
              <Input
                id="version"
                placeholder="Ex: 1.0"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o conteúdo do documento..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-slate-300">
              Tags (separadas por vírgula)
            </Label>
            <Input
              id="tags"
              placeholder="Ex: NR-35, Altura, Segurança"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          {/* Botões */}
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
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Fazer Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
