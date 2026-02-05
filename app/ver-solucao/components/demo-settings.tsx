"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, User, Bell, Shield, Mail } from "lucide-react"

export function DemoSettings() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [esocialAlerts, setEsocialAlerts] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500">Gerencie seu perfil e preferências do sistema.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informações do engenheiro responsável.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">EV</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="mr-2">Alterar Foto</Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remover</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="Engenheiro Visitante" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" defaultValue="engenharia@mastprod.com.br" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crea">Registro Profissional (CREA)</Label>
                  <Input id="crea" defaultValue="1234567890/SP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Input id="role" defaultValue="Engenheiro de Segurança do Trabalho" disabled />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-primary hover:bg-primary/90 text-white">Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Escolha como deseja ser alertado sobre eventos do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por E-mail</Label>
                  <p className="text-sm text-slate-500">Receba resumos diários e alertas críticos.</p>
                </div>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações Push</Label>
                  <p className="text-sm text-slate-500">Alertas em tempo real no navegador.</p>
                </div>
                <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Alertas do eSocial</Label>
                  <p className="text-sm text-slate-500">Notificar sobre erros e recibos de eventos.</p>
                </div>
                <Switch checked={esocialAlerts} onCheckedChange={setEsocialAlerts} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Vinculadas</CardTitle>
              <CardDescription>Clientes que você gerencia atualmente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Metalúrgica Steel Corp", cnpj: "12.345.678/0001-90", status: "Ativo" },
                  { name: "Construtora Horizonte", cnpj: "98.765.432/0001-10", status: "Ativo" },
                  { name: "Transportadora Veloz", cnpj: "45.678.901/0001-23", status: "Pendente" },
                  { name: "Supermercados Estrela", cnpj: "10.203.040/0001-55", status: "Ativo" },
                ].map((company, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{company.name}</h4>
                        <p className="text-xs text-slate-500">CNPJ: {company.cnpj}</p>
                      </div>
                    </div>
                    <Badge variant={company.status === "Ativo" ? "default" : "secondary"} className={company.status === "Ativo" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                      {company.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
