# 🚀 S2 KICKOFF CHECKLIST FINAL (13 FEVEREIRO 2026)

**Checklist Executivo para Início da Semana 2**  
**Uso:** Segunda 13 Fevereiro, 08:00 AM (Kickoff Meeting)  
**Duração Esperada:** 15 minutos  
**Próximo:** Start Tarefa 2.1 às 09:15

---

## ✅ VERIFICAÇÃO DE VIABILIDADE TÉCNICA (Pré-Reunião)

### 🖥️ Ambiente Local

- [ ] **Node.js + npm**
  ```bash
  node --version  # Esperado: v18+
  npm --version   # Esperado: v9+
  ```
  
- [ ] **Dependências instaladas**
  ```bash
  cd frontend && npm list @tanstack/react-query
  # Esperado: @tanstack/react-query@latest instalado
  ```

- [ ] **Build limpo**
  ```bash
  cd frontend
  npm run build
  # Esperado: ✅ dist/ criada, 0 errors
  ```

- [ ] **Linter passing**
  ```bash
  npm run lint
  # Esperado: ✅ 0 errors, 0 warnings (ou warnings conhecidos)
  ```

- [ ] **TypeScript strict**
  ```bash
  npm run type-check
  # Esperado: ✅ 0 errors em strict mode
  ```

### 🐳 Docker & Supabase Local

- [ ] **Docker Desktop rodando**
  ```bash
  docker ps
  # Esperado: Sem erro "Cannot connect to Docker daemon"
  ```

- [ ] **Supabase local status**
  ```bash
  cd supabase
  supabase status
  # Esperado: DB, API, Inbucket rodando
  ```

- [ ] **Conexão Supabase verificada**
  ```bash
  # No Supabase Dashboard ou CLI:
  supabase db list
  # Esperado: Tabelas e migrations visíveis
  ```

### 🗄️ Banco de Dados

- [ ] **Tabela `catalogo_itens` existe**
  ```sql
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_name = 'catalogo_itens';
  # Esperado: 1 (existe)
  ```

- [ ] **View `v_catalogo_completo` existe**
  ```sql
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_name = 'v_catalogo_completo'
  ) as view_exists;
  # Esperado: true
  ```

- [ ] **RPC `search_catalogo` funciona**
  ```sql
  SELECT search_catalogo('test', 10);
  # Esperado: Sem erro, retorna JSON array
  ```

