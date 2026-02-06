# ⚡ FASE 2 - QUICK START CHECKLIST (Semanas 2-4)

**Imprima ou fixe na tela** para referência rápida durante execução

---

## 🚀 PRÉ-SEMANA 2 (até 2026-02-12)

### Setup Confirmado?
```
[ ] Node.js 18+ instalado (node --version)
[ ] npm run dev executa sem erros
[ ] Supabase schema documentado (docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md)
[ ] Git repository operacional
[ ] Team comunicado (Roo, Backend, 3D Artist, QA)
```

### Documentos Lidos?
```
[ ] PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md (PRINCIPAL)
[ ] FASE_2_SEMANAS_2_3_4_TRACKING.md
[ ] FASE_2_INDICE_EXECUCAO.md (este documento)
```

---

## 📅 SEMANA 2: COMPONENT LIBRARY + BIBLIOTECA DIGITAL

### Segunda-Terça (2026-02-13 ~ 2026-02-14)

#### Tarefa 2.1: Component Library (10+ componentes)
```
[ ] SearchBar.tsx refatorado (debounce, clear button)
[ ] FilterPanel.tsx expandido (categorias, datas)
[ ] ItemCard.tsx refatorado (thumbnail, hover effect)
[ ] ItemDetail.tsx novo (modal com detalhe completo)
[ ] Navbar.tsx novo (logo, links, user menu)
[ ] Pagination.tsx novo (page numbers, jump-to)
[ ] LoadingSpinner.tsx novo (animated spinner)
[ ] EmptyState.tsx novo (ícone + mensagem)
[ ] Modal.tsx novo (genérico com header/footer)
[ ] TagCloud.tsx novo (tags interativas)

CRITÉRIO: npm run build sem erros, 0 console warnings
```

### Quarta-Quinta (2026-02-15 ~ 2026-02-16)

#### Tarefa 2.2: Biblioteca Digital Page
```
[ ] SearchBar integrado no topo (real-time)
[ ] FilterPanel sidebar (categorias, datas)
[ ] ItemCard em grid (3 cols desktop, responsive)
[ ] ItemDetail modal ao clicar
[ ] View modes: Grid / List / Map (botões alternam)
[ ] Paginação (12 itens/página)
[ ] LoadingSpinner enquanto carrega
[ ] EmptyState quando sem resultados

ROTA: /biblioteca acessível
CRITÉRIO: Todos 3 view modes funcionando sem lag
```

#### Tarefa 2.3: Supabase CRUD
```
[ ] supabaseClient.ts: getCatalogos()
[ ] supabaseClient.ts: searchCatalogos(query)
[ ] supabaseClient.ts: getCatalogoById(id)
[ ] supabaseClient.ts: createCatalogo(data)
[ ] supabaseClient.ts: updateCatalogo(id, data)
[ ] supabaseClient.ts: deleteCatalogo(id)

[ ] useApi.ts: useCatalogos() hook
[ ] useApi.ts: useSearchCatalogos(query) hook
[ ] useApi.ts: useCreateCatalogo() mutation
[ ] BibliotecaDigital integrado com hooks

CRITÉRIO: getData() funciona (real ou mock)
```

### Sexta (2026-02-17)

#### Validação Semana 2
```
[ ] npm run build < 5 segundos
[ ] npm run test (se testes existem, passam)
[ ] Zero TypeScript errors
[ ] Zero console errors
[ ] /biblioteca acessível e funcional
[ ] 10+ componentes existem em frontend/src/components/library/

REPORT: reports/FASE_2_SEMANA_2_CONSOLIDACAO.json
VALIDAÇÃO: PROMPT_VALIDACAO_FASE_2.md (6 critérios)
RESULTADO: PASS/FAIL
```

---

## 📅 SEMANA 3: 3D MUSEUM + GIS MAP

### Segunda-Terça (2026-02-20 ~ 2026-02-21)

#### Tarefa 3.1: Blender → Three.js
```
[ ] Modelo 3D aberto em Blender
[ ] Geometria otimizada (combinar meshes)
[ ] Texturas 2K max (baked)
[ ] Export .glb com Draco compression
[ ] Arquivo < 50MB
[ ] Validado em Three.js Editor (renderiza OK)

OUTPUT: models/3d/sede-vila-terezinha.glb
CRITÉRIO: Modelo renderiza sem erro, texturas visíveis
```

### Quarta-Quinta (2026-02-22 ~ 2026-02-23)

#### Tarefa 3.2: MuseumViewer 3D
```
[ ] npm install three @react-three/fiber @react-three/drei
[ ] MuseumViewer.tsx criado
[ ] Canvas renderiza modelo .glb
[ ] OrbitControls: drag, zoom, rotate funcionam
[ ] Auto-rotate suave (2 deg/s)
[ ] Iluminação adequada (ambient + directional)
[ ] Página /museum acessível
[ ] Sem WebGL errors

CRITÉRIO: FPS > 30, Model carrega < 5s
```

