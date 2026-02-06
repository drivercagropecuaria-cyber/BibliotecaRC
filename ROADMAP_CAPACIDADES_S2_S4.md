# 🗺️ ROADMAP DE CAPACIDADES - S2, S3, S4
## O que Preciso Fazer Bem para Executar as Próximas 3 Semanas

**Versão:** 1.0  
**Data:** 6 de Fevereiro de 2026  
**Responsável:** Roo (Technical Lead - Executor)  
**Timeline:** Semanas 2, 3, 4 de Fase 2 (13 Feb - 5 Mar 2026)

---

## 🎯 VISÃO GERAL

Neste roadmap, documento as **habilidades críticas**, **recursos necessários**, **dependências externas** e **métricas de sucesso** para executar com excelência as 3 próximas semanas.

**Contexto:**
- S1-F2 ✅ Aprovado: bloqueadores resolvidos, build green, git clean
- S2 (13-19 Feb): Component Library + CRUD Integration
- S3 (20-26 Feb): Advanced Components + Testing
- S4 (27 Feb - 5 Mar): GIS Integration + Performance

---

## 📊 MATRIX DE HABILIDADES POR SEMANA

### S2: COMPONENT LIBRARY & CRUD INTEGRATION

**Semana:** 13-19 Fevereiro | **Duration:** 5 dias úteis | **Disponibilidade:** 25h dedicadas

#### Habilidades Requeridas

| Habilidade | Profundidade | Criticidade | Já Domino? | Ação Necessária |
|------------|--------------|-------------|-----------|-----------------|
| React 18 + Hooks | Avançada | 🔴 Critical | ✅ Sim | Manter |
| TypeScript Strict | Avançada | 🔴 Critical | ✅ Sim | Manter |
| CSS Modules | Intermediária | 🟠 Alta | ✅ Sim | Review em responsive |
| React Query | Avançada | 🔴 Critical | ✅ Sim (após fix) | Aprofundar (caching strategy) |
| Supabase CRUD | Avançada | 🔴 Critical | ✅ Sim (após fix) | Aprofundar (RLS, soft delete) |
| Vitest + React Testing Library | Intermediária | 🟠 Alta | 🟡 Parcial | **TREINAR agora** |
| Component Composition | Avançada | 🔴 Critical | ✅ Sim | Manter |
| Git Discipline | Intermediária | 🟠 Alta | ✅ Sim | Manter |

**Ações Específicas:**

1. **Vitest Aprofundamento (2h - segunda/terça):**
   - [ ] Revisar vitest config (fixtures, mocks, setup)
   - [ ] Escrever 3 testes básicos (component render + props)
   - [ ] Entender coverage report (ideal > 80%)
   - [ ] Setup: mock de Supabase em testes (não real DB)

2. **React Query Caching (1h - segunda):**
   - [ ] Documentar estratégia: staleTime vs gcTime
   - [ ] Entender invalidateQueries (quais scenarios?)
   - [ ] Profile: quando dados são refetch?

3. **Supabase RLS Deep Dive (1h - segunda):**
   - [ ] Como RLS protege dados por usuário?
   - [ ] Soft delete: deleted_at vs is_active vs status field?
   - [ ] Testes: como validar RLS em teste?

**Ferramentas & Setup:**
```bash
# Vitest: já instalado em package.json
npm run test              # Rodar testes
npm run test:coverage     # Cobertura

# TypeScript checking
npm run type-check       # ou tsc -b

# Build validation
npm run build           # Deve passar sempre
npm run lint           # 0 errors, 0 warnings
```

#### Tarefas Descritas

**Tarefa S2.1: Component Library Reutilizável (8h)**
- 10+ componentes React criados
- Cada componente: props documentadas, testes básicos, estilos CSS Modules
- Componentes: SearchBar, FilterPanel, ItemCard, ItemDetail, Navbar, Pagination, Modal, LoadingSpinner, EmptyState, TagCloud
- Critério: Todos compilam, `npm run build` passa, > 70% testes passando

**Tarefa S2.2: Biblioteca Digital Interface (8h)**
- Integração de componentes em página funcional
- 3 view modes: Grid, List, Map
- Search + Filter + Pagination integrados
- CRUD completo testado em browser

