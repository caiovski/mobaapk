import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DenominationRowProps {
  label: string;
  value: number;
  quantity: number;
  editable: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  isDarkMode: boolean;
}

export function DenominationRow({
  label, value, quantity, editable,
  onIncrement, onDecrement, isDarkMode,
}: DenominationRowProps) {
  const formattedValue = `R$ ${value.toFixed(2).replace('.', ',')}`;
  const lineTotal = `R$ ${(quantity * value).toFixed(2).replace('.', ',')}`;

  const textColor = isDarkMode ? '#FFFFFF' : '#1C2434';
  const dimColor = isDarkMode ? '#8E8E93' : '#767676';
  const bgColor = isDarkMode ? '#2E2E38' : '#E3E4EB';
  const qtyBorder = isDarkMode ? '#3E3E4A' : '#A8A8B3';

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 10, paddingHorizontal: 8,
      borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB',
    }}>
      <Text style={{ width: 60, fontSize: 14, fontWeight: 'bold', color: textColor }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        {editable ? (
          <>
            <TouchableOpacity onPress={onDecrement} activeOpacity={0.7}
              style={{ padding: 6, borderRadius: 8, backgroundColor: bgColor }}>
              <Feather name="minus" size={16} color="#FF3B30" />
            </TouchableOpacity>
            <View style={{
              minWidth: 32, alignItems: 'center', justifyContent: 'center',
              marginHorizontal: 8, borderBottomWidth: 1, borderBottomColor: qtyBorder,
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>{quantity}</Text>
            </View>
            <TouchableOpacity onPress={onIncrement} activeOpacity={0.7}
              style={{ padding: 6, borderRadius: 8, backgroundColor: bgColor }}>
              <Feather name="plus" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>{quantity}</Text>
        )}
      </View>
      <Text style={{ width: 90, fontSize: 13, fontWeight: 'bold', color: dimColor, textAlign: 'right' }}>
        {lineTotal}
      </Text>
    </View>
  );
}
