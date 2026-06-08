import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, Platform, ActivityIndicator, ScrollView, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import { useUserMenu } from '../../contexts/UserMenuContext';
import { AuthContext } from '../../contexts/AuthContext';
import { CatalogHeader } from '../../components/CatalogHeader';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../../data/datasources/supabase/client';
import { NotificationService } from '../../../services/notificationService';
import { generatePixPayload } from '../../utils/pixPayload';

// === IMPORTAÇÃO DOS SVGs (assets/tela10) ===
import CheckInIcon from '../../assets/tela10/meio/Check-In.svg';
import PedidoConfirmadoTxt from '../../assets/tela10/meio/Pedido Confirmado!.svg';
import BtnAcompanhar from '../../assets/tela10/meio/Acompanhar pedido-1.svg';

// Barra Inferior
import HomeIcon8 from '../../assets/tela8/barra/Home.svg';
import HomeIcon8Dark from '../../assets/tela8/barra/HomeDark.svg';
import MapIcon8 from '../../assets/tela8/barra/Map.svg';
import MapIcon8Dark from '../../assets/tela8/barra/MapDark.svg';
import CartIcon8 from '../../assets/tela8/barra/Cart.svg';
import CartIcon8Dark from '../../assets/tela8/barra/CartDark.svg';
import GearIcon8 from '../../assets/tela8/barra/Gear.svg';
import GearIcon8Dark from '../../assets/tela8/barra/GearDark.svg';
import MenuLabel8 from '../../assets/tela8/barra/MenuLabel.svg';
import MapaLabel8 from '../../assets/tela8/barra/MapaLabel.svg';
import CarrinhoLabel8 from '../../assets/tela8/barra/CarrinhoLabel.svg';
import OpcoesLabel8 from '../../assets/tela8/barra/OpcoesLabel.svg';

