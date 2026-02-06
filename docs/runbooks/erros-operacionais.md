# Runbook - Erros Operacionais (Uploads e Miniaturas)

## Escopo
Este runbook cobre tres incidentes comuns:
- Travamento em uploads de arquivos grandes.
- Miniaturas desaparecidas.
- Sessao expirada durante upload (TUS).

## Pre-requisitos
- Acesso a Supabase (projeto e tabelas).
- Permissao admin no painel.
- Observabilidade basica (logs de Edge Functions e tabelas).

## 1) Travamento em arquivos grandes

### Sinais
- Uploads ficam em "uploading" por muito tempo.
- Timeout no browser ou queda de performance.

### Causa provavel
- Upload grande sem processamento assincro no backend.

### Mitigacao
1. Verificar estado na tabela `upload_jobs`.
2. Encaminhar processamento pesado para Edge Functions (background).
3. Monitorar status e reprocessar falhas.

### Passos de verificacao
- Conferir ultimo status de `upload_jobs` (UPLOADING, UPLOADED, FAILED).
- Conferir logs da function relacionada (process-outbox, finalize-upload).

## 2) Miniaturas desaparecidas

### Sinais
- Cards sem thumbnail.
- `thumbnail_url` vazio ou expirado.

### Causa provavel
- Falha no job de geracao ou limpeza de cache sem reprocessar.

### Mitigacao
1. Executar reprocessamento retroativo pelo AdminPage (ThumbnailGenerator).
2. Validar a existencia do arquivo em storage.

### Passos de verificacao
- Conferir `thumbnail_url` e `thumbnail_path` no registro.
- Conferir se o arquivo existe no bucket `acervo-files`.

## 3) Sessao expirada no upload (TUS)

### Sinais
- Erro de autorizacao durante upload resumable.
- Mensagem de sessao expirada antes do envio.

### Causa provavel
- Token expirado antes da chamada TUS.

### Mitigacao
1. Validar sessao antes de iniciar upload.
2. Se expirado, solicitar login e reiniciar a fila.

### Passos de verificacao
- Confirmar `access_token` valido no momento de iniciar TUS.
- Revalidar sessao se houver delay entre selecao e envio.

## Checklist de encerramento
- Uploads grandes concluem com TUS quando aplicavel.
- Miniaturas recuperadas ou reprocessadas.
- Fluxo de sessao validado sem erros de auth.

## Observacoes
- Priorize a estabilidade do pipeline (outbox + finalize-upload).
- Evite processamentos pesados no frontend.
