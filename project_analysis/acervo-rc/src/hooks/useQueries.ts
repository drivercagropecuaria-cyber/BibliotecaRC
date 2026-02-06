import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase, CatalogoItem } from '@/lib/supabase'

const applySearchFilter = <T>(query: T, search: string, fields: string[]) => {
  const terms = search
    .trim()
    .split(/\s+/)
    .map(term => term.replace(/[,]/g, ''))
    .filter(Boolean)

  let nextQuery: any = query
  if (terms.length === 0) return nextQuery

  terms.forEach((term) => {
    const orFilter = fields.map(field => `${field}.ilike.%${term}%`).join(',')
    nextQuery = nextQuery.or(orFilter)
  })

  return nextQuery
}

// Query Keys
export const queryKeys = {
  localidades: ['localidades'] as const,
  dashboard: ['dashboard'] as const,
  namingRules: ['namingRules'] as const,
  acervoItems: (search?: string, limit?: number) => ['acervoItems', search, limit] as const,
  globalSearch: (search?: string, onlyVideos?: boolean, page?: number, limit?: number) => ['globalSearch', search, onlyVideos, page, limit] as const,
  items: (localidade?: string, filters?: Record<string, string>, search?: string, page?: number) => 
    ['items', localidade, filters, search, page] as const,
  item: (id: string | number) => ['item', id] as const,
  workflowItems: (filters?: Record<string, string | number | boolean | undefined>) => ['workflowItems', filters] as const,
  taxonomy: ['taxonomy'] as const,
}

const isAbortError = (err: any) => {
  const name = err?.name || ''
  const message = err?.message || ''
  return name === 'AbortError' || /operation was aborted/i.test(message)
}

const isRangeNotSatisfiable = (err: any) => {
  const status = err?.status || err?.code
  return status === 416 || status === 'PGRST103'
}

// Hook para buscar localidades (AcervoPage)
export function useLocalidades() {
  return useQuery({
    queryKey: queryKeys.localidades,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_localidades_stats')
      if (error) {
        if (isAbortError(error)) return []
        throw error
      }
      
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
      const [metricsRes, statusRes, areaRes, temaRes, recentRes, pipelineRes] = await Promise.all([
        supabase.rpc('get_dashboard_metrics'),
        supabase.rpc('count_by_status'),
        supabase.rpc('count_by_area'),
        supabase.rpc('count_by_tema'),
        supabase.from('v_catalogo_completo')
          .select('id,titulo,arquivo_url,proxy_url,arquivo_tipo,thumbnail_url,status:status_nome,area_fazenda:area_fazenda_nome,created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.rpc('get_upload_pipeline_stats')
      ])
      return {
        metrics: metricsRes.data?.[0] || { total_itens: 0, pendentes: 0, aprovados: 0, publicados: 0 },
        statusData: statusRes.data || [],
        areaData: (areaRes.data || []).slice(0, 8),
        temaData: (temaRes.data || []).slice(0, 8),
        recentItems: (recentRes.data || []) as CatalogoItem[],
        pipeline: pipelineRes.data?.[0] || {
          total_jobs: 0,
          pending: 0,
          uploading: 0,
          uploaded: 0,
          committed: 0,
          failed: 0,
          expired: 0,
          outbox_pending: 0,
        }
      }
    },
    staleTime: 60000,
  })
}

// Hook para buscar naming rules
export interface NamingRuleItem {
  id: string
  name: string
  pattern: string
  is_default: boolean
}

export function useNamingRules() {
  return useQuery({
    queryKey: queryKeys.namingRules,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('naming_rules')
        .select('*')
        .order('is_default', { ascending: false })
      if (error) throw error
      return (data || []) as NamingRuleItem[]
    },
    staleTime: 1800000, // 30 minutos
    gcTime: 3600000, // 1 hora
  })
}

