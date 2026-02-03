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
const loadXLSX = () => import('xlsx')
const loadJSZip = () => import('jszip')

// Componente de Card memoizado para evitar re-renders
const ItemCard = ({ item, onOpen, onDownload, getItemIcon }: {
  item: CatalogoItem
  onOpen: (item: CatalogoItem) => void
  onDownload: (item: CatalogoItem) => void
  getItemIcon: (tipo?: string) => JSX.Element
}) => (
  <div className="group relative bg-white rounded-2xl overflow-hidden shadow-glass hover:shadow-xl transition-all duration-300">
    <div className="aspect-square relative overflow-hidden cursor-pointer" onClick={() => onOpen(item)}>
      {item.arquivo_url && item.arquivo_tipo?.startsWith('image') ? (
        <OptimizedImage src={item.arquivo_url} alt={item.titulo || ''} className="w-full h-full transition-transform duration-500 group-hover:scale-110" />
      ) : item.arquivo_url && item.arquivo_tipo?.startsWith('video') ? (
        <VideoThumbnail src={item.arquivo_url} thumbnailUrl={item.thumbnail_url} className="w-full h-full" showPlayIcon={false} onHoverPlay={true} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
          <FileText className="w-12 h-12 text-neutral-400" />
        </div>
      )}
      
      {item.arquivo_tipo?.startsWith('video') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
          <div className="w-14 h-14 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <div className="p-3 bg-white/90 backdrop-blur-sm rounded-full"><Eye className="w-6 h-6 text-neutral-700" /></div>
        <button onClick={(e) => { e.stopPropagation(); onDownload(item) }} className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-primary-500 hover:text-white transition-colors">
          <Download className="w-6 h-6" />
        </button>
      </div>
      
      <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-lg font-medium ${statusColors[item.status || ''] || 'bg-neutral-100 text-neutral-600'}`}>{item.status}</span>
      <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-neutral-600">{getItemIcon(item.arquivo_tipo)}</div>
    </div>
    
    <div className="p-4">
      <h3 className="font-semibold text-neutral-900 truncate mb-1">{item.titulo}</h3>
      <p className="text-sm text-neutral-500 truncate">{item.ponto || item.tipo_projeto || 'Sem categoria'}</p>
      {item.data_captacao && <p className="text-xs text-neutral-400 mt-2">{new Date(item.data_captacao).toLocaleDateString('pt-BR')}</p>}
      <Link to={`/item/${item.id}`} className="mt-3 block text-center py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all">Ver detalhes</Link>
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
  const [exporting, setExporting] = useState<'excel' | 'zip' | 'csv' | null>(null)
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
  
  const items = data?.items || []
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
    if (debouncedSearch) query = query.or(`titulo.ilike.%${debouncedSearch}%,ponto_nome.ilike.%${debouncedSearch}%,tema_principal_nome.ilike.%${debouncedSearch}%`)
    
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
    if (debouncedSearch) query = query.or(`titulo.ilike.%${debouncedSearch}%,ponto_nome.ilike.%${debouncedSearch}%,tema_principal_nome.ilike.%${debouncedSearch}%`)

    const { count } = await query
    return count || 0
  }

  // Exportar para Excel
  const exportToExcel = async () => {
    setExporting('excel')
    setExportProgress({ current: 0, total: 1, status: 'Carregando biblioteca...' })
    
    try {
      const total = await fetchFilteredCount()
      if (total > MAX_EXPORT_ITEMS) {
        const proceed = confirm(`Você está prestes a exportar ${total} itens. Isso pode ser lento. Deseja continuar?`)
        if (!proceed) { setExporting(null); return }
      }

      const [XLSX, data] = await Promise.all([loadXLSX(), fetchAllFilteredItems()])
      if (data.length === 0) { alert('Nenhum item para exportar'); setExporting(null); return }

      setExportProgress({ current: 0, total: 1, status: 'Preparando planilha...' })
      const exportData = data.map(item => ({
        'ID': item.id, 'Titulo': item.titulo || '', 'Data Captacao': item.data_captacao || '',
        'Area/Fazenda': item.area_fazenda || '', 'Ponto': item.ponto || '', 'Tipo Projeto': item.tipo_projeto || '',
        'Status': item.status || '', 'Responsavel': item.responsavel || '', 'Tema Principal': item.tema_principal || '',
        'Nucleo Pecuaria': item.nucleo_pecuaria || '', 'Nucleo Agro': item.nucleo_agro || '',
        'Frase Memoria': item.frase_memoria || '', 'Link Arquivo': item.arquivo_url || '', 'Tipo Arquivo': item.arquivo_tipo || '',
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, localidadeName.slice(0, 31))
      XLSX.writeFile(wb, `acervo_${localidadeName.toLowerCase().replace(/\s+/g, '-')}_${new Date().toISOString().slice(0, 10)}.xlsx`)
      setExportProgress({ current: 1, total: 1, status: 'Concluído!' })
    } catch (err) {
      console.error('Erro ao exportar Excel:', err)
      setExportProgress({ current: 0, total: 0, status: 'Erro ao exportar' })
    } finally {
      setTimeout(() => setExporting(null), 1500)
    }
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
          <h1 className="text-2xl lg:text-4xl font-bold text-neutral-900">{localidadeName}</h1>
          <p className="text-neutral-500 mt-1">
            <span className="font-semibold text-primary-600">{totalCount}</span> materiais encontrados
          </p>
        </div>
        <div className="flex gap-2">
          {/* Menu de Exportação */}
          <div className="relative" ref={exportMenuRef}>
            <button onClick={() => setShowExportMenu(!showExportMenu)} disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-glass hover:shadow-lg transition-all font-medium text-neutral-700 disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar
            </button>
            
            {showExportMenu && !exporting && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden">
                <button onClick={() => { exportToCsvServer(); setShowExportMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div><p className="font-medium text-neutral-800">CSV (server-side)</p><p className="text-xs text-neutral-500">Exportação rápida no servidor</p></div>
                </button>
                <button onClick={() => { exportToExcel(); setShowExportMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left border-t border-neutral-100">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <div><p className="font-medium text-neutral-800">Planilha Excel</p><p className="text-xs text-neutral-500">Exportar metadados (.xlsx)</p></div>
                </button>
                <button onClick={() => { exportToZip(); setShowExportMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left border-t border-neutral-100">
                  <FolderArchive className="w-5 h-5 text-amber-600" />
                  <div><p className="font-medium text-neutral-800">Arquivos (ZIP)</p><p className="text-xs text-neutral-500">Download de todos os arquivos</p></div>
                </button>
              </div>
            )}
            
            {exporting && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  {exporting === 'excel' ? <FileSpreadsheet className="w-5 h-5 text-green-600" /> : exporting === 'csv' ? <FileSpreadsheet className="w-5 h-5 text-blue-600" /> : <FolderArchive className="w-5 h-5 text-amber-600" />}
                  <span className="font-medium">
                    {exporting === 'excel' ? 'Exportando Excel' : exporting === 'csv' ? 'Exportando CSV' : 'Exportando ZIP'}
                  </span>
                </div>
                {exportProgress.total > 0 && (
                  <div className="mb-2">
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 transition-all" style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }} />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{exportProgress.current} / {exportProgress.total}</p>
                  </div>
                )}
                <p className="text-sm text-neutral-600 truncate">{exportProgress.status}</p>
                {exporting === 'zip' && (
                  <button
                    onClick={cancelExport}
                    className="mt-3 w-full px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 text-sm font-medium"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
          
          <button onClick={() => setShowFilters(!showFilters)} className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${showFilters || activeFilters.length > 0 ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' : 'bg-white text-neutral-600 shadow-glass'}`}>
            <Filter className="w-5 h-5" />
            {activeFilters.length > 0 && <span className="bg-white text-primary-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{activeFilters.length}</span>}
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-green' : 'bg-white text-neutral-600 shadow-glass'}`}><Grid className="w-5 h-5" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-green' : 'bg-white text-neutral-600 shadow-glass'}`}><List className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Filtros */}
      <div className={`bg-white rounded-2xl p-5 shadow-glass mb-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input type="text" placeholder="Buscar por título, ponto, tema, frase..." value={search} 
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full pl-12 pr-4 py-3 border-2 border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 bg-neutral-50" />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filters.ponto} onChange={(e) => { setFilters({ ...filters, ponto: e.target.value }); setCurrentPage(1) }}
              className="px-4 py-2.5 border-2 border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 bg-neutral-50 text-sm font-medium">
              <option value="">Todos os pontos</option>
              {taxonomy.pontosOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filters.tipo} onChange={(e) => { setFilters({ ...filters, tipo: e.target.value }); setCurrentPage(1) }}
              className="px-4 py-2.5 border-2 border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 bg-neutral-50 text-sm font-medium">
              <option value="">Todos os tipos</option>
              {taxonomy.tiposProjetoOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1) }}
              className="px-4 py-2.5 border-2 border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 bg-neutral-50 text-sm font-medium">
              <option value="">Todos os status</option>
              {taxonomy.statusOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filters.tema} onChange={(e) => { setFilters({ ...filters, tema: e.target.value }); setCurrentPage(1) }}
              className="px-4 py-2.5 border-2 border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 bg-neutral-50 text-sm font-medium">
              <option value="">Todos os temas</option>
              {taxonomy.temasPrincipaisOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap items-center">
            {activeFilters.map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium">
                {getFilterLabel(key, value)}
                <button onClick={() => { setFilters({ ...filters, [key]: '' }); setCurrentPage(1) }} className="p-0.5 hover:bg-primary-200 rounded"><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-sm text-neutral-500 hover:text-primary-600 ml-2 font-medium">Limpar tudo</button>
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
                  className="bg-white rounded-2xl p-4 shadow-glass hover:shadow-lg transition-all flex items-center gap-4"
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
                      <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-neutral-400">{getItemIcon(item.arquivo_tipo)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">{item.titulo}</h3>
                    <p className="text-sm text-neutral-500 truncate">{item.ponto || item.tipo_projeto}</p>
                    {item.data_captacao && <p className="text-xs text-neutral-400 mt-1">{new Date(item.data_captacao).toLocaleDateString('pt-BR')}</p>}
                  </div>
                  <span className={`hidden sm:block text-xs px-3 py-1.5 rounded-lg font-medium ${statusColors[item.status || ''] || 'bg-neutral-100 text-neutral-600'}`}>{item.status}</span>
                  <button onClick={() => downloadFile(item)} className="p-2.5 bg-neutral-100 rounded-xl text-neutral-600 hover:bg-primary-100 hover:text-primary-600 transition-all"><Download className="w-5 h-5" /></button>
                  <Link to={`/item/${item.id}`} className="p-2.5 bg-neutral-100 rounded-xl text-neutral-600 hover:bg-primary-100 hover:text-primary-600 transition-all"><Eye className="w-5 h-5" /></Link>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-3 bg-white rounded-xl shadow-glass hover:shadow-lg disabled:opacity-50 transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <span className="px-5 py-2.5 bg-white rounded-xl shadow-glass text-sm font-medium">
                <span className="text-primary-600 font-bold">{currentPage}</span> / {totalPages}
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-3 bg-white rounded-xl shadow-glass hover:shadow-lg disabled:opacity-50 transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-glass">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
            <Image className="w-12 h-12 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Nenhum item encontrado</h3>
          <p className="text-neutral-500 mb-4">{activeFilters.length > 0 || search ? 'Tente ajustar os filtros ou busca' : 'Esta localidade ainda nao possui materiais'}</p>
          {(activeFilters.length > 0 || search) && <button onClick={clearFilters} className="text-primary-600 hover:underline font-semibold">Limpar filtros</button>}
        </div>
      )}

      {lightboxItem && (
        <ImageLightbox item={lightboxItem} items={items} currentIndex={lightboxIndex} onClose={() => setLightboxItem(null)} onNavigate={navigateLightbox} />
      )}
    </div>
  )
}
