import React from 'react';
import {
  View, StatusBar, Text, ActivityIndicator, RefreshControl, Dimensions, FlatList, ScrollView,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { CatalogHeader, CatalogFilter } from '../../../components/CatalogHeader';
import { useFilter } from '../../../contexts/FilterContext';
import useHomeScreen from './useHomeScreen';
import styles from './HomeScreen.styles';
import SectionSeparator from './components/SectionSeparator';
import PromoCard from './components/PromoCard';
import SectionProductCard from './components/SectionProductCard';
import FreteBanner from './components/FreteBanner';
import PromoBanner from './components/PromoBanner';
import SectionRow from './components/SectionRow';
import HomeBanners from './components/HomeBanners';
import HomeGreetingBar from './components/HomeGreetingBar';
import SlideInWrapper from './components/SlideInWrapper';
import InterstitialRow from './components/InterstitialRow';
import ProductGridBlock from './components/ProductGridBlock';
import ScrollToTopButton from '../../../components/ScrollToTopButton';

type GridItem = 
  | { type: 'product-row', products: any[], offset: number }
  | { type: 'frete-banner' }
  | { type: 'promo-banner' };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

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
  const scrollRef = React.useRef<FlatList>(null);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const grid1Y = React.useRef(0);

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
    const y = event.nativeEvent.contentOffset.y;
    scrollPos.current = y;
    setShowScrollTop(y > 500);
    let changed = false;
    itemPositions.current.forEach((absY, idx) => {
      if (absY < scrollPos.current + WIN_H + 100 && !revealedRef.current.has(idx)) {
        revealedRef.current.add(idx);
        changed = true;
      }
    });
    if (changed) setRenderTick(t => t + 1);
  }, [WIN_H]);

  const [horizontalReady, setHorizontalReady] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setHorizontalReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    revealedRef.current.clear();
    itemPositions.current.clear();
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

  const interstitialCount = sectionList.length === 0 ? 2 : Math.max(0, sectionList.length - 1) * 2;
  const interstitialProducts = React.useMemo(() => products.slice(0, interstitialCount), [products, interstitialCount]);

  const gridProducts = allFiltered;

  const listData = React.useMemo(() => {
    const data: GridItem[] = [];
    let currentPair: any[] = [];
    
    for (let i = 0; i < gridProducts.length; i++) {
      currentPair.push(gridProducts[i]);
      if (currentPair.length === 2 || i === gridProducts.length - 1) {
        data.push({ type: 'product-row', products: currentPair, offset: i - currentPair.length + 1 });
        currentPair = [];
      }
      
      if (i === 5) {
        data.push({ type: 'frete-banner' });
      } else if (i === 11) {
        data.push({ type: 'promo-banner' });
      }
    }
    return data;
  }, [gridProducts]);

  const renderHeader = () => (
    <View style={{ paddingBottom: 12 }}>
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
          <View style={{ marginHorizontal: 16, marginTop: 8, height: 1.5, backgroundColor: isDarkMode ? '#3E3E4A' : '#D0D0D0' }} />
        </>
      )}

      {showSections && sectionList.length >= 2 && interstitialProducts.length >= 2 && (
        <InterstitialRow products={interstitialProducts} addToCart={addToCart} navigation={navigation} horizontalReady={horizontalReady} marginTop={20} />
      )}

      {showSections && hasViewed && (
        <SectionRow title="Mais Acessados Hoje" products={filteredViewed} horizontalReady={horizontalReady}
          onVerTudo={() => navigation.navigate('VerTudo', { title: 'Mais Acessados Hoje', products: filteredViewed })}
          renderItem={(item) => <SectionProductCard item={item} addToCart={addToCart} onVerItem={(p) => navigation.navigate('ProductDetail', { product: p })} showDestaque={getShowDestaque(item.id, 'acessados')} destaqueCount={getDestaqueSections(item.id)} cardWidth={CARD_WIDTH} />}
          separatorStyle={{ marginTop: sectionList[0] === 'acessados' ? 12 : 20 }} />
      )}

      {showSections && sectionList.length >= 3 && interstitialProducts.length >= 4 && (
        <InterstitialRow products={[interstitialProducts[2], interstitialProducts[3]]} addToCart={addToCart} navigation={navigation} horizontalReady={horizontalReady} marginTop={20} />
      )}

      {showSections && hasSold && (
        <SectionRow title="Mais Comprados Hoje" products={filteredSold} horizontalReady={horizontalReady}
          onVerTudo={() => navigation.navigate('VerTudo', { title: 'Mais Comprados Hoje', products: filteredSold })}
          renderItem={(item) => <SectionProductCard item={item} addToCart={addToCart} onVerItem={(p) => navigation.navigate('ProductDetail', { product: p })} showDestaque={getShowDestaque(item.id, 'comprados')} destaqueCount={getDestaqueSections(item.id)} cardWidth={CARD_WIDTH} />}
          separatorStyle={{ marginTop: sectionList[0] === 'comprados' ? 12 : 20 }} />
      )}

      {showSections && sectionList.length === 0 && interstitialProducts.length >= 2 && (
        <InterstitialRow products={interstitialProducts} addToCart={addToCart} navigation={navigation} horizontalReady={horizontalReady} marginTop={12} />
      )}
    </View>
  );

  const renderItem = React.useCallback(({ item }: { item: GridItem }) => {
    if (item.type === 'frete-banner') {
      return <View style={{ marginVertical: 12 }}><FreteBanner /></View>;
    }
    if (item.type === 'promo-banner') {
      return (
        <View style={{ marginVertical: 12 }}>
          <PromoBanner clientName={clientName} onPress={() => navigation.navigate('VerTudo', { title: 'Produtos em Promoção', products: filteredPromo })} />
        </View>
      );
    }
    
    const isFirstRow = item.offset === 0;
    const paddingTop = isFirstRow ? (showSections ? (sectionList.length > 0 ? 32 : 16) : 28) : undefined;
    
    return (
      <ProductGridBlock
        products={item.products}
        offset={item.offset}
        revealedRef={revealedRef}
        handleGridItemLayout={handleGridItemLayout}
        gridY={grid1Y}
        addToCart={addToCart}
        navigation={navigation}
        paddingTop={paddingTop}
      />
    );
  }, [clientName, filteredPromo, navigation, revealedRef, handleGridItemLayout, grid1Y, addToCart, showSections, sectionList]);

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.backgroundLight }]}>
      <StatusBar backgroundColor={colors.headerBackground} barStyle="light-content" />
      <CatalogHeader searchText={searchText} onSearchChange={setSearchText} />
      <HomeBanners shopStatus={shopStatus} isDarkMode={isDarkMode} colors={colors}
        esgotadoAlert={esgotadoAlert} setEsgotadoAlert={setEsgotadoAlert}
        deliveryActive={deliveryActive} showReactivatedAlert={showReactivatedAlert}
        handleCloseReactivated={handleCloseReactivated} />

      <CatalogFilter />

      <HomeGreetingBar showGreetingBar={showGreetingBar} shopStatus={shopStatus} colors={colors}
        greetingOpacity={greetingOpacity} greetingScale={greetingScale} greeting={greeting}
        closeButtonRotate={closeButtonRotate} closeButtonScale={closeButtonScale}
        handleDismissGreeting={handleDismissGreeting} />

      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primaryDark} /></View>
      ) : filteredProducts.length === 0 ? (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textDark, textAlign: 'center', paddingHorizontal: 20 }]}>
            {selectedCategories.length > 0 ? "Não temos produto desta categoria no momento, volte mais tarde!" : "Nenhum produto encontrado"}
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          ref={scrollRef}
          data={listData}
          keyExtractor={(item, idx) => item.type === 'product-row' ? `row-${item.offset}` : `${item.type}-${idx}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={<View style={{ height: 24 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
          onScroll={handleMainScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 120 }}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
        />
      )}
      <ScrollToTopButton scrollRef={scrollRef} visible={showScrollTop} isDarkMode={isDarkMode} isFlatList={true} />
    </View>
  );
}
