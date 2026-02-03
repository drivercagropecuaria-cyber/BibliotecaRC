# Integridade do Upload — RC Acervo

## Objetivo

Garantir que o upload use identidade do usuário e reduza resíduos (jobs e thumbnails órfãs).

## Checklist

- [x] Edge Functions usam `Authorization: Bearer <access_token>`.
- [x] Upload TUS usa token de sessão.
- [x] Job é marcado corretamente (UPLOADING/UPLOADED).
- [x] Thumbnails são removidas quando o commit falha.
