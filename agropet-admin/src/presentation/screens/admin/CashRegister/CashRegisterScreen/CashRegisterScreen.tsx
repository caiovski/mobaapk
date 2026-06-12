import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AdminHeader from '../../../../components/AdminHeader';
import { AdminUserMenu } from '../../../../components/AdminUserMenu';
import { DenominationRow } from './components/DenominationRow';
import { useCashRegisterScreen } from './useCashRegisterScreen';
import { styles } from './CashRegisterScreen.styles';
import { isHoliday } from '../../../../../utils/shopHours';

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
  const textColor = h.isDarkMode ? '#FFFFFF' : '#1C2434';
  const bgColor = h.isDarkMode ? '#18181C' : '#F5F5F5';
  const cardBg = h.isDarkMode ? '#2E2E38' : '#FFFFFF';
  const dimColor = h.isDarkMode ? '#8E8E93' : '#767676';
  const sepColor = h.isDarkMode ? '#3E3E4A' : '#E3E4EB';
  const headerColor = h.isDarkMode ? '#FFE082' : '#F97D01';

  if (h.loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF5C00" />
      </View>
    );
  }

  const showSteppers = h.canEdit && !h.isPast;
  const canConfirmClose = h.opening && !h.closing && h.isToday && h.canClose();
  const canShowClose = h.opening && !h.closing && h.isToday;
  const hasClosing = !!h.closing;
  const openingAllowed = !h.isPast && !h.opening && h.canOpen();

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
          editable={showSteppers}
          onIncrement={() => h.increment(item.key)}
          onDecrement={() => h.decrement(item.key)}
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

  const renderActions = () => {
    if (h.isPast) {
      return (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          {h.opening && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2D8CE5' }]} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Ver abertura</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: h.closing ? '#2D8CE5' : dimColor, opacity: h.closing ? 1 : 0.5 }]}
            activeOpacity={0.7}
            disabled={!h.closing}
          >
            <Text style={styles.actionBtnText}>Ver fechamento</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!h.opening) {
      return (
        <View>
          {!openingAllowed && (
            <Text style={{ color: dimColor, textAlign: 'center', marginBottom: 8, fontSize: 13 }}>
              Abertura permitida apenas das 07:30 às 09:00 em dias úteis. Domingos não permitem abertura.
            </Text>
          )}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: openingAllowed ? '#339914' : dimColor, opacity: openingAllowed ? 1 : 0.5 }]}
              activeOpacity={0.7}
              onPress={openingAllowed ? () => h.handleSave('opening') : undefined}
              disabled={!openingAllowed}
            >
              <Text style={styles.actionBtnText}>Confirmar abertura</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: sepColor }]} activeOpacity={0.7} onPress={() => h.navigation.goBack()}>
              <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (h.isEditing) {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#339914' }]} activeOpacity={0.7} onPress={h.handleUpdate}>
            <Text style={styles.actionBtnText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: sepColor }]} activeOpacity={0.7} onPress={() => h.setIsEditing(false)}>
            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {canShowClose && !canConfirmClose && (
          <Text style={{ color: dimColor, textAlign: 'center', marginBottom: 8, fontSize: 13 }}>
            {(() => {
              const now = new Date();
              const dayOfWeek = now.getDay();
              const isHol = isHoliday(now);
              if (dayOfWeek === 6 || isHol) return 'Fechamento disponível apenas das 12:00 às 14:00 em sábados e feriados.';
              return 'Fechamento disponível apenas das 17:00 às 19:00 em dias úteis.';
            })()}
          </Text>
        )}
        <View style={styles.actionRow}>
          {h.opening && !h.opening.edited && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2BE060' }]} activeOpacity={0.7} onPress={() => h.setIsEditing(true)}>
              <Text style={styles.actionBtnText}>Editar abertura</Text>
            </TouchableOpacity>
          )}
          {canShowClose && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: canConfirmClose ? '#A72424' : dimColor, opacity: canConfirmClose ? 1 : 0.5 }]}
              activeOpacity={0.7}
              onPress={canConfirmClose ? () => h.handleSave('closing') : undefined}
              disabled={!canConfirmClose}
            >
              <Text style={styles.actionBtnText}>Fechar caixa</Text>
            </TouchableOpacity>
          )}
          {hasClosing && h.closing && !h.closing.edited && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2BE060' }]} activeOpacity={0.7} onPress={() => h.setIsEditing(true)}>
              <Text style={styles.actionBtnText}>Editar fechamento</Text>
            </TouchableOpacity>
          )}
        </View>
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
          style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#2D8CE5' }}>
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
        {renderActions()}
      </ScrollView>

      <AdminUserMenu />
    </View>
  );
}
