# 📋 PLANO DE EXECUÇÃO DETALHADO - SEMANA 2

**Mundo Virtual Villa Canabrava - Fase 2, Semana 2**  
**Período:** 13-19 Fevereiro 2026 (7 dias úteis, 40 horas disponíveis)  
**Dedicado a S2:** 25 horas  
**Buffer:** 15 horas para escalations/bugs  

---

## 🎯 OBJETIVO GERAL

Construir interface web completa da **Biblioteca Digital** com 10+ componentes React reutilizáveis, CRUD Supabase integrado, 3 view modes (Grid/List/Map), e 25+ testes automatizados passando.

**Resultado Esperado:**
- ✅ 10+ componentes React prontos para reutilização
- ✅ Biblioteca Digital page funcional com busca, filtros, paginação
- ✅ CRUD Supabase 100% integrado
- ✅ 25+ testes passando (Vitest)
- ✅ Build clean: `npm run build` → 0 errors
- ✅ TypeScript strict mode: 0 errors
- ✅ Consolidation report gerado para validação

---

## 📊 ROADMAP DIÁRIO

### 🗓️ SEGUNDA 13 FEV (Dia 1)

**Tema:** Kickoff + Setup inicial

#### 09:00 - Kickoff Meeting (15 min)
- Confirmar 4 bloqueadores resolvidos
- Distribuidores de tarefas
- Validar ambiente pronto

#### 09:15 - 17:00: Tarefa 2.1 PT1: Component Library - Estrutura Base (6h)

**Objetivo:** Criar estrutura + 5 componentes base

**Componentes a Criar:**

**1. SearchBar.tsx (EXISTENTE, REVIEW)**
```typescript
// Props:
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

// Features:
- Debounce 300ms
- Full-text search
- Clear button
- Placeholder customizável
```

**2. FilterPanel.tsx (EXISTENTE, EXPAND)**
```typescript
interface FilterPanelProps {
  categories: string[];
  dateRange?: DateRange;
  localidades?: string[];
  onFilterChange: (filters: FilterState) => void;
}

// Features:
- Multi-select checkboxes
- Date range picker
- Localidade dropdown
- Clear all button
```

**3. ItemCard.tsx (EXISTENTE, REVIEW)**
```typescript
interface ItemCardProps {
  item: CatalogItem;
  onClick?: () => void;
  showActions?: boolean;
}

// Features:
- Thumbnail image
- Título + descrição
- Tags
- Metadata (data, localidade)
- Action buttons (edit, delete)
```

**4. Navbar.tsx (NOVO)**
```typescript
interface NavbarProps {
  title?: string;
  showSearch?: boolean;
}

// Features:
- Logo/titulo
- Links de navegação
- User profile dropdown
- Mobile responsive
```

**5. LoadingSpinner.tsx (NOVO)**
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

// Features:
- Animação CSS pura
- Tamanhos variáveis
- Overlay option
```

**Estrutura a Criar:**
```
frontend/src/
├─ components/
│  ├─ library/ (NOVA PASTA)
│  │  ├─ SearchBar.tsx ✅
│  │  ├─ FilterPanel.tsx ✅
│  │  ├─ ItemCard.tsx ✅
│  │  ├─ Navbar.tsx ⬜
│  │  ├─ LoadingSpinner.tsx ⬜
│  │  └─ index.ts (export all)
│  ├─ styles/
│  │  ├─ components.module.css (EXISTENTE)
│  │  └─ library.module.css (NOVO)
```

**Tarefas:**
- [ ] Revisar SearchBar existente (lint, TypeScript)
- [ ] Revisar FilterPanel existente
- [ ] Revisar ItemCard existente
- [ ] Criar Navbar nova
- [ ] Criar LoadingSpinner nova
- [ ] Criar index.ts com exports
- [ ] CSS Modules para todos
- [ ] Deploy para git

**Entregáveis:**
- 5 componentes compilando
- 0 TypeScript errors
- Storybook (opcional para referência)

---

### 🗓️ TERÇA 14 FEV (Dia 2)

**Tema:** Mais componentes + Testes iniciais

#### 09:00 - 17:00: Tarefa 2.1 PT2: Component Library - Componentes Finais (6h)

**Componentes a Criar:**

**6. Modal.tsx (NOVO)**
```typescript
interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Features:
- Overlay com backdrop
- Close button
- Keyboard: ESC to close
- Focus trap (accessibility)
```

**7. Pagination.tsx (NOVO)**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: 10 | 25 | 50;
}

// Features:
- Previous/Next buttons
- Page number buttons
- Items per page selector
```

