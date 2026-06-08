-- =============================================================
-- Migration 41: Add delivery_tracking table for real-time GPS
-- =============================================================
-- Stores GPS positions sent by the admin's phone while
-- delivering an order (from "Saiu para entrega" to "Concluir entrega").
-- Both client and admin read from this table for real car position.
-- =============================================================

-- 1. Create the tracking table
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON public.delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_created_at ON public.delivery_tracking(created_at);

-- 3. Enable RLS
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

-- 4. RLS: Only admin can insert
CREATE POLICY "admin_insert_delivery_tracking" ON public.delivery_tracking
  FOR INSERT WITH CHECK (public.is_admin());

-- 5. RLS: Client can only read if they own the order
CREATE POLICY "client_select_delivery_tracking" ON public.delivery_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = delivery_tracking.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- 6. RLS: Admin can read any delivery tracking
CREATE POLICY "admin_select_delivery_tracking" ON public.delivery_tracking
  FOR SELECT USING (public.is_admin());
