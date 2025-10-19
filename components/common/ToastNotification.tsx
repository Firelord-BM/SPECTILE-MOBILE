import { theme } from '@/constants/theme';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ToastNotificationProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function ToastNotification({ 
  message, 
  visible, 
  onHide, 
  duration = 100 
}: ToastNotificationProps) {
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.toast}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    backgroundColor: theme.colors.text,
    borderRadius: 8,
    paddingVertical: 12, 
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  message: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});