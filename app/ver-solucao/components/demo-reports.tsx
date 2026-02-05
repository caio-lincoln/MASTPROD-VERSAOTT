"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DemoReports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Relatórios</h2>
          <p className="text-slate-500">Indicadores de desempenho e conformidade.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução de Conformidade
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-lg m-6 border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Gráfico de Evolução (Mock)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Distribuição de Riscos
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-lg m-6 border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Gráfico de Pizza (Mock)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Exames Vencidos", value: "3", color: "text-red-600" },
          { title: "Treinamentos Realizados", value: "45", color: "text-emerald-600" },
          { title: "Documentos Gerados", value: "128", color: "text-blue-600" },
        ].map((item, idx) => (
          <Card key={idx}>
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-slate-500 mb-2">{item.title}</h3>
              <p className={`text-4xl font-bold ${item.color}`}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
