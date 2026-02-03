import { useState, useMemo, useEffect } from 'react'
import { useWorkflowItems, useUpdateItem } from '@/hooks/useQueries'
import { useTaxonomy, statusColors, statusKanbanOrder } from '@/hooks/useTaxonomy'
import { CatalogoItem } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, FileImage, FileVideo, File, ChevronLeft, ChevronRight, Filter, Users, Eye } from 'lucide-react'

type StatusColumn = { id: string; name: string; items: CatalogoItem[] }

export function WorkflowPage() {
  const { taxonomy } = useTaxonomy()
  const [filterResponsavel, setFilterResponsavel] = useState('')
  const [mobileColumnIndex, setMobileColumnIndex] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 600
  const [allItems, setAllItems] = useState<CatalogoItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  
  const { data, isLoading } = useWorkflowItems({ responsavel: filterResponsavel || undefined }, page, pageSize)
  const updateItem = useUpdateItem()

  useEffect(() => {
    if (!data) return
    setTotalCount(data.totalCount)
    setAllItems(prev => {
      if (page === 1) return data.items
      const existing = new Set(prev.map(i => i.id))
      const merged = [...prev]
      data.items.forEach(item => {
        if (!existing.has(item.id)) merged.push(item)
      })
      return merged
    })
  }, [data, page])

  useEffect(() => {
    setPage(1)
    setAllItems([])
  }, [filterResponsavel])

  const statusIdByName = useMemo(() => {
    const map = new Map<string, string>()
    taxonomy.statusOptions.forEach(s => map.set(s.name, s.id))
    return map
  }, [taxonomy.statusOptions])

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

    updateItem.mutate({
      id: draggedItem.id,
      updates: {
        status_id: statusIdByName.get(destination.droppableId),
        updated_at: new Date().toISOString()
      }
    })
  }

  const moveItemToStatus = (item: CatalogoItem, direction: 'next' | 'prev') => {
    const currentIndex = statusKanbanOrder.indexOf(item.status || '')
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0 || newIndex >= statusKanbanOrder.length) return
    
    const nextStatus = statusKanbanOrder[newIndex]
    updateItem.mutate({
      id: item.id,
      updates: { status_id: statusIdByName.get(nextStatus), updated_at: new Date().toISOString() }
    })
  }

  const getFileIcon = (tipo?: string) => {
    if (!tipo) return <File className="w-5 h-5 text-neutral-400" />
    if (tipo.startsWith('image')) return <FileImage className="w-5 h-5 text-accent-400" />
    if (tipo.startsWith('video')) return <FileVideo className="w-5 h-5 text-purple-400" />
    return <File className="w-5 h-5 text-neutral-400" />
  }

  const getColumnStyle = (status: string) => {
    if (status.includes('Entrada') || status.includes('triagem')) return 'bg-neutral-100 border-neutral-200'
    if (status.includes('Catalogado') || status.includes('revisao')) return 'bg-blue-50 border-blue-200'
    if (status.includes('Editado') || status.includes('producao')) return 'bg-amber-50 border-amber-200'
    if (status.includes('Aprovado')) return 'bg-primary-50 border-primary-200'
    if (status.includes('Publicado')) return 'bg-green-50 border-green-200'
    if (status.includes('Arquivado')) return 'bg-neutral-200 border-neutral-300'
    return 'bg-neutral-100 border-neutral-200'
  }

  const totalItems = columns.reduce((acc, col) => acc + col.items.length, 0)
  const currentColumn = columns[mobileColumnIndex]
  const hasMore = totalItems < totalCount

  return (
    <div className="max-w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-neutral-900">Workflow</h1>
          <p className="text-neutral-500 mt-1">{totalItems} materiais no fluxo - Arraste os cards para mudar status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-glass">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select value={filterResponsavel} onChange={(e) => setFilterResponsavel(e.target.value)}
              className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none">
              <option value="">Todos os responsaveis</option>
              {taxonomy.responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
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
            <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 shadow-glass">
              <button onClick={() => setMobileColumnIndex(i => Math.max(0, i - 1))} disabled={mobileColumnIndex === 0}
                className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 min-h-[44px] min-w-[44px]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <p className="font-semibold text-neutral-900">{currentColumn?.name}</p>
                <p className="text-xs text-neutral-500">{currentColumn?.items.length} itens - {mobileColumnIndex + 1}/{columns.length}</p>
              </div>
              <button onClick={() => setMobileColumnIndex(i => Math.min(columns.length - 1, i + 1))} disabled={mobileColumnIndex === columns.length - 1}
                className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 min-h-[44px] min-w-[44px]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className={`rounded-2xl p-4 border-2 ${getColumnStyle(currentColumn?.name || '')}`}>
              <div className="space-y-3 min-h-[300px]">
                {currentColumn?.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-4 shadow-glass">
                    {item.arquivo_url && item.arquivo_tipo?.startsWith('image') ? (
                      <img src={item.arquivo_url} alt={item.titulo} className="w-full h-32 object-cover rounded-lg mb-3" />
                    ) : (
                      <div className="w-full h-32 bg-neutral-100 rounded-lg mb-3 flex items-center justify-center">{getFileIcon(item.arquivo_tipo)}</div>
                    )}
                    <p className="font-semibold text-neutral-900 truncate">{item.titulo}</p>
                    <p className="text-sm text-neutral-500 truncate">{item.area_fazenda || 'Sem local'}</p>
                    {item.responsavel && <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><Users className="w-3 h-3" />{item.responsavel}</p>}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => moveItemToStatus(item, 'prev')} disabled={mobileColumnIndex === 0}
                        className="flex-1 py-2.5 px-3 bg-neutral-100 rounded-xl text-sm font-medium text-neutral-600 disabled:opacity-50">Voltar</button>
                      <Link to={`/item/${item.id}`} className="p-2.5 bg-neutral-100 rounded-xl text-neutral-600 hover:bg-neutral-200"><Eye className="w-5 h-5" /></Link>
                      <button onClick={() => moveItemToStatus(item, 'next')} disabled={mobileColumnIndex === columns.length - 1}
                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-sm font-medium text-white disabled:opacity-50">Avancar</button>
                    </div>
                  </div>
                ))}
                {currentColumn?.items.length === 0 && <div className="text-center py-12 text-neutral-500">Nenhum item neste status</div>}
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
                      className={`flex-shrink-0 w-72 rounded-2xl p-4 border-2 transition-colors ${getColumnStyle(column.name)} ${snapshot.isDraggingOver ? 'ring-2 ring-primary-400 border-primary-300' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-neutral-900 text-sm truncate pr-2">{column.name}</h3>
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
                                className={`bg-white rounded-xl p-3 shadow-glass cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary-400 rotate-2' : ''}`}
                              >
                                <div className="flex items-start gap-2">
                                  <GripVertical className="w-4 h-4 text-neutral-300 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="flex-1 min-w-0">
                                    {item.arquivo_url && item.arquivo_tipo?.startsWith('image') ? (
                                      <img src={item.arquivo_url} alt={item.titulo} className="w-full h-20 object-cover rounded-lg mb-2" />
                                    ) : (
                                      <div className="w-full h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg mb-2 flex items-center justify-center">{getFileIcon(item.arquivo_tipo)}</div>
                                    )}
                                    <Link to={`/item/${item.id}`} className="font-medium text-sm text-neutral-900 truncate block hover:text-primary-600">{item.titulo}</Link>
                                    <p className="text-xs text-neutral-500 truncate">{item.area_fazenda || 'Sem local'}</p>
                                    {item.responsavel && <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1"><Users className="w-3 h-3" />{item.responsavel}</p>}
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
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold"
              >
                Carregar mais
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
