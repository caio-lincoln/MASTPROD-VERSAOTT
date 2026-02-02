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
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-border h-14 px-6 flex items-center justify-between z-20">
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">SST System</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-foreground">{user.name}</p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md w-8 h-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-50 p-6 relative">
             {children}
          </main>
        </div>
      </div>
    </div>
  )
}
