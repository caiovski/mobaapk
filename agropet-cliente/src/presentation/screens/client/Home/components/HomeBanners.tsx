import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from '../HomeScreen.styles';

interface HomeBannersProps {
  shopStatus: any;
  isDarkMode: boolean;
  colors: any;
  esgotadoAlert: string | null;
  setEsgotadoAlert: (v: string | null) => void;
  deliveryActive: boolean;
  showReactivatedAlert: boolean;
  handleCloseReactivated: () => void;
}

export default function HomeBanners({ shopStatus, isDarkMode, colors, esgotadoAlert, setEsgotadoAlert, deliveryActive, showReactivatedAlert, handleCloseReactivated }: HomeBannersProps) {
  return (
    <>
      {shopStatus?.isSundayOrHoliday && (
        <View style={[styles.domingoFeriadoCard, { backgroundColor: isDarkMode ? '#2C1D1E' : '#FFF0F0', borderColor: '#FF3B30' }]}>
          <Feather name="alert-circle" size={18} color="#FF3B30" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={[styles.domingoFeriadoText, { color: isDarkMode ? '#FF8A8A' : '#D32F2F' }]}>
            {(() => {
              const now = new Date();
              const dayStr = String(now.getDate()).padStart(2, '0');
              const monthStr = String(now.getMonth() + 1).padStart(2, '0');
              const yearStr = now.getFullYear();
              return now.getDay() === 0
                ? `Hoje é domingo, dia ${dayStr}-${monthStr}-${yearStr}. Não abrimos hoje.`
                : `Hoje é feriado, dia ${dayStr}-${monthStr}-${yearStr}. Não abrimos hoje.`;
            })()}
          </Text>
        </View>
      )}

      {esgotadoAlert && (
        <View style={[styles.esgotadoBanner, { backgroundColor: isDarkMode ? '#2C1D1E' : '#FFF0F0', borderColor: '#FF3B30' }]}>
          <Feather name="alert-circle" size={16} color="#FF3B30" style={{ marginRight: 8 }} />
          <Text style={[styles.esgotadoBannerText, { color: isDarkMode ? '#FF8A8A' : '#D32F2F' }]} numberOfLines={2}>
            Aviso: O produto "{esgotadoAlert}" esgotou e não está mais disponível no catálogo.
          </Text>
          <TouchableOpacity onPress={() => setEsgotadoAlert(null)} style={{ marginLeft: 'auto', paddingLeft: 10 }}>
            <Feather name="x" size={16} color={isDarkMode ? '#FF8A8A' : '#D32F2F'} />
          </TouchableOpacity>
        </View>
      )}

      {!deliveryActive && (
        <View style={[styles.freteBanner, { backgroundColor: isDarkMode ? '#2C1D1E' : '#FFF0F0', borderColor: '#FF3B30' }]}>
          <Feather name="alert-circle" size={18} color="#FF3B30" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={[styles.freteBannerText, { color: isDarkMode ? '#FF8A8A' : '#D32F2F' }]}>
            Aviso: O frete encontra-se desativado no momento. Nesse período, você não conseguirá ver o mapa, rastrear pedido e nem prosseguir with a compra, mas você pode salvar suas compras no carrinho até ele voltar. Obrigado pela compreensão. Voltaremos em breve!
          </Text>
        </View>
      )}

      {deliveryActive && showReactivatedAlert && (
        <View style={[styles.freteBanner, { backgroundColor: isDarkMode ? '#1D2A3A' : '#E8F4FD', borderColor: '#2196F3' }]}>
          <Feather name="info" size={18} color="#2196F3" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={[styles.freteBannerText, { color: isDarkMode ? '#8AB4F8' : '#0D47A1' }]}>
            O frete foi reativado, Uhuu 🥳! Você pode voltar a comprar, ver o mapa e rastrear sua entrega
          </Text>
          <TouchableOpacity onPress={handleCloseReactivated} style={{ marginLeft: 'auto', paddingLeft: 10 }}>
            <Feather name="x" size={16} color={isDarkMode ? '#8AB4F8' : '#0D47A1'} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
