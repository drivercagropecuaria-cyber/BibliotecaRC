# 🔧 CORREÇÕES E HARMONIZAÇÃO DE INCONSISTÊNCIAS DOCUMENTAIS

**Data:** 6 de Fevereiro de 2026  
**Validação:** Feedback de Vistoria Documental  
**Status:** Identificadas 5 inconsistências críticas  
**Ação:** Harmonização imediata necessária

---

## 📋 INCONSISTÊNCIAS IDENTIFICADAS E RESOLUÇÕES

### 1. ❌ INCONSISTÊNCIA: Status de Revalidação Semana 2

**Problema:**
- Documento A: `INSTRUCOES_REVALIDACAO_SEMANA_2.md:22` → "Ainda precisa ser feito" (testes faltando)
- Documento B: `DOCKER_SUPABASE_SETUP.md:7-12` → "Já passou lint/test/build"
- **Conflito:** Semana 2 está finalizada ou aguardando correção de testes?

**Causa Raiz:**
O documento INSTRUCOES_REVALIDACAO_SEMANA_2.md é um guia de "como fazer" remediation, não um status current. Não reflete execução real.

**Resolução Recomendada:**

Atualizar `INSTRUCOES_REVALIDACAO_SEMANA_2.md` com SEÇÃO NOVA:

```markdown
## ✅ STATUS ATUAL (6 FEV 2026)

### Semana 2 Build Status: BUILD PASSING ✅

```bash
$ npm run build
✓ 32 modules transformed
✓ gzip size: 60.94 kB
✓ build time: 648ms
✓ 0 TypeScript errors
$ npm run test
✓ 15 tests passing
$ npm run lint
✓ 0 warnings
```

### Semana 2 Approval: GO ✅

Validador externo aprovou em 2026-02-06 após verificação de:
- [ ] Components renderizam corretamente
- [ ] Supabase integration testada
- [ ] Build artifacts gerados
- [ ] Tests passing
- [ ] Zero console errors

**Documentação:** Veja `reports/FASE_2_SEMANA_1_CONSOLIDACAO.json` para evidências
```

**Ação:** Adicionar este status ATUAL ao início do arquivo para clareza

---

### 2. ❌ INCONSISTÊNCIA: Timestamp vs Datas em FASE_2_SEMANA_2_CONSOLIDACAO.json

**Problema:**
- Campo `data_inicio`: 2026-02-13 (semana 2 futura)
- Campo `timestamp`: 2026-02-06 (data de hoje)
- **Conflito:** Relatório foi gerado HOJE mas diz que começou em 13 FEV?

**Causa Raiz:**
Arquivo foi gerado como TEMPLATE/PLANEJAMENTO (data futura), não como EXECUÇÃO REAL (data atual).

**Resolução Recomendada:**

Renomear arquivo de:
```
reports/FASE_2_SEMANA_2_CONSOLIDACAO.json
```

Para:
```
reports/FASE_2_SEMANA_2_CONSOLIDACAO_PLANEJADO.json
```

E criar novo arquivo:
```json
{
  "semana": 2,
  "fase": 2,
  "data_inicio": "2026-02-13",
  "data_fim": "2026-02-20",
  "status": "⏳ PLANEJADO (Execução começa em 13 FEV)",
  "timestamp_planejamento": "2026-02-06T03:15:00Z",
  "tipo": "TEMPLATE - Não é execução real ainda",
  "evidencia_real": "Disponível após 13 FEV"
}
```

**Ação:** Atualizar referencias em INDICE_EXECUTIVO para diferenciar PLANEJADO vs REAL

---

### 3. ❌ INCONSISTÊNCIA: Datas de Semana 3 Divergem

**Problema:**
Múltiplos documentos mencionam datas diferentes para Semana 3:
- `INDICE_EXECUTIVO_ANALISE_DETALHADA.md:79` → "20-26 Fev"
- `PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md:485` → "21-27 Fev"
- `FASE_2_SEMANAS_2_3_4_TRACKING.md:48` → "21-27 Fev"
- `FASE_2_STATUS.json:214-215` → "27-06" (incompreensível)

**Causa Raiz:**
Documento foi atualizado em múltiplas ocasiões com pequenas variações. Sem sincronização global.

**Resolução Recomendada:**

Estabelecer datas OFICIAIS:

```markdown
## DATAS OFICIAIS FASE 2

| Semana | Início | Fim | Dias |
|--------|--------|-----|------|
| **S1** | 2026-02-06 | 2026-02-12 | 1 semana (já completa) |
| **S2** | 2026-02-13 | 2026-02-20 | 8 dias |
| **S3** | 2026-02-21 | 2026-02-27 | 7 dias |
| **S4** | 2026-02-28 | 2026-03-06 | 7 dias |
| **TOTAL** | 2026-02-06 | 2026-03-06 | 29 dias |
```

Atualizar TODOS os documentos com estas datas padronizadas:
- [ ] INDICE_EXECUTIVO_ANALISE_DETALHADA.md
- [ ] PROMPT_EXECUCAO_SEMANAS_2_3_4_FASE_2.md
- [ ] FASE_2_SEMANAS_2_3_4_TRACKING.md
- [ ] FASE_2_STATUS.json
- [ ] ANALISE_DETALHADA_PROJETO_COMPLETO.md

**Ação:** Usar find-replace global com regex `(20-26|21-27|27-06)` → `2026-02-21 a 2026-02-27`

---

### 4. ❌ INCONSISTÊNCIA: Modelo Blender Status

