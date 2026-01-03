"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface TrainingCancelModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export function TrainingCancelModal({ open, onClose, onConfirm }: TrainingCancelModalProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason)
      setReason("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold">Cancelar Treinamento</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            O treinamento não será apagado, apenas marcado como cancelado. Informe o motivo do cancelamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300">
              Motivo do Cancelamento *
            </Label>
            <Textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
              className="bg-slate-800 border-slate-700 text-white resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason.trim()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
            >
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
