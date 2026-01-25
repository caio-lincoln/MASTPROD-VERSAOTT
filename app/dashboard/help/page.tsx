"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, BookOpen, MessageCircle, Mail, Phone, FileText, Video, LifeBuoy, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Central de Ajuda</h1>
        <p className="text-slate-400">
          Encontre respostas, tutoriais e entre em contato com nosso suporte técnico.
        </p>
      </div>

      {/* Search Section */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <Input 
          type="text" 
          placeholder="Busque por dúvidas, tutoriais ou códigos de erro..." 
          className="pl-10 h-12 bg-slate-900/50 border-slate-800 text-slate-200 focus-visible:ring-orange-500/50"
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
            title: "Chamados", 
            icon: LifeBuoy, 
            desc: "Acompanhe suas solicitações", 
            href: "#",
            color: "text-orange-400", 
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
          },
          { 
            title: "Chat Online", 
            icon: MessageCircle, 
            desc: "Fale com um atendente", 
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
              <CardTitle className="text-xl text-white">Perguntas Frequentes</CardTitle>
              <CardDescription className="text-slate-400">
                Respostas rápidas para as dúvidas mais comuns dos usuários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-slate-200">Como cadastrar um novo Certificado Digital A1?</AccordionTrigger>
                  <AccordionContent>
                    Para cadastrar um novo certificado, acesse <strong>Configurações &gt; Certificados</strong>. Clique em "Novo Certificado", faça o upload do arquivo .pfx e insira a senha. O sistema validará automaticamente a data de expiração e o CNPJ vinculado.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-slate-200">O que fazer em caso de erro no envio do eSocial?</AccordionTrigger>
                  <AccordionContent>
                    Verifique a mensagem de erro retornada pelo governo na aba <strong>eSocial &gt; Histórico de Envios</strong>. Erros comuns incluem dados cadastrais divergentes ou instabilidade no servidor do governo. Consulte nossa documentação para códigos de erro específicos.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-slate-200">Como funciona o monitoramento de riscos?</AccordionTrigger>
                  <AccordionContent>
                    O módulo de Riscos permite cadastrar agentes nocivos e vinculá-los aos GHEs (Grupos Homogêneos de Exposição). As informações alimentam automaticamente os eventos S-2240 do eSocial.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-slate-200">Posso importar dados de planilhas?</AccordionTrigger>
                  <AccordionContent>
                    Sim, suportamos importação de funcionários e cargos via planilha CSV padrão. Acesse a área de importação no módulo correspondente para baixar o modelo.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">Tutoriais em Destaque</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                "Primeiros passos no sistema Mastprod",
                "Configurando o envio automático do eSocial",
                "Gerenciando EPIs e vencimentos",
                "Relatórios de absenteísmo e afastamentos"
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
              <CardTitle className="text-lg text-white">Canais de Atendimento</CardTitle>
              <CardDescription className="text-slate-400">
                Estamos disponíveis de Seg à Sex, das 08h às 18h.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <Phone className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-200">Telefone</div>
                  <div className="text-xs text-slate-400">0800 123 4567</div>
                  <div className="text-xs text-slate-400">(11) 99999-9999</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <Mail className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-200">Email</div>
                  <div className="text-xs text-slate-400">suporte@mastprod.com.br</div>
                  <div className="text-xs text-slate-400">comercial@mastprod.com.br</div>
                </div>
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                Iniciar Chat
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
                <span className="text-sm font-medium text-emerald-500">Todos os sistemas operacionais</span>
              </div>
              <p className="text-xs text-slate-400">
                Última verificação: Agora mesmo
              </p>
              <Button variant="link" className="text-orange-400 p-0 h-auto text-xs mt-2 hover:text-orange-300">
                Ver histórico de disponibilidade &rarr;
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
