# 🎯 INSTRUÇÕES PARA REVALIDAÇÃO - SEMANA 2 FASE 2

**Data:** 2026-02-06  
**Status:** 🔄 Em remediation  
**Objetivo:** Passar em build/test/lint e obter GO

---

## ✅ JÁ CORRIGIDO NO CÓDIGO

Estas correções já foram aplicadas ao repositório:

1. ✅ `frontend/src/hooks/useApi.ts` - Removido `QueryKey` não utilizado
2. ✅ `frontend/src/pages/BibliotecaDigital.tsx` - Removido `useQuery` não utilizado
3. ✅ `frontend/src/components/common/TagCloud.tsx` - Removido `Math.random()`, movido para `useMemo`
4. ✅ `frontend/src/components/common/Pagination.tsx` - Removido `pageSize` não utilizado
5. ✅ `frontend/src/components/library/FilterPanel.tsx` - Removido todos os `as any`, tipos explícitos
6. ✅ `frontend/.env.local` - Criado com credenciais Supabase local

---

## ⏳ AINDA PRECISA SER FEITO (NOS TESTES)

### 1. Ajustar `FilterPanel.test.tsx`

**Localização:** `frontend/src/__tests__/FilterPanel.test.tsx`

**Problema:** Props `selectedCategories` não existem mais na interface.

**Solução:**
```typescript
// Remover selectedCategories de todas as chamadas
// ANTES:
render(<FilterPanel categories={[]} selectedCategories={[]} onFilterChange={mockOnChange} />);

// DEPOIS:
render(<FilterPanel categories={[]} onFilterChange={mockOnChange} />);
```

---

### 2. Ajustar `ItemCard.test.tsx`

**Localização:** `frontend/src/__tests__/ItemCard.test.tsx`

**Problema:** Mock de `CatalogItem` incompleto.

**Solução:**
```typescript
const mockItem: CatalogItem = {
  id: '1',
  titulo: 'Test Item',
  descricao: 'Test Description',
  categoria: 'test',
  tags: [],                    // ← ADICIONAR
  arquivo_url: 'http://test',  // ← ADICIONAR
  user_id: 'user-1',          // ← ADICIONAR
  created_at: '2026-02-06T00:00:00Z',  // ← ADICIONAR
  updated_at: '2026-02-06T00:00:00Z',  // ← ADICIONAR
  thumbnail_url: 'http://test/thumb',
  status: 'ativo',
};
```

---

### 3. Ajustar `BibliotecaDigital.test.tsx`

**Localização:** `frontend/src/__tests__/BibliotecaDigital.test.tsx`

**Problema:** Falta `QueryClientProvider` para envolver a página.

**Solução:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('BibliotecaDigital', () => {
  it('should render the page', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    render(<BibliotecaDigital />, { wrapper });
    
    // test assertions...
  });
});
```

---

## 🚀 PASSOS PARA REVALIDAÇÃO

### Passo 1: Corrigir Testes
```bash
cd frontend

# 1.1 - Abrir FilterPanel.test.tsx
# Remover "selectedCategories" de todas as linhas
# Salvar

# 1.2 - Abrir ItemCard.test.tsx
# Adicionar campos faltantes ao mock CatalogItem
# Salvar

# 1.3 - Abrir BibliotecaDigital.test.tsx
# Adicionar QueryClientProvider wrapper
# Salvar
```

### Passo 2: Validar Lint
```bash
npm run lint
# Esperado: ✅ PASS (todos os 4 any do FilterPanel foram corrigidos no código)
```

### Passo 3: Validar Testes
```bash
npm run test -- --run
# Esperado: ✅ 18/18 passando
```

### Passo 4: Validar Build
```bash
npm run build
# Esperado: ✅ Build bem-sucedido (~200KB gzipped)
```

### Passo 5: Iniciar Supabase (quando Docker estiver disponível)
```bash
# Terminal 1
supabase start
# Esperado: Local Supabase rodando em http://127.0.0.1:54321

# Terminal 2
npm run dev
# Acesso em http://localhost:5173
```

---

## 📋 CHECKLIST FINAL

Antes de chamar revalidação externa:

- [ ] `npm run lint` **passa**
- [ ] `npm run test -- --run` **18/18 passando**
- [ ] `npm run build` **sem erros**
- [ ] `.env.local` **existe com credenciais**
- [ ] Docker Desktop **iniciado** (se possível)
- [ ] Supabase local **rodando** (se Docker disponível)
- [ ] `npm run dev` **inicia sem erros**

---

## ✨ QUANDO TUDO PASSAR

O parecer será:

```
✅ SEMANA 2 - GO-GO
✅ BUILD PASSOU
✅ TESTES PASSANDO (18/18)
✅ LINT CLEAN
✅ SUPABASE VALIDADO
✅ PRONTO PARA SEMANA 3
```

---

## 📞 RESUMO RÁPIDO

**Mudanças de código:** ✅ Todas feitas  
**Mudanças de testes:** ⏳ Aguardando correção dos 3 arquivos  
**Tempo estimado:** 30-45 minutos para corrigir testes + validar  
**Complexidade:** Baixa (apenas ajuste de tipos nos testes)

---

**Salve este documento como referência para a revalidação.**

Após fazer as correções nos testes, execute:
```bash
npm run lint && npm run test -- --run && npm run build
```

Se tudo passar, avise para revalidação final.
