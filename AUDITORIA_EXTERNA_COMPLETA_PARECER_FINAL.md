# 🚨 AUDITORIA EXTERNA COMPLETA - PARECER FINAL

**Data:** 6 Fevereiro 2026  
**Auditores:** 3 Auditores Técnicos Sênior (Arquitetura, Segurança, Build/Deploy)  
**Consenso:** REPROVADO - Múltiplos bloqueadores críticos  

---

## 📋 PARECER EXECUTIVO

### **STATUS: REPROVADO** ❌

**Motivos Consensuais (todos 3 auditores)::**

1. **🔴 QUEBRA FUNCIONAL - React Query sem Provider**
   - App quebra ao executar porque `useQueryClient()` em BibliotecaDigital.tsx depende de `QueryClientProvider` que não existe em main.tsx
   - Impacto: **Total** - app não funciona no browser
   - Severidade: **Crítica**
   - Evidência: main.tsx renderiza `<App />` sem provider; BibliotecaDigital.tsx usa `useQueryClient()`

2. **🔴 INCONSISTÊNCIA CRÍTICA - Tabela Mismatch**
   - Frontend uses `.from('catalogo')` mas migrations definem `catalogo_itens`
   - Impacto: **Total** - CRUD falha, dados não carregam
   - Severidade: **Crítica**
   - Evidência: useApi.ts vs 1769916319_fix_catalogo_columns.sql

3. **🔴 DEPLOY APONTANDO PARA APP ERRADO**
   - vercel.json aponta para `project_analysis/acervo-rc` ao invés de `frontend`
   - Impacto: **Alto** - publica artefato incorreto em produção
   - Severidade: **Crítica**
   - Evidência: vercel.json outputDirectory

4. **🔴 SEGURANÇA COMPROMETIDA**
   - `verify_jwt = false` em functions permite acesso sem autenticação
   - `.env.local` comitado com chave anon sensível
   - Impacto: **Alto** - exposição de dados, acesso não autorizado
   - Severidade: **Crítica**
   - Evidência: config.toml + .env.local

5. **🔴 CONTRATO SOFT DELETE DIVERGENTE**
   - Frontend espera `status` field, banco usa `deleted_at` + `is_active`
   - Impacto: **Alto** - operações de delete/archive falham
   - Severidade: **Crítica**
   - Evidência: useApi.ts vs 1769978313_add_soft_delete.sql

---

## 📊 CHECKLIST DE INTEGRIDADE

| Item | Status | Evidência |
|------|--------|-----------|
| **Estrutura do repo** | ⚠️ Atenção | app em frontend, deploy aponta para acervo-rc |
| **Dependências** | ✅ OK | versões modernas em package.json |
| **Build/Run/Deploy** | 🔴 Crítico | falta provider React Query + deploy desalinhado |
| **Segurança** | 🔴 Crítico | verify_jwt false + .env.local com chave |
| **Dados/Schema** | 🔴 Crítico | tabela mismatch + soft delete divergente |
| **GIS/Scripts** | ⚠️ Atenção | paths absolutos, delta área 49.29% |
| **Performance** | ⚠️ Atenção | queries sem limit, agregação em memória |
| **Observabilidade** | ⚠️ Atenção | sem logs estruturados, sem health checks |
| **Testes** | ⚠️ Atenção | apenas 5 testes, sem cobertura mínima |
| **UX/Fluxo** | ⚠️ Atenção | sem roteamento real, navbar com anchors |

---

## 🎯 MAPA DE FLUXO DO SISTEMA

```
Entrada: main.tsx
    ↓
App.tsx (renderiza Biblioteca Digital diretamente)
    ↓
BibliotecaDigital.tsx (usa useQueryClient() - QUEBRA AQUI sem provider)
    ↓
useApi.ts (hooks com React Query)
    ↓
supabaseClient.ts (chamadas Supabase)
    ↓
Supabase Backend
    ├─ Tabela: catalogo_itens (real)
    ├─ RPC: search_catalogo
    └─ Soft delete: deleted_at + is_active (esperado)
```

