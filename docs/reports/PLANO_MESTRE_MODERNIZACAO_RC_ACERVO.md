# Documento de Especificação Técnica Definitiva (v2.0)
## RC Acervo - Arquitetura Modernizada

**Versão:** 2.0  
**Data:** Fevereiro 2026  
**Status:** Especificação Final para Implementação  
**Autor:** Lead System Architect  

---

## Sumário

1. [Visão Geral da Nova Arquitetura](#1-visão-geral-da-nova-arquitetura)
2. [Especificação do Banco de Dados](#2-especificação-do-banco-de-dados)
3. [Protocolos de Segurança](#3-protocolos-de-segurança)
4. [Estratégia de Frontend e UX](#4-estratégia-de-frontend-e-ux)
5. [Fluxos de Dados Detalhados](#5-fluxos-de-dados-detalhados)
6. [Checklist de Implementação](#6-checklist-de-implementação)

---

## 1. Visão Geral da Nova Arquitetura

### 1.1 Filosofia Arquitetural

A nova arquitetura do RC Acervo é baseada em três pilares fundamentais:

1. **Atomicidade Garantida:** Nenhuma operação de upload pode deixar o sistema em estado inconsistente
2. **Segurança por Design:** Cada componente valida permissões independentemente
3. **Experiência Fluida:** A UI responde instantaneamente, mesmo quando o servidor processa

### 1.2 O Padrão "Ledger de Uploads"

O sistema adota um padrão de **Ledger (Livro-Razão)** para rastrear todo o ciclo de vida de um upload:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CICLO DE VIDA DO UPLOAD                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│   │  INIT    │────▶│ UPLOAD   │────▶│FINALIZE  │────▶│COMMITTED │          │
│   │  (Job)   │     │(Storage) │     │  (RPC)   │     │  (Done)  │          │
│   └──────────┘     └──────────┘     └──────────┘     └──────────┘          │
│        │                 │                │                 │               │
│        ▼                 ▼                ▼                 ▼               │
│   ┌──────────────────────────────────────────────────────────────┐        │
│   │                    TABELA upload_jobs                         │        │
│   │  ├─ id: UUID (PK)                                            │        │
│   │  ├─ status: PENDING → UPLOADING → UPLOADED → COMMITTED      │        │
│   │  ├─ object_path: determinístico                               │        │
│   │  ├─ user_id: dono do upload                                   │        │
│   │  └─ timestamps: created_at, updated_at, committed_at          │        │
│   └──────────────────────────────────────────────────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Por que Ledger?

O padrão Ledger resolve os problemas críticos identificados na arquitetura legada:

| Problema Legado | Solução com Ledger |
|-----------------|-------------------|
| Upload completa mas INSERT falha → arquivo órfão | Job em UPLOADED só é COMMITTED após transação RPC confirmar |
| Path decidido pelo frontend → conflitos | Backend gera path determinístico baseado em job_id |
| Sem rastreamento de estado → impossível debugar | Status explícito em cada etapa |
| Falha no meio do upload → estado indefinido | Retry possível consultando job existente |

### 1.3 O Padrão Transactional Outbox

Para garantir que eventos secundários (processamento de thumbnails, webhooks, auditoria) nunca sejam perdidos, usamos o padrão **Transactional Outbox**:

```
┌────────────────────────────────────────────────────────────────┐
│              TRANSACTIONAL OUTBOX PATTERN                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Quando finalize-upload commita:                               │
│                                                                 │
│   BEGIN TRANSACTION;                                            │
│     INSERT INTO media_assets (...);                            │
│     INSERT INTO catalogo_itens (...);                          │
│     UPDATE upload_jobs SET status='COMMITTED';                 │
│     INSERT INTO outbox_events (                                │
│       event_type='ASSET_COMMITTED',                            │
│       payload='{media_id, catalogo_id, ...}'                   │
│     );                                                          │
│   COMMIT;                                                       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────┐      │
│   │  outbox_events (tabela de eventos pendentes)        │      │
│   │  ├─ id: BIGSERIAL                                    │      │
│   │  ├─ event_type: tipo do evento                     │      │
│   │  ├─ aggregate_id: referência ao job/asset          │      │
│   │  ├─ payload: JSONB com dados do evento             │      │
│   │  ├─ created_at: quando ocorreu                     │      │
│   │  └─ processed_at: NULL até ser processado          │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
│   Processador assíncrono (Edge Function cron):                 │
│   - Lê eventos com processed_at IS NULL                        │
│   - Processa (gera thumbnail, envia webhook, etc.)             │
│   - Marca processed_at = NOW()                                 │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Invariante Crítico:** O evento no outbox é escrito na MESMA transação que o commit do upload. Se a transação falhar, o evento não existe → nunca haverá inconsistência.

### 1.4 Fluxo de 3 Etapas

Todo upload segue obrigatoriamente este fluxo:

#### Etapa 1: INIT (Edge Function)
```
Frontend ──POST /functions/init-upload──▶ Edge Function
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ 1. Valida JWT    │
                                    │ 2. Gera job_id   │
                                    │ 3. Cria path:    │
                                    │    uploads/      │
                                    │    {area}/       │
                                    │    {job_id}/     │
                                    │    {filename}    │
                                    │ 4. INSERT job    │
                                    │    (PENDING)     │
                                    └──────────────────┘
                                              │
Frontend ◀──{job_id, bucket, object_path}────┘
```

#### Etapa 2: UPLOAD (Direto ao Storage)
```
Frontend ──TUS/HTTP──▶ Supabase Storage
                          │
                          ▼
                ┌──────────────────┐
                │ Arquivo salvo em │
                │ object_path      │
                │ determinístico   │
                └──────────────────┘
                          │
Frontend ◀──HTTP 200─────┘
```

#### Etapa 3: FINALIZE (RPC Transacional)
```
Frontend ──POST /functions/finalize-upload──▶ Edge Function
                                                    │
                                                    ▼
                                          ┌────────────────────┐
                                          │ 1. Valida JWT      │
                                          │ 2. Verifica job    │
                                          │    existe e é do   │
                                          │    usuário         │
                                          │ 3. Verifica arquivo│
                                          │    existe no       │
                                          │    Storage         │
                                          │ 4. Chama RPC:      │
                                          │    rpc_finalize_   │
                                          │    upload()        │
                                          └────────────────────┘
                                                    │
                                          ┌─────────▼──────────┐
                                          │  RPC (Postgres)    │
                                          │  ├─ INSERT media_  │
                                          │  │   assets        │
                                          │  ├─ INSERT         │
                                          │  │   catalogo_     │
                                          │  │   itens         │
                                          │  ├─ UPDATE job     │
                                          │  │   status=       │
                                          │ │   COMMITTED     │
                                          │  └─ INSERT outbox_ │
                                          │     events         │
                                          │  (tudo em uma      │
                                          │   transação)       │
                                          └────────────────────┘
                                                    │
Frontend ◀──{catalogo_id, media_id, status}────────┘
```

---

## 2. Especificação do Banco de Dados

### 2.1 Tabela: `upload_jobs`

**Propósito:** Rastrear o ciclo de vida completo de cada upload

```sql
CREATE TABLE upload_jobs (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Localização no Storage
  bucket TEXT NOT NULL DEFAULT 'arquivos',
  object_path TEXT NOT NULL,
  
  -- Metadados do arquivo
  original_filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  checksum_sha256 TEXT,
  
  -- Estado do workflow
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'UPLOADING', 'UPLOADED', 'COMMITTED', 'FAILED', 'EXPIRED')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  committed_at TIMESTAMPTZ,
  
  -- Erro (quando status = FAILED)
  error TEXT,
  
  -- Garantias
  CONSTRAINT unique_object_path UNIQUE (object_path)
);

-- Índices críticos
CREATE INDEX idx_upload_jobs_user_created 
  ON upload_jobs(user_id, created_at DESC);
  
CREATE INDEX idx_upload_jobs_status 
  ON upload_jobs(status);
  
CREATE INDEX idx_upload_jobs_expired 
  ON upload_jobs(created_at) 
  WHERE status IN ('PENDING', 'UPLOADING', 'UPLOADED');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER upload_jobs_updated_at
  BEFORE UPDATE ON upload_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

#### Estados e Transições

| Estado | Significado | Próximos Estados |
|--------|-------------|------------------|
| `PENDING` | Job criado, aguardando upload | `UPLOADING`, `FAILED`, `EXPIRED` |
| `UPLOADING` | Upload em progresso | `UPLOADED`, `FAILED`, `EXPIRED` |
| `UPLOADED` | Arquivo no Storage, aguardando finalize | `COMMITTED`, `FAILED`, `EXPIRED` |
| `COMMITTED` | Transação completa, dados no banco | (final) |
| `FAILED` | Erro em alguma etapa | (final, pode retry) |
| `EXPIRED` | Job antigo não completado | (final, garbage collector) |

### 2.2 Tabela: `outbox_events`

**Propósito:** Garantir entrega de eventos para processamento assíncrono

```sql
CREATE TABLE outbox_events (
  id BIGSERIAL PRIMARY KEY,
  
  -- Classificação do evento
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL DEFAULT 'upload_job',
  aggregate_id UUID NOT NULL,
  
  -- Dados do evento
  payload JSONB NOT NULL DEFAULT '{}',
  
  -- Controle de processamento
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0
);

-- Índices
CREATE INDEX idx_outbox_unprocessed 
  ON outbox_events(processed_at) 
  WHERE processed_at IS NULL;
  
CREATE INDEX idx_outbox_event_type 
  ON outbox_events(event_type);
  
CREATE INDEX idx_outbox_aggregate 
  ON outbox_events(aggregate_type, aggregate_id);
```

#### Tipos de Eventos

| event_type | Quando Ocorre | Processador |
|------------|---------------|-------------|
| `ASSET_COMMITTED` | Upload finalizado com sucesso | Gerador de thumbnail |
| `THUMBNAIL_GENERATED` | Thumbnail criado | - |
| `UPLOAD_FAILED` | Upload falhou | Notificador |
| `UPLOAD_EXPIRED` | Job expirado (garbage collector) | Logger |

### 2.3 Políticas RLS (Row Level Security)

#### upload_jobs

```sql
-- Habilitar RLS
ALTER TABLE upload_jobs ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só vê seus próprios jobs
CREATE POLICY "Users can only see their own jobs"
  ON upload_jobs FOR SELECT
  USING (user_id = auth.uid());

-- Política: Usuário só cria jobs para si mesmo
CREATE POLICY "Users can only create their own jobs"
  ON upload_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Política: Usuário pode atualizar status dos próprios jobs
CREATE POLICY "Users can update their own jobs"
  ON upload_jobs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Política: Admin vê tudo (para reconciliação)
CREATE POLICY "Admins can see all jobs"
  ON upload_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### outbox_events

```sql
-- Habilitar RLS
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

-- Política: Apenas service-role/Edge Functions podem ler
CREATE POLICY "Only service role can read outbox"
  ON outbox_events FOR SELECT
  USING (false); -- Bloqueia client direto, permite via Edge Function

-- Política: Apenas service-role pode inserir
CREATE POLICY "Only service role can insert outbox"
  ON outbox_events FOR INSERT
  WITH CHECK (false);
```

**Nota:** As Edge Functions usam `service_role` key internamente (após validação JWT) para acessar o outbox.

### 2.4 Função RPC: `rpc_finalize_upload`

**Propósito:** Executar o commit transacional de forma atômica

```sql
CREATE OR REPLACE FUNCTION rpc_finalize_upload(
  p_job_id UUID,
  p_catalogo_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do dono da função
AS $$
DECLARE
  v_job upload_jobs%ROWTYPE;
  v_media_id UUID;
  v_catalogo_id INTEGER;
  v_user_id UUID;
BEGIN
  -- 1. Verificar se o job existe e pertence ao usuário
  SELECT * INTO v_job 
  FROM upload_jobs 
  WHERE id = p_job_id;
  
  IF v_job IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Job not found'
    );
  END IF;
  
  -- 2. Verificar se o usuário atual é o dono do job
  IF v_job.user_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized'
    );
  END IF;
  
  -- 3. Verificar status permitido
  IF v_job.status NOT IN ('UPLOADED', 'UPLOADING') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid job status: ' || v_job.status
    );
  END IF;
  
  -- 4. Inserir media_assets
  INSERT INTO media_assets (
    bucket,
    path,
    filename,
    mime_type,
    size_bytes,
    owner_id
  ) VALUES (
    v_job.bucket,
    v_job.object_path,
    v_job.original_filename,
    v_job.mime_type,
    v_job.size_bytes,
    v_job.user_id
  )
  RETURNING id INTO v_media_id;
  
  -- 5. Inserir catalogo_itens
  INSERT INTO catalogo_itens (
    titulo,
    descricao,
    media_id,
    area_fazenda_id,
    tipo_projeto_id,
    status_id,
    -- ... outros campos de p_catalogo_data
    created_by
  ) VALUES (
    p_catalogo_data->>'titulo',
    p_catalogo_data->>'descricao',
    v_media_id,
    (p_catalogo_data->>'area_fazenda_id')::INTEGER,
    (p_catalogo_data->>'tipo_projeto_id')::INTEGER,
    COALESCE((p_catalogo_data->>'status_id')::INTEGER, 1),
    v_job.user_id
  )
  RETURNING id INTO v_catalogo_id;
  
  -- 6. Atualizar job para COMMITTED
  UPDATE upload_jobs 
  SET 
    status = 'COMMITTED',
    committed_at = NOW()
  WHERE id = p_job_id;
  
  -- 7. Inserir evento no outbox
  INSERT INTO outbox_events (
    event_type,
    aggregate_type,
    aggregate_id,
    payload
  ) VALUES (
    'ASSET_COMMITTED',
    'upload_job',
    p_job_id,
    jsonb_build_object(
      'job_id', p_job_id,
      'media_id', v_media_id,
      'catalogo_id', v_catalogo_id,
      'user_id', v_job.user_id
    )
  );
  
  -- 8. Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'job_id', p_job_id,
    'media_id', v_media_id,
    'catalogo_id', v_catalogo_id
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, retornar sem commitar
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
```

---

## 3. Protocolos de Segurança

### 3.1 Regra Zero: Validação Obrigatória de JWT

**INVARIANTE:** Nenhuma Edge Function executa lógica de negócio antes de validar o JWT do chamador.

```typescript
// Padrão obrigatório em TODAS as Edge Functions
async function requireAuth(
  req: Request, 
  supabaseUrl: string, 
  supabaseAnonKey: string
): Promise<{ user: User | null; error?: string }> {
  
  // 1. Extrair token do header
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'MISSING_AUTH_HEADER' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // 2. Validar token com Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: 'INVALID_TOKEN' };
  }
  
  // 3. Token válido → retornar usuário
  return { user };
}
```

### 3.2 Regra de Role: Verificação de Privilégios

**INVARIANTE:** Operações privilegiadas (admin) requerem verificação explícita do role.

```typescript
async function requireRole(
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string,
  allowedRoles: string[]
): Promise<{ user: User | null; error?: string }> {
  
  // 1. Primeiro validar JWT
  const auth = await requireAuth(req, supabaseUrl, supabaseAnonKey);
  if (auth.error) return auth;
  
  // 2. Buscar role do usuário
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();
  
  // 3. Verificar se role está na whitelist
  if (!allowedRoles.includes(profile?.role)) {
    return {
      user: null,
      error: `FORBIDDEN: Required roles: ${allowedRoles.join(', ')}`
    };
  }
  
  return auth;
}
```

### 3.3 Regra de Service Role: Uso Controlado

**INVARIANTE:** A `SUPABASE_SERVICE_ROLE_KEY` nunca é exposta e só é usada após validação.

```typescript
// ❌ ERRADO: Service role sem validação
Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Perigo!
  );
  // ... qualquer um pode executar isso
});

