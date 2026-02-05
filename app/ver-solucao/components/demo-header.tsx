"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Bell, 
  Search, 
  Users, 
  Settings, 
  LogOut,
  Check,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DemoHeader() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nova demanda criada", desc: "Empresa Alpha solicitou PGR", time: "Há 10 min", read: false },
    { id: 2, title: "Evento S-1000 processado", desc: "Envio realizado com sucesso", time: "Há 1 hora", read: false },
    { id: 3, title: "Prazo próximo", desc: "LTCAT vence em 2 dias", time: "Há 3 horas", read: false },
    { id: 4, title: "Documento assinado", desc: "Eng. Ronaldo assinou Laudo", time: "Ontem", read: true },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm h-16">
      <div className="container-fluid px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="relative h-8 w-32">
              <Image 
                src="/logo/LogoOriginal.png" 
                alt="MASTPROD" 
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ambiente Demonstrativo</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 mr-4">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <Search className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500 relative hover:text-slate-700 hover:bg-slate-100">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notificações</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-600 hover:bg-red-200">
                      {unreadCount} novas
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      Nenhuma notificação
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50">
                          <div className="flex items-center justify-between w-full">
                            <span className={`font-medium text-sm ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>
                              {notif.title}
                            </span>
                            {!notif.read && <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>}
                          </div>
                          <p className="text-xs text-slate-500">{notif.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-1">{notif.time}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <div className="p-2 flex items-center justify-between bg-slate-50">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-slate-500 hover:text-primary h-8"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Marcar lidas
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-slate-500 hover:text-red-600 h-8"
                    onClick={clearNotifications}
                    disabled={notifications.length === 0}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Eng. Visitante</p>
              <p className="text-xs text-slate-500">Engenheiro de Segurança</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-primary/20 transition-all">
                  <Users className="w-6 h-6 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuItem>Suporte</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
