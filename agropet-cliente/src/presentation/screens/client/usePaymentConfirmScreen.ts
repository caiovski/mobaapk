import { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../../data/datasources/supabase/client';
import { NotificationService } from '../../../services/notificationService';
import { generatePixPayload } from '../../utils/pixPayload';

export default function usePaymentConfirmScreen(route: any, navigation: any) {
  const { isDarkMode, colors } = useTheme();
  const { user } = useContext(AuthContext);
  const { orderId, paymentMethod, total } = route.params || {};
  const isPix = paymentMethod === 'pix';

  const [searchText, setSearchText] = useState('');
  const [deliveryActive, setDeliveryActive] = useState(true);

  const [pixKey, setPixKey] = useState('');
  const [pixMerchant, setPixMerchant] = useState('');
  const [pixStatus, setPixStatus] = useState<'pending' | 'paid' | 'checking'>('pending');
  const [loadingPix, setLoadingPix] = useState(isPix);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [errorPix, setErrorPix] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const pixPayload = useMemo(() => {
    if (!pixKey || !total) return '';
    return generatePixPayload({
      pixKey,
      merchantName: pixMerchant || 'Loja',
      amount: Number(total),
      txid: orderId || '***',
      city: 'CIDADE',
    });
  }, [pixKey, pixMerchant, total, orderId]);

  useEffect(() => {
    if (!isPix) return;

    const fetchPixKey = async () => {
      try {
        setLoadingPix(true);
        const { data, error } = await supabase.rpc('get_pix_key');
        if (!error && data) {
          setPixKey(data.chave_pix || '');
          setPixMerchant(data.pix_merchant_name || '');
          if (!data.chave_pix) {
            setErrorPix('Chave PIX não configurada pela loja.');
          }
        }
      } catch (e) {
        setErrorPix('Erro ao carregar dados PIX.');
      } finally {
        setLoadingPix(false);
      }
    };

    fetchPixKey();
  }, [isPix]);

  useEffect(() => {
    if (!isPix || !orderId) return;

    const checkStatus = async () => {
      if (pixStatus === 'paid') return;
      try {
        const { data, error } = await supabase.rpc('check_pix_status', { p_order_id: orderId });
        if (!error && data?.transaction_status === 'paid') {
          setPixStatus('paid');
        }
      } catch (e) {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [isPix, orderId, pixStatus]);

  const handleConfirmPayment = useCallback(async () => {
    if (!orderId) return;
    setPixStatus('checking');
    try {
      const { data, error } = await supabase.rpc('confirm_pix_payment', { p_order_id: orderId });
      if (!error && data?.success) {
        setPixStatus('paid');
        if (user?.id) {
          NotificationService.sendOrderStatusNotification(user.id, orderId, 'confirmed');
        }
      } else {
        setErrorPix(data?.error || 'Erro ao confirmar pagamento.');
        setPixStatus('pending');
      }
    } catch (e) {
      setErrorPix('Erro de conexão ao confirmar.');
      setPixStatus('pending');
    }
  }, [orderId]);

  const handleCopyPixKey = useCallback(async () => {
    if (!pixKey) return;
    await Clipboard.setStringAsync(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  }, [pixKey]);

  const handleCopyPixPayload = useCallback(async () => {
    if (!pixPayload) return;
    await Clipboard.setStringAsync(pixPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
  }, [pixPayload]);

  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('delivery_active')
          .maybeSingle();
        if (data && !error && data.delivery_active !== undefined) {
          setDeliveryActive(data.delivery_active);
        }
      } catch (e) {}
    };

    fetchDeliveryStatus();

    const settingsChannelName = `store_settings_confirm_tabs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(settingsChannelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          if (payload.new && (payload.new as any).delivery_active !== undefined) {
            setDeliveryActive((payload.new as any).delivery_active);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    isDarkMode, colors, navigation,
    orderId, paymentMethod, total, isPix,
    searchText, setSearchText,
    deliveryActive,
    pixKey, pixMerchant, pixStatus, loadingPix,
    copiedKey, copiedPayload, errorPix,
    pixPayload, pulseAnim,
    handleConfirmPayment, handleCopyPixKey, handleCopyPixPayload,
  };
}
