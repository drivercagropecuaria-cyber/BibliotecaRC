# Query Caching — TanStack Query

## Objetivo

Reduzir refetch desnecessário e chamadas duplicadas.

## Checklist

- [ ] Ajustar `staleTime` por domínio (taxonomias vs. catálogo).
- [ ] Desligar `refetchOnWindowFocus` em queries não críticas.
- [ ] Centralizar queries duplicadas em hooks únicos.
