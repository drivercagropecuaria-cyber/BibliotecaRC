# CSP Audit — RC Acervo

## Origem da CSP

- Definição ativa encontrada em [project_analysis/acervo-rc/vercel.json](project_analysis/acervo-rc/vercel.json).

Trecho (resumo):

- `Content-Security-Policy` com `style-src 'self' 'unsafe-inline'` e `font-src 'self' data:`.
- `connect-src` permite `https://*.supabase.co` e `https://*.supabase.in`.

## Recursos externos bloqueados

- Google Fonts (fonts.googleapis.com / fonts.gstatic.com) permanece bloqueado pela CSP atual.

## Referências a Google Fonts no frontend

- Nenhuma referência encontrada. O projeto utiliza fontes locais em [project_analysis/acervo-rc/src/index.css](project_analysis/acervo-rc/src/index.css).

## Observações

- O projeto já usa self-host da fonte Inter em /public/fonts/inter.
- Se houver erro de fonte no /login, revalidar o cache do navegador/CDN.
