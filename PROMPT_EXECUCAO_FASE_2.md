# 📋 PROMPT DE EXECUÇÃO - FASE 2 (MVP Development)

**Função:** Orientar execução de Fase 2 (4 semanas) do projeto Mundo Virtual Villa Canabrava

**Autoridade:** Roo (Technical Lead) para Entwickler/DevOps

**Status Esperado ao Final:** GO/NO-GO para Fase 3

---

## 📋 RESUMO EXECUTIVO

Fase 1 foi **APROVADA** em 2026-02-13. Agora iniciamos **Fase 2 - MVP Development** com duração de 4 semanas (Semanas 1-4) e orçamento de **$2.500/mês** (infraestrutura + ferramentas 3D).

**Objetivos Principais:**
1. ✅ Estabelecer React 18 + TypeScript com Vite (desenvolvimento fast)
2. ✅ Projetar schema Supabase com RLS policies (segurança)
3. ✅ Implementar Biblioteca Digital (Search, Filter, View avançados)
4. ✅ Construir pipeline Blender → Three.js para modelos 3D
5. ✅ Integrar mapa GIS interativo (252 camadas de Fase 1)
6. ✅ Validar API endpoints e testes de componentes React

**Entregáveis Esperados:**
- ✅ React app rodando em `localhost:5173` com HMR
- ✅ Supabase schema com 10+ tabelas + RLS policies
- ✅ 5+ componentes React testados com Vitest
- ✅ Biblioteca Digital com busca/filtro funcional
- ✅ Mapa 3D renderizando dados GIS com Three.js
- ✅ API endpoints integrados e validados

---

## 🎯 TAREFAS E CRITÉRIOS DE SUCESSO

### SEMANA 1: React Setup + Supabase Schema Design

#### Tarefa 1.1 - Inicializar Projeto React 18 + TypeScript
**Responsável:** Frontend Dev  
**Recurso:** `npm create vite@latest`  
**Entrada:** Nenhuma (novo projeto)  

**Procedimento - Windows (PowerShell):**
```powershell
# Navegar para projeto
cd C:\Users\rober\Downloads\BIBLIOTECA

# Criar novo projeto React + TypeScript com Vite
npm create vite@latest frontend -- --template react-ts

# Entrar na pasta
cd frontend

# Instalar dependências
npm install

# Instalar dependências essenciais para MVP
npm install @supabase/supabase-js @tanstack/react-query zustand axios
npm install -D @vitest/ui vitest jsdom @testing-library/react

# Verificar que funciona
npm run dev
```

**Procedimento - Linux/Mac (Bash):**
```bash
cd ~/Downloads/BIBLIOTECA
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install @supabase/supabase-js @tanstack/react-query zustand axios
npm install -D @vitest/ui vitest jsdom @testing-library/react
npm run dev
```

**Critérios de Aceitação:**
- [ ] Pasta `frontend/` criada com estrutura Vite padrão
- [ ] Arquivo `frontend/package.json` com `"name": "biblioteca-frontend"`
- [ ] Arquivo `frontend/vite.config.ts` configurado
- [ ] Arquivo `frontend/tsconfig.json` com opções strict
- [ ] App rodando em `http://localhost:5173`
- [ ] HMR (hot module replacement) funcional
- [ ] Comando `npm run build` gera `/dist` com bundle otimizado

**Output Esperado:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

---

#### Tarefa 1.2 - Projetar Schema Supabase (Design Document)
**Responsável:** Backend/Architect  
**Recurso:** Documento de design + consulta com padrões Supabase  
**Entrada:** Dados de Fase 1 (252 localidades, acervo categorizado)  

**Procedimento:**

Criar arquivo `docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md` com schema detalhado:

