import React from 'react';
import type { CatalogItem } from '../../hooks/useApi';
import styles from './ItemCard.module.css';

export interface ItemCardProps {
  item: CatalogItem;
  onClick?: () => void;
  onAddToCollection?: () => void;
  variant?: 'grid' | 'list' | 'compact';
  isSelected?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onClick,
  onAddToCollection,
  variant = 'grid',
  isSelected = false,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ativo':
        return styles.statusAtivo;
      case 'inativo':
        return styles.statusInativo;
      case 'archived':
        return styles.statusArchived;
      default:
        return '';
    }
  };

  if (variant === 'list') {
    return (
      <div
        className={`${styles.card} ${styles.list} ${isSelected ? styles.selected : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onClick) onClick();
        }}
      >
        {item.thumbnail_url && (
          <img src={item.thumbnail_url} alt={item.titulo} className={styles.thumbnail} />
        )}
        <div className={styles.content}>
          <h3 className={styles.title}>{item.titulo}</h3>
          <div className={styles.meta}>
            <span className={styles.category}>{item.categoria}</span>
            {item.status && (
              <span className={`${styles.status} ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            )}
          </div>
          {item.descricao && (
            <p className={styles.description}>{item.descricao.substring(0, 150)}...</p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`${styles.card} ${styles.compact}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onClick) onClick();
        }}
      >
        {item.thumbnail_url && (
          <img src={item.thumbnail_url} alt={item.titulo} className={styles.thumbnail} />
        )}
        <p className={styles.title}>{item.titulo}</p>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div
      className={`${styles.card} ${styles.grid} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick();
      }}
    >
      <div className={styles.imageWrapper}>
        {item.thumbnail_url && (
          <img src={item.thumbnail_url} alt={item.titulo} className={styles.thumbnail} />
        )}
        {!item.thumbnail_url && (
          <div className={styles.placeholder}>
            <span>📄</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h4 className={styles.title}>{item.titulo}</h4>

        <div className={styles.badges}>
          <span className={styles.category}>{item.categoria}</span>
          {item.status && (
            <span className={`${styles.status} ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          )}
        </div>

        {item.descricao && (
          <p className={styles.description}>{item.descricao.substring(0, 80)}...</p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className={styles.tags}>
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && <span className={styles.tagMore}>+{item.tags.length - 2}</span>}
          </div>
        )}

        {onAddToCollection && (
          <button
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCollection();
            }}
            aria-label="Add to collection"
          >
            ⭐ Coleção
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
