import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { CatalogHeader } from '../../../components/CatalogHeader';

import SituacaoTit from '../../../assets/tela12/Situação da entrega_.svg';
import S1Icon from '../../../assets/tela12/pedido confirmado/Check-In.svg';
import S1Text from '../../../assets/tela12/pedido confirmado/Pedidoh confirmado!.svg';
import S1Check from '../../../assets/tela12/pedido confirmado/Check.svg';
import S1Unchecked from '../../../assets/tela12/pedido confirmado/Check-In.svg';
import S2Icon from '../../../assets/tela12/preparando entrega/Order.svg';
import S2Text from '../../../assets/tela12/preparando entrega/Pedido em preparação Pedido preparado!.svg';
import S2SubCheck1 from '../../../assets/tela12/preparando entrega/Check-1.svg';
import S2SubCheck2 from '../../../assets/tela12/preparando entrega/Check-2.svg';
import S2Time from '../../../assets/tela12/preparando entrega/Horário 12_15.svg';
import S2Check from '../../../assets/tela12/preparando entrega/Check.svg';
import S3Icon from '../../../assets/tela12/saiu para entrega/Fiorino.svg';
import S3Text from '../../../assets/tela12/saiu para entrega/Saiu para entrega À caminho.svg';
import S3SubCheck1 from '../../../assets/tela12/saiu para entrega/Check.svg';
import S3SubWarn from '../../../assets/tela12/saiu para entrega/Warn.svg';
import S3Time from '../../../assets/tela12/saiu para entrega/Horário 12_45.svg';
import S3Warn from '../../../assets/tela12/saiu para entrega/Warning.svg';
import S4Icon from '../../../assets/tela12/entrega concluida/Entrega.svg';
import S4Text from '../../../assets/tela12/entrega concluida/Entrega concluída!.svg';
import S4SubWarn from '../../../assets/tela12/entrega concluida/Warn red.svg';

import S4Warn from '../../../assets/tela12/entrega concluida/Warning red.svg';
import HomeIcon8 from '../../../assets/tela11/barra de baixo/Home.svg';
import HomeIcon8Dark from '../../../assets/tela8/barra/HomeDark.svg';
import MapIcon8 from '../../../assets/tela11/barra de baixo/Map.svg';
import MapIcon8Dark from '../../../assets/tela8/barra/MapDark.svg';
import CartIcon8 from '../../../assets/tela11/barra de baixo/Cart.svg';
import CartIcon8Dark from '../../../assets/tela8/barra/CartDark.svg';
import GearIcon8 from '../../../assets/tela11/barra de baixo/Gear.svg';
import GearIcon8Dark from '../../../assets/tela8/barra/GearDark.svg';
import MenuLabel8 from '../../../assets/tela11/barra de baixo/Menu.svg';
import MapaLabel8 from '../../../assets/tela11/barra de baixo/Mapa.svg';
import CarrinhoLabel8 from '../../../assets/tela11/barra de baixo/Carrinho.svg';
import OpcoesLabel8 from '../../../assets/tela11/barra de baixo/Opções.svg';

import { useTrackingScreen, StepStatusType } from './useTrackingScreen';
import { styles } from './TrackingScreen.styles';
import { ThermometerLine } from './ThermometerLine';
import DeliveryMinimap from './DeliveryMinimap';

function StepCard({ children, isDarkMode, isActive }: { children: React.ReactNode; isDarkMode: boolean; isActive: boolean }) {
  return (
    <View style={[styles.card, {
      backgroundColor: isDarkMode ? (isActive ? '#1E1E24' : '#1A1A20') : (isActive ? '#E3E4EB' : '#F0F0F0'),
      opacity: isActive ? 1 : 0.5,
    }]}>
      {children}
    </View>
  );
}

const outerIconMap: Record<StepStatusType, React.ReactNode> = {
  check: <S1Check width={25} height={25} />,
  warn: <S3Warn width={25} height={25} />,
  red: <S4Warn width={25} height={25} />,
};

