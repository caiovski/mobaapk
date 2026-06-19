import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';

interface PromoBannerProps {
  clientName: string;
  onPress: () => void;
}

export default function PromoBanner({ clientName, onPress }: PromoBannerProps) {
  const { isDarkMode } = useTheme();

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2000, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(shineAnim, { toValue: 2, duration: 4000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
  const shineTranslateX = shineAnim.interpolate({ inputRange: [-1, 2], outputRange: [-200, 600] });

  // Pink in light mode, Purple/Neon in dark mode
  const bgMain = isDarkMode ? '#4A0E4E' : '#FF4081'; // Deep neon purple vs Vibrant pink
  const bgSecondary = isDarkMode ? '#7B1FA2' : '#F50057';
  const textDark = isDarkMode ? '#FFFFFF' : '#FFFFFF';
  const textAccent = isDarkMode ? '#E040FB' : '#FF80AB';

  const nameToUse = clientName && clientName.trim().length > 0 ? clientName : 'CLIENTE';

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={{
        overflow: 'hidden',
        backgroundColor: bgMain,
        elevation: 8,
        shadowColor: isDarkMode ? '#E040FB' : '#F50057',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        position: 'relative',
        paddingVertical: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        {/* Decorative Background Elements */}
        <View style={{ position: 'absolute', top: -40, left: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: bgSecondary, opacity: 0.5 }} />
        <View style={{ position: 'absolute', bottom: -50, right: 20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <View style={{ position: 'absolute', top: 10, right: 100, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' }} />

        {/* Animated Shine Effect */}
        <Animated.View style={{
          position: 'absolute', top: 0, bottom: 0, width: 80, backgroundColor: 'rgba(255,255,255,0.2)',
          transform: [{ skewX: '-25deg' }, { translateX: shineTranslateX }],
          zIndex: 5,
        }} />

        {/* Text Content */}
        <View style={{ flex: 1, zIndex: 10 }}>
          <Text style={{
            fontSize: 14, fontWeight: '800', color: textAccent,
            letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase',
            textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
          }}>
            CARO(A) {nameToUse}!
          </Text>
          <Text style={{
            fontSize: 24, fontWeight: '900', color: textDark,
            lineHeight: 28, textTransform: 'uppercase',
            textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
          }}>
            CONFIRA AS{'\n'}PROMOÇÕES{'\n'}DE HOJE
          </Text>
        </View>

        {/* Floating Animated Icon */}
        <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center', zIndex: 10, marginRight: 10 }}>
          {/* Pulsing ring */}
          <Animated.View style={{
            position: 'absolute', width: 64, height: 64, borderRadius: 32,
            backgroundColor: 'rgba(255,255,255,0.8)', opacity: pulseOpacity, transform: [{ scale: pulseScale }]
          }} />
          
          {/* Floating Object */}
          <Animated.View style={{
            transform: [{ translateY }],
            shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 10,
          }}>
            <View style={{
              backgroundColor: '#FFF', width: 60, height: 60, borderRadius: 30,
              justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: textAccent,
            }}>
              <MaterialCommunityIcons name="tag-heart" size={32} color={bgSecondary} />
            </View>
          </Animated.View>
        </View>

        {/* Right Arrow Button */}
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'center', alignItems: 'center', zIndex: 10,
        }}>
          <Feather name="chevron-right" size={24} color="#FFF" />
        </View>

      </View>
    </TouchableOpacity>
  );
}
