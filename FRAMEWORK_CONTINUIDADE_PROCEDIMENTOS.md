# 📋 FRAMEWORK DE CONTINUIDADE - PROCEDIMENTOS PASO-A-PASO
## Implementação Prática da Metodologia

**Versão:** 1.0  
**Data:** 6 de Fevereiro de 2026  
**Responsável:** Roo (Technical Lead)  
**Audience:** Arquiteto + Executor + Validador Externo

---

## 🎯 VISÃO GERAL DO FLUXO

```
┌──────────────────────────────────────────────────────────────────┐
│                      CICLO DE ENTREGA SEMANAL                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  QUINTA ANTERIOR (Dia -2)                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. AUDITORIA EXTERNA (2 dias úteis)                      │   │
│  │    - Revisor técnico testa build, deploy, funcionalidades│   │
│  │    - Encontra achados (críticos, altos, médios)         │   │
│  │    - Gera relatório com severidade + evidence            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  SEXTA (Dia -1)                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 2. REMEDIATION (4h máximo)                               │   │
│  │    - Executor prioriza: P0 (críticos) primeiro           │   │
│  │    - Implementa fixes                                    │   │
│  │    - Validator re-testa antes de sexta à noite          │   │
│  │                                                             │   │
│  │ 3. APPROVAL & REPORTING                                  │   │
│  │    - Stakeholder aprova deliverables da semana          │   │
│  │    - Arquiteto finaliza plano para próxima semana       │   │
│  │    - Lições aprendidas extraídas                        │   │
│  │    - Git: tags de release, todos commits clean          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  SEGUNDA (Dia 1)                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 4. KICKOFF MEETING (1h)                                  │   │
│  │    Presentes: Arquiteto + Executor + Stakeholder        │   │
│  │                                                             │   │
│  │    Agenda:                                                │   │
│  │    - 15 min: Recap S1, confirmar bloqueadores resolvidos│   │
│  │    - 30 min: Walkthrough do plano S2                    │   │
│  │    - 10 min: Validar recursos + dependências            │   │
│  │    - 5 min: Priorização de P1 se houver conflito        │   │
│  │    - Decision: "GO" ou "STOP & FIX"                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  TER-QUA (Dias 2-5)                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 5. EXECUÇÃO DISCIPLINADA (25h)                           │   │
│  │    - Executor: development, testes, commits disciplinados│   │
│  │    - Daily: Report 18:00 com [DONE] [IN_PROGRESS]       │   │
│  │    - Blocker: Escalado imediatamente ao Arquiteto      │   │
│  │    - Build: npm run build SEMPRE passando antes de push │   │
│  │    - Testes: npm run test antes de commit                │   │
│  │    - TypeScript: tsc -b deve passar (0 errors)          │   │
│  │                                                             │   │
│  │    Breakpoints de validação:                             │   │
│  │    - Terça, 12:00: Checkpoint with Architect           │   │
│  │    - Quarta, 12:00: Checkpoint with Architect           │   │
│  │    - Quinta, 16:00: Code review antes de Auditoria      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  (volta ao QUINTA ANTERIOR para próxima semana)                  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST PRÉ-KICKOFF (ANTES DE CADA SEMANA)

### Executor: Verificar Ambiente Local (30 min, segunda 08:00)

- [ ] Git status limpo: `git status` → nothing to commit
- [ ] Branch correto: `git branch -a` → estou em `main`
- [ ] Código atualizado: `git pull origin main` → 0 conflicts
- [ ] Node version correta: `node -v` → v18.x ou v20.x
- [ ] Dependências instaladas: `npm install` → 0 vulnerabilities
- [ ] Build passa: `npm run build` → ✅ `dist/` criado, 0 errors
- [ ] TypeScript válido: `npm run type-check` (ou `tsc -b`) → 0 errors
- [ ] Testes passam: `npm run test` → ✅ 100% passing
- [ ] Eslint clean: `npm run lint` → 0 errors, 0 warnings
- [ ] App roda: `npm run dev` → localhost:5173 funcional, sem console errors

### Arquiteto: Validar Plano Documentado (1h, segunda 08:30)

- [ ] Plano escrito: `PLANO_EXECUCAO_SEMANA_N.md` existe no repo
- [ ] 3+ entregáveis definidos com critérios de aceição específicos
- [ ] Dependências críticas mapeadas (Docker, Blender, GIS, APIs externas)
- [ ] Recursos confirmados (ambientes, conta de teste, dados seed)
- [ ] Riscos documentados: 1) Impacto, 2) Probabilidade, 3) Mitigação
- [ ] Tasks decompostas em ciclos ≤ 8h cada
- [ ] Alocação de tempo: Executor confirmou disponibilidade

### Validador: Confirmar Stakeholder Alignment (15 min, segunda 08:45)

- [ ] Stakeholder leu resumo executivo do plano
- [ ] Prioridades P0/P1 alinhadas com objetivos de negócio
- [ ] Aprovação verbal: "Vamos em frente com S2"
- [ ] Calendário: Quinta tarde (auditoria) + sexta tarde (validation) reservados

---

## 📄 TEMPLATE DE ENTREGA (RELATÓRIO PADRÃO)

### Estrutura Obrigatória

Cada deliverable deve ser acompanhado de um relatório seguindo este template:

```markdown
# 📊 RELATÓRIO DE EXECUÇÃO - SEMANA [N]

