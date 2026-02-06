import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';

// Types
export interface CatalogItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tags: string[];
  arquivo_url: string;
  thumbnail_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  is_active: boolean;
  status?: 'ativo' | 'inativo' | 'archived';
}

export interface FilterOptions {
  categoria?: string;
  tags?: string[];
  search?: string;
  status?: string;
  sortBy?: 'recent' | 'popular' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

// Constants
const QUERY_KEYS = {
  catalog: 'catalog',
  catalogItem: 'catalogItem',
  search: 'search',
  categories: 'categories',
  tags: 'tags',
  collections: 'collections',
};

// CRUD Hooks

/**
 * Hook para listar todos os itens do catálogo com paginação e filtros
 */
export function useCatalogList(filters?: FilterOptions, pagination?: PaginationOptions) {
  const pageSize = pagination?.pageSize || 20;
  const offset = pagination?.offset || 0;

  return useQuery({
    queryKey: [QUERY_KEYS.catalog, filters, offset],
    queryFn: async () => {
      let query = supabase.from('catalogo_itens').select('*', { count: 'exact' });

      // Filtros de soft-delete: apenas itens ativos
      query = query.is('deleted_at', null).eq('is_active', true);

      // Aplicar filtros
      if (filters?.categoria) {
        query = query.eq('categoria', filters.categoria);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.ilike('titulo', `%${filters.search}%`);
      }

      // Ordenação
      const orderColumn = filters?.sortBy === 'recent' ? 'created_at' : 'titulo';
      const ascending = filters?.sortOrder === 'asc';
      query = query.order(orderColumn, { ascending });

      // Paginação
      const { data, error, count } = await query.range(offset, offset + pageSize - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para busca por texto full-text
 */
export function useCatalogSearch(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.search, searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const { data, error } = await supabase.rpc('search_catalogo', {
        search_term: searchTerm,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && searchTerm.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para carregar um único item do catálogo
 */
export function useCatalogItem(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.catalogItem, id],
    queryFn: async () => {
      if (!id) throw new Error('ID é obrigatório');

      const { data, error } = await supabase
        .from('catalogo_itens')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as CatalogItem;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para criar novo item no catálogo
 */
export function useCreateCatalogItem() {
  return useMutation({
    mutationFn: async (item: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('catalogo_itens')
        .insert([{ ...item, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as CatalogItem;
    },
  });
}

/**
 * Hook para atualizar um item do catálogo
 */
export function useUpdateCatalogItem() {
  return useMutation({
    mutationFn: async (item: Partial<CatalogItem> & { id: string }) => {
      const { id, ...updates } = item;

      const { data, error } = await supabase
        .from('catalogo_itens')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CatalogItem;
    },
  });
}

/**
 * Hook para deletar um item do catálogo (soft delete)
 */
export function useDeleteCatalogItem() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('catalogo_itens')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CatalogItem;
    },
  });
}

/**
 * Hook para listar categorias disponíveis
 */
export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogo_itens')
        .select('categoria')
        .is('deleted_at', null)
        .eq('is_active', true)
        .neq('categoria', null)
        .order('categoria');

      if (error) throw error;

      // Deduplica categorias
      const categories = new Set(data?.map((item) => item.categoria).filter(Boolean));
      return Array.from(categories).sort();
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}

/**
 * Hook para listar tags populares
 */
export function useTags() {
  return useQuery({
    queryKey: [QUERY_KEYS.tags],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogo_itens')
        .select('tags')
        .is('deleted_at', null)
        .eq('is_active', true)
        .neq('tags', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Deduplica tags com contagem
      const tagMap = new Map<string, number>();
      data?.forEach((item) => {
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          });
        }
      });

      return Array.from(tagMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ tag, count }));
    },
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook para listar coleções do usuário
 */
export function useUserCollections() {
  return useQuery({
    queryKey: [QUERY_KEYS.collections],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar nova coleção
 */
export function useCreateCollection() {
  return useMutation({
    mutationFn: async (collection: { nome: string; is_public: boolean }) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('collections')
        .insert([{ ...collection, user_id: user.id, catalogo_ids: [] }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook para adicionar item à coleção
 */
export function useAddToCollection() {
  return useMutation({
    mutationFn: async ({
      collectionId,
      catalogoId,
    }: {
      collectionId: string;
      catalogoId: string;
    }) => {
      const { data: collection, error: fetchError } = await supabase
        .from('collections')
        .select('catalogo_ids')
        .eq('id', collectionId)
        .single();

      if (fetchError) throw fetchError;

      const currentIds = collection?.catalogo_ids || [];
      if (currentIds.includes(catalogoId)) {
        return collection; // Já está na coleção
      }

      const { data, error } = await supabase
        .from('collections')
        .update({ catalogo_ids: [...currentIds, catalogoId] })
        .eq('id', collectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook para paginação infinita (scroll infinito)
 */
export function useCatalogInfinite(filters?: FilterOptions) {
  const pageSize = 20;

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.catalog, 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase.from('catalogo_itens').select('*', { count: 'exact' });
        query = query.is('deleted_at', null).eq('is_active', true);

      if (filters?.categoria) {
        query = query.eq('categoria', filters.categoria);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error, count } = await query
        .range(pageParam, pageParam + pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.data.length, 0);
      return loadedCount < (lastPage.count || 0) ? loadedCount : undefined;
    },
    initialPageParam: 0,
  });
}
