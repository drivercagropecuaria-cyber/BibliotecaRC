import React, { useMemo } from 'react';
import styles from './TagCloud.module.css';

export interface Tag {
  tag: string;
  count: number;
}

export interface TagCloudProps {
  tags: Tag[];
  onTagClick?: (tag: string) => void;
  maxTags?: number;
  maxSize?: number;
  minSize?: number;
}

export const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  onTagClick,
  maxTags = 50,
  maxSize = 2.0,
  minSize = 0.8,
}) => {
  // Get top tags and calculate sizes (memoized to prevent re-render issues)
  const tagsWithSize = useMemo(() => {
    const topTags = tags.slice(0, maxTags);
    if (topTags.length === 0) return [];

    const maxCount = Math.max(...topTags.map((t) => t.count), 1);
    const minCount = Math.min(...topTags.map((t) => t.count), 1);

    const withSizes = topTags.map((tag) => {
      const ratio = (tag.count - minCount) / (maxCount - minCount || 1);
      const size = minSize + ratio * (maxSize - minSize);
      return { ...tag, size };
    });

    // Stable sort by tag name (deterministic, not random)
    return withSizes.sort((a, b) => a.tag.localeCompare(b.tag));
  }, [tags, maxTags, minSize, maxSize]);

  return (
    <div className={styles.container}>
      <div className={styles.cloud}>
        {tagsWithSize.map((tag) => (
          <button
            key={`${tag.tag}-${tag.count}`}
            className={styles.tag}
            style={{ fontSize: `${tag.size}rem` }}
            onClick={() => onTagClick?.(tag.tag)}
            title={`${tag.tag} (${tag.count} items)`}
            aria-label={`${tag.tag} - ${tag.count} items`}
          >
            {tag.tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagCloud;
