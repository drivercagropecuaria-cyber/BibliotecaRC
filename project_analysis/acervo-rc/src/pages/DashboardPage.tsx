import { useMemo } from 'react'
import { useDashboardMetrics } from '@/hooks/useQueries'
import { FolderOpen, Clock, CheckCircle, Archive, Plus, AlertTriangle, BarChart3, PieChart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MediaCard } from '@/components/MediaCard'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#ec4899']

export function DashboardPage() {
  // React Query - cache automático, sem refetch desnecessário
  const { data, isLoading: loading } = useDashboardMetrics()
  
  const metrics = data?.metrics || { total_itens: 0, pendentes: 0, aprovados: 0, publicados: 0 }
  const statusData = data?.statusData || []
  const areaData = data?.areaData || []
  const temaData = data?.temaData || []
  const recentItems = data?.recentItems || []

  // Cálculos memoizados
  const { maxArea, maxTema, totalStatus } = useMemo(() => {
    const maxArea = Math.max(...areaData.map((a: any) => Number(a.count)), 1)
    const maxTema = Math.max(...temaData.map((t: any) => Number(t.count)), 1)
    const totalStatus = statusData.reduce((acc: number, s: any) => acc + Number(s.count), 0) || 1
    return { maxArea, maxTema, totalStatus }
  }, [areaData, statusData, temaData])

  const mainCards = useMemo(() => [
    { label: 'Total de Itens', value: metrics.total_itens, icon: FolderOpen, gradient: 'from-primary-400 to-primary-600', shadow: 'shadow-green' },
    { label: 'Pendentes', value: metrics.pendentes, icon: Clock, gradient: 'from-amber-400 to-amber-600', shadow: 'shadow-[0_10px_40px_-10px_rgba(245,158,11,0.4)]' },
    { label: 'Aprovados', value: metrics.aprovados, icon: CheckCircle, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-green' },
    { label: 'Publicados', value: metrics.publicados, icon: Archive, gradient: 'from-accent-400 to-accent-600', shadow: 'shadow-blue' },
  ], [metrics])

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Visao geral do acervo de marketing</p>
        </div>
        <Link to="/upload" className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:shadow-green transition-all font-semibold">
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>Nova Importacao</span>
        </Link>
      </div>

      {metrics.pendentes > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">{metrics.pendentes} itens aguardando triagem</p>
            <p className="text-sm text-amber-700">Revisar e catalogar materiais pendentes</p>
          </div>
          <Link to="/workflow" className="px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors">
            Ver Workflow
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {mainCards.map((card, idx) => (
          <div key={card.label} className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-glass card-hover" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 ${card.shadow}`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-neutral-900">{card.value}</p>
            <p className="text-sm text-neutral-500">{card.label}</p>
          </div>
        ))}
      </div>

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Ultimos Uploads</h2>
          <Link to="/acervo" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">Ver todos</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="shimmer rounded-2xl aspect-video" />)}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentItems.map((item, idx) => (
              <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">Nenhum item no acervo ainda</p>
            <Link to="/upload" className="text-primary-600 hover:underline mt-2 inline-block font-medium">Fazer primeiro upload</Link>
          </div>
        )}
      </div>
    </div>
  )
}
