-- Migration 49: Update cash register code format to DDMMYYYY
-- Altera o formato de CAIXA-YYYYMMDD-NNN para CAIXA-DDMMYYYY-NNN

CREATE OR REPLACE FUNCTION generate_cash_register_code(p_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_seq INTEGER;
  v_prefix TEXT;
BEGIN
  v_prefix := 'CAIXA-' || TO_CHAR(p_date, 'DDMMYYYY') || '-';
  SELECT COALESCE(MAX(SUBSTRING(code FROM '\d{3}$')::INTEGER), 0) + 1
    INTO v_seq
    FROM public.cash_register_entries
   WHERE code LIKE v_prefix || '%';
  RETURN v_prefix || LPAD(v_seq::TEXT, 3, '0');
END;
$$;

-- Esse código é uma alteração do 43. 43. cash_register_entries.sql
-- Que altera o formato do código de CAIXA-YYYYMMDD-NNN para CAIXA-DDMMYYYY-NNN