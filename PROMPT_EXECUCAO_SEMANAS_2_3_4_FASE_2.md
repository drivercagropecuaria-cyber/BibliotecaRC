# 📋 PROMPT DE EXECUÇÃO - SEMANAS 2, 3, 4 (FASE 2 - MVP Completo)

**Data Início:** 2026-02-13  
**Data Fim Esperada:** 2026-03-13  
**Status Anterior:** Semana 1 APROVADA ✅  
**Próximo Marco:** GO/NO-GO Consolidação Final  

---

## 📊 RESUMO EXECUTIVO

Semana 1 foi completada com **100% de sucesso** (Relatório: `reports/FASE_2_SEMANA_1_CONSOLIDACAO.json`):
- ✅ React 18 + TypeScript + Vite estabelecido
- ✅ Supabase schema documentado (6 tabelas + RLS)
- ✅ 5 componentes React implementados
- ✅ 18 testes unitários definidos

**Agora executamos Semanas 2, 3, 4** para atingir **MVP 100% funcional** com:
1. **Semana 2:** Component library completa (10+ componentes) + Biblioteca Digital 100% funcional + CRUD Supabase
2. **Semana 3:** Pipeline 3D (Blender → Three.js) + GIS Map (252 camadas) + Integração completa
3. **Semana 4:** API endpoints (8+) + Testing suite (30+ testes) + GO/NO-GO final

---

## 🎯 SEMANA 2: Component Library + Biblioteca Digital (2026-02-13 ~ 2026-02-20)

### **Tarefa 2.1: Criar Component Library Reutilizável (5+ → 10+ componentes)**

**ID:** 2.1  
**Responsável:** Frontend Dev  
**Duração Estimada:** 8 horas  
**Status:** PENDENTE  
**Bloqueante:** NÃO

#### Objetivo
Expandir de 5 para 10+ componentes React reutilizáveis, bem tipados com TypeScript e otimizados para performance.

#### Componentes a Implementar

```
frontend/src/components/library/
├── SearchBar.tsx           (✅ EXISTE - melhorar)
├── FilterPanel.tsx         (✅ EXISTE - expandir)
├── ItemCard.tsx            (✅ EXISTE - refatorar)
├── ItemDetail.tsx          (NOVO)
├── Navbar.tsx              (NOVO)
├── Pagination.tsx          (NOVO)
├── LoadingSpinner.tsx      (NOVO)
├── EmptyState.tsx          (NOVO)
├── Modal.tsx               (NOVO)
└── TagCloud.tsx            (NOVO)
```

#### Checklist de Implementação

**SearchBar.tsx (Refatorar)**
- [ ] Input com debounce (500ms)
- [ ] Busca real-time em onChange
- [ ] Clear button (x) ao focar
- [ ] Suggestions dropdown
- [ ] Props tipadas: `{ value, onChange, onClear, placeholder }`
- [ ] CSS Tailwind responsivo

**FilterPanel.tsx (Expandir)**
- [ ] Checkboxes para categorias (documento, foto, audiovisual, mapa, objeto)
- [ ] Range slider para data
- [ ] Color-coded categories
- [ ] "Clear filters" button
- [ ] Props: `{ filters, onFilterChange, categories, dateRange }`
- [ ] Collapse/expand em mobile

**ItemCard.tsx (Refatorar)**
- [ ] Image thumbnail (com fallback)
- [ ] Título + descrição truncada
- [ ] Badge de categoria
- [ ] Hover effect (zoom imagem)
- [ ] Click handler (modal/detail view)
- [ ] Props: `{ item, onSelect, isSelected }`

**ItemDetail.tsx (NOVO)**
- [ ] Modal/fullscreen view
- [ ] Imagem grande + metadados
- [ ] Descrição completa
- [ ] Related items grid
- [ ] Download/share buttons
- [ ] Props: `{ item, onClose, onRelated }`

**Navbar.tsx (NOVO)**
- [ ] Logo + titulo
- [ ] Links (Biblioteca, Mapa, Museu)
- [ ] User menu (perfil, logout)
- [ ] Mobile hamburger
- [ ] Props: `{ user, onLogout }`

**Pagination.tsx (NOVO)**
- [ ] Previous/Next buttons
- [ ] Page numbers (1 2 3 ... 10)
- [ ] Jump to page input
- [ ] Items per page selector
- [ ] Props: `{ currentPage, totalPages, onPageChange, itemsPerPage }`

**LoadingSpinner.tsx (NOVO)**
- [ ] Animação spinner circular
- [ ] Opcional: texto "Carregando..."
- [ ] Overlay (blur background)
- [ ] Props: `{ isVisible, message }`

**EmptyState.tsx (NOVO)**
- [ ] Ícone ilustrativo
- [ ] Mensagem customizável
- [ ] Action button (opcional)
- [ ] Props: `{ icon, message, actionLabel, onAction }`

**Modal.tsx (NOVO)**
- [ ] Overlay clickable para fechar
- [ ] Header com close button
- [ ] Conteúdo customizável (children)
- [ ] Footer (opcional buttons)
- [ ] Animação fade-in
- [ ] Props: `{ isOpen, onClose, title, children, footer }`

**TagCloud.tsx (NOVO)**
- [ ] Tags renderizadas com cores
- [ ] Click para filtrar
- [ ] Ordenação por frequência
- [ ] Max tags display com "more" button
- [ ] Props: `{ tags, onTagClick, maxDisplay }`

#### Critérios de Aceitação