**8. EmptyState.tsx (NOVO)**
```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

// Features:
- Generic empty state
- Icon + text
- CTA button
```

**9. TagCloud.tsx (NOVO)**
```typescript
interface TagCloudProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  maxTags?: number;
}

// Features:
- Renderiza tags como pills
- Clickable
- Overflow handling
```

**10. ItemDetail.tsx (NOVO)**
```typescript
interface ItemDetailProps {
  item: CatalogItem;
  onClose: () => void;
}

// Features:
- Full item details
- Galeria de imagens (se houver)
- Metadata completa
- GIS location (mapa)
- Actions (edit, delete, share)
```

**Tarefas:**
- [ ] Criar Modal.tsx
- [ ] Criar Pagination.tsx
- [ ] Criar EmptyState.tsx
- [ ] Criar TagCloud.tsx
- [ ] Criar ItemDetail.tsx
- [ ] CSS Modules para todos
- [ ] Update index.ts
- [ ] TypeScript: 0 errors
- [ ] Build test: `npm run build`

**Entregáveis:**
- 10 componentes total criados
- Biblioteca completa pronta
- Build passing

---

#### 14:00 - 17:00: Tarefa 2.4 PT1: Teste Framework Setup (2h)

**Objetivo:** Preparar testes antes de implementar interface

**Tarefas:**
- [ ] Corrigir vitest.config.ts (globals)
- [ ] Criar setup files se necessário
- [ ] Rodar `npm test` → verificar erros
- [ ] Criar test template padrão
- [ ] Documentar testing patterns

---

### 🗓️ QUARTA 15 FEV (Dia 3)

**Tema:** Interface + CRUD integration

#### 09:00 - 13:00: Tarefa 2.2 PT1: Biblioteca Digital Interface (4h)

**Arquivo:** `frontend/src/pages/BibliotecaDigital.tsx`

**Estrutura:**
```typescript
export const BibliotecaDigital: React.FC = () => {
  // State management
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoria: [],
    data: null,
    localidade: '',
    tags: []
  });
  const [page, setPage] = useState(1);

  // API hooks (usar useApi)
  const { data: catalogData, isLoading } = useCatalogList({
    page,
    perPage: 10,
    filters
  });

  // Render
  return (
    <div>
      <Navbar title="Biblioteca Digital" />
      <SearchBar onSearch={handleSearch} />
      <FilterPanel onFilterChange={handleFilterChange} />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          
          {viewMode === 'grid' && <GridView items={catalogData?.data} />}
          {viewMode === 'list' && <ListView items={catalogData?.data} />}
          {viewMode === 'map' && <MapView items={catalogData?.data} />}
          
          {catalogData?.data.length === 0 && (
            <EmptyState title="Nenhum resultado" />
          )}
          
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(catalogData?.count / 10)}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};
```

**Tarefas:**
- [ ] Setup estado principal
- [ ] Integrar SearchBar
- [ ] Integrar FilterPanel
- [ ] Implementar view mode toggle (grid/list/map)
- [ ] Integrar Pagination
- [ ] Loading states
- [ ] Error handling
- [ ] CSS layout

---

#### 14:00 - 18:00: Tarefa 2.3 PT1: CRUD Supabase - Read Operations (4h)

**Arquivo:** `frontend/src/hooks/useApi.ts` (expandir)

**Implementar Queries:**

**1. useCatalogList**
```typescript
export const useCatalogList = (options: {
  page: number;
  perPage: number;
  filters?: FilterState;
}) => {
  return useQuery(
    ['catalog', options],
    () => getCatalogList(options),
    { staleTime: 5 * 60 * 1000 } // 5 min cache
  );
};
```

**2. useCatalogSearch**
```typescript
export const useCatalogSearch = (query: string) => {
  return useQuery(
    ['catalog-search', query],
    () => searchCatalog(query),
    { 
      enabled: query.length > 2,
      staleTime: 1 * 60 * 1000 // 1 min
    }
  );
};
```

**3. useCatalogItem**
```typescript
export const useCatalogItem = (id: string) => {
  return useQuery(
    ['catalog-item', id],
    () => getCatalogItemById(id)
  );
};
```

**4. useCategories**
```typescript
export const useCategories = () => {
  return useQuery(
    ['categories'],
    () => getCategories(),
    { staleTime: 60 * 60 * 1000 } // 1 hora
  );
};
```

