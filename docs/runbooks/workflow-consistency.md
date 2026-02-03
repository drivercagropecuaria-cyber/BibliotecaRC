# Consistência do Workflow

## Objetivo

Evitar divergência entre UI e backend ao mover cards no Kanban.

## Checklist

- [ ] Remover estado duplicado do Workflow.
- [ ] Usar cache do QueryClient como fonte de verdade.
- [ ] Garantir que optimistic updates reflitam imediatamente.
