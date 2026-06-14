import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AdminHeader from '../../../../components/AdminHeader';
import { AdminUserMenu } from '../../../../components/AdminUserMenu';
import { useCashRegisterCompareScreen } from './useCashRegisterCompareScreen';
import { styles } from './CashRegisterCompareScreen.styles';

export default function CashRegisterCompareScreen() {
  const h = useCashRegisterCompareScreen();
  const textColor = h.isDarkMode ? '#FFFFFF' : '#1C2434';
  const bgColor = h.isDarkMode ? '#18181C' : '#F5F5F5';
  const cardBg = h.isDarkMode ? '#2E2E38' : '#FFFFFF';
  const dimColor = h.isDarkMode ? '#8E8E93' : '#767676';
  const sepColor = h.isDarkMode ? '#3E3E4A' : '#E3E4EB';
  const headerColor = h.isDarkMode ? '#FFE082' : '#F97D01';
  const greenColor = '#2BE060';

  if (h.loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF5C00" />
      </View>
    );
  }

  const renderDiffValue = (val: number) => {
    const sign = val > 0 ? '+' : '';
    const color = val > 0 ? greenColor : val < 0 ? '#FF3B30' : dimColor;
    return (
      <Text style={{ flex: 1, fontSize: 13, fontWeight: 'bold', textAlign: 'center', color }}>
        {sign}R$ {val.toFixed(2).replace('.', ',')}
      </Text>
    );
  };

  const renderDiffQty = (val: number) => {
    const sign = val > 0 ? '+' : '';
    const color = val > 0 ? greenColor : val < 0 ? '#FF3B30' : dimColor;
    return (
      <Text style={{ flex: 1, fontSize: 14, fontWeight: 'bold', textAlign: 'center', color }}>
        {sign}{val}
      </Text>
    );
  };

  const renderRow = (item: { label: string; openingQty: number; closingQty: number; diffQty: number; diffValue: number }) => (
    <View key={item.label} style={[styles.row, { borderBottomColor: sepColor }]}>
      <Text style={[styles.labelCell, { color: textColor }]}>{item.label}</Text>
      {h.showOpening && (
        <Text style={[styles.cell, { color: textColor }]}>{item.openingQty}</Text>
      )}
      {h.showClosing && (
        <Text style={[styles.cell, { color: textColor }]}>{item.closingQty}</Text>
      )}
      {h.showDiff && (
        <>
          {renderDiffQty(item.diffQty)}
          {renderDiffValue(item.diffValue)}
        </>
      )}
    </View>
  );

  const renderSection = (title: string, items: typeof h.billDiffs) => (
    <View style={{ backgroundColor: cardBg, borderRadius: 16, marginBottom: 16, overflow: 'hidden' }}>
      <Text style={[styles.sectionHeader, { color: headerColor }]}>{title}</Text>
      <View style={[styles.row, { borderBottomColor: sepColor }]}>
        <Text style={[styles.labelCell, { color: dimColor, fontSize: 12 }]} />
        {h.showOpening && <Text style={[styles.colHeader, { color: dimColor }]}>Abertura</Text>}
        {h.showClosing && <Text style={[styles.colHeader, { color: dimColor }]}>Fechamento</Text>}
        {h.showDiff && (
          <>
            <Text style={[styles.colHeader, { color: dimColor }]}>Dif.</Text>
            <Text style={[styles.colHeader, { color: dimColor }]}>R$ Dif.</Text>
          </>
        )}
      </View>
      {items.map(renderRow)}
    </View>
  );

  const modeLabel = h.mode === 'opening' ? 'Abertura' : h.mode === 'closing' ? 'Fechamento' : 'Comparação';

  return (
    <View style={[styles.mainContainer, { backgroundColor: bgColor }]}>
      <AdminHeader title={`comparação_caixa`} />

      <View style={[styles.headerCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.headerDate, { color: textColor }]}>Caixa - {h.formattedDate}</Text>
        <Text style={[styles.headerCode, { color: dimColor }]}>Código: {h.code} · {modeLabel}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderSection('Cédulas', h.billDiffs)}
        {renderSection('Moedas', h.coinDiffs)}

        <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={styles.totalRow}>
            <Text style={{ fontSize: 14, color: textColor }}>Total abertura</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor }}>
              R$ {h.openingTotal.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          {h.hasClosing && (
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 14, color: textColor }}>Total fechamento</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor }}>
                R$ {h.closingTotal.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          )}
          {h.showDiff && (
            <>
              <View style={[styles.totalSeparator, { backgroundColor: sepColor }]} />
              <Text style={[styles.totalValue, { color: h.diffTotal >= 0 ? greenColor : '#FF3B30' }]}>
                Diferença: {h.diffTotal >= 0 ? '+' : ''}R$ {h.diffTotal.toFixed(2).replace('.', ',')}
              </Text>
            </>
          )}
        </View>

        <View style={{ gap: 10, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {h.hasOpening && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2D8CE5' }]} activeOpacity={0.7} onPress={h.handleViewOpening}>
                <Text style={styles.actionBtnText}>Ver abertura</Text>
              </TouchableOpacity>
            )}
            {h.hasClosing && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2D8CE5' }]} activeOpacity={0.7} onPress={h.handleViewClosing}>
                <Text style={styles.actionBtnText}>Ver fechamento</Text>
              </TouchableOpacity>
            )}
          </View>
          {h.hasOpening && h.hasClosing && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F97D01' }]} activeOpacity={0.7} onPress={h.handleCompare}>
              <Text style={styles.actionBtnText}>Comparar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: sepColor }]} activeOpacity={0.7} onPress={h.handleVoltar}>
            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15 }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AdminUserMenu />
    </View>
  );
}