**Arquivo:** `frontend/src/services/supabaseClient.ts` (expandir)

**Implementar Funções Base:**
```typescript
// Read
export async function getCatalogList(options): Promise<{
  data: CatalogItem[],
  count: number
}> { ... }

export async function searchCatalog(query: string): Promise<CatalogItem[]> { ... }

export async function getCatalogItemById(id: string): Promise<CatalogItem> { ... }

export async function getCategories(): Promise<string[]> { ... }
```

**Tarefas:**
- [ ] Implementar 4 query hooks
- [ ] Implementar 4 read functions em supabaseClient
- [ ] Type-safe: CategoryItem[], CatalogItem, etc
- [ ] Error handling
- [ ] Test manually em página

---

### 🗓️ QUINTA 16 FEV (Dia 4)

**Tema:** CRUD write operations + Tests

#### 09:00 - 12:00: Tarefa 2.3 PT2: CRUD Supabase - Write Operations (3h)

**Implementar Mutations:**

**1. useCreateCatalogItem**
```typescript
export const useCreateCatalogItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (newItem: CatalogItemInput) => createCatalogItem(newItem),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['catalog']);
      }
    }
  );
};
```

**2. useUpdateCatalogItem**
```typescript
export const useUpdateCatalogItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: Partial<CatalogItem> }) =>
      updateCatalogItem(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['catalog']);
        queryClient.invalidateQueries(['catalog-item', id]);
      }
    }
  );
};
```

**3. useDeleteCatalogItem**
```typescript
export const useDeleteCatalogItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => deleteCatalogItem(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['catalog']);
      }
    }
  );
};
```

**Funções em supabaseClient.ts:**
```typescript
export async function createCatalogItem(item: CatalogItemInput) { ... }
export async function updateCatalogItem(id: string, updates: Partial<CatalogItem>) { ... }
export async function deleteCatalogItem(id: string) { ... }
```

**Tarefas:**
- [ ] Implementar 3 mutation hooks
- [ ] Implementar 3 write functions
- [ ] Query invalidation setup
- [ ] Error handling + toast messages
- [ ] Optimistic updates (opcional)

---

#### 13:00 - 17:00: Tarefa 2.4 PT2: Unit Tests (4h)

**Objetivo:** Escrever 25+ testes cobrindo principais funções

**Arquivo de Testes:**

**SearchBar.test.tsx (5 testes)**
```typescript
describe('SearchBar Component', () => {
  it('renders input field', () => { ... });
  it('calls onSearch on input change', () => { ... });
  it('debounces input (300ms)', () => { ... });
  it('clears input on clear button click', () => { ... });
  it('shows placeholder text', () => { ... });
});
```

**FilterPanel.test.tsx (5 testes)**
```typescript
describe('FilterPanel Component', () => {
  it('renders category checkboxes', () => { ... });
  it('handles category selection', () => { ... });
  it('shows date range picker', () => { ... });
  it('calls onFilterChange with correct filters', () => { ... });
  it('clears all filters on clear button', () => { ... });
});
```

**ItemCard.test.tsx (3 testes)**
```typescript
describe('ItemCard Component', () => {
  it('renders item title and description', () => { ... });
  it('displays item image', () => { ... });
  it('calls onClick handler', () => { ... });
});
```

**BibliotecaDigital.test.tsx (7 testes)**
```typescript
describe('BibliotecaDigital Page', () => {
  it('renders page title', () => { ... });
  it('displays search bar and filter panel', () => { ... });
  it('switches between view modes', () => { ... });
  it('loads catalog items on mount', () => { ... });
  it('updates items on filter change', () => { ... });
  it('paginates correctly', () => { ... });
  it('shows empty state when no results', () => { ... });
});
```

**supabaseClient.test.ts (5 testes)**
```typescript
describe('Supabase Client', () => {
  it('fetches catalog list', () => { ... });
  it('searches catalog with query', () => { ... });
  it('creates new item', () => { ... });
  it('updates item', () => { ... });
  it('deletes item', () => { ... });
});
```

**Tarefas:**
- [ ] Escrever 25 testes (5+5+3+7+5)
- [ ] Todos passando: `npm test`
- [ ] Coverage > 70%
- [ ] Mock Supabase corretamente

---

### 🗓️ SEXTA 17 FEV (Dia 5)

**Tema:** Finalização + Validação

