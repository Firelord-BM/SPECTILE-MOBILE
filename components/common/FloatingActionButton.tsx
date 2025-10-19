import { theme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  backgroundColor?: string;
  size?: number;
  style?: ViewStyle;
  bottom?: number;
  right?: number;
}

export function FloatingActionButton({
  onPress,
  icon = 'add',
  backgroundColor = theme.colors.primary,
  size = 56,
  style,
  bottom = 20,
  right = 20,
}: FloatingActionButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          bottom,
          right,
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.fabButton}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <MaterialIcons name={icon} size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});