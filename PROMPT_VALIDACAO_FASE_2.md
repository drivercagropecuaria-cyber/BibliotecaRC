# 🔍 PROMPT DE VALIDAÇÃO FASE 2 - Para Agente Externo

**Para:** Agente Validador Externo (QA/Validation Specialist)  
**De:** Roo (Technical Lead)  
**Fase:** Fase 2 - MVP Development (Execução)  
**Data:** 2026-02-13  
**Status esperado:** APROVAÇÃO PARA GO/NO-GO (ou REPROVAÇÃO COM PENDÊNCIAS)

---

## 🎯 SUA MISSÃO

Você é responsável por **validar a execução completa de Fase 2** do projeto Mundo Virtual Villa Canabrava. Fase 1 (GIS Fundação) já foi **APROVADA**. Agora validamos se Fase 2 foi executada conforme plano.

**Seu trabalho é:**
1. ✅ Verificar se todos os 6 deliverables esperados foram criados
2. ✅ Validar que as métricas atendem aos critérios mínimos
3. ✅ Testar funcionalidades críticas (React app, Supabase, componentes, 3D, GIS)
4. ✅ Identificar QUALQUER pendência crítica
5. ✅ Emitir parecer final: **APROVADO** ou **REPROVADO**

---

## 📋 O QUE VALIDAR - CHECKLIST CRÍTICO

### SEMANA 1: React Setup + Supabase Schema
**Data esperada de conclusão:** 2026-02-20

#### ✅ Tarefa 1.1 - React 18 + TypeScript with Vite
**Arquivo/Local esperado:** `BIBLIOTECA/frontend/` diretório

**Validação:**

1. **Estrutura de Projeto:**
   - [ ] Pasta `frontend/` existe
   - [ ] Arquivo `frontend/package.json` contém `"name": "biblioteca-frontend"`
   - [ ] Arquivo `frontend/package.json` contém dependências:
     - `"react": "^18.x"`
     - `"typescript": "^5.x"`
     - `"vite": "^5.x"`
     - `"@supabase/supabase-js"`
     - `"@tanstack/react-query"`
     - `"zustand"`
   - [ ] Arquivo `frontend/vite.config.ts` existe e é válido
   - [ ] Arquivo `frontend/tsconfig.json` existe com `"strict": true`
   - [ ] Arquivo `frontend/src/main.tsx` contém React app bootstrap

2. **Funcionamento:**
   - [ ] Navegar até: `cd C:\Users\rober\Downloads\BIBLIOTECA\frontend`
   - [ ] Executar: `npm install` (ou confirmação de que já foi instalado)
   - [ ] Executar: `npm run dev`
   - [ ] Verificar output contém: `Local: http://localhost:5173/`
   - [ ] Abrir browser em `http://localhost:5173/`
   - [ ] Página carrega sem erros no console (F12 → Console)
   - [ ] Modificar arquivo `src/App.tsx`, salvar e verificar HMR (hot reload automático)

3. **Build Verification:**
   - [ ] Executar: `npm run build`
   - [ ] Verificar: pasta `frontend/dist/` criada
   - [ ] Verificar: `dist/` contém `index.html`, `assets/` com .js e .css
   - [ ] Build finaliza em < 10 segundos

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "React app não funciona ou não está configurado corretamente"
- Impacto: Impossível usar qualquer componente, bloqueia Semana 2
- Ação: Recriar projeto com `npm create vite@latest frontend -- --template react-ts`

---

#### ✅ Tarefa 1.2 - Supabase Schema Design Document
**Arquivo esperado:** `BIBLIOTECA/docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md`

**Validação:**

- [ ] Arquivo existe em `docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md`
- [ ] Arquivo é Markdown válido (não corrupto)
- [ ] Contém seção "## Tabelas Principais (RLS Enabled)"
- [ ] Documenta 6 tabelas com colunas e tipos:
  - [ ] **users** - id UUID PK, email, role enum, created_at
  - [ ] **localidades** - id UUID, nome, geom geometry, categoria, metadata JSONB
  - [ ] **catalogos** - id UUID, titulo, descricao, categoria, tags array, metadata JSONB
  - [ ] **collections** - id UUID, user_id FK, nome, catalogo_ids array
  - [ ] **models_3d** - id UUID, nome, blender_source_url, threejs_gltf_url, lokalisacao_id FK
  - [ ] **gis_layers** - id UUID, nome, geojson_features JSONB, visible_default boolean
