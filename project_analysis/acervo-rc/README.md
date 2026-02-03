# Acervo RC

Frontend do sistema de acervo com Supabase, React, TypeScript e Vite.

## Variáveis de ambiente

Configure as variáveis abaixo no arquivo .env do projeto:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Prontidão para remoção de colunas de nome

Antes de aplicar as migrações de remoção de colunas de nome, verifique os views de auditoria:

- v_catalogo_id_readiness (contagem de IDs nulos)
- v_catalogo_missing_ids (nomes sem IDs)
- v_catalogo_name_mismatch (nomes divergentes dos cadastros)
