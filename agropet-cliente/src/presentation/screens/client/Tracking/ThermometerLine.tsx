import React from 'react';
import { View, Animated } from 'react-native';
import { styles } from './TrackingScreen.styles';

export const ThermometerLine = ({
  color, animatedOpacity, glowIntensity, isDarkMode, height = 70,
}: {
  color: string;
  animatedOpacity?: Animated.Value;
  glowIntensity?: { opacity: number[]; radius: number[] };
  isDarkMode?: boolean;
  height?: number;
}) => {
  const Container = animatedOpacity ? Animated.View : View;
  const containerProps = animatedOpacity ? {
    style: [
      styles.separatorWrapper,
      { height },
      { opacity: animatedOpacity },
    ],
  } : { style: [styles.separatorWrapper, { height }] };

  const glowStyle = animatedOpacity && glowIntensity && isDarkMode ? {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: animatedOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: glowIntensity.opacity,
    }),
    shadowRadius: animatedOpacity.interpolate({
      inputRange: [0, 1],
      outputRange: glowIntensity.radius,
    }),
    elevation: 5,
  } : {};

  return (
    <Container {...containerProps}>
      <Animated.View style={[styles.thermometerStick, { backgroundColor: color, height: height - 6 }, glowStyle]} />
      <Animated.View style={[styles.thermometerSquare, { backgroundColor: color }, glowStyle]} />
    </Container>
  );
};
