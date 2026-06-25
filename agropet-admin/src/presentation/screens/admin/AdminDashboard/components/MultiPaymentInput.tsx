import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface MultiPaymentInputProps {
  isDarkMode: boolean;
  totalVenda: number;
  multiValues: Record<string, string>;
  onValueChange: (method: string, value: string) => void;
}

const METHODS = [
  { key: 'dinheiro', label: 'Dinheiro', color: '#4CAF50' },
  { key: 'cartao_credito', label: 'Crédito', color: '#FF0000' },
  { key: 'cartao_debito', label: 'Débito', color: '#2E7D32' },
  { key: 'pix', label: 'Pix', color: '#00BFA5' },
];

function parseBRL(val: string): number {
  const cleaned = val.replace(/[^0-9,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatBRL(val: number): string {
  return val.toFixed(2).replace('.', ',');
}

export default function MultiPaymentInput({
  isDarkMode,
  totalVenda,
  multiValues,
  onValueChange,
}: MultiPaymentInputProps) {
  const totalLancado = METHODS.reduce((acc, m) => acc + parseBRL(multiValues[m.key] || ''), 0);
  const diff = totalVenda - totalLancado;
  const isExact = Math.abs(diff) < 0.01;

  const bgColor = isDarkMode ? '#2E2E38' : '#1C2434';
  const textColor = isDarkMode ? '#FFFFFF' : '#FFFFFF';

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ borderTopWidth: 1, borderTopColor: isDarkMode ? '#3E3E4A' : '#E3E4EB', paddingTop: 12 }}>
        {METHODS.map((method) => (
          <View
            key={method.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: method.color,
              backgroundColor: bgColor,
              height: 44,
              paddingLeft: 12,
            }}
          >
            <Text style={{ color: method.color, fontWeight: 'bold', fontSize: 13, width: 72 }}>
              {method.label}
            </Text>
            <Text style={{ color: method.color, fontWeight: 'bold', fontSize: 15, marginRight: 4 }}>
              R$
            </Text>
            <TextInput
              style={{
                flex: 1,
                color: textColor,
                fontSize: 15,
                paddingVertical: 0,
                textAlign: 'right',
                paddingRight: 12,
              }}
              placeholder="0,00"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              keyboardType="decimal-pad"
              value={multiValues[method.key] || ''}
              onChangeText={(t) => {
                const digits = t.replace(/[^0-9,]/g, '');
                onValueChange(method.key, digits);
              }}
            />
          </View>
        ))}
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 4,
      }}>
        <Text style={{ color: isExact ? '#4CAF50' : '#FF5252', fontSize: 14, fontWeight: 'bold' }}>
          Total lançado:
        </Text>
        <Text style={{ color: isExact ? '#4CAF50' : '#FF5252', fontSize: 16, fontWeight: 'bold' }}>
          R$ {formatBRL(totalLancado)}
        </Text>
      </View>

      <View style={{ marginTop: 4, marginBottom: 12 }}>
        {isExact ? (
          <Text style={{ color: '#4CAF50', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>
            Agora você pode lançar normalmente :)
          </Text>
        ) : (
          <Text style={{ color: '#FF5252', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>
            Ainda faltam R$ {formatBRL(Math.abs(diff))} para você poder lançar a venda!
          </Text>
        )}
      </View>
    </View>
  );
}
