import React from 'react';
import {
  View, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Text, RefreshControl, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { CatalogHeader, CatalogFilter } from '../../../components/CatalogHeader';
import { getAllImageUrls } from '../../../../utils/imageUtils';
import VerItemSvg from '../../../assets/tela4/produto/VerItem.svg';
import { useTheme } from '../../../contexts/ThemeContext';
import { useFilter } from '../../../contexts/FilterContext';
import useHomeScreen from './useHomeScreen';
import styles from './HomeScreen.styles';
import SectionSeparator from './components/SectionSeparator';
import PromoCard from './components/PromoCard';
import SectionProductCard from './components/SectionProductCard';
import FreteBanner from './components/FreteBanner';
import PromoBanner from './components/PromoBanner';
import SlideInWrapper from './components/SlideInWrapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

function AnimatedProductImage({ imageUrl, style }: { imageUrl: string | null | undefined, style: any }) {
  const { isDarkMode } = useTheme();
  const urls = React.useMemo(() => getAllImageUrls(imageUrl), [imageUrl]);
  const [index, setIndex] = React.useState(0);
  const opacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (urls.length <= 1) { setIndex(0); return; }
    const interval = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }).start(() => {
        setIndex(prev => (prev + 1) % urls.length);
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [urls]);

  if (urls.length === 0) {
    return (
      <View style={[style, { backgroundColor: isDarkMode ? '#3A3A44' : '#d9d9d9', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: isDarkMode ? '#888' : '#999', fontSize: 11 }}>Sem Imagem</Text>
      </View>
    );
  }
  return (
    <Animated.View style={[style, { opacity }]}>
      <Image source={{ uri: urls[index] }} style={{ width: '100%', height: '100%' }} contentFit="cover" cachePolicy="disk" />
    </Animated.View>
  );
}

export default function HomeScreen() {
  const {
    colors, isDarkMode, navigation, loading, refreshing, searchText, setSearchText,
    addToCart, selectedCategories, esgotadoAlert, setEsgotadoAlert, deliveryActive,
    showReactivatedAlert, greeting, shopStatus, showGreetingBar, greetingOpacity,
    greetingScale, closeButtonRotate, closeButtonScale,
    products, filteredPromo, filteredViewed, filteredSold, allFiltered, getDestaqueSections, getShowDestaque,
    handleRefresh, handleCloseReactivated, handleDismissGreeting, clientName,
  } = useHomeScreen();

  const { sectionFilter } = useFilter();

  const WIN_H = Dimensions.get('window').height;
  const [renderTick, setRenderTick] = React.useState(0);
  const revealedRef = React.useRef<Set<number>>(new Set());
  const itemPositions = React.useRef<Map<number, number>>(new Map());
  const scrollPos = React.useRef(0);
  const grid1Y = React.useRef(0);
  const grid2Y = React.useRef(0);

  const tryReveal = React.useCallback((index: number) => {
    if (!revealedRef.current.has(index)) {
      revealedRef.current.add(index);
      setRenderTick(t => t + 1);
    }
  }, []);

  const handleGridItemLayout = React.useCallback((absIndex: number, blockBase: number, event: any) => {
    const itemY = event.nativeEvent.layout.y;
    const absoluteY = blockBase + itemY;
    itemPositions.current.set(absIndex, absoluteY);
    if (absoluteY < scrollPos.current + WIN_H + 100) {
      tryReveal(absIndex);
    }
  }, [tryReveal, WIN_H]);

  const handleMainScroll = React.useCallback((event: any) => {
    scrollPos.current = event.nativeEvent.contentOffset.y;
    let changed = false;
    itemPositions.current.forEach((absY, idx) => {
      if (absY < scrollPos.current + WIN_H + 100 && !revealedRef.current.has(idx)) {
        revealedRef.current.add(idx);
        changed = true;
      }
    });
    if (changed) setRenderTick(t => t + 1);
  }, [WIN_H]);

  const onGrid1Layout = React.useCallback((event: any) => {
    grid1Y.current = event.nativeEvent.layout.y;
    if (grid1Y.current > 0) {
      // Re-check items already registered
      let changed = false;
      itemPositions.current.forEach((absY, idx) => {
        if (idx < 6 && absY < scrollPos.current + WIN_H + 100 && !revealedRef.current.has(idx)) {
          revealedRef.current.add(idx);
          changed = true;
        }
      });
      if (changed) setRenderTick(t => t + 1);
    }
  }, [WIN_H]);

  const onGrid2Layout = React.useCallback((event: any) => {
    grid2Y.current = event.nativeEvent.layout.y;
    if (grid2Y.current > 0) {
      let changed = false;
      itemPositions.current.forEach((absY, idx) => {
        if (idx >= 6 && absY < scrollPos.current + WIN_H + 100 && !revealedRef.current.has(idx)) {
          revealedRef.current.add(idx);
          changed = true;
        }
      });
      if (changed) setRenderTick(t => t + 1);
    }
  }, [WIN_H]);

  const [horizontalReady, setHorizontalReady] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setHorizontalReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    revealedRef.current.clear();
    itemPositions.current.clear();
    grid1Y.current = 0;
    grid2Y.current = 0;
  }, [sectionFilter]);

  const filteredProducts = React.useMemo(() => {
    switch (sectionFilter) {
      case 'promocao': return filteredPromo;
      case 'acessados': return filteredViewed;
      case 'vendidos': return filteredSold;
      default: return allFiltered;
    }
  }, [sectionFilter, filteredPromo, filteredViewed, filteredSold, allFiltered]);

  const showSections = sectionFilter === 'all';

  const now = new Date();
  const currentHour = now.getHours();
  const isViewableHours = currentHour >= 8 && currentHour <= 23;

  const hasPromo = filteredPromo.length > 0;
  const hasViewed = filteredViewed.length > 0;
  const hasSold = filteredSold.length > 0 && isViewableHours;

  const sectionList = React.useMemo(() => {
    const list: string[] = [];
    if (hasPromo) list.push('promocao');
    if (hasViewed) list.push('acessados');
    if (hasSold) list.push('comprados');
    return list;
  }, [hasPromo, hasViewed, hasSold]);

  const interstitialCount = Math.max(0, sectionList.length - 1) * 2;
  const interstitialProducts = React.useMemo(() => products.slice(0, interstitialCount), [products, interstitialCount]);

  const usedProductIds = React.useMemo(() => {
    const ids = new Set<string>();
    filteredPromo.forEach(p => ids.add(p.id));
    filteredViewed.forEach(p => ids.add(p.id));
    filteredSold.forEach(p => ids.add(p.id));
    interstitialProducts.forEach(p => ids.add(p.id));
    return ids;
  }, [filteredPromo, filteredViewed, filteredSold, interstitialProducts]);

  const gridProducts = React.useMemo(() => allFiltered.filter(p => !usedProductIds.has(p.id)), [allFiltered, usedProductIds]);

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.backgroundLight }]}>
      <StatusBar backgroundColor={colors.headerBackground} barStyle="light-content" />
      <CatalogHeader searchText={searchText} onSearchChange={setSearchText} />

      {shopStatus?.isSundayOrHoliday && (
        <View style={[styles.domingoFeriadoCard, { backgroundColor: isDarkMode ? '#2C1D1E' : '#FFF0F0', borderColor: '#FF3B30' }]}>
          <Feather name="alert-circle" size={18} color="#FF3B30" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={[styles.domingoFeriadoText, { color: isDarkMode ? '#FF8A8A' : '#D32F2F' }]}>
            {(() => {
              const now = new Date();
              const dayStr = String(now.getDate()).padStart(2, '0');
              const monthStr = String(now.getMonth() + 1).padStart(2, '0');
              const yearStr = now.getFullYear();
              return now.getDay() === 0
                ? `Hoje é domingo, dia ${dayStr}-${monthStr}-${yearStr}. Não abrimos hoje.`
                : `Hoje é feriado, dia ${dayStr}-${monthStr}-${yearStr}. Não abrimos hoje.`;
            })()}
          </Text>
        </View>
      )}

      {esgotadoAlert && (
        <View style={[styles.esgotadoBanner, { backgroundColor: isDarkMode ? '#2C1D1E' : '#FFF0F0', borderColor: '#FF3B30' }]}>
          <Feather name="alert-circle" size={16} color="#FF3B30" style={{ marginRight: 8 }} />
          <Text style={[styles.esgotadoBannerText, { color: isDarkMode ? '#FF8A8A' : '#D32F2F' }]} numberOfLines={2}>
            Aviso: O produto "{esgotadoAlert}" esgotou e não está mais disponível no catálogo.
          </Text>
          <TouchableOpacity onPress={() => setEsgotadoAlert(null)} style={{ marginLeft: 'auto', paddingLeft: 10 }}>
            <Feather name="x" size={16} color={isDarkMode ? '#FF8A8A' : '#D32F2F'} />
          </TouchableOpacity>
        </View>
      )}

      {!deliveryActive && (
        <View style={[styles.freteBanner, { backgroundColor: isDarkMode ? '#2C1D1E' : '#FFF0F0', borderColor: '#FF3B30' }]}>
          <Feather name="alert-circle" size={18} color="#FF3B30" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={[styles.freteBannerText, { color: isDarkMode ? '#FF8A8A' : '#D32F2F' }]}>
            Aviso: O frete encontra-se desativado no momento. Nesse período, você não conseguirá ver o mapa, rastrear pedido e nem prosseguir with a compra, mas você pode salvar suas compras no carrinho até ele voltar. Obrigado pela compreensão. Voltaremos em breve!
          </Text>
        </View>
      )}

      {deliveryActive && showReactivatedAlert && (
        <View style={[styles.freteBanner, { backgroundColor: isDarkMode ? '#1D2A3A' : '#E8F4FD', borderColor: '#2196F3' }]}>
          <Feather name="info" size={18} color="#2196F3" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={[styles.freteBannerText, { color: isDarkMode ? '#8AB4F8' : '#0D47A1' }]}>
            O frete foi reativado, Uhuu 🥳! Você pode voltar a comprar, ver o mapa e rastrear sua entrega
          </Text>
          <TouchableOpacity onPress={handleCloseReactivated} style={{ marginLeft: 'auto', paddingLeft: 10 }}>
            <Feather name="x" size={16} color={isDarkMode ? '#8AB4F8' : '#0D47A1'} />
          </TouchableOpacity>
        </View>
      )}

      <CatalogFilter />

      {showGreetingBar && shopStatus && (
        <Animated.View style={[styles.greetingContainer, { backgroundColor: colors.cardBackground, opacity: greetingOpacity, transform: [{ scale: greetingScale }] }]}>
          <TouchableOpacity style={styles.closeGreetingBtn} onPress={handleDismissGreeting} activeOpacity={0.7}>
            <Animated.View style={{
              transform: [
                { rotate: closeButtonRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
                { scale: closeButtonScale }
              ]
            }}>
              <Feather name="x" size={16} color={colors.textDark} />
            </Animated.View>
          </TouchableOpacity>
          <Text style={[styles.greetingText, { color: colors.textDark }]}>{greeting}</Text>
          <Text style={[styles.countdownText, { color: shopStatus.isOpen ? '#4A90D9' : '#FF3B30' }]}>
            {shopStatus.isOpen ? shopStatus.countdownText : `Atualmente estamos fechados.\n${shopStatus.countdownText}`}
          </Text>
        </Animated.View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primaryDark} /></View>
      ) : filteredProducts.length === 0 ? (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textDark, textAlign: 'center', paddingHorizontal: 20 }]}>
            {selectedCategories.length > 0 ? "Não temos produto desta categoria no momento, volte mais tarde!" : "Nenhum produto encontrado"}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          onScroll={handleMainScroll}
          scrollEventThrottle={16}
        >
          {showSections && hasPromo && (
            <>
              <SectionSeparator title="Produtos em Promoção" containerStyle={{ marginTop: 12 }} onVerTudo={() => navigation.navigate('VerTudo', { title: 'Produtos em Promoção', products: filteredPromo })} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16, marginVertical: 10, paddingVertical: 6 }}>
                {filteredPromo.map((item, idx) => (
                  <SlideInWrapper key={item.id} visible={horizontalReady} delay={idx * 80}>
                    <PromoCard
                      item={item}
                      addToCart={addToCart}
                      onVerItem={(p) => navigation.navigate('ProductDetail', { product: p })}
                      showDestaque={getShowDestaque(item.id, 'promocao')}
                      destaqueCount={getDestaqueSections(item.id)}
                      cardWidth={CARD_WIDTH}
                    />
                  </SlideInWrapper>
                ))}
              </ScrollView>
              <View style={{ marginHorizontal: 16, marginTop: 20, height: 1.5, backgroundColor: isDarkMode ? '#3E3E4A' : '#D0D0D0' }} />
            </>
          )}

          {showSections && sectionList.length >= 2 && interstitialProducts.length >= 2 && (
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 20, marginBottom: 0 }}>
              <View style={{ width: '50%', paddingRight: 6 }}>
                <SlideInWrapper key={interstitialProducts[0].id} visible={horizontalReady} delay={0}>
                  <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.productImageWrapper}>
                      <AnimatedProductImage imageUrl={interstitialProducts[0].image_url} style={styles.productImage} />
                    </View>
                    <Text style={[styles.productName, { color: colors.textDark }]} numberOfLines={2}>{interstitialProducts[0].name}</Text>
                    <View style={styles.productBottomRow}>
                      {!interstitialProducts[0].is_bulk && !interstitialProducts[0].is_per_meter && (
                        <TouchableOpacity onPress={() => addToCart(interstitialProducts[0])} activeOpacity={0.7}
                          style={[styles.addCartBtn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }]}>
                          <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
                          <View style={styles.addCartPlusBadge}><Feather name="plus" size={9} color="#FFFFFF" /></View>
                        </TouchableOpacity>
                      )}
                      <View style={styles.priceAndButton}>
                        {interstitialProducts[0].discount_percentage > 0 ? (
                          <>
                            <Text style={[styles.productPrice, { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }]}>
                              R$ {interstitialProducts[0].price?.toFixed(2)}
                            </Text>
                            <Text style={[styles.productPrice, { color: '#E91E63' }]}>
                              R$ {(interstitialProducts[0].price * (1 - interstitialProducts[0].discount_percentage / 100)).toFixed(2)}
                            </Text>
                          </>
                        ) : (
                          <Text style={[styles.productPrice, { color: colors.textDark }]}>
                            R$ {interstitialProducts[0].price?.toFixed(2)}{interstitialProducts[0].is_bulk ? ' /Kg' : interstitialProducts[0].is_per_meter ? ' /m' : ''}
                          </Text>
                        )}
                        <TouchableOpacity style={styles.verItemBtn} activeOpacity={0.7}
                          onPress={() => navigation.navigate('ProductDetail', { product: interstitialProducts[0] })}>
                          <VerItemSvg width={45} height={10} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </SlideInWrapper>
              </View>
              <View style={{ width: '50%', paddingLeft: 6 }}>
                <SlideInWrapper key={interstitialProducts[1].id} visible={horizontalReady} delay={60}>
                  <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.productImageWrapper}>
                      <AnimatedProductImage imageUrl={interstitialProducts[1].image_url} style={styles.productImage} />
                    </View>
                    <Text style={[styles.productName, { color: colors.textDark }]} numberOfLines={2}>{interstitialProducts[1].name}</Text>
                    <View style={styles.productBottomRow}>
                      {!interstitialProducts[1].is_bulk && !interstitialProducts[1].is_per_meter && (
                        <TouchableOpacity onPress={() => addToCart(interstitialProducts[1])} activeOpacity={0.7}
                          style={[styles.addCartBtn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }]}>
                          <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
                          <View style={styles.addCartPlusBadge}><Feather name="plus" size={9} color="#FFFFFF" /></View>
                        </TouchableOpacity>
                      )}
                      <View style={styles.priceAndButton}>
                        {interstitialProducts[1].discount_percentage > 0 ? (
                          <>
                            <Text style={[styles.productPrice, { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }]}>
                              R$ {interstitialProducts[1].price?.toFixed(2)}
                            </Text>
                            <Text style={[styles.productPrice, { color: '#E91E63' }]}>
                              R$ {(interstitialProducts[1].price * (1 - interstitialProducts[1].discount_percentage / 100)).toFixed(2)}
                            </Text>
                          </>
                        ) : (
                          <Text style={[styles.productPrice, { color: colors.textDark }]}>
                            R$ {interstitialProducts[1].price?.toFixed(2)}{interstitialProducts[1].is_bulk ? ' /Kg' : interstitialProducts[1].is_per_meter ? ' /m' : ''}
                          </Text>
                        )}
                        <TouchableOpacity style={styles.verItemBtn} activeOpacity={0.7}
                          onPress={() => navigation.navigate('ProductDetail', { product: interstitialProducts[1] })}>
                          <VerItemSvg width={45} height={10} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </SlideInWrapper>
              </View>
            </View>
          )}

          {showSections && hasViewed && (
            <>
              <SectionSeparator title="Mais Acessados Hoje" containerStyle={sectionList.length >= 2 ? { marginTop: 20 } : undefined} onVerTudo={() => navigation.navigate('VerTudo', { title: 'Mais Acessados Hoje', products: filteredViewed })} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16, marginVertical: 6 }}>
                {filteredViewed.map((item, idx) => (
                  <SlideInWrapper key={item.id} visible={horizontalReady} delay={idx * 80}>
                    <SectionProductCard
                      item={item}
                      addToCart={addToCart}
                      onVerItem={(p) => navigation.navigate('ProductDetail', { product: p })}
                      cardWidth={CARD_WIDTH}
                    />
                  </SlideInWrapper>
                ))}
              </ScrollView>
              <View style={{ marginHorizontal: 16, marginTop: 20, height: 1.5, backgroundColor: isDarkMode ? '#3E3E4A' : '#D0D0D0' }} />
            </>
          )}

          {showSections && sectionList.length >= 3 && interstitialProducts.length >= 4 && (
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 20, marginBottom: 0 }}>
              <View style={{ width: '50%', paddingRight: 6 }}>
                <SlideInWrapper key={interstitialProducts[2].id} visible={horizontalReady} delay={0}>
                  <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.productImageWrapper}>
                      <AnimatedProductImage imageUrl={interstitialProducts[2].image_url} style={styles.productImage} />
                    </View>
                    <Text style={[styles.productName, { color: colors.textDark }]} numberOfLines={2}>{interstitialProducts[2].name}</Text>
                    <View style={styles.productBottomRow}>
                      {!interstitialProducts[2].is_bulk && !interstitialProducts[2].is_per_meter && (
                        <TouchableOpacity onPress={() => addToCart(interstitialProducts[2])} activeOpacity={0.7}
                          style={[styles.addCartBtn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }]}>
                          <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
                          <View style={styles.addCartPlusBadge}><Feather name="plus" size={9} color="#FFFFFF" /></View>
                        </TouchableOpacity>
                      )}
                      <View style={styles.priceAndButton}>
                        {interstitialProducts[2].discount_percentage > 0 ? (
                          <>
                            <Text style={[styles.productPrice, { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }]}>
                              R$ {interstitialProducts[2].price?.toFixed(2)}
                            </Text>
                            <Text style={[styles.productPrice, { color: '#E91E63' }]}>
                              R$ {(interstitialProducts[2].price * (1 - interstitialProducts[2].discount_percentage / 100)).toFixed(2)}
                            </Text>
                          </>
                        ) : (
                          <Text style={[styles.productPrice, { color: colors.textDark }]}>
                            R$ {interstitialProducts[2].price?.toFixed(2)}{interstitialProducts[2].is_bulk ? ' /Kg' : interstitialProducts[2].is_per_meter ? ' /m' : ''}
                          </Text>
                        )}
                        <TouchableOpacity style={styles.verItemBtn} activeOpacity={0.7}
                          onPress={() => navigation.navigate('ProductDetail', { product: interstitialProducts[2] })}>
                          <VerItemSvg width={45} height={10} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </SlideInWrapper>
              </View>
              <View style={{ width: '50%', paddingLeft: 6 }}>
                <SlideInWrapper key={interstitialProducts[3].id} visible={horizontalReady} delay={60}>
                  <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.productImageWrapper}>
                      <AnimatedProductImage imageUrl={interstitialProducts[3].image_url} style={styles.productImage} />
                    </View>
                    <Text style={[styles.productName, { color: colors.textDark }]} numberOfLines={2}>{interstitialProducts[3].name}</Text>
                    <View style={styles.productBottomRow}>
                      {!interstitialProducts[3].is_bulk && !interstitialProducts[3].is_per_meter && (
                        <TouchableOpacity onPress={() => addToCart(interstitialProducts[3])} activeOpacity={0.7}
                          style={[styles.addCartBtn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }]}>
                          <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
                          <View style={styles.addCartPlusBadge}><Feather name="plus" size={9} color="#FFFFFF" /></View>
                        </TouchableOpacity>
                      )}
                      <View style={styles.priceAndButton}>
                        {interstitialProducts[3].discount_percentage > 0 ? (
                          <>
                            <Text style={[styles.productPrice, { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }]}>
                              R$ {interstitialProducts[3].price?.toFixed(2)}
                            </Text>
                            <Text style={[styles.productPrice, { color: '#E91E63' }]}>
                              R$ {(interstitialProducts[3].price * (1 - interstitialProducts[3].discount_percentage / 100)).toFixed(2)}
                            </Text>
                          </>
                        ) : (
                          <Text style={[styles.productPrice, { color: colors.textDark }]}>
                            R$ {interstitialProducts[3].price?.toFixed(2)}{interstitialProducts[3].is_bulk ? ' /Kg' : interstitialProducts[3].is_per_meter ? ' /m' : ''}
                          </Text>
                        )}
                        <TouchableOpacity style={styles.verItemBtn} activeOpacity={0.7}
                          onPress={() => navigation.navigate('ProductDetail', { product: interstitialProducts[3] })}>
                          <VerItemSvg width={45} height={10} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </SlideInWrapper>
              </View>
            </View>
          )}

          {showSections && hasSold && (
            <>
              <SectionSeparator title="Mais Comprados Hoje" containerStyle={sectionList.length >= 3 ? { marginTop: 20 } : undefined} onVerTudo={() => navigation.navigate('VerTudo', { title: 'Mais Comprados Hoje', products: filteredSold })} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16, marginVertical: 6 }}>
                {filteredSold.map((item, idx) => (
                  <SlideInWrapper key={item.id} visible={horizontalReady} delay={idx * 80}>
                    <SectionProductCard
                      item={item}
                      addToCart={addToCart}
                      onVerItem={(p) => navigation.navigate('ProductDetail', { product: p })}
                      cardWidth={CARD_WIDTH}
                    />
                  </SlideInWrapper>
                ))}
              </ScrollView>
              <View style={{ marginHorizontal: 16, marginTop: 20, height: 1.5, backgroundColor: isDarkMode ? '#3E3E4A' : '#D0D0D0' }} />
            </>
          )}

          <View onLayout={onGrid1Layout} style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: showSections ? 32 : 28 }}>
            {gridProducts.slice(0, 6).map((item, idx) => {
              const isFirstInRow = idx % 2 === 0;
              const isSecondInRow = idx % 2 === 1;
              return (
                <View key={item.id} onLayout={(e) => grid1Y.current > 0 && handleGridItemLayout(idx, grid1Y.current, e)} style={{
                  width: '50%',
                  paddingLeft: isFirstInRow ? 16 : 8,
                  paddingRight: isSecondInRow ? 16 : 8,
                  marginBottom: 6,
                }}>
                  <SlideInWrapper visible={idx < 4 || revealedRef.current.has(idx)} delay={idx % 2 === 0 ? 0 : 60}>
                    <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
                      <View style={styles.productImageWrapper}>
                        <AnimatedProductImage imageUrl={item.image_url} style={styles.productImage} />
                      </View>
                      <Text style={[styles.productName, { color: colors.textDark }]} numberOfLines={2}>{item.name}</Text>
                      <View style={styles.productBottomRow}>
                        {!item.is_bulk && !item.is_per_meter && (
                          <TouchableOpacity onPress={() => addToCart(item)} activeOpacity={0.7}
                            style={[styles.addCartBtn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }]}>
                            <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
                            <View style={styles.addCartPlusBadge}><Feather name="plus" size={9} color="#FFFFFF" /></View>
                          </TouchableOpacity>
                        )}
                        <View style={styles.priceAndButton}>
                          {item.discount_percentage > 0 ? (
                            <>
                              <Text style={[styles.productPrice, { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }]}>
                                R$ {item.price?.toFixed(2)}
                              </Text>
                              <Text style={[styles.productPrice, { color: '#E91E63' }]}>
                                R$ {(item.price * (1 - item.discount_percentage / 100)).toFixed(2)}
                              </Text>
                            </>
                          ) : (
                            <Text style={[styles.productPrice, { color: colors.textDark }]}>
                              R$ {item.price?.toFixed(2)}{item.is_bulk ? ' /Kg' : item.is_per_meter ? ' /m' : ''}
                            </Text>
                          )}
                          <TouchableOpacity style={styles.verItemBtn} activeOpacity={0.7}
                            onPress={() => navigation.navigate('ProductDetail', { product: item })}>
                            <VerItemSvg width={45} height={10} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </SlideInWrapper>
                </View>
              );
            })}
          </View>

          {gridProducts.length > 6 && (
            <View style={{ marginVertical: 12 }}>
              <FreteBanner />
            </View>
          )}

          <View onLayout={onGrid2Layout} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {gridProducts.slice(6, 12).map((item, idx) => {
              const adjustedIdx = idx + 6;
              const isFirstInRow = adjustedIdx % 2 === 0;
              const isSecondInRow = adjustedIdx % 2 === 1;
              return (
                <View key={item.id} onLayout={(e) => grid2Y.current > 0 && handleGridItemLayout(adjustedIdx, grid2Y.current, e)} style={{
                  width: '50%',
                  paddingLeft: isFirstInRow ? 16 : 8,
                  paddingRight: isSecondInRow ? 16 : 8,
                  marginBottom: 6,
                }}>
                  <SlideInWrapper visible={adjustedIdx < 4 || revealedRef.current.has(adjustedIdx)} delay={adjustedIdx % 2 === 0 ? 0 : 60}>
                    <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
                      <View style={styles.productImageWrapper}>
                        <AnimatedProductImage imageUrl={item.image_url} style={styles.productImage} />
                      </View>
                      <Text style={[styles.productName, { color: colors.textDark }]} numberOfLines={2}>{item.name}</Text>
                      <View style={styles.productBottomRow}>
                        {!item.is_bulk && !item.is_per_meter && (
                          <TouchableOpacity onPress={() => addToCart(item)} activeOpacity={0.7}
                            style={[styles.addCartBtn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }]}>
                            <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
                            <View style={styles.addCartPlusBadge}><Feather name="plus" size={9} color="#FFFFFF" /></View>
                          </TouchableOpacity>
                        )}
                        <View style={styles.priceAndButton}>
                          {item.discount_percentage > 0 ? (
                            <>
                              <Text style={[styles.productPrice, { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }]}>
                                R$ {item.price?.toFixed(2)}
                              </Text>
                              <Text style={[styles.productPrice, { color: '#E91E63' }]}>
                                R$ {(item.price * (1 - item.discount_percentage / 100)).toFixed(2)}
                              </Text>
                            </>
                          ) : (
                            <Text style={[styles.productPrice, { color: colors.textDark }]}>
                              R$ {item.price?.toFixed(2)}{item.is_bulk ? ' /Kg' : item.is_per_meter ? ' /m' : ''}
                            </Text>
                          )}
                          <TouchableOpacity style={styles.verItemBtn} activeOpacity={0.7}
                            onPress={() => navigation.navigate('ProductDetail', { product: item })}>
                            <VerItemSvg width={45} height={10} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </SlideInWrapper>
                </View>
              );
            })}
          </View>

          {gridProducts.length > 12 && (
            <View style={{ marginVertical: 12 }}>
              <PromoBanner
                clientName={clientName}
                onPress={() => navigation.navigate('VerTudo', { title: 'Produtos em Promoção', products: filteredPromo })}
              />
            </View>
          )}

          {gridProducts.length > 12 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {gridProducts.slice(12).map((item, idx) => {
                const adjustedIdx = idx + 12;
                const isFirstInRow = adjustedIdx % 2 === 0;
                const isSecondInRow = adjustedIdx % 2 === 1;
                return (
                  <View key={item.id} onLayout={(e) => grid2Y.current > 0 && handleGridItemLayout(adjustedIdx, grid2Y.current, e)} style={{
                    width: '50%',
                    paddingLeft: isFirstInRow ? 16 : 8,
                    paddingRight: isSecondInRow ? 16 : 8,
                    marginBottom: 6,
                  }}>
                    <SlideInWrapper visible={adjustedIdx < 4 || revealedRef.current.has(adjustedIdx)} delay={adjustedIdx % 2 === 0 ? 0 : 60}>
                      <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.productImageWrapper}>
                          <AnimatedProductImage imageUrl={item.image_url} style={styles.productImage} />
                        </View>
                        <Text style={[styles.productName, { color: colors.textDark }]} numberOfLines={2}>{item.name}</Text>
                        <View style={styles.productBottomRow}>
                          {!item.is_bulk && !item.is_per_meter && (
                            <TouchableOpacity onPress={() => addToCart(item)} activeOpacity={0.7}
                              style={[styles.addCartBtn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }]}>
                              <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
                              <View style={styles.addCartPlusBadge}><Feather name="plus" size={9} color="#FFFFFF" /></View>
                            </TouchableOpacity>
                          )}
                          <View style={styles.priceAndButton}>
                            {item.discount_percentage > 0 ? (
                              <>
                                <Text style={[styles.productPrice, { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }]}>
                                  R$ {item.price?.toFixed(2)}
                                </Text>
                                <Text style={[styles.productPrice, { color: '#E91E63' }]}>
                                  R$ {(item.price * (1 - item.discount_percentage / 100)).toFixed(2)}
                                </Text>
                              </>
                            ) : (
                              <Text style={[styles.productPrice, { color: colors.textDark }]}>
                                R$ {item.price?.toFixed(2)}{item.is_bulk ? ' /Kg' : item.is_per_meter ? ' /m' : ''}
                              </Text>
                            )}
                            <TouchableOpacity style={styles.verItemBtn} activeOpacity={0.7}
                              onPress={() => navigation.navigate('ProductDetail', { product: item })}>
                              <VerItemSvg width={45} height={10} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </SlideInWrapper>
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}
