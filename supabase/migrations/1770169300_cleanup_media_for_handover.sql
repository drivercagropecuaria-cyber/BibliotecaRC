-- Limpeza total de mídias e registros de upload para entrega
-- Mantém estrutura, permissões e dados de taxonomia intactos

-- Remover objetos do Storage (acervo-files e acervo-arquivos)
DELETE FROM storage.objects
WHERE bucket_id IN ('acervo-files', 'acervo-arquivos');

-- Limpar tabelas de mídia e jobs
TRUNCATE TABLE public.outbox_events RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.upload_jobs RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.catalogo_itens RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.media_assets RESTART IDENTITY CASCADE;

-- Limpar trilha de auditoria de catálogo
TRUNCATE TABLE public.catalogo_audit RESTART IDENTITY CASCADE;
