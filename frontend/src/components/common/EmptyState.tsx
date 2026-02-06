import React from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  imageUrl?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
  imageUrl,
}) => {
  return (
    <div className={styles.container}>
      {imageUrl ? (
        <img src={imageUrl} alt={title} className={styles.image} />
      ) : (
        <div className={styles.icon}>{icon}</div>
      )}

      <h3 className={styles.title}>{title}</h3>

      {description && <p className={styles.description}>{description}</p>}

      {action && (
        <button className={styles.actionButton} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
