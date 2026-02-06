# 📊 FASE 2 - SEMANAS 2, 3, 4 - TRACKING DE TAREFAS

**Período:** 2026-02-13 até 2026-03-13  
**Semana 1 Status:** ✅ APROVADA (100%)  
**MVP Alvo:** React + Supabase + 3D + GIS + Testing  

---

## 🗓️ SEMANA 2: Component Library + Biblioteca Digital (13-20 FEV)

### Status Geral: [ ] 0% → 100%

| ID | Tarefa | Responsável | Horas | Status | Evidência |
|---|--------|-------------|-------|--------|-----------|
| **2.1** | **Component Library (10+ componentes)** | Frontend Dev | 8h | [ ] PENDENTE | - |
| 2.1.1 | SearchBar (refatorar) | Frontend | 1h | [ ] | SearchBar.tsx pronto |
| 2.1.2 | FilterPanel (expandir) | Frontend | 1h | [ ] | FilterPanel.tsx pronto |
| 2.1.3 | ItemCard (refatorar) | Frontend | 1h | [ ] | ItemCard.tsx pronto |
| 2.1.4 | ItemDetail (novo) | Frontend | 1h | [ ] | ItemDetail.tsx pronto |
| 2.1.5 | Navbar (novo) | Frontend | 1h | [ ] | Navbar.tsx pronto |
| 2.1.6 | Pagination + Spinner + EmptyState + Modal + TagCloud | Frontend | 2h | [ ] | 5 componentes novos |
| **2.2** | **Biblioteca Digital Interface** | Frontend Dev | 6h | [ ] PENDENTE | - |
| 2.2.1 | SearchBar + FilterPanel integrado | Frontend | 2h | [ ] | `/biblioteca` carrega |
| 2.2.2 | ItemCard grid + ItemDetail modal | Frontend | 2h | [ ] | Grid/List/Map render |
| 2.2.3 | View modes (Grid/List/Map) | Frontend | 1h | [ ] | Botões alternam |
| 2.2.4 | Paginação + Loading states | Frontend | 1h | [ ] | Pagination funciona |
| **2.3** | **Supabase CRUD Integration** | Frontend + Backend | 4h | [ ] PENDENTE | - |
| 2.3.1 | Refatorar supabaseClient.ts (6+ funções) | Frontend | 2h | [ ] | getCatalogos() etc |
| 2.3.2 | React Query hooks (useApi.ts) | Frontend | 1h | [ ] | useQuery + useMutation |
| 2.3.3 | BibliotecaDigital consome dados via hooks | Frontend | 1h | [ ] | Sem hard-coded data |
| **SEMANA 2 CONSOLIDAÇÃO** | | | | | |
| 2.4 | Gerar `reports/FASE_2_SEMANA_2_CONSOLIDACAO.json` | Tech Lead | 1h | [ ] | Report completo |
| 2.5 | Validação Externa (PROMPT_VALIDACAO_FASE_2) | Tech Lead | 1h | [ ] | 6/6 critérios PASS |

**SEMANA 2 TOTAL:** 22 horas planejadas

**Entregáveis Esperados:**
- [ ] 10+ componentes em `frontend/src/components/library/`
- [ ] `frontend/src/pages/BibliotecaDigital.tsx` funcional
- [ ] `frontend/src/services/supabaseClient.ts` com CRUD
- [ ] `frontend/src/hooks/useApi.ts` com React Query
- [ ] `reports/FASE_2_SEMANA_2_CONSOLIDACAO.json`
- [ ] Build Vite < 5 segundos
- [ ] 0 console errors

---

## 🗓️ SEMANA 3: 3D Museum + GIS Map + Integração (21-27 FEV)

### Status Geral: [ ] 0% → 100%

