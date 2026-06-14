import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../../../../data/datasources/supabase/client';
import type { DBCashRegisterEntry } from '../../../../../db/schema';

interface DateSummary {
  date: string;
  hasOpening: boolean;
  hasClosing: boolean;
  openingCode?: string;
  closingCode?: string;
}

export function useCashRegisterHistoryScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const highlightDate = route.params?.highlightDate as string | undefined;
  const [entries, setEntries] = useState<DBCashRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cash_register_entries')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      /* istanbul ignore next */ if (error) throw error;
      /* istanbul ignore next */ setEntries(data || []);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    /* istanbul ignore next */ setRefreshing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  const dates: DateSummary[] = entries.reduce<DateSummary[]>((acc, entry) => {
    const existing = acc.find(d => d.date === entry.date);
    /* istanbul ignore next */ if (existing) {
      if (entry.entry_type === 'opening') { existing.hasOpening = true; existing.openingCode = entry.code; }
      if (entry.entry_type === 'closing') { existing.hasClosing = true; existing.closingCode = entry.code; }
    } else {
      acc.push({
        date: entry.date,
        hasOpening: entry.entry_type === 'opening',
        hasClosing: entry.entry_type === 'closing',
        openingCode: entry.entry_type === 'opening' ? entry.code : undefined,
        closingCode: entry.entry_type === 'closing' ? entry.code : undefined,
      });
    }
    return acc;
  }, []).sort((a, b) => b.date.localeCompare(a.date));

  const handleView = (date: string) => {
    navigation.navigate('CashRegisterCompareScreen', { date, mode: 'closing' });
  };

  return { colors, isDarkMode, navigation, dates, loading, refreshing, onRefresh, handleView, highlightDate };
}
