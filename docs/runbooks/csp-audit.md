# CSP Audit — RC Acervo

## Origem da CSP

- Definição ativa encontrada em [project_analysis/acervo-rc/vercel.json](project_analysis/acervo-rc/vercel.json).

Trecho (resumo):

- `Content-Security-Policy` com `style-src 'self' 'unsafe-inline'` e `font-src 'self' data:`.
- `connect-src` permite `https://*.supabase.co` e `https://*.supabase.in`.

## Recursos externos bloqueados

- Google Fonts (fonts.googleapis.com / fonts.gstatic.com) é bloqueado pela CSP atual.

## Referências a Google Fonts no frontend

- Import direto em [project_analysis/acervo-rc/src/index.css](project_analysis/acervo-rc/src/index.css).

## Observações

- O erro no /login é consistente com bloqueio de Google Fonts.
- Recomenda-se self-host da fonte Inter (ver plano de execução).