// ✅ CERTO: Service role APÓS validação
Deno.serve(async (req) => {
  // 1. Validar JWT primeiro
  const { user, error } = await requireRole(
    req,
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    ['admin'] // Só admin pode passar
  );
  
  if (error) {
    return new Response(JSON.stringify({ error }), { status: 403 });
  }
  
  // 2. Agora sim, usar service role para operações privilegiadas
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // ... operação segura
});
```

### 3.4 Matriz de Permissões

| Operação | Role Requerido | Validação |
|----------|---------------|-----------|
| `init-upload` | `authenticated` | JWT válido |
| `finalize-upload` | `authenticated` | JWT válido + dono do job |
| `create-user` | `admin` | JWT + role admin |
| `export-localidade` | `admin`, `editor` | JWT + role |
| `reconcile-uploads` | `service-role` | Header `x-cron-secret` |

### 3.5 Headers de Segurança

Todas as Edge Functions devem retornar:

```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

---

## 4. Estratégia de Frontend e UX

### 4.1 Upload: Feedback Visual e Recuperação

#### Estados da UI

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADOS DO UPLOAD                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [SELECIONAR ARQUIVOS]                                      │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📁 arquivo.jpg    [████████░░░] 80%    [Cancelar]  │   │
│  │ 📁 video.mp4      [██████░░░░░] 60%    [Cancelar]  │   │
│  └─────────────────────────────────────────────────────┘   │
│        │                                                    │
│        ▼ (quando todos completam)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✅ Todos os arquivos enviados!                      │   │
│  │                                                     │   │
│  │ [Preencher metadados] ──▶ [Finalizar Upload]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Recuperação de Falhas

