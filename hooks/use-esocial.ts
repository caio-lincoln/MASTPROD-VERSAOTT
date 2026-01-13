import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export interface ESocialEvent {
  id: string
  tipo_evento: string
  status: 'pendente' | 'enviado' | 'erro' | 'processando'
  created_at: string
  xml_envio?: string
  xml_retorno?: string
  protocolo?: string
  recibo?: string
  mensagem_erro?: string
  funcionario?: {
    nome: string
    cpf: string
  }
  empresa?: {
    razao_social: string
    cnpj: string
  }
}

export interface ESocialCompany {
  id: string
  razao_social: string
  cnpj: string
  esocial_status?: string
  esocial_protocolo?: string
  esocial_recibo?: string
  certificado_nome?: string
  certificado_validade?: string
  origem: string
  cidade?: string
  estado?: string
  total_funcionarios?: number
}

export function useESocialEvents(type?: string) {
  const [events, setEvents] = useState<ESocialEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('esocial_eventos')
        .select(`
          *,
          funcionario:funcionarios(nome, cpf),
          empresa:empresas(razao_social, cnpj)
        `)
        .order('created_at', { ascending: false })

      if (type) {
        query = query.eq('tipo_evento', type)
      }

      const { data, error } = await query

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Erro ao buscar eventos eSocial:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [type])

  return { events, loading, refresh: fetchEvents }
}

export function useESocialCompanies() {
  const [companies, setCompanies] = useState<ESocialCompany[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      // Buscar empresas vinculadas ao eSocial ou importadas
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .or('origem.eq.esocial,origem.eq.manual') // Ajustar conforme lógica de negócio
        .order('razao_social')

      if (error) throw error
      
      // Aqui poderíamos buscar contagem de funcionários se necessário
      // Mas por enquanto vamos retornar os dados básicos
      setCompanies(data || [])
    } catch (error) {
      console.error('Erro ao buscar empresas eSocial:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  return { companies, loading, refresh: fetchCompanies }
}
