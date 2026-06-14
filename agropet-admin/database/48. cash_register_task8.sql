-- Migration 48: Task 8 - Cash register fixes
-- Adds missing columns for the new state machine

ALTER TABLE public.cash_register_entries
ADD COLUMN IF NOT EXISTS bill_200 INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.cash_register_entries
ADD COLUMN IF NOT EXISTS closed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.cash_register_entries
ADD COLUMN IF NOT EXISTS auto_closed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.cash_register_entries
ADD COLUMN IF NOT EXISTS skip_message TEXT;
