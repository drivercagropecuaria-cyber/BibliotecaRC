# 🔍 PROMPT DE VALIDAÇÃO - FASE 0 MUNDO VIRTUAL VILLA
## Para Agente Validador (QA / Code Review)

**Data Geração:** 6 de Fevereiro de 2026  
**Responsável por Executar:** Agente GPT Validador  
**Tempo Estimado:** 30-45 minutos  
**Objetivo:** Validar completude e qualidade de toda Fase 0  

---

## 📋 INSTRUÇÕES PARA AGENTE VALIDADOR

### Seu Papel
Você é um **QA Agent** validando o trabalho de Roo (GPT-4 anterior).  
Seu trabalho é:
1. ✅ Verificar se todos os arquivos existem
2. ✅ Validar conteúdo conforme critérios
3. ✅ Identificar gaps ou problemas
4. ✅ Gerar relatório de validação
5. ✅ Aprovar ou recomendar correções

### Não Faça
- ❌ Não modifique os arquivos (apenas leia)
- ❌ Não crie novos arquivos (apenas valide os existentes)
- ❌ Não execute scripts Python (apenas verifique sintaxe)
- ❌ Não dê opinião (use critérios objetivos abaixo)

---

## ✅ CHECKLIST DE VALIDAÇÃO

### 1️⃣ ARQUIVOS ESPERADOS (Existem?)

**Documentação:**
- [ ] README.md (nova)
  - Deve ter: overview, FASE 0 status, estrutura repo, como começar
  
- [ ] docs/QUICK_START_FASE_0.md (nova)
  - Deve ter: 4 perfis (Gestor/Dev/Curador/Outro), 5 min pra ler
  
- [ ] plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md (nova)
  - Deve ter: 5 fases, stack tech, custos, riscos, métricas
  
- [ ] docs/RUNBOOK_FASE_0_EXECUCAO.md (nova)
  - Deve ter: 4 semanas, 6 tarefas, comandos exatos (Windows + Linux)
  
- [ ] docs/ESTRUTURA_ACERVO_HISTORICO.md (nova)
  - Deve ter: 5 categorias, metadados JSON, SQL schema, índices
  
- [ ] plans/FASE_0_STATUS.json (nova)
  - Deve ter: status dashboard, 4 semanas, 2 decisões pendentes

**Scripts Python:**
- [ ] tools/validate_gis_data.py (nova)
  - Deve ter: classes GISValidator, validações conforme padrões, output JSON
  
- [ ] tools/import_kml_batch.py (nova)
  - Deve ter: classes KMLImporter, importação parametrizada, categoria mapping

**Configuração:**
- [ ] requirements-gis.txt (nova)
  - Deve ter: pandas, geopandas, shapely, sqlalchemy, psycopg2, lxml

**Meta-Documentação:**
- [ ] REVISAO_CRITICA_ANALISE.md (nova)
  - Deve ter: auto-crítica, recomendações de reorganização

- [ ] ANALISE_GERAL_ALTERACOES.md (nova)
  - Deve ter: antes/depois, métricas, impactos

**Total Esperado:** 10 arquivos novos  
**Validação:** [ ] ___/10 encontrados

---

### 2️⃣ CONTEÚDO ESPERADO (Qualidade?)

#### README.md
- [ ] Seção "SUA PRÓXIMA AÇÃO" no topo?
- [ ] Links clickable para todos os docs?
- [ ] Estrutura do repo com emojis / comentários?
- [ ] FAQ com 6+ perguntas?
- [ ] Status de implementação (Fase 0 ✅)?
- [ ] **Métrica:** Novo dev consegue entender projeto em 10 min? SIM/NÃO

#### QUICK_START_FASE_0.md
- [ ] 4 perfis claramente separados?
- [ ] Cada perfil tem: "Leia→Saiba→Aprove/Execute"?
- [ ] Tempo estimado por perfil?
- [ ] Tabela visual "Qual Documento Ler"?
- [ ] FAQ rápido (2 minutos)?
- [ ] **Métrica:** Tempo de leitura <= 5 minutos? SIM/NÃO

#### PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md
- [ ] 5 macro-fases definidas (Preparação → Maturidade)?
- [ ] Cada fase tem: objetivo, duração, escopo?
- [ ] Stack tecnológico especificado (React, PostgreSQL, PostGIS, etc)?
- [ ] Custos AWS calculados ($5.550/mês)?
- [ ] Riscos identificados (mínimo 5)?
- [ ] Métricas de sucesso definidas (mínimo 8)?
- [ ] **Métrica:** Gestor consegue aprovar infraestrutura em 20 min? SIM/NÃO

