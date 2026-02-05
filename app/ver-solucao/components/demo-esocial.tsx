"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { RefreshCw, Download, CheckCircle2, XCircle, Clock } from "lucide-react"

const events = [
  { id: "ID1029384756", event: "S-1000", desc: "Informações do Empregador", company: "Metalúrgica Steel Corp", status: "success", receipt: "1.2.0000000001", date: "05/02/2026 10:30" },
  { id: "ID1029384757", event: "S-1005", desc: "Tabela de Estabelecimentos", company: "Metalúrgica Steel Corp", status: "success", receipt: "1.2.0000000002", date: "05/02/2026 10:31" },
  { id: "ID1029384758", event: "S-2210", desc: "CAT - Acidente de Trabalho", company: "Construtora Horizonte", status: "error", receipt: "-", date: "05/02/2026 11:15" },
  { id: "ID1029384759", event: "S-2220", desc: "Monitoramento Saúde (ASO)", company: "Transportadora Veloz", status: "pending", receipt: "-", date: "05/02/2026 11:45" },
  { id: "ID1029384760", event: "S-2240", desc: "Condições Ambientais", company: "Supermercados Estrela", status: "success", receipt: "1.2.0000000003", date: "04/02/2026 16:20" },
]

export function DemoESocial() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">eSocial</h2>
          <p className="text-slate-500">Monitoramento de eventos enviados e status de processamento.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline">
             <RefreshCw className="w-4 h-4 mr-2" />
             Atualizar Status
           </Button>
           <Button className="bg-primary hover:bg-primary/90 text-white">
             Transmitir Lote
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Sucesso (Últimos 30 dias)</p>
              <h3 className="text-2xl font-bold text-slate-900">1.248</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Processando</p>
              <h3 className="text-2xl font-bold text-slate-900">12</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Erros de Validação</p>
              <h3 className="text-2xl font-bold text-slate-900">3</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de Envios</CardTitle>
          <CardDescription>Eventos transmitidos recentemente para o ambiente nacional.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recibo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell className="font-bold text-slate-700">{evt.event}</TableCell>
                  <TableCell>{evt.desc}</TableCell>
                  <TableCell>{evt.company}</TableCell>
                  <TableCell className="text-slate-500">{evt.date}</TableCell>
                  <TableCell>
                    {evt.status === 'success' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Sucesso</Badge>}
                    {evt.status === 'pending' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Processando</Badge>}
                    {evt.status === 'error' && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Erro</Badge>}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{evt.receipt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