#### 09:00 - 12:00: Tarefa 2.2 PT2: Interface Refinement (3h)

**Objetivo:** Polish interface, responsiveness

**Tarefas:**
- [ ] Mobile responsive (CSS media queries)
- [ ] Dark mode support (opcional)
- [ ] Acessibilidade (ARIA labels)
- [ ] Loading states refinement
- [ ] Error messages user-friendly
- [ ] Performance: check Lighthouse

---

#### 13:00 - 15:00: Tarefa 2.5: Documentação (2h)

**Arquivo:** `frontend/README_SEMANA2.md`

**Conteúdo:**
```markdown
# Semana 2 - Biblioteca Digital Frontend

## Como Rodar

```bash
npm install
npm run dev
```

## Estrutura de Componentes

### Library Components
- SearchBar: Busca full-text com debounce
- FilterPanel: Multi-filtros
- ... (listar todos 10)

## API Integration

### Queries
- useCatalogList(): Listar com paginação
- useCatalogSearch(): Buscar
- ...

### Mutations
- useCreateCatalogItem()
- useUpdateCatalogItem()
- useDeleteCatalogItem()

## Testing

```bash
npm test
npm run test:coverage
```

## Deployment

[Instruções para Vercel]
```

---

#### 15:00 - 17:00: Build Validation (2h)

**Tarefas:**
- [ ] `npm run lint` → 0 warnings
- [ ] `npm run build` → clean build
- [ ] `npm test` → all passing
- [ ] TypeScript: 0 errors
- [ ] Git push + branch cleanup

---

### 🗓️ SEGUNDA-SEXTA 18-19 FEV (Dias 6-7)

**Slack for:**
- Bug fixes
- Performance optimization
- Test coverage improvements
- Code review & refactoring

**Buffer:** 15 horas

---

## 🏁 DEFINIÇÃO DE PRONTO (DoD)

✅ **Código:**
- [ ] 10+ componentes criados
- [ ] BibliotecaDigital funcional
- [ ] CRUD Supabase 100% integrado
- [ ] 25+ testes escritos e passando
- [ ] 0 TypeScript errors
- [ ] `npm run build` → SUCCESS

✅ **Qualidade:**
- [ ] `npm run lint` → 0 warnings
- [ ] `npm test` → all tests passing
- [ ] Coverage > 70%
- [ ] Lighthouse score > 80

✅ **Documentação:**
- [ ] README_SEMANA2.md completo
- [ ] JSDoc em componentes
- [ ] Inline comments em lógica

✅ **Reports:**
- [ ] `reports/FASE_2_SEMANA_2_CONSOLIDACAO.json` gerado

---

## 📊 CONSOLIDATION REPORT TEMPLATE

```json
{
  "semana": 2,
  "fase": 2,
  "data_inicio": "2026-02-13",
  "data_fim": "2026-02-19",
  "status": "COMPLETO",
  "components_criados": [
    "SearchBar",
    "FilterPanel",
    "ItemCard",
    "Navbar",
    "LoadingSpinner",
    "Modal",
    "Pagination",
    "EmptyState",
    "TagCloud",
    "ItemDetail"
  ],
  "testes_totais": 25,
  "testes_passando": 25,
  "coverage": "73%",
  "build_status": "SUCCESS",
  "typescript_errors": 0,
  "lint_warnings": 0,
  "deployments": 1,
  "entregas": [
    "10 componentes React reutilizáveis",
    "Biblioteca Digital interface com 3 view modes",
    "CRUD Supabase completo",
    "25+ testes automatizados",
    "README_SEMANA2.md atualizado"
  ],
  "proxima_fase": "Semana 3: 3D Museum + GIS Map (21-27 Feb)"
}
```

---

## 🚨 BLOQUEADORES AINDA PENDENTES

1. **Docker Desktop** - Necessário para Supabase local
2. **Modelo Blender** - Não bloqueia S2, mas precisa S3
3. **GIS Área Divergence** - Análise pós-S2

> ⚠️ S2 pode começar com Docker Desktop inativo se usar Supabase cloud. Será ajustado segunda.

---

## 📞 CONTATO

**Tech Lead:** Roo  
**Project Manager:** Roberth Naninne de Souza  

Qualquer bloqueador → escalate imediatamente

---

**Preparado:** 6 Fevereiro 2026  
**Status:** ⏳ Pronto para kickoff segunda 13 Fev  
**Revisão:** Segunda 09:00 (Kickoff)

