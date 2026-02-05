"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Settings, 
  BarChart3, 
  FolderOpen,
  ChevronRight,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DemoSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "companies", label: "Empresas", icon: Building2 },
  { id: "demands", label: "Demandas", icon: FileText },
  { id: "esocial", label: "eSocial", icon: Shield },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "documents", label: "Documentos", icon: FolderOpen },
  { id: "settings", label: "Configurações", icon: Settings },
]

export function DemoSidebar({ activeTab, setActiveTab }: DemoSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div 
      className={cn(
        "h-screen sticky top-0 bg-white border-r border-slate-200 shadow-sm z-40 flex flex-col transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-20"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      initial={false}
    >
      <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
              )} />
              
              <motion.span
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  display: isExpanded ? "block" : "none"
                }}
                transition={{ duration: 0.2 }}
                className="font-medium whitespace-nowrap text-sm"
              >
                {item.label}
              </motion.span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button className={cn(
          "flex items-center gap-3 w-full px-2 py-2 rounded-lg text-slate-400 hover:text-slate-600 transition-colors",
          !isExpanded && "justify-center"
        )}>
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
             <ChevronRight className={cn(
               "w-4 h-4 transition-transform duration-300",
               isExpanded ? "rotate-180" : "rotate-0"
             )} />
           </div>
           {isExpanded && <span className="text-xs font-medium">Recolher Menu</span>}
        </button>
      </div>
    </motion.div>
  )
}
