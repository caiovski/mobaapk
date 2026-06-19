-- =============================================================
-- Migration 48: Desconto Promocional (Discount Percentage)
-- =============================================================
-- Adiciona coluna discount_percentage à tabela products.
-- Quando preenchida (1-100), o produto está em promoção
-- e o preço exibido no catálogo é calculado como:
--   preco_promocional = preco - (preco * discount_percentage / 100)
-- =============================================================

ALTER TABLE public.products
  ADD COLUMN discount_percentage INTEGER DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_products_discount_percentage
  ON public.products (discount_percentage)
  WHERE discount_percentage IS NOT NULL;
  