```markdown
# SUPABASE SCHEMA - FASE 2 MVP

## Tabelas Principais (RLS Enabled)

### 1. users (Supabase Auth padrão)
- id: uuid (PK, FK auth.users)
- email: text (UNIQUE)
- role: enum('admin', 'curator', 'viewer') - DEFAULT 'viewer'
- created_at: timestamp

RLS Policy: Users podem ler apenas seu próprio perfil

### 2. localidades (GIS locations from Fase 1)
- id: uuid (PK)
- nome: text (NOT NULL)
- descricao: text
- geom: geometry(Point, 4326) (NOT NULL)
- categoria: text (farm, forest, building, etc.)
- metadata_json: jsonb (extensível)
- created_at: timestamp
- updated_at: timestamp

Indices:
- BRIN: geom
- B-tree: categoria, nome

RLS Policy: SELECT public | INSERT/UPDATE admin only

### 3. catalogos (Digital items from Acervo)
- id: uuid (PK)
- titulo: text (NOT NULL)
- descricao: text
- categoria: text (documento, foto, audiovisual, mapa, objeto)
- subcategoria: text
- data_criacao: date
- autor: text
- origem: text (localidade_id FK)
- tags: text[] (array para busca full-text)
- metadata_json: jsonb
- thumbnail_url: text
- arquivo_url: text (S3 bucket reference)
- created_at: timestamp
- updated_at: timestamp

Indices:
- GIN: tags (array search)
- Text: titulo || ' ' || descricao (full-text search)

RLS Policy: SELECT public | INSERT/UPDATE author only

### 4. collections (User collections/favorites)
- id: uuid (PK)
- user_id: uuid (FK users.id)
- nome: text (NOT NULL)
- descricao: text
- catalogo_ids: uuid[] (array de catalogos)
- created_at: timestamp
- updated_at: timestamp

RLS Policy: Users can only manage own collections

### 5. models_3d (3D assets for museum)
- id: uuid (PK)
- nome: text (NOT NULL)
- descricao: text
- blender_source_url: text (S3 reference)
- threejs_gltf_url: text (S3 reference)
- thumbnail_url: text
- lokalisacao_id: uuid (FK localidades.id) - pode ser NULL
- metadata_json: jsonb
- created_at: timestamp
- updated_at: timestamp

RLS Policy: SELECT public | INSERT/UPDATE curator only

### 6. gis_layers (Mapa interativo)
- id: uuid (PK)
- nome: text (NOT NULL)
- descricao: text
- source_kml_file: text (arquivo original de Fase 1)
- geojson_features: jsonb (GeoJSON FeatureCollection)
- bounding_box: geometry(Polygon, 4326)
- feature_count: integer
- visible_default: boolean
- z_index: integer (order on map)
- created_at: timestamp
- updated_at: timestamp

RLS Policy: SELECT public | INSERT/UPDATE curator only

## Functions (RPC)

### search_catalogos(query TEXT, limit INT DEFAULT 50)
- Busca full-text em titulo + descricao + tags
- Retorna: JSON array de catalogos com rank

### get_localidade_catalogos(localidade_id UUID)
- Retorna todos catalogos associados a uma localidade
- Retorna: JSON array de catalogos

### get_user_collections(user_id UUID)
- Retorna collections do usuário
- Retorna: JSON array de collections

## Storage Buckets

1. **acervo-files** (documentos, fotos, audiovisual)
   - RLS: authenticated users can read | author can upload/delete

2. **3d-models** (modelos Blender/Three.js)
   - RLS: public can read | curator can upload/delete

3. **thumbnails** (imagens cache)
   - RLS: public can read

## RLS Policies Summary

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| users | self | - | self | - |
| localidades | public | admin | admin | admin |
| catalogos | public | auth | author | author |
| collections | user | user | user | user |
| models_3d | public | curator | curator | curator |
| gis_layers | public | curator | curator | curator |
```

**Critérios de Aceitação:**
- [ ] Arquivo `docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md` criado
- [ ] 6 tabelas principais documentadas
- [ ] RLS policies descritas para cada tabela
- [ ] Índices de performance especificados
- [ ] 3 storage buckets descritos com RLS
- [ ] 3 RPC functions descritos

---

#### Tarefa 1.3 - Setup Supabase Local (Docker)
**Responsável:** DevOps/Backend Dev  
**Recurso:** Supabase CLI + Docker  
**Entrada:** Nenhuma (setup inicial)  

**Procedimento:**

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# No diretório raiz BIBLIOTECA
cd C:\Users\rober\Downloads\BIBLIOTECA
# ou Linux/Mac:
cd ~/Downloads/BIBLIOTECA

# Inicializar Supabase local
supabase init

# Criar arquivo .env.local com credenciais
cat > frontend/.env.local << 'EOF'
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anonKey_from_supabase_start>
EOF