#### Tarefa 3.3: GIS Map (252 layers)
```
[ ] npm install leaflet react-leaflet
[ ] InteractiveGISMap.tsx criado
[ ] MapContainer renderiza (OSM tiles)
[ ] Sidebar com checkboxes (252 camadas)
[ ] GeoJSON carrega para cada camada
[ ] Toggle on/off funciona
[ ] Zoom/pan funciona
[ ] Click feature mostra popup
[ ] Página /map acessível

CRITÉRIO: Todas camadas carregáveis, FPS > 30
```

### Sexta (2026-02-24)

#### Tarefa 3.4: Dashboard Integração
```
[ ] Dashboard.tsx com 3 abas (Biblioteca/Museum/Map)
[ ] Navbar global (logo, links)
[ ] Abas alternam suave (sem reload)
[ ] Links cruzados (item→map location, etc)
[ ] Dados sincronizam entre componentes

CRITÉRIO: Navegação fluida, zero erros
```

#### Validação Semana 3
```
[ ] modelo 3d/sede-vila.glb existe (< 50MB)
[ ] /museum acessível e renderiza modelo
[ ] /map acessível com 252 camadas
[ ] OrbitControls funciona
[ ] GIS layer toggles funcionam
[ ] Dashboard integra 3 componentes
[ ] Nenhum WebGL error

REPORT: reports/FASE_2_SEMANA_3_CONSOLIDACAO.json
VALIDAÇÃO: PROMPT_VALIDACAO_FASE_2.md (6 critérios)
RESULTADO: PASS/FAIL
```

---

## 📅 SEMANA 4: API + TESTING + GO/NO-GO

### Segunda-Terça (2026-02-27 ~ 2026-02-28)

#### Tarefa 4.1: API Endpoints (8+ RPC)
```
[ ] RPC 1: search_catalogos(query, limit)
[ ] RPC 2: get_localidade_catalogos(id)
[ ] RPC 3: get_user_collections(user_id)
[ ] RPC 4: add_to_collection(user_id, col_id, cat_id)
[ ] RPC 5: get_localidades_stats()
[ ] RPC 6: get_models_3d()
[ ] RPC 7: get_gis_layers(limit)
[ ] RPC 8: get_catalogos_by_category(categoria)

[ ] Migrations criadas (supabase/migrations/)
[ ] Frontend hooks em useApi.ts
[ ] Cada RPC testado em Supabase Studio
[ ] Sem 401/403 errors (RLS OK)

CRITÉRIO: Todas 8+ functions retornam dados
```

### Quarta-Quinta (2026-03-01 ~ 2026-03-02)

#### Tarefa 4.2: Testing Suite (30+ testes)
```
[ ] Vitest + @testing-library configurado
[ ] Setup file criado (cleanup, jest-dom)

COMPONENTES (15+ testes):
[ ] SearchBar.test.tsx (3 testes)
[ ] FilterPanel.test.tsx (4 testes)
[ ] ItemCard.test.tsx (3 testes)
[ ] ItemDetail.test.tsx (2 testes)
[ ] Pagination.test.tsx (3 testes)

PAGES (6+ testes):
[ ] BibliotecaDigital.test.tsx (6 testes)

SERVICES (9+ testes):
[ ] supabaseClient.test.ts (3 testes)
[ ] useApi.test.ts (6 testes)

VALIDAÇÃO:
[ ] npm run test: 30+ tests passed
[ ] npm run test:coverage > 70%
[ ] Coverage report HTML viewable

CRITÉRIO: npm run test returns 0 failures
```

### Sexta (2026-03-03)

#### Tarefa 4.3: GO/NO-GO Final
```
VALIDAÇÃO 6 CRITÉRIOS:

[ ] 1. React app localhost:5173
      npm run dev inicia, HMR funciona
      npm run build < 5s, bundle < 300KB

[ ] 2. Supabase schema RLS
      6+ tabelas com RLS policies
      Índices implementados
      Storage buckets OK

[ ] 3. Biblioteca Digital search/filter
      SearchBar funciona
      FilterPanel funciona
      Grid/List/Map modes

[ ] 4. 3D Museum + GIS Map
      MuseumViewer renderiza
      OrbitControls responsivos
      252 camadas carregáveis
      Zero WebGL errors

[ ] 5. Components + Testes (30+)
      10+ componentes criados
      30+ testes passando
      Coverage > 70%

[ ] 6. API endpoints (8+)
      8+ RPCs funcionando
      React Query hooks
      CRUD OK

RESULTADO:
✓ TODOS 6 PASS → GO FASE 3 ✅
✗ QUALQUER 1 FAIL → NO-GO + REMEDIATION ❌

REPORT: reports/FASE_2_CONSOLIDACAO.json
DECISÃO: GO/NO-GO assinada
```

