# SUPABASE SCHEMA - FASE 2 MVP

**Versão:** 1.0  
**Data:** 2026-02-06  
**Responsável:** Technical Lead (Roo)  
**Status:** Design Document - Pronto para Implementação

---

## 📋 Visão Geral

Este documento define o schema de banco de dados para a Fase 2 (MVP) do projeto Mundo Virtual Villa Canabrava. 

**Objetivos:**
- ✅ Suportar 252+ localidades geoespaciais (Fase 1)
- ✅ Armazenar acervo digital categorizado
- ✅ Gerenciar coleções de usuários
- ✅ Integrar modelos 3D (Blender → Three.js)
- ✅ Mapas GIS interativos com 252 camadas
- ✅ Autenticação segura com RLS policies

**Tecnologias:**
- Supabase (PostgreSQL + PostGIS)
- Row-Level Security (RLS) policies
- Full-text search (PostgreSQL tsvector)
- Geometria espacial (PostGIS)

---

## 🗂️ TABELAS PRINCIPAIS (6 tabelas + RLS Enabled)

### 1. **users** (Supabase Auth integrado)

Tabela que estende o auth.users do Supabase.

```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'viewer',
  CHECK (role IN ('admin', 'curator', 'viewer')),
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id` (UUID): Primary key, FK para auth.users
- `email` (text, UNIQUE): Email do usuário
- `role` (enum): 'admin' | 'curator' | 'viewer'
- `full_name` (text): Nome completo
- `avatar_url` (text): URL do avatar (S3)
- `created_at` (timestamp): Data criação
- `updated_at` (timestamp): Data atualização

**RLS Policies:**
- **SELECT**: Usuário pode ler apenas seu próprio perfil
- **INSERT**: Não permitido (criado via auth triggers)
- **UPDATE**: Usuário pode atualizar apenas seu próprio perfil
- **DELETE**: Não permitido (apenas admin com trigger)

**Índices:**
- PK: id
- UNIQUE: email

---

### 2. **localidades** (GIS locations from Fase 1)

Tabela que armazena as 252 localidades georeferenciadas.

```sql
CREATE TABLE public.localidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  geom geometry(Point, 4326) NOT NULL,
  categoria text,
  metadata_json jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance
CREATE INDEX idx_localidades_categoria ON localidades USING BTREE (categoria);
CREATE INDEX idx_localidades_nome ON localidades USING BTREE (nome);
CREATE INDEX idx_localidades_geom ON localidades USING BRIN (geom);
```

**Campos:**
- `id` (UUID): Primary key
- `nome` (text, NOT NULL): Nome da localidade
- `descricao` (text): Descrição longa
- `geom` (geometry, NOT NULL): Ponto geográfico (EPSG:4326)
- `categoria` (text): farm | forest | building | etc
- `metadata_json` (jsonb): Dados extensíveis (JSON)
- `created_at` (timestamp): Data criação
- `updated_at` (timestamp): Data atualização

**RLS Policies:**
- **SELECT**: Public (todos podem ler)
- **INSERT**: Admin only
- **UPDATE**: Admin only
- **DELETE**: Admin only

**Índices:**
- PK: id
- BTREE: categoria, nome
- BRIN: geom (otimizado para range queries)

---

### 3. **catalogos** (Digital items from Acervo)

Tabela que armazena itens do acervo digital.

```sql
CREATE TABLE public.catalogos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  categoria text NOT NULL,
  subcategoria text,
  data_criacao date,
  autor text,
  origem uuid REFERENCES localidades(id),
  tags text[] DEFAULT '{}',
  metadata_json jsonb DEFAULT '{}',
  thumbnail_url text,
  arquivo_url text,
  user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  is_active boolean DEFAULT true
);

-- Índices de performance
CREATE INDEX idx_catalogos_categoria ON catalogos USING BTREE (categoria);
CREATE INDEX idx_catalogos_user_id ON catalogos USING BTREE (user_id);
CREATE INDEX idx_catalogos_tags ON catalogos USING GIN (tags);
CREATE INDEX idx_catalogos_fts ON catalogos USING GIN (
  to_tsvector('portuguese', titulo || ' ' || COALESCE(descricao, ''))
);
```

