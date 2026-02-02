"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Briefcase, Building2, MapPin, Calendar, CreditCard, AlertCircle } from "lucide-react"

interface EmployeeDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: any
  companyName: string
}

export function EmployeeDetailsModal({ open, onOpenChange, employee, companyName }: EmployeeDetailsModalProps) {
  if (!employee) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-success/10 text-success border-success/30"
      case "Férias":
        return "bg-warning/10 text-warning border-warning/30"
      case "Cancelado":
        return "bg-destructive/10 text-destructive border-destructive/30"
      default:
        return "bg-slate-50 text-muted-foreground border-border"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:rounded-lg shadow-sm">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold mb-2">{employee.name}</DialogTitle>
              <DialogDescription className="text-muted-foreground">Informações completas do funcionário</DialogDescription>
            </div>
            <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações Pessoais */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span>CPF</span>
                </div>
                <p className="text-foreground font-medium">{employee.cpf}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Nascimento</span>
                </div>
                <p className="text-foreground font-medium">{formatDate(employee.birthDate)}</p>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
                <p className="text-foreground font-medium break-words">{employee.email}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  <span>Telefone</span>
                </div>
                <p className="text-foreground font-medium">{employee.phone}</p>
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Informações Profissionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Building2 className="w-4 h-4" />
                  <span>Empresa</span>
                </div>
                <p className="text-foreground font-medium">{companyName}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Cargo</span>
                </div>
                <p className="text-foreground font-medium">{employee.position}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Departamento</span>
                </div>
                <p className="text-foreground font-medium">{employee.department}</p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Data de Admissão</span>
                </div>
                <p className="text-foreground font-medium">{formatDate(employee.admission)}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary border-b border-border pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Endereço Completo</span>
                </div>
                <p className="text-foreground font-medium">
                  {employee.address}, {employee.city} - {employee.state}
                </p>
              </div>
            </div>
          </div>

          {/* Cancelamento */}
          {employee.status === "Cancelado" && employee.cancelReason && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="text-destructive font-semibold mb-1">Funcionário Cancelado</h4>
                  <p className="text-muted-foreground text-sm mb-2">
                    <span className="font-medium">Motivo:</span> {employee.cancelReason}
                  </p>
                  {employee.cancelDate && (
                    <p className="text-muted-foreground text-xs">Cancelado em: {formatDate(employee.cancelDate)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
