"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"

interface RiskDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  riskName: string
  loading?: boolean
}

export function RiskDeleteModal({ open, onOpenChange, onConfirm, riskName, loading }: RiskDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <Trash2 className="w-5 h-5" />
            Excluir Risco
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Esta ação é irreversível e removerá o risco do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-400">Atenção!</p>
              <p className="text-sm text-red-300/80">
                Você está prestes a excluir o risco <span className="font-semibold text-white">{riskName}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20"
          >
            {loading ? "Excluindo..." : "Confirmar Exclusão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
