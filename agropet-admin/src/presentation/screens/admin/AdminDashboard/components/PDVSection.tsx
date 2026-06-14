import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Animated, Modal, Switch
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import CheckIcon from '../../../../assets/tela7/registrar/Adicionar/Remover/Check.svg';
import { getFirstImageUrl } from '../../../../../utils/imageUtils';
import { isProductInCategories } from '../../../../../services/categoryService';
import { formatStock } from '../../../../../utils/formatStock';
import type { DBCustomCategory } from '../../../../../db/schema';

export type SortOption = 'alpha' | 'newest' | 'oldest' | 'most_stock' | 'highest_price' | 'lowest_price';

const SORT_LABELS: Record<SortOption, string> = {
  alpha: 'Ordem alfabética',
  newest: 'Produtos mais novos',
  oldest: 'Produtos mais velhos',
  most_stock: 'Mais estoque',
  highest_price: 'Maior preço',
  lowest_price: 'Menor preço',
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'alpha', label: 'Ordem alfabética' },
  { value: 'newest', label: 'Produtos mais novos' },
  { value: 'oldest', label: 'Produtos mais velhos' },
  { value: 'most_stock', label: 'Mais estoque' },
  { value: 'highest_price', label: 'Maior preço' },
  { value: 'lowest_price', label: 'Menor preço' },
];

interface PDVSectionProps {
  pdvSearchText: string;
  onSearchChange: (text: string) => void;
  pdvActiveCategories: string[];
  onCategoryToggle: (cat: string) => void;
  pdvSortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  pdvSelectMode: boolean;
  pdvCart: Record<string, { qty: number; checked: boolean }>;
  pdvProducts: any[];
  pdvLoading: boolean;
  onRegisterPress: () => void;
  onCancelPress: () => void;
  onToggleCart: (item: any) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onDismissAlert: (id: string) => void;
  dismissedProductIds: Set<string>;
  cancelOpacity: Animated.Value;
  isDarkMode: boolean;
  formatCurrency: (val: number) => string;
  categories: DBCustomCategory[];
  quantityInputMode: boolean;
  onToggleQuantityInputMode: () => void;
  setPdvCartQty: (id: string, qty: number) => void;
  bulkInputUnit: Record<string, 'kg' | 'g'>;
  setBulkInputUnit: React.Dispatch<React.SetStateAction<Record<string, 'kg' | 'g'>>>;
}

