"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, User, Users, Building2, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"

interface TrainingDetailsModalProps {
  training: any
  open: boolean
  onClose: () => void
}

export function TrainingDetailsModal({ training, open, onClose }: TrainingDetailsModalProps) {
  if (!training) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-success/10 text-success border-success/20"
      case "em_andamento":
        return "bg-warning/10 text-warning border-warning/20"
      case "agendado":
        return "bg-info/10 text-info border-info/20"
      case "cancelado":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido":
        return <CheckCircle2 className="w-4 h-4 mr-1" />
      case "em_andamento":
        return <Clock className="w-4 h-4 mr-1" />
      case "agendado":
        return <Calendar className="w-4 h-4 mr-1" />
      case "cancelado":
        return <AlertTriangle className="w-4 h-4 mr-1" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border text-foreground max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{training.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações Gerais */}
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Informações Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instrutor</p>
                  <p className="text-foreground font-medium">{training.instructor}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="text-foreground font-medium">{training.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carga Horária</p>
                  <p className="text-foreground font-medium">{training.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-foreground font-medium">{training.status}</p>
                </div>
              </div>
            </div>

            {training.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                <p className="text-foreground">{training.description}</p>
              </div>
            )}
          </div>

          {/* Funcionários Vinculados */}
          {training.employees && training.employees.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Funcionários Vinculados ({training.employees.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {training.employees.map((employee: any) => (
                  <div key={employee.id} className="p-3 bg-card/50 rounded-lg border border-border">
                    <p className="text-foreground font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.position} • {employee.department}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empresa Responsável (Single) */}
          {training.companyName && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Empresa Responsável</h3>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="text-foreground font-medium">{training.companyName}</p>
              </div>
            </div>
          )}

          {/* Empresas Vinculadas (Plural) */}
          {training.companies && training.companies.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Empresas Vinculadas ({training.companies.length})
                </h3>
              </div>
              <div className="space-y-3">
                {training.companies.map((company: any) => (
                  <div key={company.id} className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-foreground font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Motivo de Cancelamento */}
          {training.cancelReason && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-destructive mb-2">Motivo do Cancelamento</h3>
                  <p className="text-foreground">{training.cancelReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
