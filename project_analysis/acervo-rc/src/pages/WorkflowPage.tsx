import { useState, useMemo, useEffect } from 'react'
import { useWorkflowItems, useUpdateItem, useDeleteItem } from '@/hooks/useQueries'
import { useTaxonomy, statusColors, statusKanbanOrder } from '@/hooks/useTaxonomy'
import { CatalogoItem } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { withCacheBuster } from '@/lib/media'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import { GripVertical, FileImage, FileVideo, File, ChevronLeft, ChevronRight, Filter, Users, Eye, Trash2 } from 'lucide-react'

type StatusColumn = { id: string; name: string; items: CatalogoItem[] }

export function WorkflowPage() {
  const { taxonomy } = useTaxonomy()
  const [filterResponsavel, setFilterResponsavel] = useState('')
  const [mobileColumnIndex, setMobileColumnIndex] = useState(0)
  const pageSize = 600
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)
  
  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useWorkflowItems({ responsavel: filterResponsavel || undefined }, pageSize)
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()

  useEffect(() => {
    if (!realtimeEnabled) return
    const channel = supabase.channel('workflow-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catalogo_itens' }, () => {
        refetch()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtimeEnabled, refetch])

  const statusIdByName = useMemo(() => {
    const map = new Map<string, string>()
    taxonomy.statusOptions.forEach(s => map.set(s.name, s.id))
    return map
  }, [taxonomy.statusOptions])

  const allItems = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data])

  const columns = useMemo<StatusColumn[]>(() => {
    if (!allItems.length) return statusKanbanOrder.map(s => ({ id: s, name: s, items: [] }))
    return statusKanbanOrder.map(status => ({
      id: status,
      name: status,
      items: allItems.filter(item => item.status === status)
    }))
  }, [allItems])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return

    const sourceCol = columns.find(c => c.id === source.droppableId)
    const draggedItem = sourceCol?.items.find(i => i.id.toString() === draggableId)
    if (!draggedItem) return

    const nextStatusName = destination.droppableId
    const nextStatusId = statusIdByName.get(nextStatusName)
    if (!nextStatusId) {
      toast.error('Status inválido para atualização')
      return
    }

    updateItem.mutate(
      {
        id: draggedItem.id,
        updates: {
          status_id: nextStatusId,
          status: nextStatusName,
        }
      },
      {
        onSuccess: () => toast.success('Status atualizado'),
        onError: () => toast.error('Falha ao atualizar status')
      }
    )
  }

  const moveItemToStatus = (item: CatalogoItem, direction: 'next' | 'prev') => {
    const currentIndex = statusKanbanOrder.indexOf(item.status || '')
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0 || newIndex >= statusKanbanOrder.length) return
    
    const nextStatus = statusKanbanOrder[newIndex]
    const nextStatusId = statusIdByName.get(nextStatus)
    if (!nextStatusId) {
      toast.error('Status inválido para atualização')
      return
    }
    updateItem.mutate(
      {
        id: item.id,
        updates: { status_id: nextStatusId, status: nextStatus }
      },
      {
        onSuccess: () => toast.success('Status atualizado'),
        onError: () => toast.error('Falha ao atualizar status')
      }
    )
  }

  const handleDeleteItem = async (item: CatalogoItem) => {
    const confirmed = window.confirm(`Excluir a mídia "${item.titulo}"?`)
    if (!confirmed) return
    try {
      await deleteItem.mutateAsync(item.id)
      toast.success('Mídia excluída')
    } catch {
      toast.error('Falha ao excluir a mídia')
    }
  }

  const getFileIcon = (tipo?: string) => {
    if (!tipo) return <File className="w-5 h-5 text-rc-text-muted" />
    if (tipo.startsWith('image')) return <FileImage className="w-5 h-5 text-emerald-200" />
    if (tipo.startsWith('video')) return <FileVideo className="w-5 h-5 text-amber-200" />
    return <File className="w-5 h-5 text-rc-text-muted" />
  }

  const getColumnStyle = (status: string) => {
    if (status.includes('Entrada') || status.includes('triagem')) return 'bg-neutral-900/50 border-amber-400/15'
    if (status.includes('Catalogado') || status.includes('revisao')) return 'bg-neutral-900/50 border-emerald-400/15'
    if (status.includes('Editado') || status.includes('producao')) return 'bg-neutral-900/50 border-amber-300/20'
    if (status.includes('Aprovado')) return 'bg-neutral-900/50 border-emerald-300/20'
    if (status.includes('Publicado')) return 'bg-neutral-900/50 border-emerald-400/30'
    if (status.includes('Arquivado')) return 'bg-neutral-900/50 border-white/10'
    return 'bg-neutral-900/50 border-white/5'
  }

  const totalItems = columns.reduce((acc, col) => acc + col.items.length, 0)
  const totalCount = data?.pages?.[0]?.totalCount ?? 0
  const currentColumn = columns[mobileColumnIndex]
  const hasMore = !!hasNextPage && totalItems < totalCount

  return (
    <div className="max-w-full animate-fade-in text-rc-text">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-semibold text-rc-text tracking-wide">Area de Trabalho</h1>
          <p className="text-rc-text-muted mt-1">{totalItems} materiais no fluxo - Arraste os cards para mudar status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 glass">
            <Filter className="w-4 h-4 text-rc-text-muted" />
            <select value={filterResponsavel} onChange={(e) => setFilterResponsavel(e.target.value)}
              className="bg-transparent text-sm font-medium text-rc-text focus:outline-none">
              <option value="">Todos os responsaveis</option>
              {taxonomy.responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 px-3 py-2.5 glass text-sm text-rc-text">
            <input
              type="checkbox"
              checked={realtimeEnabled}
              onChange={(e) => setRealtimeEnabled(e.target.checked)}
              className="accent-amber-400"
            />
            Realtime
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1,2,3,4,5].map(i => <div key={i} className="shimmer rounded-2xl w-72 h-96 flex-shrink-0" />)}
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-4 glass-card p-3">
              <button onClick={() => setMobileColumnIndex(i => Math.max(0, i - 1))} disabled={mobileColumnIndex === 0}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 min-h-[44px] min-w-[44px]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <p className="font-semibold text-rc-text">{currentColumn?.name}</p>
                <p className="text-xs text-rc-text-muted">{currentColumn?.items.length} itens - {mobileColumnIndex + 1}/{columns.length}</p>
              </div>
              <button onClick={() => setMobileColumnIndex(i => Math.min(columns.length - 1, i + 1))} disabled={mobileColumnIndex === columns.length - 1}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 min-h-[44px] min-w-[44px]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className={`rounded-2xl p-4 border-2 ${getColumnStyle(currentColumn?.name || '')}`}>
              <div className="space-y-3 min-h-[300px]">
                {currentColumn?.items.map((item) => (
                  <div key={item.id} className="glass-card p-4">
                    <div className="relative">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.titulo}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      ) : item.proxy_url ? (
                        <video
                          src={withCacheBuster(item.proxy_url, item.updated_at || item.created_at || item.id)}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      ) : item.arquivo_url && item.arquivo_tipo?.startsWith('image') ? (
                        <img
                          src={item.arquivo_url}
                          alt={item.titulo}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="w-full h-32 bg-neutral-900/60 rounded-lg mb-3 flex items-center justify-center">{getFileIcon(item.arquivo_tipo)}</div>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="absolute top-2 right-2 glass rounded-full p-1 text-red-200 hover:text-red-100"
                        title="Excluir mídia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-semibold text-rc-text truncate">{item.titulo}</p>
                    <p className="text-sm text-rc-text-muted truncate">{item.area_fazenda || 'Sem local'}</p>
                    {item.responsavel && <p className="text-xs text-rc-text-muted mt-1 flex items-center gap-1"><Users className="w-3 h-3" />{item.responsavel}</p>}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => moveItemToStatus(item, 'prev')} disabled={mobileColumnIndex === 0}
                        className="flex-1 py-2.5 px-3 glass rounded-xl text-sm font-medium text-rc-text-muted disabled:opacity-50">Voltar</button>
                      <Link to={`/item/${item.id}`} className="p-2.5 glass rounded-xl text-rc-text hover:text-amber-200"><Eye className="w-5 h-5" /></Link>
                      <button onClick={() => moveItemToStatus(item, 'next')} disabled={mobileColumnIndex === columns.length - 1}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-400 to-amber-300 rounded-xl text-sm font-medium text-neutral-900 disabled:opacity-50">Avancar</button>
                    </div>
                  </div>
                ))}
                {currentColumn?.items.length === 0 && <div className="text-center py-12 text-rc-text-muted">Nenhum item neste status</div>}
              </div>
            </div>
          </div>

          {/* Desktop Kanban with Drag and Drop */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="hidden lg:flex gap-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-shrink-0 w-72 rounded-2xl p-4 border-2 transition-colors ${getColumnStyle(column.name)} ${snapshot.isDraggingOver ? 'ring-2 ring-amber-300 border-amber-300/50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-rc-text text-sm truncate pr-2">{column.name}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[column.name] || 'bg-neutral-200 text-neutral-600'}`}>{column.items.length}</span>
                      </div>
                      <div className="space-y-3 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">
                        {column.items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`glass-card p-3 cursor-grab active:cursor-grabbing transition-all group ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-amber-300 rotate-2' : ''}`}
                              >
                                <div className="flex items-start gap-2">
                                  <GripVertical className="w-4 h-4 text-rc-text-muted mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="flex-1 min-w-0">
                                    <div className="relative">
                                      {item.thumbnail_url ? (
                                        <img
                                          src={item.thumbnail_url}
                                          alt={item.titulo}
                                          loading="lazy"
                                          decoding="async"
                                          className="w-full h-20 object-cover rounded-lg mb-2"
                                        />
                                      ) : item.proxy_url ? (
                                        <video
                                          src={withCacheBuster(item.proxy_url, item.updated_at || item.created_at || item.id)}
                                          muted
                                          playsInline
                                          preload="metadata"
                                          className="w-full h-20 object-cover rounded-lg mb-2"
                                        />
                                      ) : item.arquivo_url && item.arquivo_tipo?.startsWith('image') ? (
                                        <img
                                          src={item.arquivo_url}
                                          alt={item.titulo}
                                          loading="lazy"
                                          decoding="async"
                                          className="w-full h-20 object-cover rounded-lg mb-2"
                                        />
                                      ) : (
                                        <div className="w-full h-20 bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 rounded-lg mb-2 flex items-center justify-center">{getFileIcon(item.arquivo_tipo)}</div>
                                      )}
                                      <button
                                        onClick={() => handleDeleteItem(item)}
                                        className="absolute top-1 right-1 glass rounded-full p-1 text-red-200 hover:text-red-100"
                                        title="Excluir mídia"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <Link to={`/item/${item.id}`} className="font-medium text-sm text-rc-text truncate block hover:text-amber-200">{item.titulo}</Link>
                                    <p className="text-xs text-rc-text-muted truncate">{item.area_fazenda || 'Sem local'}</p>
                                    {item.responsavel && <p className="text-xs text-rc-text-muted mt-1 flex items-center gap-1"><Users className="w-3 h-3" />{item.responsavel}</p>}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-6 py-3 glass rounded-xl text-rc-text hover:text-amber-200 font-semibold disabled:opacity-60"
              >
                {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
