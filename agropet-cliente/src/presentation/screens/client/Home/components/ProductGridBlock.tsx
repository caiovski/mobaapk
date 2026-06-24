import React, { useCallback } from 'react';
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
  visible?: boolean;
  enterFrom?: 'left' | 'right';
  exitTo?: 'left' | 'right';
}

function ProductGridBlock({ products, offset = 0, revealedRef, handleGridItemLayout, gridY, addToCart, navigation, paddingTop, onLayout, visible = true, enterFrom = 'left', exitTo = 'right' }: ProductGridBlockProps) {
  const onNavigate = useCallback((p: any) => navigation.navigate('ProductDetail', { product: p }), [navigation]);

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
            <SlideInWrapper visible={visible} delay={adjustedIdx % 2 === 0 ? 0 : 60} enterFrom={enterFrom} exitTo={exitTo}>
              <ProductCardContent product={item} addToCart={addToCart} onNavigate={onNavigate} />
            </SlideInWrapper>
          </View>
        );
      })}
    </View>
  );
}

export default React.memo(ProductGridBlock);
