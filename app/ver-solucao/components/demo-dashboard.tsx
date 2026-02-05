"use client"

import { motion } from "framer-motion"
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Zap, 
  Filter
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InstitutionalAudioPlayer } from "./institutional-audio-player"

const stats = [
  { label: "Empresas Ativas", value: "12", icon: Building2, color: "text-blue-600", bg: "bg-blue-100" },
  { label: "Demandas Ativas", value: "7", icon: FileText, color: "text-primary", bg: "bg-orange-100" },
  { label: "Demandas Críticas", value: "2", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  { label: "Conformidade", value: "96%", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
]

export function DemoDashboard() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="space-y-8">
      {/* Hero / Welcome */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão Inteligente em SST</h1>
            <p className="text-slate-500 mt-1">
              Visão geral da sua operação e demandas prioritárias.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
              <Zap className="w-4 h-4 mr-2" />
              Nova Demanda
            </Button>
          </div>
        </div>
      </section>

      {/* Institutional Audio Player */}
      <InstitutionalAudioPlayer />

      {/* Stats Grid */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={fadeIn}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 font-normal">
                    Hoje
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Workflow Workflow Visualization */}
      <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">Fluxo de Trabalho</Badge>
              <h3 className="text-2xl font-bold">Como você ganha tempo</h3>
              <p className="text-slate-400 leading-relaxed">
                Nossa plataforma centraliza a comunicação, elimina trocas de e-mail desnecessárias e automatiza o controle de vencimentos.
              </p>
              <div className="flex gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-emerald-400">48h</span>
                  <span className="text-xs text-slate-500 uppercase">Resolução Média</span>
                </div>
                <div className="w-px bg-slate-700 h-12"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-blue-400">-30%</span>
                  <span className="text-xs text-slate-500 uppercase">Custo Operacional</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700 md:hidden"></div>
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-700 hidden md:block"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  {[
                    { step: "1", title: "Solicitação", desc: "Cliente abre demanda" },
                    { step: "2", title: "Processamento", desc: "Engenharia atua" },
                    { step: "3", title: "Entrega", desc: "Documento liberado" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex md:flex-col items-center gap-4 md:text-center">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-primary text-primary font-bold flex items-center justify-center shrink-0 z-10">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
