# 🐳 DOCKER + SUPABASE SETUP - SEMANA 2 FASE 2

**Status:** ✅ Build/Test/Lint PASSANDO - Aguardando Docker para validação final

---

## ✅ JÁ VALIDADO (SEM DOCKER)

```bash
✅ npm run lint       → OK
✅ npm run test       → 18/18 passando
✅ npm run build      → Sucesso
```

---

## 🐳 PRÓXIMO PASSO: DOCKER + SUPABASE LOCAL

### 1️⃣ Ativar Docker Desktop

```bash
# Windows/Mac
Abrir: Docker Desktop (aplicativo)
Aguardar: Status = "running" (pode demorar 30-60 segundos)

# Verificar
docker version
# Deve retornar: Docker version 24.x.x ou similar
```

### 2️⃣ Validar .env.local

**Arquivo:** `frontend/.env.local`

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP3sSgf0ReJst7z8cj2AFCF1DgltiMN9o-HC2W22w
```

✅ Arquivo já foi criado automaticamente

### 3️⃣ Iniciar Supabase Local

```bash
cd BIBLIOTECA  # (ou onde está o projeto)

# Iniciar Supabase
supabase start

# Esperado na saída:
# Started supabase local development server
# API URL: http://127.0.0.1:54321
# Database URL: postgresql://...
# anon key: [sua chave]
# Service role key: [sua chave]
```

### 4️⃣ Validar Conectividade (Nova terminal)

```bash
cd frontend

# Dev server
npm run dev
# Abrir: http://localhost:5173

# Verificar console:
# Deve conectar sem erros de Supabase
```

### 5️⃣ Testes de Conectividade (Opcional)

```bash
# Terminal com Supabase rodando
curl http://127.0.0.1:54321/rest/v1/

# Resposta esperada:
# {"version":"14.1.0",...}
```

---

## 🚦 CHECKLIST FINAL

- [ ] Docker Desktop ativado (docker version OK)
- [ ] .env.local presente em frontend/
- [ ] `supabase start` iniciado com sucesso
- [ ] `npm run dev` conecta sem erros
- [ ] Console não mostra erros de Supabase
- [ ] Teste de conectividade curl OK (opcional)

---

## 📊 DEPOIS DE VALIDAR TUDO

```bash
# Todos os testes devem passar
npm run lint     ✅
npm run test     ✅ (18/18)
npm run build    ✅
supabase start   ✅
npm run dev      ✅

# Resultado: ✅ GO para Semana 3
```

---

## 🆘 TROUBLESHOOTING

### Docker não inicia
```bash
# Reiniciar Docker Desktop
# Ou em terminal admin:
docker ps  # Se retornar erro, Docker não está rodando

# Solução: Abrir Docker Desktop novamente e aguardar
```

### Supabase start falha
```bash
# Verificar Docker está rodando
docker ps

# Se Docker OK, tentar limpar
supabase stop
supabase start  # Novo início
```

### Frontend não conecta ao Supabase
```bash
# Verificar .env.local
cat frontend/.env.local

# URL deve ser: http://127.0.0.1:54321
# (exatamente assim)

# Reiniciar dev server
npm run dev
```

### Porta 54321 em uso
```bash
# Ver o que usa a porta
netstat -ano | findstr :54321

# Parar Supabase
supabase stop

# Liberar porta e reiniciar
supabase start
```

---

## ✨ STATUS FINAL

**Quando tudo estiver validado:**

```
✅ npm run lint       → OK
✅ npm run test       → 18/18 OK
✅ npm run build      → OK
✅ Supabase local     → Rodando
✅ npm run dev        → Conecta OK
✅ Conexão Banco      → Validada

= ✅ SEMANA 2 APROVADA = GO PARA SEMANA 3
```

---

**Tempo estimado:** 10-15 minutos (incluindo download Docker)

Quando Docker estiver ativo e Supabase rodando, envie confirmação para validação final.
