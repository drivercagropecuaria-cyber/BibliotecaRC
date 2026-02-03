# Supabase — Fonte de verdade (backend)

## Objetivo

Definir qual pasta supabase/ é a referência oficial para migrations, functions e deploy.

## Situação atual

- O workspace contém múltiplas pastas supabase/ (em locais diferentes), o que cria risco de deploy inconsistente.
- O frontend chama Edge Functions `init-upload` e `finalize-upload`.

Pastas encontradas:

- [supabase](supabase)
- [project_analysis/acervo-rc/supabase](project_analysis/acervo-rc/supabase)

Achados:

- A pasta [supabase](supabase) contém `migrations/` e `functions/`.
- A pasta [project_analysis/acervo-rc/supabase](project_analysis/acervo-rc/supabase) contém apenas `functions/`.
- A função `create-user` existe apenas na pasta secundária e o cadastro público foi desativado no frontend.

## Decisão (pendente)

- [x] Confirmar qual diretório supabase/ está em uso no ambiente de deploy.
- [x] Consolidar documentação e bloquear uso da pasta secundária.

## Fonte de verdade definida

- Diretório oficial para deploy: [supabase](supabase)
- Motivo: contém `migrations/` e `functions/` completos.

## Mitigação aplicada

- Pasta secundária marcada como não-oficial com aviso em [project_analysis/acervo-rc/supabase/README.md](project_analysis/acervo-rc/supabase/README.md).

## Ações recomendadas

- [ ] Listar funções e migrations existentes em cada pasta supabase/.
- [ ] Documentar divergências e remover duplicidade (ou mover para archive/).
