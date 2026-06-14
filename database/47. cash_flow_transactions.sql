-- =============================================================
-- Migration 47: Cash Flow Transactions (Sangria/Suprimento)
-- =============================================================
-- Armazena sangria (retirada) e suprimento (entrada) de caixa
-- com suporte a tempo real entre dispositivos admin.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.cash_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sangria', 'suprimento')),
  payment_method TEXT NOT NULL DEFAULT 'dinheiro' CHECK (payment_method IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_cash_flow" ON public.cash_flow
  FOR ALL USING (public.is_admin());

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_flow;
