import React, { useState, useCallback } from 'react';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  clearable?: boolean;
  showAdvanced?: boolean;
  onAdvancedClick?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Buscar acervo...',
  debounceMs = 300,
  clearable = true,
  showAdvanced = false,
  onAdvancedClick,
}) => {
  const [query, setQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      // Limpar timer anterior
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Novo timer para debounce
      const timer = setTimeout(() => {
        onSearch(value);
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [onSearch, debounceMs, debounceTimer]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <span className={styles.icon}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          aria-label="Search library items"
          spellCheck="false"
        />
        {clearable && query && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear (ESC)"
          >
            ×
          </button>
        )}
      </div>

      {showAdvanced && (
        <button
          className={styles.advancedButton}
          onClick={onAdvancedClick}
          aria-label="Advanced search"
        >
          ⚙️ Avançado
        </button>
      )}
    </div>
  );
};

export default SearchBar;
