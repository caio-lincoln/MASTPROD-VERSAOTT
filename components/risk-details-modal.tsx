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
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "Alto":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "Médio":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Baixo":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "Alta":
        return "text-red-400"
      case "Média":
        return "text-amber-400"
      case "Baixa":
        return "text-green-400"
      default:
        return "text-slate-400"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Detalhes do Risco Ocupacional
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Informações completas sobre o risco identificado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção: Identificação */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Identificação
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 text-sm">Nome do Risco:</span>
                <p className="text-white font-medium text-lg">{risk.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{risk.companyName}</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(risk.severity)}`}
                >
                  Severidade: {risk.severity}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
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
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Detalhamento
            </h3>
            <div className="space-y-3">
              {risk.description && (
                <div>
                  <span className="text-slate-400 text-sm">Descrição:</span>
                  <p className="text-slate-200 mt-1">{risk.description}</p>
                </div>
              )}
              {risk.source && (
                <div>
                  <span className="text-slate-400 text-sm">Fonte Geradora:</span>
                  <p className="text-slate-200 mt-1">{risk.source}</p>
                </div>
              )}
              {risk.consequences && (
                <div>
                  <span className="text-slate-400 text-sm">Possíveis Consequências:</span>
                  <p className="text-slate-200 mt-1">{risk.consequences}</p>
                </div>
              )}
              {risk.sector && (
                <div>
                  <span className="text-slate-400 text-sm">Setor:</span>
                  <p className="text-slate-200 mt-1">{risk.sector}</p>
                </div>
              )}
            </div>
          </div>

          {/* Seção: Medidas de Controle */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Medidas de Controle
            </h3>
            <div>
              <p className="text-slate-200">{risk.measures}</p>
            </div>
          </div>

          {/* Seção: Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risk.identifiedDate && (
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-400 text-sm">Data de Identificação</span>
                </div>
                <p className="text-white font-medium">
                  {new Date(risk.identifiedDate).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {risk.responsibleName && (
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-400 text-sm">Responsável</span>
                </div>
                <p className="text-white font-medium">{risk.responsibleName}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-medium">Status: {risk.status}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
