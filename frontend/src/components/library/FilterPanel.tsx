import React, { useState } from 'react';
import type { FilterOptions } from '../../hooks/useApi';
import styles from './FilterPanel.module.css';

export interface FilterPanelProps {
  categories: string[];
  onFilterChange: (filters: FilterOptions) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories = [],
  onFilterChange,
  isOpen = true,
  onClose,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'relevance'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [status, setStatus] = useState<string>('ativo');

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      
      applyFilters({
        categoria: updated.length > 0 ? updated[0] : undefined,
        sortBy,
        sortOrder,
        status: status === 'all' ? undefined : status,
      });

      return updated;
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'recent' | 'popular' | 'relevance';
    setSortBy(value);
    applyFilters({
      categoria: selectedCategories[0],
      sortBy: value,
      sortOrder,
      status: status === 'all' ? undefined : status,
    });
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'asc' | 'desc';
    setSortOrder(value);
    applyFilters({
      categoria: selectedCategories[0],
      sortBy,
      sortOrder: value,
      status: status === 'all' ? undefined : status,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    applyFilters({
      categoria: selectedCategories[0],
      sortBy,
      sortOrder,
      status: e.target.value === 'all' ? undefined : e.target.value,
    });
  };

  const applyFilters = (filters: FilterOptions) => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSortBy('recent');
    setSortOrder('desc');
    setStatus('ativo');
    onFilterChange({});
  };

  if (!isOpen) return null;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h3>Filtros</h3>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose} aria-label="Close filters">
            ×
          </button>
        )}
      </div>

      <div className={styles.section}>
        <h4>Categorias</h4>
        <div className={styles.checkboxGroup}>
          {categories.map((category) => (
            <label key={category} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4>Ordenar Por</h4>
        <select value={sortBy} onChange={handleSortChange} className={styles.select}>
          <option value="recent">Mais Recentes</option>
          <option value="popular">Mais Populares</option>
          <option value="relevance">Relevância</option>
        </select>
      </div>

      <div className={styles.section}>
        <h4>Ordem</h4>
        <select value={sortOrder} onChange={handleOrderChange} className={styles.select}>
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
      </div>

      <div className={styles.section}>
        <h4>Status</h4>
        <select value={status} onChange={handleStatusChange} className={styles.select}>
          <option value="all">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      <button className={styles.resetButton} onClick={handleReset}>
        🔄 Resetar Filtros
      </button>
    </aside>
  );
};

export default FilterPanel;