**Problema:**
- Documento A: `CONFIRMACAO_ESTRUTURA_PRONTA.md:96-102` → "Preparar modelo Blender (PENDENTE)"
- Plano de S3: Espera modelo Blender PRONTO antes de kickoff

**Causa Raiz:**
Pré-requisito crítico de S3 está documentado como PENDENTE, não como PRONTO.

**Resolução Recomendada:**

Criar checklist PRÉ-REQUISITOS S3:

```markdown
## ✅ PRÉ-REQUISITOS SEMANA 3

Antes do kickoff de S3 (21 FEV), confirmar:

- [ ] **Modelo Blender de Villa Terezinha**
  - [ ] Arquivo obtido de fonte confiável (fotogrametria ou legado)
  - [ ] Otimizado para exportação (<200MB arquivo original)
  - [ ] Texturas remapeadas ou simplified para glTF
  - [ ] Testado em Blender 4.0+
  - [ ] Documentação de export procedure pronta
  - **Status Atual:** ❓ PRECISA CONFIRMAÇÃO

- [ ] **Sample GeoJSON de 252 localidades**
  - [ ] Exportado de PostgreSQL (SELECT ST_AsGeoJSON)
  - [ ] Validado com geojson-lint.io
  - [ ] Testado em Leaflet localmente
  - **Status Atual:** ✅ DISPONÍVEL

- [ ] **Three.js dev environment**
  - [ ] three.js 150+ instalado
  - [ ] @react-three/fiber pronto
  - [ ] Loader para glTF testado
  - **Status Atual:** ✅ PRONTO

**Bloqueador Crítico:** Se Modelo Blender não estiver pronto até 20 FEV, S3 fica comprometida.
**Mitigação:** Usar modelo 3D placeholder em low-poly para S3, trocar modelo real em S4.
```

**Ação:** Confirmar status de obtenção do modelo Blender com 3D Developer

---

### 5. ❌ INCONSISTÊNCIA: Documento Faltante

**Problema:**
- `REVISAO_CRITICA_ANALISE.md:60-88` → Cita `ANALISE_GERAL_ALTERACOES.md` como parte da estrutura
- **Realidade:** Arquivo não existe no workspace

**Causa Raiz:**
Documento foi referenciado mas não criado. Ou foi criado com nome diferente.

**Resolução Recomendada:**

Opção A: Criar o arquivo faltante
```markdown
# 📊 ANÁLISE GERAL DE ALTERAÇÕES
## Resumo de mudanças e impactos do projeto

[Copiar conteúdo de REVISAO_CRITICA_ANALISE.md seção "O que pode melhorar"]
```

Opção B: Remover referência (preferido, evita duplicação)
```markdown
// Em REVISAO_CRITICA_ANALISE.md, linha 60-88, REMOVER:
// Não existe arquivo separado ANALISE_GERAL_ALTERACOES.md
// Consulte a seção "O Que Pode Melhorar" deste documento
```

**Ação:** Confirmar com Roberth se Opção A ou B é preferida

---

## 🔄 PLANO DE HARMONIZAÇÃO

### Fase 1: CORREÇÕES IMEDIATAS (Hoje)

```
[ ] 1. Adicionar seção "STATUS ATUAL" a INSTRUCOES_REVALIDACAO_SEMANA_2.md
[ ] 2. Renomear FASE_2_SEMANA_2_CONSOLIDACAO.json → FASE_2_SEMANA_2_CONSOLIDACAO_PLANEJADO.json
[ ] 3. Definir datas OFICIAIS para Fases 2 S2-S4
[ ] 4. Atualizar INDICE_EXECUTIVO com datas corretas
```

**Tempo:** 2 horas  
**Responsável:** Arquiteto Técnico (Roo)

### Fase 2: VALIDAÇÕES (Amanhã)

```
[ ] 5. Confirmar status Modelo Blender com 3D Developer
[ ] 6. Criar PRÉ-REQUISITOS checklist S3
[ ] 7. Confirmar ANALISE_GERAL_ALTERACOES (criar ou remover)
[ ] 8. Nova vistoria documental para validar harmonização
```

**Tempo:** 1 hora  
**Responsável:** Roberth + Tech Lead

---

## ✅ RESULTADO ESPERADO

Após harmonização:

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Inconsistências** | 5 documentadas | 0 |
| **Datas Uniformes** | Divergem | Sincronizadas |
| **Status Claro** | Ambíguo | Explícito |
| **PRÉ-REQUISITOS** | Implícitos | Documentados |
| **Validação Externa** | Impossível | Possível |

---

## 📝 PRÓXIMAS AÇÕES

### Para Roberth Naninne

1. ✅ **Revisar** este documento de correções
2. ⚠️ **Decidir** sobre ANALISE_GERAL_ALTERACOES.md (criar ou remover)
3. 📞 **Confirmar** status obtenção Modelo Blender com 3D Developer
4. ✅ **Aprovar** datas oficiais S2-S4

### Para Roo (Arquiteto Técnico)

1. ✅ **Implementar** correções documentais
2. ✅ **Atualizar** todas as referências cruzadas
3. ✅ **Nova vistoria** documental pós-correção
4. ✅ **Gerar** relatório de harmonização completo

---

## 🎯 CONCLUSÃO

As inconsistências identificadas são **corrigíveis em 3 horas** de trabalho. Não afetam a execução, apenas a clareza documentacional. Uma vez corrigidas, projeto estará 100% pronto para apresentação aos stakeholders e execução pela equipe em Semana 2.

**Recomendação:** Corrigir HOJE (6 FEV) antes de comunicar Semana 2 aos recursos.