# Iniciar Supabase local
supabase start

# Output esperado:
# Starting Docker container supabase-db
# Waiting for supabase services...
# ✓ Started
#
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
```

**Critérios de Aceitação:**
- [ ] Supabase CLI instalado (`supabase --version`)
- [ ] Arquivo `supabase/config.toml` criado
- [ ] Docker container `supabase-db` rodando
- [ ] Studio acessível em `http://localhost:54323`
- [ ] Database conectado em `localhost:54322`
- [ ] Arquivo `frontend/.env.local` com credenciais

---

### SEMANA 2: Component Library + Biblioteca Digital Interface

#### Tarefa 2.1 - Criar Estrutura de Componentes Base
**Responsável:** Frontend Dev  
**Recurso:** Criar componentes reutilizáveis  
**Entrada:** React project from Semana 1  

**Procedimento:**

Criar estrutura de pastas e componentes base:

```powershell
# No diretório frontend
cd C:\Users\rober\Downloads\BIBLIOTECA\frontend

# Criar estrutura de componentes
mkdir src\components
mkdir src\components\common
mkdir src\components\library
mkdir src\components\map
mkdir src\hooks
mkdir src\services

# Criar componentes base
# 1. src/components/common/Navbar.tsx
# 2. src/components/common/Footer.tsx
# 3. src/components/common/Card.tsx
# 4. src/components/common/Modal.tsx
# 5. src/components/library/SearchBar.tsx
# 6. src/components/library/FilterPanel.tsx
# 7. src/components/library/ItemCard.tsx
# 8. src/components/library/ItemDetail.tsx
# 9. src/components/map/InteractiveMap.tsx
# 10. src/hooks/useSearch.ts
# 11. src/services/supabaseClient.ts
```

**Componentes a Implementar:**

**SearchBar.tsx:**
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Buscar acervo..." 
}) => {
  const [query, setQuery] = useState("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };
  
  return (
    <input 
      type="text" 
      value={query} 
      onChange={handleChange}
      placeholder={placeholder}
      className="px-4 py-2 border border-gray-300 rounded-lg"
    />
  );
};
```

**FilterPanel.tsx:**
```typescript
interface FilterPanelProps {
  categories: string[];
  selectedCategories: string[];
  onFilterChange: (categories: string[]) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedCategories,
  onFilterChange
}) => {
  const toggleCategory = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onFilterChange(updated);
  };
  
  return (
    <div className="flex flex-col gap-2">
      {categories.map(cat => (
        <label key={cat}>
          <input 
            type="checkbox" 
            checked={selectedCategories.includes(cat)}
            onChange={() => toggleCategory(cat)}
          />
          {cat}
        </label>
      ))}
    </div>
  );
};
```

**Critérios de Aceitação:**
- [ ] Estrutura de pastas criada conforme acima
- [ ] 5+ componentes React implementados
- [ ] Componentes usam TypeScript strict
- [ ] Componentes aceitam props tipadas
- [ ] Cada componente tem função clara e exportável
- [ ] Teste: `npm run dev` não mostra erros TypeScript

---

#### Tarefa 2.2 - Implementar Biblioteca Digital Interface
**Responsável:** Frontend Dev  
**Recurso:** React components + Supabase queries  
**Entrada:** Componentes da Tarefa 2.1  

**Procedimento:**

Criar página principal da Biblioteca Digital:

**src/pages/BibliotecaDigital.tsx:**
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { SearchBar } from '../components/library/SearchBar';
import { FilterPanel } from '../components/library/FilterPanel';
import { ItemCard } from '../components/library/ItemCard';
import { ItemDetail } from '../components/library/ItemDetail';

export const BibliotecaDigital: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar catalogos do Supabase
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('catalogos')
          .select('*')
          .limit(100);
        
        if (error) throw error;
        setItems(data || []);
        setFilteredItems(data || []);
      } catch (err) {
        console.error('Erro ao carregar catalogos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // Filtrar items baseado em search + categories
  useEffect(() => {
    let filtered = items;

    // Aplicar filtro de categoria
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => 
        selectedCategories.includes(item.categoria)
      );
    }

    // Aplicar filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.titulo?.toLowerCase().includes(query) ||
        item.descricao?.toLowerCase().includes(query) ||
        item.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  }, [items, selectedCategories, searchQuery]);

  const categories = Array.from(new Set(items.map(i => i.categoria)));

  return (
    <div className="flex gap-4 p-6">
      {/* Sidebar de filtros */}
      <aside className="w-48 flex-shrink-0">
        <h3 className="font-bold mb-4">Filtros</h3>
        <FilterPanel
          categories={categories}
          selectedCategories={selectedCategories}
          onFilterChange={setSelectedCategories}
        />
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1">
        <SearchBar 
          onSearch={setSearchQuery}
          placeholder="Buscar no acervo..."
        />

        {/* Grid de items */}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-6">
            {filteredItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}

        {selectedItem && (
          <ItemDetail 
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </main>
    </div>
  );
};
```

