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
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do EPI</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header com nome e status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{ppe.name}</h3>
              <p className="text-sm text-slate-400">{ppe.type}</p>
            </div>
            <Badge
              className={`${
                ppe.status === "Adequado"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : ppe.status === "Cancelado"
                    ? "bg-slate-500/10 text-slate-400"
                    : "bg-red-500/10 text-red-400"
              }`}
            >
              {ppe.status}
            </Badge>
          </div>

          {/* Informações em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-medium">Certificado de Aprovação</span>
                </div>
                <p className="text-white font-semibold">{ppe.ca}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Factory className="w-4 h-4" />
                  <span className="text-xs font-medium">Fabricante</span>
                </div>
                <p className="text-white font-semibold">{ppe.manufacturer}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Empresa</span>
                </div>
                <p className="text-white font-semibold">{ppe.companyName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-medium">Quantidade em Estoque</span>
                </div>
                <p className="text-white font-semibold">{ppe.quantity} unidades</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-medium">Quantidade Mínima</span>
                </div>
                <p className="text-white font-semibold">{ppe.minQuantity} unidades</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Data de Validade</span>
                </div>
                <p className="text-white font-semibold">{ppe.validity}</p>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {ppe.description && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Descrição</span>
              </div>
              <p className="text-white text-sm leading-relaxed">{ppe.description}</p>
            </div>
          )}

          {/* Alerta de estoque crítico */}
          {ppe.quantity < ppe.minQuantity && !ppe.isCancelled && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold mb-1">Estoque Crítico</p>
                  <p className="text-red-300 text-sm">
                    A quantidade em estoque está abaixo do mínimo recomendado. É necessário realizar nova compra.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informações de cancelamento */}
          {ppe.isCancelled && ppe.cancelReason && (
            <div className="p-4 rounded-lg bg-slate-500/10 border border-slate-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-300 font-semibold mb-1">EPI Cancelado</p>
                  <p className="text-slate-400 text-sm">
                    <strong>Motivo:</strong> {ppe.cancelReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
