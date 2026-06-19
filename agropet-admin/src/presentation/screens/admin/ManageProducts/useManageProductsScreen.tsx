import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCategories } from '../../../contexts/useCategories';
import { isProductInCategories } from '../../../../services/categoryService';
import type { SortOption } from './FilterModal';

const SORT_OPTION_KEY = '@agropet_sort_option';

export function getFirstImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try { const parsed = JSON.parse(trimmed); if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]; } catch (_) {}
  }
  return url;
}

export function useManageProductsScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categories, allCategories, loading: catLoading, createCategory, toggleActive: toggleCategoryActive, deleteCategory, reload: reloadCategories } = useCategories();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos');
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Granel' | 'PerMeter'>('Todos');
  const [alertYellowFilter, setAlertYellowFilter] = useState(false);
  const [alertRedFilter, setAlertRedFilter] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempStatusFilter, setTempStatusFilter] = useState<'Todos' | 'Ativos' | 'Inativos'>('Todos');
  const [tempTypeFilter, setTempTypeFilter] = useState<'Todos' | 'Granel' | 'PerMeter'>('Todos');
  const [tempAlertYellowFilter, setTempAlertYellowFilter] = useState(false);
  const [tempAlertRedFilter, setTempAlertRedFilter] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('alpha');
  const [tempSortOption, setTempSortOption] = useState<SortOption>('alpha');
  const [sortLoaded, setSortLoaded] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [dismissedProductIds, setDismissedProductIds] = useState<Set<string>>(new Set());
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true); setHasError(false);
    const { data, error } = await supabase.from('products').select('id, name, description, price, stock, critical_stock, moderate_stock, active, category_id, created_at, image_url, is_bulk, is_per_meter').order('created_at', { ascending: false }).limit(200);
    /* istanbul ignore next */ if (!error) setProducts(data || []);
    else { setProducts([]); setHasError(true); }
    setLoading(false);
  };

  const [refreshing, setRefreshing] = useState(false);
  /* istanbul ignore next */ const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(SORT_OPTION_KEY).then(saved => {
      if (saved) {
        const parsed = saved as SortOption;
        setSortOption(parsed);
        setTempSortOption(parsed);
      }
      setSortLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (sortLoaded) {
      AsyncStorage.setItem(SORT_OPTION_KEY, sortOption);
    }
  }, [sortOption, sortLoaded]);

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      setDismissedProductIds(new Set());
      const pSearch = route.params?.searchText;
      const pCats = route.params?.categories;
      /* istanbul ignore next */ if (pSearch !== undefined || pCats !== undefined) {
        setSearchText(pSearch || ''); setActiveCategories(pCats || []);
        setStatusFilter('Todos'); setAlertYellowFilter(false); setAlertRedFilter(false);
        fetchProducts();
        navigation.setParams({ searchText: undefined, categories: undefined });
      } else {
        setSearchText(''); setActiveCategories([]);
        setStatusFilter('Todos'); setAlertYellowFilter(false); setAlertRedFilter(false);
        fetchProducts();
      }
    });
    return unsub;
  }, [navigation, route.params]);

  useEffect(() => {
    const channel = supabase.channel('products-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        /* istanbul ignore next */ () => { fetchProducts(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const dismissAlert = (id: string) => setDismissedProductIds(prev => { const n = new Set(prev); n.add(id); return n; });

  const toggleProductStatus = async (product: any) => {
    const newStatus = !product.active;
    if (newStatus && (product.stock || 0) === 0) {
      Alert.alert('Aviso', 'Você não pode ativar este produto pois o mesmo encontra-se sem estoque. Mas não se preocupe! Assim que você editar esse produto e colocar mais estoque, ele reativará automaticamente. Fantástico, não?');
      return;
    }
    const { error } = await supabase.from('products').update({ active: newStatus }).eq('id', product.id);
    if (!error) setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: newStatus } : p));
    else Alert.alert('Erro', 'Não foi possível alterar o status do produto.');
  };

  const deleteProduct = (id: string) => {
    Alert.alert('Atenção', 'Tem certeza que deseja excluir este produto? Ele será removido permanentemente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) setProducts(prev => prev.filter(p => p.id !== id));
        else Alert.alert('Erro', 'Não foi possível excluir o produto.');
      }}
    ]);
  };

  const filteredProductsRaw = useMemo(() => products.filter(p => {
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const q = searchText.toLowerCase();
    const matchesSearch = name.includes(q) || desc.includes(q);
    const matchesCategory = isProductInCategories(p, activeCategories, categories);
    const isActive = p.active !== false;
    const stock = p.stock || 0;
    const critThreshold = p.critical_stock ?? 10;
    const modThreshold = p.moderate_stock ?? 29;
    /* istanbul ignore next */ if (statusFilter === 'Ativos' && !isActive) return false;
    if (statusFilter === 'Inativos' && isActive) return false;
    if (typeFilter === 'Granel' && !p.is_bulk) return false;
    if (typeFilter === 'PerMeter' && !p.is_per_meter) return false;
    if (alertYellowFilter || alertRedFilter) {
      const isRed = stock < critThreshold;
      const isYellow = stock >= critThreshold && stock <= modThreshold;
      if (alertYellowFilter && alertRedFilter) {
        if (!isRed && !isYellow) return false;
      } else if (alertRedFilter && !isRed) {
        return false;
      } else if (alertYellowFilter && !isYellow) {
        return false;
      }
    }
    return matchesSearch && matchesCategory;
  }), [products, searchText, activeCategories, categories, statusFilter, typeFilter, alertYellowFilter, alertRedFilter]);

  const filteredProducts = useMemo(() => {
    const list = [...filteredProductsRaw];
    switch (sortOption) {
      case 'alpha':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case 'most_stock':
        /* istanbul ignore next */ list.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      case 'highest_price':
        /* istanbul ignore next */ list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'lowest_price':
        /* istanbul ignore next */ list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
    }
    if (alertYellowFilter || alertRedFilter) {
      /* istanbul ignore next */ list.sort((a, b) => {
        const sA = a.stock || 0, sB = b.stock || 0;
        const critA = a.critical_stock ?? 10, critB = b.critical_stock ?? 10;
        const modA = a.moderate_stock ?? 29, modB = b.moderate_stock ?? 29;
        const rA = sA < critA, rB = sB < critB;
        const yA = sA >= critA && sA <= modA, yB = sB >= critB && sB <= modB;
        if (rA && !rB) return -1; if (!rA && rB) return 1;
        if (yA && !yB && !rB) return -1; if (!yA && yB && !rA) return 1;
        return 0;
      });
    }
    return list;
  }, [filteredProductsRaw, sortOption, alertYellowFilter, alertRedFilter]);

  const allProductsInactive = products.length > 0 && products.every(p => p.active === false);

  const handleReactivateAll = () => {
    const inactiveProducts = products.filter(p => p.active === false);
    if (inactiveProducts.length === 0) { Alert.alert('Aviso', 'Não há produtos inativos para reativar.'); return; }
    Alert.alert('Reativar Produtos', `Tem certeza de que deseja reativar todos os ${inactiveProducts.length} produtos inativos simultaneamente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reativar Todos', onPress: async () => {
        setLoading(true);
        try {
          const { error } = await supabase.from('products').update({ active: true }).in('id', inactiveProducts.map(p => p.id));
          /* istanbul ignore next */ if (!error) { setProducts(prev => prev.map(p => inactiveProducts.find(x => x.id === p.id) ? { ...p, active: true } : p)); Alert.alert('Sucesso', 'Todos os produtos foram reativados.'); }
          else Alert.alert('Erro', 'Não foi possível reativar os produtos.');
        } catch (err) { console.error(err); Alert.alert('Erro', 'Ocorreu um erro ao reativar os produtos.'); }
        finally { setLoading(false); }
      }}
    ]);
  };

  const handleSelectAllBtn = () => {
    const allIds = filteredProducts.map(p => p.id);
    if (allIds.length > 0 && allIds.every(id => selectedProductIds.has(id))) setSelectedProductIds(new Set());
    else { setSelectedProductIds(new Set(allIds)); setSelectionMode(true); }
  };

  const handleDeactivateAll = () => {
    const activeVisible = filteredProducts.filter(p => p.active !== false);
    if (activeVisible.length === 0) { Alert.alert('Aviso', 'Não há produtos ativos na lista filtrada para desativar.'); return; }
    Alert.alert('Desativar Produtos', `Tem certeza de que deseja desativar todos os ${activeVisible.length} produtos ativos filtrados simultaneamente?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desativar Todos', style: 'destructive', onPress: async () => {
        setLoading(true);
        try {
          const { error } = await supabase.from('products').update({ active: false }).in('id', activeVisible.map(p => p.id));
          if (!error) { setProducts(prev => prev.map(p => activeVisible.find(x => x.id === p.id) ? { ...p, active: false } : p)); Alert.alert('Sucesso', 'Todos os produtos filtrados foram desativados.'); }
          else Alert.alert('Erro', 'Não foi possível desativar os produtos.');
        } catch (err) { console.error(err); Alert.alert('Erro', 'Ocorreu um erro ao desativar os produtos.'); }
        finally { setLoading(false); }
      }}
    ]);
  };

  const handleMassDelete = () => {
    if (!selectionMode) { setSelectionMode(true); return; }
    if (selectedProductIds.size === 0) { Alert.alert('Aviso', 'Nenhum produto selecionado para exclusão.'); setSelectionMode(false); return; }
    setShowConfirmDeleteModal(true);
  };

  const confirmMassDelete = async () => {
    setShowConfirmDeleteModal(false); setLoading(true);
    try {
      const { error } = await supabase.from('products').delete().in('id', Array.from(selectedProductIds));
      if (!error) { setProducts(prev => prev.filter(p => !selectedProductIds.has(p.id))); setSelectedProductIds(new Set()); setSelectionMode(false); }
      else Alert.alert('Erro', 'Ocorreu um erro na exclusão em massa.');
    } catch (err) { console.error(err); Alert.alert('Erro', 'Ocorreu um erro ao realizar a exclusão.'); }
    finally { setLoading(false); }
  };

  const toggleSelection = (id: string) => {
    const n = new Set(selectedProductIds);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelectedProductIds(n);
  };

  return {
    colors, isDarkMode, navigation,
    products, loading, setLoading,
    searchText, setSearchText,
    activeCategories, setActiveCategories,
    hasError, statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    alertYellowFilter, setAlertYellowFilter,
    alertRedFilter, setAlertRedFilter,
    showFilterModal, setShowFilterModal,
    tempStatusFilter, setTempStatusFilter,
    tempTypeFilter, setTempTypeFilter,
    tempAlertYellowFilter, setTempAlertYellowFilter,
    tempAlertRedFilter, setTempAlertRedFilter,
    sortOption, setSortOption,
    tempSortOption, setTempSortOption,
    selectionMode, setSelectionMode,
    selectedProductIds, setSelectedProductIds,
    dismissedProductIds,
    showConfirmDeleteModal, setShowConfirmDeleteModal,
    refreshing, onRefresh,
    fetchProducts,
    dismissAlert, toggleProductStatus, deleteProduct,
    filteredProducts, allProductsInactive,
    handleSelectAllBtn, handleDeactivateAll, handleReactivateAll,
    handleMassDelete, confirmMassDelete, toggleSelection,
    categories, allCategories, catLoading,
    createCategory, toggleCategoryActive, deleteCategory, reloadCategories,
  };
}
