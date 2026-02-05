"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { ModeToggle } from "@/components/theme-toggle"
import { BrandLogo } from "@/components/brand-logo"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast.success("Login realizado com sucesso!")
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Falha na autenticação. Verifique suas credenciais.")
      toast.error("Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* Left Panel - Visual & Branding */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-slate-50 border-r border-border text-foreground">
        
        {/* Logo Area */}
        <div className="relative z-10">
          <BrandLogo variant="original" width={180} height={50} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
            Gestão Corporativa de SST
          </h1>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            Plataforma integrada para gestão de Saúde e Segurança do Trabalho, em conformidade com o eSocial e normas regulamentadoras.
          </p>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 text-xs text-muted-foreground">
          <p>© 2024 Mastprod Tecnologia. Uso restrito.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 bg-white relative">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="absolute top-6 left-6 lg:hidden">
          <BrandLogo variant="original" width={140} height={40} />
        </div>

        <div className="w-full max-w-[360px] space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Acesso ao Sistema</h2>
            <p className="text-sm text-muted-foreground">
              Insira suas credenciais corporativas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium text-sm">Senha</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-10"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Entrar
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            Acesso restrito a colaboradores autorizados.
          </div>
        </div>
      </div>
    </div>
  )
}
