import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminHeader from '../../../../components/AdminHeader';
import { AdminUserMenu } from '../../../../components/AdminUserMenu';
import { useCashRegisterHistoryScreen } from './useCashRegisterHistoryScreen';
import { styles } from './CashRegisterHistoryScreen.styles';

const keyExtractor = (item: any) => item.date;

export default function CashRegisterHistoryScreen() {
  const h = useCashRegisterHistoryScreen();
  const bgColor = h.isDarkMode ? '#18181C' : '#F5F5F5';
  const cardBg = h.isDarkMode ? '#2E2E38' : '#FFFFFF';
  const textColor = h.isDarkMode ? '#FFFFFF' : '#1C2434';
  const dimColor = h.isDarkMode ? '#8E8E93' : '#767676';
  const greenColor = '#2BE060';
  const redColor = '#FF3B30';

  const highlightAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    /* istanbul ignore next */ if (h.highlightDate) {
      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(highlightAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }
  }, [h.highlightDate]);

  if (h.loading) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF5C00" />
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: bgColor }]}>
      <AdminHeader title="histórico_caixa" />
      <Text style={{ color: textColor, fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 8 }}>
        Registro de abertura/fechamento do caixa:
      </Text>
      const renderItem = useCallback(({ item }: any) => {
        const isHighlighted = item.date === h.highlightDate;
        const cardOpacity = highlightAnim.interpolate({
          inputRange: [0, 1], outputRange: [1, 0.55],
        });
        const cardScale = highlightAnim.interpolate({
          inputRange: [0, 1], outputRange: [1, 1.04],
        });
        return (
          <Animated.View style={[
            styles.card, { backgroundColor: cardBg },
            /* istanbul ignore next */ isHighlighted ? { opacity: cardOpacity, transform: [{ scale: cardScale }] } : undefined,
          ]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: textColor }}>
                { /* istanbul ignore next */ item.closingCode || item.openingCode || '---'}
              </Text>
              <Text style={[styles.dateText, { color: textColor }]}>
                {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {item.hasOpening && (
                  <Text style={{ fontSize: 12, color: greenColor, fontWeight: 'bold' }}>Abertura ✓</Text>
                )}
                {/* istanbul ignore next */}
                { /* istanbul ignore next */ !item.hasOpening && (
                  <Text style={{ fontSize: 12, color: redColor, fontWeight: 'bold' }}>Abertura ✗</Text>
                )}
                {item.hasClosing && (
                  <Text style={{ fontSize: 12, color: greenColor, fontWeight: 'bold' }}>Fechamento ✓</Text>
                )}
                {!item.hasClosing && (
                  <Text style={{ fontSize: 12, color: redColor, fontWeight: 'bold' }}>Fechamento ✗</Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={[styles.viewBtn, { backgroundColor: '#2D8CE5' }]}
              activeOpacity={0.7} onPress={() => h.handleView(item.date)}>
              <Text style={styles.viewBtnText}>Ver</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      }, [h.highlightDate, h.handleView, highlightAnim, cardBg, textColor, greenColor, redColor]);

      <FlatList
        data={h.dates}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={h.refreshing} onRefresh={h.onRefresh} tintColor="#FF5C00" colors={['#FF5C00']} />}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: dimColor }]}>
            Nenhum registro de caixa encontrado.
          </Text>
        }
      />
      <AdminUserMenu />

      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: /* istanbul ignore next */ Platform.OS === 'ios' ? 110 : 90,
        backgroundColor: h.isDarkMode ? '#1E1E24' : '#ECECEC',
        borderTopWidth: 1,
        borderTopColor: h.isDarkMode ? '#3E3E4A' : '#D2D2D2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingBottom: /* istanbul ignore next */ Platform.OS === 'ios' ? 25 : 15,
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#2D8CE5',
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 25,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={/* istanbul ignore next */ () => h.navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="caret-back" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' }}>Painel do caixa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
