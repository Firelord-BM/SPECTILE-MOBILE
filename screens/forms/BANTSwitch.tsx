import { theme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BANTSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

export function BANTSwitch({
  label,
  value,
  onValueChange,
  description,
}: BANTSwitchProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.toggle, value ? styles.toggleActive : styles.toggleInactive]}
          onPress={() => onValueChange(!value)}
        >
          <View
            style={[
              styles.thumb,
              value ? styles.thumbActive : styles.thumbInactive,
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleInactive: {
    backgroundColor: '#E2E8F0',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
});