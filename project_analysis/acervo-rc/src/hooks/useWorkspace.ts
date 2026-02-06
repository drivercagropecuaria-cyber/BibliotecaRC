import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, CatalogoItem } from '@/lib/supabase'

const workspaceKeys = {
  folders: ['workspaceFolders'] as const,
  items: (folderId?: string | null) => ['workspaceItems', folderId] as const,
}

export function useWorkspaceFolders() {
  return useQuery({
    queryKey: workspaceKeys.folders,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_folders')
        .select('id,name,created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    staleTime: 30000,
  })
}

export function useWorkspaceItems(folderId?: string | null) {
  return useQuery({
    queryKey: workspaceKeys.items(folderId),
    queryFn: async () => {
      if (!folderId) return { items: [] as CatalogoItem[], itemIds: [] as number[] }

      const { data: linkData, error: linkError } = await supabase
        .from('workspace_folder_items')
        .select('item_id,added_at')
        .eq('folder_id', folderId)
        .order('added_at', { ascending: false })

      if (linkError) throw linkError
      const itemIds = (linkData || []).map((row) => Number(row.item_id)).filter(Boolean)
      if (itemIds.length === 0) return { items: [] as CatalogoItem[], itemIds: [] as number[] }

      const { data: itemsData, error: itemsError } = await supabase
        .from('v_catalogo_completo')
        .select('id,titulo,arquivo_url,proxy_url,arquivo_tipo,thumbnail_url,status:status_nome,area_fazenda:area_fazenda_nome,tema_principal:tema_principal_nome,ponto:ponto_nome,created_at')
        .in('id', itemIds)

      if (itemsError) throw itemsError

      const itemsMap = new Map<number, CatalogoItem>()
      ;(itemsData || []).forEach((item: any) => itemsMap.set(Number(item.id), item as CatalogoItem))

      const orderedItems = itemIds.map((id) => itemsMap.get(id)).filter(Boolean) as CatalogoItem[]
      return { items: orderedItems, itemIds }
    },
    enabled: !!folderId,
    staleTime: 30000,
  })
}

export function useCreateWorkspaceFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData?.user?.id
      if (!userId) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('workspace_folders')
        .insert({ name, user_id: userId })
        .select('id,name,created_at')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.folders })
    }
  })
}

export function useAddItemsToFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { folderId: string; itemIds: number[] }) => {
      const { data, error } = await supabase.rpc('workspace_add_items', {
        p_folder_id: payload.folderId,
        p_item_ids: payload.itemIds,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.items(variables.folderId) })
    }
  })
}

export function useRemoveItemsFromFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { folderId: string; itemIds: number[] }) => {
      const { data, error } = await supabase.rpc('workspace_remove_items', {
        p_folder_id: payload.folderId,
        p_item_ids: payload.itemIds,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.items(variables.folderId) })
    }
  })
}

export function useDeleteWorkspaceFolder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from('workspace_folders')
        .delete()
        .eq('id', folderId)
      if (error) throw error
      return folderId
    },
    onSuccess: (folderId) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.folders })
      queryClient.invalidateQueries({ queryKey: workspaceKeys.items(folderId) })
    }
  })
}
