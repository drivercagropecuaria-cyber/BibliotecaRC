import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { supabase, CatalogoItem } from '@/lib/supabase'
import { useLocalidadeItems } from '@/hooks/useQueries'
import { useTaxonomy, statusColors } from '@/hooks/useTaxonomy'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ImageLightbox } from '@/components/ImageLightbox'
import { VideoThumbnail } from '@/components/VideoThumbnail'
import { OptimizedImage } from '@/components/OptimizedImage'
import { Search, Grid, List, Filter, X, Play, Image, FileText, Download, ChevronLeft, ChevronRight, Eye, Loader2, FileSpreadsheet, FolderArchive } from 'lucide-react'

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// Lazy load bibliotecas pesadas
const loadJSZip = () => import('jszip')

// Componente de Card memoizado para evitar re-renders
const ItemCard = ({ item, onOpen, onDownload, getItemIcon }: {
  item: CatalogoItem
  onOpen: (item: CatalogoItem) => void
  onDownload: (item: CatalogoItem) => void
  getItemIcon: (tipo?: string) => JSX.Element
}) => (
  <div className="group relative glass-card overflow-hidden hover:shadow-[0_20px_40px_-24px_rgba(7,14,10,0.7)] transition-all duration-300">
    <div className="aspect-square relative overflow-hidden cursor-pointer" onClick={() => onOpen(item)}>
      {item.arquivo_tipo?.startsWith('image') && (item.arquivo_url || item.thumbnail_url) ? (
        <OptimizedImage src={item.arquivo_url || item.thumbnail_url!} alt={item.titulo || ''} className="w-full h-full transition-transform duration-500 group-hover:scale-110" />
      ) : item.arquivo_tipo?.startsWith('video') && item.arquivo_url ? (
        <VideoThumbnail src={item.arquivo_url} thumbnailUrl={item.thumbnail_url} className="w-full h-full" showPlayIcon={false} onHoverPlay={true} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-900/70 to-neutral-800/50 flex items-center justify-center">
          <FileText className="w-12 h-12 text-rc-text-muted" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
      
      {item.arquivo_tipo?.startsWith('video') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
          <div className="w-14 h-14 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <div className="p-3 glass rounded-full"><Eye className="w-6 h-6 text-rc-text" /></div>
        <button onClick={(e) => { e.stopPropagation(); onDownload(item) }} className="p-3 glass rounded-full hover:bg-rc-gold/80 hover:text-neutral-900 transition-colors">
          <Download className="w-6 h-6" />
        </button>
      </div>
      
      <span className={`absolute top-3 right-3 text-[11px] px-2 py-1 rounded-lg font-medium ${statusColors[item.status || ''] || 'bg-neutral-100 text-neutral-600'}`}>{item.status}</span>
      <div className="absolute bottom-3 left-3 w-8 h-8 glass rounded-lg flex items-center justify-center text-rc-text">{getItemIcon(item.arquivo_tipo)}</div>
    </div>
    
    <div className="p-4">
      <h3 className="font-semibold text-rc-text truncate mb-1">{item.titulo}</h3>
      <p className="text-sm text-rc-text-muted truncate">{item.ponto || item.tipo_projeto || 'Sem categoria'}</p>
      {item.data_captacao && <p className="text-xs text-rc-text-muted mt-2">{new Date(item.data_captacao).toLocaleDateString('pt-BR')}</p>}
      <Link to={`/item/${item.id}`} className="mt-3 block text-center py-2 text-sm font-medium text-rc-gold hover:text-amber-200 hover:bg-amber-500/10 rounded-xl transition-all">Ver detalhes</Link>
    </div>
  </div>
)

export function LocalidadePage() {
  const { localidade } = useParams<{ localidade: string }>()
  const { taxonomy, rawData } = useTaxonomy()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [lightboxItem, setLightboxItem] = useState<CatalogoItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [filters, setFilters] = useState({ tipo: '', status: '', ponto: '', tema: '', nucleo: '' })
  
  // Estados para exportação
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exporting, setExporting] = useState<'zip' | 'csv' | null>(null)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, status: '' })
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [gridColumns, setGridColumns] = useState(4)
  const MAX_EXPORT_ITEMS = 500

  const localidadeName = decodeURIComponent(localidade || '')
  const localidadeId = useMemo(() => {
    const match = rawData.find(t => t.type === 'area' && t.name === localidadeName && !t.parent_id)
    return match?.id || ''
  }, [rawData, localidadeName])

  // React Query - cache automático, cancelamento automático
  const { data, isLoading: loading } = useLocalidadeItems(
    localidadeId,
    filters,
    debouncedSearch,
    currentPage
  )
  
  const items = useMemo(() => data?.items || [], [data])
  const totalCount = data?.totalCount || 0
  const totalPages = data?.totalPages || 1

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setGridColumns(1)
      else if (width < 1024) setGridColumns(2)
      else if (width < 1280) setGridColumns(3)
      else setGridColumns(4)
    }
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const rowCount = viewMode === 'grid'
    ? Math.ceil(items.length / gridColumns)
    : items.length

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => viewMode === 'grid' ? 360 : 120,
    overscan: 8,
  })

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  // Buscar todos os itens filtrados (para exportação)
  const fetchAllFilteredItems = async (): Promise<CatalogoItem[]> => {
    let query = supabase.from('v_catalogo_completo')
      .select('id,titulo,arquivo_url,arquivo_tipo,data_captacao,area_fazenda:area_fazenda_nome,ponto:ponto_nome,tipo_projeto:tipo_projeto_nome,status:status_nome,responsavel,tema_principal:tema_principal_nome,nucleo_pecuaria:nucleo_pecuaria_nome,nucleo_agro:nucleo_agro_nome,frase_memoria')
      .eq('area_fazenda_id', localidadeId)
    
    if (filters.tipo) query = query.eq('tipo_projeto_id', filters.tipo)
    if (filters.status) query = query.eq('status_id', filters.status)
    if (filters.ponto) query = query.eq('ponto_id', filters.ponto)
    if (filters.tema) query = query.eq('tema_principal_id', filters.tema)
    if (debouncedSearch) {
      const terms = debouncedSearch.split(/\s+/).map(t => t.replace(/[,]/g, '')).filter(Boolean)
      terms.forEach(term => {
        query = query.or(
          `titulo.ilike.%${term}%,ponto_nome.ilike.%${term}%,tema_principal_nome.ilike.%${term}%,tipo_projeto_nome.ilike.%${term}%,status_nome.ilike.%${term}%,responsavel.ilike.%${term}%,arquivo_nome.ilike.%${term}%,frase_memoria.ilike.%${term}%`
        )
      })
    }
    
    const { data } = await query
    return (data || []) as CatalogoItem[]
  }

  const fetchFilteredCount = async (): Promise<number> => {
    let query = supabase.from('v_catalogo_completo')
      .select('id', { count: 'exact', head: true })
      .eq('area_fazenda_id', localidadeId)

    if (filters.tipo) query = query.eq('tipo_projeto_id', filters.tipo)
    if (filters.status) query = query.eq('status_id', filters.status)
    if (filters.ponto) query = query.eq('ponto_id', filters.ponto)
    if (filters.tema) query = query.eq('tema_principal_id', filters.tema)
    if (debouncedSearch) {
      const terms = debouncedSearch.split(/\s+/).map(t => t.replace(/[,]/g, '')).filter(Boolean)
      terms.forEach(term => {
        query = query.or(
          `titulo.ilike.%${term}%,ponto_nome.ilike.%${term}%,tema_principal_nome.ilike.%${term}%,tipo_projeto_nome.ilike.%${term}%,status_nome.ilike.%${term}%,responsavel.ilike.%${term}%,arquivo_nome.ilike.%${term}%,frase_memoria.ilike.%${term}%`
        )
      })
    }

    const { count } = await query
    return count || 0
  }

  const exportToCsvServer = async () => {
    setExporting('csv')
    setExportProgress({ current: 0, total: 1, status: 'Preparando exportação server-side...' })

    try {
      const total = await fetchFilteredCount()
      if (total > MAX_EXPORT_ITEMS) {
        const proceed = confirm(`Você está prestes a exportar ${total} itens (server-side). Deseja continuar?`)
        if (!proceed) { setExporting(null); return }
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
      if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL não configurada')

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Sessão inválida')

      const response = await fetch(`${supabaseUrl}/functions/v1/export-localidade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          localidade_id: localidadeId,
          filters,
          search: debouncedSearch,
          limit: 20000,
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Erro ao exportar CSV')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `acervo_${localidadeName.toLowerCase().replace(/\s+/g, '-')}_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)

      setExportProgress({ current: 1, total: 1, status: 'Concluído!' })
    } catch (err: any) {
      console.error('Erro ao exportar CSV:', err)
      setExportProgress({ current: 0, total: 0, status: 'Erro ao exportar' })
    } finally {
      setTimeout(() => setExporting(null), 1500)
    }
  }

  // Exportar arquivos como ZIP
  const exportToZip = async () => {
    setExporting('zip')
    abortControllerRef.current = new AbortController()
    
    try {
      setExportProgress({ current: 0, total: 0, status: 'Carregando biblioteca...' })
      const total = await fetchFilteredCount()
      if (total > MAX_EXPORT_ITEMS) {
        const proceed = confirm(`Você está prestes a baixar ${total} arquivos. Isso pode ser pesado e lento. Deseja continuar?`)
        if (!proceed) { setExporting(null); return }
      }

      const [JSZipModule, data] = await Promise.all([loadJSZip(), fetchAllFilteredItems()])
      const JSZip = JSZipModule.default
      const filesWithUrl = data.filter(item => item.arquivo_url)
      
      if (filesWithUrl.length === 0) { alert('Nenhum arquivo para exportar'); setExporting(null); return }

      setExportProgress({ current: 0, total: filesWithUrl.length, status: 'Iniciando download...' })
      const zip = new JSZip()
      const folder = zip.folder(`acervo_${localidadeName.replace(/\s+/g, '-')}`)
      
      let downloaded = 0
      const errors: string[] = []
      const signal = abortControllerRef.current.signal
      const BATCH_SIZE = 3

      for (let i = 0; i < filesWithUrl.length; i += BATCH_SIZE) {
        if (signal.aborted) break
        const batch = filesWithUrl.slice(i, i + BATCH_SIZE)
        
        await Promise.all(batch.map(async (item) => {
          if (signal.aborted) return
          try {
            setExportProgress(prev => ({ ...prev, status: `Baixando: ${item.titulo?.slice(0, 30)}...` }))
            const response = await fetch(item.arquivo_url!, { signal })
            if (!response.ok) throw new Error('Falha no download')
            const blob = await response.blob()
            const ext = item.arquivo_tipo?.split('/')[1] || 'bin'
            const safeName = (item.titulo || `arquivo_${item.id}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
            folder?.file(`${safeName}_${String(item.id).slice(0, 8)}.${ext}`, blob)
            downloaded++
            setExportProgress(prev => ({ ...prev, current: downloaded }))
          } catch (err: any) {
            if (err.name !== 'AbortError') errors.push(item.titulo || String(item.id))
          }
        }))
      }

      if (signal.aborted) { setExporting(null); return }

      setExportProgress(prev => ({ ...prev, status: 'Compactando arquivos...' }))
      const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `acervo_${localidadeName.toLowerCase().replace(/\s+/g, '-')}_${new Date().toISOString().slice(0, 10)}.zip`
      a.click()
      URL.revokeObjectURL(url)
      
      setExportProgress({ current: downloaded, total: filesWithUrl.length, status: errors.length > 0 ? `Concluído com ${errors.length} erros` : 'Concluído!' })
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao exportar ZIP:', err)
        setExportProgress({ current: 0, total: 0, status: 'Erro ao exportar' })
      }
    } finally {
      setTimeout(() => setExporting(null), 2000)
    }
  }

  const cancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setExporting(null)
    setExportProgress({ current: 0, total: 0, status: 'Cancelado' })
  }

  // Download individual
  const downloadFile = useCallback(async (item: CatalogoItem) => {
    if (!item.arquivo_url) return
    try {
      const response = await fetch(item.arquivo_url)
      const blob = await response.blob()
      const ext = item.arquivo_tipo?.split('/')[1] || 'bin'
      const safeName = (item.titulo || `arquivo_${item.id}`).replace(/[^a-zA-Z0-9_-]/g, '_')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${safeName}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error('Erro ao baixar arquivo:', err) }
  }, [])

  const activeFilters = useMemo(() => Object.entries(filters).filter(([, v]) => v), [filters])

  const getFilterLabel = (key: string, value: string) => {
    if (!value) return ''
    if (key === 'ponto') return taxonomy.pontosOptions.find(p => p.id === value)?.name || value
    if (key === 'tipo') return taxonomy.tiposProjetoOptions.find(t => t.id === value)?.name || value
    if (key === 'status') return taxonomy.statusOptions.find(s => s.id === value)?.name || value
    if (key === 'tema') return taxonomy.temasPrincipaisOptions.find(t => t.id === value)?.name || value
    return value
  }

  const openLightbox = useCallback((item: CatalogoItem) => {
    const index = items.findIndex(i => i.id === item.id)
    setLightboxItem(item)
    setLightboxIndex(index >= 0 ? index : 0)
  }, [items])

  const navigateLightbox = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setLightboxItem(items[index])
      setLightboxIndex(index)
    }
  }, [items])

  const clearFilters = useCallback(() => {
    setFilters({ tipo: '', status: '', ponto: '', tema: '', nucleo: '' })
    setSearch('')
    setCurrentPage(1)
  }, [])

  const getItemIcon = useCallback((tipo?: string) => {
    if (tipo?.startsWith('image')) return <Image className="w-5 h-5" />
    if (tipo?.startsWith('video')) return <Play className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }, [])

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <Breadcrumb items={[{ label: 'Acervo', href: '/acervo' }, { label: localidadeName }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-semibold text-rc-text tracking-wide">{localidadeName}</h1>
          <p className="text-rc-text-muted mt-1">
            <span className="font-semibold text-rc-gold">{totalCount}</span> materiais encontrados
          </p>
        </div>
        <div className="flex gap-2">
          {/* Menu de Exportação */}
          <div className="relative" ref={exportMenuRef}>
            <button onClick={() => setShowExportMenu(!showExportMenu)} disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl transition-all font-medium text-rc-text disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar
            </button>
            
            {showExportMenu && !exporting && (
              <div className="absolute right-0 mt-2 w-64 glass-card shadow-xl border border-rc-border z-50 overflow-hidden">
                <button onClick={() => { exportToCsvServer(); setShowExportMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                  <FileSpreadsheet className="w-5 h-5 text-rc-gold" />
                  <div><p className="font-medium text-rc-text">CSV (server-side)</p><p className="text-xs text-rc-text-muted">Exportacao rapida no servidor</p></div>
                </button>
                <button onClick={() => { exportToZip(); setShowExportMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-t border-white/5">
                  <FolderArchive className="w-5 h-5 text-amber-300" />
                  <div><p className="font-medium text-rc-text">Arquivos (ZIP)</p><p className="text-xs text-rc-text-muted">Download de todos os arquivos</p></div>
                </button>
              </div>
            )}
            
            {exporting && (
              <div className="absolute right-0 mt-2 w-72 glass-card shadow-xl border border-rc-border z-50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  {exporting === 'csv' ? <FileSpreadsheet className="w-5 h-5 text-rc-gold" /> : <FolderArchive className="w-5 h-5 text-amber-300" />}
                  <span className="font-medium text-rc-text">
                    {exporting === 'csv' ? 'Exportando CSV' : 'Exportando ZIP'}
                  </span>
                </div>
                {exportProgress.total > 0 && (
                  <div className="mb-2">
                    <div className="h-2 bg-neutral-800/70 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all" style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }} />
                    </div>
                    <p className="text-xs text-rc-text-muted mt-1">{exportProgress.current} / {exportProgress.total}</p>
                  </div>
                )}
                <p className="text-sm text-rc-text-muted truncate">{exportProgress.status}</p>
                {exporting === 'zip' && (
                  <button
                    onClick={cancelExport}
                    className="mt-3 w-full px-4 py-2 bg-white/10 text-rc-text rounded-lg hover:bg-white/20 text-sm font-medium"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
          
          <button onClick={() => setShowFilters(!showFilters)} className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${showFilters || activeFilters.length > 0 ? 'bg-gradient-to-r from-rc-gold/90 to-amber-400 text-neutral-900' : 'glass text-rc-text-muted'}`}>
            <Filter className="w-5 h-5" />
            {activeFilters.length > 0 && <span className="bg-black/60 text-amber-200 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{activeFilters.length}</span>}
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-rc-gold/90 to-amber-400 text-neutral-900 shadow-green' : 'glass text-rc-text-muted'}`}><Grid className="w-5 h-5" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-rc-gold/90 to-amber-400 text-neutral-900 shadow-green' : 'glass text-rc-text-muted'}`}><List className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Filtros */}
      <div className={`glass-card p-5 mb-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-rc-text-muted" />
            <input type="text" placeholder="Buscar por título, local, tema, frase..." value={search} 
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full bg-transparent text-rc-text border-b border-rc-border pl-8 pr-4 py-3 focus:outline-none focus:border-rc-gold placeholder:text-rc-text-muted" />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filters.ponto} onChange={(e) => { setFilters({ ...filters, ponto: e.target.value }); setCurrentPage(1) }}
              className="px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-sm font-medium text-rc-text">
              <option value="">Todos os locais</option>
              {taxonomy.pontosOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filters.tipo} onChange={(e) => { setFilters({ ...filters, tipo: e.target.value }); setCurrentPage(1) }}
              className="px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-sm font-medium text-rc-text">
              <option value="">Todos os tipos</option>
              {taxonomy.tiposProjetoOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1) }}
              className="px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-sm font-medium text-rc-text">
              <option value="">Todos os status</option>
              {taxonomy.statusOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filters.tema} onChange={(e) => { setFilters({ ...filters, tema: e.target.value }); setCurrentPage(1) }}
              className="px-4 py-2.5 border border-rc-border rounded-xl focus:ring-2 focus:ring-amber-400/40 bg-neutral-900/50 text-sm font-medium text-rc-text">
              <option value="">Todos os temas</option>
              {taxonomy.temasPrincipaisOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap items-center">
            {activeFilters.map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-200 rounded-xl text-sm font-medium">
                {getFilterLabel(key, value)}
                <button onClick={() => { setFilters({ ...filters, [key]: '' }); setCurrentPage(1) }} className="p-0.5 hover:bg-amber-500/20 rounded"><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-sm text-rc-text-muted hover:text-amber-200 ml-2 font-medium">Limpar tudo</button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="shimmer rounded-2xl aspect-square" />)}
        </div>
      ) : items.length > 0 ? (
        <>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              if (viewMode === 'grid') {
                const startIndex = virtualRow.index * gridColumns
                const rowItems = items.slice(startIndex, startIndex + gridColumns)
                return (
                  <div
                    key={virtualRow.key}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {rowItems.map((item) => (
                      <ItemCard key={item.id} item={item} onOpen={openLightbox} onDownload={downloadFile} getItemIcon={getItemIcon} />
                    ))}
                  </div>
                )
              }

              const item = items[virtualRow.index]
              if (!item) return null

              return (
                <div
                  key={virtualRow.key}
                  className="glass-card p-4 transition-all flex items-center gap-4"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => openLightbox(item)}>
                    {item.arquivo_url && item.arquivo_tipo?.startsWith('image') ? (
                      <OptimizedImage src={item.arquivo_url} alt={item.titulo || ''} className="w-full h-full" />
                    ) : item.arquivo_url && item.arquivo_tipo?.startsWith('video') ? (
                      <VideoThumbnail src={item.arquivo_url} thumbnailUrl={item.thumbnail_url} className="w-full h-full" showPlayIcon={false} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-900/70 to-neutral-800/50 flex items-center justify-center text-rc-text-muted">{getItemIcon(item.arquivo_tipo)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-rc-text truncate">{item.titulo}</h3>
                    <p className="text-sm text-rc-text-muted truncate">{item.ponto || item.tipo_projeto}</p>
                    {item.data_captacao && <p className="text-xs text-rc-text-muted mt-1">{new Date(item.data_captacao).toLocaleDateString('pt-BR')}</p>}
                  </div>
                  <span className={`hidden sm:block text-xs px-3 py-1.5 rounded-lg font-medium ${statusColors[item.status || ''] || 'bg-neutral-100 text-neutral-600'}`}>{item.status}</span>
                  <button onClick={() => downloadFile(item)} className="p-2.5 glass rounded-xl text-rc-text hover:text-amber-200 transition-all"><Download className="w-5 h-5" /></button>
                  <Link to={`/item/${item.id}`} className="p-2.5 glass rounded-xl text-rc-text hover:text-amber-200 transition-all"><Eye className="w-5 h-5" /></Link>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-3 glass rounded-xl disabled:opacity-50 transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <span className="px-5 py-2.5 glass rounded-xl text-sm font-medium text-rc-text">
                <span className="text-rc-gold font-bold">{currentPage}</span> / {totalPages}
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-3 glass rounded-xl disabled:opacity-50 transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 glass-card">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-900/60 to-neutral-800/50 flex items-center justify-center">
            <Image className="w-12 h-12 text-rc-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-rc-text mb-2">Nenhum item encontrado</h3>
          <p className="text-rc-text-muted mb-4">{activeFilters.length > 0 || search ? 'Tente ajustar os filtros ou busca' : 'Esta localidade ainda nao possui materiais'}</p>
          {(activeFilters.length > 0 || search) && <button onClick={clearFilters} className="text-rc-gold hover:underline font-semibold">Limpar filtros</button>}
        </div>
      )}

      {lightboxItem && (
        <ImageLightbox item={lightboxItem} items={items} currentIndex={lightboxIndex} onClose={() => setLightboxItem(null)} onNavigate={navigateLightbox} />
      )}
    </div>
  )
}
