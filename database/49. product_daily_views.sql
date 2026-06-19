-- =============================================================
-- Migration 49: Produtos Mais Acessados (Daily Views)
-- =============================================================
-- Rastreia visualizações de produtos por dia para alimentar
-- a seção "Produtos Mais Acessados Hoje" no catálogo.
-- =============================================================

-- 1. Create the daily views table
CREATE TABLE IF NOT EXISTS public.product_daily_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE(product_id, date)
);

-- 2. Index for fast querying today's top viewed
CREATE INDEX IF NOT EXISTS idx_product_daily_views_date_views
  ON public.product_daily_views (date DESC, views DESC);

-- 3. Enable RLS
ALTER TABLE public.product_daily_views ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Authenticated users can insert/update views
CREATE POLICY "authenticated_upsert_product_daily_views" ON public.product_daily_views
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_update_product_daily_views" ON public.product_daily_views
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. RLS: Anyone can read
CREATE POLICY "authenticated_select_product_daily_views" ON public.product_daily_views
  FOR SELECT USING (auth.role() = 'authenticated');
