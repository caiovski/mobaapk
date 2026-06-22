import React from 'react';
import { View, Text } from 'react-native';

interface DiscountBannerProps {
  discountPercentage: number | null;
  clientName: string;
  countdownText: string;
  isDarkMode: boolean;
}

export default function DiscountBanner({ discountPercentage, clientName, countdownText, isDarkMode }: DiscountBannerProps) {
  if (discountPercentage == null || discountPercentage <= 0) return null;

  return (
    <View style={{
      marginHorizontal: 16, marginTop: 8, marginBottom: 4,
      paddingVertical: 12, paddingHorizontal: 16,
      backgroundColor: isDarkMode ? '#2A1A3A' : '#F3E5F5',
      borderRadius: 14,
      borderWidth: 1.5, borderColor: '#9C27B0',
    }}>
      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9C27B0', textAlign: 'center', lineHeight: 20 }}>
        Aproveite este produto, {clientName || 'cliente'}! Ele está com {discountPercentage}% de desconto{countdownText ? ` e durará somente por ${countdownText}` : ''}!
      </Text>
    </View>
  );
}