**Tarefa S2.3: Testing Foundation (4h)**
- 25+ testes automatizados passando
- Cobertura > 80% (component + hooks)
- Mock de Supabase funcional em testes
- CI/CD readiness

**Checkpoint:** Quinta 16:00 (antes de auditoria)
- Build: `npm run build` ✅
- TypeScript: `npm run type-check` ✅
- Testes: `npm run test` ✅ > 20 passing

---

### S3: ADVANCED COMPONENTS & TESTING EXPANSION

**Semana:** 20-26 Fevereiro | **Duration:** 5 dias úteis | **Disponibilidade:** 25h dedicadas

#### Habilidades Requeridas

| Habilidade | Profundidade | Já Domino? | Ação Necessária |
|------------|--------------|-----------|-----------------|
| React Performance | Avançada | 🟡 Parcial | **APRENDER: useMemo, useCallback** |
| Infinite Scroll / Virtual List | Avançada | ❌ Não | **APRENDER (Windowing)** |
| Accessibility (ARIA) | Intermediária | 🟡 Parcial | **TREINAR: tab, labels, roles** |
| Error Boundaries | Intermediária | 🟡 Parcial | **IMPLEMENTAR** |
| Form Validation | Intermediária | ✅ Sim | Manter |
| Zustand State Management | Básica | ✅ Sim | Aprofundar se necessário |

**Ações Específicas:**

1. **React Performance (2h - segunda/terça):**
   - [ ] Entender quando usar useMemo (componentes caros)
   - [ ] Entender quando usar useCallback (evitar re-renders)
   - [ ] Profile com DevTools: React Profiler tab
   - [ ] Implementar em 2 componentes críticos (ItemCard, FilterPanel)

2. **Infinite Scroll (3h - quarta):**
   - [ ] Revisar react-intersection-observer ou Virtuoso
   - [ ] Implementar infinite scroll em Biblioteca Digital
   - [ ] Testar performance com 1000+ items
   - [ ] Validar: scroll não salta, não faz re-request desnecessário

3. **Accessibility (2h - quinta):**
   - [ ] Validar: Tab navigation funciona
   - [ ] Adicionar ARIA labels em buttons/inputs
   - [ ] Testar com screen reader (NVDA ou VoiceOver)
   - [ ] Fix: contraste cores (WCAG AA mínimo)

4. **Error Boundaries & Observability (2h - quinta):**
   - [ ] Criar ErrorBoundary component
   - [ ] Adicionar logging estruturado (que erros? onde?)
   - [ ] Implementar fallback UI para erros críticos

#### Tarefas Descritas

**Tarefa S3.1: Performance & Infinite Scroll (6h)**
- Implementar infinite scroll na Biblioteca Digital
- Virtualization: renderizar apenas items visíveis (Windowing)
- useMemo/useCallback implementados em componentes caros
- Métrica: 10.000 items, scroll smooth, no jank

**Tarefa S3.2: Accessibility & Error Handling (5h)**
- Error Boundaries para Biblioteca Digital + CRUD
- ARIA labels em todos inputs/buttons
- Keyboard navigation (Tab, Enter, Escape)
- Testável: acessibilidade via WAVE/Lighthouse

**Tarefa S3.3: Advanced Testing (8h)**
- Testes de integração: component + API mock
- Snapshot tests para componentes renderizados
- E2E scenarios: search → filter → click item → detail view
- Cobertura > 85%

**Checkpoint:** Quinta 16:00 (antes de auditoria)
- Performance: Lighthouse score > 80
- Accessibility: WAVE audit 0 critical issues
- Testing: npm run test ✅ > 40 passing, coverage > 85%

---

### S4: GIS INTEGRATION & PERFORMANCE POLISH

**Semana:** 27 Feb - 5 Mar | **Duration:** 5 dias úteis | **Disponibilidade:** 25h dedicadas

#### Habilidades Requeridas

