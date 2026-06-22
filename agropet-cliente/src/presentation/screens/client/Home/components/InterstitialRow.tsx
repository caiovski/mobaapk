import React from 'react';
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

export default function InterstitialRow({ products, addToCart, navigation, horizontalReady, marginTop = 0 }: InterstitialRowProps) {
  if (products.length < 2) return null;

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: marginTop, marginBottom: 0 }}>
      <View style={{ width: '50%', paddingRight: 6 }}>
        <SlideInWrapper key={products[0].id} visible={horizontalReady} delay={0}>
          <ProductCardContent product={products[0]} addToCart={addToCart} onNavigate={(p) => navigation.navigate('ProductDetail', { product: p })} />
        </SlideInWrapper>
      </View>
      <View style={{ width: '50%', paddingLeft: 6 }}>
        <SlideInWrapper key={products[1].id} visible={horizontalReady} delay={60}>
          <ProductCardContent product={products[1]} addToCart={addToCart} onNavigate={(p) => navigation.navigate('ProductDetail', { product: p })} />
        </SlideInWrapper>
      </View>
    </View>
  );
}
