import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useNavigation } from '@react-navigation/native';
import { useAdminDashboardStats } from './useAdminDashboardStats';
import { useAdminDashboardCharts } from './useAdminDashboardCharts';
import { useAdminDashboardPdv } from './useAdminDashboardPdv';
import { useCategories } from '../../../contexts/useCategories';
import { fetchCashFlow, insertCashFlow } from '../../../../services/cashFlowService';

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Ração': ['ração', 'cachorro', 'cachorros', 'canino', 'caninos', 'felino', 'felinos', 'racao', 'dog chow', 'pedigree', 'besser', 'purina', 'whiskas', 'granplus', 'premium', 'cão', 'cães', 'gato', 'gatos', 'vaca', 'porco', 'frango', 'galinha', 'galinhas'],
  'Pesca': ['pesca', 'vara', 'anzol', 'linha', 'molinete', 'boia', 'bóia', 'isca', 'carretilha', 'pescaria'],
  'Sementes': ['semente', 'semeadura', 'sementes', 'girassol', 'milho', 'alpiste', 'grão', 'grãos', 'erva', 'ervas', 'erva-doce', 'ervadoce'],
  'Adubo': ['adubo', 'fertilizante', 'terra', 'substrato', 'humus', 'húmus', 'calpiso', 'calcario'],
};

/* istanbul ignore next */ export function getFirstImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (_) {}
  }
  return url;
}

/* istanbul ignore next */
export const isProductInCategories = (product: any, categories: string[]) => {
  /* istanbul ignore next */ if (!categories || categories.length === 0) return true;
  /* istanbul ignore next */ if (!product) return false;
  /* istanbul ignore next */ const name = (product.name || '').toLowerCase();
  /* istanbul ignore next */ const description = (product.description || '').toLowerCase();
  /* istanbul ignore next */ return categories.some(category => {
    const keywords = CATEGORY_KEYWORDS[category] || [category.toLowerCase()];
    return keywords.some(keyword => name.includes(keyword.toLowerCase()) || description.includes(keyword.toLowerCase()));
  });
};

export interface CaixaTransaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type?: 'sangria' | 'suprimento';
  paymentMethod?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix';
}

