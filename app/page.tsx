"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  HardHat, 
  FileText, 
  Activity, 
  Users, 
  CheckCircle2, 
  Menu, 
  X, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Linkedin,
  Factory,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/brand-logo"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  
  // Parallax effect for hero
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Header - Codepacce Style Refactor */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div 
          className={`
            w-full max-w-5xl rounded-full px-5 py-2 
            backdrop-blur-md border border-white/5 shadow-2xl 
            flex items-center justify-between transition-all duration-300
            ${isScrolled ? "bg-slate-900/90 shadow-slate-900/20" : "bg-slate-900/90"}
          `}
        >
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Image 
              src="/logo/LogoBrancaCurta.PNG" 
              alt="MASTPROD" 
              width={120} 
              height={32}
              className="h-7 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Desktop Menu - Centered */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {["Início", "Sobre", "Atuação", "Diferenciais"].map((item, index) => {
              const ids = ["hero", "sobre", "atuacao", "diferenciais"]
              return (
                <button 
                  key={item}
                  onClick={() => scrollToSection(ids[index])}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors tracking-wide"
                >
                  {item}
                </button>
              )
            })}
          </nav>

          {/* Right Side - CTA & Mobile Toggle */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/login" className="hidden md:block">
               <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                 Login
               </button>
            </Link>
            
            <Button 
              onClick={() => scrollToSection("contato")}
              className="bg-[#FD671A] hover:bg-[#E85C14] text-white rounded-full px-5 h-9 text-sm font-bold shadow-lg shadow-orange-900/20 hidden md:flex"
            >
              Contato <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay - Floating Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%+0.5rem)] left-4 right-4 max-w-6xl mx-auto bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-2 overflow-hidden z-50 backdrop-blur-md"
            >
              {["Início", "Sobre", "Atuação", "Diferenciais", "Contato"].map((item, index) => {
                 const ids = ["hero", "sobre", "atuacao", "diferenciais", "contato"]
                 return (
                  <button 
                    key={item}
                    onClick={() => scrollToSection(ids[index])}
                    className="text-left text-slate-300 hover:text-white hover:bg-white/5 font-medium py-3 px-4 rounded-xl transition-all"
                  >
                    {item}
                  </button>
                 )
              })}
              <div className="h-px bg-white/5 my-2"></div>
              <Link href="/login">
                <Button className="w-full bg-[#FD671A] hover:bg-[#E85C14] text-white rounded-xl h-12 font-bold">
                  Área do Cliente
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-900">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/logo/bg-banner-nano.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900 z-0"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Excelência em Engenharia de Segurança
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Segurança do Trabalho e Produção <span className="text-primary">caminhando juntas</span>.
            </h1>
            
            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Perícias técnicas, consultoria e soluções em SST para empresas que valorizam vidas, eficiência e responsabilidade operacional.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => scrollToSection("contato")}
                size="lg" 
                className="bg-primary hover:bg-[#E85C14] text-white rounded-full px-8 h-12 text-base shadow-lg shadow-black/20"
              >
                Falar com um especialista
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                onClick={() => scrollToSection("sobre")}
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-white hover:bg-white/10 hover:text-white hover:border-white rounded-full px-8 h-12 text-base bg-transparent"
              >
                Conheça a Mastprod
              </Button>
            </div>
          </motion.div>

          <motion.div 
            style={{ y: y1, opacity }}
            className="hidden md:flex justify-center relative"
          >
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-1">
              {/* Abstract Representation of Safety/Engineering */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="absolute inset-0 opacity-30 flex items-center justify-center">
                  <Shield className="w-64 h-64 text-primary/30" strokeWidth={0.5} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900 to-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary p-3 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Conformidade Legal</p>
                      <p className="text-slate-400 text-sm">Normas Regulamentadoras</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-3 rounded-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Saúde Ocupacional</p>
                      <p className="text-slate-400 text-sm">Prevenção e Gestão</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre a Mastprod */}
      <section id="sobre" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="relative"
            >
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/10 rounded-full z-0"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 relative z-10">
                Preservando a vida e a saúde dos trabalhadores sem abrir mão da <span className="text-primary">produtividade</span>.
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                <p>
                  A <strong>MASTPROD SST & PRODUÇÃO</strong> é uma empresa de engenharia e consultoria especializada, focada em entregar soluções técnicas robustas que integram segurança do trabalho e eficiência operacional.
                </p>
                <p>
                  Não atuamos apenas com "papelada". Nossa abordagem é estratégica e técnica, baseada em engenharia e normas vigentes, garantindo que sua empresa esteja não apenas em conformidade legal, mas operando de forma mais segura e eficiente.
                </p>
                <p>
                  Entendemos que a segurança não deve ser um entrave, mas sim um pilar de sustentação para o crescimento sustentável do seu negócio.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: Shield, label: "Segurança Jurídica", desc: "Proteção contra passivos trabalhistas" },
                { icon: Factory, label: "Eficiência", desc: "Processos otimizados e seguros" },
                { icon: Users, label: "Capital Humano", desc: "Valorização e proteção da vida" },
                { icon: CheckCircle2, label: "Compliance", desc: "Atendimento integral às NRs" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeIn}
                  className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">{item.label}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Áreas de Atuação */}
      <section id="atuacao" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">Nossas Soluções</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Atuação Técnica Especializada</h2>
            <p className="text-slate-600">Soluções completas em Engenharia de Segurança e Medicina do Trabalho.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: "/icons/pericias.png", 
                title: "Perícias Técnicas em SST", 
                desc: "Assistência técnica em perícias trabalhistas de insalubridade e periculosidade, com elaboração de quesitos e pareceres fundamentados." 
              },
              { 
                icon: "/icons/consultoria.png", 
                title: "Consultoria em Gestão", 
                desc: "Implementação de GRO (Gerenciamento de Riscos Ocupacionais) e PGR, focando na eliminação e controle de riscos na fonte." 
              },
              { 
                icon: "/icons/saude.png", 
                title: "Saúde Ocupacional", 
                desc: "Gestão completa do PCMSO, exames ocupacionais e controle absenteísmo, integrando saúde e produtividade." 
              },
              { 
                icon: "/icons/ltcat.png", 
                title: "LTCAT e Laudos", 
                desc: "Elaboração de laudos técnicos para aposentadoria especial (LTCAT) e laudos de insalubridade/periculosidade." 
              },
              { 
                icon: "/icons/prevencao.png", 
                title: "Prevenção de Acidentes", 
                desc: "Análise de acidentes, investigação de causas raízes e planos de ação para evitar recorrências e garantir ambientes seguros." 
              },
              { 
                icon: "/icons/treinamentos.png", 
                title: "Treinamentos", 
                desc: "Capacitação técnica e comportamental para trabalhadores e gestores, atendendo a todas as Normas Regulamentadoras." 
              }
            ].map((card, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                  <Image 
                    src={card.icon} 
                    alt={card.title} 
                    width={28} 
                    height={28}
                    className="w-7 h-7 object-contain opacity-70 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert transition-all duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/backgrounds/diferenciais-bg.jpg" 
            alt="Background Engenharia" 
            fill 
            className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-900/95 z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/20 skew-x-12 transform origin-top-right pointer-events-none z-0"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">Por que a Mastprod?</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Engenharia e Estratégia aplicada à Segurança</h2>
              <p className="text-slate-300 text-lg mb-8">
                Nosso diferencial está na capacidade de enxergar a segurança do trabalho como parte integrante do processo produtivo, e não como um departamento isolado.
              </p>
              
              <div className="space-y-6">
                {[
                  "Abordagem técnica baseada em engenharia robusta",
                  "Atuação preventiva e estratégica, não apenas corretiva",
                  "Foco absoluto na preservação da vida e integridade",
                  "Redução real de riscos e custos operacionais",
                  "Responsabilidade técnica e legal assumida com seriedade"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/20 p-1 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="text-4xl font-bold text-primary mb-2">+10</div>
                  <div className="text-sm text-slate-400">Anos de Experiência</div>
                </div>
                <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                  <div className="text-4xl font-bold text-emerald-500 mb-2">100%</div>
                  <div className="text-sm text-slate-400">Conformidade Legal</div>
                </div>
                <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700 col-span-2">
                  <div className="text-4xl font-bold text-white mb-2">Zero</div>
                  <div className="text-sm text-slate-400">Tolerância com Riscos Graves</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsável Técnico */}
      <section id="responsavel" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200 flex items-center justify-center">
                  <Users className="w-24 h-24 text-slate-400" />
                  {/* Placeholder for Photo */}
                </div>
              </div>
              <div className="w-full md:w-2/3 text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Eng. Ronaldo Bezerra</h3>
                <p className="text-primary font-medium mb-6 uppercase tracking-wide text-sm">CEO | Engenheiro Responsável</p>
                
                <blockquote className="text-xl text-slate-700 italic font-medium leading-relaxed mb-6">
                  "Nosso compromisso vai além de entregar documentos. É sobre garantir que cada trabalhador retorne para sua casa com saúde e integridade, enquanto a empresa prospera com segurança jurídica e operacional."
                </blockquote>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 font-medium shadow-sm">
                    Engenharia de Segurança
                  </span>
                  <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 font-medium shadow-sm">
                    Gestão de Riscos
                  </span>
                  <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 font-medium shadow-sm">
                    Perícias Técnicas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contato" className="py-24 bg-[#1C252C] text-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/backgrounds/cta-bg.jpg" 
            alt="Background Industrial" 
            fill 
            className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C252C]/95 via-[#1C252C]/70 to-[#1C252C]/95 z-0"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Sua empresa segura. Seus trabalhadores protegidos.</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Não espere um acidente acontecer. Fale agora com nossa equipe de engenharia e blinde sua operação.
          </p>
          
          <a 
            href="https://wa.me/5579999161630" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#FD671A] text-white hover:bg-[#E85C14] px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40 hover:-translate-y-1 transition-all duration-300 border border-white/5"
          >
            <Phone className="w-5 h-5" />
            Fale conosco pelo WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-white tracking-tight">MASTPROD</span>
              </div>
              <p className="mb-6 max-w-sm text-slate-500">
                Soluções em Engenharia de Segurança e Medicina do Trabalho com foco em conformidade legal e eficiência produtiva.
              </p>
              <div className="flex gap-4">
                <a href="https://instagram.com/mastprod_" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900 rounded-full hover:bg-primary hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-primary hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Links Rápidos</h4>
              <ul className="space-y-3">
                {["Início", "Sobre", "Atuação", "Diferenciais", "Contato"].map((item) => (
                  <li key={item}>
                    <button onClick={() => scrollToSection(item.toLowerCase() === "início" ? "hero" : item.toLowerCase())} className="hover:text-primary transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Área do Cliente
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Contato</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <span>Aracaju, Sergipe</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>(79) 99916-1630</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>contato@mastprod.com.br</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} MASTPROD SST & PRODUÇÃO LTDA. Todos os direitos reservados.</p>
            <p>CNPJ: 48.318.226/0001-61</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
