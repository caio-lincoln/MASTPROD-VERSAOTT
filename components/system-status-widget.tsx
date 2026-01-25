"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Monitor {
  id: number
  friendly_name: string
  url: string
  type: number
  sub_type: string
  keyword_type: number
  keyword_value: string
  http_username: string
  port: string
  interval: number
  status: number
  create_datetime: number
}

export function SystemStatusWidget() {
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/uptimerobot", { method: "POST" })
        const data = await response.json()

        if (data.stat === "ok") {
          setMonitors(data.monitors)
        } else {
          setError("Falha ao carregar status do sistema")
        }
      } catch (err) {
        setError("Erro de conexão com serviço de monitoramento")
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    // Refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 2:
        return { label: "Operacional", color: "bg-green-500/10 text-green-500 hover:bg-green-500/20", icon: CheckCircle2 }
      case 8:
      case 9:
        return { label: "Indisponível", color: "bg-red-500/10 text-red-500 hover:bg-red-500/20", icon: XCircle }
      case 0:
        return { label: "Pausado", color: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20", icon: Clock }
      default:
        return { label: "Desconhecido", color: "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20", icon: AlertCircle }
    }
  }

  return (
    <Card className="col-span-1 border-slate-800 bg-slate-900/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-200">
          Status dos Serviços
        </CardTitle>
        <Activity className="h-4 w-4 text-orange-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-xs text-red-400 py-2">{error}</div>
        ) : (
          <div className="space-y-4 pt-2">
            {monitors.map((monitor) => {
              const statusInfo = getStatusInfo(monitor.status)
              const Icon = statusInfo.icon
              return (
                <div key={monitor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${statusInfo.color.split(" ")[0]}`}>
                      <Icon className={`h-3 w-3 ${statusInfo.color.split(" ")[1]}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-300 truncate max-w-[120px] sm:max-w-[150px]">
                      {monitor.friendly_name}
                    </span>
                  </div>
                  <Badge variant="outline" className={`${statusInfo.color} border-0 text-[10px] h-5`}>
                    {statusInfo.label}
                  </Badge>
                </div>
              )
            })}
            {monitors.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-2">
                Nenhum monitor configurado
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
