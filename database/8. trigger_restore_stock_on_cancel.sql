-- =============================================================
-- Trigger: restore_stock_on_cancel
-- Descrição: Devolve os itens de um pedido de volta ao estoque
--            quando o status do pedido é alterado para 'cancelled'.
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_order_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    -- Loop por todos os itens do pedido com informações do produto
    FOR v_item IN 
      SELECT oi.product_id, oi.quantity, p.is_bulk
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = NEW.id
    LOOP
      -- Devolver a quantidade ao estoque do produto
      UPDATE public.products
      SET stock = stock + (CASE WHEN v_item.is_bulk THEN v_item.quantity * 1000 ELSE v_item.quantity END)
      WHERE id = v_item.product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger na tabela orders (AFTER UPDATE para garantir que a atualização ocorreu)
DROP TRIGGER IF EXISTS restore_stock_on_cancel ON public.orders;

CREATE TRIGGER restore_stock_on_cancel
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_cancellation();
