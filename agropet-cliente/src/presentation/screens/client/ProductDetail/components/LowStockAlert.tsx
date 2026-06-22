import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface LowStockAlertProps {
  stock: number;
  dismissAlert: boolean;
  setDismissAlert: (v: boolean) => void;
  discountPercentage: number | null;
  clientName: string;
  isDarkMode: boolean;
}

export default function LowStockAlert({ stock, dismissAlert, setDismissAlert, discountPercentage, clientName, isDarkMode }: LowStockAlertProps) {
  if (stock >= 10 || dismissAlert) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderRadius: 10, backgroundColor: isDarkMode ? '#2C1D1E' : '#FFF0F0', borderColor: '#FF3B30', marginTop: 10, marginBottom: 10, position: 'relative' }}>
      <Feather name="alert-circle" size={16} color="#FF3B30" style={{ marginRight: 8 }} />
      <Text style={{ fontSize: 13, fontWeight: 'bold', color: isDarkMode ? '#FF8A8A' : '#D32F2F', flexShrink: 1, lineHeight: 18, paddingRight: 20 }}>
        {stock === 1 && discountPercentage != null && discountPercentage > 0
          ? 'ATENÇÃO: ÚLTIMA UNIDADE DESTE PRODUTO E COM PROMOÇÃO! APROVEITE ESTA OFERTA E SEJA O PRIMEIRO A LEVAR O PRODUTO!!!'
          : stock === 1
            ? `Última unidade deste produto, ${clientName || 'Cliente'}! Aproveite antes que esgote.`
            : `Atenção: Últimas unidades. Aproveite este produto, caro ${clientName || 'Cliente'}.`
        }
      </Text>
      <TouchableOpacity onPress={() => setDismissAlert(true)} style={{ position: 'absolute', right: 12, top: 12, padding: 2 }}>
        <Feather name="x" size={16} color={isDarkMode ? '#FF8A8A' : '#D32F2F'} />
      </TouchableOpacity>
    </View>
  );
}
