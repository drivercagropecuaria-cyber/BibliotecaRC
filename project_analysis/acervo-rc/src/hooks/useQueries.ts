import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, CatalogoItem } from '@/lib/supabase'

// Query Keys
export const queryKeys = {
  localidades: ['localidades'] as const,
  dashboard: ['dashboard'] as const,
  items: (localidade?: string, filters?: Record<string, string>, search?: string, page?: number) => 
    ['items', localidade, filters, search, page] as const,
  item: (id: string | number) => ['item', id] as const,
  workflowItems: (filters?: Record<string, string | number | boolean | undefined>) => ['workflowItems', filters] as const,
  taxonomy: ['taxonomy'] as const,
}

// Hook para buscar localidades (AcervoPage)
export function useLocalidades() {
  return useQuery({
    queryKey: queryKeys.localidades,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_localidades_stats')
      if (error) throw error
      
      return (data || []).map((row: any) => ({
        name: row.area_fazenda,
        slug: encodeURIComponent(row.area_fazenda),
        itemCount: Number(row.total_count),
        imageCount: Number(row.image_count),
        videoCount: Number(row.video_count),
        covers: (row.cover_urls || []).map((c: any) => ({
          url: c.url,
          type: c.type as 'image' | 'video'
        }))
      })).sort((a: any, b: any) => b.itemCount - a.itemCount)
    },
    staleTime: 120000,
  })
}

// Hook para buscar métricas do dashboard
export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const [metricsRes, statusRes, areaRes, temaRes, recentRes] = await Promise.all([
        supabase.rpc('get_dashboard_metrics'),
        supabase.rpc('count_by_status'),
        supabase.rpc('count_by_area'),
        supabase.rpc('count_by_tema'),
        supabase.from('v_catalogo_completo')
          .select('id,titulo,arquivo_url,arquivo_tipo,thumbnail_url,status:status_nome,area_fazenda:area_fazenda_nome,created_at')
          .order('created_at', { ascending: false })
          .limit(5)
      ])
      return {
        metrics: metricsRes.data?.[0] || { total_itens: 0, pendentes: 0, aprovados: 0, publicados: 0 },
        statusData: statusRes.data || [],
        areaData: (areaRes.data || []).slice(0, 8),
        temaData: (temaRes.data || []).slice(0, 8),
        recentItems: (recentRes.data || []) as CatalogoItem[]
      }
    },
    staleTime: 60000,
  })
}

// Hook para buscar itens de uma localidade com filtros
const ITEMS_PER_PAGE = 24
export function useLocalidadeItems(localidadeId: string, filters: Record<string, string>, search: string, page: number) {
  return useQuery({
    queryKey: queryKeys.items(localidadeId, filters, search, page),
    queryFn: async () => {
      let query = supabase.from('v_catalogo_completo')
        .select('id,titulo,arquivo_url,arquivo_tipo,thumbnail_url,status:status_nome,ponto:ponto_nome,tipo_projeto:tipo_projeto_nome,data_captacao,created_at', { count: 'exact' })
        .eq('area_fazenda_id', localidadeId)
        .order('created_at', { ascending: false })
      
      if (filters.tipo) query = query.eq('tipo_projeto_id', filters.tipo)
      if (filters.status) query = query.eq('status_id', filters.status)
      if (filters.ponto) query = query.eq('ponto_id', filters.ponto)
      if (filters.tema) query = query.eq('tema_principal_id', filters.tema)
      if (search) query = query.or(`titulo.ilike.%${search}%,ponto_nome.ilike.%${search}%`)
      
      const from = (page - 1) * ITEMS_PER_PAGE
      query = query.range(from, from + ITEMS_PER_PAGE - 1)
      
      const { data, count, error } = await query
      if (error) throw error
      
      return {
        items: (data || []) as CatalogoItem[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
      }
    },
    enabled: !!localidadeId,
    staleTime: 30000,
  })
}

// Hook para buscar um item específico
export function useItem(id?: string) {
  return useQuery({
    queryKey: queryKeys.item(id!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_catalogo_completo')
        .select('id,titulo,descricao,arquivo_url,arquivo_tipo,arquivo_nome,arquivo_tamanho,thumbnail_url,area_fazenda:area_fazenda_nome,area_fazenda_id,ponto:ponto_nome,ponto_id,tipo_projeto:tipo_projeto_nome,tipo_projeto_id,nucleo_pecuaria:nucleo_pecuaria_nome,nucleo_pecuaria_id,nucleo_agro:nucleo_agro_nome,nucleo_agro_id,nucleo_operacoes:operacao_nome,operacao_id,marca:marca_nome,marca_id,evento:evento_nome,evento_id,funcao_historica:funcao_historica_nome,funcao_historica_id,tema_principal:tema_principal_nome,tema_principal_id,status:status_nome,status_id,capitulo:capitulo_nome,capitulo_id,frase_memoria,observacoes,responsavel,data_captacao,created_at,updated_at')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as CatalogoItem
    },
    enabled: !!id,
  })
}

// Hook para buscar itens do WorkflowPage
export function useWorkflowItems(filters: { responsavel?: string }, page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.workflowItems({ ...filters, page, pageSize }),
    queryFn: async () => {
      let query = supabase
        .from('v_catalogo_completo')
        .select('id,titulo,arquivo_url,arquivo_tipo,area_fazenda:area_fazenda_nome,responsavel,status:status_nome,status_id,updated_at', { count: 'exact' })
        .order('updated_at', { ascending: false })

      if (filters.responsavel) query = query.eq('responsavel', filters.responsavel)

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) throw error
      return {
        items: (data || []) as CatalogoItem[],
        totalCount: count || 0,
      }
    },
  })
}

// MUTATIONS

// Hook para atualizar um item
export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string | number; updates: Partial<CatalogoItem> }) => {
      const { data, error } = await supabase.from('catalogo_itens').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflowItems'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.item(data.id) })
    },
  })
}

// Hook para deletar um item
export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from('catalogo_itens').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['workflowItems'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.removeQueries({ queryKey: queryKeys.item(deletedId) })
    },
  })
}

// Hook para buscar taxonomy
export interface TaxonomyItem {
  id: string
  type: string
  name: string
  parent_id: string | null
  display_order: number
  is_active: boolean
}

export function useTaxonomyQuery() {
  return useQuery({
    queryKey: queryKeys.taxonomy,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taxonomy_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data || []) as TaxonomyItem[]
    },
    staleTime: 1800000, // 30 minutos
    gcTime: 3600000, // 1 hora
  })
}
