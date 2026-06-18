-- Migration: alterar products.stock de INTEGER para NUMERIC(10,3)
-- Motivo: produtos por metro (is_per_meter) precisam armazenar metros com decimais
--   (ex: 117,5 m após deduzir 2,5 m de 120 m)
-- Produtos à granel (is_bulk) continuam tendo estoque em gramas (inteiros),
--   mas NUMERIC(10,3) aceita ambos sem perda.

ALTER TABLE public.products
  ALTER COLUMN stock TYPE NUMERIC(10,3) USING stock::numeric(10,3);
