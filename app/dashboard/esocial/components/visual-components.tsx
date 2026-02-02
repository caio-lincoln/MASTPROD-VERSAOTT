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
    <div className={cn("bg-white border border-border rounded-lg p-6 relative overflow-hidden", className)}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border", 
              trendUp ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
            )}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
              {trend}
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-foreground tracking-tight mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground/60 mt-2">{description}</p>}
      </div>
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
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
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
        <h2 className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
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
    default: "bg-slate-100 text-slate-600 border-slate-200",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-info/10 text-info border-info/20",
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
        finalType === "success" ? "bg-success" :
        finalType === "warning" ? "bg-warning" :
        finalType === "error" ? "bg-destructive" :
        finalType === "info" ? "bg-info" : "bg-muted-foreground"
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
    <div className={cn("bg-white border border-border rounded-lg p-5", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold text-foreground text-base">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
