-- Migration: alterar order_items.quantity de INTEGER para NUMERIC(10,3)
-- Motivo: itens à granel e por metro precisam armazenar Kg/m com decimais
--   (ex: 0,500 Kg para 500g, 1,500 m para 1 metro e meio)

ALTER TABLE public.order_items
  ALTER COLUMN quantity TYPE NUMERIC(10,3) USING quantity::numeric(10,3);
