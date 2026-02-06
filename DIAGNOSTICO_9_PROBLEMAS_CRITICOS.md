# 🚨 DIAGNÓSTICO: 9 PROBLEMAS CRÍTICOS ENCONTRADOS

**Data:** 6 Fevereiro 2026  
**Status:** ANÁLISE CONCLUÍDA - Correções identificadas  
**Impacto:** BLOQUEADOR CRÍTICO para Semana 2  
**Ação:** Corrigir HOJE antes de segunda 13 Feb  

---

## RESUMO EXECUTIVO

Análise código revelou **9 problemas graves** que impedem execução S2:

| # | Problema | Severidade | Tipo | Impacto |
|---|----------|-----------|------|---------|
| 1 | QueryClientProvider ausente | 🔴 CRÍTICA | Runtime | App quebra ao usar React Query |
| 2 | Tabela mismatch: catalogo vs catalogo_itens | 🔴 CRÍTICA | Data | CRUD não encontra tabela |
| 3 | Deploy aponta para app errado (acervo-rc) | 🔴 CRÍTICA | Deploy | Deploy do artefato incorreto |
| 4 | verify_jwt desativado em functions | 🔴 CRÍTICA | Security | API sem autenticação |
| 5 | Soft delete contrato divergente (status vs deleted_at) | 🟠 ALTA | Data | Delete operation quebrada |
| 6 | RPC search_catalogo depende de view que pode não existir | 🟠 ALTA | Data | Search quebra se view falta |
| 7 | GIS paths absolutos (não portável) | 🟠 ALTA | GIS | Pipeline falha fora do env local |
| 8 | GIS area divergence 49.29% | 🟡 MÉDIA | Data Quality | Análise espacial comprometida |
| 9 | Sem roteamento para Museum/Map (S3) | 🟡 MÉDIA | Architecture | Fluxo incompleto |

---

## 1️⃣ PROBLEMA: QueryClientProvider Ausente

### Diagnóstico

**Achado:** `frontend/src/main.tsx` não envolve App com QueryClientProvider

**Código Atual (ERRADO):**
```typescript
// main.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**Uso em Código:**
```typescript
// BibliotecaDigital.tsx
const queryClient = useQueryClient();  // ❌ Quebra aqui - provider não existe
```

**Causa Raiz:** main.tsx nunca foi atualizado após adicionar React Query à arquitetura.

### Correção

**Código Correto:**
```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 10,   // 10 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
```

**Ação:** Atualizar [`frontend/src/main.tsx`](frontend/src/main.tsx) linhas 1-10

---

## 2️⃣ PROBLEMA: Tabela Mismatch - catalogo vs catalogo_itens

### Diagnóstico

**Achado:** Frontend usa `catalogo`, backend schema usa `catalogo_itens`

**Frontend (ERRADO):**
```typescript
// useApi.ts
export async function getCatalogList() {
  return supabase
    .from('catalogo')  // ❌ tabela não existe
    .select('*')
}
```

**Backend (CORRETO):**
```sql
-- 1769916319_fix_catalogo_columns.sql
ALTER TABLE catalogo_itens
  ADD COLUMN titulo TEXT NOT NULL;
```

**Causa Raiz:** Schema evoluiu em migrations mas código frontend não foi sincronizado.

### Correção

**Opção A (Recomendada):** Atualizar frontend para usar `catalogo_itens`

```typescript
// useApi.ts - CORRIGIR
export async function getCatalogList(options) {
  return supabase
    .from('catalogo_itens')  // ✅ nome correto
    .select('*')
    .range(start, end)
}

// Todos os calls:
// - searchCatalog() → .from('catalogo_itens')
// - getCatalogItem() → .from('catalogo_itens')
// - createCatalogItem() → .from('catalogo_itens')
// - updateCatalogItem() → .from('catalogo_itens')
// - deleteCatalogItem() → .from('catalogo_itens')
```

**Opção B (Alternativa):** Criar view `catalogo` apontando para `catalogo_itens`

```sql
-- migrations/1770300000_create_catalogo_view.sql
CREATE OR REPLACE VIEW catalogo AS
  SELECT * FROM catalogo_itens;