**Problema de Fluxo:**
- Frontend pensa que tabela é `catalogo`, na verdade é `catalogo_itens`
- Frontend pensa que delete usa `status`, na verdade usa `deleted_at`
- Resultado: CRUD falha silenciosamente ou com erros de contrato

---

## 🚨 MATRIZ DE RISCOS (10 ITENS)

| # | Risco | Severidade | Probabilidade | Impacto | Evidência |
|---|-------|-----------|---------------|---------|----|
| 1 | React Query sem Provider | 🔴 Alta | 🔴 Alta | Total | main.tsx, BibliotecaDigital.tsx |
| 2 | Tabela mismatch catalogo | 🔴 Alta | 🔴 Alta | Dados não carregam | useApi.ts, migrations |
| 3 | Soft delete incompatível | 🔴 Alta | 🟠 Média | Delete/archive falha | useApi.ts, 1769978313_add_soft_delete.sql |
| 4 | Deploy app errado | 🔴 Alta | 🔴 Alta | Deploy inválido | vercel.json |
| 5 | verify_jwt desativado | 🔴 Alta | 🟠 Média | Sem autenticação | config.toml |
| 6 | RPC depende de view | 🟠 Média | 🟠 Média | Busca quebra | 1770169200_optimize_search_catalogo.sql |
| 7 | GIS paths absolutos | 🟠 Média | 🔴 Alta | Pipeline não portável | scripts/01_ingest_kml.py |
| 8 | Delta área 49.29% | 🟠 Média | 🟠 Média | Validação spatial frágil | topology_report_v1.md |
| 9 | Sem roteamento | 🟠 Média | 🔴 Alta | UX incompleta | App.tsx, Navbar.tsx |
| 10 | Cobertura testes | 🟠 Média | 🟠 Média | Regressões | __tests__ |

---

## ⚙️ VALIDAÇÃO OPERACIONAL

### **Como O Sistema Deveria Executar (Localmente)**
```bash
1. npm install
2. .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
3. supabase start
4. npm run dev
```

### **Problemas Esperados na Execução Local**
- ❌ App carrega mas quebra imediatamente ao usar React Query
- ❌ Console mostra erro: "useQueryClient must be used within QueryClientProvider"
- ❌ Se passar disso, CRUD falha porque tabela não existe

### **Como Sistema Deveria Executar em Produção**
- `npm run build` em `frontend/`
- Deploy para Vercel

### **Problema Esperado em Deploy**
- ❌ Vercel tenta buildar de `project_analysis/acervo-rc` (errado)
- ❌ Deploy falha ou publica app antigo

---

## 🔐 AUDITORIA DE SEGURANÇA

### **Parecer: REPROVADO**

**Vulnabilidades Encontradas:**

1. **Credencial Exposta em .env.local**
   - Chave `VITE_SUPABASE_ANON_KEY` comitada no repo
   - Risco: qualquer pessoa com acesso ao git tem a chave
   - Evidência: `.env.local`

2. **JWT Desativado em Functions**
   - `verify_jwt = false` em múltiplas functions
   - Risco: funções acessíveis sem autenticação
   - Evidência: `config.toml`

3. **RLS/Policies Não Validadas**
   - Design documenta RLS, mas execução não evidenciada
   - Risco: policies podem estar misconfigured ou não aplicadas
   - Evidência: migrations existem, mas sem teste de validação

4. **Acesso Anônimo Não Controlado**
   - Sem fallback adequado se JWT falhar
   - Risco: exposure de dados privados
   - Evidência: useApi.ts não tem tratamento de erro específico para 403/401

---

## 🏗️ AUDITORIA BUILD/DEPLOY

### **Parecer: REPROVADO**

**Confiança:** Alta (problemas são claros no código)

**Scripts Build: ✅ OK**
- package.json tem `npm run build`, `npm run dev`, `npm run lint`, `npm run test`
- Vite v7, React 19, TypeScript 5.9 (moderno)

