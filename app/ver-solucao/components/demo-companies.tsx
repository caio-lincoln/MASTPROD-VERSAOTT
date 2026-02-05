"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Building2, MapPin, Users, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const companies = [
  { name: "Metalúrgica Steel Corp", cnpj: "12.345.678/0001-90", employees: 145, risk: "Grau 4", status: "Regular" },
  { name: "Construtora Horizonte", cnpj: "98.765.432/0001-10", employees: 320, risk: "Grau 3", status: "Atenção" },
  { name: "Transportadora Veloz", cnpj: "45.678.901/0001-23", employees: 85, risk: "Grau 2", status: "Regular" },
  { name: "Supermercados Estrela", cnpj: "10.203.040/0001-55", employees: 210, risk: "Grau 1", status: "Regular" },
]

export function DemoCompanies() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Empresas</h2>
          <p className="text-slate-500">Gestão de clientes e estabelecimentos.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">Adicionar Empresa</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companies.map((company, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{company.name}</h3>
                    <p className="text-xs text-slate-500">{company.cnpj}</p>
                  </div>
                </div>
                <Badge variant={company.status === "Atenção" ? "destructive" : "secondary"} className={company.status === "Regular" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}>
                  {company.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  {company.employees} Funcionários
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  Risco {company.risk}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