**Campos:**
- `id` (UUID): Primary key
- `titulo` (text, NOT NULL): Título do item
- `descricao` (text): Descrição longa
- `categoria` (text, NOT NULL): documento | foto | audiovisual | mapa | objeto
- `subcategoria` (text): Subcategoria
- `data_criacao` (date): Data histórica do item
- `autor` (text): Autor/criador original
- `origem` (UUID, FK): Localidade associada
- `tags` (text[]): Array de tags para busca
- `metadata_json` (jsonb): Dados extensíveis
- `thumbnail_url` (text): URL thumbnail (S3)
- `arquivo_url` (text): URL do arquivo original (S3)
- `user_id` (UUID, FK): Proprietário/autor
- `created_at` (timestamp): Data criação no sistema
- `updated_at` (timestamp): Data atualização
- `is_active` (boolean): Soft delete flag

**RLS Policies:**
- **SELECT**: Public (todos podem ler)
- **INSERT**: Authenticated users (qualquer user autenticado)
- **UPDATE**: Apenas o author (user_id)
- **DELETE**: Apenas o author (soft delete via is_active)

**Índices:**
- PK: id
- BTREE: categoria, user_id
- GIN: tags (para array search)
- GIN: FTS (full-text search em português)

---

### 4. **collections** (User collections/favorites)

Tabela para coleções/favoritos do usuário.

```sql
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  catalogo_ids uuid[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_collections_user_id ON collections USING BTREE (user_id);
CREATE INDEX idx_collections_is_public ON collections USING BTREE (is_public);
```

**Campos:**
- `id` (UUID): Primary key
- `user_id` (UUID, FK): Proprietário da coleção
- `nome` (text, NOT NULL): Nome da coleção
- `descricao` (text): Descrição
- `catalogo_ids` (UUID[]): Array de IDs de catalogos
- `is_public` (boolean): Coleção pública ou privada
- `created_at` (timestamp): Data criação
- `updated_at` (timestamp): Data atualização

**RLS Policies:**
- **SELECT**: User pode ler suas próprias coleções + públicas
- **INSERT**: User pode criar suas próprias coleções
- **UPDATE**: User pode atualizar suas próprias coleções
- **DELETE**: User pode deletar suas próprias coleções

**Índices:**
- PK: id
- BTREE: user_id, is_public

---

### 5. **models_3d** (3D assets for museum)

Tabela para modelos 3D do museu virtual.

```sql
CREATE TABLE public.models_3d (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  blender_source_url text,
  threejs_gltf_url text NOT NULL,
  thumbnail_url text,
  lokalisacao_id uuid REFERENCES localidades(id),
  metadata_json jsonb DEFAULT '{}',
  file_size_bytes integer,
  polygon_count integer,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_models_3d_lokalisacao_id ON models_3d USING BTREE (lokalisacao_id);
CREATE INDEX idx_models_3d_created_at ON models_3d USING BTREE (created_at DESC);
```

**Campos:**
- `id` (UUID): Primary key
- `nome` (text, NOT NULL): Nome do modelo
- `descricao` (text): Descrição
- `blender_source_url` (text): URL source Blender (S3)
- `threejs_gltf_url` (text, NOT NULL): URL do arquivo .glb (S3)
- `thumbnail_url` (text): Preview image
- `lokalisacao_id` (UUID, FK): Localidade associada (opcional)
- `metadata_json` (jsonb): Dados extras (texturas, animações, etc)
- `file_size_bytes` (integer): Tamanho do arquivo
- `polygon_count` (integer): Contagem de polígonos
- `created_at` (timestamp): Data criação
- `updated_at` (timestamp): Data atualização

**RLS Policies:**
- **SELECT**: Public (todos podem ler)
- **INSERT**: Curator only
- **UPDATE**: Curator only
- **DELETE**: Curator only