---

## 📊 CHECKLIST FINAL (Semana 4 Sexta)

### Entregáveis Completados?
```
SEMANA 2:
[ ] 10+ componentes em frontend/src/components/library/
[ ] BibliotecaDigital.tsx page
[ ] supabaseClient.ts (6+ functions)
[ ] useApi.ts (React Query hooks)

SEMANA 3:
[ ] models/3d/sede-vila-terezinha.glb
[ ] MuseumViewer.tsx component
[ ] Museum3D.tsx page (/museum)
[ ] InteractiveGISMap.tsx component
[ ] InteractiveMap.tsx page (/map)
[ ] Dashboard.tsx (3 abas)

SEMANA 4:
[ ] 8+ RPC functions (migrations)
[ ] 30+ testes (Vitest)
[ ] Coverage > 70%
[ ] FASE_2_CONSOLIDACAO.json report
```

### Build & Quality?
```
[ ] npm run build sem erros
[ ] npm run test sem falhas (30+ testes passing)
[ ] npm run lint sem erros críticos
[ ] Zero console errors (DevTools)
[ ] Zero TypeScript errors (npm run type-check)
[ ] Bundle size < 300KB gzipped
[ ] Build time < 5 segundos
```

### Documentação?
```
[ ] README.md atualizado
[ ] Inline comments em código crítico
[ ] docs/ folder organizado
[ ] CHANGELOG.md ou release notes
[ ] Procedure documentation para deploy
```

### Validação Externa?
```
[ ] PROMPT_VALIDACAO_FASE_2.md aplicado
[ ] 6 critérios aprovação validados
[ ] Report JSON assinado
[ ] GO/NO-GO decisão documentada
[ ] Team comunicado resultado
```

---

## 🎯 COMANDO RÁPIDO REFERÊNCIA

```bash
# DESENVOLVIMENTO
npm run dev           # Iniciar dev server (localhost:5173)
npm run build        # Build production
npm run preview      # Preview build

# TESTES
npm run test         # Rodar testes
npm run test:ui      # UI para testes
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# QUALIDADE
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run format       # Format code (Prettier)

# SUPABASE
supabase start       # Start local Supabase
supabase stop        # Stop local Supabase
supabase status      # Status
supabase migration list  # List migrations
```

---

## ⏰ TIMING ESTIMADO

```
SEMANA 2: 18h (30h total se paralelo com outras)
SEMANA 3: 24h (38h total)
SEMANA 4: 18h (26h total)
TOTAL: 60h (3 semanas)

DIVISÃO:
Frontend: 33h
Backend: 6h
3D: 6h
QA: 8h
Tech Lead: 7h
```

---

## 🚨 BLOQUEANTES - NOTIFIQUE IMEDIATAMENTE

```
[ ] Supabase schema não pronto
[ ] Modelo 3D não otimizado (> 50MB)
[ ] Three.js performance inaceitável (FPS < 30)
[ ] GIS layers lag (252+ layers)
[ ] Testes não passando (< 30)
[ ] Build fails
[ ] RLS policies bloqueando queries
```

---

## 📞 CONTATO RÁPIDO

| Papel | Contato | Slack |
|-------|---------|-------|
| Tech Lead | Roo | @roo |
| Frontend | Frontend Dev | @frontend |
| Backend | Backend Dev | @backend |
| 3D | 3D Artist | @3d |
| QA | QA Tester | @qa |

**Bloqueante?** → Notifique Roo + team imediatamente

---

## 📝 NOTAS DE ÚLTIMA HORA

- Manter este documento atualizado durante execução
- Transferir checkmarks [ ] → [x] conforme completa
- Atualizar FASE_2_SEMANAS_2_3_4_TRACKING.md daily
- Report JSON gerado toda sexta-feira
- Validação externa imediatamente após report

---

**Printed:** 2026-02-06  
**Versão:** 1.0 Quick Start  
**Status:** ✅ PRONTO PARA USO  
**Próxima Atualização:** 2026-02-13 (Semana 2 segunda)

---

## RECURSOS RÁPIDOS

👉 **DOCUMENTAÇÃO PRINCIPAL:** [`PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md`](PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md)  
👉 **TRACKING DIÁRIO:** [`FASE_2_SEMANAS_2_3_4_TRACKING.md`](FASE_2_SEMANAS_2_3_4_TRACKING.md)  
👉 **ÍNDICE COMPLETO:** [`FASE_2_INDICE_EXECUCAO.md`](FASE_2_INDICE_EXECUCAO.md)  
👉 **VALIDAÇÃO:** [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md)
