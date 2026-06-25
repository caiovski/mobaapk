-- =============================================================
-- Migration: Cancelamento de Pedido PIX
-- Descrição: Cancela um pedido PIX não pago e restaura o
--            estoque dos produtos. Deve ser chamado quando
--            o usuário sai da tela de confirmação sem pagar.
-- =============================================================

CREATE OR REPLACE FUNCTION public.cancel_pix_order(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  SELECT id, status INTO v_order
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  IF v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pedido já cancelado');
  END IF;

  IF v_order.status = 'confirmed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pedido já confirmado');
  END IF;


  UPDATE public.payment_transactions
  SET status = 'failed'
  WHERE order_id = p_order_id AND status = 'pending';

  UPDATE public.orders
  SET status = 'cancelled',
      updated_at = v_now
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', 'cancelled'
  );
END;
$$;
