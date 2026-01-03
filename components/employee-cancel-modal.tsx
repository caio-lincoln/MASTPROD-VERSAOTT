"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"

interface EmployeeCancelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  employeeName: string
}

export function EmployeeCancelModal({ open, onOpenChange, onConfirm, employeeName }: EmployeeCancelModalProps) {
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason)
      setReason("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Cancelar Funcionário
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Esta ação irá marcar o funcionário como cancelado, mas não apagará seus dados do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-slate-300 text-sm">
              <span className="font-medium">Funcionário:</span> {employeeName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300">
              Motivo do Cancelamento *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setReason("")
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