- [ ] 10+ componentes criados em `frontend/src/components/library/`
- [ ] Cada componente tem arquivo `.tsx` + `.test.tsx`
- [ ] Props tipadas com interfaces/types
- [ ] CSS com Tailwind (sem CSS-in-JS)
- [ ] Sem console errors ao renderizar
- [ ] Componentes exportados em `index.ts` central
- [ ] Storybook stories (opcional, mas recomendado)

#### Output Esperado

```
frontend/src/components/
├── library/
│   ├── index.ts (export * from './...')
│   ├── SearchBar.tsx
│   ├── FilterPanel.tsx
│   ├── ItemCard.tsx
│   ├── ItemDetail.tsx
│   ├── Navbar.tsx
│   ├── Pagination.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   ├── Modal.tsx
│   └── TagCloud.tsx
└── __tests__/
    ├── SearchBar.test.tsx
    ├── FilterPanel.test.tsx
    ├── ItemCard.test.tsx
    ├── Pagination.test.tsx
    ├── Modal.test.tsx
    └── ...
```

---

### **Tarefa 2.2: Implementar Biblioteca Digital Interface Completa**

**ID:** 2.2  
**Responsável:** Frontend Dev  
**Duração Estimada:** 6 horas  
**Status:** PENDENTE  
**Bloqueante:** SIM

#### Objetivo
Criar página principal `/biblioteca` com busca, filtro, view modes e grid responsivo integrado aos componentes.

#### Estrutura de Arquivo

```typescript
frontend/src/pages/BibliotecaDigital.tsx
```

#### Funcionalidades Esperadas

1. **Search Bar Integrado**
   - [ ] Campo busca no topo
   - [ ] Debounce real-time
   - [ ] Sugestões dropdown
   - [ ] Clear button

2. **Filter Panel**
   - [ ] Sidebar esquerda (desktop) / collapse (mobile)
   - [ ] Categorias (documento, foto, audiovisual, mapa, objeto)
   - [ ] Data range (de/até)
   - [ ] Sort (relevância, data, A-Z)
   - [ ] "Clear all filters" botão

3. **View Modes**
   - [ ] Grid (3 colunas desktop, 2 tablet, 1 mobile)
   - [ ] List (tabela com coluna removível)
   - [ ] Map (pins de localidades no Leaflet)
   - [ ] Toggle buttons no topo (Grid/List/Map icons)

4. **Item Display**
   - [ ] ItemCard em grid mode
   - [ ] Hover effects
   - [ ] Click abre ItemDetail modal
   - [ ] Seleção múltipla (checkbox)

5. **Paginação**
   - [ ] 12 itens por página (customizável)
   - [ ] Pagination component
   - [ ] "Showing X-Y of Z" texto

6. **Loading States**
   - [ ] LoadingSpinner enquanto carrega
   - [ ] Skeleton cards (opcional)
   - [ ] EmptyState quando sem resultados

7. **Responsividade**
   - [ ] Desktop: sidebar esquerda + grid 3 cols
   - [ ] Tablet: narrower grid, sidebar collapses
   - [ ] Mobile: full width, single column

#### Componentes Usados

```typescript
import { SearchBar, FilterPanel, ItemCard, ItemDetail, Pagination, Modal, LoadingSpinner, EmptyState } from '@/components/library'
```

#### Estado e Lógica

