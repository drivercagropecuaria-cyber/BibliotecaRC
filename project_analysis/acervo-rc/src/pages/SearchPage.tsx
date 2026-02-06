import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, CheckSquare, Square, FolderPlus } from 'lucide-react'
import { useGlobalSearchItems } from '@/hooks/useQueries'
import { AddToWorkspaceModal } from '@/components/AddToWorkspaceModal'
import type { CatalogoItem } from '@/lib/supabase'

const PAGE_SIZE = 24

function SearchResultCard({ item, selected, onToggle }: { item: CatalogoItem; selected: boolean; onToggle: () => void }) {
  const navigate = useNavigate()
  const isImage = item.arquivo_tipo?.startsWith('image')
  const isVideo = item.arquivo_tipo?.startsWith('video')
  const imageUrl = item.thumbnail_url || item.arquivo_url

  return (
    <div className="relative glass-card overflow-hidden cursor-pointer group" onClick={() => navigate(`/item/${item.id}`)}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        className="absolute top-3 left-3 z-10 glass rounded-full p-1"
      >
        {selected ? <CheckSquare className="w-5 h-5 text-rc-gold" /> : <Square className="w-5 h-5 text-rc-text-muted" />}
      </button>
      <div className="aspect-video bg-neutral-950/40">
        {imageUrl && (isImage || isVideo) ? (
          <img src={imageUrl} alt={item.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rc-text-muted text-sm">Sem previa</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-rc-text truncate">{item.titulo}</h3>
        <p className="text-xs text-rc-text-muted truncate">{item.area_fazenda || item.ponto || '-'}</p>
      </div>
    </div>
  )
}

export function SearchPage() {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [onlyVideos, setOnlyVideos] = useState(true)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debounced, onlyVideos])

  const { data, isLoading, error } = useGlobalSearchItems({
    searchTerm: debounced,
    onlyVideos,
    page,
    limit: PAGE_SIZE,
  })

  const items = data?.items || []
  const totalCount = data?.totalCount || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedIds([])

  const hasSelection = selectedIds.length > 0

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-semibold text-rc-text tracking-wide">Busca Global</h1>
          <p className="text-rc-text-muted mt-1">Encontre itens em todo o acervo</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-rc-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no acervo..."
              className="w-full bg-transparent text-rc-text border-b border-rc-border pl-8 pr-4 py-3 focus:outline-none focus:border-rc-gold placeholder:text-rc-text-muted"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-rc-text-muted">
            <input type="checkbox" checked={onlyVideos} onChange={(e) => setOnlyVideos(e.target.checked)} />
            Somente vídeos
          </label>
        </div>

        {hasSelection && (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button onClick={() => setModalOpen(true)} className="rc-button">
              <FolderPlus className="w-4 h-4" />
              Adicionar às Pastas Selecionadas
            </button>
            <button onClick={clearSelection} className="text-sm font-semibold text-rc-text-muted hover:text-amber-200">Limpar selecao</button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="shimmer rounded-2xl aspect-video" />)}
        </div>
      ) : error ? (
        <div className="p-4 glass-card text-red-300 border border-red-500/30">Falha ao buscar itens.</div>
      ) : items.length === 0 ? (
        <div className="p-6 glass-card text-rc-text-muted">Nenhum item encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <SearchResultCard
              key={item.id}
              item={item}
              selected={selectedIds.includes(Number(item.id))}
              onToggle={() => toggleSelected(Number(item.id))}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="text-sm font-semibold text-rc-text-muted hover:text-amber-200 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-xs text-rc-text-muted">Pagina {page} de {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="text-sm font-semibold text-rc-text-muted hover:text-amber-200 disabled:opacity-50"
        >
          Próximo
        </button>
      </div>

      <AddToWorkspaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedItemIds={selectedIds}
        onCompleted={clearSelection}
      />
    </div>
  )
}
