import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DenominationRowProps {
  label: string;
  value: number;
  quantity: number;
  editable: boolean;
  quantityInputMode: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onQuantityChange?: (qty: number) => void;
  isDarkMode: boolean;
}

export function DenominationRow({
  label, value, quantity, editable, quantityInputMode,
  onIncrement, onDecrement, onQuantityChange, isDarkMode,
}: DenominationRowProps) {
  const lineTotal = `R$ ${(quantity * value).toFixed(2).replace('.', ',')}`;

  const textColor = isDarkMode ? '#FFFFFF' : '#1C2434';
  const dimColor = isDarkMode ? '#8E8E93' : '#767676';
  const bgColor = isDarkMode ? '#2E2E38' : '#E3E4EB';
  const inputBg = isDarkMode ? '#1E1E24' : '#F0F0F5';

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
        {editable && quantityInputMode ? (
          <TextInput
            style={{
              backgroundColor: inputBg, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12,
              fontSize: 16, fontWeight: 'bold', color: textColor, textAlign: 'center',
              minWidth: 50, maxWidth: 80,
            }}
            value={String(quantity)}
            onChangeText={(text) => {
              const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
              if (onQuantityChange) onQuantityChange(isNaN(parsed) ? 0 : parsed);
            }}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        ) : editable ? (
          <>
            <TouchableOpacity onPress={onDecrement} activeOpacity={0.7}
              style={{ padding: 6, borderRadius: 8, backgroundColor: bgColor }}>
              <Feather name="minus" size={16} color="#FF3B30" />
            </TouchableOpacity>
            <View style={{
              minWidth: 32, alignItems: 'center', justifyContent: 'center',
              marginHorizontal: 8, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3E3E4A' : '#A8A8B3',
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
