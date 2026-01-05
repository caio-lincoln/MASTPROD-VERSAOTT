"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, HardHat, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

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
    { title: "Funcionários", value: String(metrics.funcionarios), change: "", trend: "up", icon: Users, color: "from-blue-500 to-blue-600" },
    { title: "Treinamentos Ativos", value: String(metrics.treinamentos_ativos), change: "", trend: "up", icon: GraduationCap, color: "from-emerald-500 to-emerald-600" },
    { title: "EPIs Cadastrados", value: String(metrics.epis), change: "", trend: "up", icon: HardHat, color: "from-amber-500 to-amber-600" },
    { title: "Riscos Identificados", value: String(metrics.riscos), change: "", trend: "up", icon: AlertTriangle, color: "from-red-500 to-red-600" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-slate-400">Visão geral do sistema de gestão SST</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown

          return (
            <Card
              key={stat.title}
              className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`w-4 h-4 ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`} />
                  <span className={`text-sm font-medium ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-slate-500">vs. mês anterior</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Treinamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrainings.map((training, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{training.name}</h4>
                    <p className="text-sm text-slate-400">
                      {training.employees} funcionários • {training.date}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      training.status === "Concluído"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : training.status === "Em andamento"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {training.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Novo Funcionário", href: "/dashboard/employees" },
                { label: "Agendar Treinamento", href: "/dashboard/trainings" },
                { label: "Registrar EPI", href: "/dashboard/ppe" },
                { label: "Enviar e-Social", href: "/dashboard/esocial" },
              ].map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="p-4 rounded-lg bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 text-center"
                >
                  <span className="text-sm font-medium text-white">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
