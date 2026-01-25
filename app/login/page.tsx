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
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-muted text-foreground">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted/50 to-background pointer-events-none" />

        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Mastprod SST</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg space-y-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight lg:text-5xl text-foreground">
            Gestão inteligente de <span className="text-primary">Saúde e Segurança</span> do Trabalho
          </h1>
          
          <div className="space-y-4">
            {[
              "Conformidade total com o eSocial",
              "Gestão de EPIs, Treinamentos e Riscos",
              "Emissão de certificados digitais",
              "Relatórios e Dashboards em tempo real"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 text-sm text-muted-foreground">
          <p>© 2024 Mastprod Tecnologia. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 bg-background relative">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        {/* Mobile Header (Visible only on small screens) */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Mastprod SST</span>
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">Email corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50 border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-muted-foreground">Senha</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/50 border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-11"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Acessar plataforma
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Ainda não tem acesso?{" "}
            <Link href="/support" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Entre em contato com o suporte
            </Link>
          </div>
          
          <div className="text-center">
             <Link href="/support" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
               <Shield className="h-3 w-3" />
               Central de Ajuda e Documentação
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