function StepOuterStatus({ status }: { status: StepStatusType }) {
  return (
    <View style={styles.outerStatus}>
      {outerIconMap[status]}
    </View>
  );
}

const step2SubIconTop: Record<StepStatusType, React.ReactNode> = {
  check: <S2SubCheck1 width={15} height={15} />,
  warn: <S3SubWarn width={15} height={15} />,
  red: <S4SubWarn width={15} height={15} />,
};

const step2SubIconBottom: Record<StepStatusType, React.ReactNode> = {
  check: <S2SubCheck2 width={15} height={15} />,
  warn: <S3SubWarn width={15} height={15} />,
  red: <S4SubWarn width={15} height={15} />,
};

const step3SubIconTop: Record<StepStatusType, React.ReactNode> = {
  check: <S3SubCheck1 width={15} height={15} />,
  warn: <S3SubWarn width={15} height={15} />,
  red: <S4SubWarn width={15} height={15} />,
};

const step3SubIconBottom: Record<StepStatusType, React.ReactNode> = {
  check: <S3SubCheck1 width={15} height={15} />,
  warn: <S3SubWarn width={15} height={15} />,
  red: <S4SubWarn width={15} height={15} />,
};

const singleIcon: Record<StepStatusType, React.ReactNode> = {
  check: <S3SubCheck1 width={15} height={15} />,
  warn: <S3SubWarn width={15} height={15} />,
  red: <S4SubWarn width={15} height={15} />,
};

