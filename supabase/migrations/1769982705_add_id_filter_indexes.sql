-- Migration: add_id_filter_indexes
-- Índices para filtros por IDs (alinha com migração para *_id)

CREATE INDEX IF NOT EXISTS idx_catalogo_area_id ON catalogo_itens(area_fazenda_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_ponto_id ON catalogo_itens(ponto_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_tipo_id ON catalogo_itens(tipo_projeto_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_status_id ON catalogo_itens(status_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_tema_principal_id ON catalogo_itens(tema_principal_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_evento_id ON catalogo_itens(evento_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_funcao_id ON catalogo_itens(funcao_historica_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_capitulo_id ON catalogo_itens(capitulo_id);

-- Índices parciais para itens ativos
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_area_id ON catalogo_itens(area_fazenda_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_status_id ON catalogo_itens(status_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_ponto_id ON catalogo_itens(ponto_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalogo_ativo_tema_id ON catalogo_itens(tema_principal_id) WHERE deleted_at IS NULL;
