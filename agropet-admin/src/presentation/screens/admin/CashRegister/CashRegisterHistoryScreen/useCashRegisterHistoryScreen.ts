import { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { fetchHistory } from '../../../../../services/cashRegisterService';
import type { DBCashRegisterEntry } from '../../../../../db/schema';

export function useCashRegisterHistoryScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<DBCashRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchHistory();
        setEntries(data);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleView = (date: string) => {
    navigation.navigate('CashRegisterScreen', { date });
  };

  return { colors, isDarkMode, navigation, entries, loading, handleView };
}
