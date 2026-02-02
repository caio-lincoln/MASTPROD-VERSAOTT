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
      <DialogContent className="bg-background border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-6 h-6" />
            </div>
            {document.name}
          </DialogTitle>
          <p className="text-muted-foreground">
            Detalhes completos do documento
          </p>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Description */}
          <div className="p-4 rounded-lg bg-white border border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
            <p className="text-foreground leading-relaxed">{document.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Info */}
            <div className="p-4 rounded-lg bg-white border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Empresa</span>
              </div>
              <p className="font-medium">{document.companyName}</p>
            </div>

            {/* File Info */}
            <div className="p-4 rounded-lg bg-white border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Tamanho</span>
              </div>
              <p className="font-medium">{document.size}</p>
            </div>

            {/* Date Info */}
            <div className="p-4 rounded-lg bg-white border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Data de Upload</span>
              </div>
              <p className="font-medium">
                {new Date(document.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Uploader Info */}
            <div className="p-4 rounded-lg bg-white border border-border">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Enviado por</span>
              </div>
              <p className="font-medium">{document.uploadedBy}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="p-4 rounded-lg bg-white border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground border border-border">
                {document.category}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground border border-border">
                {document.type}
              </span>
              {document.tags && document.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground bg-transparent"
          >
            Fechar
          </Button>
          <Button 
            onClick={handleDownload}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
