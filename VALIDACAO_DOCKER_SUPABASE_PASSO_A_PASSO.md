# Validação Docker + Supabase Local - Guia Passo a Passo

## Status Atual
✅ **Semana 2 - Código-base pronto**
- 10 componentes React criados
- 12 hooks React Query implementados
- Testes: 18/18 passando
- Lint: Limpo
- Build: Sucesso

⏳ **Bloqueio Atual**: Docker não ativo para validação Supabase

---

## PASSO 1: Ativar Docker Desktop

**Ação Windows:**
1. Clique no botão Iniciar (Windows)
2. Digite: `Docker Desktop`
3. Abra a aplicação
4. Aguarde até que o ícone de baleia apareça na bandeja do sistema (canto inferior direito)
5. Status esperado: "Docker is running"

**Tempo estimado**: 30-60 segundos

**Sinais de sucesso**:
- Ícone da baleia visível na bandeja
- Sem mensagens de erro
- Permissão WSL 2 confirmada (se solicitada)

---

## PASSO 2: Validar Docker Status

Quando Docker estiver ativo, abra um terminal (cmd ou PowerShell) e execute:

```bash
docker --version
```

**Saída esperada**:
```
Docker version 25.x.x, build xxxxx
```

---

## PASSO 3: Iniciar Supabase Local

No mesmo terminal, navegue para `frontend` e inicie Supabase:

```bash
cd frontend
supabase start
```

**O que vai acontecer**:
1. Supabase irá puxar imagens Docker (PostgreSQL, realtime, etc.)
2. Demora ~60 segundos na primeira execução
3. Ao final, mostra credenciais de conexão

**Saída esperada ao final**:
```
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
DB URL: postgresql://postgres:postgres@127.0.0.1:5432/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
```

**Arquivo de credenciais**: `../.supabase/env.local` (gerado automaticamente)

---

## PASSO 4: Validar Conexão Frontend

Em um **NOVO terminal** (mantendo Supabase rodando), execute:

```bash
cd frontend
npm run dev
```

**O que procurar**:
- Servidor iniciando em `http://localhost:5173`
- **NÃO deve haver erros de conexão** no console
- Mensagens esperadas:
  ```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ```

**Se houver erro de conexão Supabase**:
```
Error: Failed to connect to Supabase at http://127.0.0.1:54321
```
→ Verifique se `supabase start` completou com sucesso no outro terminal

---

## PASSO 5: Testar Funcionalidade Biblioteca

Abra navegador em `http://localhost:5173` e:

1. **Verificar carregamento da página**
   - Header visível
   - SearchBar renderizando
   - FilterPanel sidebar aparecendo

2. **Testar Search**
   - Digite algo na SearchBar
   - Deve debounce 300ms antes de buscar
   - Sem erros no console

3. **Testar Filters**
   - Abra FilterPanel
   - Selecione categorias
   - Mude visualização (grid/list/compact)
   - Deve mudar instantaneamente

4. **Verificar Console**
   - Pressione `F12` → Console
   - Não deve haver erros em vermelho
   - Apenas avisos de TypeScript são ok

---

## PASSO 6: Testes Automatizados (com Docker ativo)

Em um **terceiro terminal**, execute testes com Docker rodando:

```bash
cd frontend
npm run test
```

**Resultado esperado**:
```
✓ 18 tests passed
  Coverage: >70%
```

---

## PASSO 7: Parar Supabase (quando finalizar)

Para limpar os containers Docker:

```bash
supabase stop
```

Ou para resetar completamente:

```bash
supabase stop --no-backup
```

---

## Troubleshooting

### Docker não inicia
- **Erro**: "Docker daemon not running"
- **Solução**: Reinicie Docker Desktop completamente (Menu Windows → Close → Reabrir)

### Supabase não conecta
- **Erro**: "Cannot connect to Supabase"
- **Solução**: Verifique se `supabase start` completou com sucesso antes de rodar `npm run dev`

### Porta 5173 em uso
- **Erro**: "Port 5173 already in use"
- **Solução**: Mude para outra porta: `npm run dev -- --port 5174`

### .env.local não carregado
- **Erro**: Variáveis de ambiente indefinidas no app
- **Solução**: Reinicie `npm run dev` após criar `.env.local`

---

## Checklist de Validação Final

Antes de confirmar GO para Semana 3:

- [ ] Docker Desktop ativado e rodando
- [ ] `docker --version` retorna versão válida
- [ ] `supabase start` executa sem erros
- [ ] `npm run dev` inicia sem erros de conexão Supabase
- [ ] Biblioteca carrega em `http://localhost:5173`
- [ ] SearchBar debounce funciona
- [ ] FilterPanel muda views instantaneamente
- [ ] Console browser sem erros em vermelho
- [ ] `npm run test` passa 18/18 testes
- [ ] Build production: `npm run build` sucesso

---

## Sinais de "PRONTO PARA SEMANA 3"

✅ Quando todos os itens acima forem confirmados:
- Validação Supabase local = COMPLETA
- Semana 2 = APROVADA
- Pode iniciar **SEMANA 3: MuseumViewer 3D + GIS Map + Dashboard**

**Tempo estimado total**: 3-5 minutos (Docker + Supabase + validação)

---

**Data de criação**: 2026-02-06 02:55 UTC
**Status**: Aguardando ativação Docker pelo usuário
