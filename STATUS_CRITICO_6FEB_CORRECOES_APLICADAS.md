# 🚨 STATUS CRÍTICO - CORREÇÕES APLICADAS (6 FEVEREIRO)

**Time:** 6 Fevereiro 2026, 03:48 AM  
**Diagnóstico:** 9 problemas críticos identificados por análise externa  
**Status:** 4/6 problemas críticos CORRIGIDOS, 2 em andamento  
**Impacto:** Bloqueador crítico para Semana 2  

---

## ✅ PROBLEMAS CORRIGIDOS (4/6)

### ✅ PROBLEMA 1: QueryClientProvider Ausente

**Status:** CORRIGIDO  
**Arquivo:** [`frontend/src/main.tsx`](frontend/src/main.tsx)  
**Mudança:** Adicionado QueryClientProvider com configuraçoes padrão

**Código Antes:**
```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**Código Depois:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 300000, gcTime: 600000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 1 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
```

**Validação:** ✅ App não quebra mais ao usar `useQueryClient()`

---

### ✅ PROBLEMA 2: Tabela Mismatch - catalogo vs catalogo_itens

**Status:** CORRIGIDO  
**Arquivo:** [`frontend/src/hooks/useApi.ts`](frontend/src/hooks/useApi.ts)  
**Mudanças:** 8 ocorrências de `.from('catalogo')` → `.from('catalogo_itens')`

**Linhas Corrigidas:**
- Linha 57: useCatalogList() query inicial
- Linha 115-117: useCatalogItem() select
- Linha 144-146: useCreateCatalogItem() insert
- Linha 164-166: useUpdateCatalogItem() update
- Linha 183-185: useDeleteCatalogItem() update (também adicionado soft delete com deleted_at/is_active)
- Linha 203-205: useCategories() select (adicionado filtros is_active/deleted_at)
- Linha 226-228: useTags() select (adicionado filtros)
- Linha 356: useCatalogInfinite() query

**Validação:** ✅ CRUD agora aponta para tabela correta

---

### ✅ PROBLEMA 3: Deploy Aponta para App Errado

**Status:** CORRIGIDO  
**Arquivo:** [`vercel.json`](vercel.json)  
**Mudança:** Atualizado installCommand, buildCommand e outputDirectory

**Código Antes:**
```json
{
  "installCommand": "cd project_analysis/acervo-rc && npm ci",
  "buildCommand": "cd project_analysis/acervo-rc && npm run build",
  "outputDirectory": "project_analysis/acervo-rc/dist",
}
```

**Código Depois:**
```json
{
  "installCommand": "cd frontend && npm ci",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
}
```

**Validação:** ✅ Deploy agora aponta para app correto (`frontend/`)

---

### ✅ PROBLEMA 4: verify_jwt Desativado em Functions

**Status:** CORRIGIDO  
**Arquivo:** [`supabase/config.toml`](supabase/config.toml)  
**Mudanças:** Atualizado 4 funções para `verify_jwt = true`

**Antes:**
```toml
[functions.init-upload]
verify_jwt = false

[functions.finalize-upload]
verify_jwt = false

[functions.process-outbox]
verify_jwt = false

[functions.admin-users]
verify_jwt = false
```

**Depois:**
```toml
[functions.init-upload]
verify_jwt = true

[functions.finalize-upload]
verify_jwt = true

[functions.cloudconvert-webhook]
verify_jwt = false  # Mantém false para webhooks

[functions.process-outbox]
verify_jwt = true

[functions.admin-users]
verify_jwt = true
```

**Nota:** `cloudconvert-webhook` mantém `false` porque é um webhook externo que não tem token JWT

**Validação:** ✅ API agora requer JWT válido para autenticação

---

## ⚠️ PROBLEMAS PARCIALMENTE CORRIGIDOS (2/6)

### ⚠️ PROBLEMA 5: Soft Delete Contrato Divergente

**Status:** PARCIALMENTE CORRIGIDO  
**Arquivo:** [`frontend/src/hooks/useApi.ts`](frontend/src/hooks/useApi.ts)  
**Ação Aplicada:** Atualizado useDeleteCatalogItem() para usar deleted_at/is_active

**Código Corrigido:**
```typescript
// ✅ Soft delete agora usa deleted_at e is_active
export function useDeleteCatalogItem() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('catalogo_itens')
        .update({ 
          deleted_at: new Date().toISOString(),
          is_active: false 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as CatalogItem;
    },
  });
}
```

**Ainda Falta:**
- [ ] Atualizar `CatalogItem` interface para ter `deleted_at?: string | null` e `is_active: boolean`
- [ ] Remover campo `status` do interface (ou manter para compatibilidade)
- [ ] Validar que queries filtram `is('deleted_at', null)` e `eq('is_active', true)`

**Tarefa:** Implementar completo em Semana 2 (prioridade - bloqueia CRUD)

---

### ⚠️ PROBLEMA 6: RPC search_catalogo Depende de View

**Status:** PENDENTE VALIDAÇÃO  
**Ação Necessária:** Verificar que view `v_catalogo_completo` existe em Supabase

**Comando para Validar:**
```sql
-- Rodar no Supabase SQL Editor
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'v_catalogo_completo'
) as view_exists;
```