-- Então update RLS
ALTER VIEW catalogo OWNER TO authenticated;
```

**Recomendação:** Usar Opção A (mais simples) - atualizar todos os `.from('catalogo')` para `.from('catalogo_itens')` em [`frontend/src/hooks/useApi.ts`](frontend/src/hooks/useApi.ts)

---

## 3️⃣ PROBLEMA: Deploy Aponta para App Errado

### Diagnóstico

**Achado:** `vercel.json` aponta para `acervo-rc`, não para `frontend`

**Código Atual (ERRADO):**
```json
// vercel.json
{
  "buildCommand": "cd project_analysis/acervo-rc && npm run build",
  "outputDirectory": "project_analysis/acervo-rc/dist",
  "framework": "vite",
  "functions": { ... }
}
```

**Problema:** Deploy publicará app errado

### Correção

```json
// vercel.json - CORRIGIR
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "functions": {
    "supabase/functions/**": {
      "runtime": "edge"
    }
  }
}
```

**Ação:** Atualizar [`vercel.json`](vercel.json) linhas de build

---

## 4️⃣ PROBLEMA: verify_jwt Desativado em Functions

### Diagnóstico

**Achado:** `supabase/config.toml` tem `verify_jwt = false`

**Código Atual (ERRADO):**
```toml
# supabase/config.toml
[functions.search-catalogo]
verify_jwt = false  # ❌ API sem autenticação!
```

**Risco:** API aberta sem verificação JWT

### Correção

```toml
# supabase/config.toml
[functions.search-catalogo]
verify_jwt = true  # ✅ Requer JWT válido
```

**Nota:** Se precisa de acesso anônimo, usar RLS na tabela ao invés.

**Ação:** Atualizar [`supabase/config.toml`](supabase/config.toml) - mudar todos `verify_jwt = false` para `true`

---

## 5️⃣ PROBLEMA: Soft Delete Contrato Divergente

### Diagnóstico

**Frontend Espera:**
```typescript
// useApi.ts - imagina status
interface CatalogItem {
  status: 'active' | 'deleted'  // ❌ campo não existe
}

// Delete operation
await supabase
  .from('catalogo_itens')
  .update({ status: 'deleted' })  // ❌ coluna não existe
```

**Backend Usa:**
```sql
-- 1769978313_add_soft_delete.sql
ALTER TABLE catalogo_itens
  ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
  ADD COLUMN is_active BOOLEAN DEFAULT true;
```

**Causa Raiz:** Frontend nunca foi atualizado para novo contrato soft delete.

### Correção

**Atualizar Types:**
```typescript
interface CatalogItem {
  id: string;
  titulo: string;
  deleted_at?: string | null;  // soft delete
  is_active: boolean;
  // ... outros campos
}
```

**Atualizar Delete Operation:**
```typescript
export async function deleteCatalogItem(id: string) {
  return supabase
    .from('catalogo_itens')
    .update({ 
      deleted_at: new Date().toISOString(),
      is_active: false 
    })
    .eq('id', id);
}
```

**Atualizar Queries (adicionar filtro):**
```typescript
export async function getCatalogList() {
  return supabase
    .from('catalogo_itens')
    .select('*')
    .is('deleted_at', null)  // ✅ filtra soft-deleted
    .eq('is_active', true);
}
```

**Ação:** Atualizar [`frontend/src/hooks/useApi.ts`](frontend/src/hooks/useApi.ts) e [`frontend/src/services/supabaseClient.ts`](frontend/src/services/supabaseClient.ts)

---

## 6️⃣ PROBLEMA: RPC search_catalogo Depende de View Faltante

### Diagnóstico

**Achado:** RPC espera view `v_catalogo_completo` que pode não ser criada

```sql
-- 1770169200_optimize_search_catalogo.sql
CREATE FUNCTION search_catalogo(query text)
RETURNS TABLE (...) AS $$
BEGIN
  SELECT * FROM v_catalogo_completo  -- ❌ view pode não existir
  WHERE ...
