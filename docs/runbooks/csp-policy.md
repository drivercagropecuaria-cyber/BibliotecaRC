# CSP Policy — RC Acervo

## Estratégia adotada

- Self-host da fonte Inter.
- Remoção de dependência do Google Fonts.

## Política atual (Vercel)

- Definida em [project_analysis/acervo-rc/vercel.json](project_analysis/acervo-rc/vercel.json).
- Mantém `font-src 'self' data:` e `style-src 'self' 'unsafe-inline'`.

## Checklist

- [x] Remover todas as referências a fonts.googleapis.com / fonts.gstatic.com.
- [x] Garantir que a fonte local esteja disponível em /fonts/inter/.
- [ ] Validar /login sem erro de CSP.
