import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, CatalogoItem } from '@/lib/supabase'

// Query Keys
export const queryKeys = {
  localidades: ['localidades'],
  dashboard: ['dashboard'],
  items: (localidade?: string, filters?: Record<string, string>, search?: string, page?: number) => 
    ['items', localidade, { filters, search, page }],
  item: (id: string) => ['item', id],
  workflowItems: (filters?: Record<string, string>) => ['workflowItems', { filters }],
  taxonomy: ['taxonomy'],
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
        covers: (row.cover_urls || []).map((c: any) => ({ url: c.url, type: c.type as 'image' | 'video' }))
      })).sort((a: any, b: any) => b.itemCount - a.itemCount)
    },
    staleTime: 300000,
  })
}

// Hook para buscar métricas do dashboard
export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const [metricsRes, statusRes, areaRes, recentRes] = await Promise.all([
        supabase.rpc('get_dashboard_metrics'),
        supabase.rpc('count_by_status'),
        supabase.rpc('count_by_area'),
        supabase.from('catalogo_itens').select('id,titulo,arquivo_url,arquivo_tipo,thumbnail_url,status,area_fazenda,created_at').order('created_at', { ascending: false }).limit(5)
      ])
      return {
        metrics: metricsRes.data?.[0] || { total_itens: 0, pendentes: 0, aprovados: 0, publicados: 0 },
        statusData: statusRes.data || [],
        areaData: (areaRes.data || []).slice(0, 8),
        recentItems: (recentRes.data || []) as CatalogoItem[]
      }
    },
    staleTime: 60000,
  })
}

// Hook para buscar itens de uma localidade com filtros
const ITEMS_PER_PAGE = 24
export function useLocalidadeItems(localidade: string, filters: Record<string, string>, search: string, page: number) {
  return useQuery({
    queryKey: queryKeys.items(localidade, filters, search, page),
    queryFn: async () => {
      let query = supabase.from('catalogo_itens')
        .select('id,titulo,arquivo_url,arquivo_tipo,thumbnail_url,status,ponto,tipo_projeto,data_captacao,created_at', { count: 'exact' })
        .eq('area_fazenda', decodeURIComponent(localidade))
        .order('created_at', { ascending: false })
      
      if (filters.tipo) query = query.eq('tipo_projeto', filters.tipo)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.ponto) query = query.eq('ponto', filters.ponto)
      if (search) query = query.or(`titulo.ilike.%${search}%,ponto.ilike.%${search}%`)
      
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
    enabled: !!localidade,
    staleTime: 30000,
  })
}

// Hook para buscar um item específico (ItemDetailPage)
export function useItem(id?: string) {
  return useQuery({
    queryKey: queryKeys.item(id!),
    queryFn: async () => {
      const { data, error } = await supabase.from('catalogo_itens').select('*').eq('id', id!).single()
      if (error) throw error
      return data as CatalogoItem
    },
    enabled: !!id,
  })
}

// Hook para buscar todos os itens para o WorkflowPage
export function useWorkflowItems(filters: { responsavel?: string }) {
  return useQuery({
    queryKey: queryKeys.workflowItems(filters),
    queryFn: async () => {
      let query = supabase.from('catalogo_itens').select('*').order('updated_at', { ascending: false })
      if (filters.responsavel) query = query.eq('responsavel', filters.responsavel)
      const { data, error } = await query
      if (error) throw error
      return data as CatalogoItem[]
    },
  })
}

// Hook para buscar e gerenciar a taxonomia
export function useTaxonomyData() {
  return useQuery({
    queryKey: queryKeys.taxonomy,
    queryFn: async () => {
      const { data, error } = await supabase.from('taxonomy_categories').select('*').eq('is_active', true).order('display_order', { ascending: true })
      if (error) throw error
      return data || []
    },
    staleTime: 3600000,
    gcTime: 3600000 * 2,
  })
}

// MUTATIONS

// Hook para atualizar um item
export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CatalogoItem> }) => {
      const { data, error } = await supabase.from('catalogo_itens').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflowItems'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.setQueryData(queryKeys.item(data.id), data)
    },
  })
}

// Hook para deletar um item
export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
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