// Hook para buscar itens globais do acervo (AcervoPage)
export function useAcervoItems(search: string, limit = 12, enabled = true) {
  const normalizedSearch = search.trim()
  return useQuery({
    queryKey: queryKeys.acervoItems(normalizedSearch, limit),
    queryFn: async () => {
      if (normalizedSearch) {
        const { data, error } = await supabase.rpc('search_catalogo', {
          p_query: normalizedSearch,
          p_limit: limit
        })
        if (error) {
          if (isAbortError(error)) return []
          throw error
        }
        return (data || []) as CatalogoItem[]
      }

      const { data, error } = await supabase
        .from('v_catalogo_completo')
        .select('id,titulo,arquivo_url,proxy_url,arquivo_tipo,thumbnail_url,status:status_nome,area_fazenda:area_fazenda_nome,tema_principal:tema_principal_nome,ponto:ponto_nome,data_captacao,created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as CatalogoItem[]
    },
    enabled,
    staleTime: 30000,
  })
}

export function useGlobalSearchItems(params: {
  searchTerm?: string
  onlyVideos?: boolean
  page?: number
  limit?: number
}) {
  const {
    searchTerm = '',
    onlyVideos = true,
    page = 1,
    limit = 24,
  } = params

  const normalizedSearch = searchTerm.trim()

  return useQuery({
    queryKey: queryKeys.globalSearch(normalizedSearch, onlyVideos, page, limit),
    queryFn: async () => {
      let query = supabase
        .from('v_catalogo_completo')
        .select('id,titulo,arquivo_url,proxy_url,arquivo_tipo,thumbnail_url,status:status_nome,area_fazenda:area_fazenda_nome,tema_principal:tema_principal_nome,ponto:ponto_nome,created_at', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (onlyVideos) query = query.ilike('arquivo_tipo', 'video/%')

      if (normalizedSearch) {
        query = applySearchFilter(query, normalizedSearch, [
          'titulo',
          'tema_principal_nome',
          'ponto_nome',
          'area_fazenda_nome',
          'arquivo_tipo',
          'arquivo_nome',
        ])
      }

      const from = (page - 1) * limit
      query = query.range(from, from + limit - 1)

      const { data, count, error } = await query
      if (error) throw error

      return {
        items: (data || []) as CatalogoItem[],
        totalCount: count || 0,
      }
    },
    staleTime: 30000,
  })
}

// Hook para buscar itens de uma localidade com filtros
const ITEMS_PER_PAGE = 24
export function useLocalidadeItems(localidadeId: string, filters: Record<string, string>, search: string, page: number) {
  return useQuery({
    queryKey: queryKeys.items(localidadeId, filters, search, page),
    queryFn: async () => {
      let query = supabase.from('v_catalogo_completo')
        .select('id,titulo,arquivo_url,proxy_url,arquivo_tipo,thumbnail_url,status:status_nome,ponto:ponto_nome,tipo_projeto:tipo_projeto_nome,data_captacao,created_at', { count: 'exact' })
        .eq('area_fazenda_id', localidadeId)
        .order('created_at', { ascending: false })
      
      if (filters.tipo) query = query.eq('tipo_projeto_id', filters.tipo)
      if (filters.status) query = query.eq('status_id', filters.status)
      if (filters.ponto) query = query.eq('ponto_id', filters.ponto)
      if (filters.tema) query = query.eq('tema_principal_id', filters.tema)
      if (search) {
        query = applySearchFilter(query, search, [
          'titulo',
          'ponto_nome',
          'tema_principal_nome',
          'tipo_projeto_nome',
          'status_nome',
          'responsavel',
          'arquivo_nome',
          'frase_memoria',
        ])
      }
      
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
        .select('id,media_id,titulo,descricao,arquivo_url,proxy_url,proxy_mime_type,proxy_filename,proxy_size_bytes,arquivo_tipo,arquivo_nome,arquivo_tamanho,thumbnail_url,area_fazenda:area_fazenda_nome,area_fazenda_id,ponto:ponto_nome,ponto_id,tipo_projeto:tipo_projeto_nome,tipo_projeto_id,nucleo_pecuaria:nucleo_pecuaria_nome,nucleo_pecuaria_id,nucleo_agro:nucleo_agro_nome,nucleo_agro_id,nucleo_operacoes:operacao_nome,operacao_id,marca:marca_nome,marca_id,evento:evento_nome,evento_id,funcao_historica:funcao_historica_nome,funcao_historica_id,tema_principal:tema_principal_nome,tema_principal_id,status:status_nome,status_id,capitulo:capitulo_nome,capitulo_id,frase_memoria,observacoes,responsavel,data_captacao,created_at,updated_at')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as CatalogoItem
    },
    enabled: !!id,
  })
}

// Hook para buscar itens do WorkflowPage
export function useWorkflowItems(filters: { responsavel?: string }, pageSize: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.workflowItems({ ...filters, pageSize }),
    queryFn: async ({ pageParam = 1 }) => {
      let query = supabase
        .from('v_catalogo_completo')
        .select('id,titulo,arquivo_url,proxy_url,thumbnail_url,arquivo_tipo,area_fazenda:area_fazenda_nome,responsavel,status:status_nome,status_id,updated_at', { count: 'exact' })
        .order('updated_at', { ascending: false })

      if (filters.responsavel) query = query.eq('responsavel', filters.responsavel)

      const from = (pageParam - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) {
        if (isRangeNotSatisfiable(error)) {
          return { items: [] as CatalogoItem[], totalCount: count || 0, page: pageParam }
        }
        throw error
      }
      return {
        items: (data || []) as CatalogoItem[],
        totalCount: count || 0,
        page: pageParam,
      }
    },
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((acc, page) => acc + page.items.length, 0)
      return loaded < lastPage.totalCount ? pages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 30000,
  })
}