- [ ] Cada tabela tem RLS Policy descrita:
  - [ ] users: SELECT self only
  - [ ] localidades: SELECT public, INSERT/UPDATE admin only
  - [ ] catalogos: SELECT public, INSERT/UPDATE author only
  - [ ] collections: user only
  - [ ] models_3d: SELECT public, INSERT/UPDATE curator only
  - [ ] gis_layers: SELECT public, INSERT/UPDATE curator only
- [ ] Contém seção "## Indices (Performance)"
- [ ] Contém seção "## Functions (RPC)" com 3+ RPC functions:
  - [ ] `search_catalogos(query TEXT, limit INT)`
  - [ ] `get_localidade_catalogos(localidade_id UUID)`
  - [ ] `get_user_collections(user_id UUID)`
- [ ] Contém seção "## Storage Buckets" com 3+ buckets:
  - [ ] acervo-files
  - [ ] 3d-models
  - [ ] thumbnails
- [ ] Contém tabela RLS Policies Summary

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Schema design incompleto ou não documentado"
- Impacto: Backend não tem blueprint para implementar
- Ação: Completar documento conforme template

---

#### ✅ Tarefa 1.3 - Supabase Local Setup (Docker)
**Local esperado:** Supabase rodando em `localhost:54321`

**Validação:**

1. **CLI e Docker:**
   - [ ] Executar no terminal: `supabase --version` (mostra versão instalada)
   - [ ] Docker desktop está rodando (verificar Docker daemon)
   - [ ] Executar: `supabase projects list` (mostra projetos ou vazio, sem erro)

2. **Supabase Initialization:**
   - [ ] Arquivo `supabase/config.toml` existe na raiz `BIBLIOTECA/`
   - [ ] Pasta `supabase/migrations/` existe
   - [ ] Pasta `supabase/functions/` existe

3. **Services Running:**
   - [ ] Executar na raiz: `supabase start`
   - [ ] Aguardar até ver output similar a:
     ```
     Started Docker container supabase-db
     ...
     API URL: http://localhost:54321
     DB URL: postgresql://postgres:postgres@localhost:54322/postgres
     Studio URL: http://localhost:54323
     Inbucket URL: http://localhost:54324
     ```
   - [ ] Acessar `http://localhost:54323` no browser (Supabase Studio)
   - [ ] Studio carrega sem erros e mostra interface
   - [ ] Abas: Sql Editor, Auth, Database, Storage visíveis

4. **Frontend Connection:**
   - [ ] Arquivo `frontend/.env.local` existe
   - [ ] Contém:
     ```
     VITE_SUPABASE_URL=http://localhost:54321
     VITE_SUPABASE_ANON_KEY=<valid_token>
     ```
   - [ ] Navegar em `frontend/`, executar `npm run dev`
   - [ ] App carrega (localhost:5173) sem erros de conexão Supabase

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Supabase não está rodando ou não conecta ao frontend"
- Impacto: Nenhum dado pode ser persistido, bloqueia Semana 2-4
- Ação: Reinstalar Docker, reinstalar Supabase CLI, executar `supabase start`

---

### SEMANA 2: Component Library + Biblioteca Digital
**Data esperada de conclusão:** 2026-02-27

#### ✅ Tarefa 2.1 - React Component Library (5+ components)
**Local esperado:** `BIBLIOTECA/frontend/src/components/`

**Validação:**

1. **Estrutura de Pastas:**
   - [ ] Pasta `src/components/common/` existe
   - [ ] Pasta `src/components/library/` existe
   - [ ] Pasta `src/components/map/` existe