| Cenário | Comportamento |
|---------|---------------|
| Rede cai durante upload | Retry automático com TUS (resumable) |
| Token expira | Exibe modal "Sessão expirada" com botão "Reautenticar" |
| Finalize falha (500) | Mantém formulário preenchido, botão "Tentar Novamente" |
| Job expirado | Mensagem clara: "Upload expirado. Por favor, inicie novamente." |

#### Implementação do Hook

```typescript
// src/hooks/useUpload.ts
interface UploadState {
  jobId: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'finalizing' | 'completed' | 'error';
  error?: string;
}

export function useUpload() {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  
  const startUpload = async (files: File[]) => {
    // 1. Criar jobs para cada arquivo
    const jobs = await Promise.all(
      files.map(async (file) => {
        const { job_id, object_path } = await initUpload({
          original_filename: file.name,
          mime_type: file.type,
          size_bytes: file.size
        });
        return { jobId: job_id, file, progress: 0, status: 'pending' as const };
      })
    );
    
    setUploads(jobs);
    
    // 2. Fazer upload de cada arquivo
    await Promise.all(
      jobs.map(async (job, index) => {
        try {
          setUploads(prev => updateStatus(prev, job.jobId, 'uploading'));
          
          await uploadToStorage(job.file, object_path, (progress) => {
            setUploads(prev => updateProgress(prev, job.jobId, progress));
          });
          
          setUploads(prev => updateStatus(prev, job.jobId, 'uploaded'));
        } catch (error) {
          setUploads(prev => updateError(prev, job.jobId, error.message));
        }
      })
    );
  };
  
  const finalizeUploads = async (metadata: CatalogoMetadata) => {
    const uploadedJobs = uploads.filter(u => u.status === 'uploaded');
    
    await Promise.all(
      uploadedJobs.map(async (job) => {
        setUploads(prev => updateStatus(prev, job.jobId, 'finalizing'));
        
        try {
          await finalizeUpload({
            job_id: job.jobId,
            ...metadata
          });
          
          setUploads(prev => updateStatus(prev, job.jobId, 'completed'));
        } catch (error) {
          setUploads(prev => updateError(prev, job.jobId, error.message));
        }
      })
    );
  };
  
  return { uploads, startUpload, finalizeUploads };
}
```