**Projeto:** Mundo Virtual Villa Canabrava
**Fase:** [X] ([Descrição])
**Semana:** [N] / [Total]
**Período:** [Data início] - [Data fim]
**Responsável:** [Nome do Executor]
**Status:** [✅ COMPLETO | 🟡 PARCIAL | ❌ BLOQUEADO]

---

## 📈 RESUMO EXECUTIVO

### Objetivo da Semana
[1-2 sentenças: O que foi planejado? Por quê?]

### Resultado Alcançado
**Status:** [🟢 SUCESSO | 🟡 PARCIAL | 🔴 CRÍTICO]

[Resumo: O que foi entregue? % de conclusão?]

---

## 🎯 DELIVERABLES

### Tarefa [X.Y]: [Nome da Tarefa]

**Status:** [✅ COMPLETO | ⚠️ EM REVISÃO | ❌ BLOQUEADO]

**Entregáveis:**
- [ ] Arquivo/Componente 1 criado
- [ ] Arquivo/Componente 2 criado
- [ ] Testes escritos (% cobertura)
- [ ] Documentação atualizada

**Critérios de Aceição:**

| Critério | Status | Evidência |
|----------|--------|-----------|
| Requisito 1 | ✅/⚠️/❌ | Link/commit/arquivo |
| Requisito 2 | ✅/⚠️/❌ | Link/commit/arquivo |
| Build passando | ✅/⚠️/❌ | `npm run build` passed |
| TypeScript válido | ✅/⚠️/❌ | `tsc -b` passed |
| Testes > 80% | ✅/⚠️/❌ | vitest coverage report |

**Commit(s) Principal(is):**
- `[CATEGORY] Message` - Hash: abc123...

---

## 📋 CHECKLIST FINAL

- [ ] Build: `npm run build` ✅ (0 errors)
- [ ] TypeScript: `tsc -b` ✅ (0 errors)
- [ ] Testes: `npm run test` ✅ (% passing)
- [ ] Linting: `npm run lint` ✅ (0 errors)
- [ ] Documentação: [files] atualizada
- [ ] Git: Commits limpos, mensagens descritivas
- [ ] Pronto para Auditoria Externa: SIM/NÃO

---

## 🚧 BLOQUEADORES (se houver)

### [P0 | P1 | P2] - [Título do Bloqueador]

**Descrição:** [O que está bloqueando?]
**Impacto:** [Quem/o que é afetado?]
**Tentativas:** [O que já foi tentado?]
**Próximas ações:** [Plano para resolver?]
**ETA:** [Quando será resolvido?]

