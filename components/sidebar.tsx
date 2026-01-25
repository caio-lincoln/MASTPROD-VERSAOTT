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
        "bg-sidebar/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 relative z-50 h-screen sticky top-0",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg tracking-tight">SST</h2>
              <p className="text-xs text-muted-foreground font-medium tracking-wide">ENTERPRISE</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-primary/10 to-transparent text-primary font-medium"
                  : "text-muted-foreground hover:text-white hover:bg-white/5",
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              )}
              
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                isActive ? "text-primary drop-shadow-sm" : "text-muted-foreground group-hover:text-white"
              )} />
              
              {!collapsed && (
                <span className="text-sm tracking-wide truncate animate-in fade-in duration-200">
                  {item.label}
                </span>
              )}
              
              {isActive && !collapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>
      
      {!collapsed && (
        <div className="p-6 mt-auto">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 border border-white/5">
            <h4 className="text-sm font-semibold text-white mb-1">Precisa de ajuda?</h4>
            <p className="text-xs text-muted-foreground mb-3">Consulte a documentação oficial ou fale com o suporte.</p>
            <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              Abrir Central de Ajuda &rarr;
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
