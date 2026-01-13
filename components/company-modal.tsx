"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Phone, MapPin, Search, Loader2, Calendar, Check, ChevronsUpDown } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const legalNatureOptions = [
  {
    heading: "Administração Pública",
    items: [
      { value: "1015", label: "1015 - Órgão Público do Poder Executivo Federal" },
      { value: "1023", label: "1023 - Órgão Público do Poder Executivo Estadual" },
      { value: "1031", label: "1031 - Órgão Público do Poder Executivo Municipal" },
      { value: "1040", label: "1040 - Órgão Público do Poder Legislativo Federal" },
      { value: "1058", label: "1058 - Órgão Público do Poder Legislativo Estadual" },
      { value: "1228", label: "1228 - Órgão Público do Poder Legislativo Municipal" },
      { value: "1074", label: "1074 - Órgão Público do Poder Judiciário Federal" },
      { value: "1082", label: "1082 - Órgão Público do Poder Judiciário Estadual" },
      { value: "1104", label: "1104 - Autarquia Federal" },
      { value: "1112", label: "1112 - Autarquia Estadual" },
      { value: "1120", label: "1120 - Autarquia Municipal" },
      { value: "1139", label: "1139 - Fundação Pública de Direito Público" },
      { value: "1147", label: "1147 - Fundação Pública de Direito Privado" },
      { value: "1155", label: "1155 - Fundo Público" },
      { value: "1163", label: "1163 - Órgão Público Autônomo" },
    ]
  },
  {
    heading: "Empresas Privadas / Sociedades",
    items: [
      { value: "2011", label: "2011 - Empresa Pública" },
      { value: "2038", label: "2038 - Sociedade de Economia Mista" },
      { value: "2046", label: "2046 - Sociedade Anônima Fechada" },
      { value: "2054", label: "2054 - Sociedade Anônima Aberta" },
      { value: "2062", label: "2062 - Sociedade Empresária Limitada" },
      { value: "2070", label: "2070 - Sociedade Empresária em Nome Coletivo" },
      { value: "2089", label: "2089 - Sociedade Empresária em Comandita Simples" },
      { value: "2097", label: "2097 - Sociedade Empresária em Comandita por Ações" },
      { value: "2127", label: "2127 - Sociedade em Conta de Participação" },
      { value: "2135", label: "2135 - Empresário Individual" },
    ]
  },
  {
    heading: "Entidades sem Fins Lucrativos",
    items: [
      { value: "3034", label: "3034 - Serviço Social Autônomo" },
      { value: "3069", label: "3069 - Fundação Privada" },
      { value: "3077", label: "3077 - Organização Religiosa" },
      { value: "3085", label: "3085 - Organização Social" },
      { value: "3999", label: "3999 - Associação Privada" },
    ]
  },
  {
    heading: "Pessoa Física / Produtor Rural",
    items: [
      { value: "4014", label: "4014 - Produtor Rural Pessoa Física" },
      { value: "4022", label: "4022 - Segurado Especial" },
      { value: "4081", label: "4081 - Contribuinte Individual" },
    ]
  }
]

const taxClassificationOptions = [
  { value: "01", label: "01 - Administração Pública" },
  { value: "02", label: "02 - Empresa do Simples Nacional" },
  { value: "03", label: "03 - Empresa do Lucro Presumido" },
  { value: "04", label: "04 - Empresa do Lucro Real" },
  { value: "05", label: "05 - Empresa Imune ou Isenta" },
  { value: "06", label: "06 - Empregador Doméstico" },
  { value: "07", label: "07 - Segurado Especial" },
  { value: "08", label: "08 - Entidade sem fins lucrativos" },
  { value: "09", label: "09 - Pessoa Física (exceto empregador doméstico)" },
  { value: "10", label: "10 - Microempreendedor Individual (MEI)" },
  { value: "11", label: "11 - Cooperativa" },
  { value: "12", label: "12 - Consórcio" },
  { value: "13", label: "13 - Missão Diplomática / Repartição Consular" },
  { value: "14", label: "14 - Empresa estrangeira" },
  { value: "21", label: "21 - Produtor Rural Pessoa Física" },
  { value: "22", label: "22 - Produtor Rural Pessoa Jurídica" },
  { value: "99", label: "99 - Outros (uso excepcional, com validação manual)" },
]

