import { theme } from '@/constants/theme';
import { LocationData } from '@/utils/location';
import { CheckCircle, MapPin } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GPSIndicatorProps {
  location: LocationData;
}

export function GPSIndicator({ location }: GPSIndicatorProps) {
  return (
    <View style={styles.container}>
      <MapPin size={18} color={theme.colors.primary} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Location Captured</Text>
        <Text style={styles.coordinates}>
          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
        {location.accuracy && (
          <Text style={styles.accuracy}>
            Accuracy: ±{location.accuracy.toFixed(0)}m
          </Text>
        )}
      </View>
      <CheckCircle size={18} color={theme.colors.success} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  coordinates: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  accuracy: {
    fontSize: 11,
    color: theme.colors.success,
    marginTop: 2,
  },
});