```typescript
// State esperado
const [searchQuery, setSearchQuery] = useState('')
const [filters, setFilters] = useState({
  categories: [],
  dateRange: [null, null],
  sort: 'relevancia'
})
const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
const [currentPage, setCurrentPage] = useState(1)
const [selectedItem, setSelectedItem] = useState<Item | null>(null)
const [isDetailOpen, setIsDetailOpen] = useState(false)

// Data loading (futura integração Supabase)
const [items, setItems] = useState<Item[]>([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

#### Critérios de Aceitação

- [ ] Página acessível em `/biblioteca` (rota em `App.tsx`)
- [ ] SearchBar funciona (filtra em real-time)
- [ ] FilterPanel funciona (categorias, datas)
- [ ] 3 view modes (grid/list/map) alternam sem erros
- [ ] Paginação funciona (12 itens/página)
- [ ] ItemDetail modal abre ao clicar card
- [ ] Responsivo em mobile (testa com DevTools)
- [ ] Sem console errors
- [ ] Estados de loading/empty visíveis

#### Output Esperado

```
frontend/src/pages/BibliotecaDigital.tsx (200+ linhas)
frontend/src/pages/styles/biblioteca.module.css (ou Tailwind puro)
```

---

### **Tarefa 2.3: Integração Inicial com Supabase (CRUD)**

**ID:** 2.3  
**Responsável:** Frontend Dev + Backend Dev  
**Duração Estimada:** 4 horas  
**Status:** PENDENTE  
**Bloqueante:** NÃO

#### Objetivo
Conectar Biblioteca Digital a dados reais do Supabase com CRUD operacional (Create, Read, Update, Delete).

#### Fase 1: Setup Client + Queries

1. **Refatorar `supabaseClient.ts`**
   ```typescript
   // frontend/src/services/supabaseClient.ts
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     process.env.REACT_APP_SUPABASE_URL!,
     process.env.REACT_APP_SUPABASE_ANON_KEY!
   )
   
   // READ: Get all catalogos
   export const getCatalogos = async () => {
     const { data, error } = await supabase
       .from('catalogos')
       .select('*')
     return { data, error }
   }
   
   // SEARCH: Full-text search
   export const searchCatalogos = async (query: string) => {
     const { data, error } = await supabase
       .rpc('search_catalogos', { query })
     return { data, error }
   }
   
   // READ: Get by ID
   export const getCatalogoById = async (id: string) => {
     const { data, error } = await supabase
       .from('catalogos')
       .select('*')
       .eq('id', id)
       .single()
     return { data, error }
   }
   
   // CREATE: Insert novo
   export const createCatalogo = async (item: any) => {
     const { data, error } = await supabase
       .from('catalogos')
       .insert([item])
     return { data, error }
   }
   
   // UPDATE: Modify existing
   export const updateCatalogo = async (id: string, updates: any) => {
     const { data, error } = await supabase
       .from('catalogos')
       .update(updates)
       .eq('id', id)
     return { data, error }
   }
   
   // DELETE: Remove item
   export const deleteCatalogo = async (id: string) => {
     const { data, error } = await supabase
       .from('catalogos')
       .delete()
       .eq('id', id)
     return { data, error }
   }
   ```

2. **React Query Hooks**
   ```typescript
   // frontend/src/hooks/useApi.ts
   import { useQuery, useMutation } from '@tanstack/react-query'
   import * as supabaseApi from '@/services/supabaseClient'
   
   export const useCatalogos = () => {
     return useQuery({
       queryKey: ['catalogos'],
       queryFn: supabaseApi.getCatalogos
     })
   }
   
   export const useSearchCatalogos = (query: string) => {
     return useQuery({
       queryKey: ['catalogos', 'search', query],
       queryFn: () => supabaseApi.searchCatalogos(query),
       enabled: query.length > 0
     })
   }
   
   export const useCreateCatalogo = () => {
     return useMutation({
       mutationFn: supabaseApi.createCatalogo
     })
   }
   
   export const useUpdateCatalogo = () => {
     return useMutation({
       mutationFn: ({ id, updates }: any) => 
         supabaseApi.updateCatalogo(id, updates)
     })
   }
   
   export const useDeleteCatalogo = () => {
     return useMutation({
       mutationFn: supabaseApi.deleteCatalogo
     })
   }
   ```

3. **Integrar em BibliotecaDigital.tsx**
   ```typescript
   import { useCatalogos, useSearchCatalogos } from '@/hooks/useApi'
   
   export const BibliotecaDigital = () => {
     const [searchQuery, setSearchQuery] = useState('')
     
     // Use hook correto baseado em search
     const { data: allItems } = useCatalogos()
     const { data: searchItems } = useSearchCatalogos(searchQuery)
     
     const items = searchQuery ? searchItems : allItems
     
     return (
       // Usar items real do Supabase
     )
   }
   ```

#### Fase 2: RLS Policies Validação

- [ ] `.env.local` tem credenciais Supabase corretas
- [ ] Supabase local rodando (Docker)
- [ ] Migrations aplicadas (RLS policies)
- [ ] Query SELECT funciona sem erro 401/403
- [ ] INSERT requer auth (testa sem login)

#### Fase 3: Mock Data para Teste

Se schema Supabase não estiver 100% pronto:
- [ ] Criar `frontend/src/mocks/catalogos.json` com 10+ itens
- [ ] Usar em dev mode até Supabase real estar pronto
- [ ] Importar e retornar em lugar de query

#### Critérios de Aceitação

- [ ] `supabaseClient.ts` tem 6+ funções CRUD
- [ ] `useApi.ts` tem React Query hooks
- [ ] BibliotecaDigital consome dados via hooks
- [ ] Search funciona (query real ou mock)
- [ ] Loading state visível enquanto carrega
- [ ] Error handling (exibe mensagem ao falhar)
- [ ] Sem console errors

#### Output Esperado

```
frontend/src/services/supabaseClient.ts (80+ linhas)
frontend/src/hooks/useApi.ts (100+ linhas)
frontend/src/mocks/catalogos.json (opcional)
frontend/src/pages/BibliotecaDigital.tsx (integrado com hooks)
```

---

### **Semana 2 - Validação Final**

#### Checklist Entregáveis

- [ ] 10+ componentes em `frontend/src/components/library/`
- [ ] Cada componente testado (sem erros ao renderizar)
- [ ] BibliotecaDigital página funcional em `/biblioteca`
- [ ] 3 view modes (grid/list/map) alternam sem erros
- [ ] Search + filtro + paginação funcionam
- [ ] Supabase client com 6+ funções CRUD
- [ ] React Query hooks em `useApi.ts`
- [ ] Mock data preparado (se necessário)
- [ ] Build npm run build sem erros
- [ ] Nenhum console error

#### Report Esperado

**Arquivo:** `reports/FASE_2_SEMANA_2_CONSOLIDACAO.json`

```json
{
  "semana": 2,
  "status_geral": "COMPLETO",
  "tarefas": [
    { "id": "2.1", "titulo": "Component Library", "status": "COMPLETO", "componentes": 10 },
    { "id": "2.2", "titulo": "BibliotecaDigital", "status": "COMPLETO", "view_modes": 3 },
    { "id": "2.3", "titulo": "Supabase CRUD", "status": "COMPLETO", "functions": 6 }
  ],
  "metricas": {
    "total_componentes": 10,
    "linhas_codigo": "1500+",
    "testes_criados": "15+",
    "build_time_segundos": 5.2,
    "bundle_size_kb": 250
  },
  "validacao_externa": "PENDENTE"
}
```

---

## 🎯 SEMANA 3: 3D Museum + GIS Map (2026-02-21 ~ 2026-02-27)

### **Tarefa 3.1: Blender → Three.js Export Pipeline**

**ID:** 3.1  
**Responsável:** 3D Artist / Técnico  
**Duração Estimada:** 6 horas  
**Status:** PENDENTE  
**Bloqueante:** SIM

#### Objetivo
Exportar modelo 3D da Sede (Villa Canabrava) de Blender como `.glb` otimizado (<50MB) pronto para Three.js.

#### Pré-requisitos
- [ ] Blender 4.0+ instalado
- [ ] Modelo 3D da Sede em Blender (ou criar básico)
- [ ] Assets/texturas prontas

#### Procedimento Blender

1. **Preparação do Modelo**
   - [ ] Importar/abrir modelo em Blender
   - [ ] Validar geometria (sem vértices soltos, normals corretos)
   - [ ] Remover meshes desnecessárias
   - [ ] Combinar meshes similares (Ctrl+J)
   - [ ] Triangular (Ctrl+T) se necessário

2. **Otimização**
   - [ ] Decimate modifier (reduzir polígons 30-50%)
   - [ ] Remover texturas > 2K (resizing em Blender)
   - [ ] Bake texturas em atlas single texture
   - [ ] Simplificar materiais (remover Emission, Subsurface)
   - [ ] Target: <50MB arquivo final

3. **Iluminação**
   - [ ] Remover lights desnecessárias
   - [ ] 1x Ambient light + 1x Sun light suficiente
   - [ ] Exportação carregará lights do glb

4. **Export Settings**
   ```
   File → Export → glTF Binary (.glb)
   
   Configurações:
   ✓ Include Animations: FALSE (não temos animações)
   ✓ Include All Bone Influences: FALSE
   ✓ Include Deformed Bones: FALSE
   ✓ Optimize for glTF: TRUE
   ✓ Bake Skin: FALSE
   ✓ Format: glTF Binary (.glb)
   ✓ Compression: ON (DRACO)
   
   Salvar como: models/3d/sede-vila-terezinha.glb
   ```

5. **Validação**
   - [ ] Abrir em [Three.js Editor](https://threejs.org/editor/)
   - [ ] Modelo renderiza corretamente
   - [ ] Texturas visíveis (não branco)
   - [ ] Iluminação aceitável
   - [ ] Arquivo < 50MB

#### Critérios de Aceitação

- [ ] `models/3d/sede-vila-terezinha.glb` criado
- [ ] Tamanho < 50MB
- [ ] Renderiza sem erro em Three.js Editor
- [ ] Geometria e texturas intactas
- [ ] Pronto para importação em Next task

#### Output Esperado

```
models/
├── 3d/
│   └── sede-vila-terezinha.glb (< 50MB)
└── README.md (instruções export)
```

---

### **Tarefa 3.2: Integrar Three.js Museum Viewer**

**ID:** 3.2  
**Responsável:** Frontend Dev (WebGL/3D)  
**Duração Estimada:** 5 horas  
**Status:** PENDENTE  
**Bloqueante:** SIM

#### Objetivo
Criar componente React que renderiza modelo 3D com controles de câmera (orbit, zoom, pan).

#### Setup Three.js

1. **Instalar Dependências**
   ```bash
   cd frontend
   npm install three @react-three/fiber @react-three/drei
   ```

2. **Criar MuseumViewer.tsx**
   ```typescript
   // frontend/src/components/museum/MuseumViewer.tsx
   import { Canvas } from '@react-three/fiber'
   import { OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei'
   import React, { Suspense } from 'react'
   
   const Model = ({ url }: { url: string }) => {
     const gltf = useGLTF(url)
     return <primitive object={gltf.scene} />
   }
   
   export const MuseumViewer = ({ modelUrl = '/models/3d/sede-vila-terezinha.glb' }) => {
     return (
       <Canvas className="w-full h-full bg-gray-200">
         <PerspectiveCamera makeDefault position={[0, 5, 10]} />
         <ambientLight intensity={0.5} />
         <directionalLight position={[10, 10, 5]} intensity={1} />
         <Suspense fallback={<LoadingFallback />}>
           <Model url={modelUrl} />
         </Suspense>
         <OrbitControls
           autoRotate
           autoRotateSpeed={2}
           enableZoom={true}
           enablePan={true}
           damping={0.05}
         />
       </Canvas>
     )
   }
   ```

3. **Integração em Página**
   ```typescript
   // frontend/src/pages/Museum3D.tsx
   import { MuseumViewer } from '@/components/museum/MuseumViewer'
   
   export const Museum3D = () => {
     return (
       <div className="w-full h-screen">
         <h1 className="absolute top-4 left-4 z-10 text-2xl font-bold">
           Museu Virtual - Villa Canabrava
         </h1>
         <MuseumViewer />
       </div>
     )
   }
   ```

4. **Rota em App.tsx**
   ```typescript
   import { Museum3D } from '@/pages/Museum3D'
   
   <Route path="/museum" element={<Museum3D />} />
   ```

#### Funcionalidades

- [ ] Modelo carrega e renderiza
- [ ] OrbitControls funciona (drag, zoom, rotate)
- [ ] Auto-rotate suave (2 deg/s)
- [ ] Iluminação adequada (não muito escuro)
- [ ] Loading spinner enquanto carrega (.glb)
- [ ] Sem erros WebGL console

#### Critérios de Aceitação

- [ ] Componente `MuseumViewer.tsx` criado
- [ ] Página `/museum` acessível
- [ ] Modelo renderiza em < 5 segundos
- [ ] OrbitControls responsivos
- [ ] Sem WebGL errors
- [ ] FPS > 30 em desktop

#### Output Esperado

```
frontend/src/components/museum/
├── MuseumViewer.tsx
└── __tests__/MuseumViewer.test.tsx

frontend/src/pages/Museum3D.tsx
```

---

### **Tarefa 3.3: Integrar Leaflet GIS Map (252 Camadas)**

**ID:** 3.3  
**Responsável:** Frontend Dev (GIS/Mapping)  
**Duração Estimada:** 7 horas  
**Status:** PENDENTE  
**Bloqueante:** SIM

#### Objetivo
Criar mapa interativo com 252 camadas GeoJSON (de Fase 1) com toggle, zoom, pan e click info.

#### Setup Leaflet

1. **Instalar Dependências**
   ```bash
   npm install leaflet react-leaflet geojson-utils
   npm install -D @types/leaflet
   ```

2. **Criar InteractiveGISMap.tsx**
   ```typescript
   // frontend/src/components/map/InteractiveGISMap.tsx
   import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet'
   import { useState, useEffect } from 'react'
   
   const InteractiveGISMap = ({ layers = [] }) => {
     const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set())
     const [selectedFeature, setSelectedFeature] = useState(null)
     
     const toggleLayer = (layerId: string) => {
       setVisibleLayers(prev => {
         const next = new Set(prev)
         if (next.has(layerId)) next.delete(layerId)
         else next.add(layerId)
         return next
       })
     }
     
     return (
       <div className="flex h-screen">
         {/* Sidebar: Layer list */}
         <div className="w-64 bg-white shadow overflow-y-auto">
           <h2 className="p-4 font-bold">Camadas (252)</h2>
           {layers.map(layer => (
             <label key={layer.id} className="flex items-center p-2 hover:bg-gray-100">
               <input
                 type="checkbox"
                 checked={visibleLayers.has(layer.id)}
                 onChange={() => toggleLayer(layer.id)}
               />
               <span className="ml-2 text-sm">{layer.nome}</span>
             </label>
           ))}
         </div>
         
         {/* Map */}
         <MapContainer
           center={[-20.3, -45.5]}
           zoom={12}
           className="flex-1"
         >
           <TileLayer
             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             attribution='© OpenStreetMap'
           />
           
           {layers
             .filter(l => visibleLayers.has(l.id))
             .map(layer => (
               <GeoJSON
                 key={layer.id}
                 data={layer.geojson}
                 onEachFeature={(feature, featureLayer) => {
                   featureLayer.bindPopup(
                     `<b>${feature.properties.nome}</b><br/>${feature.properties.descricao}`
                   )
                 }}
               />
             ))}
         </MapContainer>
       </div>
     )
   }
   
   export default InteractiveGISMap
   ```

3. **Carregar 252 Camadas (Mock)**
   ```typescript
   // frontend/src/data/gisLayers.ts
   // Importar KML de Fase 1 ou criar loader
   
   export const loadGISLayers = async () => {
     // Opção 1: Carregar de API Supabase
     const { data } = await supabase
       .from('gis_layers')
       .select('*')
     
     // Opção 2: Carregar arquivos KML localmente
     // Usar lib kml2geojson para converter
     
     return data
   }
   ```

4. **Integração em Rota**
   ```typescript
   // frontend/src/pages/InteractiveMap.tsx
   import InteractiveGISMap from '@/components/map/InteractiveGISMap'
   
   export const InteractiveMap = () => {
     const [layers, setLayers] = useState([])
     
     useEffect(() => {
       const loadLayers = async () => {
         const data = await loadGISLayers()
         setLayers(data)
       }
       loadLayers()
     }, [])
     
     return <InteractiveGISMap layers={layers} />
   }
   ```

#### Funcionalidades

- [ ] Mapa renderiza com tiles OSM
- [ ] 252 camadas carregáveis (spinner loader)
- [ ] Sidebar com checkbox para cada camada
- [ ] Toggle layers on/off
- [ ] Zoom/pan funciona
- [ ] Click feature mostra popup info
- [ ] Performance aceitável (sem lag, 60 FPS)
- [ ] Responsivo em mobile (sidebar collapses)

#### Critérios de Aceitação

- [ ] `InteractiveGISMap.tsx` criado
- [ ] Página `/map` acessível
- [ ] 252 camadas carregam (mesmo que em pequeno número para teste)
- [ ] Checkboxes funcionam
- [ ] Sem lag ao alternar camadas
- [ ] FPS > 30
- [ ] Click feature mostra info

#### Output Esperado

```
frontend/src/components/map/
├── InteractiveGISMap.tsx
└── __tests__/InteractiveGISMap.test.tsx

