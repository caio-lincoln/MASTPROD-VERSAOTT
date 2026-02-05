"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, MoreVertical, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const documents = [
  { name: "PGR - Metalúrgica Steel Corp.pdf", type: "PGR", size: "2.4 MB", date: "05/02/2026" },
  { name: "PCMSO - Metalúrgica Steel Corp.pdf", type: "PCMSO", size: "1.8 MB", date: "05/02/2026" },
  { name: "LTCAT - Construtora Horizonte.pdf", type: "LTCAT", size: "5.2 MB", date: "04/02/2026" },
  { name: "ASO - João Silva.pdf", type: "ASO", size: "0.5 MB", date: "03/02/2026" },
  { name: "Treinamento NR-35 - Lista Presença.pdf", type: "Lista", size: "1.1 MB", date: "01/02/2026" },
]

export function DemoDocuments() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documentos</h2>
          <p className="text-slate-500">Repositório digital de laudos e arquivos.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">Upload</Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar documentos..." className="pl-10 border-none bg-slate-50" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc, idx) => (
          <Card key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 group-hover:text-primary transition-colors">{doc.name}</h4>
                  <p className="text-xs text-slate-500">{doc.type} • {doc.size} • {doc.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
