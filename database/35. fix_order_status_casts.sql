-- =============================================================
-- Fix: Cast explícito de order_status em RPCs
-- Correção: v_order_status agora é order_status (não TEXT)
-- e UPDATE usa ::order_status
-- =============================================================

-- 1. finalizar_pedido
DROP FUNCTION IF EXISTS public.finalizar_pedido;

CREATE OR REPLACE FUNCTION public.finalizar_pedido(
  p_user_id UUID,
  p_items JSONB,
  p_payment_method payment_method,
  p_delivery_type TEXT DEFAULT 'retirada',
  p_delivery_address TEXT DEFAULT '',
  p_needs_change TEXT DEFAULT '',
  p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product RECORD;
  v_total DECIMAL(10,2) := 0;
  v_insufficient JSONB := '[]'::JSONB;
  v_cached JSONB;
  v_result JSONB;
  v_order_status order_status;
  v_sorted_items JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'NAO_AUTENTICADO';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'ACESSO_NEGADO';
  END IF;

  SET LOCAL lock_timeout = '5000';

  IF p_idempotency_key IS NOT NULL THEN
    SELECT response INTO v_cached
    FROM public.idempotency_keys
    WHERE id = p_idempotency_key;

    IF FOUND THEN
      RETURN v_cached;
    END IF;
  END IF;

  v_sorted_items := (
    SELECT jsonb_agg(el ORDER BY el->>'product_id')
    FROM jsonb_array_elements(p_items) el
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_sorted_items)
  LOOP
    BEGIN
      SELECT id, name, stock, active INTO v_product
      FROM public.products
      WHERE id = (v_item->>'product_id')::UUID
      FOR UPDATE NOWAIT;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'PRODUTO_NAO_ENCONTRADO:%',
          jsonb_build_object(
            'product_id', v_item->>'product_id'
          )::TEXT;
      END IF;

      IF NOT v_product.active THEN
        v_insufficient := v_insufficient || jsonb_build_object(
          'product_id', v_product.id,
          'name', v_product.name,
          'requested', (v_item->>'quantity')::INTEGER,
          'available', 0
        );
        CONTINUE;
      END IF;

      IF v_product.stock < (v_item->>'quantity')::INTEGER THEN
        v_insufficient := v_insufficient || jsonb_build_object(
          'product_id', v_product.id,
          'name', v_product.name,
          'requested', (v_item->>'quantity')::INTEGER,
          'available', v_product.stock
        );
      END IF;
    EXCEPTION
      WHEN lock_not_available THEN
        RAISE EXCEPTION 'RECURSO_OCUPADO';
    END;
  END LOOP;

  IF jsonb_array_length(v_insufficient) > 0 THEN
    RAISE EXCEPTION 'ESTOQUE_INSUFICIENTE:%', v_insufficient::TEXT;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_total := v_total + (
      (v_item->>'unit_price')::DECIMAL * (v_item->>'quantity')::INTEGER
    );
  END LOOP;

  IF p_payment_method = 'pix' THEN
    v_order_status := 'processing'::order_status;
  ELSE
    v_order_status := 'confirmed'::order_status;
  END IF;

  INSERT INTO public.orders (
    user_id, status, total, delivery_type,
    payment_method, delivery_address, needs_change
  )
  VALUES (
    p_user_id, v_order_status, v_total, p_delivery_type,
    p_payment_method, p_delivery_address, p_needs_change
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::DECIMAL
    );

    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  IF p_payment_method = 'pix' THEN
    INSERT INTO public.payment_transactions (order_id, payment_method, amount, status)
    VALUES (v_order_id, 'pix', v_total, 'pending');
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'total', v_total
  );

  IF p_idempotency_key IS NOT NULL THEN
    BEGIN
      INSERT INTO public.idempotency_keys (id, response)
      VALUES (p_idempotency_key, v_result);
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END IF;

  RETURN v_result;
END;
$$;

-- 2. update_order_status
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
      updated_at = timezone('utc'::text, now())
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
