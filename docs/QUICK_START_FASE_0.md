# ⚡ QUICK START - FASE 0 (5 MINUTOS)
## Escolha seu perfil e comece hoje

**Versão:** 1.0 | **Data:** 6 de Fevereiro de 2026  
**Tempo de Leitura:** 5 minutos | **Tempo de Ação:** Depende do perfil

---

## 👤 QUAL É SEU PERFIL?

Escolha UMA das opções abaixo. Ela determinará qual documento você deve ler primeiro.

---

### 🎯 PERFIL 1: GESTOR / DIRETOR (Você é Roberth ou equivalente)

**Seu Objetivo:** Entender visão estratégica, aprovar decisões, rastrear progresso

**Comece AQUI:**
1. **Leia:** [`plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md`](../plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md)
   - ⏱️ Tempo: 20 minutos
   - 📌 Foco: Visão de 3 anos, 5 fases, stack tecnológico, custos, riscos
   - ✅ Critério de sucesso: Entender por que Cloud (AWS) vs On-Prem

2. **Saiba:** Dashboard de Status Fase 0
   - 📊 [`plans/FASE_0_STATUS.json`](../plans/FASE_0_STATUS.json)
   - ⏱️ Tempo: 5 minutos
   - 📌 Foco: Tracking semanal de progresso
   - ✅ Critério de sucesso: Ver % completo cada semana

3. **Aprove:** 3 Decisões Críticas
   - [ ] **Infraestrutura:** Cloud AWS ($5.550/mês) aprovado?
   - [ ] **Timeline:** Fase 1 inicia 27 Fevereiro (GO)?
   - [ ] **Equipe:** DBA e GIS Specialist designados?

**Seu Próximo Passo THIS WEEK:**
- [ ] Leia Plano Estratégico (20 min)
- [ ] Aprove Cloud vs On-Prem (5 min decisão)
- [ ] Designe DBA + GIS Specialist (email, 10 min)
- [ ] Confirme GO para Fase 1 em 27 Fevereiro

**Tempo Total:** ~35 minutos + decisões

---

### 👨‍💻 PERFIL 2: TECH LEAD / DESENVOLVEDOR

**Seu Objetivo:** Executar Fase 0, validar dados, preparar infraestrutura

**Comece AQUI:**
1. **Leia:** [`docs/RUNBOOK_FASE_0_EXECUCAO.md`](../docs/RUNBOOK_FASE_0_EXECUCAO.md)
   - ⏱️ Tempo: 30 minutos (ler semana 1)
   - 📌 Foco: Validação GIS, organização acervo, setup PostgreSQL
   - ✅ Critério de sucesso: Executar cada tarefa conforme checklist

2. **Execute:** Semana 1 (hoje)
   ```bash
   # Setup ambiente
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements-gis.txt
   
   # OU use script automático
   bash tools/SETUP_DEVENV.sh  # Linux/Mac
   # tools/SETUP_DEVENV.bat     # Windows (criando)
   
   # Executar validação GIS
   python tools/validate_gis_data.py
   # Output: reports/GIS_VALIDATION_REPORT.json
   ```
   - ⏱️ Tempo: 45 minutos
   - 📌 Foco: Validar 252 KML
   - ✅ Critério de sucesso: Relatório gerado sem erros críticos

3. **Saiba:** Seu Status Dashboard
   - 📊 Update [`plans/FASE_0_STATUS.json`](../plans/FASE_0_STATUS.json) semanalmente
   - ⏱️ Tempo: 5 min por semana
   - 📌 Foco: "validacao_gis.status" = "COMPLETO"

**Seu Próximo Passo THIS WEEK:**
- [ ] Setup ambiente Python (30 min)
- [ ] Executar `validate_gis_data.py` (45 min)
- [ ] Revisar `reports/GIS_VALIDATION_REPORT.json` (20 min)
- [ ] Update FASE_0_STATUS.json (5 min)
- [ ] Relatório para Roberth (via JSON)

**Semana 2:**
- [ ] Setup PostgreSQL (Docker)
- [ ] Teste importação KML (5 arquivos)
- [ ] Importação completa (252 KML)

**Tempo Total Semana 1:** ~2 horas  
**Documentação:** Tudo em RUNBOOK - não precisa ler mais nada

---

### 📚 PERFIL 3: ARQUIVISTA / CURADOR DE ACERVO

**Seu Objetivo:** Organizar estrutura de acervo, começar catalogação

**Comece AQUI:**
1. **Leia:** [`docs/ESTRUTURA_ACERVO_HISTORICO.md`](../docs/ESTRUTURA_ACERVO_HISTORICO.md)
   - ⏱️ Tempo: 15 minutos
   - 📌 Foco: 5 categorias, metadados, taxonomia
   - ✅ Critério de sucesso: Entender INDEX.csv format

2. **Crie:** Estrutura de Diretórios
   - Seguir seção "Passo 2.1" do RUNBOOK
   - ⏱️ Tempo: 1-2 horas (PowerShell/Bash)
   - 📌 Foco: Criar 5 pastas + subpastas
   - ✅ Critério de sucesso: Todas as 20+ subpastas criadas

3. **Organize:** Catalogação
   - Copiar INDEX.csv template para cada pasta
   - Começar a preencher (manualmente ou scan)
   - ⏱️ Tempo: Ongoing (catalogação é trabalho contínuo)
   - 📌 Foco: Meta de 5.000 itens até Fase 2
   - ✅ Critério de sucesso: 100 itens catalogados em Semana 4