### 4.2 Kanban: Optimistic Updates

#### Conceito

A UI atualiza **instantaneamente** quando o usuário arrasta um card. Se o servidor confirmar, o estado permanece. Se falhar, o card volta à posição original.

```
┌─────────────────────────────────────────────────────────────┐
│              OPTIMISTIC UPDATE NO KANBAN                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuário arrasta card de "Entrada" para "Catalogado":      │
│                                                             │
│  ┌─────────────┐         ┌─────────────┐                   │
│  │  Entrada    │         │ Catalogado  │                   │
│  │ ┌─────────┐ │         │ ┌─────────┐ │                   │
│  │ │ Card A  │ │   ──▶   │ │ Card A  │ │  ← UI atualiza   │
│  │ │ (saiu)  │ │         │ │ (entrou)│ │    imediatamente │
│  │ └─────────┘ │         │ └─────────┘ │                   │
│  └─────────────┘         └─────────────┘                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MUTATION (background)                              │   │
│  │  UPDATE catalogo_itens SET status_id = 2 WHERE...   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Se sucesso: ✅ Mantém estado                               │
│  Se falha:   ❌ Card volta para "Entrada" + toast de erro   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Implementação

```typescript
// src/hooks/useUpdateItem.ts
export function useUpdateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CatalogoItem> }) => {
      const { data, error } = await supabase
        .from('catalogo_itens')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    // ✅ OPTIMISTIC UPDATE
    onMutate: async ({ id, updates }) => {
      // 1. Cancelar queries pendentes
      await queryClient.cancelQueries({ queryKey: ['workflowItems'] });
      await queryClient.cancelQueries({ queryKey: ['item', id] });
      
      // 2. Salvar snapshot do estado anterior
      const previousWorkflow = queryClient.getQueryData(['workflowItems']);
      const previousItem = queryClient.getQueryData(['item', id]);
      
      // 3. Aplicar mudança otimista no cache
      queryClient.setQueryData(['workflowItems'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: CatalogoItem) =>
            item.id === id ? { ...item, ...updates } : item
          )
        };
      });
      
      queryClient.setQueryData(['item', id], (old: CatalogoItem | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });
      
      // 4. Retornar contexto para rollback
      return { previousWorkflow, previousItem };
    },
    
    // ✅ ROLLBACK EM CASO DE ERRO
    onError: (err, { id }, context) => {
      console.error('Update failed:', err);
      
      // Restaurar estado anterior
      if (context?.previousWorkflow) {
        queryClient.setQueryData(['workflowItems'], context.previousWorkflow);
      }
      if (context?.previousItem) {
        queryClient.setQueryData(['item', id], context.previousItem);
      }
      
      // Notificar usuário
      toast.error('Falha ao atualizar. Alterações revertidas.');
    },
    
    // ✅ SINCRONIZAR APÓS SUCESSO
    onSettled: (data, error, { id }) => {
      // Invalidar queries para garantir consistência (em background)
      queryClient.invalidateQueries({ 
        queryKey: ['workflowItems'],
        refetchType: 'none'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['item', id],
        refetchType: 'none'
      });
      
      // Refetch silencioso após 2s
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ['workflowItems'],
          exact: false,
          type: 'active'
        });
      }, 2000);
    }
  });
}
```

### 4.3 Realtime (Opcional)

Para atualizações ao vivo quando outro usuário modifica um item:

```typescript
// src/hooks/useWorkflowRealtime.ts
export function useWorkflowRealtime() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const subscription = supabase
      .channel('workflow_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'catalogo_itens'
        },
        (payload) => {
          // Invalidar cache quando outro usuário alterar
          queryClient.invalidateQueries({ queryKey: ['workflowItems'] });
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
}
```

---

## 5. Fluxos de Dados Detalhados

### 5.1 Sequência: Upload Completo (Sucesso)

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Frontend│     │ Edge: init  │     │   Storage   │     │Edge:finalize│
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
     │                 │                   │                   │
     │ 1. POST init    │                   │                   │
     │────────────────▶│                   │                   │
     │                 │                   │                   │
     │                 │ 2. INSERT job     │                   │
     │                 │    (PENDING)      │                   │
     │                 │───────────────────┼──────────────────▶│
     │                 │                   │                   │
     │ 3. {job_id,     │                   │                   │
     │    object_path} │                   │                   │
     │◀────────────────│                   │                   │
     │                 │                   │                   │
     │ 4. TUS Upload   │                   │                   │
     │────────────────────────────────────▶│                   │
     │                 │                   │                   │
     │                 │ 5. UPDATE job     │                   │
     │                 │    (UPLOADED)     │                   │
     │                 │───────────────────┼──────────────────▶│
     │                 │                   │                   │
     │ 6. HTTP 200     │                   │                   │
     │◀────────────────────────────────────│                   │
     │                 │                   │                   │
     │ 7. POST finalize│                   │                   │
     │    + metadados  │                   │                   │
     │────────────────────────────────────────────────────────▶│
     │                 │                   │                   │
     │                 │                   │ 8. RPC transação  │
     │                 │                   │    - INSERT media │
     │                 │                   │    - INSERT catálogo│
     │                 │                   │    - UPDATE job   │
     │                 │                   │    - INSERT outbox│
     │                 │                   │                   │
     │ 9. {success,    │                   │                   │
     │    catalogo_id} │                   │                   │
     │◀────────────────────────────────────────────────────────│
     │                 │                   │                   │
```

