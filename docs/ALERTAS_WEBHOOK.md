# Alertas Externos (Webhook)

## Visão geral
As funções `process-outbox` e `reconcile-uploads` podem enviar alertas para um endpoint HTTP configurado.

## Como ativar
1. Crie um endpoint de webhook (Slack/Discord/HTTP).
2. Defina o secret `ALERT_WEBHOOK_URL` no Supabase.

Exemplo (Supabase CLI):
- `npx supabase secrets set ALERT_WEBHOOK_URL=https://seu-endpoint`

## Payload enviado
```json
{
  "function": "process-outbox",
  "status": "warning",
  "processed": 10,
  "skipped": 2
}
```

Em erros:
```json
{
  "function": "reconcile-uploads",
  "status": "error",
  "code": "JOB_SCAN_FAILED"
}
```

## Boas práticas
- Filtrar alertas por `status` no destino.
- Registrar e agrupar alertas repetidos.
- Configurar rate limit no endpoint de alerta.