interface CompanyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  initialData?: any
  mode: "create" | "edit"
  isLoading?: boolean
}

export function CompanyModal({ open, onOpenChange, onSubmit, initialData, mode, isLoading }: CompanyModalProps) {
  const [loadingCnpj, setLoadingCnpj] = useState(false)
  const [openLegalNature, setOpenLegalNature] = useState(false)
  const [openTaxClassification, setOpenTaxClassification] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    cnae: "",
    activityDescription: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    responsible: "",
    employees: 0,
    taxClassification: "",
    legalNature: "",
    validityStartDate: ""
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        cnpj: initialData.cnpj || "",
        cnae: initialData.cnae || "",
        activityDescription: initialData.activityDescription || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        responsible: initialData.responsible || "",
        employees: initialData.employees || 0,
        taxClassification: initialData.taxClassification || "",
        legalNature: initialData.legalNature || "",
        validityStartDate: initialData.validityStartDate || ""
      })
    } else {
      setFormData({
        name: "",
        cnpj: "",
        cnae: "",
        activityDescription: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        responsible: "",
        employees: 0,
        taxClassification: "",
        legalNature: "",
        validityStartDate: ""
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})/, "$1-$2")
    }
    return value
  }

  const handleSearchCNPJ = async () => {
    const cleanCNPJ = formData.cnpj.replace(/\D/g, "")
    if (cleanCNPJ.length !== 14) {
      alert("CNPJ inválido. Digite apenas números.")
      return
    }

    setLoadingCnpj(true)
    try {
      let data: any = null
      let source = ""

      // Tentativa 1: BrasilAPI
      try {
        console.log("Tentando BrasilAPI...")
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`)
        if (response.ok) {
          data = await response.json()
          source = "brasilapi"
        } else {
          console.warn(`BrasilAPI retornou status: ${response.status}`)
        }
      } catch (err) {
        console.warn("BrasilAPI falhou:", err)
      }

      // Tentativa 2: CNPJ.ws (Fallback robusto)
      if (!data) {
        try {
          console.log("Tentando CNPJ.ws...")
          const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCNPJ}`)
          if (response.ok) {
            data = await response.json()
            source = "cnpjws"
          } else {
             // 429 = Too Many Requests (limite de 3 por minuto na versão free)
            console.warn(`CNPJ.ws retornou status: ${response.status}`)
          }
        } catch (err) {
          console.warn("CNPJ.ws falhou:", err)
        }
      }

      // Tentativa 3: Minha Receita (Último recurso)
      if (!data) {
        try {
          console.log("Tentando Minha Receita...")
          const response = await fetch(`https://minhareceita.org/${cleanCNPJ}`)
          if (response.ok) {
            data = await response.json()
            source = "minhareceita"
          } else {
            console.warn(`Minha Receita retornou status: ${response.status}`)
          }
        } catch (err) {
          console.warn("Minha Receita falhou:", err)
        }
      }

      // Se nenhum funcionou
      if (!data) {
        throw new Error("CNPJ não encontrado ou erro de conexão com as APIs públicas (BrasilAPI, CNPJ.ws, Minha Receita). Verifique o número digitado.")
      }
      
      console.log(`Dados obtidos via ${source}:`, data)

      // Normalização dos dados baseada na fonte
      let normalizedData = {
        name: "",
        cnae: "",
        activityDescription: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        responsible: "",
        legalNature: "",
        isSimples: false
      }

      if (source === "brasilapi") {
        normalizedData = {
          name: data.razao_social || data.nome_fantasia || "",
          cnae: data.cnae_fiscal ? `${data.cnae_fiscal}` : "",
          activityDescription: data.cnae_fiscal_descricao || "",
          address: `${data.logradouro}, ${data.numero}${data.complemento ? ` - ${data.complemento}` : ""} - ${data.bairro} - ${data.cep}`,
          city: data.municipio || "",
          state: data.uf || "",
          phone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1}) ${data.telefone_1 || data.telefone1 || ""}` : "",
          email: data.email || "",
          responsible: data.qsa && data.qsa.length > 0 ? data.qsa[0].nome : "",
          legalNature: data.natureza_juridica ? data.natureza_juridica.replace(/\D/g, "").slice(0, 4) : "",
          isSimples: data.opcao_pelo_simples || false
        }
      } else if (source === "cnpjws") {
        normalizedData = {
          name: data.razao_social || data.estabelecimento.nome_fantasia || "",
          cnae: data.estabelecimento.atividade_principal ? `${data.estabelecimento.atividade_principal.id}` : "",
          activityDescription: data.estabelecimento.atividade_principal?.descricao || "",
          address: `${data.estabelecimento.tipo_logradouro} ${data.estabelecimento.logradouro}, ${data.estabelecimento.numero}${data.estabelecimento.complemento ? ` - ${data.estabelecimento.complemento}` : ""} - ${data.estabelecimento.bairro} - ${data.estabelecimento.cep}`,
          city: data.estabelecimento.cidade.nome || "",
          state: data.estabelecimento.estado.sigla || "",
          phone: data.estabelecimento.ddd1 ? `(${data.estabelecimento.ddd1}) ${data.estabelecimento.telefone1}` : "",
          email: data.estabelecimento.email || "",
          responsible: data.socios && data.socios.length > 0 ? data.socios[0].nome : "",
          legalNature: data.natureza_juridica ? data.natureza_juridica.id.replace(/\D/g, "").slice(0, 4) : "",
          isSimples: data.simples?.optante || false
        }
      } else if (source === "minhareceita") {
        normalizedData = {
          name: data.razao_social || data.nome_fantasia || "",
          cnae: data.cnae_fiscal ? `${data.cnae_fiscal}` : "",
          activityDescription: data.cnae_fiscal_descricao || "",
          address: `${data.logradouro}, ${data.numero}${data.complemento ? ` - ${data.complemento}` : ""} - ${data.bairro} - ${data.cep}`,
          city: data.municipio || "",
          state: data.uf || "",
          phone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1}) ${data.telefone1 || ""}` : "",
          email: data.email || "",
          responsible: data.qsa && data.qsa.length > 0 ? data.qsa[0].nome : "",
          legalNature: data.natureza_juridica ? data.natureza_juridica.replace(/\D/g, "").slice(0, 4) : "",
          isSimples: data.opcao_pelo_simples || false
        }
      }

      // Inferência da Classificação Tributária baseada na Natureza Jurídica e Simples Nacional
      // Lógica baseada na Tabela 08 do eSocial
      let suggestedTaxClassification = "99" // Padrão: Pessoas Jurídicas em Geral

      // Normaliza o código da natureza jurídica para garantir apenas números (4 dígitos)
      const legalNatureCode = normalizedData.legalNature.replace(/\D/g, "").slice(0, 4)
      normalizedData.legalNature = legalNatureCode // Atualiza com o código limpo

      setFormData(prev => ({
        ...prev,
        name: normalizedData.name || prev.name,
        cnae: normalizedData.cnae || prev.cnae,
        activityDescription: normalizedData.activityDescription || prev.activityDescription,
        address: normalizedData.address || prev.address,
        city: normalizedData.city || prev.city,
        state: normalizedData.state || prev.state,
        phone: normalizedData.phone || prev.phone,
        email: normalizedData.email || prev.email,
        responsible: normalizedData.responsible || prev.responsible,
        legalNature: normalizedData.legalNature || prev.legalNature,
        taxClassification: suggestedTaxClassification || prev.taxClassification
      }))

    } catch (error: any) {
      console.error("Erro detalhado ao buscar CNPJ:", error)
      alert(error.message || "Erro ao buscar dados do CNPJ.")
    } finally {
      setLoadingCnpj(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nova Empresa" : "Editar Empresa"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {mode === "create" ? "Preencha os dados da nova empresa" : "Atualize as informações da empresa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Informações Básicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Razão Social *</Label>
                <Input
                  id="name"
                  placeholder="Nome da empresa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <div className="flex gap-2">
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                    className="bg-slate-800 border-slate-700 text-white flex-1"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="border-slate-700 bg-slate-800 hover:bg-slate-700"
                    onClick={handleSearchCNPJ}
                    disabled={loadingCnpj}
                  >
                    {loadingCnpj ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnae">CNAE *</Label>
                <Input
                  id="cnae"
                  placeholder="0000-0/00"
                  value={formData.cnae}
                  onChange={(e) => setFormData({ ...formData, cnae: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="legalNature">Natureza Jurídica</Label>
                <Popover open={openLegalNature} onOpenChange={setOpenLegalNature}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openLegalNature}
                      className="w-full justify-between bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                    >
                      {formData.legalNature
                        ? formData.legalNature
                        : "Selecione a natureza jurídica..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[400px] p-0 bg-slate-900 border-slate-700" 
                    side="bottom" 
                    align="start"
                    sideOffset={4}
                    avoidCollisions={false}
                  >
                    <Command className="bg-slate-900 text-white" filter={(value, search) => {
                      if (value.toLowerCase().includes(search.toLowerCase())) return 1
                      return 0
                    }}>
                      <CommandInput placeholder="Buscar por código ou descrição..." className="text-white" />
                      <CommandList className="max-h-[300px] overflow-y-auto pointer-events-auto">
                        <CommandEmpty>Nenhuma natureza jurídica encontrada.</CommandEmpty>
                        {legalNatureOptions.map((group) => (
                          <CommandGroup key={group.heading} heading={group.heading} className="text-slate-400">
                            {group.items.map((item) => (
                              <CommandItem
                                key={item.value}
                                value={item.label}
                                onSelect={() => {
                                  setFormData({ ...formData, legalNature: item.value })
                                  setOpenLegalNature(false)
                                }}
                                className="text-white data-[selected=true]:bg-slate-800"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.legalNature === item.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {item.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="taxClassification">Classificação Tributária</Label>
                <Popover open={openTaxClassification} onOpenChange={setOpenTaxClassification}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTaxClassification}
                      className="w-full justify-between bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                    >
                      {formData.taxClassification
                        ? formData.taxClassification
                        : "Selecione a classificação tributária..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[400px] p-0 bg-slate-900 border-slate-700" 
                    side="bottom" 
                    align="start"
                    sideOffset={4}
                    avoidCollisions={false}
                  >
                    <Command className="bg-slate-900 text-white" filter={(value, search) => {
                      if (value.toLowerCase().includes(search.toLowerCase())) return 1
                      return 0
                    }}>
                      <CommandInput placeholder="Buscar por código ou descrição..." className="text-white" />
                      <CommandList className="max-h-[300px] overflow-y-auto pointer-events-auto">
                        <CommandEmpty>Nenhuma classificação tributária encontrada.</CommandEmpty>
                        <CommandGroup className="text-slate-400">
                          {taxClassificationOptions.map((item) => (
                            <CommandItem
                              key={item.value}
                              value={item.label}
                              onSelect={() => {
                                setFormData({ ...formData, taxClassification: item.value })
                                setOpenTaxClassification(false)
                              }}
                              className="text-white data-[selected=true]:bg-slate-800"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.taxClassification === item.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validityStartDate">Início de Validade</Label>
                <div className="relative">
                  <Input
                    id="validityStartDate"
                    type="month"
                    value={formData.validityStartDate}
                    onChange={(e) => setFormData({ ...formData, validityStartDate: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white pl-10"
                    required
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employees">Número de Funcionários</Label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="0"
                  value={formData.employees || ""}
                  onChange={(e) => setFormData({ ...formData, employees: Number.parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityDescription">Descrição da Atividade *</Label>
              <Textarea
                id="activityDescription"
                placeholder="Descreva a atividade principal da empresa"
                value={formData.activityDescription}
                onChange={(e) => setFormData({ ...formData, activityDescription: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
                required
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Endereço
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo *</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, complemento"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    placeholder="UF"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 0000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Input
                  id="responsible"
                  placeholder="Nome do responsável"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                mode === "create" ? "Criar Empresa" : "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