### 5.2 Sequência: Upload (Falha no Finalize)

```
┌─────────┐     ┌─────────────┐     ┌─────────────────┐
│ Frontend│     │Edge:finalize│     │  RPC (Postgres) │
└────┬────┘     └──────┬──────┘     └────────┬────────┘
     │                 │                     │
     │ 1. POST finalize│                     │
     │    + metadados  │                     │
     │────────────────▶│                     │
     │                 │                     │
     │                 │ 2. Chama RPC        │
     │                 │────────────────────▶│
     │                 │                     │
     │                 │                     │ 3. ERRO!
     │                 │                     │    (constraint,
     │                 │                     │     timeout...)
     │                 │                     │
     │                 │ 4. Rollback         │
     │                 │◀────────────────────│
     │                 │                     │
     │ 5. {success:    │                     │
     │    false,       │                     │
     │    error}       │                     │
     │◀────────────────│                     │
     │                 │                     │
     │ 6. UI mantém    │                     │
     │    formulário   │                     │
     │    (retry possível)                   │
     │                 │                     │
```

### 5.3 Sequência: Garbage Collector

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cron Job  │     │Edge:reconcile│    │   Storage   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. Trigger        │                   │
       │    (diário)       │                   │
       │──────────────────▶│                   │
       │                   │                   │
       │                   │ 2. SELECT jobs    │
       │                   │    WHERE status   │
       │                   │    IN (PENDING,   │
       │                   │          UPLOADING│
       │                   │          UPLOADED)│
       │                   │    AND created_at │
       │                   │    < NOW() - 24h  │
       │                   │                   │
       │                   │ 3. Para cada job: │
       │                   │                   │
       │                   │ 4. Verifica se    │
       │                   │    arquivo existe │
       │                   │──────────────────▶│
       │                   │                   │
       │                   │ 5. Se existe:     │
       │                   │    DELETE arquivo │
       │                   │──────────────────▶│
       │                   │                   │
       │                   │ 6. UPDATE job     │
       │                   │    status=EXPIRED │
       │                   │                   │
       │ 7. Log: {scanned, │                   │
       │    expired,       │                   │
       │    deleted}       │                   │
       │◀──────────────────│                   │
       │                   │                   │
