import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert, RefreshControl, Animated, Switch, TextInput, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AdminHeader from '../../../components/AdminHeader';
import { AdminUserMenu } from '../../../components/AdminUserMenu';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { styles } from './AdminDashboardScreen.styles';
import { useAdminDashboard } from './useAdminDashboard';
import DashboardOverview from './components/DashboardOverview';
import PDVSection from './components/PDVSection';
import CheckoutModal from './components/CheckoutModal';
import CashFlowFilterModal from './components/CashFlowFilterModal';
import FilterOptionModal from './components/FilterOptionModal';
import SundayHolidayModal from './components/SundayHolidayModal';
import TransactionModal from './components/TransactionModal';

import AdminBottomTabBar from './components/AdminBottomTabBar';
import AdminPDVBottomBar from './components/AdminPDVBottomBar';
import type { SortOption } from './components/PDVSection';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'alpha', label: 'Ordem alfabética' },
  { value: 'newest', label: 'Produtos mais novos' },
  { value: 'oldest', label: 'Produtos mais velhos' },
  { value: 'most_stock', label: 'Mais estoque' },
  { value: 'highest_price', label: 'Maior preço' },
  { value: 'lowest_price', label: 'Menor preço' },
];

export default function AdminDashboardScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const d = useAdminDashboard();

  const [stickyExpanded, setStickyExpanded] = useState(true);
  const manualOverride = useRef(false);
  const scrollYRef = useRef(0);

  const stickyAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(stickyAnim, {
      toValue: stickyExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [stickyExpanded]);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const prevY = scrollYRef.current;
    scrollYRef.current = y;
    if (!manualOverride.current) {
      if (y > 80 && y > prevY) {
        setStickyExpanded(false);
      } else if (y <= 20 && !stickyExpanded) {
        setStickyExpanded(true);
      }
    }
  };

  const handleToggleSticky = () => {
    if (!stickyExpanded) {
      manualOverride.current = true;
      setStickyExpanded(true);
    } else {
      manualOverride.current = false;
      setStickyExpanded(false);
    }
  };

  const pencilSpin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pencilSpin, {
      toValue: d.quantityInputMode ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [d.quantityInputMode]);
  const spinInterpolate = pencilSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const dollarAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(dollarAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
      Animated.timing(dollarAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [d.bulkValueMode]);

  const chartData = d.generateChartPoints();
  const { points, maxVal, width: gWidth, height: gHeight, paddingBottom, paddingLeft } = chartData;

  let pathD = '';
  let areaD = '';
  /* istanbul ignore next */ if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    areaD = pathD + ` L ${points[points.length - 1].x} ${gHeight - paddingBottom} L ${points[0].x} ${gHeight - paddingBottom} Z`;
  }

  const iconColorInactive = isDarkMode ? '#FFFFFF' : undefined;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.white }]}>
      <AdminHeader title="painel_vendas" />

      {d.isPDVMode && (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {!stickyExpanded && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleToggleSticky}
              style={{ alignItems: 'center', paddingVertical: 4 }}
            >
              <Feather name="chevron-down" size={20} color={isDarkMode ? '#FFFFFF' : '#1C2434'} />
            </TouchableOpacity>
          )}
          <Animated.View style={{
            maxHeight: stickyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 500] }),
            opacity: stickyAnim,
            overflow: 'hidden',
          }} pointerEvents={stickyExpanded ? 'auto' : 'none'}>
            <View style={{
              height: 40, backgroundColor: isDarkMode ? '#1E1E24' : '#F5F6FA',
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
              borderRadius: 20, marginBottom: 10, width: '100%',
            }}>
              <Feather name="search" size={16} color={isDarkMode ? '#A8A8B3' : '#767676'} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, color: isDarkMode ? '#FFFFFF' : '#1C2434', fontSize: 14, textAlign: 'left', paddingVertical: 0 }}
                placeholder="Pesquisar produto..."
                placeholderTextColor={isDarkMode ? '#A8A8B3' : '#767676'}
                value={d.pdvSearchText}
                onChangeText={d.setPdvSearchText}
              />
              {d.pdvSearchText.length > 0 && (
                <TouchableOpacity onPress={() => d.setPdvSearchText('')} activeOpacity={0.7} style={{ padding: 2 }}>
                  <Feather name="x" size={14} color={isDarkMode ? '#A8A8B3' : '#767676'} />
                </TouchableOpacity>
              )}
            </View>

            <View style={{ marginBottom: 10 }}>
              <View style={[{ backgroundColor: isDarkMode ? '#2E2E38' : '#E3E4EB', flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingVertical: 4, paddingHorizontal: 6, minHeight: 46 }]}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => d.setShowSortModal(true)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
                  <Feather name="sliders" size={12} color={isDarkMode ? '#FFFFFF' : '#8A7268'} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#8A7268', marginLeft: 4 }}>Filtro</Text>
                  <Feather name="chevron-down" size={12} color={isDarkMode ? '#FFFFFF' : '#8A7268'} style={{ marginLeft: 2 }} />
                </TouchableOpacity>
                <View style={{ width: 1, height: 20, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268', marginHorizontal: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#8A7268', marginHorizontal: 8 }}>Categoria</Text>
                <View style={{ width: 1, height: 20, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268', marginHorizontal: 4 }} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, gap: 8, alignItems: 'center' }}>
                  {d.categories.filter((c: any) => c.active).map((cat: any) => {
                    const isSelected = d.pdvActiveCategories.includes(cat.name);
                    return (
                      <TouchableOpacity
                        key={cat.id} activeOpacity={0.7}
                        onPress={() => d.setPdvActiveCategories((prev: string[]) => prev.includes(cat.name) ? prev.filter((c: string) => c !== cat.name) : [...prev, cat.name])}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: isSelected ? (isDarkMode ? '#5B86E5' : '#E3DAD9') : 'transparent' }}
                      >
                        <Text style={{
                          color: isSelected ? (isDarkMode ? '#FFFFFF' : '#9C3F07') : (isDarkMode ? '#FFFFFF' : '#8A7268'),
                          fontWeight: isSelected ? 'bold' : 'normal', fontSize: 12
                        }}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={{
              flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8, justifyContent: 'space-between'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                  <Feather name="edit-3" size={18} color={d.quantityInputMode ? '#2BE060' : (isDarkMode ? '#8E8E93' : '#767676')} />
                </Animated.View>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: d.quantityInputMode ? '#2BE060' : (isDarkMode ? '#FFFFFF' : '#1C2434') }}>
                  Ativar digitação
                </Text>
                <Switch
                  value={d.quantityInputMode}
                  onValueChange={() => d.setQuantityInputMode(!d.quantityInputMode)}
                  trackColor={{ false: isDarkMode ? '#3E3E4A' : '#C0CADE', true: '#2BE060' }}
                  thumbColor={isDarkMode ? '#FFF' : '#FFF'}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Animated.View style={{ transform: [{ scale: dollarAnim }] }}>
                  <Feather name="dollar-sign" size={18} color={!d.bulkValueMode ? '#2BE060' : (isDarkMode ? '#8E8E93' : '#767676')} />
                </Animated.View>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: !d.bulkValueMode ? '#2BE060' : (isDarkMode ? '#FFFFFF' : '#1C2434') }}>
                  Mudar à granel
                </Text>
                <Switch
                  value={d.bulkValueMode}
                  onValueChange={() => d.setBulkValueMode(!d.bulkValueMode)}
                  trackColor={{ false: isDarkMode ? '#3E3E4A' : '#C0CADE', true: '#2BE060' }}
                  thumbColor={isDarkMode ? '#FFF' : '#FFF'}
                />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleToggleSticky}
              style={{ alignItems: 'center', paddingVertical: 4 }}
            >
              <Feather name="chevron-up" size={20} color={isDarkMode ? '#FFFFFF' : '#1C2434'} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          d.isPDVMode && { paddingBottom: Platform.OS === 'ios' ? 160 : 140 }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl refreshing={d.refreshing} onRefresh={d.onRefresh} />
        }
      >
        {!d.isPDVMode ? (
          <DashboardOverview
            isDarkMode={isDarkMode}
            colors={colors}
            saldoTotalCaixaGeral={d.saldoTotalCaixaGeral}
            totalCreditoGeral={d.totalCreditoGeral}
            totalDebitoGeral={d.totalDebitoGeral}
            totalPixGeral={d.totalPixGeral}
            totalDinheiroCaixaGeral={d.totalDinheiroCaixaGeral}
            formatCurrency={d.formatCurrency}
            pulseAnim={d.pulseAnim}
            onNavigateConsultSales={() => navigation.navigate('AdminConsultSalesScreen')}
            onOpenCashRegister={() => navigation.navigate('CashRegisterScreen')}
            onEnterPDV={() => { d.setIsPDVMode(true); d.setDismissedProductIds(new Set()); }}
            onOpenSuprimento={() => { d.setModalTransactionType('suprimento'); d.setShowTransactionModal(true); }}
            onOpenSangria={() => { d.setModalTransactionType('sangria'); d.setShowTransactionModal(true); }}
            getDynamicTitle={d.getDynamicTitle}
            hasFiltered={d.hasFiltered}
            isRange={d.isRange}
            startDate={d.startDate}
            endDate={d.endDate}
            onFilterPress={() => {
              d.setLocalStartDate(d.startDate);
              d.setLocalEndDate(d.endDate);
              d.setShowFilterOptionModal(true);
            }}
            loading={d.loading}
            points={points}
            maxVal={maxVal}
            gWidth={gWidth}
            gHeight={gHeight}
            paddingBottom={paddingBottom}
            paddingLeft={paddingLeft}
            pathD={pathD}
            areaD={areaD}
            ticketMedio={d.ticketMedio}
            volumeVendas={d.volumeVendas}
            topMethod={d.topMethod}
            activeTransactions={d.activeTransactions}
            cashFlowFilter={d.cashFlowFilter}
            cashFlowStartDate={d.cashFlowStartDate}
            cashFlowEndDate={d.cashFlowEndDate}
            onCashFlowFilterPress={() => {
              d.setCashLocalFilter(d.cashFlowFilter);
              d.setCashLocalStartDate(d.cashFlowStartDate);
              d.setCashLocalEndDate(d.cashFlowEndDate);
              d.setShowCashFlowFilterModal(true);
            }}
          />
        ) : (
          <PDVSection
            pdvSearchText={d.pdvSearchText}
            onSearchChange={d.setPdvSearchText}
            pdvActiveCategories={d.pdvActiveCategories}
            onCategoryToggle={/* istanbul ignore next */ (cat) =>
              d.setPdvActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
            }
            pdvSortOption={d.pdvSortOption}
            onSortChange={d.setPdvSortOption}
            pdvSelectMode={d.pdvSelectMode}
            pdvCart={d.pdvCart}
            pdvProducts={d.pdvProducts}
            pdvLoading={d.pdvLoading}
            onRegisterPress={() => {
              if (!d.pdvSelectMode) {
                d.setPdvSelectMode(true);
              } else {
                const selectedItems = d.pdvProducts.filter(p => d.pdvCart[p.id]?.checked);
                if (selectedItems.length === 0) {
                  Alert.alert('Nenhum produto selecionado', 'Por favor, selecione pelo menos um produto com o checkbox para registrar.');
                  return;
                }
                d.setShowCheckoutModal(true);
              }
            }}
            onCancelPress={() => { d.setPdvSelectMode(false); d.setPdvCart({}); d.setPdvBulkValues({}); }}
            onToggleCart={d.togglePdvCart}
            onUpdateQty={d.updatePdvCartQty}
            quantityInputMode={d.quantityInputMode}
            setPdvCartQty={d.setPdvCartQty}
            bulkInputUnit={d.bulkInputUnit}
            setBulkInputUnit={d.setBulkInputUnit}
            bulkValueMode={d.bulkValueMode}
            pdvBulkValues={d.pdvBulkValues}
            onBulkValueChange={d.setPdvBulkValue}
            onDismissAlert={d.dismissAlert}
            dismissedProductIds={d.dismissedProductIds}
            cancelOpacity={d.cancelOpacity}
            isDarkMode={isDarkMode}
            formatCurrency={d.formatCurrency}
            categories={d.categories}
          />
        )}
      </ScrollView>

      <CheckoutModal
        visible={d.showCheckoutModal}
        pdvProducts={d.pdvProducts}
        pdvCart={d.pdvCart}
        checkoutPaymentMethod={d.checkoutPaymentMethod}
        pdvLoading={d.pdvLoading}
        isDarkMode={isDarkMode}
        onClose={() => { d.setShowCheckoutModal(false); d.setDropdownExpanded(false); }}
        onPaymentMethodChange={d.setCheckoutPaymentMethod}
        onConfirm={d.handleConfirmPdvSale}
        bulkValueMode={d.bulkValueMode}
        pdvBulkValues={d.pdvBulkValues}
      />

      {d.isPDVMode && d.showSortModal && (
        <Modal visible={d.showSortModal} transparent animationType="fade">
          <TouchableOpacity activeOpacity={1} onPress={() => d.setShowSortModal(false)}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '85%', backgroundColor: isDarkMode ? '#2E2E38' : '#FFFFFF', borderRadius: 20, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#1C2434', marginBottom: 16 }}>Ordenar por</Text>
              {SORT_OPTIONS.map(o => {
                const isSelected = d.pdvSortOption === o.value;
                return (
                  <TouchableOpacity key={o.value} activeOpacity={0.7}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }}
                    onPress={() => { d.setPdvSortOption(o.value); d.setShowSortModal(false); }}>
                    <Text style={{ fontSize: 15, color: isDarkMode ? '#FFF' : '#1C2434', fontWeight: isSelected ? 'bold' : 'normal' }}>{o.label}</Text>
                    <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: isSelected ? '#25BE36' : (isDarkMode ? '#888' : '#A8A8B3'), alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#25BE36' }} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <CashFlowFilterModal
        visible={d.showCashFlowFilterModal}
        cashLocalFilter={d.cashLocalFilter}
        cashLocalStartDate={d.cashLocalStartDate}
        cashLocalEndDate={d.cashLocalEndDate}
        isDarkMode={isDarkMode}
        colors={colors}
        onClose={() => d.setShowCashFlowFilterModal(false)}
        onFilterChange={d.setCashLocalFilter}
        onStartDatePress={() => { d.setPickerMode('cash_range_start'); d.setShowPicker(true); }}
        onEndDatePress={() => { d.setPickerMode('cash_range_end'); d.setShowPicker(true); }}
        onConfirm={() => {
          if (d.cashLocalStartDate && d.cashLocalEndDate) {
            let start = new Date(d.cashLocalStartDate);
            let end = new Date(d.cashLocalEndDate);
            if (start.getTime() > end.getTime()) { const t = start; start = end; end = t; }
            d.setCashFlowStartDate(start);
            d.setCashFlowEndDate(end);
          } else {
            d.setCashFlowStartDate(null);
            d.setCashFlowEndDate(null);
          }
          d.setCashFlowFilter(d.cashLocalFilter);
          d.setShowCashFlowFilterModal(false);
        }}
        onCancel={() => d.setShowCashFlowFilterModal(false)}
      />

      <FilterOptionModal
        visible={d.showFilterOptionModal}
        localStartDate={d.localStartDate}
        localEndDate={d.localEndDate}
        isDarkMode={isDarkMode}
        colors={colors}
        onClose={() => d.setShowFilterOptionModal(false)}
        onSingleDayPress={() => { d.setPickerMode('single'); d.setShowPicker(true); }}
        onRangeStartPress={() => { d.setPickerMode('range_start'); d.setShowPicker(true); }}
        onRangeEndPress={() => { d.setPickerMode('range_end'); d.setShowPicker(true); }}
        onRangeConfirm={() => {
          let start = new Date(d.localStartDate);
          let end = new Date(d.localEndDate);
          /* istanbul ignore next */ if (start.getTime() > end.getTime()) { const t = start; start = end; end = t; }
          d.setPrevStartDate(d.startDate);
          d.setPrevEndDate(d.endDate);
          d.setPrevIsRange(d.isRange);
          d.setPrevHasFiltered(d.hasFiltered);
          d.setStartDate(start);
          d.setEndDate(end);
          d.setIsRange(true);
          d.setHasFiltered(true);
          d.setShowFilterOptionModal(false);
        }}
      />

      <SundayHolidayModal
        visible={d.showSundayHolidayModal}
        onClose={d.handleCloseSundayHolidayModal}
      />

      <TransactionModal
        visible={d.showTransactionModal}
        modalTransactionType={d.modalTransactionType}
        modalPaymentMethod={d.modalPaymentMethod}
        formattedAmount={d.formattedAmount}
        transactionDesc={d.transactionDesc}
        isDarkMode={isDarkMode}
        colors={colors}
        onClose={() => {
          d.setShowTransactionModal(false);
          d.setRawAmount(0);
          d.setFormattedAmount('');
          d.setTransactionDesc('');
        }}
        onPaymentMethodChange={d.setModalPaymentMethod}
        onAmountChange={d.handleAmountChange}
        onDescChange={d.setTransactionDesc}
        onConfirm={d.handleSaveTransaction}
      />

      {d.showPicker && (
        <DateTimePicker
          value={
            d.pickerMode === 'range_end' ? d.endDate :
              d.pickerMode === 'range_start' ? d.startDate :
                d.pickerMode === 'cash_range_start' ? (d.cashLocalStartDate || new Date()) :
                  d.pickerMode === 'cash_range_end' ? (d.cashLocalEndDate || new Date()) :
                    d.startDate
          }
          mode="date"
          display="default"
          onChange={d.onChangeDate}
          themeVariant={ /* istanbul ignore next */ isDarkMode ? 'dark' : 'light' }
        />
      )}

      {!d.isPDVMode && (
        <AdminBottomTabBar isDarkMode={isDarkMode} iconColorInactive={iconColorInactive} />
      )}

      {d.isPDVMode && (
        <AdminPDVBottomBar isDarkMode={isDarkMode} onClose={() => d.setIsPDVMode(false)} />
      )}

      <AdminUserMenu />
    </View>
  );
}