2. **Componentes Obrigatórios:**
   
   **SearchBar.tsx:**
   - [ ] Arquivo existe em `src/components/library/SearchBar.tsx`
   - [ ] Exporta componente React funcional
   - [ ] Aceita prop `onSearch: (query: string) => void`
   - [ ] Renderiza `<input>` para busca
   - [ ] Chama `onSearch` ao digitador (onChange)

   **FilterPanel.tsx:**
   - [ ] Arquivo existe em `src/components/library/FilterPanel.tsx`
   - [ ] Exporta componente React funcional
   - [ ] Aceita props: `categories: string[]`, `selectedCategories: string[]`, `onFilterChange: (cats: string[]) => void`
   - [ ] Renderiza checkboxes para cada categoria
   - [ ] Chama `onFilterChange` ao clicar checkbox

   **ItemCard.tsx:**
   - [ ] Arquivo existe em `src/components/library/ItemCard.tsx`
   - [ ] Aceita prop `item: any` e `onClick?: (item: any) => void`
   - [ ] Renderiza card com título, descrição, imagem
   - [ ] Chama `onClick` ao clicar card

   **ItemDetail.tsx:**
   - [ ] Arquivo existe em `src/components/library/ItemDetail.tsx`
   - [ ] Aceita props: `item: any`, `onClose: () => void`
   - [ ] Mostra detalhes completos do item (modal ou sidebar)
   - [ ] Botão "Fechar" que chama `onClose`

   **Navbar.tsx:**
   - [ ] Arquivo existe em `src/components/common/Navbar.tsx`
   - [ ] Renderiza navegação com logo, menu, user section

3. **TypeScript Compliance:**
   - [ ] Todos componentes usam `.tsx` (não `.jsx`)
   - [ ] Props são tipadas com `interface` ou `type`
   - [ ] Sem `any` types exceto quando absolutamente necessário
   - [ ] `npm run build` não mostra erros TypeScript

4. **Testing with Vitest:**
   - [ ] Cada componente é testável (aceita props, sem side effects)
   - [ ] Componente pode ser renderizado em testes

**Se NÃO passar:** 🟡 **PENDÊNCIA IMPORTANTE**
- Motivo: "Componentes não criados ou não funcionam"
- Impacto: Biblioteca Digital não pode ser montada
- Ação: Implementar componentes conforme Tarefa 2.1 em PROMPT_EXECUCAO

---

#### ✅ Tarefa 2.2 - Biblioteca Digital Page
**Local esperado:** `BIBLIOTECA/frontend/src/pages/BibliotecaDigital.tsx` ou em `src/App.tsx`

**Validação:**

1. **Arquivo Existe:**
   - [ ] Page/componente BibliotecaDigital.tsx existe
   - [ ] Exporta componente React funcional
   - [ ] Pode ser acessado via `localhost:5173/biblioteca` ou é a página principal

2. **Funcionalidades Básicas:**
   - [ ] Renderiza SearchBar componente
   - [ ] Renderiza FilterPanel com categorias
   - [ ] Renderiza grid de ItemCards
   - [ ] Sem erros no console ao carregar página

3. **Busca Funcional:**
   - [ ] Digite algo no SearchBar
   - [ ] Items filtrados aparecem em tempo real
   - [ ] Grid atualiza após digitar (com delay aceitável)

4. **Filtro Funcional:**
   - [ ] Clique em checkbox de categoria
   - [ ] Items filtrados por categoria selecionada
   - [ ] Múltiplas categorias podem ser selecionadas
   - [ ] Clique novamente para desselecionar

5. **Item Detail:**
   - [ ] Clique em um ItemCard
   - [ ] Modal ou detail view abre mostrando informações completas
   - [ ] Botão "Fechar" fecha modal/view

6. **Loading States:**
   - [ ] Página mostra "Carregando..." ou loader enquanto busca dados
   - [ ] Depois mostra items quando carregou

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Biblioteca Digital não funciona"
- Impacto: MVP não tem interface principal
- Ação: Implementar página conforme Tarefa 2.2

---

### SEMANA 3: 3D Museum + GIS Map
**Data esperada de conclusão:** 2026-03-06

#### ✅ Tarefa 3.1 - 3D Model Export (.glb)
**Arquivo esperado:** `BIBLIOTECA/models/3d/sede-vila-terezinha.glb` (ou similar)

**Validação:**

1. **Arquivo Físico:**
   - [ ] Arquivo `.glb` existe em pasta `models/3d/` ou `frontend/public/models/`
   - [ ] Tamanho do arquivo < 50 MB (idealmente < 30 MB)
   - [ ] Tamanho do arquivo > 1 MB (não vazio)

