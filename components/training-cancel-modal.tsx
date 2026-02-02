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
      <DialogContent className="bg-white border-border text-foreground max-w-md sm:rounded-lg shadow-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
            <DialogTitle className="text-xl font-bold">Cancelar Treinamento</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            O treinamento não será apagado, apenas marcado como cancelado. Informe o motivo do cancelamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground">
              Motivo do Cancelamento *
            </Label>
            <Textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
              className="bg-white border-border text-foreground resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-muted"
            >
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason.trim()}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50"
            >
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
