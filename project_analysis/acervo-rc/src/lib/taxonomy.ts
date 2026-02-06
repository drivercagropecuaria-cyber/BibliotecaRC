import { supabase } from './supabase'

export interface TaxonomyItem {
  id: string
  type: string
  name: string
  parent_id: string | null
  display_order: number
  is_active: boolean
}

export interface NamingRule {
  id: string
  name: string
  pattern: string
  is_default: boolean
}

// Cache para evitar chamadas repetidas
let taxonomyCache: TaxonomyItem[] | null = null
let namingRulesCache: NamingRule[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 600000 // 10 minutos

export async function getTaxonomy(): Promise<TaxonomyItem[]> {
  const now = Date.now()
  if (taxonomyCache && (now - cacheTimestamp) < CACHE_TTL) {
    return taxonomyCache
  }
  
  const { data, error } = await supabase
    .from('taxonomy_categories')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching taxonomy:', error)
    return []
  }
  
  taxonomyCache = data || []
  cacheTimestamp = now
  return taxonomyCache
}

export async function getNamingRules(): Promise<NamingRule[]> {
  if (namingRulesCache) return namingRulesCache
  
  const { data, error } = await supabase
    .from('naming_rules')
    .select('*')
    .order('is_default', { ascending: false })
  
  if (error) {
    console.error('Error fetching naming rules:', error)
    return []
  }
  
  namingRulesCache = data || []
  return namingRulesCache
}

export function invalidateCache() {
  taxonomyCache = null
  namingRulesCache = null
  cacheTimestamp = 0
}

// Helper para obter itens de um tipo especifico
export function getItemsByType(taxonomy: TaxonomyItem[], type: string, parentId?: string): string[] {
  return taxonomy
    .filter(t => t.type === type && t.is_active && (parentId ? t.parent_id === parentId : !t.parent_id))
    .sort((a, b) => a.display_order - b.display_order)
    .map(t => t.name)
}

// Tipos de taxonomia
export const TAXONOMY_TYPES = [
  { key: 'area', label: 'Areas / Fazendas', hasChildren: false },
  { key: 'ponto', label: 'Local', hasChildren: false },
  { key: 'tipo_projeto', label: 'Tipos de Projeto', hasChildren: false },
  { key: 'nucleo_pecuaria', label: 'Nucleos Pecuaria', hasChildren: false },
  { key: 'nucleo_agro', label: 'Nucleos Agro', hasChildren: false },
  { key: 'nucleo_operacoes', label: 'Nucleos Operacoes', hasChildren: false },
  { key: 'nucleo_marca', label: 'Nucleos Marca', hasChildren: false },
  { key: 'evento', label: 'Atividades', hasChildren: false },
  { key: 'funcao_historica', label: 'Atividade Complementar', hasChildren: false },
  { key: 'tema_principal', label: 'Temas Principais', hasChildren: false },
  { key: 'status', label: 'Status', hasChildren: false },
  { key: 'capitulo', label: 'Estações do Ano', hasChildren: false },
  { key: 'responsavel', label: 'Responsaveis', hasChildren: false },
]

// Gerar nome de arquivo baseado na regra
export function generateFileName(
  rule: NamingRule,
  data: Record<string, string>,
  index: number,
  total: number
): string {
  let result = rule.pattern
  const replacements: Record<string, string> = {
    '{area}': sanitize(data.area_fazenda || 'SemArea'),
    '{ponto}': sanitize(data.ponto || ''),
    '{tipo}': sanitize(data.tipo_projeto || ''),
    '{titulo}': sanitize(data.titulo || 'Arquivo'),
    '{data}': (data.data_captacao || new Date().toISOString().slice(0, 10)).replace(/-/g, ''),
    '{seq}': String(index + 1).padStart(3, '0'),
    '{ext}': data.extensao || 'bin',
    '{nucleo}': sanitize(data.nucleo_pecuaria || data.nucleo_agro || data.nucleo_operacoes || ''),
    '{responsavel}': sanitize(data.responsavel || ''),
    '{status}': sanitize(data.status || ''),
  }
  
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value)
  }
  
  // Remover underscores duplos e limpar
  result = result.replace(/_+/g, '_').replace(/\/_/g, '/').replace(/_\./g, '.')
  
  return result
}

function sanitize(str: string): string {
  return (str || '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 30)
}
