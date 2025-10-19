import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import RegisterClientScreen from '@/screens/forms/ContactForm';
import { useContactStore } from '@/store/useContactStore';
import { getCurrentLocation, LocationData } from '@/utils/location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function RegisterClient() {
  const { addContact } = useContactStore();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    stage: 'Lead' as const,
  });

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (error) {
      Alert.alert('Location Error', 'Could not get your location. Please enable GPS.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Validation Error', 'Name and phone are required');
      return;
    }

    try {
      await addContact(formData);
      Alert.alert('Success', 'Contact added successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  return (
  <ThemedView style={styles.container}>
    <View style={styles.header}>
            <ThemedText type="title" style={{ color: 'white' }}>
              Lead Registration
            </ThemedText>
          </View>

<RegisterClientScreen/>
  </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
    header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    paddingTop: 40,
  },
  content: {
    padding: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});