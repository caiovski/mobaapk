import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { CatalogHeader, CatalogFilter } from '../../../components/CatalogHeader';
import { getFirstImageUrl } from '../../../../utils/imageUtils';
import CartBig from '../../../assets/tela5/carrinho/CartBig.svg';
import PlusIcon from '../../../assets/tela5/carrinho/PlusIcon.svg';
import HomeIcon from '../../../assets/tela5/barra/Home.svg';
import HomeIconDark from '../../../assets/tela5/barra/HomeDark.svg';
import MapIcon from '../../../assets/tela5/barra/Map.svg';
import MapIconDark from '../../../assets/tela5/barra/MapDark.svg';
import BarCartIcon from '../../../assets/tela5/barra/Cart.svg';
import BarCartIconDark from '../../../assets/tela5/barra/CartDark.svg';
import GearIcon from '../../../assets/tela5/barra/Gear.svg';
import GearIconDark from '../../../assets/tela5/barra/GearDark.svg';
import MenuLabel from '../../../assets/tela5/barra/MenuLabel.svg';
import MapaLabel from '../../../assets/tela5/barra/MapaLabel.svg';
import CarrinhoLabel from '../../../assets/tela5/barra/CarrinhoLabel.svg';
import OpcoesLabel from '../../../assets/tela5/barra/OpcoesLabel.svg';
import useProductDetailScreen from './useProductDetailScreen';
import { styles } from './ProductDetailScreen.styles';

