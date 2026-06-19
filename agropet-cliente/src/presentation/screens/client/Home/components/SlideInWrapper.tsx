import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface SlideInWrapperProps {
  children: React.ReactNode;
  visible: boolean;
  delay?: number;
  duration?: number;
}

export default function SlideInWrapper({
  children,
  visible,
  delay = 0,
  duration = 350,
}: SlideInWrapperProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (visible && !hasAnimated.current) {
      hasAnimated.current = true;
      Animated.timing(animValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, delay, duration]);

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [{
          translateX: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-30, 0],
          }),
        }],
      }}
    >
      {children}
    </Animated.View>
  );
}