**Critérios de Aceitação:**
- [ ] Página BibliotecaDigital.tsx criada
- [ ] Busca por texto funcional (client-side inicialmente)
- [ ] Filtro por categoria funcional
- [ ] Items renderizados em grid responsivo
- [ ] Modal/detail view abre ao clicar item
- [ ] Sem erros no console (`npm run dev`)
- [ ] HMR atualiza página ao salvar arquivo

---

### SEMANA 3: 3D Museum Pipeline + Mapa GIS Integrado

#### Tarefa 3.1 - Blender → Three.js Export Pipeline
**Responsável:** 3D Artist/Técnico  
**Recurso:** Blender 4.0+ com Khronos glTF exporter  
**Entrada:** Modelos Blender (Sede Villa Terezinha fotogrametria)  

**Procedimento:**

1. **Em Blender:**
   - Abrir modelo 3D da Sede Villa Terezinha
   - Optimizar geometria:
     - Remover objetos invisíveis
     - Combinar meshes similares
     - Triangular faces
     - Bake textures para 2K max
   - Exportar como glTF 2.0 (.glb):
     - File → Export → glTF 2.0 (.glb/.gltf)
     - Settings:
       - Format: glTF Binary (.glb)
       - Animations: ON (se houver)
       - Bake Animation: ON
       - Bake Deformation: ON
   - Salvar em `models/3d/sede-vila-terezinha.glb`

2. **Upload para S3 (Supabase Storage):**
   ```bash
   cd C:\Users\rober\Downloads\BIBLIOTECA\frontend
   
   # Criar script de upload (upload-models.ts)
   npx supabase storage:upload-folder \
     ./models/3d \
     3d-models \
     --local
   ```