---

## 📚 LIÇÕES APRENDIDAS

- **Lição 1:** [Situação] → [Erro] → [Mudança]
- **Lição 2:** [Situação] → [Erro] → [Mudança]

---

## 📅 PRÓXIMOS PASSOS

- [ ] Auditoria externa (quinta)
- [ ] Remediation se necessário (sexta)
- [ ] Aprovação final (sexta à noite)
- [ ] Próxima semana: [Resumo de S+1]

---

*Relatório preparado por: [Executor]
Data: [Data de submissão]
Validado por: [Revisor/Arquiteto]*
```

---

## 🔐 PROTOCOLO DE VALIDAÇÃO EXTERNA

### Inputs para Auditor

1. **Código:** Acesso a GitHub repo (branch main, build última)
2. **Ambiente:** Deploy preparado (localhost ou staging)
3. **Especificação:** Plano escrito + critérios de aceição + lista de features
4. **Checklist:** Template de itens a validar (ver abaixo)

### Checklist do Auditor (4-6h)

**Bloco 1: Arquitetura & Design (1h)**
- [ ] Decisões de design documentadas vs implementadas?
- [ ] Schema/API design matches especificação?
- [ ] Padrões de código consistentes (linting passed)?
- [ ] Documentação código: JSDoc, README, comments claros?

**Bloco 2: Build & Deployment (1h)**
- [ ] `npm install` sem vulnerabilities críticas?
- [ ] `npm run build` 0 errors, executa < 2min?
- [ ] `npm run test` todos testes passando?
- [ ] TypeScript strict mode validando? `tsc -b` → 0 errors?
- [ ] Vercel/deploy config apontando para artefato correto?

**Bloco 3: Funcionalidade & UX (1.5h)**
- [ ] App roda em browser sem console errors?
- [ ] Todas features listadas no plano funcionam?
- [ ] CRUD completo: Create/Read/Update/Delete (se aplicável)?
- [ ] Busca/filtros/paginação funcionam?
- [ ] Mobile responsive? (iPhone + iPad widths)
- [ ] Acessibilidade: tab navigation, label, ARIA? (básico)

**Bloco 4: Data & Database (1h)**
- [ ] Schema matches migrations de código?
- [ ] RLS policies em lugar (não `select * from`)?
- [ ] CRUD testa com dados reais, não mocks?
- [ ] Performance: queries < 1s (sem N+1)?
- [ ] Soft delete/archiving implementado (se requerido)?

**Bloco 5: Segurança (0.5h)**
- [ ] API keys: não commitadas, em .env.local (gitignored)?
- [ ] JWT/Auth: verify_jwt enabled em production?
- [ ] CORS: restringido a domínio correto (não `*`)?
- [ ] Input validation: frontend + backend?
- [ ] SQL injection: usando parameterized queries (não string concat)?

**Bloco 6: Testing & Coverage (0.5h)**
- [ ] Unit tests criados para componentes críticos?
- [ ] Coverage > 70% (aspira 80%)?
- [ ] Testes passam: `npm run test -- --reporter=verbose`?
- [ ] Integração testes: componente + API mock?

### Saída do Auditor

```markdown
# 🔍 RELATÓRIO DE AUDITORIA EXTERNA

**Data:** [Data da auditoria]
**Auditor:** [Nome + Expertise]
**Time Spent:** [4-6h]
**Status Geral:** [✅ APROVADO | 🟡 APROVADO com RESERVAS | ❌ REPROVADO]

---

## 🎯 ACHADOS POR SEVERIDADE

### 🔴 CRÍTICO ([N] achados) - BLOQUEIA APROVAÇÃO

| ID | Título | Descrição | Impacto | Evidence | Remediação |
|----|--------|-----------|---------|----------|-----------|
| C1 | [Título] | [Descrição] | [Alto/Total] | [Link/file:line] | [Proposta fix] |

