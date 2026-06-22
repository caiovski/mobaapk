import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated, ActivityIndicator, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';
import { CatalogHeader } from '../../components/CatalogHeader';
import { useUserMenu } from '../../contexts/UserMenuContext';
import { styles } from './PaymentConfirmScreen.styles';
import usePaymentConfirmScreen from './usePaymentConfirmScreen';

import CheckInIcon from '../../assets/tela10/meio/Check-In.svg';
import PedidoConfirmadoTxt from '../../assets/tela10/meio/Pedido Confirmado!.svg';
import BtnAcompanhar from '../../assets/tela10/meio/Acompanhar pedido-1.svg';

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
  const {
    isDarkMode, colors,
    orderId, isPix, total,
    searchText, setSearchText,
    deliveryActive,
    pixKey, pixMerchant, pixStatus, loadingPix,
    copiedKey, copiedPayload, errorPix,
    pixPayload, pulseAnim,
    handleConfirmPayment, handleCopyPixKey, handleCopyPixPayload,
  } = usePaymentConfirmScreen(route, navigation);

  const cartSelectedDark = {
    backgroundColor: '#1E1E24',
    width: 51, height: 41,
    borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  } as const;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.backgroundLight }]}>
      <StatusBar backgroundColor={colors.headerBackground} barStyle="light-content" />
      <CatalogHeader title="Checkout" searchText={searchText} onSearchChange={setSearchText} />

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
            {total ? (
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: isDarkMode ? '#81C784' : '#2A7420', textAlign: 'center', marginBottom: 16 }}>
                R$ {Number(total).toFixed(2)}
              </Text>
            ) : null}
            {pixPayload ? (
              <View style={{ width: 220, height: 220, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 16, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 }}>
                <QRCode value={pixPayload} size={196} backgroundColor="#FFFFFF" color="#000000" />
              </View>
            ) : null}
            {pixKey ? (
              <>
                <View style={{ width: '90%', backgroundColor: isDarkMode ? '#1E1E24' : '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#A8A8B3' : '#767676', marginBottom: 6 }}>PIX Copia e Cola</Text>
                  <Text style={{ fontSize: 11, color: isDarkMode ? '#CCCCCC' : '#555555', marginBottom: 10, lineHeight: 16 }} selectable numberOfLines={3}>
                    {pixPayload || 'Gerando...'}
                  </Text>
                  <TouchableOpacity
                    style={{ backgroundColor: copiedPayload ? '#25BE36' : '#00BFA5', borderRadius: 8, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    onPress={handleCopyPixPayload} activeOpacity={0.7}>
                    <Feather name={copiedPayload ? 'check' : 'copy'} size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>{copiedPayload ? 'Copiado!' : 'Copiar código'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ width: '90%', backgroundColor: isDarkMode ? '#1E1E24' : '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#A8A8B3' : '#767676', marginBottom: 2 }}>Chave PIX</Text>
                  {pixMerchant ? (
                    <Text style={{ fontSize: 11, color: isDarkMode ? '#A8A8B3' : '#767676', marginBottom: 4 }}>{pixMerchant}</Text>
                  ) : null}
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#1C2434', marginBottom: 10, textAlign: 'center' }} selectable>{pixKey}</Text>
                  <TouchableOpacity
                    style={{ backgroundColor: copiedKey ? '#25BE36' : '#1C2434', borderRadius: 8, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    onPress={handleCopyPixKey} activeOpacity={0.7}>
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
                onPress={handleConfirmPayment} activeOpacity={0.7}>
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
              onPress={() => navigation.navigate('OrdersScreen')}>
              <BtnAcompanhar width={154} height={45} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

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
