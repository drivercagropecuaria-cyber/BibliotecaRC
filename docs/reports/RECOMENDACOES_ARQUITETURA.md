# 🏗️ RECOMENDAÇÕES DE ARQUITETURA E CÓDIGO

## 1. ESTRUTURA DE BACKEND RECOMENDADA

### 1.1 Organização de Pastas
```
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── catalogo.routes.ts
│   │   │   ├── media.routes.ts
│   │   │   ├── audit.routes.ts
│   │   │   └── taxonomy.routes.ts
│   │   ├── controllers/
│   │   │   ├── catalogo.controller.ts
│   │   │   ├── media.controller.ts
│   │   │   └── audit.controller.ts
│   │   └── middleware/
│   │       ├── auth.middleware.ts
│   │       ├── cache.middleware.ts
│   │       └── errorHandler.middleware.ts
│   ├── services/
│   │   ├── catalogo.service.ts
│   │   ├── media.service.ts
│   │   ├── cache.service.ts
│   │   └── audit.service.ts
│   ├── database/
│   │   ├── queries/
│   │   │   ├── catalogo.queries.ts
│   │   │   ├── media.queries.ts
│   │   │   └── taxonomy.queries.ts
│   │   ├── migrations/
│   │   │   ├── 001_create_indices.sql
│   │   │   ├── 002_create_subnucleos.sql
│   │   │   └── 003_add_soft_delete.sql
│   │   └── seeds/
│   │       └── taxonomy.seed.ts
│   ├── types/
│   │   ├── catalogo.types.ts
│   │   ├── media.types.ts
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── app.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 2. EXEMPLO DE IMPLEMENTAÇÃO - SERVIÇO DE CATÁLOGO

### 2.1 Tipos TypeScript
```typescript
// src/types/catalogo.types.ts

export interface CatalogoItem {
  id: number;
  identificador: string;
  titulo: string;
  descricao?: string;
  data_captacao?: Date;
  frase_memoria?: string;
  observacoes?: string;
  responsavel?: string;
  
  // IDs de relacionamento
  area_fazenda_id?: number;
  ponto_id?: number;
  tipo_projeto_id?: number;
  nucleo_pecuaria_id?: number;
  subnucleo_pecuaria_id?: number;
  nucleo_agro_id?: number;
  subnucleo_agro_id?: number;
  operacao_id?: number;
  marca_id?: number;
  subnucleo_marca_id?: number;
  evento_id?: number;
  funcao_historica_id?: number;
  tema_principal_id?: number;
  tema_secundario_id?: number;
  status_id?: number;
  capitulo_id?: number;
  media_id?: string;
  
  // Metadados
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CatalogoItemCompleto extends CatalogoItem {
  // Dados desnormalizados (vindo da view)
  area_fazenda?: string;
  ponto?: string;
  tipo_projeto?: string;
  nucleo_pecuaria?: string;
  subnucleo_pecuaria?: string;
  nucleo_agro?: string;
  subnucleo_agro?: string;
  operacao?: string;
  marca?: string;
  evento?: string;
  funcao_historica?: string;
  tema_principal?: string;
  tema_secundario?: string;
  status?: string;
  capitulo?: string;
  
  // Dados de mídia
  arquivo_nome?: string;
  arquivo_tipo?: string;
  arquivo_tamanho?: number;
  arquivo_url?: string;
  thumbnail_url?: string;
}

export interface CatalogoFilter {
  area_fazenda_id?: number;
  status_id?: number;
  nucleo_pecuaria_id?: number;
  nucleo_agro_id?: number;
  data_inicio?: Date;
  data_fim?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'data_captacao' | 'titulo' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
}

export interface CatalogoStats {
  total_itens: number;
  areas_unicas: number;
  nucleos_pecuaria_unicos: number;
  nucleos_agro_unicos: number;
  status_unicos: number;
  itens_com_midia: number;
  data_mais_antiga?: Date;
  data_mais_recente?: Date;
  idade_media_anos?: number;
}
```

### 2.2 Queries Otimizadas
```typescript
// src/database/queries/catalogo.queries.ts

import { supabase } from '../client';

export class CatalogoQueries {
  
