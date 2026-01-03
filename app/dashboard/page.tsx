import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, HardHat, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    title: "Funcionários",
    value: "248",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Treinamentos Ativos",
    value: "36",
    change: "+8%",
    trend: "up",
    icon: GraduationCap,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    title: "EPIs Cadastrados",
    value: "142",
    change: "-3%",
    trend: "down",
    icon: HardHat,
    color: "from-amber-500 to-amber-600",
  },
  {
    title: "Riscos Identificados",
    value: "28",
    change: "+5%",
    trend: "up",
    icon: AlertTriangle,
    color: "from-red-500 to-red-600",
  },
]

const recentTrainings = [
  { name: "NR-35 - Trabalho em Altura", employees: 15, status: "Em andamento", date: "2024-01-15" },
  { name: "NR-10 - Eletricidade", employees: 22, status: "Concluído", date: "2024-01-10" },
  { name: "CIPA - Prevenção de Acidentes", employees: 8, status: "Agendado", date: "2024-01-20" },
]

export default function DashboardPage() {
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
