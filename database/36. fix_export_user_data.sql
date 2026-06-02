-- Cria a RPC export_user_data (LGPD)
CREATE OR REPLACE FUNCTION public.export_user_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_profile JSONB;
  v_orders JSONB;
  v_payments JSONB;
  v_audit_logs JSONB;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NAO_AUTENTICADO');
  END IF;

  SELECT row_to_json(u)::JSONB INTO v_profile
  FROM (
    SELECT id, name, email, phone, address, city, cep, username,
           rua, bairro, numero, lat, lng, role, created_at
    FROM public.users
    WHERE id = v_user_id
  ) u;

  SELECT jsonb_agg(
    jsonb_build_object(
      'order', row_to_json(o),
      'items', (
        SELECT jsonb_agg(row_to_json(oi))
        FROM public.order_items oi
        WHERE oi.order_id = o.id
      ),
      'messages', (
        SELECT jsonb_agg(row_to_json(om))
        FROM public.order_messages om
        WHERE om.order_id = o.id
      )
    )
  ) INTO v_orders
  FROM public.orders o
  WHERE o.user_id = v_user_id;

  SELECT jsonb_agg(row_to_json(pt)) INTO v_payments
  FROM public.payment_transactions pt
  WHERE pt.order_id IN (SELECT id FROM public.orders WHERE user_id = v_user_id);

  SELECT jsonb_agg(row_to_json(al)) INTO v_audit_logs
  FROM (
    SELECT id, action, resource, resource_id, details, created_at
    FROM public.audit_logs
    WHERE user_id = v_user_id
    ORDER BY created_at DESC
  ) al;

  INSERT INTO public.audit_logs (user_id, action, resource, resource_id, details)
  VALUES (v_user_id, 'export_user_data', 'users', v_user_id::TEXT,
    jsonb_build_object('exported_at', timezone('utc'::text, now()))
  );

  RETURN jsonb_build_object(
    'success', true,
    'exported_at', timezone('utc'::text, now()),
    'profile', v_profile,
    'orders', COALESCE(v_orders, '[]'::JSONB),
    'payments', COALESCE(v_payments, '[]'::JSONB),
    'audit_logs', COALESCE(v_audit_logs, '[]'::JSONB)
  );
END;
$$;