```

---

## 6. Checklist de Implementação

### FASE 1: Banco de Dados e RPC

- [x] Criar migration com `upload_jobs` e `outbox_events`
- [x] Criar índices necessários
- [x] Criar função RPC `rpc_finalize_upload`
- [x] Configurar RLS policies
- [x] Testar RPC isoladamente

### FASE 2: Edge Functions

- [x] Implementar `init-upload` com validação JWT
- [x] Implementar `finalize-upload` chamando RPC
- [x] Implementar `reconcile-uploads` com cron secret
- [x] Criar módulo compartilhado `_shared/auth.ts`
- [x] Testar fluxo completo via curl/Postman

### FASE 3: Frontend

- [x] Criar hook `useUpload` com gerenciamento de estado
- [x] Refatorar `UploadPage` para fluxo de 3 etapas
- [x] Implementar feedback visual de progresso
- [x] Implementar retry em caso de falha
- [x] Testar cenários de erro

### FASE 4: Kanban

- [x] Refatorar `useUpdateItem` com optimistic updates
- [x] Implementar rollback em caso de erro
- [x] Adicionar toasts de feedback
- [x] Testar drag-and-drop rápido
- [x] (Opcional) Implementar Realtime

### FASE 5: Segurança

- [x] Auditar todas as Edge Functions
- [x] Verificar que nenhuma expõe service role
- [x] Testar RLS policies com usuários diferentes
- [x] Verificar headers de segurança
- [x] Fazer pentest básico

---

## Apêndice A: Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Tabelas | snake_case, plural | `upload_jobs`, `outbox_events` |
| Colunas | snake_case | `created_at`, `object_path` |
| Edge Functions | kebab-case | `init-upload`, `finalize-upload` |
| Funções RPC | snake_case com prefixo | `rpc_finalize_upload` |
| Hooks React | camelCase com prefixo use | `useUpload`, `useUpdateItem` |
| Tipos TypeScript | PascalCase | `UploadState`, `CatalogoItem` |

## Apêndice B: Códigos de Erro

| Código | Significado | Ação do Frontend |
|--------|-------------|------------------|
| `MISSING_AUTH_HEADER` | Token não fornecido | Redirecionar para login |
| `INVALID_TOKEN` | Token expirado ou inválido | Redirecionar para login |
| `FORBIDDEN` | Usuário sem permissão | Mostrar erro e log |
| `JOB_NOT_FOUND` | Job ID não existe | Criar novo job |
| `JOB_EXPIRED` | Job passou do prazo | Criar novo job |
| `INVALID_STATUS` | Status não permite operação | Verificar estado atual |
| `FILE_NOT_FOUND` | Arquivo não existe no Storage | Recomeçar upload |
| `TRANSACTION_FAILED` | Erro na transação RPC | Tentar novamente |

---

**Fim do Documento**

*Este documento é a especificação técnica definitiva para a modernização do RC Acervo. Qualquer implementação deve seguir estas diretrizes para garantir consistência, segurança e qualidade.*
