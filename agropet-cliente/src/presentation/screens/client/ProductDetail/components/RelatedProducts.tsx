import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { getFirstImageUrl } from '../../../../../utils/imageUtils';
import { styles } from '../ProductDetailScreen.styles';

interface RelatedProductsProps {
  relatedProducts: any[];
  loadingRelated: boolean;
  productName: string;
  colors: any;
  isDarkMode: boolean;
  addToCart: any;
  navigation: any;
}

export default function RelatedProducts({ relatedProducts, loadingRelated, productName, colors, isDarkMode, addToCart, navigation }: RelatedProductsProps) {
  return (
    <>
      <Text style={[styles.relatedTitle, { color: colors.textDark }]}>Produtos Relacionados:</Text>
      {loadingRelated ? (
        <ActivityIndicator size="small" color={colors.primaryDark} style={{ marginVertical: 20 }} />
      ) : relatedProducts.length === 0 ? (
        <Text style={[styles.noRelatedText, { color: colors.textDark }]}>No momento, não há nenhum produto relacionado à {productName}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
          {relatedProducts.map((relProduct) => {
            const relDiscount = relProduct.discount_percentage || 0;
            return (
            <TouchableOpacity key={relProduct.id} onPress={() => navigation.replace('ProductDetail', { product: relProduct })} activeOpacity={0.7} style={[styles.relatedCard, { backgroundColor: colors.cardBackground, borderWidth: relDiscount > 0 ? 1.5 : 0, borderColor: relDiscount > 0 ? '#E91E63' : 'transparent' }]}>
              {relDiscount > 0 && (
                <View style={{
                  position: 'absolute', top: -4, left: -4,
                  backgroundColor: '#FF6F00', borderRadius: 10,
                  paddingHorizontal: 6, paddingVertical: 2,
                  zIndex: 10, elevation: 6,
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>{relDiscount}% OFF</Text>
                </View>
              )}
              <View style={[styles.relatedPhotoBox, { backgroundColor: isDarkMode ? '#1E1E24' : '#FFFFFF' }]}>
                {relProduct.image_url ? (
                  <Image source={{ uri: getFirstImageUrl(relProduct.image_url) || '' }} style={styles.relatedPhoto} contentFit="cover" cachePolicy="disk" />
                ) : (
                  <View style={styles.relatedPhotoPlaceholder}>
                    <Text style={{ fontSize: 40 }}>📦</Text>
                  </View>
                )}
              </View>
              <View style={styles.relatedInfoRow}>
                {!relProduct.is_bulk && !relProduct.is_per_meter ? (
                <TouchableOpacity style={[styles.relatedCartCircle, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]} onPress={() => addToCart(relProduct)} activeOpacity={0.7}>
                  <MaterialIcons name="shopping-cart" size={16} color={isDarkMode ? '#FFFFFF' : '#042A7D'} />
                </TouchableOpacity>
                ) : <View style={{ width: 32 }} />}
                <View style={styles.relatedTexts}>
                  <Text style={[styles.relatedName, { color: colors.textDark }]} numberOfLines={1}>{relProduct.name}</Text>
                  {relDiscount > 0 ? (
                    <>
                      <Text style={{ fontSize: 11, color: '#999', textDecorationLine: 'line-through' }}>
                        R$ {relProduct.price?.toFixed(2)}
                      </Text>
                      <Text style={[styles.relatedPrice, { color: '#E91E63' }]}>
                        R$ {(relProduct.price * (1 - relDiscount / 100)).toFixed(2)}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.relatedPrice, { color: colors.textDark }]}>
                      R$ {relProduct.price?.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )})}
        </ScrollView>
      )}
    </>
  );
}
