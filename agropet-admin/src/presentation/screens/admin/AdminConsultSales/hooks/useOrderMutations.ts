import { Alert } from 'react-native';
import { supabase } from '../../../../../data/datasources/supabase/client';

let isCancelling = false;

export function useOrderMutations(
  setLoading: (val: boolean) => void,
  fetchSales: () => Promise<void>,
  fetchCaixaData: () => Promise<void>,
  selectedOrder: any,
  setSelectedOrder: (order: any) => void,
  setShowPaymentEditModal: (val: boolean) => void
) {

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
            /* istanbul ignore next */ if (isCancelling) return;
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

              const { error: deleteSplitsError } = await supabase
                .from('order_payment_splits')
                .delete()
                .eq('order_id', order.id);
              /* istanbul ignore next */ if (deleteSplitsError) throw deleteSplitsError;

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

      if (selectedOrder.payment_method === 'multiplo') {
        const { error: deleteError } = await supabase
          .from('order_payment_splits')
          .delete()
          .eq('order_id', selectedOrder.id);
        /* istanbul ignore next */ if (deleteError) throw deleteError;
      }

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
