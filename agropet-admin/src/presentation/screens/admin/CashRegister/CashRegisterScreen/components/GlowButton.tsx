import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, Text } from 'react-native';
import type { ViewStyle } from 'react-native';

interface GlowButtonProps {
  label: string;
  backgroundColor: string;
  enabled: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textColor?: string;
}

export function GlowButton({ label, backgroundColor, enabled, onPress, style, textColor }: GlowButtonProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (enabled) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      glowAnim.setValue(0);
    }
  }, [enabled]);

  const opacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });
  const scale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });

  return (
    <Animated.View style={[{ flex: 1 }, style, enabled ? { opacity, transform: [{ scale }] } : undefined]}>
      <TouchableOpacity
        style={{
          flex: 1, paddingVertical: 14, borderRadius: 12,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor,
          opacity: enabled ? 1 : 0.5,
        }}
        activeOpacity={0.7}
        onPress={enabled ? onPress : undefined}
        disabled={!enabled}
      >
        <Text style={{ color: textColor || '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