- [ ] **Soft delete campos existem**
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'catalogo_itens' 
  AND column_name IN ('deleted_at', 'is_active');
  # Esperado: 2 linhas (ambos campos existem)
  ```

### 🔒 Autenticação & RLS

- [ ] **JWT verificação habilitada**
  ```toml
  # Em supabase/config.toml:
  # [functions.init-upload]
  # verify_jwt = true ✅
  # [functions.finalize-upload]
  # verify_jwt = true ✅
  ```

- [ ] **RLS policies em catalogo_itens**
  ```sql
  SELECT COUNT(*) FROM information_schema.role_table_grants 
  WHERE table_name = 'catalogo_itens' 
  AND privilege_type = 'SELECT';
  # Esperado: >= 1 (policies ativas)
  ```

### 📂 Estrutura de Código

- [ ] **`frontend/src/hooks/useApi.ts` atualizado**
  - [ ] useDeleteCatalogItem() usa deleted_at + is_active
  - [ ] Todas as 8 queries apontam para catalogo_itens
  - [ ] TypeScript types atualizados

- [ ] **`frontend/src/main.tsx` com QueryClientProvider**
  ```typescript
  // Esperado: QueryClientProvider wrapping App
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
  ```

- [ ] **`vercel.json` aponta para frontend/**
  ```json
  {
    "installCommand": "cd frontend && npm ci",
    "buildCommand": "cd frontend && npm run build",
    "outputDirectory": "frontend/dist"
  }
  ```

---

## 🎯 CONFIRMAÇÃO DE OBJETIVOS (S2 Semana 2)

### Objetivo Geral Semana 2

**Construir interface web completa da Biblioteca Digital com 10+ componentes React reutilizáveis, CRUD Supabase integrado, 3 view modes (Grid/List/Map), e 25+ testes passando.**

**Resultado Esperado:** Ao final de 19 Feb, estar 100% pronto para Semana 3 (Integração GIS + Museum)

### 5 Tarefas Específicas (25 horas)

| # | Tarefa | Duração | Dias | Status |
|---|--------|---------|------|--------|
| 2.1 | Component Library Reutilizável (10+ componentes) | 5h | 13-14 | ⬜ |
| 2.2 | Biblioteca Digital Interface (Grid/List/Map) | 8h | 14-15 | ⬜ |
| 2.3 | CRUD Supabase Integrado | 6h | 15-18 | ⬜ |
| 2.4 | Testes Automatizados (25+) | 4h | 18-19 | ⬜ |
| 2.5 | Consolidação & Entrega | 2h | 19 | ⬜ |

**Total:** 25 horas em 7 dias úteis (13-19 Feb)  
**Buffer:** 15 horas para escalations/bugs

---

## 📋 DEPENDÊNCIAS CONFIRMADAS (10+ Necessárias)

### Bibliotecas NPM

- [x] @tanstack/react-query (^5.0.0)
  - Status: ✅ Instalada em frontend/package.json
  - Uso: Caching, queries, mutations

- [x] @supabase/supabase-js (^2.0.0)
  - Status: ✅ Instalada
  - Uso: Cliente para DB, auth, functions

- [x] React (^19.0.0)
  - Status: ✅ Instalada
  - Uso: Framework UI

- [x] TypeScript (^5.0.0)
  - Status: ✅ Instalada
  - Uso: Type safety

- [x] Vitest (latest)
  - Status: ✅ Configurado em vitest.config.ts
  - Uso: Testes unitários

- [x] CSS Modules
  - Status: ✅ Nativa em Vite
  - Uso: Estilos isolados por componente

### Dados & Schema

- [x] Supabase Schema versão 2.0
  - Status: ✅ 50+ migrations aplicadas
  - Arquivos: supabase/migrations/
  - Última: 1770369000_create_view_catalogo_completo.sql

- [x] Tabela catalogo_itens
  - Status: ✅ Existe com 20+ colunas
  - Campos críticos: id, titulo, categoria, deleted_at, is_active

- [x] View v_catalogo_completo
  - Status: ✅ Criada em migration 1770369000
  - Uso: Search completa com soft delete

- [x] RPC search_catalogo
  - Status: ✅ Função Postgres criada
  - Parâmetros: query (text), limit (int)

### Infraestrutura

- [x] Docker + Supabase Local
  - Status: ✅ Configurado
  - Arquivo: docker-compose.yml (em Supabase)

- [x] Git Repository
  - Status: ✅ 214 files committed em 6 Feb
  - Branch: main
  - Remote: origin (GitHub/GitLab)

- [x] Vercel Deploy
  - Status: ✅ Pronto
  - Config: vercel.json com frontend/ correto

---

## 🛠️ RECURSOS DISPONÍVEIS

### Documentação

- ✅ [`PLANO_EXECUCAO_SEMANA_2_DETALHADO.md`](PLANO_EXECUCAO_SEMANA_2_DETALHADO.md)
  - Roadmap diário (seg-sex)
  - Componentes a criar
  - Critério de aceitação

- ✅ [`SEMANA_2_KICKOFF_READINESS.md`](SEMANA_2_KICKOFF_READINESS.md)
  - Deliverables detalhados
  - Estados gerenciar
  - Implementação com React Query

- ✅ [`DIAGNOSTICO_9_PROBLEMAS_CRITICOS.md`](DIAGNOSTICO_9_PROBLEMAS_CRITICOS.md)
  - Contexto de problemas resolvidos
  - Referência rápida

- ✅ [`docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md`](docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md)
  - Schema completo
  - Relacionamentos
  - Índices de performance

### Código de Referência

- ✅ [`frontend/src/hooks/useApi.ts`](frontend/src/hooks/useApi.ts)
  - CRUD hooks existentes
  - Padrão React Query

- ✅ [`frontend/src/components/`](frontend/src/components/)
  - Componentes base existentes
  - Estilos CSS Modules

- ✅ [`frontend/src/__tests__/`](frontend/src/__tests__/)
  - Testes exemplo (Vitest)
  - Padrão de assertions

### Licenças & APIs

- ✅ Supabase Project
  - Status: Ativa
  - Tier: Pode ser Free ou Pro
  - Rate limits: Standard aplicados

- ✅ Vercel
  - Status: Integrado
  - Deployments: Automático em push

- ✅ GitHub/GitLab
  - Status: Repository ativa
  - Acesso: Completo para commits

---

## 📊 MÉTRICAS DE SUCESSO

### Build & Code Quality

- [x] **Lint:** 0 errors
  - Comando: `npm run lint`
  - Status: ✅ Passar como pré-requisito

- [x] **TypeScript:** 0 errors (strict mode)
  - Comando: `npm run type-check`
  - Status: ✅ Passar como pré-requisito

- [x] **Build:** dist/ criado sem erro
  - Comando: `npm run build`
  - Status: ✅ Passar diariamente

### Testes

- [ ] **Cobertura:** 25+ testes passando
  - Framework: Vitest
  - Target: >= 25 by 19 Feb
  - Stretch: 50+

- [ ] **Coverage:** >= 60% (linhas de código)
  - Ferramenta: Vitest coverage
  - Áreas: components, hooks, integração

### Funcionalidade

- [ ] **Componentes:** 10+ compilando
  - SearchBar, FilterPanel, ItemCard (existentes)
  - Navbar, LoadingSpinner, Modal, Pagination, EmptyState, ItemDetail, TagCloud (novos)

- [ ] **Interface:** Biblioteca Digital page
  - Grid view ✓
  - List view ✓
  - Map view ✓
  - Search + Filter em tempo real ✓

- [ ] **CRUD:** 100% integrado com Supabase
  - READ: list, search, get, categories ✓
  - CREATE: novo item ✓
  - UPDATE: item existente ✓
  - DELETE: soft delete com deleted_at ✓

### Entrega

- [ ] **Consolidation Report:** Gerado e validado
- [ ] **Git Commit:** Histórico limpo com mensagens descritivas
- [ ] **Preparado para S3:** Sem dependências não resolvidas

---

## 📅 ROADMAP SEMANA 2 (13-19 FEB)

### 🗓️ SEGUNDA 13 FEV
**Tema:** Kickoff + Setup + Componentes Base

- 08:00 - 08:15: **Reunião Kickoff** (este checklist)
- 09:15 - 17:00: **Tarefa 2.1 PT1** - SearchBar, FilterPanel, ItemCard, Navbar, LoadingSpinner review + criação

**Entregável:** 5 componentes compilando, 0 TS errors

### 🗓️ TERÇA 14 FEV
**Tema:** Mais componentes + Testes

- 09:00 - 17:00: **Tarefa 2.1 PT2** - Modal, Pagination, EmptyState, ItemDetail, TagCloud + index.ts

**Entregável:** 10 componentes + export index

### 🗓️ QUARTA 15 FEV
**Tema:** Integração & Interface

- 09:00 - 13:00: **Tarefa 2.2 PT1** - BibliotecaDigital page com 3 view modes
- 13:00 - 17:00: **Tarefa 2.3 PT1** - CRUD read operations (list, search, get)

**Entregável:** Page estruturada, queries funcionando

### 🗓️ QUINTA 16 FEV
**Tema:** CRUD Completo

- 09:00 - 17:00: **Tarefa 2.3 PT2** - CRUD create, update, delete + React Query mutations

**Entregável:** CRUD 100% integrado, soft delete validado

### 🗓️ SEXTA 17 FEV
**Tema:** Testes & Auditoria

- 09:00 - 13:00: **Tarefa 2.4 PT1** - Testes unitários componentes (15+)
- 13:00 - 17:00: **Tarefa 2.4 PT2** - Testes integração hooks (10+)

**Entregável:** 25+ testes passando

### 🗓️ SEGUNDA 20 FEV (OPCIONAL - BUFFER)
**Tema:** Remediation & Consolidação

- 09:00 - 17:00: **Tarefa 2.5** - Build clean, consolidation report, validação final

**Entregável:** 0 errors, relatório S2 concluído

---

## 🔄 COMUNICAÇÃO E ESCALAÇÃO

### Daily Standup (Implícito no Código)

**Formato:** Git commits + código-comentado  
**Frequência:** 1x por dia (fim do turno)  
**Conteúdo:**
```
git commit -m "Tarefa 2.1 PT1: 5 componentes criados + testes

