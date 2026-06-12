-- =============================================================
-- Migration 44: Produto à Granel (Bulk Product)
-- =============================================================
-- Adiciona coluna is_bulk à tabela products para suportar
-- produtos vendidos por peso (Kg/g), com estoque armazenado
-- em gramas (INTEGER) na coluna stock existente.
-- =============================================================

ALTER TABLE public.products
  ADD COLUMN is_bulk BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_is_bulk
  ON public.products (is_bulk);
