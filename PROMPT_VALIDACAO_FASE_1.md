# 🔍 PROMPT DE VALIDAÇÃO FASE 1 - Para Agente Externo

**Para:** Agente Validador Externo (QA/Validation Specialist)  
**De:** Roo (Technical Lead)  
**Fase:** Fase 1 - FUNDAÇÃO (Execução)  
**Data:** 2026-02-06  
**Status esperado:** APROVAÇÃO PARA GO/NO-GO (ou REPROVAÇÃO COM PENDÊNCIAS)

---

## 🎯 SUA MISSÃO

Você é responsável por **validar a execução completa de Fase 1** do projeto Mundo Virtual Villa Canabrava. Fase 0 (Preparação) já foi **APROVADA**. Agora validamos se Fase 1 foi executada conforme plano.

**Seu trabalho é:**
1. ✅ Verificar se todos os 4 reports esperados foram gerados
2. ✅ Validar que as métricas atendem aos critérios mínimos
3. ✅ Identificar QUALQUER pendência crítica
4. ✅ Emitir parecer final: **APROVADO** ou **REPROVADO**

---

## 📋 O QUE VALIDAR - CHECKLIST CRÍTICO

### SEMANA 1: GIS Validation + Acervo Structure
**Data esperada de conclusão:** 2026-02-13

#### ✅ Tarefa 1.1 - GIS Validation Report
**Arquivo esperado:** `BIBLIOTECA/reports/GIS_VALIDATION_REPORT.json`

**Validação:**
- [ ] Arquivo existe em `reports/GIS_VALIDATION_REPORT.json`
- [ ] Arquivo é JSON válido (não corrupto)
- [ ] Contém campo `"validation_timestamp"` com data recente
- [ ] Contém campo `"total_files": 252`
- [ ] Contém campo `"valid_files": >=240` (95% mínimo)
- [ ] Contém campo `"invalid_files": <=12`
- [ ] Contém objeto `"summary"` com campos:
  - `"avg_null_fields": <=5` (máximo 5%)
  - `"files_with_topology_errors": 0` (CRÍTICO: deve ser 0)
  - `"wgs84_bounds_violations": <=5`
  - `"avg_positional_accuracy_m": <1.0` (menor que 1 metro)
- [ ] Contém array `"files"` com >=240 entradas com status "valid"

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "GIS Validation Report não atende critérios mínimos"
- Impacto: Impossível prosseguir para Semana 2 (BD setup) sem dados GIS válidos
- Ação: Repetir `python tools/validate_gis_data.py` ou investigar KML files

---

#### ✅ Tarefa 1.2 - Acervo Structure Report
**Arquivo esperado:** `BIBLIOTECA/reports/ACERVO_STRUCTURE_REPORT.json`

**Validação:**
- [ ] Arquivo existe em `reports/ACERVO_STRUCTURE_REPORT.json`
- [ ] Arquivo é JSON válido
- [ ] Contém campo `"total_folders": >=50`
- [ ] Contém campo `"categories"` com array de 5 elementos:
  - `01_DOCUMENTOS_TEXTUAIS`
  - `02_FOTOGRAFIAS`
  - `03_AUDIOVISUAL`
  - `04_MAPAS`
  - `05_OBJETOS_DIGITAIS`
- [ ] Contém campo `"subcategories"` com >=9 entradas
- [ ] Contém validação `"index_csv_files_found": >=5`
- [ ] Estrutura física no disco:
  - [ ] Pasta `acervo/ACERVO_HISTORICO/` existe
  - [ ] 5 pastas de categorias presentes
  - [ ] Mínimo 1 subcategoria por categoria
  - [ ] Mínimo 2 categorias com subpastas de anos (2020-2026)

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Acervo structure incompleta ou não criada"
- Impacto: Não há local para armazenar conteúdo digital
- Ação: Executar script de criação de estrutura ou criar manualmente

---

### SEMANA 2: BD Setup + KML Pilot
**Data esperada de conclusão:** 2026-02-20