| Habilidade | Profundidade | Já Domino? | Ação Necessária |
|------------|--------------|-----------|-----------------|
| Leaflet / Mapbox | Avançada | ❌ Não | **APRENDER (Map library)** |
| GIS Concepts | Intermediária | 🟡 Parcial | **APRENDER: geometries, projections** |
| PostGIS Queries | Avançada | 🟡 Parcial | **APROFUNDAR: ST_* functions** |
| Performance Optimization | Avançada | 🟡 Parcial | **APRENDER: query profiling, indexes** |
| Database Tuning | Avançada | ❌ Não | **APRENDER se necessário** |

**Ações Específicas:**

1. **Leaflet Setup (2h - segunda/terça):**
   - [ ] Instalar react-leaflet
   - [ ] Criar MapComponent: render mapa, add markers
   - [ ] Entender: tiles, layers, interactions
   - [ ] Teste: 50+ markers, mapa smooth

2. **GIS & PostGIS (3h - terça/quarta):**
   - [ ] Revisão: Como dados KML foram importados?
   - [ ] Queries: ST_Contains, ST_Intersects (encontrar items em área)
   - [ ] Performance: índices GIST já criados?
   - [ ] Teste: query < 500ms para 100k geometries

3. **Map Integration (4h - quarta/quinta):**
   - [ ] API endpoint: buscar items por bounding box (bbox query)
   - [ ] MapComponent: mostra items do banco filtrados por mapa
   - [ ] Sync: FilterPanel + Map sincronizados
   - [ ] UX: clica no mapa → filtra items; clica em item → zoom map

4. **Performance Profiling (2h - quinta):**
   - [ ] DevTools: Network tab (quantas requests?)
   - [ ] DevTools: Performance tab (quanto tempo render + network?)
   - [ ] Otimizações: query pagination, lazy loading imagens
   - [ ] Métrica: First contentful paint < 2s

#### Tarefas Descritas

**Tarefa S4.1: Map Component & Integration (8h)**
- MapComponent criado (Leaflet / Mapbox)
- Renderiza 100+ KML features como markers
- Sincronização: busca/filtros afetam mapa (bounding box query)
- Interatividade: zoom/pan suave, click marker → detalhe

**Tarefa S4.2: GIS & PostGIS Queries (6h)**
- Endpoint: `/api/search-by-bbox?west=X&south=Y&east=X&north=Y`
- PostGIS: ST_Intersects para encontrar features em área
- Performance: < 500ms para 100k features
- Teste: validar geometrias são corretas (não duplicadas)

**Tarefa S4.3: Performance Optimization (5h)**
- Query optimization: indexes, EXPLAIN ANALYZE
- Image lazy loading: thumbnail apenas ao viewport
- Pagination no mapa: renderizar próximos markers ao scroll
- Métrica: Lighthouse > 85, FCP < 2s

**Checkpoint:** Quinta 16:00
- GIS: Map renderiza features, sincronização funciona
- Performance: Lighthouse > 85, query < 500ms
- Qualidade: npm run test ✅, build ✅

---

## 📦 RECURSOS JÁ DISPONIBILIZADOS

### Frontend Stack (✅ Instalado)

```json
{
  "react": "^19.2.0",
  "typescript": "^5.9.3",
  "vite": "^7.2.4",
  "vitest": "^4.0.18",
  "@tanstack/react-query": "^5.90.20",
  "@supabase/supabase-js": "^2.95.2",
  "zustand": "^5.0.11",
  "axios": "^1.13.4"
}
```

### Backend Stack (✅ Supabase Local)

```
PostgreSQL 15 + PostGIS
├── Tabelas: catalogo_itens, taxonomy, localidades, etc (15+)
├── Views: vw_catalogo_completo, vw_localidades_stats
├── RLS Policies: por usuário
├── Migrations: 50+ aplicadas
└── Docker: supabase start pronto
```

### Development Tools (✅ Pronto)

```
├── Node 18+ (ou 20+)
├── npm (para package management)
├── Git (versionamento)
├── VSCode + ESLint + Prettier (linting)
├── Docker Desktop (para Supabase local)
└── Vercel (deploy) + GitHub (CI/CD ready)
```

### Testing Setup (⚠️ Parcial - Precisa aprofundamento em S2)

```
├── Vitest (unit tests)
├── React Testing Library (component tests)
├── @testing-library/jest-dom (matchers)
├── Mocks: Supabase client já mockado
└── Coverage: vitest --coverage (precisa threshold)
```

