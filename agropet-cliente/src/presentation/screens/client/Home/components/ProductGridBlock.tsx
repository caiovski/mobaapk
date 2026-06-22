import React from 'react';
import { View } from 'react-native';
import SlideInWrapper from './SlideInWrapper';
import ProductCardContent from './ProductCardContent';

interface ProductGridBlockProps {
  products: any[];
  offset?: number;
  revealedRef: React.MutableRefObject<Set<number>>;
  handleGridItemLayout?: (absIndex: number, blockBase: number, event: any) => void;
  gridY?: React.MutableRefObject<number>;
  addToCart: (product: any) => void;
  navigation: any;
  paddingTop?: number;
  onLayout?: (event: any) => void;
}

export default function ProductGridBlock({ products, offset = 0, revealedRef, handleGridItemLayout, gridY, addToCart, navigation, paddingTop, onLayout }: ProductGridBlockProps) {
  return (
    <View onLayout={onLayout} style={{ flexDirection: 'row', flexWrap: 'wrap', ...(paddingTop !== undefined ? { paddingTop } : {}) }}>
      {products.map((item, idx) => {
        const adjustedIdx = idx + offset;
        const isFirstInRow = adjustedIdx % 2 === 0;
        const isSecondInRow = adjustedIdx % 2 === 1;
        return (
          <View key={item.id} onLayout={(e) => gridY && gridY.current > 0 && handleGridItemLayout ? handleGridItemLayout(adjustedIdx, gridY.current, e) : undefined} style={{
            width: '50%',
            paddingLeft: isFirstInRow ? 16 : 8,
            paddingRight: isSecondInRow ? 16 : 8,
            marginBottom: 6,
          }}>
            <SlideInWrapper visible={adjustedIdx < 4 || revealedRef.current.has(adjustedIdx)} delay={adjustedIdx % 2 === 0 ? 0 : 60}>
              <ProductCardContent product={item} addToCart={addToCart} onNavigate={(p) => navigation.navigate('ProductDetail', { product: p })} />
            </SlideInWrapper>
          </View>
        );
      })}
    </View>
  );
}