**Índices:**
- PK: id
- BTREE: lokalisacao_id, created_at

---

### 6. **gis_layers** (Mapa interativo - 252 camadas)

Tabela para as 252 camadas GIS de Fase 1.

```sql
CREATE TABLE public.gis_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  source_kml_file text,
  geojson_features jsonb NOT NULL,
  bounding_box geometry(Polygon, 4326),
  feature_count integer,
  visible_default boolean DEFAULT true,
  z_index integer DEFAULT 0,
  style_json jsonb DEFAULT '{}',
  metadata_json jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_gis_layers_visible_default ON gis_layers USING BTREE (visible_default);
CREATE INDEX idx_gis_layers_z_index ON gis_layers USING BTREE (z_index);
CREATE INDEX idx_gis_layers_bounding_box ON gis_layers USING BRIN (bounding_box);
```

**Campos:**
- `id` (UUID): Primary key
- `nome` (text, NOT NULL): Nome da camada
- `descricao` (text): Descrição
- `source_kml_file` (text): Nome do arquivo KML original
- `geojson_features` (jsonb, NOT NULL): GeoJSON FeatureCollection
- `bounding_box` (geometry, Polygon): Envelope da camada
- `feature_count` (integer): Contagem de features
- `visible_default` (boolean): Visível por padrão no mapa
- `z_index` (integer): Ordem de renderização (0-1000)
- `style_json` (jsonb): Estilos Leaflet (cores, pesos, etc)
- `metadata_json` (jsonb): Dados extensíveis
- `created_at` (timestamp): Data criação
- `updated_at` (timestamp): Data atualização

**RLS Policies:**
- **SELECT**: Public (todos podem ler)
- **INSERT**: Curator only
- **UPDATE**: Curator only
- **DELETE**: Curator only

**Índices:**
- PK: id
- BTREE: visible_default, z_index
- BRIN: bounding_box

---

## 📦 STORAGE BUCKETS (3 buckets)

### 1. **acervo-files**

Armazena arquivos do acervo (documentos, fotos, vídeos, áudio).

```
Estrutura:
acervo-files/
├── documentos/
├── fotos/
├── audiovisual/
└── mapas/
```

**RLS Policies:**
- **SELECT**: Authenticated users can read
- **INSERT**: Authenticated users can upload (owner)
- **UPDATE**: Owner only
- **DELETE**: Owner only

**Limites:**
- Arquivo máximo: 500MB
- Tipos aceitos: PDF, JPG, PNG, MP4, MP3, WAV

---

### 2. **3d-models**

Armazena modelos 3D exportados (Blender → glTF).

```
Estrutura:
3d-models/
├── sede-vila-terezinha.glb
├── galpao-principal.glb
└── ...
```

**RLS Policies:**
- **SELECT**: Public (todos podem baixar)
- **INSERT**: Curator only
- **UPDATE**: Curator only
- **DELETE**: Curator only

**Limites:**
- Arquivo máximo: 100MB (otimizado)
- Tipos aceitos: .glb, .gltf

---

### 3. **thumbnails**

Cache de imagens thumbnail (geradas automaticamente).

```
Estrutura:
thumbnails/
├── catalogos/
├── models_3d/
└── localidades/
```

**RLS Policies:**
- **SELECT**: Public (todos podem ver)
- **INSERT**: System only (via triggers/functions)
- **UPDATE**: System only
- **DELETE**: System only

**Limites:**
- Arquivo máximo: 10MB
- Tipos: JPG, PNG

---

## 🔧 RPC FUNCTIONS (Stored Procedures)

### 1. **search_catalogos()**

Busca full-text em catalogos.