END
$$
```

**Risco:** Se migration que cria `v_catalogo_completo` não rodar, RPC quebra

### Verificação Necessária

**Rodar no Supabase:**
```sql
-- Verificar se view existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'v_catalogo_completo'
);

-- Se não existe, criar:
CREATE OR REPLACE VIEW v_catalogo_completo AS
SELECT 
  id, titulo, descricao, categoria, 
  data_criacao, localidade_geom, is_active, deleted_at
FROM catalogo_itens
WHERE deleted_at IS NULL AND is_active = true;
```

**Ação:** Verificar que migration existe e foi aplicada. Se não, criar view manualmente ou adicionar migration.

---

## 7️⃣ PROBLEMA: GIS Paths Absolutos (Não Portável)

### Diagnóstico

**Achado:** Scripts Python usam caminhos absolutos

```python
# scripts/01_ingest_kml.py
KML_FOLDER = '/home/user/dados/kml'  # ❌ hardcoded
output_dir = '/home/user/projeto/output'  # ❌ hardcoded
```

**Risco:** Pipeline não funciona em outro computador/servidor

### Correção

```python
# scripts/01_ingest_kml.py
import os
from pathlib import Path

# Use relative paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent

KML_FOLDER = PROJECT_ROOT / 'data' / 'raw' / 'kml'  # ✅ relativo
OUTPUT_DIR = PROJECT_ROOT / 'data' / 'processed'    # ✅ relativo

# Criar se não existir
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Usar Path objects
for kml_file in KML_FOLDER.glob('*.kml'):
    process_file(kml_file)
    output_file = OUTPUT_DIR / f"{kml_file.stem}_processed.geojson"
```

**Ação:** Atualizar `scripts/01_ingest_kml.py`, `scripts/02_validate_topology.py`, `scripts/03_enrich_data.py` com caminhos relativos

---

## 8️⃣ PROBLEMA: GIS Area Divergence 49.29%

### Diagnóstico

**Achado:** Relatório GIS mostra delta -49.29% na área calculada

```
Delta: 3810.12 ha (49.29%)
Área esperada: ~7.600 ha
Área calculada: ~3.790 ha
```

**Possíveis Causas:**
1. Projeção incorreta (WGS84 vs local)
2. Polígono incompleto (anéis faltando)
3. Diferentes métodos cálculo (Shoelace vs PostGIS)

### Verificação

```sql
-- Rodar no PostGIS
SELECT 
  ST_Area(geom::geography) / 10000 as area_hectares,
  ST_IsValid(geom),
  ST_GeometryType(geom)
FROM gis_features
WHERE id = 'boundary_principal'
LIMIT 1;

-- Se area está errada:
SELECT 
  COUNT(*) as total_features,
  SUM(ST_Area(geom::geography) / 10000) as total_area_hectares
FROM gis_features
WHERE is_valid = true;
```

### Resolução

**Opção A:** Aceitar 49% divergence se estiver dentro de tolerância GIS  
**Opção B:** Validar polígono com `ST_MakeValid()`  
**Opção C:** Re-importar KML com projeção corrigida

**Recomendação:** Análise post-S2 com validador externo. Não bloqueia S2.

**Ação:** Gerar relatório técnico explicando divergência

---

## 9️⃣ PROBLEMA: Sem Roteamento para Museum/Map (S3)

### Diagnóstico

**Achado:** App.tsx renderiza apenas Biblioteca Digital

```typescript
// App.tsx
function App() {
  return <BibliotecaDigital />;  // ❌ apenas 1 página
}
```

**Navegação Navbar:**
```typescript
// Navbar.tsx
<a href="#museum">Museum</a>  // ❌ anchor sem rota
<a href="#map">Map</a>        // ❌ anchor sem rota
```

**Risco:** S3 espera Museum e Map componentes acessíveis

### Correção

**Adicionar React Router:**
```bash
npm install react-router-dom
```

**Atualizar App.tsx:**
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BibliotecaDigital } from './pages/BibliotecaDigital';
import { Museum } from './pages/Museum';  // ⬜ criar em S3
import { GISMap } from './pages/GISMap';  // ⬜ criar em S3

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BibliotecaDigital />} />
        <Route path="/museum" element={<Museum />} />
        <Route path="/map" element={<GISMap />} />
      </Routes>
    </Router>
  );
}
```

