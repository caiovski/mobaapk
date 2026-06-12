import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AdminHeader from '../../../../components/AdminHeader';
import { AdminUserMenu } from '../../../../components/AdminUserMenu';
import { useCashRegisterHistoryScreen } from './useCashRegisterHistoryScreen';
import { styles } from './CashRegisterHistoryScreen.styles';

export default function CashRegisterHistoryScreen() {
  const h = useCashRegisterHistoryScreen();
  const bgColor = h.isDarkMode ? '#18181C' : '#F5F5F5';
  const cardBg = h.isDarkMode ? '#2E2E38' : '#FFFFFF';
  const textColor = h.isDarkMode ? '#FFFFFF' : '#1C2434';
  const dimColor = h.isDarkMode ? '#8E8E93' : '#767676';

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
      <FlatList
        data={h.entries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View>
              <Text style={[styles.codeText, { color: textColor }]}>{item.code}</Text>
              <Text style={[styles.dateText, { color: dimColor }]}>
                {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <TouchableOpacity style={[styles.viewBtn, { backgroundColor: '#2D8CE5' }]}
              activeOpacity={0.7} onPress={() => h.handleView(item.date)}>
              <Text style={styles.viewBtnText}>Ver</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: dimColor }]}>
            Nenhum registro de abertura encontrado.
          </Text>
        }
      />
      <AdminUserMenu />
    </View>
  );
}