  /**
   * Listar itens com filtros e paginação
   * Usa view otimizada v_catalogo_completo
   */
  static async listarItens(filters: CatalogoFilter) {
    const { page = 1, limit = 20, sort_by = 'data_captacao', sort_order = 'DESC' } = filters;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('v_catalogo_completo')
      .select('*', { count: 'exact' });
    
    // Aplicar filtros
    if (filters.area_fazenda_id) {
      query = query.eq('area_fazenda_id', filters.area_fazenda_id);
    }
    
    if (filters.status_id) {
      query = query.eq('status_id', filters.status_id);
    }
    
    if (filters.nucleo_pecuaria_id) {
      query = query.eq('nucleo_pecuaria_id', filters.nucleo_pecuaria_id);
    }
    
    if (filters.nucleo_agro_id) {
      query = query.eq('nucleo_agro_id', filters.nucleo_agro_id);
    }
    
    if (filters.data_inicio && filters.data_fim) {
      query = query
        .gte('data_captacao', filters.data_inicio.toISOString())
        .lte('data_captacao', filters.data_fim.toISOString());
    }
    
    // Busca por texto (Full-Text Search)
    if (filters.search) {
      query = query.or(`titulo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);
    }
    
    // Ordenação
    query = query.order(sort_by, { ascending: sort_order === 'ASC' });
    
    // Paginação
    query = query.range(offset, offset + limit - 1);
    
    const { data, count, error } = await query;
    
    if (error) throw error;
    
    return {
      items: data,
      total: count,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit)
    };
  }
  
  /**
   * Busca por texto com Full-Text Search
   * Muito mais rápido que ILIKE
   */
  static async buscarPorTexto(termo: string, limit = 50) {
    const { data, error } = await supabase.rpc('buscar_catalogo_fts', {
      termo_busca: termo,
      limite: limit
    });
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Obter item completo com todos os relacionamentos
   */
  static async obterItemCompleto(id: number) {
    const { data, error } = await supabase
      .from('v_catalogo_completo')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Obter estatísticas do catálogo
   */
  static async obterEstatisticas(): Promise<CatalogoStats> {
    const { data, error } = await supabase
      .from('v_catalogo_stats')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Criar novo item
   */
  static async criarItem(item: Partial<CatalogoItem>, userId: string) {
    const { data, error } = await supabase
      .from('catalogo_itens')
      .insert([{
        ...item,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar na auditoria
    await this.registrarAuditoria(data.id, 'INSERT', null, data, userId);
    
    return data;
  }
  
  /**
   * Atualizar item
   */
  static async atualizarItem(id: number, updates: Partial<CatalogoItem>, userId: string) {
    // Obter dados antigos para auditoria
    const itemAntigo = await this.obterItemCompleto(id);
    
    const { data, error } = await supabase
      .from('catalogo_itens')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar mudanças na auditoria
    for (const [key, value] of Object.entries(updates)) {
      if (itemAntigo[key] !== value) {
        await this.registrarAuditoria(
          id,
          'UPDATE',
          key,
          itemAntigo[key],
          value,
          userId
        );
      }
    }
    
    return data;
  }
  
  /**
   * Soft delete de item
   */
  static async deletarItem(id: number, userId: string) {
    const { data, error } = await supabase
      .from('catalogo_itens')
      .update({ deleted_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar na auditoria
    await this.registrarAuditoria(id, 'DELETE', 'deleted_at', null, new Date(), userId);
    
    return data;
  }
  
  /**
   * Registrar alteração na auditoria
   */
  private static async registrarAuditoria(
    itemId: number,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    fieldName: string | null,
    oldValue: any,
    newValue: any,
    userId: string
  ) {
    const { error } = await supabase
      .from('catalogo_audit')
      .insert([{
        item_id: itemId,
        action,
        field_name: fieldName,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
        changed_by: userId,
        changed_at: new Date()
      }]);
    
    if (error) console.error('Erro ao registrar auditoria:', error);
  }
}
```

### 2.3 Serviço com Cache
```typescript
// src/services/catalogo.service.ts

import { CatalogoQueries } from '../database/queries/catalogo.queries';
import { CacheService } from './cache.service';
import { CatalogoFilter, CatalogoItemCompleto } from '../types/catalogo.types';

export class CatalogoService {
  private cache = new CacheService();
  
  /**
   * Listar itens com cache
   */
  async listarItens(filters: CatalogoFilter) {
    // Gerar chave de cache
    const cacheKey = `catalogo:list:${JSON.stringify(filters)}`;
    
    // Tentar obter do cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log('✅ Cache hit:', cacheKey);
      return cached;
    }
    
    // Se não estiver em cache, buscar do banco
    console.log('❌ Cache miss:', cacheKey);
    const result = await CatalogoQueries.listarItens(filters);
    
    // Armazenar em cache por 5 minutos
    await this.cache.set(cacheKey, result, 300);
    
    return result;
  }
  
  /**
   * Buscar por texto com cache
   */
  async buscarPorTexto(termo: string) {
    const cacheKey = `catalogo:search:${termo}`;
    
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const result = await CatalogoQueries.buscarPorTexto(termo);
    
    // Cache por 10 minutos para buscas
    await this.cache.set(cacheKey, result, 600);
    
    return result;
  }
  
  /**
   * Obter item completo
   */
  async obterItem(id: number) {
    const cacheKey = `catalogo:item:${id}`;
    
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const result = await CatalogoQueries.obterItemCompleto(id);
    
    // Cache por 30 minutos
    await this.cache.set(cacheKey, result, 1800);
    
    return result;
  }
  
  /**
   * Obter estatísticas com cache
   */
  async obterEstatisticas() {
    const cacheKey = 'catalogo:stats';
    
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const result = await CatalogoQueries.obterEstatisticas();
    
    // Cache por 1 hora
    await this.cache.set(cacheKey, result, 3600);
    
    return result;
  }
  
  /**
   * Criar item (invalida cache)
   */
  async criarItem(item: any, userId: string) {
    const result = await CatalogoQueries.criarItem(item, userId);
    
    // Invalidar caches relacionados
    await this.invalidarCaches();
    
    return result;
  }
  
  /**
   * Atualizar item (invalida cache)
   */
  async atualizarItem(id: number, updates: any, userId: string) {
    const result = await CatalogoQueries.atualizarItem(id, updates, userId);
    
    // Invalidar caches relacionados
    await this.invalidarCaches([`catalogo:item:${id}`]);
    
    return result;
  }
  
  /**
   * Deletar item (invalida cache)
   */
  async deletarItem(id: number, userId: string) {
    const result = await CatalogoQueries.deletarItem(id, userId);
    
    // Invalidar caches relacionados
    await this.invalidarCaches([`catalogo:item:${id}`]);
    
    return result;
  }
  
  /**
   * Invalidar caches
   */
  private async invalidarCaches(chaves?: string[]) {
    if (chaves) {
      for (const chave of chaves) {
        await this.cache.delete(chave);
      }
    } else {
      // Invalidar todos os caches de catálogo
      await this.cache.deletePattern('catalogo:*');
    }
  }
}
```

### 2.4 Controller
```typescript
// src/api/controllers/catalogo.controller.ts

import { Request, Response } from 'express';
import { CatalogoService } from '../../services/catalogo.service';
import { CatalogoFilter } from '../../types/catalogo.types';

const service = new CatalogoService();

export class CatalogoController {
  
  /**
   * GET /api/catalogo
   * Listar itens com filtros
   */
  static async listar(req: Request, res: Response) {
    try {
      const filters: CatalogoFilter = {
        area_fazenda_id: req.query.area_fazenda_id ? Number(req.query.area_fazenda_id) : undefined,
        status_id: req.query.status_id ? Number(req.query.status_id) : undefined,
        nucleo_pecuaria_id: req.query.nucleo_pecuaria_id ? Number(req.query.nucleo_pecuaria_id) : undefined,
        nucleo_agro_id: req.query.nucleo_agro_id ? Number(req.query.nucleo_agro_id) : undefined,
        search: req.query.search as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sort_by: (req.query.sort_by as any) || 'data_captacao',
        sort_order: (req.query.sort_order as any) || 'DESC'
      };
      
      const result = await service.listarItens(filters);
      
      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/catalogo/search
   * Buscar por texto
   */
  static async buscar(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ success: false, error: 'Parâmetro "q" obrigatório' });
      }
      
      const results = await service.buscarPorTexto(q);
      
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/catalogo/:id
   * Obter item completo
   */
  static async obter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await service.obterItem(Number(id));
      
      if (!item) {
        return res.status(404).json({ success: false, error: 'Item não encontrado' });
      }
      
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * GET /api/catalogo/stats
   * Obter estatísticas
   */
  static async stats(req: Request, res: Response) {
    try {
      const stats = await service.obterEstatisticas();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * POST /api/catalogo
   * Criar novo item
   */
  static async criar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Não autenticado' });
      }
      
      const item = await service.criarItem(req.body, userId);
      
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * PUT /api/catalogo/:id
   * Atualizar item
   */
  static async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Não autenticado' });
      }
      
      const item = await service.atualizarItem(Number(id), req.body, userId);
      
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  /**
   * DELETE /api/catalogo/:id
   * Deletar item (soft delete)
   */
  static async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Não autenticado' });
      }
      
      await service.deletarItem(Number(id), userId);
      
      res.json({ success: true, message: 'Item deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
```

### 2.5 Routes
```typescript
// src/api/routes/catalogo.routes.ts

import { Router } from 'express';
import { CatalogoController } from '../controllers/catalogo.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Rotas públicas (com cache)
router.get('/', CatalogoController.listar);
router.get('/search', CatalogoController.buscar);
router.get('/stats', CatalogoController.stats);
router.get('/:id', CatalogoController.obter);

// Rotas protegidas
router.post('/', authMiddleware, CatalogoController.criar);
router.put('/:id', authMiddleware, CatalogoController.atualizar);
router.delete('/:id', authMiddleware, CatalogoController.deletar);

export default router;
```

---

## 3. SERVIÇO DE CACHE

```typescript
// src/services/cache.service.ts

import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD
    });
  }
  
  /**
   * Obter valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  /**
   * Armazenar valor em cache
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  /**
   * Deletar valor do cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
  
  /**
   * Deletar múltiplas chaves por padrão
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache deletePattern error:', error);
    }
  }
  
  /**
   * Limpar todo o cache
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}
```

---

## 4. VARIÁVEIS DE AMBIENTE

```bash
# .env.example

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# API
API_PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key

# File Storage
STORAGE_BUCKET=acervo-arquivos
STORAGE_MAX_SIZE=104857600  # 100MB

# Logging
LOG_LEVEL=info
```

---

## 5. PACKAGE.JSON

```json
{
  "name": "rc-acervo-backend",
  "version": "1.0.0",
  "description": "Backend para RC Acervo - Biblioteca de Fotos",
  "main": "dist/app.js",
  "scripts": {
    "dev": "ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "migrate": "node dist/database/migrations.js",
    "seed": "node dist/database/seeds.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "@supabase/supabase-js": "^2.26.0",
    "ioredis": "^5.3.2",
    "uuid": "^9.0.0",
    "joi": "^17.9.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "eslint": "^8.40.0",
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0"
  }
}
```

---

## 6. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar estrutura de pastas
- [ ] Implementar tipos TypeScript
- [ ] Criar queries otimizadas
- [ ] Implementar serviço de cache
- [ ] Criar controllers
- [ ] Criar routes
- [ ] Configurar middleware de autenticação
- [ ] Implementar tratamento de erros
- [ ] Adicionar logging
- [ ] Criar testes unitários
- [ ] Documentar API com Swagger
- [ ] Deploy em produção

---

*Recomendações preparadas por: Kortix AI Agent*  
*Data: 01/02/2026*