**Atualizar Navbar:**
```typescript
import { Link } from 'react-router-dom';

<Link to="/">Biblioteca</Link>
<Link to="/museum">Museum</Link>
<Link to="/map">Map</Link>
```

**Ação:** Não bloqueia S2. Adicionar roteamento como parte de Tarefa 2.2. Museum e Map componentes são S3.

---

## 🎯 PLANO DE CORREÇÃO (HOJE - SEXTA 6 FEV)

### Prioridade 🔴 CRÍTICA (HOJE):

1. **✅ Problema 1** - QueryClientProvider
   - Arquivo: `frontend/src/main.tsx`
   - Tempo: 15 min
   - Ação: Adicionar QueryClient + Provider

2. **✅ Problema 2** - Tabela catalogo → catalogo_itens
   - Arquivo: `frontend/src/hooks/useApi.ts`, `frontend/src/services/supabaseClient.ts`
   - Tempo: 30 min
   - Ação: Find-replace `.from('catalogo')` → `.from('catalogo_itens')`
   - Validar: 12+ ocorrências

3. **✅ Problema 3** - Deploy vercel.json
   - Arquivo: `vercel.json`
   - Tempo: 10 min
   - Ação: Atualizar buildCommand e outputDirectory

4. **✅ Problema 4** - verify_jwt em config.toml
   - Arquivo: `supabase/config.toml`
   - Tempo: 5 min
   - Ação: Mudar `verify_jwt = false` → `true`

5. **✅ Problema 5** - Soft delete contrato
   - Arquivo: `frontend/src/hooks/useApi.ts`
   - Tempo: 45 min
   - Ação: Atualizar types + queries + mutation

6. **⚠️ Problema 6** - View v_catalogo_completo
   - Validação em Supabase (run SQL)
   - Tempo: 20 min
   - Ação: Verificar se existe, criar se falta

### Prioridade 🟠 ALTA (PÓS-S2):

7. **✅ Problema 7** - GIS paths absolutos
   - Arquivo: `scripts/*.py`
   - Tempo: 1h
   - Ação: Converter para relative paths
   - Não bloqueia S2 (GIS é S1)

### Prioridade 🟡 MÉDIA (S3):

8. **Problema 8** - GIS area divergence
   - Análise pós-S2
   - Não bloqueia

9. **Problema 9** - Roteamento
   - Adicionar como parte Tarefa 2.2
   - Não bloqueia S2 (rotas são S2-S3)

---

## 📋 CHECKLIST CORREÇÃO

### Sexta 6 Feb - Hoje:
- [ ] Problema 1: QueryClientProvider em main.tsx
- [ ] Problema 2: Tabela catalogo → catalogo_itens (find-replace)
- [ ] Problema 3: vercel.json outputDirectory
- [ ] Problema 4: config.toml verify_jwt = true
- [ ] Problema 5: Soft delete tipos + queries
- [ ] Problema 6: Validar view v_catalogo_completo
- [ ] Problema 7: GIS paths absolutos (ou deixar para segunda)
- [ ] Gerar: RELATORIO_CORRECOES_6FEB.md

### Segunda 13 Feb - Validação:
- [ ] `npm run build` → sem erros
- [ ] `npm run lint` → sem warnings
- [ ] `npm test` → testes passando
- [ ] Teste manual: `npm run dev` → app renderiza

---

## 🔧 PRÓXIMOS PASSOS

1. **Agora:** Começar Problema 1 (QueryClientProvider)
2. **Depois:** Problema 2-5 em sequência
3. **Validar:** `npm run build` após cada correção
4. **Commit:** Git push com mensagem clara

**Tempo Total Estimado:** 2-3 horas para todos 6 problemas críticos

---

**Preparado por:** Roo (Tech Lead - Debug Mode)  
**Data:** 6 Fevereiro 2026, 03:46 AM  
**Status:** PRONTO PARA EXECUÇÃO DE CORREÇÕES  
**Próxima Ação:** Começar Problema 1 imediatamente

