import { useMemo, useState, useEffect, useCallback } from 'react'
import { useDashboardMetrics, useGlobalSearchItems } from '@/hooks/useQueries'
import { FolderOpen, Clock, CheckCircle, Archive, Plus, AlertTriangle, BarChart3, PieChart, Search, CheckSquare, Square } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MediaCard } from '@/components/MediaCard'
import { supabase } from '@/lib/supabase'
import { AddToWorkspaceModal } from '@/components/AddToWorkspaceModal'

const COLORS = ['#d4af37', '#1a5f1a', '#8b6914', '#5b9a5b', '#f2d37c', '#0f3b0f', '#c7a02d', '#4b5f1a']

type UploadJobRow = {
  id: string
  status: string
  original_filename: string
  object_path: string
  bucket: string
  mime_type: string | null
  size_bytes: number | null
  created_at: string
  updated_at: string
  error: string | null
  user_id: string | null
}

export function DashboardPage() {
  // React Query - cache automático, sem refetch desnecessário
  const { data, isLoading: loading, error } = useDashboardMetrics()
  const [showUploadDetails, setShowUploadDetails] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<UploadJobRow[]>([])
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [recentSearch, setRecentSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedRecentIds, setSelectedRecentIds] = useState<number[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  
  const metrics = useMemo(() => data?.metrics || { total_itens: 0, pendentes: 0, aprovados: 0, publicados: 0 }, [data])
  const statusData = useMemo(() => data?.statusData || [], [data])
  const areaData = useMemo(() => data?.areaData || [], [data])
  const temaData = useMemo(() => data?.temaData || [], [data])
  const recentItems = useMemo(() => data?.recentItems || [], [data])
  const pipeline = useMemo(() => data?.pipeline || {
    total_jobs: 0,
    pending: 0,
    uploading: 0,
    uploaded: 0,
    committed: 0,
    failed: 0,
    expired: 0,
    outbox_pending: 0,
  }, [data])

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(recentSearch), 300)
    return () => clearTimeout(handle)
  }, [recentSearch])

  useEffect(() => {
    if (!debouncedSearch) {
      setSelectedRecentIds([])
    }
  }, [debouncedSearch])

  const { data: searchData } = useGlobalSearchItems({
    searchTerm: debouncedSearch,
    onlyVideos: false,
    page: 1,
    limit: 12,
  })

  const quickItems = debouncedSearch ? (searchData?.items || []) : recentItems

  const toggleSelected = (id: number) => {
    setSelectedRecentIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedRecentIds([])

  const formatBytes = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return '-'
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  const loadUploadJobs = useCallback(async () => {
    setJobsLoading(true)
    setJobsError(null)
    try {
      const { data: jobsData, error: jobsErr } = await supabase
        .from('upload_jobs')
        .select('id,status,original_filename,object_path,bucket,mime_type,size_bytes,created_at,updated_at,error,user_id')
        .order('created_at', { ascending: false })
        .limit(20)

      if (jobsErr) throw jobsErr
      setJobs((jobsData || []) as UploadJobRow[])
    } catch (err: any) {
      setJobsError(err?.message || 'Falha ao carregar detalhes dos uploads')
    } finally {
      setJobsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!showUploadDetails) return
    loadUploadJobs()
  }, [showUploadDetails, loadUploadJobs])

  // Cálculos memoizados
  const { maxArea, maxTema, totalStatus } = useMemo(() => {
    const maxArea = Math.max(...areaData.map((a: any) => Number(a.count)), 1)
    const maxTema = Math.max(...temaData.map((t: any) => Number(t.count)), 1)
    const totalStatus = statusData.reduce((acc: number, s: any) => acc + Number(s.count), 0) || 1
    return { maxArea, maxTema, totalStatus }
  }, [areaData, statusData, temaData])

  const mainCards = useMemo(() => [
    { label: 'Total de Itens', value: metrics.total_itens, icon: FolderOpen, accent: 'bg-rc-gold/20 text-rc-gold', ring: 'border-rc-border' },
    { label: 'Pendentes', value: metrics.pendentes, icon: Clock, accent: 'bg-amber-500/20 text-amber-300', ring: 'border-amber-500/30' },
    { label: 'Aprovados', value: metrics.aprovados, icon: CheckCircle, accent: 'bg-rc-green/20 text-rc-green', ring: 'border-rc-green/30' },
    { label: 'Publicados', value: metrics.publicados, icon: Archive, accent: 'bg-emerald-400/20 text-emerald-300', ring: 'border-emerald-400/30' },
  ], [metrics])

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-rc-text">Painel Principal</h1>
          <p className="text-neutral-500 mt-1">Visao geral do acervo de marketing</p>
        </div>
        <Link to="/upload" className="rc-button group">
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>Nova Importacao</span>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 glass-card border border-red-500/30">
          <div className="flex items-center gap-3 text-red-300 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-semibold">Falha ao carregar métricas do dashboard</p>
          </div>
          <pre className="text-xs text-red-200 bg-black/40 rounded p-2 overflow-x-auto">
            {error?.message || String(error)}
          </pre>
        </div>
      )}

      {metrics.pendentes > 0 && (
        <div className="mb-6 p-4 glass-card border border-amber-500/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-300" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-200">{metrics.pendentes} itens aguardando triagem</p>
            <p className="text-sm text-amber-100/70">Revisar e catalogar materiais pendentes</p>
          </div>
          <Link to="/workflow" className="rc-button-secondary text-sm">
            Ver Pastas Selecionadas
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {mainCards.map((card, idx) => (
          <div key={card.label} className={`relative overflow-hidden glass-card border ${card.ring} p-5 card-hover`} style={{ animationDelay: `${idx * 100}ms` }}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${card.accent}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-serif text-rc-text">{card.value}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-rc-text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-rc-text">Saude do Upload</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">Jobs e Outbox</span>
            <button
              onClick={() => setShowUploadDetails(prev => !prev)}
              className="text-xs font-semibold text-rc-gold hover:text-rc-earth"
            >
              {showUploadDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3 bg-white/5 border border-rc-border rounded-xl">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-lg font-serif text-rc-text">{pipeline.total_jobs}</p>
          </div>
          <div className="p-3 bg-white/5 border border-amber-500/30 rounded-xl">
            <p className="text-xs text-amber-200">Pendentes</p>
            <p className="text-lg font-serif text-amber-100">{pipeline.pending}</p>
          </div>
          <div className="p-3 bg-white/5 border border-blue-500/30 rounded-xl">
            <p className="text-xs text-blue-200">Enviando</p>
            <p className="text-lg font-serif text-blue-100">{pipeline.uploading}</p>
          </div>
          <div className="p-3 bg-white/5 border border-purple-500/30 rounded-xl">
            <p className="text-xs text-purple-200">Enviados</p>
            <p className="text-lg font-serif text-purple-100">{pipeline.uploaded}</p>
          </div>
          <div className="p-3 bg-white/5 border border-emerald-500/30 rounded-xl">
            <p className="text-xs text-emerald-200">Commitados</p>
            <p className="text-lg font-serif text-emerald-100">{pipeline.committed}</p>
          </div>
          <div className="p-3 bg-white/5 border border-red-500/30 rounded-xl">
            <p className="text-xs text-red-200">Falhas</p>
            <p className="text-lg font-serif text-red-100">{pipeline.failed}</p>
          </div>
          <div className="p-3 bg-white/5 border border-rc-border rounded-xl">
            <p className="text-xs text-neutral-500">Expirados</p>
            <p className="text-lg font-serif text-rc-text">{pipeline.expired}</p>
          </div>
          <div className="p-3 bg-white/5 border border-rc-border rounded-xl">
            <p className="text-xs text-neutral-500">Outbox</p>
            <p className="text-lg font-serif text-rc-text">{pipeline.outbox_pending}</p>
          </div>
        </div>

        {showUploadDetails && (
          <div className="mt-5 border border-rc-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5">
              <span className="text-sm font-semibold text-rc-text">Detalhes dos uploads recentes</span>
              <button
                onClick={loadUploadJobs}
                className="text-xs font-semibold text-neutral-500 hover:text-rc-text"
                disabled={jobsLoading}
              >
                Atualizar
              </button>
            </div>

            {jobsLoading ? (
              <div className="p-5 text-sm text-neutral-500">Carregando...</div>
            ) : jobsError ? (
              <div className="p-5 text-sm text-red-600">{jobsError}</div>
            ) : jobs.length === 0 ? (
              <div className="p-5 text-sm text-neutral-500">Nenhum upload encontrado.</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {jobs.map((job) => {
                  const publicUrl = supabase.storage.from(job.bucket || 'acervo-files').getPublicUrl(job.object_path || '').data.publicUrl
                  const isExpanded = expandedJobId === job.id

                  return (
                    <div key={job.id} className="px-4 py-3 text-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                        <div className="lg:col-span-4">
                          <p className="font-semibold text-neutral-900 truncate" title={job.original_filename}>{job.original_filename}</p>
                          <p className="text-xs text-neutral-500 truncate" title={job.object_path}>{job.object_path}</p>
                        </div>
                        <div className="lg:col-span-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{job.status}</span>
                        </div>
                        <div className="lg:col-span-2 text-neutral-500">{formatBytes(job.size_bytes)}</div>
                        <div className="lg:col-span-3 text-neutral-500">{new Date(job.created_at).toLocaleString('pt-BR')}</div>
                        <div className="lg:col-span-1 flex gap-2">
                          <button
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                            className="text-xs font-semibold text-rc-green hover:text-rc-green-dark"
                          >
                            {isExpanded ? 'Menos' : 'Mais'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-neutral-50 rounded-xl p-4">
                          <div className="space-y-2 text-xs text-neutral-600">
                            <div><span className="font-semibold">Job ID:</span> {job.id}</div>
                            <div><span className="font-semibold">Bucket:</span> {job.bucket}</div>
                            <div><span className="font-semibold">MIME:</span> {job.mime_type || '-'}</div>
                            <div><span className="font-semibold">Atualizado:</span> {new Date(job.updated_at).toLocaleString('pt-BR')}</div>
                            <div><span className="font-semibold">Usuário:</span> {job.user_id || '-'}</div>
                          </div>
                          <div className="space-y-2">
                            {job.error && (
                              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                                <span className="font-semibold">Erro:</span> {job.error}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-rc-green hover:text-rc-green-dark"
                              >
                                Abrir arquivo
                              </a>
                              <button
                                onClick={() => navigator.clipboard.writeText(job.id)}
                                className="text-xs font-semibold text-neutral-500 hover:text-neutral-700"
                              >
                                Copiar ID
                              </button>
                              <Link
                                to="/upload"
                                className="text-xs font-semibold text-neutral-500 hover:text-neutral-700"
                              >
                                Reenviar arquivo
                              </Link>
                            </div>
                            <p className="text-[11px] text-neutral-400">
                              Ações de reprocessamento/deleção exigem fluxo de upload completo ou permissões administrativas no backend.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {(pipeline.failed > 0 || pipeline.expired > 0 || pipeline.outbox_pending > 0) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Atenção no pipeline</p>
            <p className="text-sm text-amber-700">
              Falhas: {pipeline.failed} · Expirados: {pipeline.expired} · Outbox pendente: {pipeline.outbox_pending}
            </p>
          </div>
          <Link to="/admin" className="px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors">
            Ver Admin
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-glass">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-500" /> Por Status
          </h2>
          {statusData.length > 0 ? (
            <div className="space-y-3">
              {statusData.slice(0, 8).map((item: any, idx: number) => (
                <div key={item.status} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700 truncate max-w-[180px]">{item.status}</span>
                    <span className="text-sm font-bold text-neutral-900">{item.count} ({((Number(item.count) / totalStatus) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 group-hover:opacity-80" style={{ width: `${(Number(item.count) / totalStatus) * 100}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-neutral-500 text-sm text-center py-10">Nenhum dado disponivel</p>}
        </div>

        {/* Area Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-glass">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent-500" /> Por Area
          </h2>
          {areaData.length > 0 ? (
            <div className="space-y-3">
              {areaData.map((item: any) => (
                <div key={item.area_fazenda} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700 truncate max-w-[180px]">{item.area_fazenda}</span>
                    <span className="text-sm font-bold text-neutral-900">{item.count}</span>
                  </div>
                  <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500 group-hover:from-primary-500 group-hover:to-primary-700" style={{ width: `${(Number(item.count) / maxArea) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-neutral-500 text-sm text-center py-10">Nenhum dado disponivel</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-glass">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" /> Por Tema
          </h2>
          {temaData.length > 0 ? (
            <div className="space-y-3">
              {temaData.map((item: any) => (
                <div key={item.tema_principal} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700 truncate max-w-[180px]">{item.tema_principal}</span>
                    <span className="text-sm font-bold text-neutral-900">{item.count}</span>
                  </div>
                  <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full transition-all duration-500 group-hover:from-accent-500 group-hover:to-accent-700" style={{ width: `${(Number(item.count) / maxTema) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-neutral-500 text-sm text-center py-10">Nenhum dado disponivel</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-glass">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Uploads Recentes</h2>
            <p className="text-xs text-neutral-500">Busque no acervo inteiro ou veja os últimos uploads</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={recentSearch}
                onChange={(e) => setRecentSearch(e.target.value)}
                placeholder="Buscar no acervo..."
                className="rc-input pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <Link to="/busca" className="text-sm font-semibold text-neutral-600 hover:text-neutral-800">Abrir busca completa</Link>
            <Link to="/acervo" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">Ver todos</Link>
          </div>
        </div>
        {selectedRecentIds.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setAddModalOpen(true)} className="rc-button">
              Adicionar às Pastas Selecionadas
            </button>
            <button onClick={clearSelection} className="text-sm font-semibold text-neutral-500 hover:text-neutral-700">Limpar seleção</button>
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="shimmer rounded-2xl aspect-video" />)}
          </div>
        ) : quickItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickItems.map((item, idx) => (
              <div key={item.id} className="animate-fade-in relative" style={{ animationDelay: `${idx * 100}ms` }}>
                {debouncedSearch && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelected(Number(item.id)) }}
                    className="absolute top-2 left-2 z-10 bg-white/90 rounded-full p-1 shadow"
                  >
                    {selectedRecentIds.includes(Number(item.id)) ? (
                      <CheckSquare className="w-4 h-4 text-rc-green" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                )}
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-rc-text-muted mx-auto mb-4" />
            <p className="text-neutral-500">Nenhum item no acervo ainda</p>
            <Link to="/upload" className="text-primary-600 hover:underline mt-2 inline-block font-medium">Fazer primeiro upload</Link>
          </div>
        )}
        <AddToWorkspaceModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          selectedItemIds={selectedRecentIds}
          onCompleted={clearSelection}
        />
      </div>
    </div>
  )
}
