import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { getFirstImageUrl } from '../../../../../utils/imageUtils';
import { isProductInCategories } from '../../../../../services/categoryService';
import type { DBCustomCategory } from '../../../../../db/schema';

export type SortOption = 'alpha' | 'newest' | 'oldest' | 'most_stock' | 'highest_price' | 'lowest_price';

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

  onToggleCart: (item: any) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onDismissAlert: (id: string) => void;
  dismissedProductIds: Set<string>;
  isDarkMode: boolean;
  formatCurrency: (val: number) => string;
  categories: DBCustomCategory[];
  quantityInputMode: boolean;
  setPdvCartQty: (id: string, qty: number) => void;
  bulkInputUnit: Record<string, 'kg' | 'g'>;
  setBulkInputUnit: React.Dispatch<React.SetStateAction<Record<string, 'kg' | 'g'>>>;
  bulkValueMode: boolean;
  pdvBulkValues: Record<string, number>;
  onBulkValueChange: (id: string, value: number) => void;
}

export default function PDVSection({
  pdvSearchText, onSearchChange, pdvActiveCategories, onCategoryToggle,
  pdvSortOption, onSortChange,
  pdvSelectMode, pdvCart, pdvProducts, pdvLoading,
  onToggleCart, onUpdateQty,
  onDismissAlert, dismissedProductIds, isDarkMode, formatCurrency,
  categories, quantityInputMode, setPdvCartQty,
  bulkInputUnit, setBulkInputUnit,
  bulkValueMode, pdvBulkValues, onBulkValueChange
}: PDVSectionProps) {

  return (
    <View style={{ flex: 1, paddingTop: 0, paddingBottom: 20 }}>



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
                    ) : item.is_bulk && !bulkValueMode ? (
                      <>
                        <Text style={{ fontSize: 10, color: '#A8A8A8', textAlign: 'center', marginBottom: 2 }}>
                          Valor (R$)
                        </Text>
                        <View style={{
                          flexDirection: 'row', alignItems: 'center',
                          backgroundColor: isDarkMode ? '#1E1E24' : 'rgba(255,255,255,0.15)',
                          borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4
                        }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginRight: 2 }}>R$</Text>
                          <TextInput
                            style={{
                              width: 55, color: '#00E676', fontWeight: 'bold', fontSize: 12,
                              textAlign: 'center', paddingVertical: 2, paddingHorizontal: 2
                            }}
                            value={pdvBulkValues[item.id] ? pdvBulkValues[item.id].toFixed(2).replace('.', ',') : ''}
                            onChangeText={(text) => {
                              const clean = text.replace(/[^0-9]/g, '');
                              if (clean === '') { onBulkValueChange(item.id, 0); return; }
                              const val = parseInt(clean, 10) / 100;
                              onBulkValueChange(item.id, val);
                            }}
                            keyboardType="decimal-pad"
                            selectTextOnFocus
                          />
                        </View>
                        <Text style={{ fontSize: 10, color: '#00E676', textAlign: 'center', marginBottom: 4 }}>
                          ≈ {((pdvBulkValues[item.id] || 0) / item.price).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Kg
                        </Text>
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