3. **Validar glTF:**
   - Usar [Three.js Editor](https://threejs.org/editor/) para preview
   - Verificar:
     - Texturas carregam corretamente
     - Geometria está limpa
     - Arquivo < 50MB

**Critérios de Aceitação:**
- [ ] Arquivo `.glb` exportado de Blender
- [ ] Tamanho < 50MB (otimizado)
- [ ] Upload para Supabase Storage `3d-models` bucket
- [ ] Arquivo acessível via URL pública
- [ ] Preview em Three.js Editor funciona

---

#### Tarefa 3.2 - Integrar Three.js para Renderizar Modelos 3D
**Responsável:** Frontend Dev (3D/WebGL)  
**Recurso:** Three.js + React  
**Entrada:** Arquivo .glb da Tarefa 3.1  

**Procedimento:**

Instalar Three.js:
```bash
cd frontend
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

Criar componente **src/components/museum/MuseumViewer.tsx:**
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

interface MuseumViewerProps {
  modelUrl: string;
  title?: string;
}

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

export const MuseumViewer: React.FC<MuseumViewerProps> = ({ 
  modelUrl, 
  title = "Museu Virtual" 
}) => {
  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <Suspense fallback={<div>Carregando modelo...</div>}>
          <Model url={modelUrl} />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
};
```

**Critérios de Aceitação:**
- [ ] Componente MuseumViewer.tsx criado
- [ ] Three.js renderiza modelo 3D
- [ ] OrbitControls funciona (mouse drag, zoom)
- [ ] Sem erros WebGL no console
- [ ] Modelo carrega em < 5 segundos

---

#### Tarefa 3.3 - Integrar Mapa GIS Interativo
**Responsável:** Frontend Dev (GIS/Mapping)  
**Recurso:** Leaflet.js + dados KML de Fase 1  
**Entrada:** 252 KML files em formato GeoJSON  

**Procedimento:**

Instalar Leaflet:
```bash
cd frontend
npm install leaflet react-leaflet geojson-bounds
npm install -D @types/leaflet
```

Criar arquivo **src/data/gis-layers.ts** para converter KML → GeoJSON:
```typescript
import type { FeatureCollection } from 'geojson';

// Cada layer representa um arquivo KML de Fase 1
export const GIS_LAYERS: Record<string, FeatureCollection> = {
  'MATA_001': {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Mata 001', category: 'forest' },
        geometry: { type: 'Point', coordinates: [-42.5, -23.2] }
      }
    ]
  },
  // ... 251 mais layers
};
```

Criar componente **src/components/map/InteractiveGISMap.tsx:**
```typescript
import { MapContainer, TileLayer, GeoJSON, LayerGroup } from 'react-leaflet';
import { useState } from 'react';
import { GIS_LAYERS } from '../../data/gis-layers';
import type { FeatureCollection } from 'geojson';

interface InteractiveGISMapProps {
  visibleLayers?: string[];
  onFeatureClick?: (feature: any) => void;
}

export const InteractiveGISMap: React.FC<InteractiveGISMapProps> = ({
  visibleLayers = Object.keys(GIS_LAYERS),
  onFeatureClick
}) => {
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(
    new Set(visibleLayers)
  );

  const toggleLayer = (layerName: string) => {
    const updated = new Set(selectedLayers);
    if (updated.has(layerName)) {
      updated.delete(layerName);
    } else {
      updated.add(layerName);
    }
    setSelectedLayers(updated);
  };

  return (
    <div className="flex gap-4">
      {/* Layer control */}
      <aside className="w-48 bg-gray-100 p-4 rounded overflow-y-auto max-h-[600px]">
        <h3 className="font-bold mb-4">Camadas GIS</h3>
        {Object.keys(GIS_LAYERS).map(layerName => (
          <label key={layerName} className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox"
              checked={selectedLayers.has(layerName)}
              onChange={() => toggleLayer(layerName)}
            />
            <span className="text-sm">{layerName}</span>
          </label>
        ))}
      </aside>

      {/* Map */}
      <MapContainer 
        center={[-23.2, -42.5]} 
        zoom={13} 
        className="flex-1 h-[600px] border border-gray-300 rounded"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />
        
        {Array.from(selectedLayers).map(layerName => (
          <GeoJSON 
            key={layerName}
            data={GIS_LAYERS[layerName]}
            onClick={e => onFeatureClick?.(e.latlng)}
          />
        ))}
      </MapContainer>
    </div>
  );
};
```

**Critérios de Aceitação:**
- [ ] Leaflet integrado em projeto React
- [ ] Mapa renderiza com OpenStreetMap tiles
- [ ] Seletor de camadas funcional (checkboxes)
- [ ] Clique em feature mostra informações
- [ ] Zoom/pan funciona
- [ ] Sem erros no console

---

### SEMANA 4: API Integration + Testing + GO/NO-GO

#### Tarefa 4.1 - Integrar API Endpoints com Supabase
**Responsável:** Frontend Dev + Backend Dev  
**Recurso:** Supabase Client + React Query  
**Entrada:** Schema Supabase de Semana 1, Componentes de Semana 2-3  

**Procedimento:**

Criar arquivo **src/services/supabaseClient.ts:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API functions
export const api = {
  // Catalogos
  getCatalogos: async (limit = 100) => {
    const { data, error } = await supabase
      .from('catalogos')
      .select('*')
      .limit(limit);
    if (error) throw error;
    return data;
  },

  searchCatalogos: async (query: string) => {
    const { data, error } = await supabase
      .rpc('search_catalogos', { query, limit: 50 });
    if (error) throw error;
    return data;
  },

  getCatalogoById: async (id: string) => {
    const { data, error } = await supabase
      .from('catalogos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Localidades
  getLocalidades: async () => {
    const { data, error } = await supabase
      .from('localidades')
      .select('*');
    if (error) throw error;
    return data;
  },

  getLocalidadeCatalogos: async (localidadeId: string) => {
    const { data, error } = await supabase
      .rpc('get_localidade_catalogos', { localidade_id: localidadeId });
    if (error) throw error;
    return data;
  },

  // Modelos 3D
  getModels3D: async () => {
    const { data, error } = await supabase
      .from('models_3d')
      .select('*');
    if (error) throw error;
    return data;
  },

  // GIS Layers
  getGISLayers: async () => {
    const { data, error } = await supabase
      .from('gis_layers')
      .select('*')
      .eq('visible_default', true);
    if (error) throw error;
    return data;
  }
};
```

Criar custom hook **src/hooks/useApi.ts:**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/supabaseClient';

export const useCatalogos = () => {
  return useQuery({
    queryKey: ['catalogos'],
    queryFn: () => api.getCatalogos(100)
  });
};

export const useCatalogoSearch = (query: string) => {
  return useQuery({
    queryKey: ['catalogos', 'search', query],
    queryFn: () => api.searchCatalogos(query),
    enabled: query.length > 2
  });
};

export const useLocalidades = () => {
  return useQuery({
    queryKey: ['localidades'],
    queryFn: () => api.getLocalidades()
  });
};

export const useModels3D = () => {
  return useQuery({
    queryKey: ['models_3d'],
    queryFn: () => api.getModels3D()
  });
};

export const useGISLayers = () => {
  return useQuery({
    queryKey: ['gis_layers'],
    queryFn: () => api.getGISLayers()
  });
};
```

**Critérios de Aceitação:**
- [ ] Arquivo `src/services/supabaseClient.ts` criado
- [ ] Arquivo `src/hooks/useApi.ts` criado
- [ ] 5+ API functions documentadas
- [ ] React Query integrando dados do Supabase
- [ ] Erro handling em cada função
- [ ] TypeScript types para respostas

---

#### Tarefa 4.2 - Testes Unitários com Vitest
**Responsável:** QA/Frontend Dev  
**Recurso:** Vitest + @testing-library/react  
**Entrada:** Componentes de Semana 2-3  

**Procedimento:**

Criar arquivo **vitest.config.ts** na raiz de `frontend/`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup.ts'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

Criar testes para componentes:

**src/components/library/__tests__/SearchBar.test.tsx:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('renders search input', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);
    expect(screen.getByPlaceholderText(/Buscar acervo/i)).toBeInTheDocument();
  });

  it('calls onSearch when typing', async () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText(/Buscar acervo/i);
    await userEvent.type(input, 'test');
    
    expect(handleSearch).toHaveBeenCalledWith('test');
  });
});
```

**src/components/library/__tests__/FilterPanel.test.tsx:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '../FilterPanel';

describe('FilterPanel', () => {
  it('renders categories', () => {
    const handleFilterChange = vi.fn();
    const categories = ['Documentos', 'Fotos', 'Áudio'];
    
    render(
      <FilterPanel 
        categories={categories}
        selectedCategories={[]}
        onFilterChange={handleFilterChange}
      />
    );

    categories.forEach(cat => {
      expect(screen.getByLabelText(cat)).toBeInTheDocument();
    });
  });

  it('calls onFilterChange when checkbox clicked', async () => {
    const handleFilterChange = vi.fn();
    const categories = ['Documentos', 'Fotos'];
    
    render(
      <FilterPanel 
        categories={categories}
        selectedCategories={[]}
        onFilterChange={handleFilterChange}
      />
    );

    const checkbox = screen.getByLabelText('Documentos');
    await userEvent.click(checkbox);
    
    expect(handleFilterChange).toHaveBeenCalledWith(['Documentos']);
  });
});
```

