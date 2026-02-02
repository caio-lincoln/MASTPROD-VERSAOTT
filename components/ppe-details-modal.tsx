"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Package, Calendar, ShieldCheck, Factory, FileText, AlertTriangle } from "lucide-react"

interface PPEDetailsModalProps {
  ppe: any
  onClose: () => void
}

export function PPEDetailsModal({ ppe, onClose }: PPEDetailsModalProps) {
  if (!ppe) return null

  return (
    <Dialog open={!!ppe} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Detalhes do EPI</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header com nome e status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">{ppe.name}</h3>
              <p className="text-sm text-muted-foreground">{ppe.type}</p>
            </div>
            <Badge
              className={`${
            ppe.status === "Adequado"
              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
              : ppe.status === "Cancelado"
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
            >
              {ppe.status}
            </Badge>
          </div>

          {/* Informações em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-white border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-medium">Certificado de Aprovação</span>
                </div>
                <p className="text-foreground font-semibold">{ppe.ca}</p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Factory className="w-4 h-4" />
                  <span className="text-xs font-medium">Fabricante</span>
                </div>
                <p className="text-foreground font-semibold">{ppe.manufacturer}</p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Empresa</span>
                </div>
                <p className="text-foreground font-semibold">{ppe.companyName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-white border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-medium">Quantidade em Estoque</span>
                </div>
                <p className="text-foreground font-semibold">{ppe.quantity} unidades</p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-medium">Quantidade Mínima</span>
                </div>
                <p className="text-foreground font-semibold">{ppe.minQuantity} unidades</p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Data de Validade</span>
                </div>
                <p className="text-foreground font-semibold">{ppe.validity}</p>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {ppe.description && (
            <div className="p-4 rounded-lg bg-white border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Descrição</span>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{ppe.description}</p>
            </div>
          )}

          {/* Alerta de estoque crítico */}
          {ppe.quantity < ppe.minQuantity && !ppe.isCancelled && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-semibold mb-1">Estoque Crítico</p>
                  <p className="text-red-700/80 text-sm">
                    A quantidade em estoque está abaixo do mínimo recomendado. É necessário realizar nova compra.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informações de cancelamento */}
          {ppe.isCancelled && ppe.cancelReason && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground font-semibold mb-1">EPI Cancelado</p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Motivo:</strong> {ppe.cancelReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
