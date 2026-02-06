import React from 'react';
import type { CatalogItem } from '../../hooks/useApi';
import styles from './ItemDetail.module.css';

export interface ItemDetailProps {
  item: CatalogItem;
  onClose?: () => void;
  onEdit?: (item: CatalogItem) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({
  item,
  onClose,
  onEdit,
  onDelete,
  isLoading = false,
  error = null,
}) => {
  if (error) {
    return (
      <div className={styles.error}>
        <p>❌ Erro ao carregar item</p>
        {error && <small>{error}</small>}
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{item.titulo}</h2>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
      </div>

      {item.thumbnail_url && (
        <div className={styles.thumbnailWrapper}>
          <img
            src={item.thumbnail_url}
            alt={item.titulo}
            className={styles.thumbnail}
          />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.section}>
          <h3>Descrição</h3>
          <p className={styles.description}>{item.descricao}</p>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <strong>Categoria:</strong>
            <span className={styles.badge}>{item.categoria}</span>
          </div>

          {item.status && (
            <div className={styles.metaItem}>
              <strong>Status:</strong>
              <span className={`${styles.badge} ${styles[item.status]}`}>
                {item.status}
              </span>
            </div>
          )}

          <div className={styles.metaItem}>
            <strong>Data:</strong>
            <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className={styles.section}>
            <h3>Tags</h3>
            <div className={styles.tagsWrapper}>
              {item.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {onEdit && (
            <button className={styles.primaryButton} onClick={() => onEdit(item)}>
              ✏️ Editar
            </button>
          )}
          {onDelete && (
            <button
              className={styles.dangerButton}
              onClick={() => {
                if (confirm('Deseja arquivar este item?')) {
                  onDelete(item.id);
                }
              }}
            >
              🗑️ Arquivar
            </button>
          )}
        </div>

        {item.arquivo_url && (
          <div className={styles.fileLink}>
            <a
              href={item.arquivo_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadButton}
            >
              📥 Download do arquivo
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
