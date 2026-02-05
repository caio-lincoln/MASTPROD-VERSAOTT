"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, BookOpen, MessageCircle, Mail, Phone, FileText, Video, LifeBuoy, ExternalLink, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header with Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Link href="/login">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Central de Suporte</h1>
              <p className="text-muted-foreground">Mastprod SST</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-muted">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative max-w-2xl mx-auto w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input 
            type="text" 
            placeholder="Como podemos ajudar você hoje?" 
            className="pl-10 h-12 bg-white border-border text-foreground focus-visible:ring-primary/50 text-base rounded-lg shadow-none"
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
              color: "text-slate-700", 
              bg: "bg-slate-50",
              border: "border-slate-200"
            },
            { 
              title: "Vídeo Aulas", 
              icon: Video, 
              desc: "Tutoriais passo a passo", 
              href: "#",
              color: "text-primary", 
              bg: "bg-primary/10",
              border: "border-primary/20"
            },
            { 
              title: "Recuperar Acesso", 
              icon: LifeBuoy, 
              desc: "Problemas com login?", 
              href: "/forgot-password",
              color: "text-primary", 
              bg: "bg-primary/10",
              border: "border-primary/20"
            },
            { 
              title: "Chat Comercial", 
              icon: MessageCircle, 
              desc: "Fale com vendas", 
              href: "#",
              color: "text-green-700", 
              bg: "bg-green-50",
              border: "border-green-200"
            },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <Link key={index} href={item.href} className="block group">
                <Card className="h-full bg-white border-border shadow-sm hover:shadow-sm hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-white border border-border group-hover:border-primary/20 transition-colors`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground">
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
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Dúvidas Comuns de Acesso</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Soluções para os problemas mais frequentes no login.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-foreground">Não lembro minha senha, o que fazer?</AccordionTrigger>
                    <AccordionContent>
                      Clique no link "Esqueceu a senha?" na tela de login ou acesse a opção "Recuperar Acesso" nesta página. Você receberá um e-mail com instruções para redefinir sua senha.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-foreground">Meu usuário foi bloqueado</AccordionTrigger>
                    <AccordionContent>
                      Por segurança, o usuário é bloqueado após várias tentativas de acesso incorretas. Aguarde 30 minutos ou entre em contato com o suporte para desbloqueio imediato.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-foreground">Como cadastrar uma nova empresa?</AccordionTrigger>
                    <AccordionContent>
                      O cadastro de novas empresas é realizado através do contato com nosso time comercial. Utilize os canais de atendimento ao lado para solicitar uma proposta.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-foreground">Erro de "Certificado Inválido"</AccordionTrigger>
                    <AccordionContent>
                      Se você utiliza login via certificado digital, verifique se ele está conectado corretamente e dentro da validade. Limpe o cache do navegador e tente novamente.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Links Úteis</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  "Termos de Uso",
                  "Política de Privacidade",
                  "Manual do Usuário (PDF)",
                  "Status dos Serviços (Uptime)"
                ].map((tutorial, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-primary/30 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">{tutorial}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contact Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Fale Conosco</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Suporte técnico especializado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-border">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Telefone</div>
                    <div className="text-xs text-muted-foreground">0800 123 4567</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-border">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Email</div>
                    <div className="text-xs text-muted-foreground">suporte@mastprod.com.br</div>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Suporte
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-border relative">
              <CardHeader>
                <CardTitle className="text-lg text-foreground relative z-10">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-success" />
                  <span className="text-sm font-medium text-success">Operacional</span>
                </div>
                <p className="text-xs text-muted-foreground">
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
