import { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchByDate } from '../../../../../services/cashRegisterService';
import type { DBCashRegisterEntry, DenominationInput } from '../../../../../db/schema';

const BILL_KEYS: (keyof DenominationInput)[] = ['bill_200', 'bill_100', 'bill_50', 'bill_20', 'bill_10', 'bill_5', 'bill_2'];
const COIN_KEYS: (keyof DenominationInput)[] = ['coin_100', 'coin_050', 'coin_025', 'coin_010', 'coin_005'];

const DENOM_LABELS: Record<string, string> = {
  bill_200: 'R$ 200', bill_100: 'R$ 100', bill_50: 'R$  50',
  bill_20: 'R$  20', bill_10: 'R$  10', bill_5: 'R$   5', bill_2: 'R$   2',
  coin_100: 'R$ 1,00', coin_050: 'R$ 0,50', coin_025: 'R$ 0,25',
  coin_010: 'R$ 0,10', coin_005: 'R$ 0,05',
};

const DENOM_VALUES: Record<string, number> = {
  bill_200: 200, bill_100: 100, bill_50: 50,
  bill_20: 20, bill_10: 10, bill_5: 5, bill_2: 2,
  coin_100: 1, coin_050: 0.5, coin_025: 0.25,
  coin_010: 0.1, coin_005: 0.05,
};

interface DiffRow {
  label: string;
  openingQty: number;
  closingQty: number;
  diffQty: number;
  diffValue: number;
}

export function useCashRegisterCompareScreen() {
  const { colors, isDarkMode } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const date = route.params?.date || new Date().toISOString().split('T')[0];
  const mode = route.params?.mode || 'compare';

  const [opening, setOpening] = useState<DBCashRegisterEntry | undefined>();
  const [closing, setClosing] = useState<DBCashRegisterEntry | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await fetchByDate(date);
        setOpening(result.opening);
        setClosing(result.closing);
      } catch (err) {
        console.error('Erro ao carregar dados para comparação:', err);
      }
      setLoading(false);
    })();
  }, [date]);

  const formattedDate = date.split('-').reverse().join('-');
  const code = opening?.code || closing?.code || '---';

  const hasOpening = !!opening;
  const hasClosing = !!closing;

  const computeDiffs = (keys: (keyof DenominationInput)[]): DiffRow[] => {
    return keys.map(key => {
      const oq = opening ? (opening as any)[key] : 0;
      const cq = closing ? (closing as any)[key] : 0;
      const diffQ = cq - oq;
      const diffV = diffQ * DENOM_VALUES[key];
      return {
        label: DENOM_LABELS[key],
        openingQty: oq,
        closingQty: cq,
        diffQty: diffQ,
        diffValue: Math.round(diffV * 100) / 100,
      };
    });
  };

  const billDiffs = computeDiffs(BILL_KEYS);
  const coinDiffs = computeDiffs(COIN_KEYS);

  const openingTotal = opening?.total_value || 0;
  const closingTotal = closing?.total_value || 0;
  const diffTotal = Math.round((closingTotal - openingTotal) * 100) / 100;

  const showOpening = mode === 'opening' || mode === 'compare';
  const showClosing = mode === 'closing' || mode === 'compare';
  const showDiff = mode === 'compare';

  const navigateTo = (newMode: string) => {
    navigation.replace('CashRegisterCompareScreen', { date, mode: newMode });
  };

  const handleViewOpening = () => navigateTo('opening');
  const handleViewClosing = () => navigateTo('closing');
  const handleCompare = () => navigateTo('compare');
  const handleVoltar = () => navigation.goBack();

  return {
    colors, isDarkMode, loading, mode,
    formattedDate, code,
    hasOpening, hasClosing,
    showOpening, showClosing, showDiff,
    billDiffs, coinDiffs,
    openingTotal, closingTotal, diffTotal,
    handleViewOpening, handleViewClosing, handleCompare, handleVoltar,
  };
}