#### ✅ Tarefa 2.1 - DB Connection Test
**Arquivo esperado:** `BIBLIOTECA/reports/DB_CONNECTION_TEST.json`

**Validação:**
- [ ] Arquivo existe em `reports/DB_CONNECTION_TEST.json`
- [ ] Contém campo `"status": "SUCCESS"` ou `"connected": true`
- [ ] Contém campo `"database": "villa_virtual"`
- [ ] Contém campo `"host": "localhost"` ou `"host": "127.0.0.1"`
- [ ] Contém campo `"port": 5432`
- [ ] Contém campo `"postgis_enabled": true`
- [ ] Contém campo `"postgis_version"` com formato "3.x.x"
- [ ] Docker container PostgreSQL rodando:
  - [ ] Executar: `docker ps | grep postgis`
  - [ ] Deve retornar container "postgis" com status "Up"

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Banco de dados não acessível ou PostGIS não configurado"
- Impacto: Impossível importar dados KML
- Ação: Executar `docker-compose up -d` ou verificar docker logs

---

#### ✅ Tarefa 2.2 - KML Pilot Import Report
**Arquivo esperado:** `BIBLIOTECA/reports/KML_IMPORT_PILOT_SUMMARY.json`

**Validação:**
- [ ] Arquivo existe em `reports/KML_IMPORT_PILOT_SUMMARY.json`
- [ ] Arquivo é JSON válido
- [ ] Contém campo `"mode": "PILOT"`
- [ ] Contém campo `"files_processed": 5`
- [ ] Contém campo `"files_successful": 5` (100% de sucesso)
- [ ] Contém campo `"total_features_imported": >=500`
- [ ] Contém campo `"success_rate": 100` (ou `"success_rate": 1.0`)
- [ ] Verifica tabelas no banco:
  - [ ] Execute SQL: `SELECT COUNT(*) FROM gis_data.features;` → deve retornar > 0
  - [ ] Execute SQL: `SELECT COUNT(*) FROM gis_data.layers;` → deve retornar > 0
  - [ ] Execute SQL: `\d gis_data.features` → validar índices GIST e GIN presentes

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "KML Pilot import falhou ou não gerou expected features"
- Impacto: Impossível escalar para 252 arquivos sem fix da Semana 2
- Ação: Debugar script, verificar logs, validar KML files de entrada

---

### SEMANA 3: KML Full Import + Data Quality
**Data esperada de conclusão:** 2026-02-27

#### ✅ Tarefa 3.1 - KML Full Import Report
**Arquivo esperado:** `BIBLIOTECA/reports/KML_IMPORT_SUMMARY.json`

**Validação:**
- [ ] Arquivo existe em `reports/KML_IMPORT_SUMMARY.json`
- [ ] Arquivo é JSON válido
- [ ] Contém campo `"mode": "FULL"`
- [ ] Contém campo `"total_files": 252`
- [ ] Contém campo `"successful_files": >=240` (>=95% sucesso)
- [ ] Contém campo `"failed_files": <=12`
- [ ] Contém campo `"total_features_imported": >=50000`
- [ ] Contém campo `"categories_imported": 19`
- [ ] Contém array `"category_summary"` com 19 entradas, cada uma com:
  - `"category_name"`
  - `"feature_count"`
  - `"files_count"`
- [ ] Contém campo `"import_duration_seconds"` (para performance tracking)

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "KML Full import não atingiu 95% de sucesso ou features abaixo do esperado"
- Impacto: Dados geoespaciais incompletos para MVP
- Ação: Investigar quais arquivos falharam, corrigir, re-importar

---

#### ✅ Tarefa 3.2 - DB Data Quality Report
**Arquivo esperado:** `BIBLIOTECA/reports/DB_VALIDATION_REPORT.json`

