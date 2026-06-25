-- Migration 55: order_payment_splits
-- Suporte ao método de pagamento "Múltiplo" (split de pagamento)
-- Permite registrar uma venda com múltiplas formas de pagamento

ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'multiplo';

CREATE TABLE IF NOT EXISTS order_payment_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_payment_splits_order_id ON order_payment_splits(order_id);

ALTER TABLE order_payment_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados podem ler splits" ON order_payment_splits
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados podem inserir splits" ON order_payment_splits
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados podem deletar splits" ON order_payment_splits
  FOR DELETE USING (auth.role() = 'authenticated');
