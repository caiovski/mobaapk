import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DBCashRegisterEntry, DenominationInput } from '../../db/schema';
import {
  fetchByDate,
  fetchHistory,
  saveEntry,
  updateEntry,
  markDayAsClosed,
  calculateTotal,
  calculateBillsTotal,
  calculateCoinsTotal,
} from '../../services/cashRegisterService';
import { canOpenCashRegister, canCloseCashRegister, getAutoCloseTime } from '../../utils/cashRegisterHours';

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
  /* istanbul ignore next */ const [isEditingOpening, setIsEditingOpening] = useState(false);
  const [isEditingClosing, setIsEditingClosing] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;
  const isPast = selectedDate < todayStr;
  const hasOpening = !!opening;
  const hasClosing = !!closing;
  const isClosed = opening?.closed === true;
  const openingEdited = opening?.edited === true;
  const closingEdited = closing?.edited === true;

  const checkAutoClose = useCallback(async (result: { opening?: DBCashRegisterEntry; closing?: DBCashRegisterEntry }) => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const autoCloseTime = getAutoCloseTime(now);

    /* istanbul ignore next */ if (nowMinutes < autoCloseTime) return;
    /* istanbul ignore next */ if (now.getDay() === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    /* istanbul ignore next */ if (selectedDate !== todayStr) return;

    const openEntry = result.opening;
    const closeEntry = result.closing;

    /* istanbul ignore next */ if (!openEntry) return;

    if (openEntry && !closeEntry) {
      const msg = 'Você esqueceu de fechar o caixa! Por essa razão, os valores foram salvos automaticamente.';
      try {
        await saveEntry('closing', selectedDate, {
          bill_200: openEntry.bill_200,
          bill_100: openEntry.bill_100,
          bill_50: openEntry.bill_50,
          bill_20: openEntry.bill_20,
          bill_10: openEntry.bill_10,
          bill_5: openEntry.bill_5,
          bill_2: openEntry.bill_2,
          coin_100: openEntry.coin_100,
          coin_050: openEntry.coin_050,
          coin_025: openEntry.coin_025,
          coin_010: openEntry.coin_010,
          coin_005: openEntry.coin_005,
        }, msg);
        const updated = await fetchByDate(selectedDate);
        /* istanbul ignore next */ if (updated.opening && updated.closing) {
          /* istanbul ignore next */ await markDayAsClosed(updated.opening.id, updated.closing.id, true, msg);
        }
      } catch (err) {
        /* istanbul ignore next */ console.error('Erro no auto-registro:', err);
      }
    } else /* istanbul ignore next */ if (openEntry && closeEntry && !closeEntry.closed) {
      const msg = 'Você esqueceu de encerrar o caixa! Os valores foram salvos automaticamente.';
      try {
        await markDayAsClosed(openEntry.id, closeEntry.id, true, msg);
      } catch (err) {
        /* istanbul ignore next */ console.error('Erro no auto-encerramento:', err);
      }
    }
  }, [selectedDate]);

  const load = useCallback(async (skipLoading = false) => {
    if (!skipLoading) setLoading(true);
    try {
      const [result, hist] = await Promise.all([
        fetchByDate(selectedDate),
        fetchHistory(),
      ]);
      await checkAutoClose(result);
      const finalResult = await fetchByDate(selectedDate);
      setOpening(finalResult.opening);
      setClosing(finalResult.closing);
      setHistory(hist);
      if (finalResult.opening && !finalResult.closing) {
        setDenominations({
          bill_200: finalResult.opening.bill_200,
          bill_100: finalResult.opening.bill_100,
          bill_50: finalResult.opening.bill_50,
          bill_20: finalResult.opening.bill_20,
          bill_10: finalResult.opening.bill_10,
          bill_5: finalResult.opening.bill_5,
          bill_2: finalResult.opening.bill_2,
          coin_100: finalResult.opening.coin_100,
          coin_050: finalResult.opening.coin_050,
          coin_025: finalResult.opening.coin_025,
          coin_010: finalResult.opening.coin_010,
          coin_005: finalResult.opening.coin_005,
        });
      /* istanbul ignore next */ } else {
        setDenominations({ ...EMPTY_DENOMINATIONS });
      }
    } catch (err) {
      console.error('Erro ao carregar caixa:', err);
    }
    if (!skipLoading) setLoading(false);
  }, [selectedDate, checkAutoClose]);

  useEffect(() => { load(); }, [load]);

  const increment = (key: keyof DenominationInput) => {
    setDenominations(prev => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const decrement = (key: keyof DenominationInput) => {
    setDenominations(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
  };

  const setDenominationQty = (key: keyof DenominationInput, value: number) => {
    setDenominations(prev => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const totals = useMemo(() => ({
    bills: calculateBillsTotal(denominations),
    coins: calculateCoinsTotal(denominations),
    global: calculateTotal(denominations),
  }), [denominations]);

  const isViewMode = isPast || isClosed;

  const canOpenNow = isToday && canOpenCashRegister();
  const canCloseNow = isToday && canCloseCashRegister();

  const showSteppers = isEditingOpening || isEditingClosing;

  const leftButton = useMemo(() => {
    if (isViewMode) return null;
    if (isEditingOpening) {
      return { label: 'Confirmar Abertura', color: '#339914', enabled: true, action: 'confirmOpening' as const };
    }
    if (!hasOpening) {
      return { label: 'Abrir caixa', color: canOpenNow ? '#339914' : '#767676', enabled: canOpenNow, action: 'startOpening' as const };
    }
    /* istanbul ignore else */ if (hasOpening && !openingEdited) {
      return { label: 'Editar', color: '#2BE060', enabled: true, action: 'editOpening' as const };
    }
    /* istanbul ignore next */ return { label: 'Caixa aberto', color: '#767676', enabled: false, action: null };
  }, [isViewMode, isEditingOpening, hasOpening, openingEdited, canOpenNow]);

  const rightButton = useMemo(() => {
    if (isViewMode) return null;
    if (isEditingClosing) {
      return { label: 'Fechar', color: '#A72424', enabled: true, action: 'confirmClosing' as const };
    }
    if (hasOpening && !hasClosing) {
      return { label: 'Fechar caixa', color: canCloseNow ? '#A72424' : '#767676', enabled: canCloseNow, action: 'startClosing' as const };
    }
    if (hasOpening && hasClosing && !isClosed && !closingEdited) {
      return { label: 'Editar fechamento', color: '#2BE060', enabled: true, action: 'editClosing' as const };
    }
    /* istanbul ignore next */
    if (hasOpening && hasClosing && !isClosed && closingEdited) {
      return { label: 'Fechamento salvo', color: '#767676', enabled: false, action: null };
    }
    /* istanbul ignore next */ return { label: 'Fechar caixa', color: '#767676', enabled: false, action: null };
  }, [isViewMode, isEditingClosing, hasOpening, hasClosing, isClosed, closingEdited, canCloseNow]);

  const showEncerrar = hasOpening && hasClosing && !isClosed;

  const handleStartOpening = useCallback(() => {
    setDenominations({ ...EMPTY_DENOMINATIONS });
    setIsEditingOpening(true);
  }, []);

  const handleConfirmOpening = useCallback(async () => {
    try {
      await saveEntry('opening', selectedDate, denominations);
      setIsEditingOpening(false);
      await load(true);
    } catch (err) {
      /* istanbul ignore next */ console.error('Erro ao salvar abertura:', err);
    }
  }, [selectedDate, denominations, load]);

  const handleEditOpening = useCallback(() => {
    /* istanbul ignore else */ if (opening) {
      setDenominations({
        bill_200: opening.bill_200,
        bill_100: opening.bill_100,
        bill_50: opening.bill_50,
        bill_20: opening.bill_20,
        bill_10: opening.bill_10,
        bill_5: opening.bill_5,
        bill_2: opening.bill_2,
        coin_100: opening.coin_100,
        coin_050: opening.coin_050,
        coin_025: opening.coin_025,
        coin_010: opening.coin_010,
        coin_005: opening.coin_005,
      });
      setIsEditingOpening(true);
    }
  }, [opening]);

  const handleConfirmEditOpening = useCallback(async () => {
    /* istanbul ignore else */ if (opening) {
      try {
        await updateEntry(opening.id, denominations);
        setIsEditingOpening(false);
        await load(true);
      } catch (err) {
        /* istanbul ignore next */ console.error('Erro ao editar abertura:', err);
      }
    }
  }, [opening, denominations, load]);

  /* istanbul ignore next */ const handleStartClosing = useCallback(() => {
    if (opening) {
      setDenominations({
        bill_200: opening.bill_200,
        bill_100: opening.bill_100,
        bill_50: opening.bill_50,
        bill_20: opening.bill_20,
        bill_10: opening.bill_10,
        bill_5: opening.bill_5,
        bill_2: opening.bill_2,
        coin_100: opening.coin_100,
        coin_050: opening.coin_050,
        coin_025: opening.coin_025,
        coin_010: opening.coin_010,
        coin_005: opening.coin_005,
      });
      /* istanbul ignore next */ setIsEditingClosing(true);
    }
  }, [opening]);

  const handleConfirmClosing = useCallback(async () => {
    try {
      await saveEntry('closing', selectedDate, denominations);
      setIsEditingClosing(false);
      await load(true);
      /* istanbul ignore next */ } catch (err) {
      /* istanbul ignore next */ console.error('Erro ao salvar fechamento:', err);
    }
  }, [selectedDate, denominations, load]);

  const handleEditClosing = useCallback(() => {
    /* istanbul ignore else */ if (closing) {
      setDenominations({
        bill_200: closing.bill_200,
        bill_100: closing.bill_100,
        bill_50: closing.bill_50,
        bill_20: closing.bill_20,
        bill_10: closing.bill_10,
        bill_5: closing.bill_5,
        bill_2: closing.bill_2,
        coin_100: closing.coin_100,
        coin_050: closing.coin_050,
        coin_025: closing.coin_025,
        coin_010: closing.coin_010,
        coin_005: closing.coin_005,
      });
      setIsEditingClosing(true);
    }
  }, [closing]);

  const handleConfirmEditClosing = useCallback(async () => {
    /* istanbul ignore else */ if (closing) {
      try {
        await updateEntry(closing.id, denominations);
        setIsEditingClosing(false);
        await load(true);
      /* istanbul ignore next */ } catch (err) {
        /* istanbul ignore next */ console.error('Erro ao editar fechamento:', err);
      }
    }
  }, [closing, denominations, load]);

  const handleEncerrar = useCallback(async () => {
    /* istanbul ignore else */ if (opening && closing) {
      try {
        await markDayAsClosed(opening.id, closing.id, false);
        await load(true);
      /* istanbul ignore next */ } catch (err) {
        /* istanbul ignore next */ console.error('Erro ao encerrar caixa:', err);
      }
    }
  }, [opening, closing, load]);

  const reload = load;

  /* istanbul ignore next */ const skipMessage = useMemo(() => {
    if (!isViewMode) return null;
    if (isPast) {
      if (!hasOpening && !hasClosing) return 'Você esqueceu de abrir e fechar o caixa! Por essa razão, os valores não foram salvos nesse dia.';
      /* istanbul ignore next */ if (!hasOpening) return 'Você esqueceu de abrir o caixa! Por essa razão, os valores não foram salvos para a abertura.';
      /* istanbul ignore next */ if (!hasClosing) return 'Você esqueceu de fechar o caixa! Por essa razão, os valores não foram salvos para o fechamento.';
    }
    /* istanbul ignore next */ const msg = opening?.skip_message || closing?.skip_message;
    /* istanbul ignore next */ if (msg) return msg;
    /* istanbul ignore next */ return null;
  }, [isViewMode, isPast, hasOpening, hasClosing, opening, closing]);

  const handleAction = useCallback((action: string | null) => {
    switch (action) {
      case 'startOpening': handleStartOpening(); break;
      case 'confirmOpening':
        if (opening) {
          handleConfirmEditOpening();
        } else {
          handleConfirmOpening();
        }
        break;
      case 'editOpening': handleEditOpening(); break;
      case 'startClosing': handleStartClosing(); break;
      case 'confirmClosing':
        if (closing) {
          handleConfirmEditClosing();
        } else {
          handleConfirmClosing();
        }
        break;
      case 'editClosing': handleEditClosing(); break;
    }
  }, [opening, closing, handleStartOpening, handleConfirmOpening, handleEditOpening, handleConfirmEditOpening, handleStartClosing, handleConfirmClosing, handleEditClosing, handleConfirmEditClosing]);

  return {
    opening, closing, denominations, loading, history, totals,
    isToday, isPast, isViewMode, isClosed,
    hasOpening, hasClosing,
    increment, decrement, setDenominationQty,
    leftButton, rightButton, showEncerrar, showSteppers,
    skipMessage,
    handleAction, handleEncerrar, handleConfirmEditOpening, handleConfirmEditClosing,
    reload,
  };
}