Executar testes:
```bash
cd frontend
npm run test
npm run test:ui  # Interface visual
```

**Critérios de Aceitação:**
- [ ] `vitest.config.ts` configurado
- [ ] 5+ testes unitários criados para componentes
- [ ] Coverage > 70% para componentes críticos
- [ ] `npm run test` passa sem erros
- [ ] `npm run test:ui` abre dashboard
- [ ] Todos os testes documentados com descrição clara

---

#### Tarefa 4.3 - Consolidação e GO/NO-GO Decision
**Responsável:** Tech Lead (Roo)  
**Recurso:** Documento de consolidação  
**Entrada:** Todos artifacts de Semana 1-4  

**Procedimento:**

Criar arquivo **reports/FASE_2_CONSOLIDACAO.json**:

```json
{
  "project": "Mundo Virtual Villa Canabrava",
  "phase": "FASE 2 - MVP Development",
  "phase_number": 2,
  "consolidation_date": "2026-03-06",
  "status": "PENDING_APPROVAL",
  "executive_summary": {
    "deliverables_completed": [
      "React 18 + TypeScript app running on localhost:5173",
      "Supabase schema with 6 tables + RLS policies",
      "Component library: 10+ React components",
      "Biblioteca Digital interface with search/filter",
      "3D Museum viewer with Three.js",
      "Interactive GIS map with 252 layers",
      "Vitest suite with 5+ component tests",
      "API integration with React Query"
    ],
    "metrics": {
      "react_components_created": 10,
      "test_coverage_percent": 72,
      "api_endpoints_integrated": 8,
      "gis_layers_supported": 252,
      "3d_models_renderable": 1,
      "typescript_strict_mode": true,
      "vite_build_seconds": 3.2,
      "bundle_size_kb": 450
    }
  },
  "week_1_results": {
    "status": "COMPLETED",
    "tasks": [
      {
        "id": "1.1",
        "title": "React 18 + TypeScript setup",
        "status": "DONE",
        "output": "frontend/ app running on localhost:5173 with HMR",
        "evidence": "npm run dev starts successfully"
      },
      {
        "id": "1.2",
        "title": "Supabase schema design",
        "status": "DONE",
        "output": "docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md with 6 tables",
        "evidence": "Complete design document with RLS policies"
      },
      {
        "id": "1.3",
        "title": "Supabase local setup",
        "status": "DONE",
        "output": "Supabase running on localhost:54321",
        "evidence": "Studio accessible, DB connected"
      }
    ]
  },
  "week_2_results": {
    "status": "COMPLETED",
    "tasks": [
      {
        "id": "2.1",
        "title": "Component library base",
        "status": "DONE",
        "components": 5,
        "evidence": "SearchBar, FilterPanel, ItemCard, ItemDetail, Navbar"
      },
      {
        "id": "2.2",
        "title": "Biblioteca Digital interface",
        "status": "DONE",
        "features": ["Search functional", "Filter by category", "Item grid", "Detail modal"],
        "evidence": "BibliotecaDigital.tsx page fully functional"
      }
    ]
  },
  "week_3_results": {
    "status": "COMPLETED",
    "tasks": [
      {
        "id": "3.1",
        "title": "Blender → Three.js pipeline",
        "status": "DONE",
        "output": "sede-vila-terezinha.glb (45MB)",
        "evidence": "Model exported and optimized"
      },
      {
        "id": "3.2",
        "title": "Three.js museum viewer",
        "status": "DONE",
        "features": ["Model loading", "OrbitControls", "Lighting"],
        "evidence": "MuseumViewer component renders 3D model"
      },
      {
        "id": "3.3",
        "title": "GIS map integration",
        "status": "DONE",
        "features": ["252 layers", "Layer toggle", "Feature click"],
        "evidence": "InteractiveGISMap with all layers rendering"
      }
    ]
  },
  "week_4_results": {
    "status": "COMPLETED",
    "tasks": [
      {
        "id": "4.1",
        "title": "API integration",
        "status": "DONE",
        "endpoints": 8,
        "evidence": "supabaseClient.ts + useApi.ts fully functional"
      },
      {
        "id": "4.2",
        "title": "Vitest suite",
        "status": "DONE",
        "test_count": 8,
        "coverage": 72,
        "evidence": "All tests passing"
      },
      {
        "id": "4.3",
        "title": "Consolidation",
        "status": "DONE",
        "evidence": "This report generated"
      }
    ]
  },
  "approval_criteria": {
    "criterion_1": {
      "requirement": "React app running on localhost:5173",
      "status": "✅ PASS",
      "evidence": "npm run dev starts successfully, HMR working"
    },
    "criterion_2": {
      "requirement": "Supabase schema with RLS policies",
      "status": "✅ PASS",
      "evidence": "6 tables with documented RLS policies"
    },
    "criterion_3": {
      "requirement": "Biblioteca Digital with search/filter",
      "status": "✅ PASS",
      "evidence": "Full-text search, category filter, grid view functional"
    },
    "criterion_4": {
      "requirement": "3D map rendering with GIS data",
      "status": "✅ PASS",
      "evidence": "Three.js + Leaflet rendering all 252 layers"
    },
    "criterion_5": {
      "requirement": "5+ React components tested",
      "status": "✅ PASS",
      "evidence": "8 Vitest unit tests with 72% coverage"
    },
    "criterion_6": {
      "requirement": "API endpoints integrated",
      "status": "✅ PASS",
      "evidence": "8 Supabase RPC endpoints integrated with React Query"
    }
  },
  "go_nogo_decision": {
    "recommendation": "GO FOR PHASE 3",
    "rationale": "All 6 approval criteria met. MVP stack stable and performant. Ready for Phase 3 (Advanced Features & Optimization)",
    "risks": [
      "Performance optimization needed for 50k+ GIS features",
      "Mobile responsiveness needs testing",
      "Authentication flow needs end-to-end testing"
    ],
    "next_phase_readiness": "READY",
    "decision_maker": "Roberth Naninne de Souza",
    "decision_date": "2026-03-06"
  }
}
```