frontend/src/pages/InteractiveMap.tsx
frontend/src/data/gisLayers.ts (ou gisLayers.json)
```

---

### **Tarefa 3.4: Integração 3D + Biblioteca + GIS Map (Experiência Única)**

**ID:** 3.4 (NEW)  
**Responsável:** Frontend Dev  
**Duração Estimada:** 4 horas  
**Status:** PENDENTE  
**Bloqueante:** NÃO

#### Objetivo
Integrar todos 3 componentes (Biblioteca Digital, Museu 3D, GIS Map) em experiência coesa com navegação e dados interconectados.

#### Dashboard Principal

```typescript
// frontend/src/pages/Dashboard.tsx
import { useState } from 'react'
import { Navbar } from '@/components/library/Navbar'
import { BibliotecaDigital } from '@/pages/BibliotecaDigital'
import { Museum3D } from '@/pages/Museum3D'
import { InteractiveMap } from '@/pages/InteractiveMap'

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'biblioteca' | 'museum' | 'map'>('biblioteca')
  
  return (
    <>
      <Navbar />
      <div className="flex gap-4 p-4">
        <button onClick={() => setActiveTab('biblioteca')}>📚 Biblioteca</button>
        <button onClick={() => setActiveTab('museum')}>🏛️ Museu 3D</button>
        <button onClick={() => setActiveTab('map')}>🗺️ Mapa GIS</button>
      </div>
      
      {activeTab === 'biblioteca' && <BibliotecaDigital />}
      {activeTab === 'museum' && <Museum3D />}
      {activeTab === 'map' && <InteractiveMap />}
    </>
  )
}
```

#### Links Cruzados

- Clicar item no Biblioteca → mostrar localidade no Mapa
- Clicar localidade no Mapa → filtrar Biblioteca por localidade
- Museu 3D exibe todos catalogos de "Sede"

#### Critérios de Aceitação

- [ ] Dashboard com 3 abas funciona
- [ ] Navegação entre abas suave
- [ ] Dados sincronizam entre componentes
- [ ] Sem console errors

---

### **Semana 3 - Validação Final**

#### Checklist Entregáveis

- [ ] Modelo 3D `.glb` otimizado (< 50MB)
- [ ] MuseumViewer renderiza e controles funcionam
- [ ] GIS Map com 252 camadas (ou subset para teste)
- [ ] Checkboxes de layers alternam corretamente
- [ ] Dashboard integra 3 componentes
- [ ] Navegação entre abas fluida
- [ ] Sincronização dados (clique em um afeta outro)
- [ ] Sem console errors
- [ ] FPS > 30 em 3D e map

#### Report Esperado

**Arquivo:** `reports/FASE_2_SEMANA_3_CONSOLIDACAO.json`

```json
{
  "semana": 3,
  "status_geral": "COMPLETO",
  "tarefas": [
    { "id": "3.1", "titulo": "3D Model Export", "status": "COMPLETO", "tamanho_mb": 45 },
    { "id": "3.2", "titulo": "MuseumViewer 3D", "status": "COMPLETO", "fps": 45 },
    { "id": "3.3", "titulo": "GIS Map 252 layers", "status": "COMPLETO", "camadas": 252 },
    { "id": "3.4", "titulo": "Integração Dashboard", "status": "COMPLETO", "abas": 3 }
  ],
  "validacao_externa": "PENDENTE"
}
```

---

## 🎯 SEMANA 4: API Integration + Testing + GO/NO-GO (2026-02-28 ~ 2026-03-06)

### **Tarefa 4.1: API Endpoints Supabase (8+ RPC Functions)**

**ID:** 4.1  
**Responsável:** Frontend Dev + Backend Dev  
**Duração Estimada:** 6 horas  
**Status:** PENDENTE  
**Bloqueante:** SIM

#### Objetivo
Criar 8+ RPC functions no Supabase para operações core e integrar em frontend via React Query.

#### RPC Functions Necessárias

1. **search_catalogos(query TEXT, limit INT DEFAULT 50)**
   - Full-text search em titulo + descricao + tags
   - Retorna: JSON array com rank

2. **get_localidade_catalogos(localidade_id UUID)**
   - Todos catalogos de uma localidade
   - Retorna: JSON array

3. **get_user_collections(user_id UUID)**
   - Coleções do usuário
   - Retorna: JSON array com items

4. **add_to_collection(user_id UUID, collection_id UUID, catalog_id UUID)**
   - Adicionar item a coleção
   - Retorna: success/error

5. **get_localidades_stats()**
   - Estatísticas de cada localidade (count catalogos, etc)
   - Retorna: JSON array com stats

6. **get_models_3d()**
   - Lista todos modelos 3D
   - Retorna: JSON array

7. **get_gis_layers(limit INT DEFAULT 50)**
   - Todas GIS layers (paginated)
   - Retorna: JSON array

8. **get_catalogos_by_category(categoria TEXT)**
   - Filtrar por categoria
   - Retorna: JSON array

#### Implementação Supabase

Criar migrations SQL:

```sql
-- supabase/migrations/1770xxx_create_rpc_functions.sql