### Documentation (✅ Completo)

```
├── MANIFESTO_METODOLOGIA_CONTINUIDADE.md (como funciona)
├── FRAMEWORK_CONTINUIDADE_PROCEDIMENTOS.md (procedimentos)
├── ROADMAP_CAPACIDADES_S2_S4.md (este arquivo)
├── PLANO_EXECUCAO_SEMANA_2_DETALHADO.md (S2 específico)
├── docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md (schema)
└── docs/RUNBOOK_*.md (procedimentos específicos)
```

---

## 🔗 DEPENDÊNCIAS CRÍTICAS

### Externas (Fora do Controle)

| Dependência | Status | Impacto | Plano Contingência |
|-------------|--------|---------|-------------------|
| **Supabase Cloud Auth** | ✅ Funcional | 🟠 Média | Local Supabase funciona offline |
| **Vercel Deploy** | ✅ Funcional | 🟠 Média | Pode fazer build local e testar |
| **Node/npm Registry** | ✅ Funcional | 🟠 Média | npm ci cached, node_modules versionado |
| **KML Data (252 files)** | ✅ Disponível | 🔴 Critical | Já importados em DB, ou scripts prontos |

### Internas (Controlo Total)

| Dependência | Status | Ações S2 |
|-------------|--------|----------|
| **React Setup** | ✅ Completo | Usar como-é |
| **Supabase Local** | ✅ Pronto | `supabase start` antes de cada sessão |
| **Build System** | ✅ Pronto | Vite já configurado |
| **Testing Framework** | 🟡 Básico | **Aprofundar em S2 (vitest config)** |
| **GIS Tools** | 🟡 Scripts existem | **Integrar em S4 (Leaflet)** |

### Versioning Risks

```
⚠️ ATENÇÃO: Estas versões podem ter breaking changes em atualizações menores:
- React Query 5.90 → caching strategy mudou vs v4
- Supabase 2.95 → nova API de auth em 3.x
- TypeScript 5.9 → strict mode pode quebrar código antigo

Mitigação:
- npm ci (lock file, reproducible installs)
- Não fazer npm update durante S2-S4
- Se erro aparece, usar node_modules cached ou rollback via git
```

---

## 📈 MÉTRICAS DE SUCESSO POR SEMANA

### S2: COMPONENT LIBRARY & CRUD (13-19 Feb)

**Build Metrics:**
- [ ] `npm run build` sempre passando (0 errors, < 3min)
- [ ] `npm run type-check` 0 errors (TypeScript strict)
- [ ] `npm run test` ≥ 20 testes passando
- [ ] `npm run lint` 0 errors, 0 warnings

**Code Metrics:**
- [ ] 10+ componentes criados
- [ ] Cada componente: JSDoc + 1-2 testes básicos
- [ ] Cobertura: ≥ 70% (idealmente ≥ 80%)
- [ ] CRUD testado manualmente em browser

**Quality Metrics:**
- [ ] Git: commits descritivos, sem WIP
- [ ] Documentação: componentes documentados (README or JSDoc)
- [ ] Performance: Lighthouse score > 75
- [ ] Accessibility: WAVE audit (sem critical errors)

**Auditoria S2 (quinta):**
- [ ] Build passes externa auditoria
- [ ] Funcionalidade: component library funciona
- [ ] Testes: cobertura > 70%
- [ ] Aprovação: 0 bloqueadores críticos

---

### S3: ADVANCED COMPONENTS & TESTING (20-26 Feb)

**Build Metrics:**
- [ ] Build sempre passando
- [ ] Testes: ≥ 40 testes, > 85% cobertura
- [ ] Performance: Lighthouse > 80

**Feature Metrics:**
- [ ] Infinite scroll funcional (10k+ items smooth)
- [ ] Accessibility: WCAG AA (tab navigation, ARIA labels)
- [ ] Error handling: ErrorBoundary em lugar
- [ ] Testes: integração (component + API mock)

**Quality Metrics:**
- [ ] Nenhum console error em app
- [ ] Lighthouse Accessibility score > 90
- [ ] DevTools Performance: no 60fps jank
- [ ] Snapshot tests: < 5 snapshots (não overuse)