**Validação:**
- [ ] Arquivo existe em `reports/DB_VALIDATION_REPORT.json`
- [ ] Arquivo é JSON válido
- [ ] Contém campo `"geometry_validity_percent": >=99`
- [ ] Contém campo `"total_features_validated": >= 50000`
- [ ] Contém campo `"invalid_geometries": <=500` (máximo 1% de 50k)
- [ ] Contém campo `"self_intersections": 0` (CRÍTICO: zero auto-interseções)
- [ ] Contém campo `"coverage_analysis"` com:
  - `"min_lat"`, `"max_lat"`, `"min_lon"`, `"max_lon"` (bounds geográficas válidas)
  - `"centroid"` presente
- [ ] Contém validação de índices:
  - `"indexes_present": true`
  - `"gist_index_status": "OK"`
  - `"gin_index_status": "OK"`

**Validação manual SQL:**
```sql
-- Testar geometrias válidas
SELECT COUNT(*) FROM gis_data.features WHERE ST_IsValid(geometry) = false;
-- Deve retornar <= 500

-- Testar features por categoria
SELECT COUNT(DISTINCT category) FROM gis_data.features;
-- Deve retornar 19

-- Testar índices
\d gis_data.features
-- Deve mostrar índices: features_geometry_gist, features_category_idx, features_name_gin
```

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Qualidade de dados geométricos abaixo de 99% ou índices não otimizados"
- Impacto: Performance ruim para spatial queries em MVP
- Ação: Revalidar dados, corrigir geometrias inválidas, reconstruir índices

---

### SEMANA 4: Consolidação + GO/NO-GO
**Data esperada de conclusão:** 2026-03-06

#### ✅ Tarefa 4.1 - Consolidation Report
**Arquivo esperado:** `BIBLIOTECA/reports/FASE_1_CONSOLIDACAO.json`

**Validação:**
- [ ] Arquivo existe em `reports/FASE_1_CONSOLIDACAO.json`
- [ ] Arquivo é JSON válido com timestamp recente
- [ ] Contém campo `"phase": "FASE_1"`
- [ ] Contém campo `"status": "COMPLETE"`
- [ ] Contém objeto `"validation_summary"` com 4 seções:

**Seção 1: GIS Validation**
```json
"gis_validation": {
  "expected_valid_files": 252,
  "actual_valid_files": [>=240],
  "pass": true  // CRÍTICO: MUST BE true
}
```

**Seção 2: Acervo Structure**
```json
"acervo_structure": {
  "expected_folders": 50,
  "actual_folders": [>=50],
  "pass": true  // CRÍTICO: MUST BE true
}
```

**Seção 3: KML Import**
```json
"kml_import": {
  "expected_files": 252,
  "actual_successful": [>=240],
  "expected_features": 50000,
  "actual_features": [>=50000],
  "pass": true  // CRÍTICO: MUST BE true
}
```

**Seção 4: Data Quality**
```json
"data_quality": {
  "expected_validity_percent": 99,
  "actual_validity_percent": [>=99],
  "pass": true  // CRÍTICO: MUST BE true
}
```

- [ ] Contém campo `"blocker_tasks_pending": 0` (CRÍTICO: deve ser 0)
- [ ] Contém campo `"go_nogo_recommendation": "GO"` (se tudo OK)

**Se NÃO passar:** 🔴 **PENDÊNCIA CRÍTICA**
- Motivo: "Consolidation report não reflete sucesso de todas as tarefas"
- Impacto: Não há baseline claro para GO/NO-GO decision
- Ação: Revisar semanas 1-3, corrigir qualquer métrica abaixo do threshold

---

## 🚨 CRITÉRIOS FINAIS DE APROVAÇÃO

### Fase 1 = ✅ **APROVADO** SE E SOMENTE SE:

1. ✅ **GIS Validation:** >=95% arquivos válidos (>=240/252)
2. ✅ **Acervo Structure:** >=50 pastas criadas com 5 categorias + 9+ subcategorias
3. ✅ **BD Connectivity:** PostgreSQL + PostGIS rodando e acessível
4. ✅ **KML Pilot:** 5 arquivos importados com >=500 features
5. ✅ **KML Full:** >=95% dos 252 arquivos importados com sucesso
6. ✅ **Data Quality:** >=99% das geometrias geometricamente válidas (ST_IsValid = true)
7. ✅ **All Reports Generated:** 6 arquivos JSON presentes em `reports/`
8. ✅ **Go/NoGo Recommendation:** Report consolida com recomendação clara