CREATE OR REPLACE FUNCTION search_catalogos(query TEXT, limit INT DEFAULT 50)
RETURNS TABLE (id UUID, titulo TEXT, descricao TEXT, rank FLOAT)
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT 
    c.id,
    c.titulo,
    c.descricao,
    ts_rank(to_tsvector(c.titulo || ' ' || COALESCE(c.descricao, '')), 
            plainto_tsquery(query))::FLOAT as rank
  FROM catalogos c
  WHERE to_tsvector(c.titulo || ' ' || COALESCE(c.descricao, '')) 
        @@ plainto_tsquery(query)
  ORDER BY rank DESC
  LIMIT limit;
$$;

CREATE OR REPLACE FUNCTION get_localidade_catalogos(localidade_id UUID)
RETURNS TABLE (id UUID, titulo TEXT, categoria TEXT)
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT c.id, c.titulo, c.categoria
  FROM catalogos c
  WHERE c.localidade_id = localidade_id
  ORDER BY c.created_at DESC;
$$;

-- ... outras functions
```

#### Integração Frontend

Atualizar `useApi.ts`:

```typescript
export const useSearchCatalogos = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_catalogos', { query })
      if (error) throw error
      return data
    },
    enabled: query.length > 2
  })
}

// ... outras queries
```

#### Critérios de Aceitação

- [ ] 8+ RPC functions criadas em Supabase
- [ ] Cada function testada (retorna dados corretos)
- [ ] Frontend hooks para cada function
- [ ] React Query queryKey consistentes
- [ ] Error handling em cada hook
- [ ] Sem console errors

---

### **Tarefa 4.2: Testing Suite Completa (30+ Testes)**

**ID:** 4.2  
**Responsável:** QA / Frontend Dev  
**Duração Estimada:** 8 horas  
**Status:** PENDENTE  
**Bloqueante:** NÃO

#### Objetivo
Criar suite de testes unitários com Vitest + React Testing Library cobrindo 70%+ código crítico.

#### Configuração Vitest

1. **vitest.config.ts** (já deve estar setup)
   ```typescript
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'
   
   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: ['./src/test/setup.ts'],
       coverage: {
         reporter: ['text', 'json', 'html']
       }
     }
   })
   ```

2. **Setup File** (criar `src/test/setup.ts`)
   ```typescript
   import '@testing-library/jest-dom'
   import { expect, afterEach } from 'vitest'
   import { cleanup } from '@testing-library/react'
   
   afterEach(() => cleanup())
   ```

#### Testes a Criar (30+)

**Componentes (15+ testes)**
```
SearchBar.test.tsx (3)
  ✓ Renderiza input
  ✓ onChange called on input
  ✓ Clear button removes text

