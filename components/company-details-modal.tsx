"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Building2, MapPin, Phone, Users, Shield, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Certificate } from "@/lib/esocial/events/types"
import { getDefaultCompanyCertificate } from "@/lib/esocial/events/repository"

interface CompanyDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: any
}

export function CompanyDetailsModal({ open, onOpenChange, company }: CompanyDetailsModalProps) {
  const [defaultCertificate, setDefaultCertificate] = useState<Certificate | null>(null)
  const [certificateLoading, setCertificateLoading] = useState(false)
  const [certificateError, setCertificateError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !company?.id) {
      setDefaultCertificate(null)
      setCertificateError(null)
      return
    }

    const load = async () => {
      setCertificateLoading(true)
      setCertificateError(null)
      try {
        const cert = await getDefaultCompanyCertificate(company.id as string)
        setDefaultCertificate(cert)
      } catch (error: any) {
        setCertificateError(error.message || "Erro ao carregar certificado da empresa.")
      } finally {
        setCertificateLoading(false)
      }
    }

    load()
  }, [open, company?.id])

  if (!company) return null

  const formatDate = (value: string | null) => {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleDateString("pt-BR")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes da Empresa
            {company.fromESocial && (
              <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                <Shield className="w-3 h-3 mr-1" />
                e-Social
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">Informações completas da empresa cadastrada</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-card border border-border space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4" />
              Informações Básicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Razão Social</p>
                <p className="text-sm text-foreground font-medium">{company.name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">CNPJ</p>
                <p className="text-sm text-foreground font-medium">{company.cnpj}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">CNAE</p>
                <p className="text-sm text-foreground font-medium">{company.cnae}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge className="bg-primary/10 text-primary border-primary/30">{company.status}</Badge>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Atividade Principal</p>
                <p className="text-sm text-foreground">{company.activityDescription}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Dados Fiscais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Natureza Jurídica</p>
                <p className="text-sm text-foreground font-medium">{company.legalNature || "-"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Classificação Tributária</p>
                <p className="text-sm text-foreground font-medium">{company.taxClassification || "-"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Início da Validade</p>
                <p className="text-sm text-foreground font-medium">{company.validityStartDate || "-"}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" />
              Certificado Digital
            </h3>

            {certificateLoading && (
              <p className="text-xs text-muted-foreground">Carregando informações do certificado...</p>
            )}

            {!certificateLoading && certificateError && (
              <p className="text-xs text-destructive">{certificateError}</p>
            )}

            {!certificateLoading && !certificateError && !defaultCertificate && (
              <p className="text-xs text-muted-foreground">Nenhum certificado padrão cadastrado para esta empresa.</p>
            )}

            {!certificateLoading && !certificateError && defaultCertificate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nome do Certificado</p>
                  <p className="text-sm text-foreground font-medium">{defaultCertificate.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Validade</p>
                  <p className="text-sm text-foreground font-medium">
                    {defaultCertificate.valid_from && defaultCertificate.valid_to
                      ? `${formatDate(defaultCertificate.valid_from)} até ${formatDate(defaultCertificate.valid_to)}`
                      : "-"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-card border border-border space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              Localização
            </h3>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Endereço</p>
                <p className="text-sm text-foreground">{company.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cidade</p>
                  <p className="text-sm text-foreground">{company.city}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Estado</p>
                  <p className="text-sm text-foreground">{company.state}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4" />
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                <p className="text-sm text-foreground">{company.phone}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">E-mail</p>
                <p className="text-sm text-foreground break-all">{company.email}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Responsável</p>
                <p className="text-sm text-foreground">{company.responsible}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border space-y-3">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              Estatísticas
            </h3>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Funcionários Cadastrados</p>
              <p className="text-2xl font-bold text-foreground">{company.employees}</p>
            </div>
          </div>

          {company.fromESocial && (
            <div className="p-4 rounded-lg bg-info/10 border border-info/30">
              <p className="text-sm text-info flex items-center gap-2">
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