export default function TrackingScreen({ navigation }: any) {
  const h = useTrackingScreen({ navigation });

  const s = h.activeStep;
  const cancelled = h.cancelled;
  const orderId = h.orderId;
  const st = h.stepStatuses;
  const ot = h.outerStatuses;
  const s2 = h.step2SubStatuses;
  const s3 = h.step3SubStatuses;
  const s4Icon = h.step4IconStatus;
  const s4Outer = h.step4OuterStatus;

  const barGlowAnim = useRef(new Animated.Value(0)).current;
  const notifAnim = useRef(new Animated.Value(-100)).current;
  const [prevNotifVisible, setPrevNotifVisible] = useState(false);

  useEffect(() => {
    if (h.notifVisible && !prevNotifVisible) {
      notifAnim.setValue(-100);
      Animated.timing(notifAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else if (!h.notifVisible && prevNotifVisible) {
      Animated.timing(notifAnim, { toValue: -100, duration: 300, useNativeDriver: true }).start();
    }
    setPrevNotifVisible(h.notifVisible);
  }, [h.notifVisible]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(barGlowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(barGlowAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start();
  }, [barGlowAnim]);

  if (!orderId) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: h.colors.background }]}>
        <CatalogHeader title="Acompanhar Pedido" searchText={h.searchText} onSearchChange={h.setSearchText} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: h.isDarkMode ? '#FFFFFF' : '#333', fontSize: 16 }}>Nenhum pedido selecionado</Text>
        </View>
      </View>
    );
  }

  if (h.loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: h.colors.background }]}>
        <CatalogHeader title="Acompanhar Pedido" searchText={h.searchText} onSearchChange={h.setSearchText} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#339914" />
        </View>
      </View>
    );
  }

  const barColor = h.cancelled ? '#BDBDBD' : h.status === 'completed' ? '#42A5F5' : '#FF8A80';
  const barText = h.cancelled ? 'Cancelado' : h.status === 'completed' ? 'Entregue' : 'Pendente';

  return (
    <View style={[styles.mainContainer, { backgroundColor: h.colors.background }]}>
      <CatalogHeader
        title="Acompanhar Pedido"
        searchText={h.searchText}
        onSearchChange={h.setSearchText}
      />

      {h.notifVisible ? (
        <Animated.View style={{
          transform: [{ translateY: notifAnim }],
          position: 'absolute',
          top: 50,
          left: 16,
          right: 16,
          zIndex: 100,
          backgroundColor: h.isDarkMode ? '#2E2E38' : '#FFFFFF',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#339914',
        }}>
          <TouchableOpacity onPress={() => h.setNotifVisible(false)} style={{ position: 'absolute', top: 6, right: 10, zIndex: 101 }}>
            <Feather name="x" size={18} color={h.isDarkMode ? '#999' : '#666'} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: h.isDarkMode ? '#FFFFFF' : '#333',
            marginRight: 20,
          }}>
            {h.notifMessage}
          </Text>
        </Animated.View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={h.refreshing} onRefresh={h.onRefresh} colors={['#339914']} />}
      >
        <View style={{ marginBottom: 30, alignItems: 'flex-start' }}>
          {h.isDarkMode ? (
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', height: 20 }}>Situação da entrega</Text>
          ) : (
            <SituacaoTit width={236} height={20} />
          )}
        </View>

        <Animated.View style={{
          alignSelf: 'stretch', marginBottom: 20, borderRadius: 12, overflow: 'hidden',
          backgroundColor: h.isDarkMode ? '#1E1E24' : '#FFFFFF',
          ...(h.isDarkMode ? {
            shadowColor: barColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: barGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
            shadowRadius: barGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 18] }),
            elevation: 5,
            borderWidth: 1,
            borderColor: h.isDarkMode && (h.cancelled ? 'rgba(189,189,189,0.25)' : h.status === 'completed' ? 'rgba(66,165,245,0.25)' : 'rgba(255,138,128,0.25)'),
          } : {
            elevation: 2, shadowOpacity: 0.1, shadowRadius: 4, shadowColor: '#000',
          }),
        }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20,
          }}>
            <Animated.View style={{
              width: 12, height: 12, borderRadius: 6, backgroundColor: barColor, marginRight: 12,
              opacity: barGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
              transform: [{
                scale: barGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }),
              }],
              ...(h.isDarkMode ? {
                shadowColor: barColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: barGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                shadowRadius: barGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [4, 10] }),
              } : {}),
            }} />
            <Text style={{
              fontSize: 16, fontWeight: 'bold', color: barColor, flex: 1,
            }}>
              {barText}
            </Text>
          </View>
          <Animated.View style={{
            height: 3, backgroundColor: barColor,
            opacity: barGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
          }} />
        </Animated.View>

        <View style={styles.stepRow}>
          <StepCard isDarkMode={h.isDarkMode} isActive={s >= 1 && !cancelled}>
            <View style={[styles.iconBox, { borderColor: h.isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
              <S1Icon width={45} height={45} />
            </View>
            <View style={[styles.middleBox, { borderColor: h.isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
              <View style={styles.subTaskRow}>
                {h.isDarkMode ? (
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', alignSelf: 'center' }}>
                    Pedido confirmado!
                  </Text>
                ) : (
                  <S1Text width={195} height={17} />
                )}
                <View style={{ marginLeft: 5 }}>
                  {singleIcon[st[0]]}
                </View>
              </View>
            </View>
            <View style={styles.rightTimeBox}>
              <Text style={[styles.horarioLabel, { color: h.isDarkMode ? '#FFFFFF' : '#1C2434' }]}>
                Horário
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: h.isDarkMode ? '#FFFFFF' : '#333', textAlign: 'center' }}>
                {h.formatTime(h.stepTimestamp(0))}
              </Text>
            </View>
          </StepCard>
          <StepOuterStatus status={ot[0]} />
        </View>

        <ThermometerLine color={h.getThermometerColor(1)} animatedOpacity={h.getThermometerOpacity(1)} glowIntensity={h.getThermometerGlowIntensity(1)} isDarkMode={h.isDarkMode} />

        <View style={styles.stepRow}>
          <StepCard isDarkMode={h.isDarkMode} isActive={s >= 2 && !cancelled}>
            <View style={[styles.iconBox, { borderColor: h.isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
              <S2Icon width={45} height={45} />
            </View>
            <View style={[styles.middleBox, { borderColor: h.isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
              <View style={styles.subTaskRow}>
                {h.isDarkMode ? (
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginTop: -2 }}>
                      Pedido em preparação
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 }}>
                      Pedido preparado!
                    </Text>
                  </View>
                ) : (
                  <S2Text width={132} height={58} />
                )}
                <View style={styles.subTaskIcons}>
                  <View style={{ marginBottom: 18 }}>{step2SubIconTop[s2[0]]}</View>
                  {step2SubIconBottom[s2[1]]}
                </View>
              </View>
            </View>
            <View style={styles.rightTimeBox}>
              <Text style={[styles.horarioLabel, { color: h.isDarkMode ? '#FFFFFF' : '#1C2434' }]}>
                Horário
              </Text>
              {h.order?.prepared_at ? (
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: h.isDarkMode ? '#FFFFFF' : '#333', textAlign: 'center' }}>
                  {h.formatTime(h.stepTimestamp(1))}
                </Text>
              ) : (
                <Feather name="clock" size={24} color={st[1] === 'warn' ? '#E9A527' : '#C51818'} />
              )}
            </View>
          </StepCard>
          <StepOuterStatus status={ot[1]} />
        </View>

        <ThermometerLine color={h.getThermometerColor(2)} animatedOpacity={h.getThermometerOpacity(2)} glowIntensity={h.getThermometerGlowIntensity(2)} isDarkMode={h.isDarkMode} />

        <View style={styles.stepRow}>
          <StepCard isDarkMode={h.isDarkMode} isActive={s >= 3 && !cancelled}>
            <View style={[styles.iconBox, { borderColor: h.isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
              <S3Icon width={50} height={40} />
            </View>
            <View style={[styles.middleBox, { borderColor: h.isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
              <View style={styles.subTaskRow}>
                {h.isDarkMode ? (
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginTop: -2 }}>
                      Saiu para entrega
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 }}>
                      À caminho
                    </Text>
                  </View>
                ) : (
                  <S3Text width={110} height={58} />
                )}
                <View style={styles.subTaskIcons}>
                  <View style={{ marginBottom: 18 }}>{step3SubIconTop[s3[0]]}</View>
                  {step3SubIconBottom[s3[1]]}
                </View>
              </View>
            </View>
            <View style={styles.rightTimeBox}>
              <Text style={[styles.horarioLabel, { color: h.isDarkMode ? '#FFFFFF' : '#1C2434' }]}>
                Horário
              </Text>
              {h.order?.delivering_at || st[2] === 'check' ? (
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: h.isDarkMode ? '#FFFFFF' : '#333', textAlign: 'center' }}>
                  {h.formatTime(h.stepTimestamp(2))}
                </Text>
              ) : (
                <Feather name="clock" size={24} color={h.status === 'preparing' || h.status === 'delivering' || st[2] === 'warn' ? '#E9A527' : '#C51818'} />
              )}
            </View>
          </StepCard>
          <StepOuterStatus status={ot[2]} />
        </View>

        <ThermometerLine color={h.getThermometerColor(3)} animatedOpacity={h.getThermometerOpacity(3)} glowIntensity={h.getThermometerGlowIntensity(3)} isDarkMode={h.isDarkMode} />

        <View style={styles.stepRow}>
          <StepCard isDarkMode={h.isDarkMode} isActive={s >= 4 && !cancelled}>
            <View style={[styles.iconBox, { borderColor: h.isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
              <S4Icon width={45} height={45} />
            </View>
            <View style={[styles.middleBox, { borderColor: h.isDarkMode ? 'rgba(255,255,255,0.15)' : '#FFFFFF' }]}>
              <View style={styles.subTaskRow}>
                {h.isDarkMode ? (
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', alignSelf: 'center' }}>
                    {cancelled ? 'Pedido cancelado' : 'Entrega concluída!'}
                  </Text>
                ) : (
                  cancelled ? <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#C51818', alignSelf: 'center' }}>Pedido cancelado</Text> : <S4Text width={132} height={15} style={{ alignSelf: 'center' }} />
                )}
                <View style={{ marginLeft: 5 }}>
                  {singleIcon[s4Icon]}
                </View>
              </View>
            </View>
            <View style={styles.rightTimeBox}>
              <Text style={[styles.horarioLabel, { color: h.isDarkMode ? '#FFFFFF' : '#1C2434' }]}>
                Horário
              </Text>
              {st[3] === 'check' ? (
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: h.isDarkMode ? '#FFFFFF' : '#333', textAlign: 'center' }}>
                  {h.formatTime(h.stepTimestamp(3))}
                </Text>
              ) : (
                <Feather name="clock" size={24}               color={h.status === 'delivering' && h.enRouteTriggered || st[3] === 'warn' || h.hasDeliveryDeparted ? '#E9A527' : '#C51818'} />
              )}
            </View>
          </StepCard>
          <StepOuterStatus status={s4Outer} />
        </View>

        {cancelled && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#C51818' }}>Este pedido foi cancelado</Text>
          </View>
        )}
      </ScrollView>

      <DeliveryMinimap
        orderId={h.orderId}
        status={h.status}
        hasDeliveryDeparted={h.hasDeliveryDeparted}
        isDarkMode={h.isDarkMode}
        onExpand={() => navigation.push('ClientTabs', {
          screen: 'Mapa',
          params: { trackingOrderId: h.orderId },
        })}
      />

      <View style={styles.tabBarOuter}>
        <View style={[styles.tabBarInner, { backgroundColor: h.isDarkMode ? '#000000' : '#E3E4EB' }]}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.push('ClientTabs', { screen: 'Menu' })}>
            <View style={h.isDarkMode ? { width: 51, height: 41, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } : styles.iconBgInactive}>
              {h.isDarkMode ? <HomeIcon8Dark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <HomeIcon8 width={32} height={32} />}
            </View>
            {h.isDarkMode ? <MenuLabel8 width={33} height={9} fill="#FFFFFF" stroke="#FFFFFF" /> : <MenuLabel8 width={33} height={9} />}
          </TouchableOpacity>

          <View style={[styles.tabSeparator, { backgroundColor: h.isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268' }]} />

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.push('ClientTabs', { screen: 'Mapa' })}>
            <View style={h.isDarkMode ? { width: 51, height: 41, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } : styles.iconBgInactive}>
              {h.isDarkMode ? <MapIcon8Dark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <MapIcon8 width={32} height={32} />}
            </View>
            {h.isDarkMode ? <MapaLabel8 width={32} height={12} fill="#FFFFFF" stroke="#FFFFFF" /> : <MapaLabel8 width={32} height={12} />}
          </TouchableOpacity>

          <View style={[styles.tabSeparator, { backgroundColor: h.isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268' }]} />

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.push('ClientTabs', { screen: 'Carrinho' })}>
            <View style={h.isDarkMode ? { width: 51, height: 41, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } : styles.iconBgInactive}>
              {h.isDarkMode ? <CartIcon8Dark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <CartIcon8 width={32} height={32} />}
            </View>
            {h.isDarkMode ? <CarrinhoLabel8 width={52} height={10} fill="#FFFFFF" stroke="#FFFFFF" /> : <CarrinhoLabel8 width={52} height={10} />}
          </TouchableOpacity>

          <View style={[styles.tabSeparator, { backgroundColor: h.isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268' }]} />

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.push('ClientTabs', { screen: 'Opções' })}>
            <View style={h.isDarkMode ? { width: 51, height: 41, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } : styles.iconBgInactive}>
              {h.isDarkMode ? <GearIcon8Dark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <GearIcon8 width={32} height={32} />}
            </View>
            {h.isDarkMode ? <OpcoesLabel8 width={42} height={12} fill="#FFFFFF" stroke="#FFFFFF" /> : <OpcoesLabel8 width={42} height={12} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
