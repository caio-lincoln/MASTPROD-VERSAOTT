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
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Cancelar EPI
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Esta ação não pode ser desfeita. O EPI será marcado como cancelado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-400 mb-1">EPI a ser cancelado:</p>
            <p className="text-white font-semibold">{ppe.name}</p>
            <p className="text-xs text-slate-500">CA: {ppe.ca}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300">
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
              className={`bg-slate-800/50 border-slate-700 text-white min-h-[100px] ${error ? "border-red-500" : ""}`}
            />
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>O EPI não será excluído permanentemente. Ele será mantido no sistema com status "Cancelado".</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
          >
            Voltar
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            Confirmar Cancelamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
