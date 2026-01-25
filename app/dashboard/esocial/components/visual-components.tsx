import React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, ArrowUpRight, TrendingUp, MoreHorizontal } from "lucide-react"

// --- KPI Card Component ---
interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  description?: string
  className?: string
}

export function KpiCard({ title, value, icon: Icon, trend, trendUp = true, description, className }: KpiCardProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-6 relative overflow-hidden group", className)}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <Icon className="w-24 h-24 -mr-8 -mt-8 text-primary rotate-12" />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border", 
              trendUp ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
              {trend}
            </div>
          )}
        </div>
        
        <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground/60 mt-2">{description}</p>}
      </div>
      
      {/* Decorative Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}

// --- Dashboard Header Component ---
interface DashboardHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-lg">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  )
}

// --- Section Header Component ---
interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// --- Status Badge Component ---
interface StatusBadgeProps {
  status: string
  type?: "default" | "success" | "warning" | "error" | "info"
}

export function StatusBadge({ status, type = "default" }: StatusBadgeProps) {
  const styles = {
    default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    success: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }

  // Auto-detect type if not provided based on common status keywords
  let finalType = type
  if (type === "default") {
    const s = status.toLowerCase()
    if (s.includes("sucesso") || s.includes("ativo") || s.includes("ativa") || s.includes("enviado") || s.includes("concluído")) finalType = "success"
    else if (s.includes("pendente") || s.includes("alerta") || s.includes("aguardando")) finalType = "warning"
    else if (s.includes("erro") || s.includes("falha") || s.includes("inativo") || s.includes("inativa") || s.includes("cancelado") || s.includes("cancelada")) finalType = "error"
    else if (s.includes("processando") || s.includes("novo")) finalType = "info"
  }

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit", styles[finalType])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", 
        finalType === "success" ? "bg-orange-400" :
        finalType === "warning" ? "bg-amber-400" :
        finalType === "error" ? "bg-red-400" :
        finalType === "info" ? "bg-blue-400" : "bg-slate-400"
      )} />
      {status}
    </span>
  )
}

// --- Chart/Content Container ---
interface ContentContainerProps {
  children: React.ReactNode
  className?: string
  title?: string
  action?: React.ReactNode
}

export function ContentContainer({ children, className, title, action }: ContentContainerProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h3 className="font-semibold text-white text-lg">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