### Fase 1 = 🔴 **REPROVADO** SE:

1. 🔴 Qualquer métrica crítica abaixo do threshold (ex: <95% valid GIS files)
2. 🔴 Arquivo de report crítico FALTANDO (ex: sem GIS_VALIDATION_REPORT.json)
3. 🔴 Report JSON corrupto ou malformado
4. 🔴 BD não acessível ou PostGIS não habilitado
5. 🔴 >1% de geometrias inválidas (<99% validity)
6. 🔴 Qualquer BLOCKER task pendente

---

## 📝 COMO REPORTAR SEU PARECER

Você deve responder com exatamente este formato:

```
## RESULTADO: [APROVADO ✅ / REPROVADO 🔴]

### MÉTRICAS VALIDADAS:
- GIS Validation: {X}/252 valid (ESPERADO >=240) → [PASS/FAIL]
- Acervo Structure: {X} folders (ESPERADO >=50) → [PASS/FAIL]
- KML Pilot: {X} features (ESPERADO >=500) → [PASS/FAIL]
- KML Full: {X}/{X} successful (ESPERADO >=240/252) → [PASS/FAIL]
- Data Quality: {X}% valid geometries (ESPERADO >=99%) → [PASS/FAIL]
- All Reports Present: [PASS/FAIL]

### PENDÊNCIAS CRÍTICAS (se houver):
- Pendência 1: [descrição] → Arquivo/métrica: [localização] → Ação recomendada
- Pendência 2: ...

### OBSERVAÇÕES (não-bloqueantes):
- Observação 1: [descrição]
- Observação 2: ...

### RECOMENDAÇÃO FINAL:
Fase 1 está pronta para [GO → Fase 2 / NO-GO → Remediation Week X]
```

---

## 🔗 ARQUIVOS A CONSULTAR

Para sua validação, você terá acesso a:
- `/BIBLIOTECA/reports/GIS_VALIDATION_REPORT.json`
- `/BIBLIOTECA/reports/ACERVO_STRUCTURE_REPORT.json`
- `/BIBLIOTECA/reports/KML_IMPORT_PILOT_SUMMARY.json`
- `/BIBLIOTECA/reports/KML_IMPORT_SUMMARY.json`
- `/BIBLIOTECA/reports/DB_VALIDATION_REPORT.json`
- `/BIBLIOTECA/reports/FASE_1_CONSOLIDACAO.json`
- `/BIBLIOTECA/plans/FASE_1_STATUS.json` (para entender timelines esperadas)

Também pode consultar:
- `/BIBLIOTECA/PROMPT_EXECUCAO_FASE_1.md` (detalhes de tarefas e critérios)
- `/BIBLIOTECA/docs/ESTRUTURA_ACERVO_HISTORICO.md` (taxonomia esperada)

---

## ⏱️ TIMELINE

- **Target de Fase 1:** 2026-02-06 até 2026-03-06 (4 semanas)
- **Sua validação:** Assim que reports forem gerados (esperado por 2026-03-07)
- **GO/NO-GO decision:** Roberth decidirá em 2026-03-07 baseado em seu parecer

---

## 💬 NOTAS

- Este é um processo **colaborativo validado**. Você está fazendo o papel de QA/Validator externo.
- Se encontrar problemas, liste-os de forma clara e técnica (não vaga).
- Métricas e thresholds são baseados no PLANO_ESTRATEGICO_MUNDO_VIRTUAL_VILLA.md e RUNBOOK_FASE_0_EXECUCAO.md.
- Após sua validação, equipe pode fazer correções rápidas ("remediation") se necessário antes de GO.

---

**Documento Version:** 1.0  
**Criado:** 2026-02-06  
**Agente Responsável:** [Seu Nome/ID aqui quando responder]  
**Data de Validação:** [Preencher quando responder]  
**Status:** AGUARDANDO VALIDAÇÃO