FilterPanel.test.tsx (4)
  ✓ Renderiza checkboxes
  ✓ onChange called on check
  ✓ Clear filters button resets
  ✓ Date range picker works

ItemCard.test.tsx (3)
  ✓ Renderiza item data
  ✓ onClick called
  ✓ Image fallback shows

ItemDetail.test.tsx (2)
  ✓ Renderiza detalhe completo
  ✓ Close button calls onClose

Pagination.test.tsx (3)
  ✓ Renderiza página números
  ✓ Previous/Next buttons
  ✓ Jump to page works
```

**Pages (6+ testes)**
```
BibliotecaDigital.test.tsx (6)
  ✓ Renderiza página
  ✓ Search funciona
  ✓ Filtro funciona
  ✓ View modes alternam
  ✓ Paginação funciona
  ✓ Click item abre detail
```

**Services/Hooks (9+ testes)**
```
supabaseClient.test.ts (3)
  ✓ getCatalogos executa
  ✓ searchCatalogos executa
  ✓ Error handling

useApi.test.ts (6)
  ✓ useCatalogos retorna data
  ✓ useSearchCatalogos habilitado corretamente
  ✓ useCreateCatalogo mutation funciona
  ✓ useUpdateCatalogo mutation funciona
  ✓ useDeleteCatalogo mutation funciona
  ✓ Error handling em hooks
