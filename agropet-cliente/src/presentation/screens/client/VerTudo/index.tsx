import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StatusBar, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CatalogHeader, CatalogFilter } from '../../../components/CatalogHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { CartContext } from '../../../contexts/CartContext';
import { getAllImageUrls } from '../../../../utils/imageUtils';
import VerItemSvg from '../../../assets/tela4/produto/VerItem.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const PHOTO_WIDTH = CARD_WIDTH - 20;
const PHOTO_HEIGHT = (PHOTO_WIDTH * 120) / 129;

function ProductImage({ imageUrl }: { imageUrl: string | null | undefined }) {
  const { isDarkMode } = useTheme();
  const urls = React.useMemo(() => getAllImageUrls(imageUrl), [imageUrl]);
  if (urls.length === 0) {
    return (
      <View style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT, borderRadius: 15, backgroundColor: isDarkMode ? '#3A3A44' : '#d9d9d9', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: isDarkMode ? '#888' : '#999', fontSize: 11 }}>Sem Imagem</Text>
      </View>
    );
  }
  return (
    <Image source={{ uri: urls[0] }} style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT, borderRadius: 15 }} contentFit="cover" cachePolicy="disk" />
  );
}

function formatTitle(title: string) {
  return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
}

export default function VerTudoScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { title, products } = route.params || { title: '', products: [] };
  const { addToCart } = useContext(CartContext);

  const renderProduct = ({ item, index }: { item: any; index: number }) => {
    const isFirstInRow = index % 2 === 0;
    const discount = item.discount_percentage || 0;
    return (
      <View style={{
        width: '50%',
        paddingLeft: isFirstInRow ? 16 : 8,
        paddingRight: isFirstInRow ? 8 : 16,
        marginBottom: 12,
      }}>
        <View style={{
          width: CARD_WIDTH,
          backgroundColor: colors.cardBackground,
          borderRadius: 25, paddingTop: 10, paddingBottom: 10, paddingHorizontal: 10,
          alignItems: 'center',
          borderWidth: discount > 0 ? 1.5 : 0,
          borderColor: discount > 0 ? '#E91E63' : 'transparent',
        }}>
          {discount > 0 && (
            <View style={{
              position: 'absolute', top: -4, left: -4,
              backgroundColor: '#FF6F00', borderRadius: 10,
              paddingHorizontal: 6, paddingVertical: 2,
              zIndex: 10, elevation: 6,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>{discount}% OFF</Text>
            </View>
          )}
          <View style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT, borderRadius: 15, overflow: 'hidden', backgroundColor: '#FFFFFF', marginBottom: 6 }}>
            <ProductImage imageUrl={item.image_url} />
          </View>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 4 }} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 4 }}>
            {!item.is_bulk && !item.is_per_meter && (
              <TouchableOpacity onPress={() => addToCart(item)} activeOpacity={0.7}
                style={{ width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', position: 'relative', marginRight: 4, backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }}>
                <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
                <View style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: '#25BE36', justifyContent: 'center', alignItems: 'center' }}>
                  <Feather name="plus" size={9} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
              {discount > 0 ? (
                <>
                  <Text style={{ fontSize: 12, color: '#999', textDecorationLine: 'line-through' }}>
                    R$ {item.price?.toFixed(2)}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#E91E63' }}>
                    R$ {(item.price * (1 - discount / 100)).toFixed(2)}
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.textDark }}>
                  R$ {item.price?.toFixed(2)}{item.is_bulk ? ' /Kg' : item.is_per_meter ? ' /m' : ''}
                </Text>
              )}
              <TouchableOpacity style={{ backgroundColor: '#EA841E', borderRadius: 15, width: 85, height: 30, alignItems: 'center', justifyContent: 'center' }} activeOpacity={0.7}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}>
                <VerItemSvg width={45} height={10} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
      <StatusBar backgroundColor={colors.headerBackground} barStyle="light-content" />
      <CatalogHeader searchText="" onSearchChange={() => {}} title="Catálogo" />
      <CatalogFilter />
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.textDark }}>{formatTitle(title)}</Text>
      </View>
      {products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#919191' }}>Nenhum produto encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item: any) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 110, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: isDarkMode ? '#1E1E24' : '#ECECEC',
        borderTopWidth: 1, borderTopColor: isDarkMode ? '#3E3E4A' : '#D2D2D2',
        paddingHorizontal: 20, paddingBottom: 30, paddingTop: 15,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#2D8CE5', borderRadius: 25,
            paddingVertical: 12, paddingHorizontal: 32,
            flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
            gap: 6,
            elevation: 4, shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 4,
          }}
        >
          <Ionicons name="caret-back" size={18} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }}>Voltar para o catálogo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
