"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Upload, CheckCircle2, XCircle } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-slate-400">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Certificado e-Social
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure o certificado digital para envio de eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
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
                      className="bg-slate-800 border-slate-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"
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
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Configurar Certificado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Informações do Sistema</CardTitle>
            <CardDescription className="text-slate-400">Dados sobre o sistema e ambiente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Versão do Sistema</p>
              <p className="text-sm font-medium text-white">1.0.0</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Ambiente</p>
              <p className="text-sm font-medium text-white">Produção</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Última Atualização</p>
              <p className="text-sm font-medium text-white">15/01/2024 10:30</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Status do Servidor</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
