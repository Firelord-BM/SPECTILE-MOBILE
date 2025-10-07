import { GPSIndicator } from '@/components/common/GPSIndicator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import { useContactStore } from '@/store/useContactStore';
import { getCurrentLocation, LocationData } from '@/utils/location';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ContactFormScreen() {
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
    <>
      <Stack.Screen
        options={{
          title: 'New Contact',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: 'white',
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {location && <GPSIndicator location={location} />}

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Business Name *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter business name"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Phone Number *</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="+254712345678"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <ThemedText style={styles.submitButtonText}>Add Contact</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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