**Seu Próximo Passo THIS WEEK:**
- [ ] Leia ESTRUTURA_ACERVO (15 min)
- [ ] Crie estrutura de diretórios (2 horas)
- [ ] Prepare metadados para primeiros 10 itens (30 min)

**Tempo Total Semana 1:** ~2.5 horas (setup) + catalogação contínua

---

### ❓ PERFIL 4: OUTRO (Gestor de Projeto, QA, etc.)

**Se você não se identifica com os 3 acima:**
1. **Leia:** [`README.md`](../README.md) - Visão geral completa (15 min)
2. **Escolha seu perfil** (Gestor, Dev ou Curador) baseado no que você leu
3. **Volte** e siga instruções acima para seu perfil

---

## 🎯 RESUMO VISUAL - Qual Documento Ler?

```
┌─────────────────────────────────────────────────────┐
│  SUA PRÓXIMA AÇÃO - EM 5 DECISÕES                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Você precisa entender VISÃO estratégica?          │
│  → YES: Leia PLANO_ESTRATEGICO.md (20 min)         │
│  → NO:  Continue                                    │
│                                                     │
│  Você vai EXECUTAR Semana 1?                       │
│  → YES: Leia RUNBOOK_FASE_0_EXECUCAO.md (30 min)   │
│  → NO:  Continue                                    │
│                                                     │
│  Você vai ORGANIZAR o acervo?                      │
│  → YES: Leia ESTRUTURA_ACERVO_HISTORICO.md (15 min)│
│  → NO:  Leia README.md (visão geral, 15 min)       │
│                                                     │
│  Você se sente pronto para começar?                │
│  → YES: Está pronto para começar!                  │
│  → NO:  Releia este documento com mais atenção     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⏱️ TEMPO ESTIMADO POR PERFIL

| Perfil | Leitura | Ação | Total | BY WHEN |
|--------|---------|------|-------|---------|
| **Gestor** | 25 min | 20 min | 45 min | TODAY |
| **Tech Lead** | 30 min | 2 horas | 2.5 horas | TODAY-FRIDAY |
| **Curador** | 15 min | 2 horas | 2.5 horas | TODAY-FRIDAY |

---

## ✅ CHECKLIST - Pronto para Começar?

- [ ] Identifiquei meu perfil (acima)
- [ ] Tenho link do documento (copiei do Quick Start)
- [ ] Tenho tempo alocado (25 min leitura mínimo)
- [ ] Pronto para executar (segundo meu perfil)

**Se checou todas:** 👉 **Comece AGORA clicando no documento do seu perfil acima**

---

## 🆘 Algo Deu Errado?

### "Não entendi qual documento ler"
→ Volte ao início, releia "QUAL É SEU PERFIL?" com calma

### "O script Python não funciona"
→ Ver seção "Ações Corretivas" em RUNBOOK_FASE_0_EXECUCAO.md

### "Não tenho DBA disponível"
→ Você pode fazer setup Docker sozinho (instruções no RUNBOOK)

### "Preciso aprovar com Roberth"
→ Mostre [`plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md`](../plans/PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md) + [`plans/FASE_0_STATUS.json`](../plans/FASE_0_STATUS.json)

---

## 📞 Perguntas Frequentes (2 minutos)

**P: Preciso ler TODOS os documentos?**  
R: Não. Seu perfil acima. Tudo está linkado. Depois leia os outros se quiser contexto.

**P: Por onde começo SE TIVER SÓ 15 MINUTOS?**  
R: Seu perfil + comece = 15 min. Ação deixa para amanhã.

**P: Os scripts já foram testados?**  
R: Sim. Prontos para usar. Instruções no RUNBOOK.

**P: E se algo quebrar?**  
R: Log está em stdout + arquivo. Ver "Ações Corretivas" no RUNBOOK.

**P: Quem fico com dúvidas técnicas?**  
R: Roberth Naninne ou Tech Lead designado (RUNBOOK tem contatos)

**P: Quando tudo vai estar pronto?**  
R: 27 Fevereiro (GO para Fase 1). Você está na semana 1 de 4.

---

## 🚀 SUA MISSÃO - Escolha uma:

### Opção A: Sou Gestor
- [ ] Leia Plano Estratégico hoje
- [ ] Aprove infraestrutura
- [ ] Designe Equipe
- [ ] Confirme GO para Fase 1

### Opção B: Sou Tech Lead
- [ ] Setup Python + Docker
- [ ] Rode `validate_gis_data.py`
- [ ] Revise relatório
- [ ] Procure dados KML

### Opção C: Sou Curador
- [ ] Leia Estrutura Acervo
- [ ] Crie diretórios
- [ ] Comece catalogação
- [ ] Documente padrões

### Opção D: Sou Outro
- [ ] Leia README.md
- [ ] Escolha perfil acima
- [ ] Volte para seu caminho

---

**Escolheu?** 👇 **Clique no link do SEU documento e comece AGORA**

---

**Tempo investido:** 5 minutos lendo isto  
**Próxima ação:** Imediata (seu documento está 1 clique abaixo)  
**Dúvida?** Ver seção "Perguntas Frequentes" acima  

✅ **Pronto? Vá!**
