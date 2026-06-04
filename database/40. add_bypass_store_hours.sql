-- =============================================================
-- Migration 40: Add bypass_store_hours column to users table
-- =============================================================
-- Allows admin to mark specific users (including devs) as
-- authorized to purchase/track orders even when the store
-- is closed. Useful for testing.
-- =============================================================

-- 1. Add new boolean column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bypass_store_hours BOOLEAN NOT NULL DEFAULT false;

-- 2. Enable admins to update this column (RLS policy)
CREATE POLICY "Admin can update bypass_store_hours" ON public.users
  FOR UPDATE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