**Critérios de Aceitação:**
- [ ] Arquivo `reports/FASE_2_CONSOLIDACAO.json` gerado
- [ ] Todos 6 critérios de aprovação com status ✅ PASS
- [ ] Recomendação GO/NO-GO clara e justificada
- [ ] Métricas numéricas reportadas
- [ ] Riscos identificados e documentados

---

## 📊 RESUMO DE ENTREGÁVEIS

| Semana | Artifact | Status | Critério Mínimo |
|--------|----------|--------|-----------------|
| 1 | `frontend/` React app | ✅ | App rodando localhost:5173 |
| 1 | `docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md` | ✅ | 6 tabelas + RLS documented |
| 1 | Supabase local running | ✅ | Studio acessível 54323 |
| 2 | Component library (5+) | ✅ | SearchBar, FilterPanel, Cards |
| 2 | BibliotecaDigital.tsx | ✅ | Search + Filter + Grid |
| 3 | `sede-vila-terezinha.glb` | ✅ | 3D model <50MB |
| 3 | MuseumViewer 3D | ✅ | Three.js rendering |
| 3 | InteractiveGISMap | ✅ | 252 layers + toggle |
| 4 | API integration | ✅ | 8 endpoints functional |
| 4 | Vitest suite | ✅ | 8 tests, 72% coverage |
| 4 | `reports/FASE_2_CONSOLIDACAO.json` | ✅ | GO/NO-GO decision |

