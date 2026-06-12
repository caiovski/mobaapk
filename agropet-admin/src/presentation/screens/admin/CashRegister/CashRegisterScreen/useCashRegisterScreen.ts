import { useState, useMemo, useEffect } from 'react';
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

  const cr = useCashRegister(selectedDate);

  const isPast = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate < today;
  }, [selectedDate]);

  const canEdit = useMemo(() => {
    if (isPast) return false;
    if (cr.opening && !cr.isEditing) return false;
    if (cr.closing && cr.closing.edited) return false;
    if (cr.opening && !cr.opening.edited && cr.isEditing) return true;
    if (cr.closing && !cr.closing.edited && cr.isEditing) return true;
    return !cr.opening || cr.isEditing;
  }, [isPast, cr.opening, cr.closing, cr.isEditing]);

  const getSectionTitle = () => {
    const fmt = selectedDate.split('-').reverse().join('-');
    return selectedDate === new Date().toISOString().split('T')[0] ? 'Abertura do Caixa' : `Caixa - ${fmt}`;
  };

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

  return {
    colors, isDarkMode, navigation,
    selectedDate, showDatePicker, setShowDatePicker,
    isPast, canEdit,
    getSectionTitle,
    ...cr,
    handleHistoryPress,
    handleDateChange,
  };
}
