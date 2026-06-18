-- Migration: corrigir finalizar_pedido para usar NUMERIC em quantity
-- Motivo: o RPC usava ::INTEGER para quantity, o que trunca decimais
--   (ex: 2,5m vira 2, estoque deduz 2 ao invés de 2,5)
-- Agora usa ::NUMERIC(10,3) para preservar decimais.

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
  v_qty NUMERIC(10,3);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'NAO_AUTENTICADO';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'ACESSO_NEGADO';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT response INTO v_cached
    FROM public.idempotency_keys
    WHERE id = p_idempotency_key;

    IF FOUND THEN
      RETURN v_cached;
    END IF;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::NUMERIC(10,3);

    SELECT id, name, stock, active INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

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
        'requested', v_qty,
        'available', 0
      );
      CONTINUE;
    END IF;

    IF v_product.stock < v_qty THEN
      v_insufficient := v_insufficient || jsonb_build_object(
        'product_id', v_product.id,
        'name', v_product.name,
        'requested', v_qty,
        'available', v_product.stock
      );
    END IF;
  END LOOP;

  IF jsonb_array_length(v_insufficient) > 0 THEN
    RAISE EXCEPTION 'ESTOQUE_INSUFICIENTE:%', v_insufficient::TEXT;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::NUMERIC(10,3);
    v_total := v_total + (
      (v_item->>'unit_price')::DECIMAL * v_qty
    );
  END LOOP;

  IF p_payment_method = 'pix' THEN
    v_order_status := 'processing'::order_status;
  ELSE
    v_order_status := 'confirmed'::order_status;
  END IF;

  INSERT INTO public.orders (
    user_id, status, total, delivery_type,
    payment_method, delivery_address, needs_change,
    confirmed_at
  )
  VALUES (
    p_user_id, v_order_status, v_total, p_delivery_type,
    p_payment_method, p_delivery_address, p_needs_change,
    CASE WHEN v_order_status = 'confirmed' THEN timezone('utc'::text, now()) ELSE NULL END
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::NUMERIC(10,3);

    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_qty,
      (v_item->>'unit_price')::DECIMAL
    );

    UPDATE public.products
    SET stock = stock - v_qty
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