**Auditoria S3:**
- [ ] Performance: Lighthouse > 80
- [ ] Accessibility: WAVE audit, keyboard nav tested
- [ ] Testing: > 85% cobertura
- [ ] Zero bloqueadores críticos

---

### S4: GIS INTEGRATION & POLISH (27 Feb - 5 Mar)

**Build Metrics:**
- [ ] Build sempre passando
- [ ] Testes: ≥ 50 testes, > 85% cobertura
- [ ] Performance: Lighthouse > 85

**GIS Metrics:**
- [ ] Map renderiza 100+ features
- [ ] Queries PostGIS: < 500ms para 100k geometries
- [ ] Sync FilterPanel + Map: funcional
- [ ] Zoom/pan/click: smooth e interativo

**Performance Metrics:**
- [ ] FCP (First Contentful Paint) < 2s
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Network: < 10 requests no carregamento

**Quality Metrics:**
- [ ] Lighthouse Performance > 85
- [ ] Lighthouse Accessibility > 90
- [ ] Sem console errors
- [ ] Mobile responsive (testado em iPhone/iPad)

**Auditoria S4:**
- [ ] GIS funcional e performant
- [ ] Cobertura testes > 85%
- [ ] Performance excelente (Lighthouse > 85)
- [ ] Pronto para produção

---

## ⚠️ RISCOS CONHECIDOS E MITIGAÇÕES

### Risk 1: Vitest Coverage Surprises

**Risco:** Escrever testes que "passam" mas não cobrem casos reais  
**Probabilidade:** 🟠 Média | **Impacto:** 🟠 Média  
**Mitigação:**
- [ ] Vitest config: `['lines', 'functions', 'branches', 'statements']` all > 80%
- [ ] Não usar apenas snapshots (usar assertions reais)
- [ ] Integração testes além de unit tests

---

### Risk 2: React Query Caching Issues

**Risco:** Dados em cache não atualizam após CRUD, usuários veem dados stale  
**Probabilidade:** 🟠 Média | **Impacto:** 🔴 Critical  
**Mitigação:**
- [ ] Documentar: staleTime (5 min) vs gcTime (10 min)
- [ ] Usar `queryClient.invalidateQueries()` após mutation
- [ ] Testar: delete item → lista recarrega sem item
- [ ] Não confiar apenas em `refetchOnWindowFocus`

---

### Risk 3: GIS Data Quality

**Risco:** Geometrias KML têm overlaps, null fields, ou erros de projeção  
**Probabilidade:** 🟡 Baixa (já mapeado) | **Impacto:** 🔴 Critical  
**Mitigação:**
- [ ] Validação GIS ja feita em F0 (doc: `analyze_kml_v2.py`)
- [ ] Se erro encontrado em S4, usar rollback DB + re-import
- [ ] PostGIS: ST_IsValid() para detectar geometrias inválidas
- [ ] Query: ST_Intersects pode retornar false positives (validar)

---

### Risk 4: Performance Degradation com Dados Reais

**Risco:** 100k geometries + 1000+ catalog items = queries lentas  
**Probabilidade:** 🟠 Média | **Impacto:** 🟠 Média  
**Mitigação:**
- [ ] Index strategy: GIST para geometrias, BTree para ids
- [ ] Query pagination: bbox queries devem retornar max 100 items
- [ ] Frontend pagination: infinite scroll com 20 items por request
- [ ] Profiling: EXPLAIN ANALYZE para ver plano de query

---

### Risk 5: Accessibility Regressions

**Risco:** Adicionar infinite scroll sem suporte a keyboard  
**Probabilidade:** 🟡 Baixa | **Impacto:** 🟠 Média  
**Mitigação:**
- [ ] Testar com keyboard (Tab, Enter, Escape)
- [ ] Test com screen reader (NVDA/VoiceOver)
- [ ] WAVE audit antes de cada deploy
- [ ] Lighthouse Accessibility score > 90

---

### Risk 6: TypeScript Strict Mode Breaks

