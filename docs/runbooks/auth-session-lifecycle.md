# Ciclo de sessão — Supabase Auth

## Objetivo

Evitar expiração de sessão durante uploads longos e manter estado do usuário consistente.

## Checklist

- [ ] `persistSession: true` no client Supabase.
- [ ] `autoRefreshToken: true` no client Supabase.
- [ ] Listener `onAuthStateChange` ativo no AuthProvider.
- [ ] Logs de eventos de auth apenas em dev.
