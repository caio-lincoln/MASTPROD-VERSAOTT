"use client"

import { Users, GraduationCap, HardHat, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, Calendar, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { KpiCard, DashboardHeader, ContentContainer, StatusBadge } from "./esocial/components/visual-components"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SystemStatusWidget } from "@/components/system-status-widget"

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
    <div className="space-y-8 pb-10">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Visão geral do sistema de gestão SST"
      >
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-border">
          <Button variant="ghost" size="sm" className="text-xs h-7 hover:bg-slate-100 text-muted-foreground">7D</Button>
          <Button variant="ghost" size="sm" className="text-xs h-7 hover:bg-slate-100 text-muted-foreground">30D</Button>
          <Button variant="secondary" size="sm" className="text-xs h-7 bg-blue-50 text-blue-700 hover:bg-blue-100">90D</Button>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.title}>
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
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-slate-100 text-slate-500 group-hover:text-primary transition-colors">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{training.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <Users className="w-3 h-3" />
                          <span>{training.employees} participantes</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
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
            
            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                Ver todos
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </ContentContainer>
        </div>

        <div className="space-y-6">
          <ContentContainer title="Ações Rápidas">
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Novo Funcionário", href: "/dashboard/employees", icon: Users },
                { label: "Agendar Treinamento", href: "/dashboard/trainings", icon: GraduationCap },
                { label: "Registrar EPI", href: "/dashboard/ppe", icon: HardHat },
                { label: "Enviar e-Social", href: "/dashboard/esocial", icon: TrendingUp },
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-slate-50 hover:border-primary/20 transition-all duration-200 group"
                  >
                    <div className="p-2 rounded-md bg-slate-100 text-slate-600 group-hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-foreground text-sm">{action.label}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )
              })}
            </div>
          </ContentContainer>

          <SystemStatusWidget />
          
          <div className="bg-white border border-border rounded-lg p-5 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-semibold text-foreground mb-1">Suporte Técnico</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Consulte nossa documentação ou entre em contato com o suporte técnico.
              </p>
              <Link href="/dashboard/help" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs h-8">
                  Central de Ajuda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
