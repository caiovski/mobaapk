import { useContext, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../../../contexts/CartContext';
import { useUserMenu } from '../../../contexts/UserMenuContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../../data/datasources/supabase/client';
import { getShopStatus, canBypassStoreHours } from '../../../../utils/shopHours';
import useCartEditMode from './useCartEditMode';
import useCartValidation from './useCartValidation';

export function getFirstImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (_) {}
  }
  return url;
}

export function useCartScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const { toggleMenu } = useUserMenu();
  const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext);
  const [searchText, setSearchText] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const editHook = useCartEditMode(cart, addToCart, removeFromCart);
  const { removedAlert, setRemovedAlert } = useCartValidation(cart, removeFromCart, addToCart);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de prosseguir.');
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Erro', 'Você precisa estar autenticado para fechar o pedido.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, bypass_store_hours, rua, bairro, cep, numero, location_confirmed')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do seu perfil. Verifique sua conexão.');
        return;
      }

      if (!canBypassStoreHours(profile.role, profile.bypass_store_hours)) {
        const shop = getShopStatus(new Date());
        if (!shop.isOpen) {
          if (shop.isSundayOrHoliday) {
            setCheckoutError('Você não pode fazer compras hoje pois é Domingo (ou Feriado)!');
          } else {
            setCheckoutError('Você não pode fazer compras fora do horário de funcionamento!');
          }
          setTimeout(() => setCheckoutError(null), 5000);
          return;
        }
      }

      const hasEmptyFields = !profile.rua?.trim() || !profile.bairro?.trim() || !profile.cep?.trim() || !profile.numero?.trim();

      if (hasEmptyFields || !profile.location_confirmed) {
        Alert.alert(
          'Endereço pendente',
          'Você não cadastrou ou não confirmou o endereço da sua casa no perfil, portanto não será possível a entrega.\n\nPor favor, vá até a tela de perfil para preencher e salvar o seu endereço.',
          [
            {
              text: 'Ir para o Perfil',
              onPress: () => {
                navigation.navigate('ProfileScreen');
              }
            },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        return;
      }

      const { data: settings, error: settingsError } = await supabase
        .from('store_settings')
        .select('delivery_active')
        .maybeSingle();

      if (settings && !settingsError && settings.delivery_active === false) {
        Alert.alert(
          'Aviso',
          'Não é possível prosseguir com a compra. O frete encontra-se inativo no momento.'
        );
        return;
      }
    } catch (e) {
      console.log('Error checking profile or settings during checkout:', e);
    }

    navigation.navigate('PaymentScreen');
  };

  return {
    colors, isDarkMode,
    navigation,
    searchText, setSearchText,
    checkoutError,
    ...editHook,
    removedAlert, setRemovedAlert,
    handleCheckout,
    getFirstImageUrl,
  };
}
