"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText, Building2, Calendar, User, Tag, Hash } from "lucide-react"

interface DocumentDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: any
}

export function DocumentDetailsModal({ open, onOpenChange, document }: DocumentDetailsModalProps) {
  if (!document) return null

  const handleDownload = () => {
    alert(`Baixando: ${document.name}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            Detalhes do Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nome e Categoria */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{document.name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-800 text-slate-300">
                {document.type}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400">
                {document.category}
              </span>
              {document.version && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500/10 text-orange-400">
                  v{document.version}
                </span>
              )}
            </div>
          </div>

          {/* Descrição */}
          {document.description && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-slate-300 leading-relaxed">{document.description}</p>
            </div>
          )}

          {/* Informações em Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Empresa */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-slate-400">Empresa</span>
              </div>
              <p className="text-white font-medium">{document.companyName}</p>
            </div>

            {/* Tamanho */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-400">Tamanho</span>
              </div>
              <p className="text-white font-medium">{document.size}</p>
            </div>

            {/* Data de Upload */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-slate-400">Data de Upload</span>
              </div>
              <p className="text-white font-medium">
                {new Date(document.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Enviado por */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-slate-400">Enviado por</span>
              </div>
              <p className="text-white font-medium">{document.uploadedBy}</p>
            </div>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">Tags</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {document.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botão de Download */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Documento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
