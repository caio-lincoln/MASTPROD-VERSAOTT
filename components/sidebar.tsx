"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Shield,
  GraduationCap,
  Users,
  HardHat,
  Building2,
  BookOpen,
  AlertTriangle,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react"
import { useState } from "react"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/dashboard/esocial", label: "eSocial Pro", icon: FileText },
  { href: "/dashboard/companies", label: "Empresas", icon: Building2 },
  { href: "/dashboard/employees", label: "Funcionários", icon: Users },
  { href: "/dashboard/risks", label: "Gestão de Riscos", icon: AlertTriangle },
  { href: "/dashboard/ppe", label: "Controle de EPIs", icon: HardHat },
  { href: "/dashboard/trainings", label: "Treinamentos", icon: GraduationCap },
  { href: "/dashboard/library", label: "Biblioteca", icon: BookOpen },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "bg-white border-r border-border flex flex-col transition-all duration-300 relative z-50 h-screen sticky top-0",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border/40 h-16">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm tracking-tight">SST System</h2>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative",
                isActive
                  ? "bg-slate-100 text-primary font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0 transition-colors duration-200",
                isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-700"
              )} />
              
              {!collapsed && (
                <span className="text-sm truncate animate-in fade-in duration-200">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      
      {!collapsed && (
        <div className="p-4 mt-auto border-t border-border">
          <div className="bg-slate-50 rounded-lg p-4 border border-border/50">
            <h4 className="text-xs font-semibold text-foreground mb-1">Suporte Técnico</h4>
            <p className="text-[10px] text-muted-foreground mb-2">Dúvidas? Consulte o manual.</p>
            <button className="text-[10px] font-medium text-primary hover:underline">
              Acessar Ajuda
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
