import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AdminHeader from '../../../../components/AdminHeader';
import { AdminUserMenu } from '../../../../components/AdminUserMenu';
import { DenominationRow } from './components/DenominationRow';
import { GlowButton } from './components/GlowButton';
import { useCashRegisterScreen } from './useCashRegisterScreen';
import { styles } from './CashRegisterScreen.styles';

import type { DenominationInput } from '../../../../../db/schema';

type DenomKey = keyof DenominationInput;

const BILLS: { key: DenomKey; label: string }[] = [
  { key: 'bill_200', label: 'R$ 200' },
  { key: 'bill_100', label: 'R$ 100' },
  { key: 'bill_50', label: 'R$  50' },
  { key: 'bill_20', label: 'R$  20' },
  { key: 'bill_10', label: 'R$  10' },
  { key: 'bill_5', label: 'R$   5' },
  { key: 'bill_2', label: 'R$   2' },
];

const COINS: { key: DenomKey; label: string }[] = [
  { key: 'coin_100', label: 'R$ 1,00' },
  { key: 'coin_050', label: 'R$ 0,50' },
  { key: 'coin_025', label: 'R$ 0,25' },
  { key: 'coin_010', label: 'R$ 0,10' },
  { key: 'coin_005', label: 'R$ 0,05' },
];

