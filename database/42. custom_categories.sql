-- =============================================================
-- Migration 42: Custom Categories for Dynamic Filter
-- =============================================================
-- Substitui as categorias hardcoded (Ração, Pesca, Sementes, Adubo)
-- por um sistema dinâmico onde o admin cria/gerencia categorias
-- com palavras-chave personalizadas.
-- =============================================================

-- 1. Create the custom categories table
CREATE TABLE IF NOT EXISTS public.custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Index for fast listing
CREATE INDEX IF NOT EXISTS idx_custom_categories_active ON public.custom_categories(active);

-- 3. Enable RLS
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Admin can do all operations
CREATE POLICY "admin_all_custom_categories" ON public.custom_categories
  FOR ALL USING (public.is_admin());

-- 5. RLS: Any authenticated user can read active categories
CREATE POLICY "authenticated_select_active_custom_categories" ON public.custom_categories
  FOR SELECT USING (active = true);

-- 6. Seed the 4 legacy categories (idempotent)
INSERT INTO public.custom_categories (name, keywords)
SELECT 'Ração', ARRAY['ração','cachorro','cachorros','canino','caninos','felino','felinos','racao','dog chow','pedigree','besser','purina','whiskas','granplus','premium','cão','cães','gato','gatos','vaca','porco','frango','galinha','galinhas']
WHERE NOT EXISTS (SELECT 1 FROM public.custom_categories WHERE name = 'Ração');

INSERT INTO public.custom_categories (name, keywords)
SELECT 'Pesca', ARRAY['pesca','vara','anzol','linha','molinete','boia','bóia','isca','carretilha','pescaria']
WHERE NOT EXISTS (SELECT 1 FROM public.custom_categories WHERE name = 'Pesca');

INSERT INTO public.custom_categories (name, keywords)
SELECT 'Sementes', ARRAY['semente','semeadura','sementes','girassol','milho','alpiste','grão','grãos','erva','ervas','erva-doce','ervadoce']
WHERE NOT EXISTS (SELECT 1 FROM public.custom_categories WHERE name = 'Sementes');

INSERT INTO public.custom_categories (name, keywords)
SELECT 'Adubo', ARRAY['adubo','fertilizante','terra','substrato','humus','húmus','calpiso','calcario']
WHERE NOT EXISTS (SELECT 1 FROM public.custom_categories WHERE name = 'Adubo');
