# GUIA: Setup Supabase Local com Docker

**Data:** 2026-02-06  
**Fase:** Fase 2 - Semana 1, Tarefa 1.3  
**Status:** Pronto para Execução

---

## ✅ Pré-requisitos Verificados

- [x] Supabase CLI instalado (versão 2.75.0+)
- [x] Docker Desktop instalado
- [x] Node.js 18+ com npm
- [x] Arquivo `frontend/.env.local` criado com credenciais
- [x] Arquivo `supabase/config.toml` já existe

---

## 🚀 PASSO A PASSO

### 1. Verificar Pré-requisitos (5 minutos)

```bash
# Verificar Supabase CLI
supabase --version
# Esperado: supabase-cli/2.75.0 ou superior

# Verificar Docker
docker --version
# Esperado: Docker version 24.x ou superior

# Verificar Node.js
node --version
# Esperado: v18.0.0 ou superior

# Verificar npm
npm --version
# Esperado: 9.0.0 ou superior
```

Se algum comando falhar:
- **Supabase CLI:** `npm install -g supabase@latest`
- **Docker:** Baixar em https://www.docker.com/products/docker-desktop
- **Node.js:** Baixar em https://nodejs.org/

---

### 2. Iniciar Supabase Local (10 minutos)

```bash
# Navegar ao diretório raiz do projeto
cd C:\Users\rober\Downloads\BIBLIOTECA

# Iniciar Supabase local (com Docker)
supabase start

# Output esperado (pode levar 2-3 minutos):
# ================================================
# Starting Docker containers...
# Waiting for supabase services to be healthy...
# 
# ✓ Local development setup is running
# 
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
# JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ================================================
```

**⚠️ Importante:**
1. Copie o `anon key` completo
2. Atualize `frontend/.env.local` com a chave real:
   ```
   VITE_SUPABASE_ANON_KEY=<anon_key_aqui>
   ```

---

### 3. Verificar Docker Containers

```bash
# Ver containers rodando
docker ps

# Esperado: Deve aparecer container "supabase-db"
# CONTAINER ID   IMAGE                    STATUS
# abc123...      supabase/postgres:...   Up 2 minutes
```

---

### 4. Acessar Supabase Studio (Local)

**URL:** http://localhost:54323

**Credenciais:**
- Email: `supabase`
- Senha: `password` (padrão)

**O que você verá:**
- Dashboard com tabelas criadas
- Editor SQL para migrations
- Browser de dados
- Autenticação users

---

### 5. Aplicar Migrations (Schema Creation)

**Opção A: Via Supabase Studio (Manual)**

1. Abrir http://localhost:54323
2. Ir para "SQL Editor"
3. Copiar SQL de `docs/SUPABASE_SCHEMA_DESIGN_FASE_2.md`
4. Colar e executar

**Opção B: Via CLI (Automático)**

```bash
# Criar nova migration
supabase migration new create_fase2_schema

# Isso cria arquivo em supabase/migrations/
# Editar esse arquivo e adicionar seu SQL

# Aplicar migration
supabase db reset

# Verificar status
supabase migration list
```

---

### 6. Conectar React App ao Supabase Local

```bash
# Terminal 1: Iniciar Supabase
cd C:\Users\rober\Downloads\BIBLIOTECA
supabase start

# Terminal 2: Iniciar React dev server
cd C:\Users\rober\Downloads\BIBLIOTECA\frontend
npm run dev

# Abrir http://localhost:5173
```

---

### 7. Verificar Conectividade

**Em `frontend/src/App.tsx`, adicionar teste:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Erro ao conectar:', error.message)
  } else {
    console.log('✅ Conectado ao Supabase:', data)
  }
}

testConnection()
```

**Console esperado:**
```
✅ Conectado ao Supabase: []
```

---

## 🛑 PARAR SUPABASE LOCAL

```bash
# Para tudo
supabase stop

# Ou remover containers (limpar tudo)
supabase stop --no-backup
```

---

## 🐛 TROUBLESHOOTING

### Docker não inicia
```bash
# Reiniciar Docker Desktop
# ou via PowerShell (Windows):
wsl --list --verbose  # Verificar WSL2
docker system prune    # Limpar containers/images
```

### Porta 54321 já está em uso
```bash
# Encontrar processo usando a porta
netstat -ano | findstr :54321

# Matar processo
taskkill /PID <PID> /F

# Ou usar porta diferente no config
supabase start --use-port 54332
```

### Erro: "Cannot connect to Docker daemon"
```bash
# Verificar se Docker está rodando
docker --version

# Se não funcionar:
# 1. Abrir Docker Desktop
# 2. Esperar inicializar
# 3. Tentar novamente
```

### anon key não funciona
```bash
# Gerar nova chave
supabase status

# Copiar "anon key" do output
# Atualizar em frontend/.env.local
# Reiniciar: npm run dev
```

---

## 📋 CRITÉRIOS DE ACEITAÇÃO (Tarefa 1.3)

- [x] Supabase CLI instalado (`supabase --version` ≥ 2.75.0)
- [x] Arquivo `supabase/config.toml` existe
- [ ] Docker container `supabase-db` rodando (ao executar `supabase start`)
- [ ] Studio acessível em `http://localhost:54323`
- [ ] Database conectado em `localhost:54322`
- [ ] Arquivo `frontend/.env.local` com credenciais corretas
- [ ] React app pode conectar ao Supabase local
- [ ] Migrations aplicadas (schema Fase 2 criado)

---

## ⏭️ PRÓXIMOS PASSOS

Após completar este setup:

1. **Semana 1 (agora):**
   - ✅ Tarefa 1.1: React app criado ✓
   - ✅ Tarefa 1.2: Schema design documentado ✓
   - ⏳ Tarefa 1.3: Supabase local rodando (este guia)

2. **Semana 2:**
   - Criar componentes React (SearchBar, FilterPanel, etc)
   - Implementar Biblioteca Digital com busca/filtro
   - Integração com Supabase

3. **Semana 3:**
   - Integrar Three.js para 3D Museum
   - Integrar Leaflet para mapa GIS

4. **Semana 4:**
   - API endpoints
   - Testes unitários
   - GO/NO-GO final

---

**Status:** 🟡 Pendente Execução Manual (Docker) → Seguir guia acima

**Contato:** Technical Lead (Roo) - roo@codigo.com