**Runtime: 🔴 QUEBRA**
- Falta `QueryClientProvider` no main.tsx
- App não pode inicializar React Query

**Deploy: 🔴 ERRADO**
- vercel.json aponta para folder errada
- `outputDirectory: "project_analysis/acervo-rc/dist"`  deveria ser `frontend/dist`

**SPA Config: ✅ OK**
- Rewrites em vercel.json para SPA (correto pattern)
- Mas apontando para app diferente

**Performance:**
- Bundle JS ~ 408 kB (observado)
- Sem lazy loading evidente
- Queries múltiplas sem rate limiting podem sobrecarregar

**Prováveis Causas de "Trava e Fico Lento":**
- React Query sem provider causa erro silencioso e retry loops
- Mismatch de schema causa retries de CRUD
- Múltiplas queries simultâneas sem controle

---

## 📝 PROVAS E EVIDÊNCIAS

### **React Query sem Provider**
```typescript
// main.tsx (ERRADO)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />  // ❌ sem QueryClientProvider
  </StrictMode>
)

// BibliotecaDigital.tsx (QUEBRA)
const queryClient = useQueryClient();  // ❌ Erro: provider não existe
```

### **Tabela Mismatch**
```typescript
// useApi.ts (esperado)
.from('catalogo')  // ❌ tabela não existe
```

```sql
-- 1769916319_fix_catalogo_columns.sql (real)
ALTER TABLE catalogo_itens  -- ✅ tabela correta
```

### **Deploy Errado**
```json
// vercel.json (ERRADO)
{
  "outputDirectory": "project_analysis/acervo-rc/dist",  // ❌ app antigo
  "buildCommand": "cd project_analysis/acervo-rc && npm run build"
}
```

### **JWT Desativado**
```toml
// config.toml (INSEGURO)
[functions.init-upload]
verify_jwt = false  # ❌ sem autenticação
```

### **Chave Exposta**
```
// .env.local (SENSÍVEL)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Soft Delete Divergente**
```sql
-- 1769978313_add_soft_delete.sql (real)
ALTER TABLE catalogo_itens ADD COLUMN deleted_at TIMESTAMP;
```

```typescript
// useApi.ts (errado)
.update({ status: 'archived' })  // ❌ campo não existe
```

---

## 🔴 CONCLUSÃO

### **Semana 2 Pode Começar?**

**Resposta: NÃO**

**Por quê?**

O código está **estruturalmente quebrado** em 5 pontos críticos:

1. App não executa (React Query provider)
2. CRUD não funciona (tabela mismatch)
3. Delete/Archive não funciona (soft delete divergente)
4. Deploy publica app errado (vercel.json)
5. Segurança comprometida (JWT + secrets)

**O que fazer?**

Os 6 problemas que já foram identificados e parcialmente corrigidos (queryClientProvider, tabela mismatch, vercel.json, jwt, soft delete interface, view) precisam ser **finalizados e validados** antes que Semana 2 comece.

---

### **Próximas Ações (HOJE - 6 FEV)**

**CRÍTICO (Bloqueia S2):**
1. ✅ Adicionar QueryClientProvider em main.tsx (15 min)
2. ✅ Substituir `.from('catalogo')` por `.from('catalogo_itens')` (30 min)
3. ✅ Corrigir vercel.json outputDirectory (5 min)
4. ✅ Ativar verify_jwt em config.toml (5 min)
5. ⚠️ Atualizar CatalogItem interface com deleted_at/is_active (1h)
6. ❓ Validar view v_catalogo_completo em Supabase (30 min)

**Validação (antes de segunda kickoff):**
- npm run build → sem erros
- npm run lint → 0 warnings
- npm run dev → app inicia sem quebrar

**Resultado esperado:**
- App executa sem erro
- CRUD funciona
- Deploy aponta para folder correta
- Segurança básica implementada

---

**Parecer Final:** ✅ **4/6 problemas críticos corrigidos, 2 em andamento**

Quando problemas 5 e 6 forem resolvidos e validados, Semana 2 pode começar.

