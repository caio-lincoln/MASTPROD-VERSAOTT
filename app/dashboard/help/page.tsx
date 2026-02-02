"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, BookOpen, MessageCircle, Mail, Phone, FileText, Video, LifeBuoy, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Central de Ajuda</h1>
        <p className="text-muted-foreground">
          Encontre respostas, tutoriais e entre em contato com nosso suporte técnico.
        </p>
      </div>

      {/* Search Section */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input 
          type="text" 
          placeholder="Busque por dúvidas, tutoriais ou códigos de erro..." 
          className="pl-10 h-12 bg-white border-border text-foreground focus-visible:ring-primary/50"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Documentação", 
            icon: BookOpen, 
            desc: "Manuais e guias completos", 
            href: "/dashboard/library",
            color: "text-slate-600", 
            bg: "bg-slate-50",
            border: "border-slate-200"
          },
          { 
            title: "Vídeo Aulas", 
            icon: Video, 
            desc: "Tutoriais passo a passo", 
            href: "#",
            color: "text-slate-600", 
            bg: "bg-slate-50",
            border: "border-slate-200"
          },
          { 
            title: "Chamados", 
            icon: LifeBuoy, 
            desc: "Acompanhe suas solicitações", 
            href: "#",
            color: "text-slate-600", 
            bg: "bg-slate-50",
            border: "border-slate-200"
          },
          { 
            title: "Chat Online", 
            icon: MessageCircle, 
            desc: "Fale com um atendente", 
            href: "#",
            color: "text-slate-600", 
            bg: "bg-slate-50",
            border: "border-slate-200"
          },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <Link key={index} href={item.href} className="block group">
              <Card className="h-full bg-white border-border hover:border-primary/20 transition-all hover:bg-slate-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground group-hover:text-primary">
                    {item.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${item.bg} ${item.border} border`}>
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
              <CardTitle className="text-xl text-foreground">Perguntas Frequentes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Respostas rápidas para as dúvidas mais comuns dos usuários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-foreground">Como cadastrar um novo Certificado Digital A1?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Para cadastrar um novo certificado, acesse <strong>Configurações &gt; Certificados</strong>. Clique em "Novo Certificado", faça o upload do arquivo .pfx e insira a senha. O sistema validará automaticamente a data de expiração e o CNPJ vinculado.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-foreground">O que fazer em caso de erro no envio do eSocial?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Verifique a mensagem de erro retornada pelo governo na aba <strong>eSocial &gt; Histórico de Envios</strong>. Erros comuns incluem dados cadastrais divergentes ou instabilidade no servidor do governo. Consulte nossa documentação para códigos de erro específicos.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-foreground">Como funciona o monitoramento de riscos?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    O módulo de Riscos permite cadastrar agentes nocivos e vinculá-los aos GHEs (Grupos Homogêneos de Exposição). As informações alimentam automaticamente os eventos S-2240 do eSocial.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-foreground">Posso importar dados de planilhas?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Sim, suportamos importação de funcionários e cargos via planilha CSV padrão. Acesse a área de importação no módulo correspondente para baixar o modelo.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Tutoriais em Destaque</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                "Primeiros passos no sistema Mastprod",
                "Configurando o envio automático do eSocial",
                "Gerenciando EPIs e vencimentos",
                "Relatórios de absenteísmo e afastamentos"
              ].map((tutorial, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-primary/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">{tutorial}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contact Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Canais de Atendimento</CardTitle>
              <CardDescription className="text-muted-foreground">
                Estamos disponíveis de Seg à Sex, das 08h às 18h.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">Telefone</div>
                  <div className="text-xs text-muted-foreground">0800 123 4567</div>
                  <div className="text-xs text-muted-foreground">(11) 99999-9999</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-border">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-foreground">Email</div>
                  <div className="text-xs text-muted-foreground">suporte@mastprod.com.br</div>
                  <div className="text-xs text-muted-foreground">comercial@mastprod.com.br</div>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <MessageCircle className="mr-2 h-4 w-4" />
                Iniciar Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-border overflow-hidden relative shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-foreground relative z-10">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">Todos os sistemas operacionais</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Última verificação: Agora mesmo
              </p>
              <Button variant="link" className="text-primary p-0 h-auto text-xs mt-2 hover:text-primary/80">
                Ver histórico de disponibilidade &rarr;
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
