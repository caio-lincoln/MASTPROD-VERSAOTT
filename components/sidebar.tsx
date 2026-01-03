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
} from "lucide-react"
import { useState } from "react"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Shield },
  { href: "/dashboard/trainings", label: "Treinamentos", icon: GraduationCap },
  { href: "/dashboard/employees", label: "Funcionários", icon: Users },
  { href: "/dashboard/ppe", label: "EPIs", icon: HardHat },
  { href: "/dashboard/companies", label: "Empresas", icon: Building2 },
  { href: "/dashboard/library", label: "Biblioteca", icon: BookOpen },
  { href: "/dashboard/risks", label: "Riscos", icon: AlertTriangle },
  { href: "/dashboard/esocial", label: "e-Social", icon: FileText },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">SST</h2>
              <p className="text-xs text-slate-400">Sistema de Gestão</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
