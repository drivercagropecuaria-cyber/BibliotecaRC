import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/common/Navbar';
import SearchBar from '../components/library/SearchBar';
import FilterPanel from '../components/library/FilterPanel';
import ItemCard from '../components/library/ItemCard';
import ItemDetail from '../components/library/ItemDetail';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import TagCloud from '../components/common/TagCloud';
import {
  useCatalogList,
  useCatalogSearch,
  useCatalogItem,
  useCategories,
  useTags,
  useDeleteCatalogItem,
  type CatalogItem,
  type FilterOptions,
} from '../hooks/useApi';
import styles from './BibliotecaDigital.module.css';

type ViewType = 'grid' | 'list' | 'compact';

export const BibliotecaDigital: React.FC = () => {
  const queryClient = useQueryClient();

  // Estado de visualização
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);

  // Estado de busca
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  // Estado de detalhe
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: tagsData = [], isLoading: tagsLoading } = useTags();
  const { data: searchResults = [], isLoading: searchLoading } = useCatalogSearch(
    searchTerm,
    true
  );
  const { data: catalogData, isLoading: catalogLoading } = useCatalogList(filters, {
    pageSize: 20,
    offset: (currentPage - 1) * 20,
  });
  const { data: selectedItemData, isLoading: itemLoading } = useCatalogItem(
    detailModalOpen ? selectedItem?.id : undefined
  );

  // Mutations
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteCatalogItem();

  // Handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    handleFilterChange({ ...filters, tags: [tag] });
    setTagsModalOpen(false);
  }, [filters, handleFilterChange]);

  const handleSelectItem = useCallback((item: CatalogItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  }, []);

  const handleDeleteItem = useCallback(
    (id: string) => {
      deleteItem(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['catalog'] });
          setDetailModalOpen(false);
          setSelectedItem(null);
        },
      });
    },
    [deleteItem, queryClient]
  );

  // Dados de exibição
  const displayData = searchTerm ? searchResults : catalogData?.data || [];
  const totalPages = searchTerm
    ? Math.ceil((searchResults?.length || 0) / 20)
    : Math.ceil((catalogData?.count || 0) / 20);

  const isLoading = catalogLoading || searchLoading || categoriesLoading;
  const isEmpty = !isLoading && displayData.length === 0;

  return (
    <div className={styles.page}>
      <Navbar
        title="📚 Biblioteca Digital RC"
        onLogoClick={() => {
          setSearchTerm('');
          setFilters({});
          setCurrentPage(1);
        }}
      />

      <div className={styles.container}>
        {/* Header com controles */}
        <div className={styles.header}>
          <div className={styles.searchSection}>
            <SearchBar
              onSearch={handleSearch}
              placeholder="🔍 Buscar por título, categoria, tags..."
              debounceMs={300}
              showAdvanced={true}
              onAdvancedClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
            />
          </div>

          <div className={styles.controls}>
            <button
              className={`${styles.viewButton} ${viewType === 'grid' ? styles.active : ''}`}
              onClick={() => setViewType('grid')}
              title="Grid view"
            >
              ⬜ Grid
            </button>
            <button
              className={`${styles.viewButton} ${viewType === 'list' ? styles.active : ''}`}
              onClick={() => setViewType('list')}
              title="List view"
            >
              ☰ Lista
            </button>
            <button
              className={`${styles.viewButton} ${viewType === 'compact' ? styles.active : ''}`}
              onClick={() => setViewType('compact')}
              title="Compact view"
            >
              ⬛ Compacto
            </button>
            <button
              className={styles.viewButton}
              onClick={() => setTagsModalOpen(true)}
              title="View tags"
            >
              🏷️ Tags
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Painel de filtros (lado esquerdo) */}
          {filtersPanelOpen && (
            <FilterPanel
              categories={categories}
              onFilterChange={handleFilterChange}
              isOpen={filtersPanelOpen}
              onClose={() => setFiltersPanelOpen(false)}
            />
          )}

          {/* Área principal */}
          <main className={styles.main}>
            {isLoading && <LoadingSpinner fullscreen={false} message="Carregando acervo..." />}

            {isEmpty && (
              <EmptyState
                icon="📭"
                title="Nenhum item encontrado"
                description="Tente ajustar seus filtros ou termos de busca"
                action={{
                  label: 'Limpar filtros',
                  onClick: () => {
                    setSearchTerm('');
                    setFilters({});
                  },
                }}
              />
            )}

            {!isLoading && !isEmpty && (
              <>
                <div className={styles.itemsInfo}>
                  <p>
                    Mostrando {displayData.length} de {catalogData?.count || 0} itens
                  </p>
                </div>

                <div className={`${styles.grid} ${styles[viewType]}`}>
                  {displayData.map((item: CatalogItem) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      variant={viewType}
                      onClick={() => handleSelectItem(item)}
                      onAddToCollection={() => {
                        // TODO: Implementar adição à coleção
                        console.log('Add to collection:', item.id);
                      }}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal de detalhe do item */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detalhes do Item"
        size="large"
      >
        {selectedItem && (
          <ItemDetail
            item={selectedItemData || selectedItem}
            onClose={() => setDetailModalOpen(false)}
            onDelete={handleDeleteItem}
            isLoading={itemLoading || isDeleting}
          />
        )}
      </Modal>

      {/* Modal de nuvem de tags */}
      <Modal
        isOpen={tagsModalOpen}
        onClose={() => setTagsModalOpen(false)}
        title="Tags Populares"
        size="medium"
      >
        {tagsLoading ? (
          <LoadingSpinner message="Carregando tags..." />
        ) : (
          <TagCloud tags={tagsData} onTagClick={handleTagClick} />
        )}
      </Modal>
    </div>
  );
};

export default BibliotecaDigital;
