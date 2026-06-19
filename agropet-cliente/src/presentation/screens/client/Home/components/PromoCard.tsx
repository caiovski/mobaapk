import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getAllImageUrls } from '../../../../../utils/imageUtils';

interface PromoCardProps {
  item: any;
  addToCart: (product: any) => void;
  onVerItem: (product: any) => void;
  showDestaque?: boolean;
  destaqueCount?: number;
  cardWidth: number;
}

export default function PromoCard({ item, addToCart, onVerItem, showDestaque, destaqueCount, cardWidth }: PromoCardProps) {
  const { colors, isDarkMode } = useTheme();
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [glowAnim]);

  const photoWidth = cardWidth - 20;
  const photoHeight = (photoWidth * 120) / 129;
  const discount = item.discount_percentage || 0;
  const originalPrice = item.price;
  const discountedPrice = originalPrice * (1 - discount / 100);
  const urls = React.useMemo(() => getAllImageUrls(item.image_url), [item.image_url]);

  return (
    <Animated.View
      style={[
        {
          width: cardWidth,
          backgroundColor: isDarkMode ? '#2A1A3A' : '#FFF0F5',
          borderRadius: 25,
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 10,
          marginRight: 10,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: isDarkMode ? '#9C27B0' : '#E91E63',
          shadowColor: '#9C27B0',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 1],
          }),
          transform: [{
            scale: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.98, 1.01],
            }),
          }],
        },
      ]}
    >
      {discount > 0 && (
        <View style={{
          position: 'absolute', top: -6, left: -6,
          backgroundColor: '#FF6F00', borderRadius: 12,
          paddingHorizontal: 8, paddingVertical: 3,
          zIndex: 10, elevation: 8,
          shadowColor: '#FF6F00', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5, shadowRadius: 4,
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>{discount}% OFF</Text>
        </View>
      )}
      {showDestaque && destaqueCount && destaqueCount > 1 && (
        <View style={{
          position: 'absolute', top: -6, right: -6,
          backgroundColor: '#FFD600', borderRadius: 10,
          paddingHorizontal: 6, paddingVertical: 2,
          zIndex: 10, elevation: 8,
        }}>
          <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>⭐ Destaque {destaqueCount}x</Text>
        </View>
      )}
      <View style={{
        width: photoWidth, height: photoHeight,
        borderRadius: 15, overflow: 'hidden',
        backgroundColor: isDarkMode ? '#3A2A4A' : '#FFFFFF',
        marginBottom: 6,
      }}>
        {urls.length > 0 ? (
          <Image source={{ uri: urls[0] }} style={{ width: '100%', height: '100%' }} contentFit="cover" cachePolicy="disk" />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: isDarkMode ? '#888' : '#999', fontSize: 11 }}>Sem Imagem</Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 4 }} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 4 }}>
        {!item.is_bulk && !item.is_per_meter && (
          <TouchableOpacity
            onPress={() => addToCart(item)}
            activeOpacity={0.7}
            style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: isDarkMode ? '#1E1E1E' : '#1C2434',
              justifyContent: 'center', alignItems: 'center',
              position: 'relative', marginRight: 4,
            }}
          >
            <MaterialIcons name="shopping-cart" size={26} color="#FFFFFF" />
            <View style={{
              position: 'absolute', top: 4, right: 4,
              width: 14, height: 14, borderRadius: 7,
              backgroundColor: '#25BE36',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Feather name="plus" size={9} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
          {discount > 0 ? (
            <>
              <Text style={{ fontSize: 12, color: '#999', textDecorationLine: 'line-through' }}>
                R$ {originalPrice.toFixed(2)}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#E91E63' }}>
                R$ {discountedPrice.toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.textDark }}>
              R$ {originalPrice.toFixed(2)}{item.is_bulk ? ' /Kg' : item.is_per_meter ? ' /m' : ''}
            </Text>
          )}
          <TouchableOpacity
            style={{
              backgroundColor: '#EA841E', borderRadius: 15,
              width: 85, height: 30,
              alignItems: 'center', justifyContent: 'center',
            }}
            activeOpacity={0.7}
            onPress={() => onVerItem(item)}
          >
            <Text style={{ color: '#1C2434', fontSize: 11, fontWeight: 'bold' }}>Ver Item</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