```sql
CREATE OR REPLACE FUNCTION search_catalogos(
  p_query TEXT,
  p_limit INT DEFAULT 50,
  p_categoria TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  categoria TEXT,
  thumbnail_url TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.titulo,
    c.descricao,
    c.categoria,
    c.thumbnail_url,
    ts_rank(
      to_tsvector('portuguese', c.titulo || ' ' || COALESCE(c.descricao, '')),
      plainto_tsquery('portuguese', p_query)
    ) as rank
  FROM catalogos c
  WHERE 
    to_tsvector('portuguese', c.titulo || ' ' || COALESCE(c.descricao, ''))
    @@ plainto_tsquery('portuguese', p_query)
    AND c.is_active = true
    AND (p_categoria IS NULL OR c.categoria = p_categoria)
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Entrada:**
- `p_query` (TEXT): Query de busca em português
- `p_limit` (INT): Limite de resultados (default 50)
- `p_categoria` (TEXT, opcional): Filtrar por categoria

**Saída:**
- Array de JSON com (id, titulo, descricao, categoria, thumbnail_url, rank)

---

### 2. **get_localidade_catalogos()**

Retorna todos os catalogos associados a uma localidade.

```sql
CREATE OR REPLACE FUNCTION get_localidade_catalogos(
  p_localidade_id UUID
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  categoria TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.titulo,
    c.categoria,
    c.thumbnail_url,
    c.created_at
  FROM catalogos c
  WHERE c.origem = p_localidade_id AND c.is_active = true
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Entrada:**
- `p_localidade_id` (UUID): ID da localidade

**Saída:**
- Array de JSON com catalogos

---

### 3. **get_user_collections()**

Retorna collections do usuário.

```sql
CREATE OR REPLACE FUNCTION get_user_collections(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  descricao TEXT,
  item_count INT,
  is_public BOOLEAN,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nome,
    c.descricao,
    array_length(c.catalogo_ids, 1) as item_count,
    c.is_public,
    c.created_at
  FROM collections c
  WHERE c.user_id = p_user_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Entrada:**
- `p_user_id` (UUID): ID do usuário

**Saída:**
- Array de JSON com collections

---

## 🔐 RLS POLICIES SUMMARY

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| **users** | self | - | self | - |
| **localidades** | public | admin | admin | admin |
| **catalogos** | public | auth | author | author |
| **collections** | user+public | user | user | user |
| **models_3d** | public | curator | curator | curator |
| **gis_layers** | public | curator | curator | curator |

---

## 📋 MIGRATION WORKFLOW

**Fase de Implementação:**
1. Criar tabelas (6 tables)
2. Criar índices (performance)
3. Criar RLS policies (segurança)
4. Criar RPC functions (business logic)
5. Criar storage buckets (arquivos)
6. Seed data (252 localidades + taxonomia)

**Testes de Aceitação:**
- ✅ Conectar React app ao Supabase
- ✅ Query localidades retorna 252 registros
- ✅ Busca full-text em catalogos funciona
- ✅ RLS policies restringem acesso corretamente
- ✅ Storage buckets acessíveis via URLs públicas

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO (Tarefa 1.2)

- [x] Arquivo `docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md` criado
- [x] 6 tabelas principais documentadas (users, localidades, catalogos, collections, models_3d, gis_layers)
- [x] RLS policies descritas para cada tabela (SELECT, INSERT, UPDATE, DELETE)
- [x] Índices de performance especificados (BTREE, GIN, BRIN)
- [x] 3 storage buckets descritos com RLS (acervo-files, 3d-models, thumbnails)
- [x] 3 RPC functions descritos (search_catalogos, get_localidade_catalogos, get_user_collections)

---

## 📞 PRÓXIMOS PASSOS

**Tarefa 1.3 (Setup Supabase Local):**
1. `supabase init` no diretório raiz
2. Inicializar Docker containers via `supabase start`
3. Executar migrations SQL para criar schema
4. Seed initial data (localidades + taxonomia)
5. Validar conectividade React ↔ Supabase

**Semana 2:**
- Implementar Supabase schema em banco real
- Criar componentes React (SearchBar, FilterPanel, etc)
- Integrar API com React Query

---

**Documento Final:** ✅ Pronto para Tarefa 1.3 (Docker Setup)
