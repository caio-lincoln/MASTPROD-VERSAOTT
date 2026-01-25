"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Upload, CheckCircle2, XCircle } from "lucide-react"
import { DashboardHeader, ContentContainer } from "@/app/dashboard/esocial/components/visual-components"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DashboardHeader
        title="Configurações"
        subtitle="Gerencie as configurações do sistema"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentContainer className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none h-full">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 h-full">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-primary" />
                Certificado e-Social
              </h3>
              <p className="text-slate-400 text-sm">Configure o certificado digital para envio de eventos</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Certificado não configurado</p>
                    <p className="text-xs text-slate-400">Faça upload do certificado A1 (.pfx)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="certificate" className="text-slate-300">
                      Arquivo do Certificado
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="certificate"
                        type="file"
                        accept=".pfx,.p12"
                        className="bg-slate-800 border-slate-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">
                      Senha do Certificado
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite a senha"
                      className="bg-slate-800 border-slate-700 text-white focus:ring-primary/50 focus:border-primary/50"
                    />
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02]">
                    <Upload className="w-4 h-4 mr-2" />
                    Configurar Certificado
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>

        <ContentContainer className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none h-full">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 h-full">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-1">Informações do Sistema</h3>
              <p className="text-slate-400 text-sm">Dados sobre o sistema e ambiente</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex justify-between items-center">
                <span className="text-sm text-slate-400">Versão do Sistema</span>
                <span className="text-sm font-medium text-white">1.0.0</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex justify-between items-center">
                <span className="text-sm text-slate-400">Ambiente</span>
                <span className="text-sm font-medium text-white">Produção</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex justify-between items-center">
                <span className="text-sm text-slate-400">Última Atualização</span>
                <span className="text-sm font-medium text-white">15/01/2024 10:30</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex justify-between items-center">
                <span className="text-sm text-slate-400">Status do Servidor</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">Online</span>
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>
      </div>
    </div>
  )
}
