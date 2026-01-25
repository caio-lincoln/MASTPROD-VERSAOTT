"use client"

import { Users, GraduationCap, HardHat, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, Calendar, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { KpiCard, DashboardHeader, ContentContainer, StatusBadge } from "./esocial/components/visual-components"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    funcionarios: 0,
    treinamentos_ativos: 0,
    epis: 0,
    riscos: 0,
  })
  const [recentTrainings, setRecentTrainings] = useState<Array<{ name: string; employees: number; status: string; date: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data: view } = await supabase.from("dashboard_metricas_por_empresa").select("*")
      const agg = (view || []).reduce(
        (acc, v: any) => {
          acc.funcionarios += v.total_funcionarios || 0
          acc.treinamentos_ativos += v.total_treinamentos_ativos || 0
          acc.epis += v.total_epis_cadastrados || 0
          acc.riscos += v.total_riscos_identificados || 0
          return acc
        },
        { funcionarios: 0, treinamentos_ativos: 0, epis: 0, riscos: 0 },
      )
      setMetrics(agg)
      const { data: trainings } = await supabase
        .from("treinamentos")
        .select("titulo, status, created_at, funcionario_id")
        .order("created_at", { ascending: false })
        .limit(5)
      setRecentTrainings(
        (trainings || []).map((t: any) => ({
          name: t.titulo,
          employees: t.funcionario_id ? 1 : 0,
          status:
            t.status === "concluido"
              ? "Concluído"
              : t.status === "em_andamento"
                ? "Em andamento"
              : t.status === "agendado"
                  ? "Agendado"
                  : t.status === "cancelado"
                    ? "Cancelado"
                    : "Agendado",
          date: (t.created_at || "").substring(0, 10),
        })),
      )
      setLoading(false)
    }
    load()
  }, [])

  const stats = [
    { title: "Funcionários", value: String(metrics.funcionarios), change: "+2%", trend: "up", icon: Users, description: "Total de colaboradores ativos" },
    { title: "Treinamentos", value: String(metrics.treinamentos_ativos), change: "+5%", trend: "up", icon: GraduationCap, description: "Treinamentos em andamento" },
    { title: "EPIs", value: String(metrics.epis), change: "+12%", trend: "up", icon: HardHat, description: "Equipamentos registrados" },
    { title: "Riscos", value: String(metrics.riscos), change: "-1%", trend: "down", icon: AlertTriangle, description: "Riscos identificados" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Visão geral do sistema de gestão SST"
      >
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
          <Button variant="ghost" size="sm" className="text-xs h-7 hover:bg-slate-800 text-slate-400">7D</Button>
          <Button variant="ghost" size="sm" className="text-xs h-7 hover:bg-slate-800 text-slate-400">30D</Button>
          <Button variant="secondary" size="sm" className="text-xs h-7 bg-primary/10 text-primary hover:bg-primary/20">90D</Button>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.title} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
            <KpiCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.change}
              trendUp={stat.trend === "up"}
              description={stat.description}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentContainer title="Treinamentos Recentes">
            <div className="space-y-1">
              {recentTrainings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum treinamento recente encontrado.
                </div>
              ) : (
                recentTrainings.map((training, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                        <GraduationCap className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white group-hover:text-primary transition-colors">{training.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Users className="w-3 h-3" />
                          <span>{training.employees} participantes</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <Calendar className="w-3 h-3" />
                          <span>{training.date}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={training.status} />
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <Button variant="ghost" className="text-sm text-muted-foreground hover:text-white group">
                Ver todos os treinamentos
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </ContentContainer>
        </div>

        <div className="space-y-6">
          <ContentContainer title="Ações Rápidas">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Novo Funcionário", href: "/dashboard/employees", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { label: "Agendar Treinamento", href: "/dashboard/trainings", icon: GraduationCap, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                { label: "Registrar EPI", href: "/dashboard/ppe", icon: HardHat, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { label: "Enviar e-Social", href: "/dashboard/esocial", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center gap-4 p-4 rounded-xl glass-card hover:bg-slate-800/80 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className={`p-3 rounded-lg ${action.bg} ${action.border} border group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{action.label}</span>
                    <div className="absolute right-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </ContentContainer>
          
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-600/10 opacity-50" />
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-white mb-2">Precisa de ajuda?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Consulte nossa documentação ou entre em contato com o suporte técnico.
              </p>
              <Button className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800">
                Central de Ajuda
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