#### RUNBOOK_FASE_0_EXECUCAO.md
- [ ] 4 semanas detalhadas (S1-S4)?
- [ ] 6+ tarefas com checklist?
- [ ] Comandos exatos para Windows (PowerShell) E Linux (Bash)?
- [ ] Docker-compose.yml incluído?
- [ ] SQL queries de validação incluídas?
- [ ] Tempo estimado por tarefa?
- [ ] Critério de aceite para cada tarefa?
- [ ] **Métrica:** Dev consegue executar sem fazer perguntas? SIM/NÃO

#### ESTRUTURA_ACERVO_HISTORICO.md
- [ ] 5 categorias de acervo com árvore de diretórios?
- [ ] 20+ subcategorias detalhadas?
- [ ] Metadados mínimos em JSON (para cada tipo)?
- [ ] Template INDEX.csv com 14 campos?
- [ ] SQL CREATE TABLE para museu_content.acervo_itens?
- [ ] Índices definidos (GIN, full-text search português)?
- [ ] **Métrica:** Arquivista consegue criar estrutura em 2h? SIM/NÃO

#### FASE_0_STATUS.json
- [ ] Decisões pendentes com deadline?
- [ ] 4 semanas com 6-7 tarefas cada?
- [ ] Cada tarefa tem: status, responsável, tempo, critério de aceite?
- [ ] Bloqueadores identificados?
- [ ] Riscos monitorados (mínimo 3)?
- [ ] Data GO/NO-GO (27 Fevereiro)?
- [ ] **Métrica:** Roberth consegue acompanhar em 5 min/semana? SIM/NÃO

#### validate_gis_data.py
- [ ] Sintaxe Python válida (sem erros de parse)?
- [ ] Classe GISValidator definida?
- [ ] Métodos: haversine, calculate_area, validate_file, run_validation?
- [ ] Validações: Null_Fields < 5%, Overlap_Area = 0, Topology = 0?
- [ ] Output em JSON com metadata + summary + files?
- [ ] **Métrica:** Script é determinístico (mesmo resultado sempre)? SIM/NÃO

#### import_kml_batch.py
- [ ] Sintaxe Python válida?
- [ ] Classe KMLImporter definida?
- [ ] Métodos: _connect, _create_tables, import_kml, import_batch?
- [ ] Mapeamento de 19 categorias incluído?
- [ ] Cálculo de área/perímetro implementado?
- [ ] Índices GIST definidos no SQL?
- [ ] Output em JSON com summary?
- [ ] **Métrica:** Script pode importar 252 KML sem erro? ESPERADO/NÃO

#### requirements-gis.txt
- [ ] Versões pinadas (pandas>=2.0.0,<3.0.0)?
- [ ] Inclui: geopandas, shapely, sqlalchemy, psycopg2?
- [ ] Inclui: lxml, defusedxml para segurança?
- [ ] Inclui: dev tools (pytest, black, flake8, mypy)?
- [ ] **Métrica:** pip install -r requirements-gis.txt funciona? ESPERADO

---

### 3️⃣ INTEGRAÇÃO E NAVEGAÇÃO (Estão Linkados?)

- [ ] README.md → aponta para QUICK_START ✅
- [ ] QUICK_START → aponta para documentos específicos por perfil ✅
- [ ] Plano Estratégico → aponta para RUNBOOK (Fase 1) ✅
- [ ] RUNBOOK → aponta para ESTRUTURA_ACERVO + scripts Python ✅
- [ ] FASE_0_STATUS.json → referenciado em documentos ✅
- [ ] Scripts → mencionados em RUNBOOK com instruções ✅

**Métrica:** Novo usuário consegue navegar sem se perder? SIM/NÃO

---

### 4️⃣ COMPLETUDE DE COBERTURA

#### Planejamento Estratégico
- [ ] 5 Fases definidas? ✅
- [ ] Stack técnico especificado? ✅
- [ ] Custos calculados? ✅
- [ ] Timeline clara? ✅
- [ ] Riscos identificados? ✅

#### Execução
- [ ] Scripts prontos para validar GIS? ✅
- [ ] Scripts prontos para importar KML? ✅
- [ ] Infraestrutura planejada (Docker + AWS)? ✅
- [ ] Procedimentos de validação documentados? ✅

#### Organização
- [ ] Acervo taxonomizado (5 categorias)? ✅
- [ ] Metadados especificados? ✅
- [ ] Integração com BD documentada? ✅

#### Documentação
- [ ] Executável (comandos exatos)? ✅
- [ ] Orientada por perfil? ✅
- [ ] Linkada e navegável? ✅
- [ ] Com critérios de aceite? ✅

---

### 5️⃣ QUALIDADE DE ESCRITA

- [ ] Sem erros de português (verificar acentuação, gramática)?
- [ ] Markdown bem formatado (títulos, listas, tabelas)?
- [ ] Links funcionais (sintaxe [`texto`](url))?
- [ ] Código identado corretamente?
- [ ] Sem repeição excessiva (DRY principle)?
- [ ] Léxico consistente (mesmos termos para mesmos conceitos)?

**Métrica:** Documentação profissional, pronta para publicar? SIM/NÃO