export default function PaymentConfirmScreen({ route, navigation }: any) {
  const { toggleMenu } = useUserMenu();
  const { isDarkMode, colors } = useTheme();
  const { user } = useContext(AuthContext);
  const { orderId, paymentMethod, total } = route.params || {};
  const isPix = paymentMethod === 'pix';

  const [searchText, setSearchText] = useState('');
  const [deliveryActive, setDeliveryActive] = useState(true);

  // PIX state
  const [pixKey, setPixKey] = useState('');
  const [pixMerchant, setPixMerchant] = useState('');
  const [pixStatus, setPixStatus] = useState<'pending' | 'paid' | 'checking'>('pending');
  const [loadingPix, setLoadingPix] = useState(isPix);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [errorPix, setErrorPix] = useState('');

  // Animação pulsante do ícone de relógio
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

  // Buscar chave PIX e iniciar polling
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

  // Polling de status PIX a cada 10s
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

  // Confirmar pagamento PIX
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

  // Copiar chave PIX
  const handleCopyPixKey = useCallback(async () => {
    if (!pixKey) return;
    await Clipboard.setStringAsync(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  }, [pixKey]);

  // Copiar payload PIX copia e cola
  const handleCopyPixPayload = useCallback(async () => {
    if (!pixPayload) return;
    await Clipboard.setStringAsync(pixPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
  }, [pixPayload]);

  // Sincronizar status de frete
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

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.backgroundLight }]}>
      <StatusBar backgroundColor={colors.headerBackground} barStyle="light-content" />

      {/* Header Unificado */}
      <CatalogHeader 
        title="Checkout"
        searchText={searchText}
        onSearchChange={setSearchText}
      />

      {/* ========== CONTEÚDO (MEIO) ========== */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={[styles.contentContainer, !isPix && { flex: 1, justifyContent: 'center' }]}>
        {isPix && pixStatus === 'paid' ? (
          <>
            <CheckInIcon width={120} height={120} style={styles.checkIcon} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDarkMode ? '#81C784' : '#2A7420', textAlign: 'center', marginBottom: 16 }}>
              Pagamento confirmado!
            </Text>
            <Text style={{ fontSize: 14, color: isDarkMode ? '#A8A8B3' : '#767676', textAlign: 'center', marginBottom: 32 }}>
              Seu pagamento PIX foi recebido com sucesso.
            </Text>
          </>
        ) : isPix && loadingPix ? (
          <ActivityIndicator size="large" color="#339914" />
        ) : isPix ? (
          <>
            <Animated.View style={{ opacity: pulseAnim, marginBottom: 12 }}>
              <Feather name="clock" size={44} color="#00BFA5" />
            </Animated.View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#1C2434', textAlign: 'center', marginBottom: 4 }}>
              Aguardando pagamento
            </Text>
            <Text style={{ fontSize: 13, color: isDarkMode ? '#A8A8B3' : '#767676', textAlign: 'center', marginBottom: 2 }}>
              Pedido #{orderId?.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={{ fontSize: 12, color: isDarkMode ? '#A8A8B3' : '#767676', textAlign: 'center', marginBottom: 4, paddingHorizontal: 20 }}>
              Escaneie o QR Code ou use o PIX Copia e Cola para pagar
            </Text>

            {/* Valor total */}
            {total ? (
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: isDarkMode ? '#81C784' : '#2A7420', textAlign: 'center', marginBottom: 16 }}>
                R$ {Number(total).toFixed(2)}
              </Text>
            ) : null}

            {/* QR Code */}
            {pixPayload ? (
              <View style={{ width: 220, height: 220, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 16, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 }}>
                <QRCode
                  value={pixPayload}
                  size={196}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              </View>
            ) : null}

            {/* Chave PIX e Copia e Cola */}
            {pixKey ? (
              <>
                {/* PIX Copia e Cola */}
                <View style={{ width: '90%', backgroundColor: isDarkMode ? '#1E1E24' : '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#A8A8B3' : '#767676', marginBottom: 6 }}>PIX Copia e Cola</Text>
                  <Text style={{ fontSize: 11, color: isDarkMode ? '#CCCCCC' : '#555555', marginBottom: 10, lineHeight: 16 }} selectable numberOfLines={3}>
                    {pixPayload || 'Gerando...'}
                  </Text>
                  <TouchableOpacity
                    style={{ backgroundColor: copiedPayload ? '#25BE36' : '#00BFA5', borderRadius: 8, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    onPress={handleCopyPixPayload}
                    activeOpacity={0.7}
                  >
                    <Feather name={copiedPayload ? 'check' : 'copy'} size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>{copiedPayload ? 'Copiado!' : 'Copiar código'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Chave PIX (pagar manualmente) */}
                <View style={{ width: '90%', backgroundColor: isDarkMode ? '#1E1E24' : '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#A8A8B3' : '#767676', marginBottom: 2 }}>Chave PIX</Text>
                  {pixMerchant ? (
                    <Text style={{ fontSize: 11, color: isDarkMode ? '#A8A8B3' : '#767676', marginBottom: 4 }}>
                      {pixMerchant}
                    </Text>
                  ) : null}
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#1C2434', marginBottom: 10, textAlign: 'center' }} selectable>{pixKey}</Text>
                  <TouchableOpacity
                    style={{ backgroundColor: copiedKey ? '#25BE36' : '#1C2434', borderRadius: 8, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    onPress={handleCopyPixKey}
                    activeOpacity={0.7}
                  >
                    <Feather name={copiedKey ? 'check' : 'copy'} size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>{copiedKey ? 'Copiado!' : 'Copiar chave'}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 11, color: isDarkMode ? '#A8A8B3' : '#999999', textAlign: 'center', marginBottom: 12, paddingHorizontal: 20 }}>
                  Ou pague manualmente no seu banco usando a chave PIX acima com o valor de R$ {total ? Number(total).toFixed(2) : '0,00'}
                </Text>
              </>
            ) : null}

            {errorPix ? (
              <Text style={{ fontSize: 12, color: '#FF3B30', textAlign: 'center', marginBottom: 8, paddingHorizontal: 20 }}>{errorPix}</Text>
            ) : null}

            {pixStatus === 'checking' ? (
              <ActivityIndicator size="small" color="#339914" style={{ marginVertical: 12 }} />
            ) : (
              <TouchableOpacity
                style={{ backgroundColor: isDarkMode ? '#1E1E24' : '#1C2434', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12, borderWidth: isDarkMode ? 1 : 0, borderColor: isDarkMode ? '#3E3E4A' : 'transparent' }}
                onPress={handleConfirmPayment}
                activeOpacity={0.7}
              >
                <Text style={{ color: isDarkMode ? '#FFE082' : '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Já paguei</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('OrdersScreen')}>
              <Text style={{ color: isDarkMode ? '#A8A8B3' : '#767676', fontSize: 13, textDecorationLine: 'underline', marginBottom: 20 }}>Ver meus pedidos</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <CheckInIcon width={181} height={181} style={styles.checkIcon} />
            {isDarkMode ? (
              <View style={[styles.successTitle, { width: 194, height: 80, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' }}>
                  Pedido confirmado!
                </Text>
              </View>
            ) : (
              <PedidoConfirmadoTxt width={194} height={80} style={styles.successTitle} />
            )}
            
            <TouchableOpacity
              style={[styles.btnAcompanhar, { backgroundColor: isDarkMode ? '#1E1E24' : '#1C2434', borderWidth: isDarkMode ? 1 : 0, borderColor: isDarkMode ? '#3E3E4A' : 'transparent' }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('OrdersScreen')}
            >
              <BtnAcompanhar width={154} height={45} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* ========== BARRA INFERIOR (Matches ClientTabs) ========== */}
      <View style={styles.tabBarOuter}>
        <View style={[styles.tabBarInner, { backgroundColor: isDarkMode ? '#000000' : '#E3E4EB' }]}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ClientTabs', { screen: 'Menu' })}>
            <View style={styles.iconContainer}>
              {isDarkMode ? <HomeIcon8Dark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <HomeIcon8 width={32} height={32} />}
            </View>
            {isDarkMode ? <MenuLabel8 width={33} height={9} fill="#A8A8B3" stroke="#A8A8B3" /> : <MenuLabel8 width={33} height={9} />}
          </TouchableOpacity>
          
          <View style={[styles.tabSeparator, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268' }]} />

          {deliveryActive && (
            <>
              <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ClientTabs', { screen: 'Mapa' })}>
                <View style={styles.iconContainer}>
                  {isDarkMode ? <MapIcon8Dark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <MapIcon8 width={32} height={32} />}
                </View>
                {isDarkMode ? <MapaLabel8 width={32} height={12} fill="#A8A8B3" stroke="#A8A8B3" /> : <MapaLabel8 width={32} height={12} />}
              </TouchableOpacity>
              
              <View style={[styles.tabSeparator, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268' }]} />
            </>
          )}

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ClientTabs', { screen: 'Carrinho' })}>
            <View style={isDarkMode ? cartSelectedDark : styles.cartSelectedLight}>
              {isDarkMode ? <CartIcon8Dark width={32} height={32} fill="#FFD700" stroke="#FFD700" /> : <CartIcon8 width={32} height={32} />}
            </View>
            {isDarkMode ? <CarrinhoLabel8 width={52} height={10} fill="#FFD700" stroke="#FFD700" /> : <CarrinhoLabel8 width={52} height={10} />}
          </TouchableOpacity>

          <View style={[styles.tabSeparator, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268' }]} />

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ClientTabs', { screen: 'Opções' })}>
            <View style={styles.iconContainer}>
              {isDarkMode ? <GearIcon8Dark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <GearIcon8 width={32} height={32} />}
            </View>
            {isDarkMode ? <OpcoesLabel8 width={42} height={12} fill="#A8A8B3" stroke="#A8A8B3" /> : <OpcoesLabel8 width={42} height={12} />}
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ========== HEADER ==========
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C2434',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'android' ? 38 : 50,
    paddingBottom: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
    marginLeft: 5,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#1C2434',
    padding: 0,
    height: 36,
  },
  personCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ========== CONTEÚDO (MEIO) ==========
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingBottom: 120, // Dá espaço pra barra inferior não comer o conteúdo
  },
  checkIcon: {
    marginBottom: 40,
  },
  successTitle: {
    marginBottom: 50,
  },
  btnAcompanhar: {
    width: 211,
    height: 75,
    backgroundColor: '#1C2434',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ========== BARRA INFERIOR ==========
  tabBarOuter: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: 16,
    right: 16,
  },
  tabBarInner: {
    flexDirection: 'row',
    backgroundColor: '#E3E4EB',
    borderRadius: 30,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabSeparator: {
    width: 1,
    height: 49,
    backgroundColor: '#8A7268',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 51,
    height: 41,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartSelectedLight: {
    width: 51,
    height: 41,
    borderRadius: 20,
    backgroundColor: '#E3DAD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const cartSelectedDark = {
  backgroundColor: '#1E1E24',
  width: 51,
  height: 41,
  borderRadius: 15,
  alignItems: 'center',
  justifyContent: 'center',
} as const;
