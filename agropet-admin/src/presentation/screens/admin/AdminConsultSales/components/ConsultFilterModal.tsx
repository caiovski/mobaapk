import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './ConsultFilterModal.styles';

interface ConsultFilterModalProps {
  showFilterModal: boolean;
  isDarkMode: boolean;
  colors: any;
  tempOriginFilter: 'tudo' | 'fisica' | 'concluidos';
  setTempOriginFilter: (val: 'tudo' | 'fisica' | 'concluidos') => void;
  tempPayMethods: string[];
  getPaymentDisplayPortuguese: (method: string) => string;
  getPayMethodColor: (method: string) => string;
  handleToggleTempPayMethod: (method: string) => void;
  tempStatusFilter: 'todos' | 'completed' | 'cancelled';
  setTempStatusFilter: (val: 'todos' | 'completed' | 'cancelled') => void;
  setTempPayMethods: (methods: string[]) => void;
  handleApplyFilters: () => void;
  setShowFilterModal: (val: boolean) => void;
}

export const ConsultFilterModal = ({
  showFilterModal,
  isDarkMode,
  colors,
  tempOriginFilter,
  setTempOriginFilter,
  tempPayMethods,
  getPaymentDisplayPortuguese,
  getPayMethodColor,
  handleToggleTempPayMethod,
  tempStatusFilter,
  setTempStatusFilter,
  setTempPayMethods,
  handleApplyFilters,
  setShowFilterModal,
}: ConsultFilterModalProps) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDarkMode) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isDarkMode, glowAnim]);

  return (
    <Modal visible={showFilterModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.whiteModalContainer, { backgroundColor: isDarkMode ? '#2E2E38' : '#FFFFFF' }]}>
          <Text style={[styles.whiteModalTitle, { color: colors.textDark }]}>Filtrar Vendas</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
            <Text style={[styles.modalSubsectionHeader, { color: isDarkMode ? '#FFE082' : '#F97D01' }]}>Origem da venda</Text>
            {['tudo', 'fisica', 'concluidos'].map((origin) => {
              const label = origin === 'tudo' ? 'Ver tudo' : origin === 'fisica' ? 'Vendas físicas (PDV)' : 'Pedidos concluídos (E-commerce)';
              const isSelected = tempOriginFilter === origin;
              return (
                <TouchableOpacity
                  key={origin}
                  activeOpacity={0.7}
                  style={[styles.modalFilterRow, { borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }]}
                  onPress={() => setTempOriginFilter(origin as any)}
                >
                  <Text style={[styles.modalFilterLabel, { color: colors.textDark, fontWeight: isSelected ? 'bold' : 'normal' }]}>{label}</Text>
                  <View style={[styles.radioCircle, isSelected && { borderColor: '#25BE36' }]}>
                    {isSelected && <View style={styles.radioChecked} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={[
              styles.originInfoContainer,
              {
                backgroundColor: isDarkMode ? '#1B3D1B' : '#E8F5E9',
                borderColor: isDarkMode ? '#4CAF50' : '#2E7D32',
              }
            ]}>
              {isDarkMode && (
                <Animated.View
                  style={[
                    styles.originInfoGlow,
                    {
                      borderColor: '#4CAF50',
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.1, 0.6],
                      }),
                    },
                  ]}
                  pointerEvents="none"
                />
              )}
              <Feather name="info" size={14} color={isDarkMode ? '#A5D6A7' : '#2E7D32'} style={{ marginTop: 1 }} />
              <Text style={[styles.originInfoText, { color: isDarkMode ? '#A5D6A7' : '#2E7D32' }]}>
                Quando você clicar em um desses, automaticamente calculará somente o valor de tipo dessa venda.
              </Text>
            </View>

            <Text style={[styles.modalSubsectionHeader, { color: isDarkMode ? '#FFE082' : '#F97D01', marginTop: 20 }]}>Forma de pagamento</Text>
            {['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'].map((method) => {
              const label = getPaymentDisplayPortuguese(method);
              const isChecked = tempPayMethods.includes(method);
              const themedColor = getPayMethodColor(method);
              return (
                <TouchableOpacity
                  key={method}
                  activeOpacity={0.7}
                  style={[styles.modalFilterRow, { borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }]}
                  onPress={() => handleToggleTempPayMethod(method)}
                >
                  <Text style={[styles.modalFilterLabel, { color: themedColor, fontWeight: 'bold' }]}>{label}</Text>
                  <View style={[styles.checkboxSquare, isChecked && { backgroundColor: themedColor, borderColor: themedColor }]}>
                    {isChecked && <Feather name="check" size={12} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.modalSubsectionHeader, { color: isDarkMode ? '#FFE082' : '#F97D01', marginTop: 20 }]}>Situação da venda</Text>
            {['todos', 'completed', 'cancelled'].map((statusOption) => {
              const label = statusOption === 'todos' ? 'Ver tudo' : statusOption === 'completed' ? 'Apenas Concluídas' : 'Apenas Canceladas';
              const isSelected = tempStatusFilter === statusOption;
              return (
                <TouchableOpacity
                  key={statusOption}
                  activeOpacity={0.7}
                  style={[styles.modalFilterRow, { borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }]}
                  onPress={() => setTempStatusFilter(statusOption as any)}
                >
                  <Text style={[styles.modalFilterLabel, { color: colors.textDark, fontWeight: isSelected ? 'bold' : 'normal' }]}>{label}</Text>
                  <View style={[styles.radioCircle, isSelected && { borderColor: '#25BE36' }]}>
                    {isSelected && <View style={styles.radioChecked} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.modalUtilityRow}>
              <TouchableOpacity onPress={() => setTempPayMethods(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'])}>
                <Text style={[styles.utilityText, { color: colors.primary }]}>Selecionar Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTempPayMethods([])}>
                <Text style={[styles.utilityText, { color: '#FF3B30' }]}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalButtonsRow}>
            <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: '#25BE36' }]} activeOpacity={0.7} onPress={handleApplyFilters}>
              <Text style={styles.modalConfirmText}>Aplicar Filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }]} activeOpacity={0.7} onPress={() => setShowFilterModal(false)}>
              <Text style={[styles.modalCancelText, { color: colors.textDark }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
