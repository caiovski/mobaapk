import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getAllImageUrls } from '../../../../../utils/imageUtils';
import VerItemSvg from '../../../../assets/tela4/produto/VerItem.svg';
import styles from '../HomeScreen.styles';

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

interface ProductCardContentProps {
  product: any;
  addToCart: (product: any) => void;
  onNavigate: (product: any) => void;
}

export default function ProductCardContent({ product, addToCart, onNavigate }: ProductCardContentProps) {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.productCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.productImageWrapper}>
        <AnimatedProductImage imageUrl={product.image_url} style={styles.productImage} />
      </View>
      <Text style={[styles.productName, { color: colors.textDark }]} numberOfLines={2}>{product.name}</Text>
      <View style={styles.productBottomRow}>
        {!product.is_bulk && !product.is_per_meter && (
          <TouchableOpacity onPress={() => addToCart(product)} activeOpacity={0.7}
            style={[styles.addCartBtn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434' }]}>
            <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
            <View style={styles.addCartPlusBadge}><Feather name="plus" size={9} color="#FFFFFF" /></View>
          </TouchableOpacity>
        )}
        <View style={styles.priceAndButton}>
          {product.discount_percentage > 0 ? (
            <>
              <Text style={[styles.productPrice, { fontSize: 12, color: '#999', textDecorationLine: 'line-through' }]}>
                R$ {product.price?.toFixed(2)}
              </Text>
              <Text style={[styles.productPrice, { color: '#E91E63' }]}>
                R$ {(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={[styles.productPrice, { color: colors.textDark }]}>
              R$ {product.price?.toFixed(2)}{product.is_bulk ? ' /Kg' : product.is_per_meter ? ' /m' : ''}
            </Text>
          )}
          <TouchableOpacity style={styles.verItemBtn} activeOpacity={0.7}
            onPress={() => onNavigate(product)}>
            <VerItemSvg width={45} height={10} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
