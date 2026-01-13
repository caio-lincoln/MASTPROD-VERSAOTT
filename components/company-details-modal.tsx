"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Building2, MapPin, Phone, Users, Shield, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CompanyDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: any
}

export function CompanyDetailsModal({ open, onOpenChange, company }: CompanyDetailsModalProps) {
  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes da Empresa
            {company.fromESocial && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                <Shield className="w-3 h-3 mr-1" />
                e-Social
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400">Informações completas da empresa cadastrada</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4" />
              Informações Básicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Razão Social</p>
                <p className="text-sm text-white font-medium">{company.name}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">CNPJ</p>
                <p className="text-sm text-white font-medium">{company.cnpj}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">CNAE</p>
                <p className="text-sm text-white font-medium">{company.cnae}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">{company.status}</Badge>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-slate-500 mb-1">Atividade Principal</p>
                <p className="text-sm text-white">{company.activityDescription}</p>
              </div>
            </div>
          </div>

          {/* Dados Fiscais */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Dados Fiscais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Natureza Jurídica</p>
                <p className="text-sm text-white font-medium">{company.legalNature || "-"}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Classificação Tributária</p>
                <p className="text-sm text-white font-medium">{company.taxClassification || "-"}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Início da Validade</p>
                <p className="text-sm text-white font-medium">{company.validityStartDate || "-"}</p>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              Localização
            </h3>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500 mb-1">Endereço</p>
                <p className="text-sm text-white">{company.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Cidade</p>
                  <p className="text-sm text-white">{company.city}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Estado</p>
                  <p className="text-sm text-white">{company.state}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4" />
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Telefone</p>
                <p className="text-sm text-white">{company.phone}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">E-mail</p>
                <p className="text-sm text-white break-all">{company.email}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-slate-500 mb-1">Responsável</p>
                <p className="text-sm text-white">{company.responsible}</p>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              Estatísticas
            </h3>

            <div>
              <p className="text-xs text-slate-500 mb-1">Funcionários Cadastrados</p>
              <p className="text-2xl font-bold text-white">{company.employees}</p>
            </div>
          </div>

          {company.fromESocial && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Esta empresa foi importada do e-Social e não pode ser editada ou excluída manualmente.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
