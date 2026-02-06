import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const supabaseConfigError = !supabaseUrl || !supabaseAnonKey

const memoryStorage = new Map<string, string>()
const safeStorage: Storage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return memoryStorage.get(key) ?? null
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      memoryStorage.set(key, value)
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      memoryStorage.delete(key)
    }
  },
  clear: () => {
    try {
      window.localStorage.clear()
    } catch {
      memoryStorage.clear()
    }
  },
  key: (index) => {
    try {
      return window.localStorage.key(index)
    } catch {
      return Array.from(memoryStorage.keys())[index] ?? null
    }
  },
  get length() {
    try {
      return window.localStorage.length
    } catch {
      return memoryStorage.size
    }
  },
}

export const supabase = createClient(
  supabaseUrl || 'https://invalid.supabase.co',
  supabaseAnonKey || 'invalid',
  {
    auth: {
      storage: safeStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      lock: async (_name, _timeout, fn) => await fn(),
    },
  }
)

export type CatalogoItem = {
  id: number
  media_id?: string
  titulo: string
  descricao?: string
  arquivo_url?: string
  arquivo_tipo?: string
  arquivo_nome?: string
  arquivo_tamanho?: number
  proxy_url?: string
  proxy_mime_type?: string
  proxy_filename?: string
  proxy_size_bytes?: number
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
