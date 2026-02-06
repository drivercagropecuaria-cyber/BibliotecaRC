-- Migration: fix_rls_policies_catalogo
-- Created at: 1769916102

-- Habilitar RLS e criar políticas públicas para catalogo_itens
ALTER TABLE catalogo_itens ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT público
CREATE POLICY "Allow public read" ON catalogo_itens FOR SELECT USING (true);

-- Permitir INSERT público
CREATE POLICY "Allow public insert" ON catalogo_itens FOR INSERT WITH CHECK (true);

-- Permitir UPDATE público
CREATE POLICY "Allow public update" ON catalogo_itens FOR UPDATE USING (true) WITH CHECK (true);

-- Permitir DELETE público
CREATE POLICY "Allow public delete" ON catalogo_itens FOR DELETE USING (true);

-- Mesmas políticas para tabelas de referência
ALTER TABLE areas_fazendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read areas" ON areas_fazendas FOR SELECT USING (true);

ALTER TABLE pontos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read pontos" ON pontos FOR SELECT USING (true);

ALTER TABLE tipos_projeto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read tipos" ON tipos_projeto FOR SELECT USING (true);

ALTER TABLE status_material ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read status" ON status_material FOR SELECT USING (true);

ALTER TABLE temas_principais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read temas" ON temas_principais FOR SELECT USING (true);

ALTER TABLE nucleos_pecuaria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read nucleos_pec" ON nucleos_pecuaria FOR SELECT USING (true);

ALTER TABLE nucleos_agro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read nucleos_agro" ON nucleos_agro FOR SELECT USING (true);

ALTER TABLE operacoes_internas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read operacoes" ON operacoes_internas FOR SELECT USING (true);

ALTER TABLE marca_valorizacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read marca" ON marca_valorizacao FOR SELECT USING (true);

ALTER TABLE eventos_principais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read eventos" ON eventos_principais FOR SELECT USING (true);

ALTER TABLE funcoes_historicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read funcoes" ON funcoes_historicas FOR SELECT USING (true);

ALTER TABLE temas_secundarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read temas_sec" ON temas_secundarios FOR SELECT USING (true);

ALTER TABLE capitulos_filme ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read capitulos" ON capitulos_filme FOR SELECT USING (true);;