### 🟠 ALTO ([N] achados) - DEVE ser resolvido, pode aguardar

| ID | Título | Descrição | Evidence | Remediação |
|----|--------|-----------|----------|-----------|
| H1 | [Título] | [Descrição] | [Link/file:line] | [Proposta fix] |

### 🟡 MÉDIO ([N] achados) - Adiável, mas prefira resolver

| ID | Título | Evidence | Remediação |
|----|--------|----------|-----------|
| M1 | [Título] | [Link] | [Proposta fix] |

---

## ✅ PONTOS POSITIVOS

- [Ponto 1: O que funcionou bem?]
- [Ponto 2: Qualidade code, testes, documentation?]

---

## 🚀 RECOMENDAÇÕES

- [Rec 1: Para próxima semana?]
- [Rec 2: Para scaling?]

---

Relatório assinado por: [Auditor]
```

---

## ✅ CRITÉRIOS DE APROVAÇÃO (DEFINIDOS, NÃO AMBÍGUOS)

### Critério 1: BUILD INTEGRIDADE

**Padrão:**
- `npm install` → 0 vulnerabilities críticas
- `npm run build` → executa < 3 min, 0 errors, dist/ criado
- `npm run test` → 100% testes passando
- `npm run lint` → 0 errors, 0 warnings
- `tsc -b` (ou `npm run type-check`) → 0 TypeScript errors

**Status de Aceição:** ✅ PASS ou ❌ FAIL (binário)

### Critério 2: FUNCIONALIDADE COMPLETA

**Padrão:**
- Todas features descritas no plano funcionam end-to-end
- CRUD: C (create), R (read), U (update), D (delete) testados manualmente
- Busca/filtros/paginação: testados em browser com dados reais
- Testes automatizados: > 70% cobertura, idealmente > 80%

**Status de Aceição:** ✅ PASS ou 🟡 PASS (com reservas, se P2 incompleto) ou ❌ FAIL

### Critério 3: CONFORMIDADE DOCUMENTAÇÃO

**Padrão:**
- Plano escrito antes de execução: ✅ existe
- Relatório de execução completo: ✅ todos critérios listados
- JSDoc em funções/componentes críticos: ✅ presentes
- README ou arquivo design para features complexas: ✅ presente
- Commits descritivos: ✅ [CATEGORY] Objetivo: Detalhes

**Status de Aceição:** ✅ PASS ou ❌ FAIL

### Critério 4: SEGURANÇA BÁSICA

**Padrão:**
- API keys/secrets: NÃO commitadas, em .env.local
- RLS policies: enabled em produção (não disabled)
- Verificação JWT: enabled (not false)
- CORS: restringido a domínio (not `*`)
- Input validation: presente frontend + backend

**Status de Aceição:** ✅ PASS (todos os itens) ou ❌ FAIL (qualquer item falta)

### Critério 5: PERFORMANCE BÁSICA

**Padrão:**
- Queries: < 1 segundo (não N+1 problems)
- Page load: < 3 segundos (sem network delay)
- Bundle size: < 500kB gzipped (React apps típico ~60-100kB)
- Primeira paint: < 2s (lighthouse métrica)

**Status de Aceição:** ✅ PASS (green flags) ou 🟡 PASS com ALERT se próximo ao limite

### Decisão Final de Aprovação

```
IF Build PASS 
   AND Funcionalidade PASS ou PASS(P2) 
   AND Documentação PASS 
   AND Segurança PASS 
   AND (Performance PASS ou ALERT)
