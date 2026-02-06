import { useEffect, useMemo, useState } from 'react'
import { useWorkspaceFolders, useCreateWorkspaceFolder, useAddItemsToFolder } from '@/hooks/useWorkspace'

interface AddToWorkspaceModalProps {
  open: boolean
  onClose: () => void
  selectedItemIds: number[]
  onCompleted?: () => void
}

export function AddToWorkspaceModal({ open, onClose, selectedItemIds, onCompleted }: AddToWorkspaceModalProps) {
  const { data: folders = [], isLoading } = useWorkspaceFolders()
  const createFolder = useCreateWorkspaceFolder()
  const addItems = useAddItemsToFolder()
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [newFolderName, setNewFolderName] = useState('')

  useEffect(() => {
    if (!open) return
    setSelectedFolderId('')
    setNewFolderName('')
  }, [open])

  const canSubmit = useMemo(() => selectedFolderId && selectedItemIds.length > 0, [selectedFolderId, selectedItemIds.length])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    const created = await createFolder.mutateAsync(newFolderName.trim())
    if (created?.id) {
      setSelectedFolderId(created.id)
      setNewFolderName('')
    }
  }

  const handleAddItems = async () => {
    if (!canSubmit) return
    await addItems.mutateAsync({ folderId: selectedFolderId, itemIds: selectedItemIds })
    onCompleted?.()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg glass-card p-6 text-rc-text">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-rc-text">Adicionar às Pastas Selecionadas</h2>
          <button onClick={onClose} className="text-sm text-rc-text-muted hover:text-amber-200">Fechar</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-rc-text-muted">Selecione uma pasta</label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="rc-input w-full mt-2"
              disabled={isLoading}
            >
              <option value="">Escolha...</option>
              {folders.map((folder: any) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-white/5 pt-4">
            <label className="text-sm font-medium text-rc-text-muted">Criar nova pasta</label>
            <div className="flex gap-2 mt-2">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="rc-input flex-1"
                placeholder="Nome da pasta"
              />
              <button
                onClick={handleCreateFolder}
                className="rc-button-secondary"
                disabled={!newFolderName.trim() || createFolder.isPending}
              >
                Criar
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="text-sm font-semibold text-rc-text-muted hover:text-amber-200">Cancelar</button>
            <button
              onClick={handleAddItems}
              className="rc-button"
              disabled={!canSubmit || addItems.isPending}
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