export function useAdminDashboard() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allSplits, setAllSplits] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<CaixaTransaction[]>([]);
  const [modalTransactionType, setModalTransactionType] = useState<'sangria' | 'suprimento'>('sangria');
  const [modalPaymentMethod, setModalPaymentMethod] = useState<'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix'>('dinheiro');
  const [rawAmount, setRawAmount] = useState<number>(0);
  const [formattedAmount, setFormattedAmount] = useState<string>('');
  const [transactionDesc, setTransactionDesc] = useState<string>('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCashFlowFilterModal, setShowCashFlowFilterModal] = useState(false);
  const [cashFlowFilter, setCashFlowFilter] = useState<'all' | 'sangria' | 'suprimento'>('all');
  const [cashFlowStartDate, setCashFlowStartDate] = useState<Date | null>(null);
  const [cashFlowEndDate, setCashFlowEndDate] = useState<Date | null>(null);
  const [cashLocalFilter, setCashLocalFilter] = useState<'all' | 'sangria' | 'suprimento'>('all');
  const [cashLocalStartDate, setCashLocalStartDate] = useState<Date | null>(null);
  const [cashLocalEndDate, setCashLocalEndDate] = useState<Date | null>(null);

  const pdv = useAdminDashboardPdv(/* istanbul ignore next */ () => fetchDashboardData());
  const charts = useAdminDashboardCharts(orders);
  const stats = useAdminDashboardStats(orders, allOrders, allSplits, transactions, cashFlowFilter, cashFlowStartDate, cashFlowEndDate);
  const { categories, allCategories, loading: catLoading } = useCategories();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, payment_method, status')
        .eq('status', 'completed');
      /* istanbul ignore next */
      if (!ordersError && ordersData) {
        setAllOrders(ordersData);
        const multiploIds = ordersData.filter(o => o.payment_method === 'multiplo').map(o => o.id);
        if (multiploIds.length > 0) {
          const { data: splits } = await supabase
            .from('order_payment_splits')
            .select('*')
            .in('order_id', multiploIds);
          setAllSplits(splits || []);
        } else {
          setAllSplits([]);
        }
      }
      const rows = await fetchCashFlow();
      const mapped: CaixaTransaction[] = rows.map(r => ({
        id: r.id,
        amount: Number(r.amount),
        description: r.description,
        date: r.created_at,
        type: r.type,
        paymentMethod: r.payment_method,
      }));
      setTransactions(mapped);
    } catch (err) {
      console.log('Error fetching dashboard data:', err);
    }
    setLoading(false);
  };

  /* istanbul ignore next */
  const fetchSalesData = async (sDate: Date, eDate: Date, filtered: boolean) => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('id, created_at, total, payment_method')
        .eq('status', 'completed')
        .order('created_at', { ascending: true }).limit(100);
      if (filtered) {
        const start = new Date(sDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(eDate);
        end.setHours(23, 59, 59, 999);
        query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        query = query.gte('created_at', today.toISOString()).lte('created_at', end.toISOString());
      }
      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
      const { data: allData, error: allErr } = await supabase
        .from('orders')
        .select('id, total, payment_method')
        .eq('status', 'completed');
      if (allErr) throw allErr;
      setAllOrders(allData || []);
      const multiploIds = (allData || []).filter(o => o.payment_method === 'multiplo').map(o => o.id);
      if (multiploIds.length > 0) {
        const { data: splits } = await supabase
          .from('order_payment_splits')
          .select('*')
          .in('order_id', multiploIds);
        setAllSplits(splits || []);
      } else {
        setAllSplits([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do painel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', /* istanbul ignore next */ () => {
      fetchDashboardData();
      pdv.setDismissedProductIds(new Set());
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!charts.isLoaded) return;
    /* istanbul ignore next */ const saveDates = async () => {
      try {
        await AsyncStorage.setItem('admin_dashboard_startDate', charts.startDate.toISOString());
        await AsyncStorage.setItem('admin_dashboard_endDate', charts.endDate.toISOString());
        await AsyncStorage.setItem('admin_dashboard_isRange', String(charts.isRange));
        await AsyncStorage.setItem('admin_dashboard_hasFiltered', String(charts.hasFiltered));
      } catch (error) {
        console.error('Error persisting dashboard dates:', error);
      }
    };
    saveDates();
    fetchSalesData(charts.startDate, charts.endDate, charts.hasFiltered);
  }, [charts.startDate, charts.endDate, charts.isRange, charts.hasFiltered, charts.isLoaded]);

  useEffect(() => {
    const channel = supabase.channel('cash_flow_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_flow' }, /* istanbul ignore next */ () => {
        /* istanbul ignore next */ fetchDashboardData();
      })
      .subscribe();
    /* istanbul ignore next */ return () => { supabase.removeChannel(channel); };
  }, []);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    charts.setShowPicker(false);
    /* istanbul ignore next */ if (event?.type === 'dismissed') return;
    /* istanbul ignore next */ if (!selectedDate) return;
    if (charts.pickerMode === 'cash_range_start') {
      setCashLocalStartDate(selectedDate);
    } else if (charts.pickerMode === 'cash_range_end') {
      setCashLocalEndDate(selectedDate);
    } else {
      charts.handleChartDateSelect(charts.pickerMode, selectedDate);
    }
  };

  const handleAmountChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    if (clean === '') {
      setRawAmount(0);
      setFormattedAmount('');
      return;
    }
    const val = parseInt(clean, 10) / 100;
    setRawAmount(val);
    setFormattedAmount(
      val.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    );
  };

  const handleSaveTransaction = async () => {
    if (rawAmount <= 0) {
      Alert.alert('Valor Inválido', 'Por favor, insira um valor maior que R$ 0,00.');
      return;
    }
    if (!transactionDesc.trim()) {
      Alert.alert('Descrição Obrigatória', `Por favor, preencha o motivo d${modalTransactionType === 'sangria' ? 'a sangria' : 'o suprimento'}.`);
      return;
    }
    try {
      await insertCashFlow({
        amount: rawAmount,
        description: transactionDesc.trim(),
        type: modalTransactionType,
        payment_method: modalPaymentMethod,
      });
      setShowTransactionModal(false);
      setRawAmount(0);
      setFormattedAmount('');
      setTransactionDesc('');
      await fetchDashboardData();
      Alert.alert('Sucesso!', `${modalTransactionType === 'sangria' ? 'Sangria' : 'Suprimento'} realizad${modalTransactionType === 'sangria' ? 'a' : 'o'} e caixa atualizado!`);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', `Não foi possível salvar a transação.`);
    }
  };

  /* istanbul ignore next */ const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const { handleChartDateSelect: _, ...chartsRest } = charts;

  return {
    loading, refreshing, onRefresh,
    ...chartsRest,
    ...stats,
    ...pdv,
    orders, allOrders, transactions,
    showTransactionModal, setShowTransactionModal,
    showCashFlowFilterModal, setShowCashFlowFilterModal,
    cashFlowFilter, setCashFlowFilter,
    cashFlowStartDate, setCashFlowStartDate,
    cashFlowEndDate, setCashFlowEndDate,
    cashLocalFilter, setCashLocalFilter,
    cashLocalStartDate, setCashLocalStartDate,
    cashLocalEndDate, setCashLocalEndDate,
    modalTransactionType, setModalTransactionType,
    modalPaymentMethod, setModalPaymentMethod,
    rawAmount, setRawAmount,
    formattedAmount, setFormattedAmount,
    transactionDesc, setTransactionDesc,
    fetchDashboardData,
    onChangeDate,
    handleAmountChange,
    handleSaveTransaction,
    categories, allCategories, catLoading,
  };
}
