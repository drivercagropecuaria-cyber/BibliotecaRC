import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const supabaseConfigError = !supabaseUrl || !supabaseAnonKey

export const supabase = createClient(
  supabaseUrl || 'https://invalid.supabase.co',
  supabaseAnonKey || 'invalid'
)

export type CatalogoItem = {
  id: number
  titulo: string
  descricao?: string
  arquivo_url?: string
  arquivo_tipo?: string
  arquivo_nome?: string
  arquivo_tamanho?: number
  thumbnail_url?: string
  area_fazenda?: string
  area_fazenda_id?: string
  ponto?: string
  ponto_id?: string
  tipo_projeto?: string
  tipo_projeto_id?: string
  nucleo_pecuaria?: string
  nucleo_pecuaria_id?: string
  nucleo_agro?: string
  nucleo_agro_id?: string
  nucleo_operacoes?: string
  operacao_id?: string
  marca?: string
  marca_id?: string
  evento?: string
  evento_id?: string
  funcao_historica?: string
  funcao_historica_id?: string
  tema_principal?: string
  tema_principal_id?: string
  frase_memoria?: string
  responsavel?: string
  observacoes?: string
  status?: string
  status_id?: string
  capitulo?: string
  capitulo_id?: string
  data_captacao?: string
  created_at: string
  updated_at: string
}
