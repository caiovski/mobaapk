-- Adiciona coluna bill_200 para a nota de R$ 200,00
ALTER TABLE public.cash_register_entries
ADD COLUMN IF NOT EXISTS bill_200 INTEGER NOT NULL DEFAULT 0;
