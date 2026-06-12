import { useState, useEffect, useCallback } from 'react';
import type { DBCashRegisterEntry, DenominationInput } from '../../db/schema';
import {
  fetchByDate,
  fetchHistory,
  saveEntry,
  updateEntry,
  calculateTotal,
  calculateBillsTotal,
  calculateCoinsTotal,
} from '../../services/cashRegisterService';
import { getStoreHoursForDate, isHoliday } from '../../utils/shopHours';

const EMPTY_DENOMINATIONS: DenominationInput = {
  bill_200: 0, bill_100: 0, bill_50: 0,
  bill_20: 0, bill_10: 0, bill_5: 0, bill_2: 0,
  coin_100: 0, coin_050: 0, coin_025: 0,
  coin_010: 0, coin_005: 0,
};

export function useCashRegister(selectedDate: string) {
  const [opening, setOpening] = useState<DBCashRegisterEntry | undefined>();
  const [closing, setClosing] = useState<DBCashRegisterEntry | undefined>();
  const [denominations, setDenominations] = useState<DenominationInput>({ ...EMPTY_DENOMINATIONS });
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<DBCashRegisterEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [result, hist] = await Promise.all([
        fetchByDate(selectedDate),
        fetchHistory(),
      ]);
      setOpening(result.opening);
      setClosing(result.closing);
      setHistory(hist);
      if (result.opening && !result.closing) {
        setDenominations({
          bill_200: result.opening.bill_200,
          bill_100: result.opening.bill_100,
          bill_50: result.opening.bill_50,
          bill_20: result.opening.bill_20,
          bill_10: result.opening.bill_10,
          bill_5: result.opening.bill_5,
          bill_2: result.opening.bill_2,
          coin_100: result.opening.coin_100,
          coin_050: result.opening.coin_050,
          coin_025: result.opening.coin_025,
          coin_010: result.opening.coin_010,
          coin_005: result.opening.coin_005,
        });
      } else {
        setDenominations({ ...EMPTY_DENOMINATIONS });
      }
    } catch (err) {
      console.error('Erro ao carregar caixa:', err);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { load(); }, [load]);

  const increment = (key: keyof DenominationInput) => {
    setDenominations(prev => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const decrement = (key: keyof DenominationInput) => {
    setDenominations(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
  };

  const totals = {
    bills: calculateBillsTotal(denominations),
    coins: calculateCoinsTotal(denominations),
    global: calculateTotal(denominations),
  };

  const handleSave = async (entryType: 'opening' | 'closing') => {
    if (entryType === 'opening') {
      await saveEntry('opening', selectedDate, denominations);
    } else {
      await saveEntry('closing', selectedDate, denominations);
    }
    await load();
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    if (opening && !closing) {
      await updateEntry(opening.id, denominations);
    } else if (closing) {
      await updateEntry(closing.id, denominations);
    }
    setIsEditing(false);
    await load();
  };

  const canOpen = useCallback(() => {
    const now = new Date();
    const { isOpenToday } = getStoreHoursForDate(now);
    if (!isOpenToday) return false;

    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes >= 450 && minutes < 540;
  }, []);

  const canClose = useCallback(() => {
    const now = new Date();
    const { isOpenToday } = getStoreHoursForDate(now);
    if (!isOpenToday) return false;

    const isSatOrHol = now.getDay() === 6 || isHoliday(now);
    const minutes = now.getHours() * 60 + now.getMinutes();

    if (isSatOrHol) {
      return minutes >= 720 && minutes < 840;
    }
    return minutes >= 1020 && minutes < 1140;
  }, []);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return {
    opening, closing,
    denominations, loading, history,
    isEditing, setIsEditing,
    totals,
    increment, decrement,
    handleSave, handleUpdate,
    canOpen, canClose, isToday,
    reload: load,
  };
}
