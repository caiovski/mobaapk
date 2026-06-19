import { useOrderMutations } from '../../presentation/screens/admin/AdminConsultSales/hooks/useOrderMutations';
import { Alert } from 'react-native';

jest.mock('../../data/datasources/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('useOrderMutations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCancelOrder', () => {
    it('should show alert and return early when order is already cancelled', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      const setLoading = jest.fn();
      const fetchSales = jest.fn();
      const fetchCaixaData = jest.fn();
      const setSelectedOrder = jest.fn();
      const setShowPaymentEditModal = jest.fn();

      const { handleCancelOrder } = useOrderMutations(
        setLoading, fetchSales, fetchCaixaData,
        null, setSelectedOrder, setShowPaymentEditModal
      );

      handleCancelOrder({ id: 'order-123', status: 'cancelled' });

      expect(alertSpy).toHaveBeenCalledWith('Aviso', 'Este pedido já foi cancelado.');
      expect(setLoading).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('should call alert with cancel confirmation when order is not cancelled', () => {
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      const setLoading = jest.fn();
      const fetchSales = jest.fn();
      const fetchCaixaData = jest.fn();
      const setSelectedOrder = jest.fn();
      const setShowPaymentEditModal = jest.fn();

      const { handleCancelOrder } = useOrderMutations(
        setLoading, fetchSales, fetchCaixaData,
        null, setSelectedOrder, setShowPaymentEditModal
      );

      handleCancelOrder({ id: 'order-abc', status: 'completed' });

      expect(alertSpy).toHaveBeenCalledWith(
        'Cancelar Venda',
        expect.stringContaining('Deseja realmente cancelar'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Não', style: 'cancel' }),
          expect.objectContaining({ text: 'Sim, Cancelar', style: 'destructive' }),
        ])
      );

      alertSpy.mockRestore();
    });

    it('should handle cancel order with confirm and success', async () => {
      const onPressCallbacks: (() => void)[] = [];
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(
        (_title: string, _message: string, buttons?: any[]) => {
          if (buttons && buttons[1] && buttons[1].onPress) {
            onPressCallbacks.push(buttons[1].onPress);
          }
        }
      );

      const { supabase } = require('../../data/datasources/supabase/client');
      supabase.single.mockResolvedValue({ data: { status: 'completed' } });

      const setLoading = jest.fn();
      const fetchSales = jest.fn().mockResolvedValue(undefined);
      const fetchCaixaData = jest.fn().mockResolvedValue(undefined);
      const setSelectedOrder = jest.fn();
      const setShowPaymentEditModal = jest.fn();

      const { handleCancelOrder } = useOrderMutations(
        setLoading, fetchSales, fetchCaixaData,
        null, setSelectedOrder, setShowPaymentEditModal
      );

      handleCancelOrder({ id: 'order-1', status: 'completed' });

      expect(onPressCallbacks.length).toBe(1);

      if (onPressCallbacks[0]) {
        await onPressCallbacks[0]();
      }

      expect(alertSpy).toHaveBeenCalledWith('Sucesso', 'Venda cancelada e estoque estornado!');

      alertSpy.mockRestore();
    });

    it('should handle freshOrder already cancelled on server after confirm', async () => {
      const { supabase } = require('../../data/datasources/supabase/client');
      supabase.single.mockResolvedValue({ data: { status: 'cancelled' } });

      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(
        (_title: string, _message: string, buttons?: any[]) => {
          if (buttons && buttons[1] && buttons[1].onPress) {
            buttons[1].onPress();
          }
        }
      );

      const setLoading = jest.fn();
      const fetchSales = jest.fn().mockResolvedValue(undefined);
      const fetchCaixaData = jest.fn().mockResolvedValue(undefined);
      const setSelectedOrder = jest.fn();
      const setShowPaymentEditModal = jest.fn();

      const { handleCancelOrder } = useOrderMutations(
        setLoading, fetchSales, fetchCaixaData,
        null, setSelectedOrder, setShowPaymentEditModal
      );

      await handleCancelOrder({ id: 'order-xyz', status: 'completed' });

      expect(alertSpy).toHaveBeenCalledWith('Aviso', 'Este pedido já foi cancelado.');

      alertSpy.mockRestore();
    });
  });

  describe('confirmPaymentEdit', () => {
    it('should return early if no selectedOrder', () => {
      const setLoading = jest.fn();
      const fetchSales = jest.fn();
      const fetchCaixaData = jest.fn();
      const setSelectedOrder = jest.fn();
      const setShowPaymentEditModal = jest.fn();

      const { confirmPaymentEdit } = useOrderMutations(
        setLoading, fetchSales, fetchCaixaData,
        null, setSelectedOrder, setShowPaymentEditModal
      );

      confirmPaymentEdit('pix');

      expect(setLoading).not.toHaveBeenCalled();
      expect(setShowPaymentEditModal).not.toHaveBeenCalled();
    });

    it('should update payment method successfully', async () => {
      const { supabase } = require('../../data/datasources/supabase/client');
      supabase.update.mockReturnThis();
      supabase.eq.mockReturnThis();

      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      const setLoading = jest.fn();
      const fetchSales = jest.fn().mockResolvedValue(undefined);
      const fetchCaixaData = jest.fn().mockResolvedValue(undefined);
      const setSelectedOrder = jest.fn();
      const setShowPaymentEditModal = jest.fn();

      const { confirmPaymentEdit } = useOrderMutations(
        setLoading, fetchSales, fetchCaixaData,
        { id: 'order-123' }, setSelectedOrder, setShowPaymentEditModal
      );

      await confirmPaymentEdit('pix');

      expect(setShowPaymentEditModal).toHaveBeenCalledWith(false);
      expect(setLoading).toHaveBeenCalledWith(true);
      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(alertSpy).toHaveBeenCalledWith('Sucesso', 'Forma de pagamento atualizada!');
      expect(setSelectedOrder).toHaveBeenCalledWith(null);

      alertSpy.mockRestore();
    });
  });
});