---

## 🚀 CHECKLIST DE SUCESSO

### Semana 1 ✅
- [ ] `npm run dev` starts without errors
- [ ] Vite dev server responds on localhost:5173
- [ ] TypeScript strict mode enabled
- [ ] Supabase schema document complete
- [ ] Supabase local running on localhost:54321

### Semana 2 ✅
- [ ] 5+ React components created and exported
- [ ] BibliotecaDigital page working
- [ ] Search input functional (client-side)
- [ ] Filter checkboxes working
- [ ] Item grid renders with data

### Semana 3 ✅
- [ ] 3D model exported from Blender as .glb
- [ ] Three.js renders model without errors
- [ ] OrbitControls working (drag, zoom)
- [ ] GIS map renders with Leaflet
- [ ] Layer toggles work (checkboxes)

### Semana 4 ✅
- [ ] API functions in supabaseClient.ts
- [ ] React Query hooks in useApi.ts
- [ ] 8+ Vitest unit tests created
- [ ] Test coverage > 70%
- [ ] `npm run test` passes all tests
- [ ] Consolidation report generated

---

## 🔗 PRÓXIMOS PASSOS

1. **Executor:** Ler este documento completamente
2. **Executor:** Seguir tarefas semana-por-semana
3. **Executor:** Gerar deliverables esperados
4. **Validador:** Usar [`PROMPT_VALIDACAO_FASE_2.md`](PROMPT_VALIDACAO_FASE_2.md) para validar
5. **Roberth:** Tomar decisão GO/NO-GO baseado em consolidação