export default function ProductDetailScreen() {
  const {
    colors,
    isDarkMode,
    navigation,
    product,
    stock,
    quantity,
    increment,
    decrement,
    handleAddToCart,
    isBulk,
    isPerMeter,
    bulkUnit, setBulkUnit,
    bulkInput, setBulkInput,
    formatStock,
    relatedProducts,
    loadingRelated,
    photos,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    dismissAlert,
    setDismissAlert,
    clientName,
    searchText,
    setSearchText,
    addToCart,
  } = useProductDetailScreen();

  if (!product) return null;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.backgroundLight }]}>
      <StatusBar backgroundColor={colors.headerBackground} barStyle="light-content" />
      <CatalogHeader searchText={searchText} onSearchChange={setSearchText} />
      <CatalogFilter />
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.topRow}>
            <View style={[styles.photoWrapper, { backgroundColor: isDarkMode ? '#1E1E24' : '#FFFFFF', justifyContent: 'center', alignItems: 'center' }]}>
              {photos.length === 0 ? (
                <View style={[styles.photo, { backgroundColor: isDarkMode ? '#3A3A44' : '#d9d9d9', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: isDarkMode ? '#888' : '#999', fontSize: 12 }}>Sem Foto</Text>
                </View>
              ) : (
                <View style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden' }}>
                  <Image source={{ uri: photos[currentPhotoIndex] }} style={{ width: '100%', height: '100%' }} contentFit="cover" cachePolicy="disk" />
                  {currentPhotoIndex > 0 && (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => setCurrentPhotoIndex(currentPhotoIndex - 1)} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <Feather name="chevron-left" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                  {currentPhotoIndex < photos.length - 1 && (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => setCurrentPhotoIndex(currentPhotoIndex + 1)} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <Feather name="chevron-right" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                  {photos.length > 1 && (
                    <View style={{ position: 'absolute', bottom: 4, alignSelf: 'center', flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 60, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 10 }}>{currentPhotoIndex + 1}/{photos.length}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={styles.infoColumn}>
              <View style={{ flex: 1, justifyContent: 'flex-start' }}>
                <Text style={[styles.productTitle, { color: colors.textDark }]}>{product.name}</Text>
                {product.description ? (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.textDark, marginBottom: 2 }}>Descrição do produto:</Text>
                    <Text style={[styles.productSubtitle, { color: colors.textDark }]}>{product.description}</Text>
                  </View>
                ) : (
                  <Text style={[styles.infoEmbalagem, { color: colors.textDark }]}>Informações{'\n'}na{'\n'}Embalagem</Text>
                )}
              </View>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: stock < 10 ? '#A72424' : (isDarkMode ? '#919191' : '#042A7D'), marginTop: 8, textAlign: 'left', paddingLeft: 4 }}>
                {stock < 10 ? `Estoque: ${formatStock(stock, isBulk, isPerMeter)}!!!` : `Estoque: ${formatStock(stock, isBulk, isPerMeter)}`}
              </Text>
            </View>
          </View>
          {stock < 10 && !dismissAlert && (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderRadius: 10, backgroundColor: isDarkMode ? '#2C1D1E' : '#FFF0F0', borderColor: '#FF3B30', marginTop: 10, marginBottom: 10, position: 'relative' }}>
              <Feather name="alert-circle" size={16} color="#FF3B30" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: isDarkMode ? '#FF8A8A' : '#D32F2F', flexShrink: 1, lineHeight: 18, paddingRight: 20 }}>
                Atenção: Últimas unidades. Aproveite este produto, caro {clientName ? clientName : 'Cliente'}.
              </Text>
              <TouchableOpacity onPress={() => setDismissAlert(true)} style={{ position: 'absolute', right: 12, top: 12, padding: 2 }}>
                <Feather name="x" size={16} color={isDarkMode ? '#FF8A8A' : '#D32F2F'} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={[styles.precoText, { color: colors.textDark }]}>R$ {product.price?.toFixed(2)}{isBulk ? ' / Kg' : isPerMeter ? ' / m' : ' Un.'}</Text>
          <View style={styles.cartSection}>
            {isBulk ? (
              <View style={styles.quantityBar}>
                <View style={{ width: 65 }} />
                <Text style={styles.quantityLabel}>Quantidade:</Text>
                <View style={styles.quantitySep} />
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 4 }}>
                  <TextInput
                    style={[styles.quantityNum, { height: 35, textAlign: 'center', fontSize: 14, color: colors.textDark }]}
                    value={bulkInput}
                    onChangeText={setBulkInput}
                    keyboardType="decimal-pad"
                  />
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    <TouchableOpacity onPress={() => setBulkUnit('kg')} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: bulkUnit === 'kg' ? '#339914' : 'transparent' }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: bulkUnit === 'kg' ? '#FFFFFF' : '#919191' }}>Kg</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setBulkUnit('g')} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: bulkUnit === 'g' ? '#339914' : 'transparent' }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: bulkUnit === 'g' ? '#FFFFFF' : '#919191' }}>g</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : isPerMeter ? (
              <View style={styles.quantityBar}>
                <View style={{ width: 65 }} />
                <Text style={styles.quantityLabel}>Quantidade:</Text>
                <View style={styles.quantitySep} />
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 4 }}>
                  <TextInput
                    style={[styles.quantityNum, { height: 35, textAlign: 'center', fontSize: 14, color: colors.textDark }]}
                    value={bulkInput}
                    onChangeText={setBulkInput}
                    keyboardType="decimal-pad"
                  />
                  <View style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' }}>m</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.quantityBar}>
                <View style={{ width: 65 }} />
                <Text style={styles.quantityLabel}>Quantidade:</Text>
                <View style={styles.quantitySep} />
                <View style={styles.quantityControls}>
                  <TouchableOpacity style={styles.btnMinus} onPress={decrement}>
                    <View style={styles.minusLine} />
                  </TouchableOpacity>
                  <View style={styles.quantityNum}>
                    <Text style={styles.quantityNumText}>{quantity}</Text>
                  </View>
                  <TouchableOpacity style={styles.btnPlus} onPress={increment}>
                    <View style={styles.plusLineH} />
                    <View style={styles.plusLineV} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.cartBigBtn} onPress={handleAddToCart} activeOpacity={0.7}>
              <CartBig width={42} height={42} />
              <View style={styles.cartPlusBadge}>
                <PlusIcon width={13} height={13} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.relatedTitle, { color: colors.textDark }]}>Produtos Relacionados:</Text>
        {loadingRelated ? (
          <ActivityIndicator size="small" color={colors.primaryDark} style={{ marginVertical: 20 }} />
        ) : relatedProducts.length === 0 ? (
          <Text style={[styles.noRelatedText, { color: colors.textDark }]}>No momento, não há nenhum produto relacionado à {product.name}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
            {relatedProducts.map((relProduct) => (
              <TouchableOpacity key={relProduct.id} onPress={() => navigation.replace('ProductDetail', { product: relProduct })} activeOpacity={0.7} style={[styles.relatedCard, { backgroundColor: colors.cardBackground }]}>
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
                  <TouchableOpacity style={[styles.relatedCartCircle, { backgroundColor: isDarkMode ? '#FFFFFF' : '#E3DAD9' }]} onPress={() => addToCart(relProduct)} activeOpacity={0.7}>
                    <MaterialIcons name="shopping-cart" size={16} color={isDarkMode ? '#5B86E5' : '#042A7D'} />
                  </TouchableOpacity>
                  <View style={styles.relatedTexts}>
                    <Text style={[styles.relatedName, { color: colors.textDark }]} numberOfLines={1}>{relProduct.name}</Text>
                    <Text style={[styles.relatedPrice, { color: colors.textDark }]}>R$ {relProduct.price?.toFixed(2)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>
      <View style={styles.bottomBarOuter}>
        <View style={[styles.bottomBarInner, { backgroundColor: isDarkMode ? '#000000' : colors.cardBackground }]}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ClientTabs', { screen: 'Menu' })}>
            <View style={isDarkMode ? { width: 51, height: 41, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } : styles.iconBg}>
              {isDarkMode ? <HomeIconDark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <HomeIcon width={32} height={32} />}
            </View>
            {isDarkMode ? <MenuLabel width={33} height={9} fill="#FFFFFF" stroke="#FFFFFF" /> : <MenuLabel width={33} height={9} />}
          </TouchableOpacity>
          <View style={[styles.tabSep, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.4)' : '#8A7268' }]} />
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ClientTabs', { screen: 'Mapa' })}>
            <View style={isDarkMode ? { width: 51, height: 41, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } : styles.iconBg}>
              {isDarkMode ? <MapIconDark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <MapIcon width={32} height={32} />}
            </View>
            {isDarkMode ? <MapaLabel width={32} height={12} fill="#FFFFFF" stroke="#FFFFFF" /> : <MapaLabel width={32} height={12} />}
          </TouchableOpacity>
          <View style={[styles.tabSep, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.4)' : '#8A7268' }]} />
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ClientTabs', { screen: 'Carrinho' })}>
            <View style={isDarkMode ? { width: 51, height: 41, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } : styles.iconBg}>
              {isDarkMode ? <BarCartIconDark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <BarCartIcon width={32} height={32} />}
            </View>
            {isDarkMode ? <CarrinhoLabel width={52} height={10} fill="#FFFFFF" stroke="#FFFFFF" /> : <CarrinhoLabel width={52} height={10} />}
          </TouchableOpacity>
          <View style={[styles.tabSep, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.4)' : '#8A7268' }]} />
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ClientTabs', { screen: 'Opções' })}>
            <View style={isDarkMode ? { width: 51, height: 41, borderRadius: 15, alignItems: 'center', justifyContent: 'center' } : styles.iconBg}>
              {isDarkMode ? <GearIconDark width={32} height={32} fill="#FFFFFF" stroke="#FFFFFF" /> : <GearIcon width={32} height={32} />}
            </View>
            {isDarkMode ? <OpcoesLabel width={42} height={12} fill="#FFFFFF" stroke="#FFFFFF" /> : <OpcoesLabel width={42} height={12} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