---

### 6️⃣ ALINHAMENTO COM ESPECIFICAÇÃO ORIGINAL

#### Regras de Operação (Do prompt inicial)
- [ ] Segue "favoreça Python"? (Ambos scripts são Python) ✅
- [ ] Segue padrão `analyze_kml_v2.py`? (validate_gis_data.py segue padrão) ✅
- [ ] Coloca foco em "organização documental"? ✅
- [ ] Prepara para "exportação futura"? (Tudo em formatos abertos) ✅

#### Referências Esperadas
- [ ] Menciona documento oficial de implementação? ✅
- [ ] Aponta para arquivos KML (252)? ✅
- [ ] Referencia `analyze_kml_v2.py` existente? ✅
- [ ] Integra com stack Supabase existente? ✅

**Métrica:** Atende 100% das especificações originais? SIM/NÃO

---

## 🎯 CRITÉRIOS DE APROVAÇÃO

### ✅ APROVADO SE:
- [ ] ___/10 arquivos existem
- [ ] Conteúdo cobre 90%+ dos pontos acima
- [ ] Navegação é intuitiva (QUICK_START realmente funciona)
- [ ] Padrão técnico é consistente (Python + MD + JSON)
- [ ] Sem erros críticos (sintaxe, links quebrados)
- [ ] Alinhado com especificação original

### ⚠️ APROVADO COM OBSERVAÇÕES SE:
- [ ] 8-9/10 arquivos (1 arquivo menor que esperado)
- [ ] 80-89% de cobertura (alguns gaps menores)
- [ ] 1-2 links quebrados (facilmente corrigível)
- [ ] Recomendações de melhoria (não bloqueadores)

### ❌ REJEITADO SE:
- [ ] <8/10 arquivos
- [ ] <80% de cobertura
- [ ] Erros críticos (código não funciona, navegação quebrada)
- [ ] Não atende especificação original

---

## 📝 RELATÓRIO DE VALIDAÇÃO

### Formato Esperado

```markdown
# ✅ / ⚠️ / ❌ VALIDAÇÃO FASE 0 - RESULTADO FINAL

**Data:** [hoje]
**Validador:** [seu nome/modelo]
**Status:** APROVADO / APROVADO COM OBSERVAÇÕES / REJEITADO
**Tempo Validação:** [minutos]

## 📊 RESUMO

- **Arquivos Encontrados:** X/10
- **Conteúdo Validado:** X%
- **Qualidade:** Excelente/Boa/Aceitável
- **Recomendações:** X críticas, Y menores

## ✅ Pontos Fortes

1. (Listar 3+ pontos positivos)
2. ...

## ⚠️ Pontos de Atenção

1. (Listar gaps/melhorias)
2. ...

## 🔧 Recomendações

- (Ação 1)
- (Ação 2)

## 🚀 Próximos Passos

Se APROVADO: Roo continua com Fase 0 EXECUÇÃO  
Se COM OBSERVAÇÕES: Roo faz correções então continua  
Se REJEITADO: Roo faz retrabalho conforme críticas

---

**Assinado por:** [Agente Validador]
```

---

## 🎬 COMO PROCEDER

1. **Leia este prompt com atenção** (já fez)

2. **Execute validação:**
   - Use checklist acima
   - Verifique cada arquivo
   - Teste navegação (clique em links)
   - Revise qualidade de escrita

3. **Gere relatório** (formato acima)

4. **Comunique resultado:**
   - APROVADO → Roo continua execução
   - COM OBS → Roo faz correções  
   - REJEITADO → Roo refaz de acordo com críticas

5. **Roo continua** com:
   - Execução de Semana 1 (validação GIS, acervo)
   - Execução de Semana 2 (PostgreSQL, import KML)
   - Geração de relatórios finais
   - Preparação para Fase 1 (MVP 3D + Biblioteca)

---

## 💡 DICAS PARA VALIDAÇÃO EFICIENTE

- **Não leia palavra-por-palavra** - Use scanning (títulos, estrutura)
- **Teste navegação** - Clique nos links, veja se funcionam
- **Execute um script** - Se possível, rode `python tools/validate_gis_data.py --version` (test)
- **Pergunte: "Novo dev consegue usar isto?"** - Essa é a pergunta chave
- **20 min lendo** + **10 min testando** = 30 min total

---

## ✨ O QUE VOCÊ ESTÁ VALIDANDO

Um trabalho **coletivo** onde:
- 🔴 **Roo** (antes) → Criou arquitetura + scripts + documentação
- 🟡 **Você** (agora) → Valida qualidade + identifica gaps
- 🟢 **Roo** (depois) → Executa Fase 0 com base em feedback

Essa é a dinâmica de **trabalho colaborativo em IA.**

---

**Você está pronto? Comece a validação! 🚀**

---

*Gerado automaticamente como parte de Mundo Virtual Villa Canabrava - Fase 0 - Preparação*