2. **Verificação com Three.js Editor:**
   - [ ] Abrir [Three.js Editor](https://threejs.org/editor/)
   - [ ] File → Import → selecionar `.glb`
   - [ ] Modelo carrega sem erros
   - [ ] Geometria visível (não é caixa branca vazia)
   - [ ] Texturas aparecem (não é cinza/branco plano)
   - [ ] Modelo tem escala razoável (não minúsculo, não gigantesco)

3. **Metadata (Optional but Good):**
   - [ ] Criar arquivo `models/3d/sede-vila-terezinha.json` com metadata:
     ```json
     {
       "filename": "sede-vila-terezinha.glb",
       "size_mb": 25,
       "exported_from": "Blender 4.0",
       "optimizations": ["geometry combined", "textures baked 2K", "triangulated"],
       "preview_available": true
     }
     ```

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Modelo 3D não exportado ou corrompido"
- Impacto: MuseumViewer não pode renderizar modelo
- Ação: Exportar do Blender como glTF 2.0 (.glb) com otimizações

---

#### ✅ Tarefa 3.2 - Three.js Museum Viewer Component
**Local esperado:** `BIBLIOTECA/frontend/src/components/museum/MuseumViewer.tsx`

**Validação:**

1. **Arquivo e Imports:**
   - [ ] Arquivo `src/components/museum/MuseumViewer.tsx` existe
   - [ ] Importa `Canvas` from `@react-three/fiber`
   - [ ] Importa `OrbitControls, useGLTF` from `@react-three/drei`

2. **Componente Structure:**
   - [ ] Exporta componente `MuseumViewer` funcional
   - [ ] Aceita props: `modelUrl: string`, `title?: string`
   - [ ] Renderiza `<Canvas>` container

3. **Rendering Test:**
   - [ ] Criar página de teste ou adicionar a App.tsx:
     ```tsx
     <MuseumViewer 
       modelUrl="/models/sede-vila-terezinha.glb"
       title="Sede Villa Terezinha"
     />
     ```
   - [ ] Abrir em `localhost:5173`
   - [ ] 3D modelo carrega no canvas
   - [ ] Modelo é visível (não preto, não branco vazio)
   - [ ] Sem erros WebGL no console

4. **Interactivity:**
   - [ ] Mouse drag na área 3D - modelo rotaciona
   - [ ] Mouse scroll - zoom in/out funciona
   - [ ] Modelo rotaciona suavemente (não travado)

5. **Performance:**
   - [ ] Modelo carrega em < 5 segundos
   - [ ] Frame rate estável (60 FPS ou proche, sem drops severos)
   - [ ] Não causa lag na página

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "MuseumViewer não renderiza modelo ou tem erros WebGL"
- Impacto: Museu virtual não funciona
- Ação: Verificar modelo .glb, validar Three.js setup, revisar componente

---

#### ✅ Tarefa 3.3 - Leaflet GIS Interactive Map
**Local esperado:** `BIBLIOTECA/frontend/src/components/map/InteractiveGISMap.tsx`

**Validação:**

1. **Arquivo e Imports:**
   - [ ] Arquivo `src/components/map/InteractiveGISMap.tsx` existe
   - [ ] Importa `MapContainer, TileLayer, GeoJSON` from `react-leaflet`

2. **Componente Structure:**
   - [ ] Exporta componente `InteractiveGISMap` funcional
   - [ ] Aceita props: `visibleLayers?: string[]`, `onFeatureClick?: (feature: any) => void`

3. **Map Rendering:**
   - [ ] Criar página de teste ou adicionar a App.tsx:
     ```tsx
     <InteractiveGISMap 
       visibleLayers={['MATA_001', 'MATA_002']}
       onFeatureClick={(feature) => console.log(feature)}
     />
     ```
   - [ ] Abrir em `localhost:5173`
   - [ ] Mapa carrega com OpenStreetMap tiles
   - [ ] Mapa está centrizado em coordenadas corretas (Villa Canabrava region)
   - [ ] Sem erros no console

4. **Layers and Controls:**
   - [ ] Sidebar com lista de camadas aparece
   - [ ] Checkboxes para cada camada (ou ao menos algumas)
   - [ ] GeoJSON features renderizam como pontos/polígonos no mapa
   - [ ] Total de 252 camadas suportadas (pode ser subset para MVP)

5. **Interactivity:**
   - [ ] Zoom in/out com scroll mouse
   - [ ] Pan map com drag
   - [ ] Clique em feature mostra info ou dispara callback
   - [ ] Checkbox toggle mostra/esconde camadas

6. **Performance:**
   - [ ] Mapa carrega em < 3 segundos
   - [ ] Pan/zoom são suaves (não congelados)
   - [ ] Mesmo com múltiplas camadas visíveis, performance aceitável

**Se NÃO passar:** 🟡 **PENDÊNCIA IMPORTANTE**
- Motivo: "Mapa não renderiza ou camadas não carregam"
- Impacto: Visualização geoespacial não funciona
- Ação: Verificar dados GeoJSON, validar Leaflet setup, revisar componente

---

### SEMANA 4: API Integration + Testing + GO/NO-GO
**Data esperada de conclusão:** 2026-03-13

#### ✅ Tarefa 4.1 - API Integration (Supabase Client + React Query)
**Arquivos esperados:** `src/services/supabaseClient.ts` + `src/hooks/useApi.ts`

**Validação:**

1. **supabaseClient.ts:**
   - [ ] Arquivo `src/services/supabaseClient.ts` existe
   - [ ] Exporta `const supabase = createClient(url, anonKey)`
   - [ ] Importa `createClient` from `@supabase/supabase-js`
   - [ ] Contém objeto `api` com 8+ functions:
     - [ ] `getCatalogos(limit?): Promise<Catalogo[]>`
     - [ ] `searchCatalogos(query: string): Promise<Catalogo[]>`
     - [ ] `getCatalogoById(id: string): Promise<Catalogo>`
     - [ ] `getLocalidades(): Promise<Localidade[]>`
     - [ ] `getLocalidadeCatalogos(localidadeId: string): Promise<Catalogo[]>`
     - [ ] `getModels3D(): Promise<Model3D[]>`
     - [ ] `getGISLayers(): Promise<GISLayer[]>`
     - [ ] Pelo menos 1 mutation function (create/update/delete)

2. **useApi.ts (React Query Hooks):**
   - [ ] Arquivo `src/hooks/useApi.ts` existe
   - [ ] Exporta 5+ custom hooks:
     - [ ] `useCatalogos(): UseQueryResult<Catalogo[]>`
     - [ ] `useCatalogoSearch(query: string): UseQueryResult<Catalogo[]>`
     - [ ] `useLocalidades(): UseQueryResult<Localidade[]>`
     - [ ] `useModels3D(): UseQueryResult<Model3D[]>`
     - [ ] `useGISLayers(): UseQueryResult<GISLayer[]>`
   - [ ] Cada hook usa `useQuery` from `@tanstack/react-query`
   - [ ] Hooks têm `queryKey` única
   - [ ] Query functions buscam dados via `api`

3. **Functional Test:**
   - [ ] Em componente, importar hook: `const { data, isLoading, error } = useCatalogos()`
   - [ ] Renderizar dados: `{data?.map(item => <div key={item.id}>{item.titulo}</div>)}`
   - [ ] Observar em console que Supabase query é executada
   - [ ] Data renderiza sem erros
   - [ ] Loading state mostra enquanto busca

4. **Error Handling:**
   - [ ] Cada função tem try/catch ou `.then().catch()`
   - [ ] Erros são logados ou retornados
   - [ ] React Query mostra estado `error` corretamente

**Se NÃO passar:** 🟡 **PENDÊNCIA IMPORTANTE**
- Motivo: "API não integrada ou React Query não configurado"
- Impacto: Dados não sincronizam com backend
- Ação: Implementar conforme Tarefa 4.1

---

#### ✅ Tarefa 4.2 - Vitest Unit Tests (8+ testes, 70%+ coverage)
**Local esperado:** `src/**/__tests__/` arquivos `.test.tsx`

**Validação:**

1. **Vitest Setup:**
   - [ ] Arquivo `frontend/vitest.config.ts` existe
   - [ ] `package.json` contém scripts:
     - [ ] `"test": "vitest"`
     - [ ] `"test:ui": "vitest --ui"`
   - [ ] Dependências instaladas: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`

2. **Test Files Existence:**
   - [ ] Pasta `src/components/library/__tests__/` existe
   - [ ] Arquivo `SearchBar.test.tsx` existe
   - [ ] Arquivo `FilterPanel.test.tsx` existe
   - [ ] Arquivo `ItemCard.test.tsx` existe
   - [ ] Mínimo 3 arquivos de teste, máximo ilimitado

3. **Test Execution:**
   - [ ] Executar: `npm run test` (ou `npm test`)
   - [ ] Output mostra teste report similar a:
     ```
     SearchBar.test.tsx
       ✓ renders search input
       ✓ calls onSearch when typing
     FilterPanel.test.tsx
       ✓ renders categories
       ✓ calls onFilterChange
     ItemCard.test.tsx
       ✓ renders item title
       ✓ renders item description
       ✓ calls onClick handler
     ...
     ```
   - [ ] Total: 8+ testes passando (✓)
   - [ ] Nenhum teste falhando (×)
   - [ ] Build time < 30 segundos

4. **Coverage Report:**
   - [ ] Executar: `npm run test -- --coverage` (se configurado)
   - [ ] Mostra coverage report (exemplo):
     ```
     Statement   : 72% (46/64)
     Branch      : 65% (13/20)
     Function    : 80% (16/20)
     Line        : 72% (46/64)
     ```
   - [ ] Mínimo 70% de cobertura em componentes críticos
   - [ ] SearchBar, FilterPanel, ItemCard todos com coverage > 70%

5. **Test Visualization:**
   - [ ] Executar: `npm run test:ui`
   - [ ] Abre página `http://localhost:51204/__vitest__/` (ou similar)
   - [ ] Dashboard mostra testes com status (passa/falha)
   - [ ] Pode clicar em teste individual para ver detalhes

**Se NÃO passar:** 🟡 **PENDÊNCIA IMPORTANTE**
- Motivo: "Testes não escritos ou coverage abaixo de 70%"
- Impacto: Qualidade do código não validada
- Ação: Escrever testes conforme Tarefa 4.2

---

#### ✅ Tarefa 4.3 - Consolidação Report
**Arquivo esperado:** `BIBLIOTECA/reports/FASE_2_CONSOLIDACAO.json`

**Validação:**

1. **Arquivo Existe:**
   - [ ] Arquivo `reports/FASE_2_CONSOLIDACAO.json` existe
   - [ ] Arquivo é JSON válido (use validator.w3.org se em dúvida)

2. **JSON Structure:**
   - [ ] Contém campos obrigatórios:
     - [ ] `"project": "Mundo Virtual Villa Canabrava"`
     - [ ] `"phase": "FASE 2 - MVP Development"`
     - [ ] `"consolidation_date": "2026-03-06"` ou data recente
     - [ ] `"status": "PENDING_APPROVAL"` ou "APPROVED"
   - [ ] Contém objeto `"executive_summary"`:
     - [ ] `"deliverables_completed": [lista]` - todos os 6+ artifacts
     - [ ] `"metrics": {...}` com valores numéricos (components count, coverage %, etc)
   - [ ] Contém objeto `"approval_criteria"`:
     - [ ] `"criterion_1"`: React app running - status "✅ PASS" ou "❌ FAIL"
     - [ ] `"criterion_2"`: Supabase schema - status PASS ou FAIL
     - [ ] `"criterion_3"`: Biblioteca Digital - status PASS ou FAIL
     - [ ] `"criterion_4"`: 3D map - status PASS ou FAIL
     - [ ] `"criterion_5"`: 5+ components tested - status PASS ou FAIL
     - [ ] `"criterion_6"`: API integrated - status PASS ou FAIL

3. **GO/NO-GO Decision:**
   - [ ] Contém objeto `"go_nogo_decision"`:
     - [ ] `"recommendation": "GO FOR PHASE 3"` ou `"NO-GO, see risks"`
     - [ ] `"rationale": "..."` - explicação clara
     - [ ] `"risks": [...]` - lista de riscos identificados
     - [ ] `"next_phase_readiness": "READY"` ou `"NOT_READY"`
     - [ ] `"decision_maker": "Roberth Naninne de Souza"`
     - [ ] `"decision_date": "data"`

4. **Completeness Check:**
   - [ ] Relatório menciona semanas 1-4
   - [ ] Cada semana tem "status": "COMPLETED" ou similar
   - [ ] Todos deliverables listados
   - [ ] Métricas numéricas reportadas (não genéricas)

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Consolidação report não gerado ou incompleto"
- Impacto: Não há evidência de conclusão da fase
- Ação: Gerar relatório conforme template em PROMPT_EXECUCAO_FASE_2

---

## ✅ CHECKLIST COMPLETO DE APROVAÇÃO

### Fase 2 Approval Matrix

| Critério | Evidência | Status | Notas |
|----------|-----------|--------|-------|
| React app localhost:5173 | Screenshot/Console output | [ ] | npm run dev sem erros |
| Supabase schema 6 tables | docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md | [ ] | Com RLS policies |
| Biblioteca Digital search | Video/Screenshots | [ ] | Full-text search funciona |
| Biblioteca Digital filter | Video/Screenshots | [ ] | Category filter funciona |
| 3D Museum viewer | 3D model renders no browser | [ ] | Sem WebGL errors |
| GIS map 252 layers | Map layer checklist | [ ] | Layers toggle-able |
| SearchBar component | test result | [ ] | 2+ testes passando |
| FilterPanel component | test result | [ ] | 2+ testes passando |
| ItemCard component | test result | [ ] | 2+ testes passando |
| Test coverage > 70% | Coverage report | [ ] | 70%+ statement coverage |
| API functions 8+ | src/services/supabaseClient.ts | [ ] | Todos implementados |
| React Query hooks | src/hooks/useApi.ts | [ ] | 5+ hooks implementados |
| Consolidation report | reports/FASE_2_CONSOLIDACAO.json | [ ] | Completo e válido |

---

## 🚨 FALHAS CRÍTICAS (Bloqueia Aprovação)

Se QUALQUER um desses itens falha, Fase 2 é **REPROVADA**:

1. ❌ **React app não inicia** → Sem frontend, nada funciona
2. ❌ **Supabase não conecta** → Sem dados, nada funciona
3. ❌ **BibliotecaDigital não renderiza** → Interface principal ausente
4. ❌ **3D model não carrega** → Museu virtual não existe
5. ❌ **Consolidation report não gerado** → Sem evidência de conclusão
6. ❌ **>50% do checklist acima falha** → MVP incompleto

---

## 🟡 Avisos (Reduz Confiança, mas Não Bloqueia)

Se VÁRIOS desses itens falharem, recomende **GO WITH RISK** ou **CONDITIONAL GO**:

1. ⚠️ Test coverage < 70%
2. ⚠️ GIS map com < 100 layers carregando
3. ⚠️ API não completamente integrada
4. ⚠️ Performance issues (build > 10s, frame drops)
5. ⚠️ Erros ocasionais no console

---

## 📝 FORMATO DE RESPOSTA

Ao final da validação, emita parecer no seguinte formato:

```markdown
# 🔍 PARECER DE VALIDAÇÃO FASE 2

**Data:** [data da validação]
**Validador:** [seu nome/função]

## ✅ ITENS APROVADOS
- [ ] React app com HMR funcional
- [ ] Supabase schema documentado
- [ ] Biblioteca Digital interface
- [ ] 3D Museum viewer
- [ ] GIS Map com N camadas
- [ ] Vitest suite com N testes
- [ ] Consolidation report gerado

## ❌ ITENS COM PENDÊNCIAS
- [Lista de 0 ou mais itens não aprovados]

## 🎯 RECOMENDAÇÃO FINAL

**GO** / **GO WITH RISK** / **NO-GO** 

[Justificativa de 1-3 parágrafos explicando decisão]

## 📌 AÇÕES RECOMENDADAS PARA FASE 3

[Se GO: Lista de melhorias recomendadas]
[Se NO-GO: Lista de correções obrigatórias]
```

---

## 🔗 DOCUMENTOS DE REFERÊNCIA

- **PROMPT_EXECUCAO_FASE_2.md** - Tarefas detalhadas (4 semanas)
- **plans/FASE_2_STATUS.json** - Dashboard executivo
- **FASE_2_READY_FOR_EXECUTION.md** - Guia de início rápido
- **README.md** - Links aos documentos

---

## 📞 CONTATOS

**Tech Lead:** Roo  
**Decision Maker:** Roberth Naninne de Souza  
**Arquivos:** c:/Users/rober/Downloads/BIBLIOTECA/

---

**Obrigado por validar Fase 2!** ✨
