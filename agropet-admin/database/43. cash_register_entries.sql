-- Migration 43: cash_register_entries
-- Tabela única para abertura e fechamento do caixa

CREATE TABLE IF NOT EXISTS cash_register_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  code TEXT NOT NULL,
  date DATE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('opening', 'closing')),
  bill_200 INTEGER NOT NULL DEFAULT 0,
  bill_100 INTEGER NOT NULL DEFAULT 0,
  bill_50 INTEGER NOT NULL DEFAULT 0,
  bill_20 INTEGER NOT NULL DEFAULT 0,
  bill_10 INTEGER NOT NULL DEFAULT 0,
  bill_5 INTEGER NOT NULL DEFAULT 0,
  bill_2 INTEGER NOT NULL DEFAULT 0,
  coin_100 INTEGER NOT NULL DEFAULT 0,
  coin_050 INTEGER NOT NULL DEFAULT 0,
  coin_025 INTEGER NOT NULL DEFAULT 0,
  coin_010 INTEGER NOT NULL DEFAULT 0,
  coin_005 INTEGER NOT NULL DEFAULT 0,
  total_value DOUBLE PRECISION NOT NULL DEFAULT 0,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(code)
);

CREATE INDEX IF NOT EXISTS idx_cash_register_date ON cash_register_entries(date);
CREATE INDEX IF NOT EXISTS idx_cash_register_entry_type ON cash_register_entries(entry_type);

ALTER TABLE cash_register_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados podem ler entradas" ON cash_register_entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode inserir entradas" ON cash_register_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin pode atualizar entradas" ON cash_register_entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Função para gerar código sequencial por dia
CREATE OR REPLACE FUNCTION generate_cash_register_code(p_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  seq INTEGER;
  code TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SPLIT_PART(code, '-', 3) AS INTEGER)), 0) + 1
  INTO seq
  FROM cash_register_entries
  WHERE date = p_date;

  code := 'CAIXA-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD(seq::TEXT, 3, '0');
  RETURN code;
END;
$$;
