"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, User, Users, Building2, FileText } from "lucide-react"

interface TrainingDetailsModalProps {
  training: any
  open: boolean
  onClose: () => void
}

export function TrainingDetailsModal({ training, open, onClose }: TrainingDetailsModalProps) {
  if (!training) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{training.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações Gerais */}
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Informações Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Instrutor</p>
                  <p className="text-white font-medium">{training.instructor}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Data</p>
                  <p className="text-white font-medium">{training.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Carga Horária</p>
                  <p className="text-white font-medium">{training.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <p className="text-white font-medium">{training.status}</p>
                </div>
              </div>
            </div>

            {training.description && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Descrição</p>
                <p className="text-white">{training.description}</p>
              </div>
            )}
          </Card>

          {/* Funcionários Vinculados */}
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">
                Funcionários Vinculados ({training.employees.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {training.employees.map((employee: any) => (
                <div key={employee.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <p className="text-white font-medium">{employee.name}</p>
                  <p className="text-sm text-slate-400">
                    {employee.position} • {employee.department}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Empresas Vinculadas */}
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Empresas Vinculadas ({training.companies.length})</h3>
            </div>
            <div className="space-y-3">
              {training.companies.map((company: any) => (
                <div key={company.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <p className="text-white font-medium">{company.name}</p>
                  <p className="text-sm text-slate-400">CNPJ: {company.cnpj}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Motivo de Cancelamento (se existir) */}
          {training.cancelReason && (
            <Card className="bg-red-500/10 border-red-500/20 p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Motivo do Cancelamento</h3>
              <p className="text-white">{training.cancelReason}</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
