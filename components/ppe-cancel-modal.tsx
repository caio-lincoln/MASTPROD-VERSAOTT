"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, AlertCircle } from "lucide-react"

interface PPECancelModalProps {
  ppe: any
  onClose: () => void
  onConfirm: (id: number, reason: string) => void
}

export function PPECancelModal({ ppe, onClose, onConfirm }: PPECancelModalProps) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  if (!ppe) return null

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("O motivo do cancelamento é obrigatório")
      return
    }

    onConfirm(ppe.id, reason)
    setReason("")
    setError("")
  }

  const handleClose = () => {
    setReason("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={!!ppe} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-border text-foreground max-w-md sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Cancelar EPI
        </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Esta ação não pode ser desfeita. O EPI será marcado como cancelado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-white border border-border">
            <p className="text-sm text-muted-foreground mb-1">EPI a ser cancelado:</p>
            <p className="text-foreground font-semibold">{ppe.name}</p>
            <p className="text-xs text-muted-foreground">CA: {ppe.ca}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-muted-foreground">
              Motivo do Cancelamento *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError("")
              }}
              placeholder="Descreva o motivo do cancelamento (ex: EPI descontinuado, CA vencido, substituído por outro modelo...)"
              className={`bg-white border-border text-foreground min-h-[100px] ${error ? "border-destructive" : ""}`}
            />
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-warning text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>O EPI não será excluído permanentemente. Ele será mantido no sistema com status "Cancelado".</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-border text-foreground hover:bg-muted"
          >
            Voltar
          </Button>
          <Button onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            Confirmar Cancelamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