| ID | Tarefa | Responsável | Horas | Status | Evidência |
|---|--------|-------------|-------|--------|-----------|
| **3.1** | **Blender → Three.js Export Pipeline** | 3D Artist | 6h | [ ] PENDENTE | - |
| 3.1.1 | Preparar/otimizar modelo 3D em Blender | 3D | 3h | [ ] | Geometria OK |
| 3.1.2 | Export como .glb otimizado (<50MB) | 3D | 1h | [ ] | sede-vila.glb exists |
| 3.1.3 | Validação em Three.js Editor | 3D | 1h | [ ] | Model renderiza |
| 3.1.4 | Documentação export procedure | 3D | 1h | [ ] | README criado |
| **3.2** | **Integrar Three.js MuseumViewer** | Frontend Dev (3D) | 5h | [ ] PENDENTE | - |
| 3.2.1 | Instalar three + @react-three/fiber | Frontend | 0.5h | [ ] | npm install OK |
| 3.2.2 | Criar MuseumViewer.tsx component | Frontend | 2h | [ ] | Component renders |
| 3.2.3 | Integrar OrbitControls | Frontend | 1.5h | [ ] | Drag/zoom/rotate work |
| 3.2.4 | Criar página `/museum` | Frontend | 1h | [ ] | Route acessível |
| **3.3** | **Integrar Leaflet GIS Map (252 layers)** | Frontend Dev (GIS) | 7h | [ ] PENDENTE | - |
| 3.3.1 | Instalar leaflet + react-leaflet | Frontend | 0.5h | [ ] | npm install OK |
| 3.3.2 | Criar InteractiveGISMap.tsx | Frontend | 2h | [ ] | Map renders |
| 3.3.3 | Carregar 252 camadas (GeoJSON) | Frontend | 2h | [ ] | Camadas aparecem |
| 3.3.4 | Implementar layer toggles | Frontend | 1.5h | [ ] | Checkboxes funcionam |
| 3.3.5 | Criar página `/map` | Frontend | 1h | [ ] | Route acessível |
| **3.4** | **Dashboard + Integração 3D+Bib+Map** | Frontend Dev | 4h | [ ] PENDENTE | - |
| 3.4.1 | Criar Dashboard com 3 abas | Frontend | 2h | [ ] | 3 tabs alternam |
| 3.4.2 | Links cruzados (item→map, etc) | Frontend | 1.5h | [ ] | Sincronização OK |
| 3.4.3 | Navbar + navegação global | Frontend | 0.5h | [ ] | Links funcionam |
| **SEMANA 3 CONSOLIDAÇÃO** | | | | | |
| 3.5 | Gerar `reports/FASE_2_SEMANA_3_CONSOLIDACAO.json` | Tech Lead | 1h | [ ] | Report completo |
| 3.6 | Validação Externa | Tech Lead | 1h | [ ] | 6/6 critérios PASS |

**SEMANA 3 TOTAL:** 26 horas planejadas

**Entregáveis Esperados:**
- [ ] `models/3d/sede-vila-terezinha.glb` (<50MB)
- [ ] `frontend/src/components/museum/MuseumViewer.tsx`
- [ ] `frontend/src/pages/Museum3D.tsx`
- [ ] `frontend/src/components/map/InteractiveGISMap.tsx`
- [ ] `frontend/src/pages/InteractiveMap.tsx`
- [ ] `frontend/src/pages/Dashboard.tsx` (integração)
- [ ] Mapa com 252 camadas carregáveis
- [ ] Zero WebGL errors
- [ ] `reports/FASE_2_SEMANA_3_CONSOLIDACAO.json`

---

## 🗓️ SEMANA 4: API + Testing + GO/NO-GO (28 FEV - 6 MAR)

### Status Geral: [ ] 0% → 100%

| ID | Tarefa | Responsável | Horas | Status | Evidência |
|---|--------|-------------|-------|--------|-----------|
| **4.1** | **API Endpoints Supabase (8+ RPC)** | Frontend + Backend | 6h | [ ] PENDENTE | - |
| 4.1.1 | Criar 8+ RPC functions em Supabase | Backend | 3h | [ ] | Migrations criadas |
| 4.1.2 | Integrar em frontend (useApi hooks) | Frontend | 2h | [ ] | Hooks funcionam |
| 4.1.3 | Testar CRUD operations | Backend | 1h | [ ] | Supabase Studio OK |
| **4.2** | **Testing Suite Vitest (30+ testes)** | QA / Frontend | 8h | [ ] PENDENTE | - |
| 4.2.1 | Setup Vitest + @testing-library | Frontend | 1h | [ ] | Config pronto |
| 4.2.2 | Testes Componentes (15+ testes) | QA | 3h | [ ] | SearchBar/Filter/Card/etc |
| 4.2.3 | Testes Pages (6+ testes) | QA | 2h | [ ] | BibliotecaDigital/Museum/Map |
| 4.2.4 | Testes Services/Hooks (9+ testes) | QA | 1.5h | [ ] | supabaseClient/useApi |
| 4.2.5 | Coverage report (aim > 70%) | QA | 0.5h | [ ] | Coverage report HTML |
| **4.3** | **GO/NO-GO Consolidação Final** | Tech Lead | 3h | [ ] PENDENTE | - |
| 4.3.1 | Validar 6 critérios aprovação | Tech Lead | 1h | [ ] | Checklist 6/6 PASS |
| 4.3.2 | Gerar FASE_2_CONSOLIDACAO.json | Tech Lead | 1h | [ ] | Report completo |
| 4.3.3 | Documentar recomendação GO/NO-GO | Tech Lead | 1h | [ ] | Decisão assinada |

