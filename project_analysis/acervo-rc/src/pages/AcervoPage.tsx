import { useState, useMemo, useEffect } from 'react'
import { useAcervoItems, useLocalidades } from '@/hooks/useQueries'
import { useDebounce } from '@/hooks/useDebounce'
import { FolderCard } from '@/components/FolderCard'
import { Breadcrumb } from '@/components/Breadcrumb'
import { MediaCard } from '@/components/MediaCard'
import { Folder, Search, Grid, LayoutGrid, FolderOpen, AlertTriangle } from 'lucide-react'

export function AcervoPage() {
  const [search, setSearch] = useState('')
  const [recentLimit, setRecentLimit] = useState(12)
  const [searchLimit, setSearchLimit] = useState(60)
  const [viewSize, setViewSize] = useState<'normal' | 'large'>('normal')
  const debouncedSearch = useDebounce(search, 400)
  const hasSearch = debouncedSearch.trim().length > 0
  const isTypingSearch = search.trim().length > 0
  
  // React Query - cache automático, sem refetch desnecessário
  const { data: localidades = [], isLoading: loading, error: localidadesError, refetch: refetchLocalidades } = useLocalidades()
  const { data: recentItems = [], isLoading: recentLoading, error: recentError, refetch: refetchRecent } = useAcervoItems('', recentLimit, !hasSearch)
  const { data: searchItems = [], isLoading: searchLoading, error: searchError, refetch: refetchSearch } = useAcervoItems(debouncedSearch, searchLimit, hasSearch)

  const filteredLocalidades = useMemo(() => 
    localidades.filter(l => l.name.toLowerCase().includes(search.toLowerCase())),
    [localidades, search]
  )

  const totalItems = useMemo(() => 
    localidades.reduce((acc, l) => acc + l.itemCount, 0),
    [localidades]
  )

  const activeItems = hasSearch ? searchItems : recentItems
  const itemsLoading = hasSearch ? searchLoading : recentLoading
  const itemsError = hasSearch ? searchError : recentError
  const currentLimit = hasSearch ? searchLimit : recentLimit

  useEffect(() => {
    if (hasSearch) {
      setSearchLimit(60)
    } else {
      setRecentLimit(12)
    }
  }, [hasSearch, debouncedSearch])

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <Breadcrumb items={[{ label: 'Acervo' }]} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-semibold text-rc-text tracking-wide">Acervo</h1>
          <p className="text-rc-text-muted mt-1">
            <span className="font-semibold text-rc-gold">{localidades.length}</span> localidades com{' '}
            <span className="font-semibold text-rc-gold">{totalItems}</span> materiais
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-rc-text-muted" />
            <input
              type="text"
              placeholder="Buscar no acervo (titulo, localidade, local, tema...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 bg-transparent text-rc-text border-b border-rc-border pl-8 pr-4 py-3 focus:outline-none focus:border-rc-gold placeholder:text-rc-text-muted"
            />
          </div>
          <button
            onClick={() => setViewSize(viewSize === 'normal' ? 'large' : 'normal')}
            className={`p-3 rounded-xl transition-all ${viewSize === 'large' ? 'bg-gradient-to-r from-rc-gold/90 to-amber-400 text-neutral-900 shadow-green' : 'glass text-rc-text-muted'}`}
            title={viewSize === 'normal' ? 'Cards grandes' : 'Cards normais'}
          >
            {viewSize === 'normal' ? <LayoutGrid className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Itens Recentes / Busca Global */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-rc-text">
            {isTypingSearch ? 'Resultados da busca' : 'Itens recentes'}
          </h2>
          {!isTypingSearch && (
            <span className="text-sm text-rc-text-muted">Últimas entradas do acervo</span>
          )}
        </div>

        {itemsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="shimmer rounded-2xl aspect-video" />
            ))}
          </div>
        ) : itemsError ? (
          <div className="p-5 glass-card border border-red-500/30">
            <div className="flex items-center gap-3 text-red-300 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-semibold">Não foi possível carregar os itens do acervo</p>
            </div>
            <p className="text-sm text-rc-text-muted mb-2">Verifique as permissões do banco, a conexão com o Supabase ou se há dados cadastrados.</p>
            <pre className="text-xs text-red-200 bg-red-950/50 rounded p-2 mb-2 overflow-x-auto">
              {itemsError?.message || String(itemsError)}
            </pre>
            <button
              onClick={() => (hasSearch ? refetchSearch() : refetchRecent())}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-200 font-medium hover:bg-red-500/20"
            >
              Tentar novamente
            </button>
          </div>
        ) : activeItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {activeItems.map((item, idx) => (
              <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card">
            <FolderOpen className="w-12 h-12 text-rc-text-muted mx-auto mb-4" />
            <p className="text-rc-text-muted">
              {hasSearch ? 'Nenhum item encontrado para esta busca' : 'Nenhum item no acervo ainda'}
            </p>
          </div>
        )}

        {activeItems.length >= currentLimit && !itemsLoading && !itemsError && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => hasSearch ? setSearchLimit(l => l + 40) : setRecentLimit(l => l + 12)}
              className="px-5 py-2.5 rounded-xl glass text-rc-text font-semibold hover:text-rc-gold"
            >
              Carregar mais
            </button>
          </div>
        )}
      </div>

      {/* Localidades */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-rc-text mb-4">Localidades</h2>
        {loading ? (
          <div className={`grid gap-6 ${viewSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="shimmer rounded-2xl aspect-[4/3]" />
            ))}
          </div>
        ) : localidadesError ? (
          <div className="p-5 glass-card border border-red-500/30">
            <div className="flex items-center gap-3 text-red-300 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-semibold">Não foi possível carregar as localidades</p>
            </div>
            <p className="text-sm text-rc-text-muted mb-2">Verifique as permissões do banco ou a função get_localidades_stats().</p>
            <pre className="text-xs text-red-200 bg-red-950/50 rounded p-2 mb-2 overflow-x-auto">
              {localidadesError?.message || String(localidadesError)}
            </pre>
            <button
              onClick={() => refetchLocalidades()}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-200 font-medium hover:bg-red-500/20"
            >
              Tentar novamente
            </button>
          </div>
        ) : filteredLocalidades.length > 0 ? (
          <div className={`grid gap-6 ${viewSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {filteredLocalidades.map((localidade, idx) => (
              <div key={localidade.slug} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <FolderCard {...localidade} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 flex items-center justify-center">
              <Folder className="w-12 h-12 text-rc-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-rc-text mb-2">Nenhuma localidade encontrada</h3>
            <p className="text-rc-text-muted">
              {search ? 'Tente buscar por outro termo' : 'Comece fazendo upload de materiais'}
            </p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-2 p-4 glass text-sm text-rc-text-muted text-center">
        Navegue pelas localidades para explorar os materiais do acervo. Clique em uma pasta para ver os itens.
      </div>
    </div>
  )
}
