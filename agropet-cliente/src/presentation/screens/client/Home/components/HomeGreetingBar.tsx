import React from 'react';
import { Animated, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from '../HomeScreen.styles';

interface HomeGreetingBarProps {
  showGreetingBar: boolean;
  shopStatus: any;
  colors: any;
  greetingOpacity: Animated.Value;
  greetingScale: Animated.Value;
  greeting: string;
  closeButtonRotate: Animated.Value;
  closeButtonScale: Animated.Value;
  handleDismissGreeting: () => void;
}

export default function HomeGreetingBar({ showGreetingBar, shopStatus, colors, greetingOpacity, greetingScale, greeting, closeButtonRotate, closeButtonScale, handleDismissGreeting }: HomeGreetingBarProps) {
  if (!showGreetingBar || !shopStatus) return null;

  return (
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
  );
}
