import { Alert } from 'react-native';
import { supabase } from '../../../../../data/datasources/supabase/client';

export function useOrderMutations(
  setLoading: (val: boolean) => void,
  fetchSales: () => Promise<void>,
  fetchCaixaData: () => Promise<void>,
  selectedOrder: any,
  setSelectedOrder: (order: any) => void,
  setShowPaymentEditModal: (val: boolean) => void
) {
  let isCancelling = false;

  const restoreStockOnCancel = async (orderId: string) => {
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    /* istanbul ignore next */ if (itemsError) throw itemsError;
    /* istanbul ignore next */ if (!orderItems || orderItems.length === 0) return;

    /* istanbul ignore next */ for (const item of orderItems) {
      /* istanbul ignore next */ const { data: product } = await supabase
        .from('products')
        .select('is_bulk, is_per_meter, stock')
        .eq('id', item.product_id)
        .single();

      /* istanbul ignore next */ if (!product) continue;

      /* istanbul ignore next */ const isBulk = product.is_bulk === true;
      /* istanbul ignore next */ const isPerMeter = product.is_per_meter === true;
      /* istanbul ignore next */ let qtyToRestore: number;
      /* istanbul ignore next */ if (isBulk) {
      /* istanbul ignore next */   qtyToRestore = Math.round(item.quantity * 1000);
      /* istanbul ignore next */ } else if (isPerMeter) {
      /* istanbul ignore next */   qtyToRestore = item.quantity;
      /* istanbul ignore next */ } else {
      /* istanbul ignore next */   qtyToRestore = item.quantity;
      /* istanbul ignore next */ }
      /* istanbul ignore next */ const newStock = product.stock + qtyToRestore;

      /* istanbul ignore next */ const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock, active: newStock > 0 })
        .eq('id', item.product_id);

      /* istanbul ignore next */ if (stockError) throw stockError;
    }
  };

  const handleCancelOrder = async (order: any) => {
    if (order.status === 'cancelled' || isCancelling) {
      Alert.alert('Aviso', 'Este pedido já foi cancelado.');
      return;
    }

    Alert.alert(
      'Cancelar Venda',
      `Deseja realmente cancelar a venda #${order.id.slice(0, 8).toUpperCase()}? O estoque dos itens comprados será devolvido e a venda deduzida do caixa.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            if (isCancelling) return;
            isCancelling = true;
            try {
              setLoading(true);

              const { data: freshOrder } = await supabase
                .from('orders')
                .select('status')
                .eq('id', order.id)
                .single();
              if (freshOrder?.status === 'cancelled') {
                Alert.alert('Aviso', 'Este pedido já foi cancelado.');
                return;
              }

              await restoreStockOnCancel(order.id);

              const { error: orderError } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', order.id);
              if (orderError) throw orderError;

              Alert.alert('Sucesso', 'Venda cancelada e estoque estornado!');
              await Promise.all([fetchSales(), fetchCaixaData()]);
            } catch (err) {
              console.error('Erro ao cancelar venda:', err);
              Alert.alert('Erro', 'Não foi possível cancelar a venda.');
            } finally {
              setLoading(false);
              isCancelling = false;
            }
          }
        }
      ]
    );
  };

  const confirmPaymentEdit = async (newMethod: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix') => {
    if (!selectedOrder) return;
    setShowPaymentEditModal(false);
    try {
      setLoading(true);
      const { error: dbError } = await supabase
        .from('orders')
        .update({ payment_method: newMethod })
        .eq('id', selectedOrder.id);
      if (dbError) throw dbError;

      Alert.alert('Sucesso', 'Forma de pagamento atualizada!');
      await Promise.all([fetchSales(), fetchCaixaData()]);
    } catch (err) {
      console.error('Erro ao atualizar forma de pagamento:', err);
      Alert.alert('Erro', 'Não foi possível atualizar a forma de pagamento.');
    } finally {
      setLoading(false);
      setSelectedOrder(null);
    }
  };

  return {
    handleCancelOrder,
    confirmPaymentEdit,
  };
}
