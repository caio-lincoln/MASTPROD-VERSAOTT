"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Sidebar } from "@/components/sidebar"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          router.push("/login")
          return
        }

        setUser({
          name: session.user.user_metadata?.name || "Usuário",
          email: session.user.email || "",
        })
      } catch (error) {
        console.error("Error checking session:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login")
      } else {
        setUser({
          name: session.user.user_metadata?.name || "Usuário",
          email: session.user.email || "",
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        Carregando...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background pointer-events-none z-0" />
      
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 flex h-full w-full">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between z-20">
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">Sistema SST</h1>
              <p className="text-sm text-muted-foreground">Gestão de Saúde e Segurança do Trabalho</p>
            </div>

            <div className="flex items-center gap-4">
              <ModeToggle />
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted border border-border hover:bg-muted/80 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-transparent p-6 relative">
             {children}
          </main>
        </div>
      </div>
    </div>
  )
}