export default function PDVSection({
  pdvSearchText, onSearchChange, pdvActiveCategories, onCategoryToggle,
  pdvSortOption, onSortChange,
  pdvSelectMode, pdvCart, pdvProducts, pdvLoading,
  onRegisterPress, onCancelPress, onToggleCart, onUpdateQty,
  onDismissAlert, dismissedProductIds, cancelOpacity, isDarkMode, formatCurrency,
  categories, quantityInputMode, onToggleQuantityInputMode, setPdvCartQty,
  bulkInputUnit, setBulkInputUnit
}: PDVSectionProps) {
  const [showSortModal, setShowSortModal] = useState(false);
  const pencilSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /* istanbul ignore next */
    Animated.timing(pencilSpin, {
      toValue: quantityInputMode ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [quantityInputMode]);

  const spinInterpolate = pencilSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ flex: 1, paddingTop: 0, paddingBottom: 20 }}>
      <View style={{
        height: 40, backgroundColor: isDarkMode ? '#1E1E24' : '#F5F6FA',
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
        borderRadius: 20, marginBottom: 16, marginTop: -6, width: '100%',
      }}>
        <Feather name="search" size={16} color={isDarkMode ? '#A8A8B3' : '#767676'} style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, color: isDarkMode ? '#FFFFFF' : '#1C2434', fontSize: 14, textAlign: 'left', paddingVertical: 0 }}
          placeholder="Pesquisar produto..."
          placeholderTextColor={isDarkMode ? '#A8A8B3' : '#767676'}
          value={pdvSearchText}
          onChangeText={onSearchChange}
        />
        {pdvSearchText.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} activeOpacity={0.7} style={{ padding: 2 }}>
            <Feather name="x" size={14} color={isDarkMode ? '#A8A8B3' : '#767676'} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginBottom: 16 }}>
        <View style={[{ backgroundColor: isDarkMode ? '#2E2E38' : '#E3E4EB', flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingVertical: 4, paddingHorizontal: 6, minHeight: 46 }]}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowSortModal(true)}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
            <Feather name="sliders" size={12} color={isDarkMode ? '#FFFFFF' : '#8A7268'} />
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#8A7268', marginLeft: 4 }}>Filtro</Text>
            <Feather name="chevron-down" size={12} color={isDarkMode ? '#FFFFFF' : '#8A7268'} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
          <View style={{ width: 1, height: 20, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268', marginHorizontal: 4 }} />
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#8A7268', marginHorizontal: 8 }}>Categoria</Text>
          <View style={{ width: 1, height: 20, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268', marginHorizontal: 4 }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, gap: 8, alignItems: 'center' }}>
            {categories.filter(c => c.active).map(cat => {
              const isSelected = pdvActiveCategories.includes(cat.name);
              /* istanbul ignore next */
              return (
                <TouchableOpacity
                  key={cat.id} activeOpacity={0.7}
                  onPress={() => onCategoryToggle(cat.name)}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: isSelected ? (isDarkMode ? '#5B86E5' : '#E3DAD9') : 'transparent' }}
                >
                  <Text style={{
                    color: isSelected ? (isDarkMode ? '#FFFFFF' : '#9C3F07') : (isDarkMode ? '#FFFFFF' : '#8A7268'),
                    fontWeight: isSelected ? 'bold' : 'normal', fontSize: 12
                  }}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity activeOpacity={1} onPress={() => setShowSortModal(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: isDarkMode ? '#2E2E38' : '#FFFFFF', borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#1C2434', marginBottom: 16 }}>Ordenar por</Text>
            {SORT_OPTIONS.map(o => {
              const isSelected = pdvSortOption === o.value;
              return (
                <TouchableOpacity key={o.value} activeOpacity={0.7}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3E3E4A' : '#E3E4EB' }}
                  onPress={() => { onSortChange(o.value); setShowSortModal(false); }}>
                  <Text style={{ fontSize: 15, color: isDarkMode ? '#FFF' : '#1C2434', fontWeight: isSelected ? 'bold' : 'normal' }}>{o.label}</Text>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: isSelected ? '#25BE36' : (isDarkMode ? '#888' : '#A8A8B3'), alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#25BE36' }} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={{
        flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8
      }}>
        <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
          <Feather name="edit-3" size={18} color={quantityInputMode ? '#2BE060' : (isDarkMode ? '#8E8E93' : '#767676')} />
        </Animated.View>
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: quantityInputMode ? '#2BE060' : (isDarkMode ? '#FFFFFF' : '#1C2434') }}>
          Ativar digitação
        </Text>
        <Switch
          value={quantityInputMode}
          onValueChange={onToggleQuantityInputMode}
          trackColor={{ false: isDarkMode ? '#3E3E4A' : '#C0CADE', true: '#2BE060' }}
          thumbColor={isDarkMode ? '#FFF' : '#FFF'}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flex: 1, flexDirection: 'row', backgroundColor: '#339914', borderRadius: 15, alignItems: 'center', justifyContent: 'center', gap: 6, height: 46 }}
          onPress={onRegisterPress}
        >
          <CheckIcon width={34} height={34} fill={isDarkMode ? '#FFFFFF' : undefined} stroke={isDarkMode ? '#FFFFFF' : undefined} />
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 4 }}>Registrar venda</Text>
        </TouchableOpacity>

        {pdvSelectMode ? (
          <Animated.View style={{ flex: 1, opacity: cancelOpacity }}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{ width: '100%', backgroundColor: '#E3E4EB', borderRadius: 15, alignItems: 'center', justifyContent: 'center', height: 46 }}
              onPress={onCancelPress}
            >
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#A72424' }}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>

      {pdvLoading ? (
        <ActivityIndicator size="large" color="#FF5C00" style={{ marginTop: 40 }} />
      ) : (
        pdvProducts
          .filter(p => {
            if (!isProductInCategories(p, pdvActiveCategories, categories)) return false;
            if (!pdvSearchText) return true;
            const query = pdvSearchText.toLowerCase();
            const nameMatches = (p.name || '').toLowerCase().includes(query);
            return nameMatches;
          })
          .sort((a, b) => {
            switch (pdvSortOption) {
              case 'alpha': return (a.name || '').localeCompare(b.name || '');
              case 'newest': return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
              case 'oldest': return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
              case 'most_stock': return (b.stock || 0) - (a.stock || 0);
              case 'highest_price': return (b.price || 0) - (a.price || 0);
              case 'lowest_price': return (a.price || 0) - (b.price || 0);
              default: return 0;
            }
          })
          .map(item => {
            const inCart = pdvCart[item.id] || { qty: 1, checked: false };
            const stock = item.stock || 0;
            const stockColor = stock < 10 ? '#FF3B30' : (stock <= 29 ? '#FFE082' : '#00BFA5');

            return (
              <View key={item.id} style={{
                flexDirection: 'column', backgroundColor: isDarkMode ? '#2E2E38' : '#1C2434',
                borderRadius: 15, marginBottom: 15, minHeight: 100, justifyContent: 'center', paddingHorizontal: 8,
              }}>
                <View style={{ flexDirection: 'row', height: 100, alignItems: 'center', width: '100%' }}>
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{
                      width: 70, height: 70, backgroundColor: '#FFFFFF', borderRadius: 12,
                      alignItems: 'center', justifyContent: 'center',
                      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2,
                      shadowRadius: 1.5, elevation: 2, overflow: 'hidden',
                    }}>
                      {item.image_url ? (
                        <Image source={{ uri: /* istanbul ignore next */ getFirstImageUrl(item.image_url) || '' }} style={{ width: 70, height: 70 }} contentFit="cover" cachePolicy="disk" />
                      ) : (
                        <View style={{ width: 70, height: 70, backgroundColor: '#E0E0E0', borderRadius: 12 }} />
                      )}
                    </View>
                  </View>
                  <View style={{ width: 1, height: 100, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#F5F5F5' }} />
                  <View style={{ flex: 1.2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 4, marginTop: -4 }}>Nome do{"\n"}produto</Text>
                    <Text style={{ fontSize: 12, color: '#FFE082', fontWeight: 'bold', textAlign: 'center' }} numberOfLines={2}>{item.name}</Text>
                  </View>
                  <View style={{ width: 1, height: 100, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#F5F5F5' }} />
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 4, marginTop: -4 }}>Estoque</Text>
                    {item.is_bulk ? (
                      <TouchableOpacity onPress={/* istanbul ignore next */ () => setBulkInputUnit(prev => ({ ...prev, [item.id]: prev[item.id] === 'g' ? 'kg' : 'g' }))} activeOpacity={0.7}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: stockColor, textAlign: 'center' }}>
                          {bulkInputUnit[item.id] === 'g' ? `${stock} g` : `${(stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Kg`}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: stockColor, textAlign: 'center' }}>
                        {/* istanbul ignore next */ item.is_per_meter ? `${stock} m` : `${stock} ${stock === 1 ? 'unidade' : 'unidades'}`}
                      </Text>
                    )}
                  </View>
                  <View style={{ width: 1, height: 100, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#F5F5F5' }} />
                  <View style={{ flex: 1.2, alignItems: 'center', justifyContent: 'center' }}>
                    {!pdvSelectMode ? (
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#00E676', textAlign: 'center' }}>
                        {formatCurrency(item.price)}{/* istanbul ignore next */ item.is_bulk ? '/Kg' : ''}
                      </Text>
                    ) : (
                      <>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#00E676', marginBottom: 4, textAlign: 'center' }}>
                          {formatCurrency(item.price * (item.is_bulk && bulkInputUnit[item.id] === 'g' ? inCart.qty / 1000 : inCart.qty))}
                        </Text>
                        {quantityInputMode ? (
                          <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            backgroundColor: isDarkMode ? '#1E1E24' : 'rgba(255,255,255,0.15)',
                            borderRadius: 10, padding: 3, marginBottom: 6
                          }}>
                            <TextInput
                              style={{
                                width: item.is_bulk ? 60 : 50, color: '#FFFFFF', fontWeight: 'bold', fontSize: 12,
                                textAlign: 'center', paddingVertical: 2, paddingHorizontal: 4
                              }}
                              value={String(inCart.qty)}
                              onChangeText={(text) => {
                                if (item.is_bulk && bulkInputUnit[item.id] === 'g') {
                                  const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
                                  /* istanbul ignore next */ setPdvCartQty(item.id, isNaN(parsed) ? 1 : parsed);
                                } else if (item.is_bulk) {
                                  const normalized = text.replace(',', '.').replace(/[^0-9.]/g, '');
                                  const parsed = parseFloat(normalized);
                                  setPdvCartQty(item.id, isNaN(parsed) || parsed <= 0 ? 1 : parsed);
                                } else {
                                  const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
                                  /* istanbul ignore next */ setPdvCartQty(item.id, isNaN(parsed) ? 1 : parsed);
                                }
                              }}
                              keyboardType="decimal-pad"
                              selectTextOnFocus
                            />
                            {item.is_bulk && (
                              <TouchableOpacity
                                onPress={/* istanbul ignore next */ () => setBulkInputUnit(prev => ({ ...prev, [item.id]: prev[item.id] === 'g' ? 'kg' : 'g' }))}
                                activeOpacity={0.7}
                                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}
                              >
                                <Text style={{
                                  color: bulkInputUnit[item.id] !== 'g' ? '#00E676' : '#A8A8B3',
                                  fontSize: 11, fontWeight: 'bold', marginRight: 3
                                }}>Kg</Text>
                                <Text style={{ color: '#A8A8B3', fontSize: 11 }}>|</Text>
                                <Text style={{
                                  color: bulkInputUnit[item.id] === 'g' ? '#00E676' : '#A8A8B3',
                                  fontSize: 11, fontWeight: 'bold', marginLeft: 3
                                }}>g</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        ) : (
                          <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            backgroundColor: isDarkMode ? '#1E1E24' : 'rgba(255,255,255,0.15)',
                            borderRadius: 10, padding: 3, marginBottom: 6
                          }}>
                            <TouchableOpacity onPress={/* istanbul ignore next */ () => onUpdateQty(item.id, -1)} style={{ padding: 4 }}>
                              <Feather name="minus" size={12} color="#FF3B30" />
                            </TouchableOpacity>
                            <Text style={{ marginHorizontal: 6, color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, minWidth: 14, textAlign: 'center' }}>
                              {inCart.qty}
                            </Text>
                            <TouchableOpacity onPress={() => onUpdateQty(item.id, 1)} style={{ padding: 4 }}>
                              <Feather name="plus" size={12} color="#4CAF50" />
                            </TouchableOpacity>
                            {/* istanbul ignore next */ item.is_bulk && (
                              <TouchableOpacity
                                onPress={() => setBulkInputUnit(prev => ({ ...prev, [item.id]: prev[item.id] === 'g' ? 'kg' : 'g' }))}
                                activeOpacity={0.7}
                                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}
                              >
                                <Text style={{
                                  color: bulkInputUnit[item.id] !== 'g' ? '#00E676' : '#A8A8B3',
                                  fontSize: 11, fontWeight: 'bold', marginRight: 3
                                }}>Kg</Text>
                                <Text style={{ color: '#A8A8B3', fontSize: 11 }}>|</Text>
                                <Text style={{
                                  color: bulkInputUnit[item.id] === 'g' ? '#00E676' : '#A8A8B3',
                                  fontSize: 11, fontWeight: 'bold', marginLeft: 3
                                }}>g</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                        <TouchableOpacity onPress={() => onToggleCart(item)} activeOpacity={0.7} style={{ padding: 2 }}>
                          <View style={{
                            width: 20, height: 20, borderRadius: 6, borderWidth: 1.2,
                            borderColor: '#A8A8B3', backgroundColor: inCart.checked ? '#00E676' : 'transparent',
                            justifyContent: 'center', alignItems: 'center'
                          }}>
                            {inCart.checked && <Feather name="check" size={13} color="#FFFFFF" />}
                          </View>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>

                {!dismissedProductIds.has(item.id) && (
                  stock < 10 ? (
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12,
                      borderWidth: 1, borderRadius: 10, backgroundColor: 'rgba(255, 59, 48, 0.15)',
                      borderColor: '#FF3B30', marginHorizontal: 8, marginBottom: 8, marginTop: 4, position: 'relative',
                    }}>
                      <Feather name="alert-circle" size={14} color="#FF3B30" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FF8A8A', flexShrink: 1, lineHeight: 15, paddingRight: 16 }}>
                        {`${item.name} está esgotando, adicione mais ao estoque para manter ativo ou espere acabar para auto-desativação.`}
                      </Text>
                      <TouchableOpacity onPress={() => onDismissAlert(item.id)} style={{ position: 'absolute', right: 8, top: 8, padding: 2 }}>
                        <Feather name="x" size={14} color="#FF8A8A" />
                      </TouchableOpacity>
                    </View>
                  ) : stock <= 29 ? (
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12,
                      borderWidth: 1, borderRadius: 10, backgroundColor: 'rgba(255, 179, 0, 0.15)',
                      borderColor: '#FFB300', marginHorizontal: 8, marginBottom: 8, marginTop: 4, position: 'relative',
                    }}>
                      <Feather name="alert-triangle" size={14} color="#FFB300" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FFE082', flexShrink: 1, lineHeight: 15, paddingRight: 16 }}>
                        {`${item.name} está com estoque moderado (${stock} unidades). Considere reabastecer em breve.`}
                      </Text>
                      <TouchableOpacity onPress={() => onDismissAlert(item.id)} style={{ position: 'absolute', right: 8, top: 8, padding: 2 }}>
                        <Feather name="x" size={14} color="#FFE082" />
                      </TouchableOpacity>
                    </View>
                  ) : null
                )}
              </View>
            );
          })
      )}
    </View>
  );
}