// MUTATIONS

// Hook para atualizar um item
export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string | number; updates: Partial<CatalogoItem> }) => {
      const { status, area_fazenda, ponto, tema_principal, ...serverUpdates } = updates as any
      const { data, error } = await supabase.from('catalogo_itens').update(serverUpdates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['workflowItems'] })
      await queryClient.cancelQueries({ queryKey: ['items'] })

      const workflowSnapshots = queryClient.getQueriesData({ queryKey: ['workflowItems'] })
      const itemsSnapshots = queryClient.getQueriesData({ queryKey: ['items'] })
      const itemSnapshot = queryClient.getQueryData<CatalogoItem>(queryKeys.item(id))

      workflowSnapshots.forEach(([key, data]) => {
        if (!data) return
        queryClient.setQueryData(key, (prev: any) => {
          if (prev?.pages) {
            return {
              ...prev,
              pages: prev.pages.map((page: any) => ({
                ...page,
                items: page.items.map((item: CatalogoItem) =>
                  item.id === id ? { ...item, ...updates } : item
                )
              }))
            }
          }
          if (!prev?.items) return prev
          return {
            ...prev,
            items: prev.items.map((item: CatalogoItem) =>
              item.id === id ? { ...item, ...updates } : item
            )
          }
        })
      })

      itemsSnapshots.forEach(([key, data]) => {
        if (!data) return
        queryClient.setQueryData(key, (prev: any) => {
          if (!prev?.items) return prev
          return {
            ...prev,
            items: prev.items.map((item: CatalogoItem) =>
              item.id === id ? { ...item, ...updates } : item
            )
          }
        })
      })

      if (itemSnapshot) {
        queryClient.setQueryData(queryKeys.item(id), { ...itemSnapshot, ...updates })
      }

      return { workflowSnapshots, itemsSnapshots, itemSnapshot }
    },
    onError: (_err, _vars, context) => {
      if (!context) return
      context.workflowSnapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
      context.itemsSnapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
      if (context.itemSnapshot) {
        queryClient.setQueryData(queryKeys.item(context.itemSnapshot.id), context.itemSnapshot)
      }
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
