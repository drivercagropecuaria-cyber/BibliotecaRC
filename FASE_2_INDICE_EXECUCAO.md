# 📑 FASE 2 - ÍNDICE DE EXECUÇÃO (Semanas 2, 3, 4)

**Período:** 2026-02-13 até 2026-03-13  
**Status Atual:** Semana 1 ✅ APROVADA  
**Próximo Milestone:** Semana 2 → Component Library + Biblioteca Digital  

---

## 📚 DOCUMENTOS PRINCIPAIS

### 1. 📋 Planejamento Executivo
- **[`PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md`](PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md)** - Documento mestre com todas as tarefas, procedimentos e critérios de aceitação (PRINCIPAL - LEIA PRIMEIRO)
- **[`FASE_2_SEMANAS_2_3_4_TRACKING.md`](FASE_2_SEMANAS_2_3_4_TRACKING.md)** - Tabela de tracking com horas, responsáveis e evidências
- **[`plans/FASE_2_STATUS.json`](plans/FASE_2_STATUS.json)** - Status estruturado em JSON (atualizado com progresso)

### 2. ✅ Validação e Reports
- **[`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md)** - Checklist de validação externa (usar após cada semana)
- **[`reports/FASE_2_SEMANA_1_CONSOLIDACAO.json`](reports/FASE_2_SEMANA_1_CONSOLIDACAO.json)** - Report final Semana 1 (referência)

### 3. 📖 Documentação Técnica (Fase 1 - Base)
- **[`docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md`](docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md)** - Schema Supabase (6 tabelas + RLS)
- **[`docs/SUPABASE_LOCAL_SETUP_GUIA.md`](docs/SUPABASE_LOCAL_SETUP_GUIA.md)** - Setup Supabase local (Docker)
- **[`RELATORIO_EXECUCAO_FASE_1.md`](RELATORIO_EXECUCAO_FASE_1.md)** - Relatório Fase 1 completo

---

## 🎯 FLUXO DE EXECUÇÃO POR SEMANA

### **SEMANA 2: Component Library + Biblioteca Digital (13-20 FEV)**

**Documento:** [`PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md#semana-2`](PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md) | **Tracking:** [`FASE_2_SEMANAS_2_3_4_TRACKING.md#-semana-2`](FASE_2_SEMANAS_2_3_4_TRACKING.md)

#### Tarefas (3 principais)

1. **Tarefa 2.1: Component Library (10+ componentes)** - 8h
   - SearchBar, FilterPanel, ItemCard (refactored)
   - ItemDetail, Navbar, Pagination, LoadingSpinner, EmptyState, Modal, TagCloud (novos)
   - ✅ Critério: Todos compiling, sem console errors
   - 📁 Output: `frontend/src/components/library/`

2. **Tarefa 2.2: Biblioteca Digital Interface** - 6h
   - Página `/biblioteca` com search + filtro + grid + view modes (grid/list/map)
   - Paginação + loading states + ItemDetail modal
   - ✅ Critério: Todos 3 view modes funcionando
   - 📁 Output: `frontend/src/pages/BibliotecaDigital.tsx`

3. **Tarefa 2.3: Supabase CRUD Integration** - 4h
   - `supabaseClient.ts` com 6+ funções (getCatalogos, search, create, update, delete)
   - `useApi.ts` com React Query hooks
   - Mock data (se schema não pronto)
   - ✅ Critério: getData() funciona (real ou mock)
   - 📁 Output: `frontend/src/services/` + `frontend/src/hooks/`

#### Validação Semana 2
- [ ] Report: `reports/FASE_2_SEMANA_2_CONSOLIDACAO.json`
- [ ] Usar: [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md)
- [ ] Aprovação: 6/6 critérios PASS

---

### **SEMANA 3: 3D Museum + GIS Map (21-27 FEV)**

**Documento:** [`PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md#semana-3`](PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md) | **Tracking:** [`FASE_2_SEMANAS_2_3_4_TRACKING.md#-semana-3`](FASE_2_SEMANAS_2_3_4_TRACKING.md)

#### Tarefas (4 principais)

1. **Tarefa 3.1: Blender → Three.js Pipeline** - 6h
   - Preparar modelo 3D em Blender
   - Export como .glb otimizado (<50MB)
   - Validar em Three.js Editor
   - ✅ Critério: Renderiza sem erro, texturas OK
   - 📁 Output: `models/3d/sede-vila-terezinha.glb`

2. **Tarefa 3.2: Three.js MuseumViewer** - 5h
   - Instalar three + @react-three/fiber
   - Componente MuseumViewer.tsx com OrbitControls
   - Página `/museum`
   - ✅ Critério: Drag/zoom/rotate funciona, FPS > 30
   - 📁 Output: `frontend/src/components/museum/MuseumViewer.tsx`

3. **Tarefa 3.3: Leaflet GIS Map (252 layers)** - 7h
   - Instalar leaflet + react-leaflet
   - Componente InteractiveGISMap.tsx
   - Carregar 252 camadas GeoJSON
   - Layer toggles + popup info
   - Página `/map`
   - ✅ Critério: Todas camadas carregáveis, sem lag
   - 📁 Output: `frontend/src/components/map/InteractiveGISMap.tsx`

4. **Tarefa 3.4: Dashboard Integração** - 4h
   - Dashboard.tsx com 3 abas (Biblioteca/Museum/Map)
   - Links cruzados (item→map, localidade→filter)
   - Navbar global
   - ✅ Critério: Navegação suave, dados sincronizam
   - 📁 Output: `frontend/src/pages/Dashboard.tsx`

#### Validação Semana 3
- [ ] Report: `reports/FASE_2_SEMANA_3_CONSOLIDACAO.json`
- [ ] Usar: [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md)
- [ ] Aprovação: 6/6 critérios PASS

---

### **SEMANA 4: API + Testing + GO/NO-GO (28 FEV - 6 MAR)**

**Documento:** [`PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md#semana-4`](PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md) | **Tracking:** [`FASE_2_SEMANAS_2_3_4_TRACKING.md#-semana-4`](FASE_2_SEMANAS_2_3_4_TRACKING.md)

#### Tarefas (3 principais)

1. **Tarefa 4.1: API Endpoints (8+ RPC)** - 6h
   - Criar 8+ RPC functions em Supabase (migrations SQL)
   - search_catalogos, get_localidade_catalogos, get_collections, add_to_collection, etc
   - Integrar em frontend via React Query
   - ✅ Critério: Todas functions retornam dados, sem 401/403
   - 📁 Output: `supabase/migrations/` + `frontend/src/hooks/useApi.ts`

2. **Tarefa 4.2: Testing Suite (30+ testes)** - 8h
   - Setup Vitest + @testing-library/react
   - 15+ testes componentes (SearchBar, Filter, Card, etc)
   - 6+ testes pages (BibliotecaDigital, Museum, Map)
   - 9+ testes services/hooks
   - Coverage > 70%
   - ✅ Critério: `npm run test` → "All tests passed"
   - 📁 Output: `frontend/src/**/__tests__/` (30+ .test.tsx)

3. **Tarefa 4.3: GO/NO-GO Consolidação Final** - 3h
   - Validar 6 critérios aprovação
   - Gerar `reports/FASE_2_CONSOLIDACAO.json`
   - Decisão GO/NO-GO para Fase 3
   - ✅ Critério: Todos 6 critérios = "PASS"
   - 📁 Output: `reports/FASE_2_CONSOLIDACAO.json`

#### Validação Semana 4
- [ ] Report: `reports/FASE_2_CONSOLIDACAO.json` (FINAL)
- [ ] Usar: [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md)
- [ ] Aprovação: 6/6 critérios PASS + GO/NO-GO decision

---

## 🔑 CRITÉRIOS DE SUCESSO (6 Pontos)

Para aprovação final (GO Fase 3), TODOS 6 critérios devem ser "PASS":

```
[ 1 ] React app rodando em localhost:5173
      └─ npm run dev inicia sem erros
      └─ HMR funcional
      └─ npm run build < 5 segundos

[ 2 ] Supabase schema com RLS policies
      └─ 6+ tabelas implementadas
      └─ RLS policies em cada tabela
      └─ Índices de performance
      └─ Storage buckets

[ 3 ] Biblioteca Digital com search/filter
      └─ SearchBar real-time funcional
      └─ FilterPanel categorias/datas OK
      └─ Grid/List/Map view modes
      └─ Paginação funciona

[ 4 ] 3D Museum + GIS Map renderizando
      └─ Modelo 3D renderiza (ThreeJS)
      └─ OrbitControls responsivos
      └─ 252 camadas GIS carregáveis
      └─ Zero WebGL errors

[ 5 ] 5+ Components testados (30+ testes)
      └─ 10+ componentes criados
      └─ 30+ testes Vitest
      └─ Coverage > 70%
      └─ npm run test passes

[ 6 ] API endpoints integrados (8+ RPCs)
      └─ 8+ RPC functions funcionando
      └─ React Query hooks
      └─ Search com real data
      └─ CRUD operations OK

✓ TODOS 6 → GO FASE 3 ✅
✗ QUALQUER 1 FALHO → NO-GO + REMEDIATION
```

---

## 📊 HORAS E RECURSO ALOCAÇÃO

### Total: 60 horas (3 semanas)

| Semana | Frontend | Backend | 3D | QA | Tech Lead | Total |
|--------|----------|---------|----|----|-----------|-------|
| **2** | 14h | 2h | - | - | 2h | 18h |
| **3** | 16h | - | 6h | - | 2h | 24h |
| **4** | 3h | 4h | - | 8h | 3h | 18h |
| **TOTAL** | 33h | 6h | 6h | 8h | 7h | **60h** |

### Recursos
- **Frontend Dev:** React components, pages, hooks, integration (33h)
- **Backend Dev:** Supabase schema, RPC functions, migrations (6h)
- **3D Artist:** Blender model optimization, export (6h)
- **QA Tester:** Unit tests, integration tests, coverage (8h)
- **Tech Lead (Roo):** Planning, validation, reporting, GO/NO-GO (7h)

---

## 🚀 PRÓXIMAS AÇÕES IMEDIATAS

### ✅ ANTES DE SEMANA 2 (até 2026-02-12)

- [ ] Confirmar este documento lido por todo team
- [ ] Verificar ambiente React rodando (`npm run dev`)
- [ ] Backend Dev confirma schema Supabase ready
- [ ] 3D Artist confirma modelo disponível em Blender
- [ ] Todos membros team com acesso ao repositório

### 🎯 SEMANA 2 COMEÇA (2026-02-13)

1. Ler [`PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md`](PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md) completo
2. Iniciar Tarefa 2.1 (SearchBar refactor)
3. Daily standup sincronizando com [`FASE_2_SEMANAS_2_3_4_TRACKING.md`](FASE_2_SEMANAS_2_3_4_TRACKING.md)
4. Sexta-feira: Report `FASE_2_SEMANA_2_CONSOLIDACAO.json`

---

## 📞 CONTATO E ESCALAÇÃO

**Tech Lead/PM:** Roo  
**Frontend Architect:** Frontend Dev  
**Backend/Supabase:** Backend Dev  
**3D Specialist:** 3D Artist  
**QA Lead:** QA Tester  

**Bloqueante?** → Notificar Tech Lead imediatamente  
**Dúvida Execução?** → Consultar [`PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md`](PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md) tarefa correspondente

---

## 📋 MAPA RÁPIDO DE DOCUMENTOS

```
FASE_2_INDICE_EXECUCAO.md (VOCÊ ESTÁ AQUI)
├── PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md ← Leia primeiro
├── FASE_2_SEMANAS_2_3_4_TRACKING.md ← Daily updates
├── PROMPT_VALIDACAO_FASE_2.md ← Use sexta-feira
├── plans/FASE_2_STATUS.json ← Status estruturado
├── reports/FASE_2_SEMANA_1_CONSOLIDACAO.json ← Referência
├── reports/FASE_2_SEMANA_2_CONSOLIDACAO.json ← (a gerar)
├── reports/FASE_2_SEMANA_3_CONSOLIDACAO.json ← (a gerar)
└── reports/FASE_2_CONSOLIDACAO.json ← Final GO/NO-GO
```

---

## 🎓 METODOLOGIA FASE 2

```
DOCUMENTAÇÃO → EXECUÇÃO → REPORTS → VALIDAÇÃO EXTERNA → ITERAÇÃO → APROVAÇÃO

Cada Semana:
├─ Segunda-Terça: Execução tarefas bloqueantes
├─ Quarta-Quinta: Conclusão + testes
├─ Sexta: Report + validação externa
└─ Sábado-Domingo: Ajustes + próxima semana pronta
```

---

**Versão:** 1.0  
**Data Criação:** 2026-02-06 02:19 UTC  
**Status:** ✅ PRONTO PARA EXECUÇÃO  
**Próxima Revisão:** 2026-02-13 (Semana 2 início)
