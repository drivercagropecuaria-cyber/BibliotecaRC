# Plano de Modernização — RC Acervo (execução no VS Code)

Este plano consolida as tarefas priorizadas com checklists executáveis. Ele considera os riscos identificados no relatório de autópsia e o plano de ação operacional.

## Objetivos

- Eliminar falhas de UI causadas por CSP/Google Fonts.
- Garantir sessão estável do Supabase durante uploads longos.
- Alinhar autenticação do upload com JWT de usuário.
- Reduzir inconsistências do Workflow e duplicidade de estado.
- Melhorar performance de queries e carregamento de mídia.
- Documentar procedimentos operacionais críticos.

---

## Fase 0 — Triagem forense e inventário

**Meta:** localizar origem do CSP e definir fonte de verdade do backend.

Checklist:
- [x] Auditar CSP no repositório (headers, meta tags, middlewares).
- [x] Mapear referência a Google Fonts no frontend.
- [x] Documentar em docs/runbooks/csp-audit.md:
  - [x] Arquivo(s) onde CSP é definido.
  - [x] Política CSP atual completa.
  - [x] Recursos externos bloqueados (ex.: Google Fonts).
- [x] Mapear múltiplas pastas supabase/.
- [x] Definir fonte de verdade para deploy.
- [x] Documentar decisão em docs/runbooks/supabase-source-of-truth.md.

---

## Fase 1 — Estabilidade da UI (CSP e fontes)

**Meta:** eliminar erro no /login e padronizar carregamento de fontes.

Checklist (opção recomendada: self-host):
- [x] Remover qualquer referência a fonts.googleapis.com e fonts.gstatic.com.
- [x] Adicionar Inter WOFF2 local (public/fonts/inter/).
- [x] Criar/ajustar arquivo de fontes com @font-face.
- [x] Garantir font-family padrão (Inter + fallback) no CSS global.
- [x] Ajustar Tailwind para reconhecer Inter em font-sans.
- [x] Verificar que não há mais imports de Google Fonts no repo.
- [x] Documentar a política em docs/runbooks/csp-policy.md.

Checklist (opção alternativa: manter Google Fonts):
- [ ] Ajustar CSP para permitir fonts.googleapis.com (style-src/style-src-elem).
- [ ] Ajustar CSP para permitir fonts.gstatic.com (font-src).
- [ ] Validar connect-src para Supabase.
- [ ] Documentar a política em docs/runbooks/csp-policy.md.

---

## Fase 2 — Robustez de autenticação e sessão

**Meta:** evitar expiração de sessão durante uploads e fluxos longos.

Checklist:
- [x] Ativar persistSession no client Supabase.
- [x] Ativar autoRefreshToken no client Supabase.
- [x] Confirmar detectSessionInUrl quando OAuth for usado.
- [x] Garantir listener onAuthStateChange no AuthProvider.
- [x] Adicionar logs controlados (dev-only) de eventos de auth.
- [x] Documentar ciclo em docs/runbooks/auth-session-lifecycle.md.

---

## Fase 3 — Upload seguro e íntegro

**Meta:** alinhar autorização do upload com JWT do usuário e reduzir resíduos.

Checklist:
- [x] Usar access_token do usuário nas Edge Functions init-upload e finalize-upload.
- [x] Atualizar TUS para usar token de sessão quando necessário.
- [x] Revisar headers de upload para refletir identidade do usuário.
- [x] Garantir que thumbnails sigam a mesma estratégia de integridade.
- [x] Documentar fluxo de integridade em docs/runbooks/upload-integrity.md.

---

## Fase 4 — Consistência do Workflow

**Meta:** eliminar estado duplicado e garantir update otimista visível.

Checklist:
- [x] Remover estado local duplicado no Workflow (allItems).
- [x] Basear colunas no cache do QueryClient.
- [x] Garantir que optimistic updates reflitam imediatamente na UI.
- [x] Documentar em docs/runbooks/workflow-consistency.md.

---

## Fase 5 — Performance e UX

**Meta:** reduzir chamadas repetidas e melhorar carregamento de mídia.

Checklist:
- [x] Ajustar staleTime por domínio (taxonomy, regras, catálogo).
- [x] Deduplicar queries em hooks compartilhados.
- [x] Desligar refetch em foco para queries não críticas.
- [x] Adicionar lazy loading/decoding async em thumbnails.
- [x] Implementar placeholders/skeletons no grid.
- [x] Documentar em docs/runbooks/query-caching.md.

---

## Fase 6 — Operação e validação

**Meta:** garantir login e redirecionamentos previsíveis em todos os ambientes.

Checklist:
- [x] Criar checklist de URLs permitidas no Supabase Auth.
- [x] Documentar rotas de callback usadas pelo app.
- [x] Registrar fluxo de validação pós-deploy (login, refresh, upload).
- [x] Documentar em docs/runbooks/supabase-auth-redirects.md.

---

## Checklist final de validação

- [ ] /login sem erros de CSP no console.
- [ ] UI renderiza com a fonte correta.
- [ ] Login mantém sessão após F5.
- [ ] Upload completa e finaliza sem resíduos.
- [ ] Workflow reflete atualização imediatamente.
- [ ] Sem duplicidade excessiva de requests.
- [x] Cadastro público desativado (apenas admin cria usuários).
- [x] Pasta supabase secundária marcada como não-oficial.
- [x] Exportação Excel removida (xlsx).
