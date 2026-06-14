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
  const handleCancelOrder = async (order: any) => {
    if (order.status === 'cancelled') {
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
            try {
              setLoading(true);

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