```

#### Exemplo Teste

```typescript
// frontend/src/components/library/__tests__/SearchBar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  it('renderiza input search', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChange={() => {}} onClear={() => {}} />
    )
    expect(getByPlaceholderText(/buscar/i)).toBeInTheDocument()
  })

  it('chama onChange ao digitar', async () => {
    const onChange = vi.fn()
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChange={onChange} onClear={() => {}} />
    )
    
    const input = getByPlaceholderText(/buscar/i)
    await userEvent.type(input, 'teste')
    
    expect(onChange).toHaveBeenCalled()
  })

  it('chama onClear ao clicar botão clear', async () => {
    const onClear = vi.fn()
    const { getByRole } = render(
      <SearchBar value="teste" onChange={() => {}} onClear={onClear} />
    )
    
    const clearBtn = getByRole('button', { name: /limpar/i })
    await userEvent.click(clearBtn)
    
    expect(onClear).toHaveBeenCalled()
  })
})
```

#### Commands

```bash
# Rodar testes
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

#### Critérios de Aceitação

- [ ] 30+ testes criados e passando
- [ ] `npm run test` retorna "All tests passed"
- [ ] Coverage > 70% (viewable em `coverage/index.html`)
- [ ] Sem console errors durante testes
- [ ] Testes rápidos (< 5 segundos total)

---

### **Tarefa 4.3: GO/NO-GO Consolidação Final**

**ID:** 4.3  
**Responsável:** Tech Lead (Roo)  
**Duração Estimada:** 3 horas  
**Status:** PENDENTE  
**Bloqueante:** SIM

#### Objetivo
Validar todos 6 critérios de aprovação, gerar relatório consolidado e decisão GO/NO-GO para Fase 3.

#### Checklist Validação (6 Critérios)

```
Criterion 1: React app rodando localhost:5173
  - [ ] npm run dev inicia sem erros
  - [ ] App acessível em http://localhost:5173
  - [ ] HMR funciona (salvar arquivo recarrega)
  - [ ] Sem erros TypeScript (npm run build passa)
  ✓ EVIDÊNCIA: Screenshot ou console output

Criterion 2: Supabase schema com RLS policies
  - [ ] 6+ tabelas documentadas
  - [ ] Cada tabela tem RLS policy
  - [ ] Índices de performance implementados
  - [ ] Storage buckets configurados
  ✓ EVIDÊNCIA: Arquivo docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md

Criterion 3: Biblioteca Digital com search/filter
  - [ ] SearchBar funciona (real-time)
  - [ ] FilterPanel funciona (categorias, datas)
  - [ ] Grid exibe items
  - [ ] View modes alternam (grid/list/map)
  ✓ EVIDÊNCIA: Screenshot OU vídeo demo

Criterion 4: 3D model rendering + GIS data
  - [ ] MuseumViewer renderiza modelo 3D
  - [ ] OrbitControls funciona
  - [ ] InteractiveGISMap renderiza
  - [ ] 252 camadas carregáveis
  - [ ] Nenhum WebGL error
  ✓ EVIDÊNCIA: Console log "3D Model loaded" + "GIS Map initialized"

Criterion 5: 5+ React components tested
  - [ ] 10+ componentes criados
  - [ ] 30+ testes criados e passando
  - [ ] Coverage > 70%
  - [ ] npm run test:ui shows all green
  ✓ EVIDÊNCIA: Test coverage report

Criterion 6: API endpoints integrados
  - [ ] 8+ RPC functions funcionando
  - [ ] React Query hooks para cada function
  - [ ] Search funciona com real data
  - [ ] Sem 401/403 errors (RLS policies OK)
  ✓ EVIDÊNCIA: API query logs ou Supabase studio
```

