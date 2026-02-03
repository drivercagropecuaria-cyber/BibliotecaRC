# Supabase Auth Redirects

## Objetivo

Garantir redirects consistentes em produção, preview e local.

## Checklist

- [x] Listar domínio de produção atual: acervo-rc.vercel.app
- [ ] Listar URLs de preview (se aplicável).
- [x] Mapear rotas de callback usadas pelo app (ex.: /auth/callback, /login, /).
- [ ] Registrar no dashboard do Supabase (sem secrets no repo).

## Rotas relevantes no frontend

- `/login` (rota pública de autenticação)
- `/` (dashboard pós-login)

## Fluxo de validação pós-deploy

- [ ] Acessar `/login` e autenticar.
- [ ] Verificar redirecionamento para `/`.
- [ ] Recarregar página e confirmar sessão ativa.
