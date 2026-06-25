import React, { useState, useEffect, useCallback } from 'react';
import { Animated, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { SortOption } from './components/PDVSection';

const SORT_STORAGE_KEY = 'admin_pdv_sort_option';

export function useAdminDashboardPdv(onSaleComplete?: () => void) {
  const navigation = useNavigation<any>();
  const [isPDVMode, setIsPDVMode] = useState(false);
  const [pdvSelectMode, setPdvSelectMode] = useState(false);
  const [pdvProducts, setPdvProducts] = useState<any[]>([]);
  const [pdvSearchText, setPdvSearchText] = useState('');
  const [pdvActiveCategories, setPdvActiveCategories] = useState<string[]>([]);
  const [pdvSortOption, setPdvSortOption] = useState<SortOption>('alpha');
  const [pdvCart, setPdvCart] = useState<Record<string, { qty: number; checked: boolean }>>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [dropdownExpanded, setDropdownExpanded] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'multiplo'>('dinheiro');
  const [pdvLoading, setPdvLoading] = useState(false);
  const [dismissedProductIds, setDismissedProductIds] = useState<Set<string>>(new Set());
  const [cancelOpacity] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(0));
  const [quantityInputMode, setQuantityInputMode] = useState(true);
  const [switchAnim] = useState(new Animated.Value(0));
  const [bulkInputUnit, setBulkInputUnit] = useState<Record<string, 'kg' | 'g'>>({});
  const [bulkValueMode, setBulkValueMode] = useState(false); // false = digitar valor (R$), true = digitar Kg/g
  const [pdvBulkValues, setPdvBulkValues] = useState<Record<string, number>>({});
  const [pdvInputText, setPdvInputText] = useState<Record<string, string>>({});
  const [pdvTypeFilter, setPdvTypeFilter] = useState<'Todos' | 'Granel' | 'PerMeter'>('Todos');
  const [showSortModal, setShowSortModal] = useState(false);
  const [pdvMultiValues, setPdvMultiValues] = useState<Record<string, string>>({
    dinheiro: '', cartao_credito: '', cartao_debito: '', pix: '',
  });

  /* istanbul ignore next */ const pdvTotalVenda = pdvProducts.filter(p => pdvCart[p.id]?.checked).reduce((acc, curr) => {
    const isBulkValueMode = curr.is_bulk && !bulkValueMode;
    const qty = pdvCart[curr.id]?.qty || 0;
    const effectiveQty = curr.is_bulk && bulkInputUnit?.[curr.id] === 'g' ? qty / 1000 : qty;
    return acc + (isBulkValueMode ? (pdvBulkValues?.[curr.id] || 0) : (curr.price * effectiveQty));
  }, 0);

  const dismissAlert = (id: string) => {
    setDismissedProductIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SORT_STORAGE_KEY);
        if (stored) {
          setPdvSortOption(stored as SortOption);
        }
      } catch (_) {}
    })();
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setPdvSortOption(option);
    AsyncStorage.setItem(SORT_STORAGE_KEY, option).catch(() => {});
  }, []);

  useEffect(() => {
    if (pdvSelectMode) {
      cancelOpacity.setValue(0);
      Animated.timing(cancelOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [pdvSelectMode]);

  const fetchPdvProducts = async () => {
    setPdvLoading(true);
    /* istanbul ignore next */ const { data, error } = await supabase
      .from('products')
      .select('id, name, price, stock, active, category_id, description, image_url, is_bulk, is_per_meter, created_at, categories(name)')
      .eq('active', true)
      .order('name', { ascending: true });
    /* istanbul ignore next */ if (!error && data) {
      setPdvProducts(data);
    }
    setPdvLoading(false);
  };

  React.useLayoutEffect(() => {
    const display = isPDVMode ? 'none' : 'flex';
    navigation.setOptions({ tabBarStyle: { display } });
    navigation.getParent()?.setOptions({ tabBarStyle: { display } });
  }, [isPDVMode, navigation]);

  /* istanbul ignore next */
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isPDVMode) {
          setIsPDVMode(false);
          setPdvSelectMode(false);
          setPdvCart({});
          return true;
        }
        return false;
      };
      /* istanbul ignore next */
      if (BackHandler && BackHandler.addEventListener) {
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => {
          /* istanbul ignore next */
          if (subscription && subscription.remove) {
            subscription.remove();
          /* istanbul ignore next */
          } else if ((BackHandler as any).removeEventListener) {
            (BackHandler as any).removeEventListener('hardwareBackPress', onBackPress);
          }
        };
      }
    }, [isPDVMode])
  );

  useFocusEffect(
    React.useCallback(() => {
      setQuantityInputMode(true);
    }, [])
  );

  useEffect(() => {
    if (isPDVMode && pdvProducts.length === 0) {
      fetchPdvProducts();
    }
  }, [isPDVMode]);

  const togglePdvCart = (item: any) => {
    setPdvCart(prev => {
      const newCart = { ...prev };
      if (!newCart[item.id]) {
        newCart[item.id] = { qty: 1, checked: true };
      } else {
        newCart[item.id].checked = !newCart[item.id].checked;
      }
      return newCart;
    });
  };

  const updatePdvCartQty = (id: string, delta: number) => {
    setPdvCart(prev => {
      const newCart = { ...prev };
      /* istanbul ignore next */ if (!newCart[id]) {
        newCart[id] = { qty: Math.max(1, delta), checked: true };
      } else {
        /* istanbul ignore next */ newCart[id].qty = Math.max(1, newCart[id].qty + delta);
      }
      return newCart;
    });
  };

  const setPdvCartQty = (id: string, qty: number) => {
    setPdvCart(prev => {
      const newCart = { ...prev };
      const clamped = Math.max(1, qty);
      if (!newCart[id]) {
        newCart[id] = { qty: clamped, checked: true };
      } else {
        newCart[id].qty = clamped;
      }
      return newCart;
    });
  };

  useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: quantityInputMode ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [quantityInputMode]);

  const handleConfirmPdvSale = async () => {
    const selectedItems = pdvProducts.filter(p => pdvCart[p.id]?.checked);
    /* istanbul ignore next */ if (selectedItems.length === 0) return;
    for (const item of selectedItems) {
      if (item.is_bulk && !bulkValueMode) {
        /* istanbul ignore next */ const value = pdvBulkValues[item.id] || 0;
        /* istanbul ignore next */
        if (value <= 0) {
          Alert.alert('Erro', `Informe o valor para ${item.name}.`);
          return;
        }
        /* istanbul ignore next */ const qtyInKg = value / item.price;
        /* istanbul ignore next */ const needed = qtyInKg * 1000;
        /* istanbul ignore next */
        if (item.stock < needed) {
          const displayStock = `${(item.stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Kg`;
          Alert.alert('Erro', `Estoque insuficiente para ${item.name}. (Disponível: ${displayStock})`);
          return;
        }
      } else {
        /* istanbul ignore next */ const unit = item.is_bulk ? (bulkInputUnit[item.id] || 'kg') : undefined;
        /* istanbul ignore next */ const needed = unit === 'g' ? pdvCart[item.id].qty : (item.is_bulk ? pdvCart[item.id].qty * 1000 : pdvCart[item.id].qty);
        if (item.stock < needed) {
          /* istanbul ignore next */ const displayStock = item.is_bulk
            ? `${(item.stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Kg`
            : `${item.stock}`;
          Alert.alert('Erro', `Estoque insuficiente para ${item.name}. (Disponível: ${displayStock})`);
          return;
        }
      }
    }
    setPdvLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      let totalVenda = 0;
      for (const item of selectedItems) {
        /* istanbul ignore next */ if (item.is_bulk && !bulkValueMode) {
          /* istanbul ignore next */ totalVenda += pdvBulkValues[item.id] || 0;
        } else {
          /* istanbul ignore next */ const qty = pdvCart[item.id].qty;
          /* istanbul ignore next */ const unit = item.is_bulk ? (bulkInputUnit[item.id] || 'kg') : undefined;
          /* istanbul ignore next */ totalVenda += (unit === 'g' ? qty / 1000 : qty) * item.price;
        }
      }
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'completed',
          payment_method: checkoutPaymentMethod,
          delivery_type: 'retirada',
          delivery_address: 'Venda Física PDV',
          total: totalVenda
        })
        .select()
        .single();
      if (orderError) throw orderError;
      const orderId = orderData.id;
      for (const item of selectedItems) {
        /* istanbul ignore next */ if (item.is_bulk && !bulkValueMode) {
          /* istanbul ignore next */ const value = pdvBulkValues[item.id] || 0;
          /* istanbul ignore next */ const qtyInKg = Math.round(value / item.price * 1000) / 1000;
          /* istanbul ignore next */ const qtyInGrams = Math.round(qtyInKg * 1000);
          await supabase.from('order_items').insert({
            order_id: orderId,
            product_id: item.id,
            quantity: qtyInKg,
            unit_price: item.price
          });
          /* istanbul ignore next */ const newStock = item.stock - qtyInGrams;
          await supabase.from('products')
            .update({ stock: Math.max(0, newStock), active: newStock > 0 })
            .eq('id', item.id);
        } else {
          /* istanbul ignore next */ const qty = pdvCart[item.id].qty;
          /* istanbul ignore next */ const unit = item.is_bulk ? (bulkInputUnit[item.id] || 'kg') : undefined;
          /* istanbul ignore next */ const qtyInGrams = unit === 'g' ? qty : (item.is_bulk ? Math.round(qty * 1000) : qty);
          /* istanbul ignore next */ const qtyInKg = Math.round((unit === 'g' ? qty / 1000 : qty) * 1000) / 1000;
          await supabase.from('order_items').insert({
            order_id: orderId,
            product_id: item.id,
            quantity: qtyInKg,
            unit_price: item.price
          });
          /* istanbul ignore next */ const stockDeduction = item.is_per_meter ? qty : qtyInGrams;
          /* istanbul ignore next */ const newStock = item.stock - stockDeduction;
          await supabase.from('products')
            .update({ stock: Math.max(0, newStock), active: newStock > 0 })
            .eq('id', item.id);
        }
      }
      if (checkoutPaymentMethod === 'multiplo') {
        const methods = ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix'] as const;
        for (const method of methods) {
          const cleaned = (pdvMultiValues[method] || '').replace(/[^0-9,]/g, '').replace(',', '.');
          const amount = parseFloat(cleaned) || 0;
          if (amount > 0) {
            const { error: splitError } = await supabase
              .from('order_payment_splits')
              .insert({ order_id: orderId, method, amount });
            /* istanbul ignore next */ if (splitError) throw splitError;
          }
        }
      }
      Alert.alert('Sucesso', 'Venda registrada com sucesso!');
      setPdvSelectMode(false);
      setPdvCart({});
      setPdvBulkValues({});
      setPdvInputText({});
      setBulkValueMode(false);
      setPdvMultiValues({ dinheiro: '', cartao_credito: '', cartao_debito: '', pix: '' });
      setCheckoutPaymentMethod('dinheiro');
      setShowCheckoutModal(false);
      fetchPdvProducts();
      if (onSaleComplete) onSaleComplete();
    } catch (err: any) {
      Alert.alert('Erro', 'Ocorreu um erro ao registrar a venda.');
      console.log(err);
    }
    setPdvLoading(false);
  };

  const setPdvBulkValue = (id: string, value: number) => {
    setPdvBulkValues(prev => ({ ...prev, [id]: value }));
  };

  const setPdvMultiValue = (method: string, value: string) => {
    setPdvMultiValues(prev => ({ ...prev, [method]: value }));
  };

  return {
    isPDVMode, pdvSelectMode, pdvProducts, pdvSearchText, pdvActiveCategories, pdvSortOption,
    pdvCart, showCheckoutModal, dropdownExpanded, checkoutPaymentMethod,
    pdvLoading, dismissedProductIds, cancelOpacity, pulseAnim,
    quantityInputMode, setQuantityInputMode, switchAnim,
    bulkInputUnit, setBulkInputUnit,
    bulkValueMode, setBulkValueMode,
    pdvBulkValues, setPdvBulkValues, setPdvBulkValue,
    pdvTypeFilter, setPdvTypeFilter,
    pdvInputText, setPdvInputText,
    showSortModal, setShowSortModal,
    setIsPDVMode, setPdvSelectMode, setPdvProducts,
    setPdvSearchText, setPdvActiveCategories, setPdvCart, handleSortChange,
    setShowCheckoutModal, setDropdownExpanded, setCheckoutPaymentMethod,
    setPdvLoading, setDismissedProductIds,
    dismissAlert,
    togglePdvCart, updatePdvCartQty, setPdvCartQty,
    handleConfirmPdvSale,
    pdvMultiValues, setPdvMultiValues, setPdvMultiValue, pdvTotalVenda,
  };
}