**SEMANA 4 TOTAL:** 17 horas planejadas

**Entregáveis Esperados:**
- [ ] 8+ RPC functions em Supabase (migrations)
- [ ] React Query hooks para cada function
- [ ] 30+ testes criados (Vitest)
- [ ] Coverage > 70%
- [ ] `npm run test` → "All tests passed"
- [ ] `reports/FASE_2_CONSOLIDACAO.json` (final)
- [ ] GO/NO-GO decision document
- [ ] Pronto para Fase 3

---

## 📈 RESUMO GERAL (SEMANAS 2-4)

### Horas Planejadas
| Semana | Frontend | Backend | 3D | QA | Tech Lead | TOTAL |
|--------|----------|---------|----|----|-----------|-------|
| **2** | 14h | 2h | - | - | 2h | **18h** |
| **3** | 16h | - | 6h | - | 2h | **24h** |
| **4** | 3h | 4h | - | 8h | 3h | **18h** |
| **TOTAL** | **33h** | **6h** | **6h** | **8h** | **7h** | **60h** |

### Componentes Entregáveis (By Semana)

**SEMANA 2:**
- SearchBar, FilterPanel, ItemCard (refactored)
- ItemDetail, Navbar, Pagination, LoadingSpinner, EmptyState, Modal, TagCloud (NEW)
- BibliotecaDigital page (/biblioteca)
- supabaseClient.ts (6+ CRUD functions)
- useApi.ts (React Query hooks)

**SEMANA 3:**
- sede-vila-terezinha.glb (3D model, <50MB)
- MuseumViewer.tsx component
- Museum3D page (/museum)
- InteractiveGISMap.tsx component
- InteractiveMap page (/map)
- Dashboard page (integração 3 componentes)

**SEMANA 4:**
- 8+ RPC functions (Supabase migrations)
- 30+ testes (Vitest + React Testing Library)
- Coverage report (>70%)
- FASE_2_CONSOLIDACAO.json (final report)
- GO/NO-GO decision document

### Critérios de Sucesso (6 Pontos)

```
✓ 1. React app localhost:5173 (npm run dev)
✓ 2. Supabase schema com RLS (6+ tabelas)
✓ 3. Biblioteca Digital search/filter (funcional)
✓ 4. 3D Museum + GIS Map (sem WebGL errors)
✓ 5. 5+ Components + 30+ testes (coverage >70%)
✓ 6. API endpoints (8+ RPC functions integrados)

TODOS 6 → GO FASE 3
```

---

## 📝 NOTAS IMPORTANTES

### Dependências Críticas
- Semana 2 DEVE estar 100% pronta antes Semana 3
- Modelo 3D DEVE estar otimizado antes integração Three.js
- API DEVE estar funcional antes testing suite
- Todos testes DEVEM passar antes consolidação final

### Riscos Monitorados
- **3D Performance** (252 GIS + 3D model): Mitigar com LOD + virtual scrolling
- **Blender Model Size**: Test com glTF Draco compression
- **Test Coverage**: Priorizar componentes críticos se tempo curto
- **Browser Memory**: Monitor em DevTools durante 252 layers load

### Comunicação
- Daily standup: reporte bloqueantes imediatamente
- Weekly: report `FASE_2_SEMANA_X_CONSOLIDACAO.json` sexta-feira
- Validação Externa: após relatório, antes próxima semana

---

## ✅ CHECKLIST PRÉ-SEMANA 2

Antes de iniciar, confirmar:
- [ ] Ambiente Node.js/npm configurado
- [ ] React dev server rodando (`npm run dev`)
- [ ] Supabase schema documentado
- [ ] Git repository configurado
- [ ] Team comunicado sobre schedule
- [ ] Este documento lido completamente

---

**Atualizado:** 2026-02-06 02:19 UTC  
**Próxima Revisão:** 2026-02-13 (Semana 2 início)  
**Status:** PRONTO PARA EXECUÇÃO ✅