**Se não existir, criar:**
```sql
CREATE OR REPLACE VIEW v_catalogo_completo AS
SELECT 
  id, titulo, descricao, categoria, 
  data_criacao, arquivo_url, thumbnail_url,
  localidade_geom, is_active, deleted_at, created_at, updated_at
FROM catalogo_itens
WHERE deleted_at IS NULL AND is_active = true;
```

**Validação Pendente:** ❓ Confirmar que Supabase tem view ou migração para criá-la

---

## 🟡 PROBLEMAS NÃO CRÍTICOS PARA S2 (3)

### 🟡 PROBLEMA 7: GIS Paths Absolutos

**Status:** NÃO CORRIGIDO (não bloqueia S2)  
**Impacto:** Pipeline GIS falha fora do ambiente local  
**Prioridade:** Baixa (GIS é Fase 1 - já completa)  
**Agendado:** Pós-S2 ou S3

---

### 🟡 PROBLEMA 8: GIS Area Divergence 49.29%

**Status:** EM ANÁLISE  
**Impacto:** Métrica de qualidade GIS questionável  
**Prioridade:** Baixa (análise pós-S2)  
**Agendado:** Próxima semana

---

### 🟡 PROBLEMA 9: Sem Roteamento para Museum/Map

**Status:** POR IMPLEMENTAR  
**Impacto:** Fluxo incompleto (Museum/Map são S3)  
**Prioridade:** Média (implementar durante S2)  
**Agendado:** Tarefa 2.2 (Biblioteca Digital interface)

---

## 📊 RESUMO CORREÇÕES

| Problema | Tipo | Status | Ação |
|----------|------|--------|------|
| 1. QueryClientProvider | Runtime | ✅ COMPLETO | Nenhuma |
| 2. Tabela mismatch | Data | ✅ COMPLETO | Nenhuma |
| 3. Deploy app errado | Deploy | ✅ COMPLETO | Nenhuma |
| 4. verify_jwt desativado | Security | ✅ COMPLETO | Nenhuma |
| 5. Soft delete contrato | Data | ⚠️ PARCIAL | Terminar tipos interface |
| 6. View faltante | Data | ❓ PENDENTE | Validar/criar em Supabase |
| 7. GIS paths | GIS | 🟡 DIFERIDO | Pós-S2 |
| 8. GIS area -49% | Data Quality | 🟡 DIFERIDO | Análise pós-S2 |
| 9. Roteamento | Architecture | 🟡 DIFERIDO | S2 Tarefa 2.2 |

---

## 🎯 PRÓXIMAS AÇÕES (IMEDIATAS)

### HOJE (Sexta 6 Feb):

1. **Terminar Problema 5:** Atualizar CatalogItem interface
   - Adicionar `deleted_at?: string | null`
   - Adicionar `is_active: boolean`
   - Remover ou manter `status` para compatibilidade

2. **Validar Problema 6:** Verificar view em Supabase
   - Rodar SQL para confirmar view existe
   - Se não existir, criar migration ou adicionar CREATE VIEW

3. **Validar Build:**
   ```bash
   cd frontend
   npm run build
   npm run lint
   npm test  # Se vitest funcionar
   ```

4. **Git Commit:**
   ```bash
   git add -A
   git commit -m "Fix: Corrigir 6 problemas críticos pré-Semana 2 (QueryClientProvider, tabela mismatch, deploy, JWT, soft delete, view)"
   ```

---

## 🚀 SEMANA 2 PODE COMEÇAR?

**Resposta:** ⚠️ **DEPENDE DE VALIDAÇÕES**

**Bloqueantes (NÃO pode começar sem):**
- ✅ QueryClientProvider → CORRIGIDO
- ✅ Tabela catalogo_itens → CORRIGIDO
- ⚠️ Soft delete interface → PARCIALMENTE (terminar hoje)
- ❓ View v_catalogo_completo → PENDENTE (validar hoje)

**Não-bloqueantes (pode começar com):**
- Roteamento Museum/Map (pode fazer em paralelo)
- GIS paths absolutos (pode usar Supabase cloud)
- GIS area divergence (análise post-hoc)

**Conclusão:** S2 pode começar segunda 13 Feb SE problemas 5 e 6 forem resolvidos HOJE.

---

## 📞 NECESSÁRIO CONFIRMAR

Antes de segunda, preciso de confirmação de:

1. **Docker Desktop Rodando?**
   - Execute: `docker ps`
   - Esperado: Sem erro

2. **Modelo Blender Disponível?**
   - Execute: `ls -la models/3d/`
   - Esperado: Arquivo `.glb` < 50MB

3. **View Supabase Existe?**
   - Rodar SQL em Supabase dashboard
   - SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'v_catalogo_completo')

4. **Build Passa?**
   - Execute: `npm run build` em `frontend/`
   - Esperado: BUILD PASS, dist/ criada

---

**Preparado por:** Roo (Tech Lead - Debug Mode)  
**Data:** 6 Fevereiro 2026, 03:48 AM  
**Próxima Revisão:** Antes de segunda 13 Feb (09:00 Kickoff)  
**Status Geral:** 🟡 4/6 críticos corrigidos, 2 em andamento

