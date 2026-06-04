-- =============================================================
-- Migration 37: Add tracking timestamps to orders table
-- =============================================================
-- Adds prepared_at and delivering_at columns to track
-- real-time status timestamps on the client tracking screen.
-- Also updates update_order_status RPC to set these columns.
-- =============================================================

-- 1. Add new timestamp columns
ALTER TABLE public.orders
  ADD COLUMN prepared_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN delivering_at TIMESTAMP WITH TIME ZONE;

-- 2. Update RPC: set prepared_at / delivering_at on status transitions
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_current_status TEXT;
  v_user_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NAO_AUTENTICADO');
  END IF;

  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACESSO_NEGADO');
  END IF;

  SELECT status, user_id INTO v_current_status, v_user_id
  FROM public.orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  IF NOT (
    (v_current_status = 'processing' AND p_new_status = 'confirmed') OR
    (v_current_status = 'confirmed' AND p_new_status = 'preparing') OR
    (v_current_status = 'confirmed' AND p_new_status = 'cancelled') OR
    (v_current_status = 'preparing' AND p_new_status = 'delivering') OR
    (v_current_status = 'preparing' AND p_new_status = 'cancelled') OR
    (v_current_status = 'delivering' AND p_new_status = 'completed')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transição inválida');
  END IF;

  UPDATE public.orders
  SET status = p_new_status::order_status,
      updated_at = timezone('utc'::text, now()),
      prepared_at = CASE
        WHEN p_new_status = 'preparing' THEN timezone('utc'::text, now())
        WHEN p_new_status = 'delivering' THEN timezone('utc'::text, now())
        ELSE prepared_at
      END,
      delivering_at = CASE
        WHEN p_new_status = 'delivering' THEN timezone('utc'::text, now())
        ELSE delivering_at
      END
  WHERE id = p_order_id;

  INSERT INTO public.audit_logs (user_id, action, resource, resource_id, details)
  VALUES (auth.uid(), 'update_order_status', 'orders', p_order_id::TEXT,
    jsonb_build_object('from', v_current_status, 'to', p_new_status)
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'new_status', p_new_status,
    'user_id', v_user_id
  );
END;
$$;
