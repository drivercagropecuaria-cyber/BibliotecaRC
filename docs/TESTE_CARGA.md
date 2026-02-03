# Teste de Carga (Controlado)

## Objetivo
Validar o comportamento do upload e buscas sob picos moderados sem impacto na produção.

## Checklist
- Rodar fora do horário crítico.
- Usar arquivos de teste (50MB–200MB) e limitar concorrência.
- Monitorar `upload_jobs`, `outbox_events`, `function_runs`.

## Plano sugerido
1. **Carga leve**: 5 uploads simultâneos (imagens e vídeos curtos).
2. **Carga média**: 15 uploads simultâneos.
3. **Busca**: 20 consultas de busca FTS em sequência.
4. Verificar:
   - Taxa de erro em `function_runs`.
   - Jobs expirados em `upload_jobs`.
   - Outbox pendente.

## Checklist operacional (passo a passo)
1. Acesse o Admin → Ferramentas e abra:
   - Monitor do Pipeline
   - Jobs Recentes
   - Logs das Funções
2. Faça **5 uploads simultâneos** no formulário de Upload.
3. Verifique:
   - `function_runs` sem erros
   - `upload_jobs` sem `FAILED`
4. Faça **15 uploads simultâneos** (testar mix de imagens e vídeos).
5. Repita a verificação acima e rode manualmente:
   - `process-outbox`
   - `reconcile-uploads`
6. Execute **20 buscas** no Acervo e confirme performance.
7. Registre métricas na planilha/relatório.

## Métricas
- Tempo médio de upload.
- Tempo de finalize.
- Erros por status.

## Observações
- Ajustar limites e repetir conforme necessidade.
