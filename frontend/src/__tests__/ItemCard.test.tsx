import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from '../components/library/ItemCard';
import type { CatalogItem } from '../hooks/useApi';

describe('ItemCard Component', () => {
  const mockItem: CatalogItem = {
    id: '1',
    titulo: 'Documento Histórico',
    descricao: 'Um documento importante',
    categoria: 'documento',
    tags: [],
    arquivo_url: 'http://test',
    user_id: 'user-1',
    created_at: '2026-02-06T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
    thumbnail_url: 'http://test/thumb',
    deleted_at: null,
    is_active: true,
    status: 'ativo',
  };

  it('renders item title', () => {
    const mockClick = vi.fn();
    const { container } = render(<ItemCard item={mockItem} onClick={mockClick} />);
    expect(container.textContent).toContain('Documento Histórico');
  });

  it('renders item category', () => {
    const mockClick = vi.fn();
    const { container } = render(<ItemCard item={mockItem} onClick={mockClick} />);
    expect(container.textContent).toContain('documento');
  });

  it('renders truncated description', () => {
    const mockClick = vi.fn();
    const { container } = render(<ItemCard item={mockItem} onClick={mockClick} />);
    expect(container.textContent).toContain('Um documento importante');
  });

  it('calls onClick when clicked', () => {
    const mockClick = vi.fn();
    render(<ItemCard item={mockItem} onClick={mockClick} />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(mockClick).toHaveBeenCalled();
  });
});
