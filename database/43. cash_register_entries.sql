-- =============================================================
-- Migration 43: Cash Register Opening/Closing
-- =============================================================
-- Registra abertura e fechamento do caixa físico com
-- controle de cédulas e moedas do real brasileiro.
-- =============================================================

-- 1. Create the cash register entries table
CREATE TABLE IF NOT EXISTS public.cash_register_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('opening', 'closing')),
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
  total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_cash_register_date ON public.cash_register_entries(date);
CREATE INDEX IF NOT EXISTS idx_cash_register_code ON public.cash_register_entries(code);
CREATE INDEX IF NOT EXISTS idx_cash_register_type ON public.cash_register_entries(entry_type);

-- 3. Enable RLS
ALTER TABLE public.cash_register_entries ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Admin can do all operations
CREATE POLICY "admin_all_cash_register" ON public.cash_register_entries
  FOR ALL USING (public.is_admin());

-- 5. Helper function to generate the next code for a given date
CREATE OR REPLACE FUNCTION public.generate_cash_register_code(p_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_seq INTEGER;
  v_prefix TEXT;
BEGIN
  v_prefix := 'CAIXA-' || TO_CHAR(p_date, 'YYYYMMDD') || '-';
  SELECT COALESCE(MAX(SUBSTRING(code FROM '\d{3}$')::INTEGER), 0) + 1
    INTO v_seq
    FROM public.cash_register_entries
   WHERE code LIKE v_prefix || '%';
  RETURN v_prefix || LPAD(v_seq::TEXT, 3, '0');
END;
$$;