**Risco:** Adicionar código que passa locally mas falha em CI/CD  
**Probabilidade:** 🟡 Baixa | **Impacto:** 🟠 Média  
**Mitigação:**
- [ ] Rodar `npm run type-check` antes de push (pre-commit hook)
- [ ] CI/CD bloqueado se TypeScript falhar
- [ ] Não usar `any` type, usar `unknown` + type guard

---

## 💡 CAPACIDADES QUE PRECISO DESENVOLVER

### Prioridade 1: VITEST MASTERY (S2)

**Atual:** Conhecimento básico (vitest existe, 5 testes)  
**Target:** Escrita de testes confiantes, > 80% cobertura  

**Plano:**
- [ ] 2h: Ler vitest docs (setup, mocks, coverage)
- [ ] 2h: Escrever 10 testes básicos (SearchBar, FilterPanel)
- [ ] 2h: Integração testes (component + API mock)
- [ ] 1h: Setup coverage threshold em config

**Resource:** Vitest docs + React Testing Library tutorial

---

### Prioridade 2: REACT PERFORMANCE (S3)

**Atual:** Conhecimento básico (React Profiler existe, mas não uso)  
**Target:** Entender e usar useMemo/useCallback efetivamente  

**Plano:**
- [ ] 1h: DevTools React Profiler (como usar?)
- [ ] 1h: useMemo vs useCallback (quando aplicar?)
- [ ] 1h: Profile ItemCard + FilterPanel, encontre hotspots
- [ ] 1h: Implementar otimizações em 2 componentes

**Resource:** React docs + DevTools tutorial

---

### Prioridade 3: LEAFLET & GIS (S4)

**Atual:** Zero conhecimento (existem scripts GIS, mas map não integrado)  
**Target:** Renderizar mapa com features KML, interativo  

**Plano:**
- [ ] 2h: Leaflet docs + react-leaflet setup
- [ ] 1h: PostGIS queries (ST_Intersects, bounding box)
- [ ] 2h: MapComponent: render features, zoom/pan
- [ ] 2h: Sync with FilterPanel (bbox query)

**Resource:** Leaflet docs + PostGIS manual + react-leaflet examples

---

### Prioridade 4: DATABASE TUNING (S4, if needed)

**Atual:** Conhecimento básico (queries funcionam, mas lento?)  
**Target:** Otimizar queries PostGIS para 100k geometries < 500ms  

**Plano:**
- [ ] 1h: EXPLAIN ANALYZE (como ler plano de query?)
- [ ] 1h: Index strategy (GIST vs BTree)
- [ ] 1h: Query optimization (avoid N+1, pagination)
- [ ] 1h: Benchmarking (antes vs depois otimização)

**Resource:** PostgreSQL docs + PostGIS docs + EXPLAIN ANALYZE tutorial

---

## 🎓 RESUMO: O QUE PRECISO FAZER ANTES DE S2 COMEÇAR

**Segunda 13 Feb, 08:00:**

- [ ] Ler este documento (ROADMAP_CAPACIDADES_S2_S4.md)
- [ ] Ler plano da semana (PLANO_EXECUCAO_SEMANA_2_DETALHADO.md)
- [ ] Review vitest docs (30 min)
- [ ] Review React Query docs (30 min)
- [ ] Review Supabase RLS (30 min)
- [ ] Setup local environment: `npm install`, `supabase start`, `npm run dev`
- [ ] Validar: build passa, testes rodam, app inicia
- [ ] Dormir bem: próxima semana vai ser intensa!

---

## 📅 PRÓXIMAS SEMANAS ALÉM DE S4

### S5+: Fase 3 Preparação

Após S4 estar pronto (GIS + Performance), próximas prioridades:

1. **Museu Virtual 3D** (Blender modelos)
2. **Advanced Analytics** (Dashboard)
3. **Mobile App** (React Native ou similar)
4. **Scaling** (Múltiplas feature streams em paralelo)

Capacidades para desenvolver depois:
- Blender + Sketchfab integration
- D3/Plotly para analytics
- React Native ou Flutter
- Kubernetes / DevOps escalação

---

*Roadmap finalizado e validado.  
Próximo passo: Sexta 06 Feb 2026 - Validação com Stakeholder  
Implementação: Segunda 13 Feb 2026 - Kickoff S2*
