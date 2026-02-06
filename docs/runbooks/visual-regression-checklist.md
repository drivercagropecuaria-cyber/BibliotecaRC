# Visual Regression Checklist — RC Acervo (RC Agropecuária)

## Objetivo
Validar se a identidade visual RC foi aplicada sem afetar a engenharia do sistema.

## Páginas revisadas (manual)
- /login
- / (dashboard)
- /upload
- /workflow
- /acervo (library/catalog)

## Checklist visual (o que esperar)
- Header/Sidebar escuros com tipografia clara e sóbria.
- Fundo branco predominante, seções em cinza claro.
- Botões principais em verde institucional, uppercase e pill.
- Cards com sombra leve e borda sutil.
- Inputs com foco verde acessível.
- Sem carregamento de Google Fonts (CSP OK).

## Screenshots esperadas (descrição)
- Login: fundo branco, card central clean, botão verde.
- Dashboard: CTA verde, cards limpos e legíveis.
- Upload: área de dropzone com borda sutil e verde no hover/drag.
- Workflow: filtros com cartões claros e tipografia neutra.
- Acervo: busca com input limpo e contraste adequado.

## O que NÃO foi tocado
- src/hooks/*
- src/lib/supabase.ts
- supabase/*
- Edge Functions, RPCs, queries, validações

## Observações
- Caso apareça erro de CSP relacionado a fontes externas, remover qualquer referência a fonts.googleapis.com.
- Se houver necessidade de watermark oficial, substituir por logo oficial em assets.
