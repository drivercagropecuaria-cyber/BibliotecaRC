-- Migration: enable_rls_taxonomy
-- Created at: 1769934355

ALTER TABLE taxonomy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE naming_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read taxonomy" ON taxonomy_categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert taxonomy" ON taxonomy_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update taxonomy" ON taxonomy_categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete taxonomy" ON taxonomy_categories FOR DELETE USING (true);

CREATE POLICY "Allow public read naming" ON naming_rules FOR SELECT USING (true);
CREATE POLICY "Allow public insert naming" ON naming_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update naming" ON naming_rules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete naming" ON naming_rules FOR DELETE USING (true);

-- Inserir regra de nomenclatura padrao
INSERT INTO naming_rules (name, pattern, is_default) VALUES 
('Padrao RC', '{area}/{data}/{area}_{ponto}_{tipo}_{titulo}_{seq}.{ext}', true);;