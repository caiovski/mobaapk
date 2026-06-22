import React from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ScrollToTopButtonProps {
  scrollRef: React.RefObject<any>;
  visible: boolean;
  isFlatList?: boolean;
  isDarkMode?: boolean;
}

export default function ScrollToTopButton({ scrollRef, visible, isFlatList, isDarkMode }: ScrollToTopButtonProps) {
  const bgColor = isDarkMode ? '#2E2E38' : '#FFFFFF';
  const iconColor = isDarkMode ? '#FFE082' : '#1C2434';
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  const handlePress = () => {
    if (isFlatList) {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    } else {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, pointerEvents: visible ? 'auto' : 'none' as any },
      ]}
    >
      <TouchableOpacity
        testID="scroll-to-top-button"
        style={[styles.button, { backgroundColor: bgColor }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Feather name="chevron-up" size={24} color={iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    zIndex: 9999,
    elevation: 20,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
});
