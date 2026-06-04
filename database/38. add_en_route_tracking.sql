-- =============================================================
-- Migration 38: Add en_route_at column and sub-status support
-- =============================================================
-- Adds en_route_at column to track when the driver is
-- within 200m proximity of the customer (auto-triggered by GPS).
-- Also adds RPC for sub-status transitions within 'delivering' phase.
-- =============================================================

-- 1. Add new timestamp column
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS en_route_at TIMESTAMP WITH TIME ZONE;

-- 2. RPC: mark departure (admin clicks "Saiu para a entrega")
CREATE OR REPLACE FUNCTION public.mark_delivery_departure(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NAO_AUTENTICADO');
  END IF;

  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACESSO_NEGADO');
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  UPDATE public.orders
  SET delivering_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_order_id;

  INSERT INTO public.audit_logs (user_id, action, resource, resource_id, details)
  VALUES (auth.uid(), 'mark_delivery_departure', 'orders', p_order_id::TEXT,
    jsonb_build_object('event', 'saiu_para_entrega')
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_user_id
  );
END;
$$;

-- 3. RPC: mark en route (auto-triggered by GPS < 200m)
CREATE OR REPLACE FUNCTION public.mark_en_route(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_user_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NAO_AUTENTICADO');
  END IF;

  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACESSO_NEGADO');
  END IF;

  SELECT user_id INTO v_user_id
  FROM public.orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  UPDATE public.orders
  SET en_route_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_order_id;

  INSERT INTO public.audit_logs (user_id, action, resource, resource_id, details)
  VALUES (auth.uid(), 'mark_en_route', 'orders', p_order_id::TEXT,
    jsonb_build_object('event', 'a_caminho_200m')
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_user_id
  );
END;
$$;

-- 4. Update existing update_order_status RPC: remove delivering_at from preparing→delivering
-- (delivering_at is now set by mark_delivery_departure instead)
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
    (v_current_status = 'delivering' AND p_new_status = 'completed') OR
    (v_current_status = 'delivering' AND p_new_status = 'cancelled')
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