- SearchBar: review + debounce validado
- FilterPanel: props expandidas
- ItemCard: soft delete UI
- Navbar: novo componente
- LoadingSpinner: novo componente
- Status: 5/10 componentes prontos
- Bloqueadores: Nenhum
"
```

### Bloqueadores & Escalação

**Se bloqueado em qualquer ponto:**

1. **Documentar o bloqueador**
   - Arquivo: `BLOQUEADOR_[DATA]_[TAREFA].md`
   - Conteúdo: Descrição, stack trace, tentativas

2. **Avisar via commit comment**
   ```
   git commit -m "WIP: [BLOQUEADOR] Tarefa 2.1 - Component props type error
   
   Erro: Cannot assign type CatalogItem[] to ItemCard[] in FilterPanel
   Arquivo: frontend/src/components/library/FilterPanel.tsx:42
   
   Ações tentadas:
   - Revisar tipos em useApi.ts
   - Atualizar interface CatalogItem
   
   Esperando: Validação de tipos soft delete
   "
   ```

3. **Parar progressão, manter código limpo**
   - Não committar código quebrado
   - Reverter últimas mudanças até ponto estável

### Sucesso & Validação

**Critério de Aprovação por Tarefa:**

- ✅ Código compila (0 TS errors)
- ✅ Testes passam (100% green)
- ✅ Build passa (npm run build)
- ✅ Linter passa (npm run lint)
- ✅ Git history limpo (mensagens descritivas)

---

## ⚠️ RISCOS & MITIGAÇÃO

### Risco 1: Interface CatalogItem Types Incompleta

**Descrição:** Soft delete contrato ainda não atualizado  
**Impacto:** CRUD quebra durante Tarefa 2.3  
**Mitigação:** Primeira coisa segunda, antes de 2.1

**Ação:**
```typescript
// frontend/src/types/index.ts
export interface CatalogItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  data_criacao: string;
  arquivo_url?: string;
  thumbnail_url?: string;
  localidade_geom?: object;
  is_active: boolean;        // ✅ ADD
  deleted_at?: string | null; // ✅ ADD
  created_at: string;
  updated_at: string;
}
```

### Risco 2: Testes Vitest Não Configurado

**Descrição:** vitest.config.ts pode estar incompleto  
**Impacto:** Tarefa 2.4 falha  
**Mitigação:** Validar config segunda, usar padrão da migrations

### Risco 3: React Query Mutations Incompatíveis

**Descrição:** useMutation hooks podem conflitar com React Query v5  
**Impacto:** Tarefa 2.3 CRUD não funciona  
**Mitigação:** Usar padrão em hooks/useApi.ts existente

### Risco 4: Supabase Local Offline

**Descrição:** Docker pode cair durante semana  
**Impacto:** Não conseguir testar queries  
**Mitigação:** Ter Supabase cloud como fallback (URL + key)

---

## ✅ PRÉ-KICKOFF CHECKLIST (Fazer Antes de 08:00)

- [ ] Terminal aberto em `frontend/`
- [ ] `npm install` rodou sem erros
- [ ] `npm run build` passou
- [ ] `npm run lint` passou (0 errors)
- [ ] `npm run type-check` passou
- [ ] Docker rodando (`docker ps` OK)
- [ ] Supabase status OK (`supabase status`)
- [ ] Git pronto (`git status` clean)
- [ ] VSCode aberto com projeto carregado
- [ ] Documentação acessível (abas abertas)
- [ ] Slack/comunicação setup
- [ ] Browser dev tools pronto (F12)

---

## 🎯 PRÓXIMOS PASSOS PÓS-KICKOFF

1. **09:15:** Start Tarefa 2.1 PT1 (componentes base)
2. **12:00:** Primeiro commit com progresso
3. **17:00:** Fim dia 1 - relatório de progresso
4. **Dia 2 (14 Feb):** Continue PT2 + testes iniciais
5. **Final (19 Feb):** Consolidation report pronto

---

## 🔐 AUTORIZAÇÃO PARA KICKOFF

**Reunião Kickoff:** ✅ **AUTORIZADA PARA PROSSEGUIR**

### Confirmações Necessárias em 08:00:

- [x] Ambiente técnico funcional (build, lint, type-check)
- [x] Banco de dados pronto (migrations, view, RPC)
- [x] Git history limpo (214 files committed)
- [x] Documentação pronta (plano diário, deliverables)
- [x] Recursos disponíveis (npm packages, Supabase, GitHub)

### Questões Abertas (Não Bloqueantes):

- ⚠️ Interface CatalogItem types (resolver hoje se possível)
- ⚠️ Blender model para Map view (validar necessidade)
- ⚠️ E2E tests com Playwright (stretch goal, não obrigatório)

**Resultado:** ✅ **PRONTO PARA EXECUÇÃO SEMANA 2**

---

**🚀 Vamos começar!**

**Preparado por:** Roo (Tech Lead)  
**Data:** 6 Fevereiro 2026  
**Válido:** Semana 2 (13-19 Fevereiro 2026)  
**Próximo:** S3 Kickoff (21 Fevereiro, 08:00)
