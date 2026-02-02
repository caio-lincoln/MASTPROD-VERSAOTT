"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Building2, AlertTriangle, Calendar, User, Shield, Activity, FileText, Target } from "lucide-react"

interface RiskDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  risk: any
}

export function RiskDetailsModal({ open, onOpenChange, risk }: RiskDetailsModalProps) {
  if (!risk) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Crítico":
        return "bg-red-50 text-red-700 border-red-200"
      case "Alto":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "Médio":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Baixo":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-slate-50 text-slate-600 border-slate-200"
    }
  }

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "Alta":
        return "bg-red-50 text-red-700 border-red-200"
      case "Média":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "Baixa":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-slate-50 text-slate-600 border-slate-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Detalhes do Risco Ocupacional
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informações completas sobre o risco identificado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção: Identificação */}
          <div className="p-4 rounded-lg bg-white border border-border space-y-3">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Identificação
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground text-sm">Nome do Risco:</span>
                <p className="text-foreground font-medium text-lg">{risk.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{risk.companyName}</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(risk.severity)}`}
                >
                  Severidade: {risk.severity}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Tipo: {risk.type}
                </span>
                {risk.probability && (
                  <span className={`text-sm font-medium ${getProbabilityColor(risk.probability)}`}>
                    Probabilidade: {risk.probability}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Detalhamento */}
          <div className="p-4 rounded-lg bg-white border border-border space-y-3">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Detalhamento
            </h3>
            <div className="space-y-3">
              {risk.description && (
                <div>
                  <span className="text-muted-foreground text-sm">Descrição:</span>
                  <p className="text-foreground mt-1">{risk.description}</p>
                </div>
              )}
              {risk.source && (
                <div>
                  <span className="text-muted-foreground text-sm">Fonte Geradora:</span>
                  <p className="text-foreground mt-1">{risk.source}</p>
                </div>
              )}
              {risk.consequences && (
                <div>
                  <span className="text-muted-foreground text-sm">Possíveis Consequências:</span>
                  <p className="text-foreground mt-1">{risk.consequences}</p>
                </div>
              )}
              {risk.sector && (
                <div>
                  <span className="text-muted-foreground text-sm">Setor:</span>
                  <p className="text-foreground mt-1">{risk.sector}</p>
                </div>
              )}
            </div>
          </div>

          {/* Seção: Medidas de Controle */}
          <div className="p-4 rounded-lg bg-white border border-border space-y-3">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Medidas de Controle
            </h3>
            <div>
              <p className="text-foreground">{risk.measures}</p>
            </div>
          </div>

          {/* Seção: Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risk.identifiedDate && (
              <div className="p-4 rounded-lg bg-white border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground text-sm">Data de Identificação</span>
                </div>
                <p className="text-foreground font-medium">
                  {new Date(risk.identifiedDate).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {risk.responsibleName && (
              <div className="p-4 rounded-lg bg-white border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground text-sm">Responsável</span>
                </div>
                <p className="text-foreground font-medium">{risk.responsibleName}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-700" />
              <span className="text-blue-700 font-medium">Status: {risk.status}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
