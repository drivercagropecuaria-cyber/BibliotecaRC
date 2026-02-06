import React from 'react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxButtons = 5,
}) => {
  const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  const adjustedStart = Math.max(1, endPage - maxButtons + 1);

  const pages = [];
  for (let i = adjustedStart; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.button}
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ← Anterior
      </button>

      {adjustedStart > 1 && (
        <>
          <button
            className={styles.button}
            onClick={() => onPageChange(1)}
            aria-label="Go to page 1"
          >
            1
          </button>
          {adjustedStart > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`${styles.button} ${
            page === currentPage ? styles.active : ''
          }`}
          onClick={() => onPageChange(page)}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className={styles.ellipsis}>...</span>
          )}
          <button
            className={styles.button}
            onClick={() => onPageChange(totalPages)}
            aria-label={`Go to page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className={styles.button}
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Próximo →
      </button>

      <span className={styles.pageInfo}>
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
};

export default Pagination;
