"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus } from "lucide-react"

const demands = [
  { id: "D-1023", company: "Metalúrgica Steel Corp", type: "PGR", status: "Em Análise", priority: "Alta", deadline: "2 dias", progress: 35 },
  { id: "D-1022", company: "Construtora Horizonte", type: "Treinamento NR-35", status: "Agendado", priority: "Média", deadline: "5 dias", progress: 0 },
  { id: "D-1021", company: "Transportadora Veloz", type: "LTCAT", status: "Em Execução", priority: "Média", deadline: "1 semana", progress: 60 },
  { id: "D-1020", company: "Metalúrgica Steel Corp", type: "Laudo Elétrico", status: "Concluído", priority: "Alta", deadline: "Ontem", progress: 100 },
  { id: "D-1019", company: "Supermercados Estrela", type: "PCMSO", status: "Em Execução", priority: "Baixa", deadline: "2 semanas", progress: 45 },
  { id: "D-1018", company: "Metalúrgica Steel Corp", type: "Insalubridade", status: "Concluído", priority: "Alta", deadline: "Há 1 mês", progress: 100 },
  { id: "D-1017", company: "Transportadora Veloz", type: "ASO", status: "Concluído", priority: "Baixa", deadline: "Há 1 mês", progress: 100 },
]

export function DemoDemands() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Demandas</h2>
          <p className="text-slate-500">Gerencie todas as solicitações técnicas.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Demanda
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Painel de Controle</CardTitle>
              <CardDescription>Acompanhe o status das solicitações em tempo real.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Filtrar</Button>
              <Button variant="outline" size="sm">Exportar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 w-[100px]">ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0">Empresa</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0">Demanda</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0">Prioridade</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0">Ações</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {demands.map((demand) => (
                  <tr key={demand.id} className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50">
                    <td className="p-4 align-middle font-medium text-slate-600">{demand.id}</td>
                    <td className="p-4 align-middle font-medium text-slate-900">{demand.company}</td>
                    <td className="p-4 align-middle">{demand.type}</td>
                    <td className="p-4 align-middle">
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${demand.status === 'Em Análise' ? 'bg-amber-100 text-amber-700' : ''}
                          ${demand.status === 'Agendado' ? 'bg-blue-100 text-blue-700' : ''}
                          ${demand.status === 'Em Execução' ? 'bg-purple-100 text-purple-700' : ''}
                          ${demand.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' : ''}
                          border-none
                        `}
                      >
                        {demand.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full 
                          ${demand.priority === 'Alta' ? 'bg-red-500' : ''}
                          ${demand.priority === 'Média' ? 'bg-amber-500' : ''}
                          ${demand.priority === 'Baixa' ? 'bg-blue-500' : ''}
                        `}></span>
                        {demand.priority}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