export default function CashRegisterScreen() {
  const h = useCashRegisterScreen();
  const isDarkMode = h.isDarkMode;
  const textColor = isDarkMode ? '#FFFFFF' : '#1C2434';
  const bgColor = isDarkMode ? '#18181C' : '#F5F5F5';
  const cardBg = isDarkMode ? '#2E2E38' : '#FFFFFF';
  const dimColor = isDarkMode ? '#8E8E93' : '#767676';
  const sepColor = isDarkMode ? '#3E3E4A' : '#E3E4EB';
  const headerColor = isDarkMode ? '#FFE082' : '#F97D01';
  const orangeColor = '#F97D01';
  const blueColor = '#2D8CE5';

  const pencilSpin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pencilSpin, {
      toValue: /* istanbul ignore next */ h.quantityInputMode ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [h.quantityInputMode]);
  const spinInterpolate = pencilSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (h.loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF5C00" />
      </View>
    );
  }

  const renderSection = (title: string, items: { key: DenomKey; label: string }[]) => (
    <View style={{ backgroundColor: cardBg, borderRadius: 16, marginBottom: 16, overflow: 'hidden' }}>
      <Text style={[styles.sectionHeader, { color: headerColor }]}>{title}</Text>
      {items.map((item, idx) => (
        <DenominationRow
          key={item.key}
          label={item.label}
          value={item.key.startsWith('bill')
            ? [200, 100, 50, 20, 10, 5, 2][idx]
            : [1, 0.5, 0.25, 0.1, 0.05][idx]
          }
          quantity={h.denominations[item.key]}
          editable={h.showSteppers}
          quantityInputMode={h.quantityInputMode}
          onIncrement={() => h.increment(item.key)}
          onDecrement={() => h.decrement(item.key)}
          onQuantityChange={/* istanbul ignore next */ (qty) => h.setDenominationQty(item.key, qty)}
          isDarkMode={h.isDarkMode}
        />
      ))}
    </View>
  );

  const renderTotals = () => (
    <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <View style={styles.totalRow}>
        <Text style={{ fontSize: 14, color: textColor }}>Total em cédulas</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor }}>
          R$ {h.totals.bills.toFixed(2).replace('.', ',')}
        </Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={{ fontSize: 14, color: textColor }}>Total em moedas</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor }}>
          R$ {h.totals.coins.toFixed(2).replace('.', ',')}
        </Text>
      </View>
      <View style={[styles.totalSeparator, { backgroundColor: sepColor }]} />
      <Text style={[styles.globalTotal, { color: headerColor }]}>
        Total global ({h.closing ? 'fechamento' : 'abertura'}): R$ {h.totals.global.toFixed(2).replace('.', ',')}
      </Text>
    </View>
  );

  const renderViewModeActions = () => (
    <View style={{ gap: 10, marginTop: 20 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {h.hasOpening && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: blueColor }]} activeOpacity={0.7} onPress={h.handleViewOpening}>
            <Text style={styles.actionBtnText}>Ver abertura</Text>
          </TouchableOpacity>
        )}
        {h.hasClosing && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: blueColor }]} activeOpacity={0.7} onPress={h.handleViewClosing}>
            <Text style={styles.actionBtnText}>Ver fechamento</Text>
          </TouchableOpacity>
        )}
      </View>
      {h.hasOpening && h.hasClosing && (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: orangeColor }]} activeOpacity={0.7} onPress={h.handleCompare}>
          <Text style={styles.actionBtnText}>Comparar</Text>
        </TouchableOpacity>
      )}
      {h.skipMessage && (
        <Text style={{ color: dimColor, textAlign: 'center', marginTop: 12, fontSize: 13, lineHeight: 18 }}>
          {h.skipMessage}
        </Text>
      )}
      <TouchableOpacity style={[styles.cancelBtn, { borderColor: sepColor }]} activeOpacity={0.7} onPress={h.handleCancel}>
        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15 }}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEditModeActions = () => {
    const lb = h.leftButton;
    const rb = h.rightButton;

    return (
      <View style={{ gap: 10, marginTop: 20 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {lb && (
            <GlowButton
              label={lb.label}
              backgroundColor={/* istanbul ignore next */ lb.enabled ? lb.color : dimColor}
              enabled={lb.enabled}
              onPress={/* istanbul ignore next */ lb.enabled ? () => h.handleAction(lb.action) : undefined}
            />
          )}
          {rb && (
            <GlowButton
              label={rb.label}
              backgroundColor={/* istanbul ignore next */ rb.enabled ? rb.color : dimColor}
              enabled={rb.enabled}
              onPress={/* istanbul ignore next */ rb.enabled ? () => h.handleAction(rb.action) : undefined}
            />
          )}
        </View>
        {h.showEncerrar && (
          <GlowButton label="Encerrar caixa" backgroundColor={orangeColor} enabled={true} onPress={h.handleEncerrar} />
        )}
        <TouchableOpacity style={[styles.cancelBtn, { borderColor: sepColor }]} activeOpacity={0.7} onPress={h.handleCancel}>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15 }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: bgColor }]}>
      <AdminHeader title="painel_caixa" />

      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => h.setShowDatePicker(true)} activeOpacity={0.7}
          style={[styles.dateBtn, { backgroundColor: cardBg, borderColor: sepColor }]}>
          <Feather name="calendar" size={16} color={dimColor} />
          <Text style={[styles.dateBtnText, { color: dimColor }]}>Selecionar data: </Text>
          <Text style={[styles.dateBtnText, { color: textColor }]}>{
            h.selectedDate.split('-').reverse().join('-')
          }</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={h.handleHistoryPress} activeOpacity={0.7}
          style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: blueColor }}>
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>Ver registro</Text>
        </TouchableOpacity>
      </View>

      {h.showDatePicker && (
        <DateTimePicker value={new Date(h.selectedDate)} mode="date" display="default"
          onChange={h.handleDateChange} themeVariant={h.isDarkMode ? 'dark' : 'light'} />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderSection('Cédulas', BILLS)}
        {renderSection('Moedas', COINS)}
        {renderTotals()}

        {h.showSteppers && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8, marginBottom: 8, marginLeft: 8 }}>
            <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
              <Feather name="edit-3" size={18} color={/* istanbul ignore next */ h.quantityInputMode ? '#2BE060' : dimColor} />
            </Animated.View>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: /* istanbul ignore next */ h.quantityInputMode ? '#2BE060' : textColor }}>
              Ativar digitação
            </Text>
            <Switch
              value={h.quantityInputMode}
              onValueChange={h.setQuantityInputMode}
              trackColor={{ false: /* istanbul ignore next */ isDarkMode ? '#3E3E4A' : '#C0CADE', true: '#2BE060' }}
              thumbColor="#FFF"
            />
          </View>
        )}

        {h.isViewMode ? renderViewModeActions() : renderEditModeActions()}
      </ScrollView>

      <AdminUserMenu />
    </View>
  );
}
