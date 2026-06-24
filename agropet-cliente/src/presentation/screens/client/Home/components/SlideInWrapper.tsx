import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface SlideInWrapperProps {
  children: React.ReactNode;
  visible: boolean;
  delay?: number;
  duration?: number;
  enterFrom?: 'left' | 'right';
  exitTo?: 'left' | 'right';
}

type Phase = 'entered' | 'entering' | 'exiting' | 'exited';

export default function SlideInWrapper({
  children,
  visible,
  delay = 0,
  duration = 350,
  enterFrom = 'left',
  exitTo = 'right',
}: SlideInWrapperProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const prevVisible = useRef(visible);
  const [phase, setPhase] = React.useState<Phase>(visible ? 'entered' : 'exited');

  useEffect(() => {
    const wasVisible = prevVisible.current;
    prevVisible.current = visible;

    if (visible === wasVisible) return;

    if (visible) {
      setPhase('entering');
      animValue.setValue(0);
      Animated.timing(animValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start(() => setPhase('entered'));
    } else {
      setPhase('exiting');
      animValue.setValue(0);
      Animated.timing(animValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start(() => setPhase('exited'));
    }
  }, [visible, delay, duration]);

  let translateX: Animated.AnimatedInterpolation<number>;
  let opacity: Animated.AnimatedInterpolation<number>;

  if (phase === 'entering') {
    translateX = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: enterFrom === 'left' ? [-30, 0] : [30, 0],
    });
    opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
  } else if (phase === 'exiting') {
    translateX = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: exitTo === 'right' ? [0, 30] : [0, -30],
    });
    opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
  } else if (phase === 'entered') {
    translateX = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0],
    });
    opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1],
    });
  } else {
    translateX = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: exitTo === 'right' ? [30, 30] : [-30, -30],
    });
    opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0],
    });
  }

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateX }],
      }}
    >
      {children}
    </Animated.View>
  );
}
