-- =============================================================
-- Migration 50: RPC increment_product_view
-- =============================================================
-- Função RPC para incrementar o contador de visualizações
-- de um produto no dia atual. Usa upsert (INSERT ON CONFLICT)
-- para criar ou atualizar a linha em product_daily_views.
-- =============================================================

CREATE OR REPLACE FUNCTION public.increment_product_view(p_product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.product_daily_views (product_id, date, views)
  VALUES (p_product_id, CURRENT_DATE, 1)
  ON CONFLICT (product_id, date)
  DO UPDATE SET views = product_daily_views.views + 1;
END;
$$;

-- promo_date_range

ALTER TABLE products
ADD COLUMN promo_start_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN promo_end_at TIMESTAMPTZ DEFAULT NULL;
