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
      <DialogContent className="bg-white border-border text-foreground max-w-md sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Cancelar Funcionário
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Esta ação irá marcar o funcionário como cancelado, mas não apagará seus dados do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-3 rounded-lg bg-white border border-border">
            <p className="text-muted-foreground text-sm">
              <span className="font-medium">Funcionário:</span> {employeeName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground">
              Motivo do Cancelamento *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
              className="bg-white border-border text-foreground min-h-[100px]"
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
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
