"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, BookOpen, MessageCircle, Mail, Phone, FileText, Video, LifeBuoy, ExternalLink, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header with Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Link href="/login">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Central de Suporte</h1>
              <p className="text-slate-400">Mastprod SST</p>
            </div>
          </div>
          <Link href="/login">
            <Button variant="outline" className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Login
            </Button>
          </Link>
        </div>

        {/* Search Section */}
        <div className="relative max-w-2xl mx-auto w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <Input 
            type="text" 
            placeholder="Como podemos ajudar você hoje?" 
            className="pl-10 h-14 bg-slate-900/50 border-slate-800 text-slate-200 focus-visible:ring-orange-500/50 text-lg rounded-xl"
          />
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              title: "Documentação", 
              icon: BookOpen, 
              desc: "Manuais e guias completos", 
              href: "#",
              color: "text-blue-400", 
              bg: "bg-blue-500/10",
              border: "border-blue-500/20"
            },
            { 
              title: "Vídeo Aulas", 
              icon: Video, 
              desc: "Tutoriais passo a passo", 
              href: "#",
              color: "text-purple-400", 
              bg: "bg-purple-500/10",
              border: "border-purple-500/20"
            },
            { 
              title: "Recuperar Acesso", 
              icon: LifeBuoy, 
              desc: "Problemas com login?", 
              href: "/forgot-password",
              color: "text-orange-400", 
              bg: "bg-orange-500/10",
              border: "border-orange-500/20"
            },
            { 
              title: "Chat Comercial", 
              icon: MessageCircle, 
              desc: "Fale com vendas", 
              href: "#",
              color: "text-emerald-400", 
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20"
            },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <Link key={index} href={item.href} className="block group">
                <Card className="h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-800/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200 group-hover:text-white">
                      {item.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${item.bg} ${item.border} border`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-slate-500 group-hover:text-slate-400">
                      {item.desc}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Dúvidas Comuns de Acesso</CardTitle>
                <CardDescription className="text-slate-400">
                  Soluções para os problemas mais frequentes no login.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-slate-200">Não lembro minha senha, o que fazer?</AccordionTrigger>
                    <AccordionContent>
                      Clique no link "Esqueceu a senha?" na tela de login ou acesse a opção "Recuperar Acesso" nesta página. Você receberá um e-mail com instruções para redefinir sua senha.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-slate-200">Meu usuário foi bloqueado</AccordionTrigger>
                    <AccordionContent>
                      Por segurança, o usuário é bloqueado após várias tentativas de acesso incorretas. Aguarde 30 minutos ou entre em contato com o suporte para desbloqueio imediato.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-slate-200">Como cadastrar uma nova empresa?</AccordionTrigger>
                    <AccordionContent>
                      O cadastro de novas empresas é realizado através do contato com nosso time comercial. Utilize os canais de atendimento ao lado para solicitar uma proposta.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-slate-200">Erro de "Certificado Inválido"</AccordionTrigger>
                    <AccordionContent>
                      Se você utiliza login via certificado digital, verifique se ele está conectado corretamente e dentro da validade. Limpe o cache do navegador e tente novamente.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Links Úteis</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  "Termos de Uso",
                  "Política de Privacidade",
                  "Manual do Usuário (PDF)",
                  "Status dos Serviços (Uptime)"
                ].map((tutorial, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-orange-500/30 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-slate-300 group-hover:text-orange-400 transition-colors">{tutorial}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-orange-500 transition-colors" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contact Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Fale Conosco</CardTitle>
                <CardDescription className="text-slate-400">
                  Suporte técnico especializado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <Phone className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">Telefone</div>
                    <div className="text-xs text-slate-400">0800 123 4567</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <Mail className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">Email</div>
                    <div className="text-xs text-slate-400">suporte@mastprod.com.br</div>
                  </div>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Suporte
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-800 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <CardHeader>
                <CardTitle className="text-lg text-white relative z-10">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-500">Operacional</span>
                </div>
                <p className="text-xs text-slate-400">
                  Todos os serviços funcionando normalmente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