THEN Aprovado para próxima fase
ELSE Bloqueador crítico, remediation obrigatória
```

---

## 🆙 ESCALAÇÃO DE PROBLEMAS

### Nível 1: Minor Issues (Executor + Arquiteto)

**Trigger:** Build warning, teste flakiness, documentação incompleta

**Processo:**
1. Executor abre issue em GitHub
2. Arquiteto revisa em < 24h
3. Classificação: 🟡 MÉDIO (adiável) ou escalado

### Nível 2: Major Issues (Executor + Auditor)

**Trigger:** Teste falhando, funcionalidade parcial, performance degraded

**Processo:**
1. Executor abre issue em GitHub + menciona em daily report
2. Auditor revisa em checkpoints (terça/quarta 12:00)
3. Classificação: 🟠 ALTO → plano de fix até sexta

### Nível 3: Critical Issues (Executor + Arquiteto + Auditor)

**Trigger:** Build falhando, segurança comprometida, bloqueador para próxima fase

**Processo:**
1. Executor escalada IMEDIATAMENTE (não aguarda daily report)
2. War room: Arquiteto + Auditor + Executor (15 min)
3. Classificação: 🔴 CRÍTICO
4. Fix obrigatório < 4h, validação imediata

**Exemplo (S1-F2):**
```
15:00 → Auditor encontra: QueryClientProvider ausente
15:15 → War room: Diagnóstico = App quebra sem provider
15:30 → Executor começa fix: adiciona QueryClientProvider
16:00 → Fix completo, npm run build passa
16:30 → Auditor re-testa, valida funcionalidade
17:00 → Status green, documenta em auditoria report
```

---

## 📌 PADRÃO DE COMMITS E VERSIONAMENTO

### Formato de Commit

```
[CATEGORY] Objetivo: Detalhes específicos

Corpo (opcional):
- O que mudou (2-3 linhas)
- Por quê (trade-off, motivo)
- Issue referência: #123

Exemplo:
[QUERY] Fix: table name 'catalogo' → 'catalogo_itens'

Changed useApi.ts to use correct table name in CRUD operations.
Fixes issue where data wouldn't load from database.
Refs: #42 (auditoria S1-F2)

---

Formato:
[BUILD] = build system, versionamento, CI/CD
[QUERY] = database, APIs, data operations
[COMPONENT] = React components, UI
[TEST] = tests, coverage
[DOCS] = documentação, README
[SECURITY] = auth, RLS, keys
[FIX] = bug fixes
[FEAT] = new features
[REFACTOR] = refactoring (sem mudança lógica)
[PERF] = performance improvements
```

### Versionamento Semântico

```
v1.0.0-F0
v1.0.1-F1-S1 (patch: bug fixes)
v1.1.0-F1-S2 (minor: features)
v2.0.0-F2-S1 (major: breaking changes)

Padrão: MAJOR.MINOR.PATCH-PHASE-WEEK

Tagging no Git:
git tag -a v1.0.1-F1-S1 -m "Fix: QueryClientProvider + table mismatch"
git push origin v1.0.1-F1-S1
```

### Branch Strategy

```
main → sempre pronto para deploy (sempre verde)
  ├─ feature/component-library (S2.1)
  ├─ feature/crud-integration (S2.2)
  └─ feature/gis-mapping (S2.3)

Workflow:
1. Criar branch: git checkout -b feature/xyz
2. Develop + testes + commits descritivos
3. Pull request antes de merge
4. Code review: Arquiteto checks
5. Merge para main (squash or rebase, não merge commit)
6. Tag release: v1.0.x
7. Deploy para produção
```

---

## 📋 RESUMO: QUANDO USAR ESTE FRAMEWORK

| Situação | Ação |
|----------|------|
| Segunda de manhã | Pre-kickoff checklist (30 min executor) |
| Segunda 09:00 | Kickoff meeting (1h, 3 pessoas) |
| Seg-Qua | Execução, daily reports 18:00 |
| Terça/Quarta 12:00 | Checkpoint com Arquiteto |
| Quinta | Auditoria externa (2h-6h) |
| Quinta-Sexta | Remediation (4h máximo) |
| Sexta 18:00 | Aprovação + plano próxima semana |
| Sempre | Build deve passar, git deve estar limpo |

---

*Framework implementado e validado em 3 ciclos sucessivos (F0, F1, S1-F2).  
Próxima aplicação: S2-F2 (13-19 Feb 2026)*
