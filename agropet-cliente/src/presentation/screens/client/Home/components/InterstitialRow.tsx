import React, { useCallback } from 'react';
import { View } from 'react-native';
import SlideInWrapper from './SlideInWrapper';
import ProductCardContent from './ProductCardContent';

interface InterstitialRowProps {
  products: any[];
  addToCart: (product: any) => void;
  navigation: any;
  horizontalReady: boolean;
  marginTop?: number;
}

function InterstitialRow({ products, addToCart, navigation, horizontalReady, marginTop = 0 }: InterstitialRowProps) {
  const onNavigate = useCallback((p: any) => navigation.navigate('ProductDetail', { product: p }), [navigation]);

  if (products.length < 2) return null;

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: marginTop, marginBottom: 0 }}>
      <View style={{ width: '50%', paddingRight: 6 }}>
        <SlideInWrapper key={products[0].id} visible={horizontalReady} delay={0}>
          <ProductCardContent product={products[0]} addToCart={addToCart} onNavigate={onNavigate} />
        </SlideInWrapper>
      </View>
      <View style={{ width: '50%', paddingLeft: 6 }}>
        <SlideInWrapper key={products[1].id} visible={horizontalReady} delay={60}>
          <ProductCardContent product={products[1]} addToCart={addToCart} onNavigate={onNavigate} />
        </SlideInWrapper>
      </View>
    </View>
  );
}

export default React.memo(InterstitialRow);
