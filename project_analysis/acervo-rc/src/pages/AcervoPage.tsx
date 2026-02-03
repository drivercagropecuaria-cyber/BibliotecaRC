import { useState, useMemo } from 'react'
import { useLocalidades } from '@/hooks/useQueries'
import { FolderCard } from '@/components/FolderCard'
import { Breadcrumb } from '@/components/Breadcrumb'
import { Folder, Search, Grid, LayoutGrid } from 'lucide-react'

export function AcervoPage() {
  const [search, setSearch] = useState('')
  const [viewSize, setViewSize] = useState<'normal' | 'large'>('normal')
  
  // React Query - cache automático, sem refetch desnecessário
  const { data: localidades = [], isLoading: loading } = useLocalidades()

  const filteredLocalidades = useMemo(() => 
    localidades.filter(l => l.name.toLowerCase().includes(search.toLowerCase())),
    [localidades, search]
  )

  const totalItems = useMemo(() => 
    localidades.reduce((acc, l) => acc + l.itemCount, 0),
    [localidades]
  )

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <Breadcrumb items={[{ label: 'Acervo' }]} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-neutral-900">Acervo</h1>
          <p className="text-neutral-500 mt-1">
            <span className="font-semibold text-primary-600">{localidades.length}</span> localidades com{' '}
            <span className="font-semibold text-primary-600">{totalItems}</span> materiais
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar localidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-12 pr-4 py-3 border-2 border-neutral-100 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white shadow-glass"
            />
          </div>
          <button
            onClick={() => setViewSize(viewSize === 'normal' ? 'large' : 'normal')}
            className={`p-3 rounded-xl transition-all ${viewSize === 'large' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-green' : 'bg-white text-neutral-600 shadow-glass'}`}
            title={viewSize === 'normal' ? 'Cards grandes' : 'Cards normais'}
          >
            {viewSize === 'normal' ? <LayoutGrid className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Grid de Localidades */}
      {loading ? (
        <div className={`grid gap-6 ${viewSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="shimmer rounded-2xl aspect-[4/3]" />
          ))}
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
        <div className="text-center py-20 bg-white rounded-2xl shadow-glass">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
            <Folder className="w-12 h-12 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Nenhuma localidade encontrada</h3>
          <p className="text-neutral-500">
            {search ? 'Tente buscar por outro termo' : 'Comece fazendo upload de materiais'}
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-neutral-50 rounded-2xl text-sm text-neutral-500 text-center">
        Navegue pelas localidades para explorar os materiais do acervo. Clique em uma pasta para ver os itens.
      </div>
    </div>
  )
}
