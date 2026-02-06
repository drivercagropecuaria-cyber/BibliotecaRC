import { useMemo, useState } from 'react'
import { withCacheBuster } from '@/lib/media'
import JSZip from 'jszip'
import { FolderPlus, Trash2, Download } from 'lucide-react'
import { useWorkspaceFolders, useWorkspaceItems, useCreateWorkspaceFolder, useRemoveItemsFromFolder, useDeleteWorkspaceFolder } from '@/hooks/useWorkspace'
import type { CatalogoItem } from '@/lib/supabase'

function getFileExtension(item: CatalogoItem) {
  const name = item.arquivo_nome || ''
  const url = item.arquivo_url || ''
  const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
  const nameMatch = name.match(/\.([a-zA-Z0-9]+)$/)

  if (urlMatch) return urlMatch[1]
  if (nameMatch) return nameMatch[1]

  const mime = item.arquivo_tipo || ''
  if (mime.includes('/')) return mime.split('/')[1]
  return 'bin'
}

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]+/g, '_').substring(0, 80)
}

export function WorkspacePage() {
  const {
    data: folders = [],
    isLoading: foldersLoading,
    error: foldersError,
  } = useWorkspaceFolders()
  const createFolder = useCreateWorkspaceFolder()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const {
    data: itemsData,
    isLoading: itemsLoading,
    error: itemsError,
  } = useWorkspaceItems(selectedFolderId)
  const items = itemsData?.items || []

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' })
  const [failures, setFailures] = useState<string[]>([])

  const removeItems = useRemoveItemsFromFolder()
  const deleteFolder = useDeleteWorkspaceFolder()

  const canRemove = selectedIds.length > 0 && !!selectedFolderId

  const selectedFolder = useMemo(() => folders.find((f: any) => f.id === selectedFolderId), [folders, selectedFolderId])

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const clearSelection = () => setSelectedIds([])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    const created = await createFolder.mutateAsync(newFolderName.trim())
    if (created?.id) {
      setSelectedFolderId(created.id)
      setNewFolderName('')
    }
  }

  const handleRemoveSelected = async () => {
    if (!selectedFolderId || selectedIds.length === 0) return
    await removeItems.mutateAsync({ folderId: selectedFolderId, itemIds: selectedIds })
    clearSelection()
  }

  const handleDeleteFolder = async (folderId: string) => {
    const target = folders.find((f: any) => f.id === folderId)
    const confirmed = window.confirm(`Excluir a pasta "${target?.name || 'Sem nome'}"?`) 
    if (!confirmed) return
    await deleteFolder.mutateAsync(folderId)
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null)
      clearSelection()
    }
  }

  const downloadZip = async (onlySelected = false) => {
    if (!selectedFolder) return
    const list = onlySelected ? items.filter((i) => selectedIds.includes(Number(i.id))) : items
    if (list.length === 0) return

    setDownloading(true)
    setProgress({ current: 0, total: list.length, status: '' })
    setFailures([])

    const zip = new JSZip()
    let completed = 0

    for (const item of list) {
      const url = item.arquivo_url
      if (!url) {
        setFailures((prev) => [...prev, item.titulo || String(item.id)])
        completed += 1
        setProgress({ current: completed, total: list.length, status: 'Sem URL' })
        continue
      }

      try {
        setProgress({ current: completed, total: list.length, status: item.titulo || 'Baixando...' })
        const response = await fetch(url)
        if (!response.ok) throw new Error('Falha no download')
        const blob = await response.blob()
        const ext = getFileExtension(item)
        const safeName = sanitizeName(item.titulo || `item_${item.id}`)
        zip.file(`${safeName}.${ext}`, blob)
      } catch {
        setFailures((prev) => [...prev, item.titulo || String(item.id)])
      } finally {
        completed += 1
        setProgress({ current: completed, total: list.length, status: '' })
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const date = new Date().toISOString().slice(0, 10)
    const zipName = `area-de-trabalho_${sanitizeName(selectedFolder.name)}_${date}.zip`

    const link = document.createElement('a')
    link.href = URL.createObjectURL(content)
    link.download = zipName
    link.click()
    URL.revokeObjectURL(link.href)

    setDownloading(false)
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in text-rc-text">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-semibold text-rc-text tracking-wide">Pastas Selecionadas</h1>
          <p className="text-rc-text-muted mt-1">Organize itens em pastas e baixe em lote</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 glass-card p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-rc-text">Pastas</h3>
            {foldersLoading ? (
              <p className="text-xs text-rc-text-muted mt-2">Carregando...</p>
            ) : foldersError ? (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
                Não foi possível carregar as pastas.
                <div className="mt-2 text-[11px] text-red-200/80 break-words">
                  {(foldersError as Error).message || String(foldersError)}
                </div>
              </div>
            ) : folders.length === 0 ? (
              <p className="text-xs text-rc-text-muted mt-2">Nenhuma pasta criada.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {folders.map((folder: any) => (
                  <div
                    key={folder.id}
                    className={`w-full px-3 py-2 rounded-xl text-sm flex items-center gap-2 ${selectedFolderId === folder.id ? 'bg-emerald-500/20 text-emerald-200' : 'bg-neutral-900/40 text-rc-text'}`}
                  >
                    <button
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex-1 text-left"
                    >
                      {folder.name}
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className={`p-1 rounded-lg ${selectedFolderId === folder.id ? 'text-emerald-200/80 hover:text-emerald-200' : 'text-rc-text-muted hover:text-rc-text'}`}
                      title="Excluir pasta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <label className="text-xs font-semibold text-rc-text-muted">Nova pasta</label>
            <div className="flex gap-2 mt-2">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 bg-neutral-900/50 text-rc-text border border-rc-border rounded-xl px-3 py-2 focus:outline-none focus:border-rc-gold"
                placeholder="Nome da pasta"
              />
              <button
                onClick={handleCreateFolder}
                className="glass"
                disabled={!newFolderName.trim() || createFolder.isPending}
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-rc-text">Itens da pasta</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadZip(false)}
                className="glass"
                disabled={!selectedFolderId || items.length === 0 || downloading}
              >
                <Download className="w-4 h-4" />
                Baixar ZIP
              </button>
              <button
                onClick={() => downloadZip(true)}
                className="rc-button"
                disabled={!selectedFolderId || selectedIds.length === 0 || downloading}
              >
                Baixar selecionados
              </button>
              <button
                onClick={handleRemoveSelected}
                className="text-sm font-semibold text-rc-text-muted hover:text-amber-200"
                disabled={!canRemove}
              >
                <Trash2 className="w-4 h-4 inline-block" /> Remover selecionados
              </button>
            </div>
          </div>

          {downloading && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-200">
              Baixando {progress.current}/{progress.total} — {progress.status}
            </div>
          )}

          {failures.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-200">
              Falhas em: {failures.join(', ')}
            </div>
          )}

          {itemsLoading ? (
            <div className="p-6 text-neutral-500">Carregando...</div>
          ) : itemsError ? (
            <div className="p-6 text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl">
              Não foi possível carregar os itens da pasta.
              <div className="mt-2 text-xs text-red-200/80 break-words">
                {(itemsError as Error).message || String(itemsError)}
              </div>
            </div>
          ) : !selectedFolderId ? (
            <div className="p-6 text-rc-text-muted">Selecione uma pasta para ver os itens.</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-rc-text-muted">Nenhum item nesta pasta.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="glass-card overflow-hidden">
                  <div className="relative">
                    <button
                      onClick={() => toggleSelected(Number(item.id))}
                      className="absolute top-2 left-2 z-10 glass rounded-full p-1"
                    >
                      {selectedIds.includes(Number(item.id)) ? (
                        <span className="text-amber-200 text-xs font-bold">✓</span>
                      ) : (
                        <span className="text-rc-text-muted text-xs font-bold">○</span>
                      )}
                    </button>
                    <div className="aspect-video bg-neutral-900/50">
                      {(item.thumbnail_url || item.proxy_url || item.arquivo_url) ? (
                        <img
                          src={item.thumbnail_url || withCacheBuster(item.proxy_url, item.created_at || item.id) || item.arquivo_url || ''}
                          alt={item.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-rc-text-muted text-sm">Sem prévia</div>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-rc-text truncate">{item.titulo}</h4>
                    <p className="text-xs text-rc-text-muted truncate">{item.area_fazenda || item.ponto || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
