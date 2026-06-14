import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCashRegister } from '../../../../contexts/useCashRegister';

export function useCashRegisterScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [selectedDate, setSelectedDate] = useState(
    route.params?.date || new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (route.params?.date) {
      setSelectedDate(route.params.date);
    }
  }, [route.params?.date]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [quantityInputMode, setQuantityInputMode] = useState(false);

  const cr = useCashRegister(selectedDate);
  const { handleEncerrar: crHandleEncerrar, ...restCr } = cr;

  const handleEncerrar = useCallback(async () => {
    await crHandleEncerrar();
    navigation.navigate('CashRegisterHistoryScreen', { highlightDate: selectedDate });
  }, [crHandleEncerrar, navigation, selectedDate]);

  const handleHistoryPress = () => {
    navigation.navigate('CashRegisterHistoryScreen');
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const formatted = date.toISOString().split('T')[0];
      setSelectedDate(formatted);
    }
  };

  const handleViewOpening = () => {
    navigation.navigate('CashRegisterCompareScreen', { date: selectedDate, mode: 'opening' });
  };

  const handleViewClosing = () => {
    navigation.navigate('CashRegisterCompareScreen', { date: selectedDate, mode: 'closing' });
  };

  const handleCompare = () => {
    navigation.navigate('CashRegisterCompareScreen', { date: selectedDate, mode: 'compare' });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return {
    colors, isDarkMode, navigation,
    selectedDate, showDatePicker, setShowDatePicker,
    quantityInputMode, setQuantityInputMode,
    handleHistoryPress,
    handleDateChange,
    handleViewOpening,
    handleViewClosing,
    handleCompare,
    handleCancel,
    handleEncerrar,
    ...restCr,
  };
}