#### Geração Report

Criar arquivo `reports/FASE_2_CONSOLIDACAO.json`:

```json
{
  "projeto": "Mundo Virtual Villa Canabrava",
  "fase": "FASE 2 - MVP Development",
  "periodo": "2026-02-06 ~ 2026-03-13",
  "status_geral": "COMPLETO",
  "conclusao_go_nogo": "GO_FASE_3",
  "criterios_aprovacao": [
    {
      "id": 1,
      "requisito": "React app localhost:5173",
      "status": "PASS",
      "evidencia": "npm run dev inicializa sem erros"
    },
    {
      "id": 2,
      "requisito": "Supabase schema RLS",
      "status": "PASS",
      "evidencia": "docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md"
    },
    {
      "id": 3,
      "requisito": "Biblioteca Digital search/filter",
      "status": "PASS",
      "evidencia": "Page /biblioteca funcional"
    },
    {
      "id": 4,
      "requisito": "3D Museum + GIS Map",
      "status": "PASS",
      "evidencia": "Pages /museum + /map funcionais"
    },
    {
      "id": 5,
      "requisito": "Components tested (30+)",
      "status": "PASS",
      "evidencia": "npm run test: 30/30 passed, coverage 71%"
    },
    {
      "id": 6,
      "requisito": "API endpoints (8+)",
      "status": "PASS",
      "evidencia": "8 RPC functions integralizadas"
    }
  ],
  "metricas_finais": {
    "total_componentes": 10,
    "total_testes": 30,
    "test_coverage_percent": 71,
    "api_endpoints": 8,
    "gis_layers_supported": 252,
    "linhas_codigo_frontend": 3500,
    "bundle_size_kb": 280,
    "build_time_seconds": 4.8
  },
  "recomendacao": "GO_SEMANA_4 / INICIAR_FASE_3_CONFORME_PLANEJADO",
  "proximos_passos": [
    "Fase 3: Mobile app (React Native)",
    "Fase 4: Backend API (Node.js/Express)",
    "Fase 5: Deploy (Vercel + Railway)"
  ]
}
```

#### Critérios de Aceitação

- [ ] Todos 6 critérios com status "PASS"
- [ ] Relatório gerado em `reports/FASE_2_CONSOLIDACAO.json`
- [ ] Recomendação clara (GO/NO-GO)
- [ ] Métricas numéricas (testes, coverage, bundle)
- [ ] Riscos residuais documentados

---

## 📝 METODOLOGIA SEMANAL

### Estrutura Executável (Semanas 2-4)

```
Cada Semana:

[SEGUNDA-FEIRA]
├── 1. Ler este PROMPT_EXECUCAO
├── 2. Criar subtasks (neste arquivo)
├── 3. Iniciar Tarefa 1 (bloqueante)
└── Resultado: Tarefa 1 COMPLETA

[TERÇA-QUARTA]
├── Continuar Tarefa 2-3
├── Testes incrementais
└── Resultado: Tarefas 2-3 COMPLETAS

[QUINTA-SEXTA]
├── Consolidação
├── Report semanal
├── Validação externa (PROMPT_VALIDACAO)
└── Resultado: Relatório + Aprovação

[SÁBADO-DOMINGO]
├── Ajustes baseado em feedback
├── Documentação
└── Próxima semana pronta
```

### Validação Externa (Após cada Semana)

1. Ler `PROMPT_VALIDACAO_FASE_2.md`
2. Validar 6 critérios contra deliverables
3. Gerar relatório `FASE_2_SEMANA_X_CONSOLIDACAO.json`
4. Aprovar ou listar ajustes necessários

---

## 📋 CHECKLIST FINAL

### Antes de Iniciar Semana 2
- [ ] Ler este PROMPT completo
- [ ] Verificar status Semana 1 (APROVADO)
- [ ] Frontend está rodando (`npm run dev`)
- [ ] Supabase schema documentado
- [ ] Ambiente configurado

### Fim de Semana 4
- [ ] 6 Critérios de Aprovação com status "PASS"
- [ ] Report `FASE_2_CONSOLIDACAO.json` gerado
- [ ] Todos testes passando (30+)
- [ ] Build otimizado (< 300KB)
- [ ] Documentação completa
- [ ] GO/NO-GO decisão documentada

---

## 📞 CONTATO E ESCALAÇÃO

**Tech Lead:** Roo  
**DevOps/Backend:** Backend Dev  
**Frontend:** Frontend Dev  
**3D Artist:** 3D Artist / Técnico  
**QA:** QA Tester  

Bloqueantes: Notify Tech Lead imediatamente.

---

**Última Atualização:** 2026-02-06  
**Versão:** 1.0 (FASE 2 SEMANAS 2-4)  
**Status:** PRONTO PARA EXECUÇÃO
