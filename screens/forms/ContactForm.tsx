import EnhancedPicker from '@/components/common/EnhancedPicker';
import { GPSIndicator } from '@/components/common/GPSIndicator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import { getCurrentLocation, LocationData, requestLocationPermission } from '@/utils/location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { BANTSwitch } from './BANTSwitch';
import { TextInputField } from './TextInputField';

const API_BASE_URL = 'https://api.spectile.co.ke/api';
interface ClientFormData {
  businessTypeId: number | null;
  ownerName: string;
  businessName: string;
  phoneNumber: string;
  email: string;
  kraPin: string;
  territoryId: number | null;
  town: string;
  street: string;
  building: string;
  servicesNeeded: string;
  bantBudget: boolean;
  bantAuthority: boolean;
  bantNeed: boolean;
  bantTimeline: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface BusinessType {
  id: number;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

interface Territory {
  id: number;
  territoryName: string;
  countyName: string;
  subCountyName?: string;
  isActive: boolean;
}

export default function RegisterClientScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [formData, setFormData] = useState<ClientFormData>({
    businessTypeId: null,
    ownerName: '',
    businessName: '',
    phoneNumber: '',
    email: '',
    kraPin: '',
    territoryId: null,
    town: '',
    street: '',
    building: '',
    servicesNeeded: '',
    bantBudget: false,
    bantAuthority: false,
    bantNeed: false,
    bantTimeline: false,
  });

  // Initialize location and fetch data
  useEffect(() => {
    initializeLocation();
    fetchBusinessTypes();
    fetchTerritories();
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const fetchBusinessTypes = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/business-types?active=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch business types');
      }

      const result = await response.json();
      // Handle both array and paged response formats
      const data = result.data?.content || result.data || [];
      setBusinessTypes(data);
    } catch (error) {
      console.error('Failed to fetch business types:', error);
      Alert.alert('Error', 'Failed to load business types. Please try again.');
    }
  };

  const fetchTerritories = async () => {
    try {
      setDataLoading(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/territories?active=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch territories');
      }

      const result = await response.json();
      // Handle both array and paged response formats
      const data = result.data?.content || result.data || [];
      setTerritories(data);
    } catch (error) {
      console.error('Failed to fetch territories:', error);
      Alert.alert('Error', 'Failed to load territories. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const initializeLocation = async () => {
    try {
      setLocationLoading(true);
      await requestLocationPermission();
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Access',
        'Location permission is required to register clients. Using default location.',
        [{ text: 'OK' }]
      );
      // Set default Nairobi location
      setLocation({
        latitude: -1.286389,
        longitude: 36.817223,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleFieldChange = useCallback((name: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [formErrors]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.businessTypeId) {
      errors.businessTypeId = 'Business type is required';
      isValid = false;
    }

    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Owner name is required';
      isValid = false;
    }

    if (!formData.businessName.trim()) {
      errors.businessName = 'Business name is required';
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else {
      const cleanPhone = formData.phoneNumber.replace(/\s/g, '');
      if (!/^(0|\+254)\d{9}$/.test(cleanPhone)) {
        errors.phoneNumber = 'Phone must start with 0 or +254 followed by 9 digits';
        isValid = false;
      }
    }

    if (!formData.territoryId) {
      errors.territoryId = 'Territory is required';
      isValid = false;
    }

    if (!formData.town.trim()) {
      errors.town = 'Town is required';
      isValid = false;
    }

    if (!formData.street.trim()) {
      errors.street = 'Street is required';
      isValid = false;
    }

    if (!formData.building.trim()) {
      errors.building = 'Building is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please wait for location to be acquired');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.replace('/login');
        return;
      }

      // Format phone number
      const phoneNumber = formData.phoneNumber.trim();
      const formattedPhone = phoneNumber.startsWith('+254')
        ? phoneNumber
        : `+254${phoneNumber.replace(/^0/, '')}`;

      // Calculate BANT score
      const bantScore = [
        formData.bantBudget,
        formData.bantAuthority,
        formData.bantNeed,
        formData.bantTimeline,
      ].filter(Boolean).length;

      const clientData = {
        syncId: Crypto.randomUUID(),
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        phoneNumber: formattedPhone,
        email: formData.email.trim() || null,
        kraPin: formData.kraPin.trim().toUpperCase() || null,
        businessTypeId: formData.businessTypeId,
        territoryId: formData.territoryId,
        town: formData.town.trim(),
        street: formData.street.trim(),
        building: formData.building.trim(),
        servicesNeeded: formData.servicesNeeded.trim() || null,
        stage: 'LEAD',
        latitude: location.latitude,
        longitude: location.longitude,
        locationTimestamp: location.timestamp,
        bantBudget: formData.bantBudget,
        bantAuthority: formData.bantAuthority,
        bantNeed: formData.bantNeed,
        bantTimeline: formData.bantTimeline,
        bantScore,
        qualificationStatus: bantScore >= 3,
      };

      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register client');
      }

      const result = await response.json();

      Alert.alert(
        'Success',
        'Client registered successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', error.message || 'Failed to register client');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dataLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading form data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Register Client',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: 'white',
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.container}>
          <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Client Information Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Client Information</ThemedText>

              <EnhancedPicker
                label="Business Type"
                value={formData.businessTypeId !== null ? String(formData.businessTypeId) : ''}
                onValueChange={(value: string | number | null) => {
                  const numValue = value && value !== '' ? Number(value) : null;
                  handleFieldChange('businessTypeId', numValue);
                }}
                items={[
                  { label: 'Select business type', value: '' },
                  ...businessTypes.map((type) => ({
                    label: type.name,
                    value: String(type.id),
                  })),
                ]}
                placeholder="Select business type"
                error={formErrors.businessTypeId}
                isRequired={true}
              />

              <TextInputField
                label="Owner's Name"
                isRequired={true}
                value={formData.ownerName}
                onChangeText={(text: any) => handleFieldChange('ownerName', text)}
                placeholder="Enter owner's name"
                error={formErrors.ownerName}
              />

              <TextInputField
                label="Business Name"
                isRequired={true}
                value={formData.businessName}
                onChangeText={(text: any) => handleFieldChange('businessName', text)}
                placeholder="Enter business name"
                error={formErrors.businessName}
              />

              <TextInputField
                label="Phone Number"
                isRequired={true}
                value={formData.phoneNumber}
                onChangeText={(text: any) => handleFieldChange('phoneNumber', text)}
                placeholder="+254712345678"
                keyboardType="phone-pad"
                error={formErrors.phoneNumber}
              />

              <TextInputField
                label="Email"
                value={formData.email}
                onChangeText={(text: any) => handleFieldChange('email', text)}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={formErrors.email}
              />

              <TextInputField
                label="KRA PIN"
                value={formData.kraPin}
                onChangeText={(text: any) => handleFieldChange('kraPin', text)}
                placeholder="A123456789Z"
                autoCapitalize="characters"
                error={formErrors.kraPin}
              />
            </View>

            {/* Lead Qualification Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Lead Qualification (BANT)</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Qualify this lead using the BANT framework
              </ThemedText>

              <BANTSwitch
                label="Budget"
                value={formData.bantBudget}
                onValueChange={(value: any) => handleFieldChange('bantBudget', value)}
                description="Client has sufficient budget"
              />

              <BANTSwitch
                label="Authority"
                value={formData.bantAuthority}
                onValueChange={(value: any) => handleFieldChange('bantAuthority', value)}
                description="Has decision-making authority"
              />

              <BANTSwitch
                label="Need"
                value={formData.bantNeed}
                onValueChange={(value: any) => handleFieldChange('bantNeed', value)}
                description="Clear need for our services"
              />

              <BANTSwitch
                label="Timeline"
                value={formData.bantTimeline}
                onValueChange={(value: any) => handleFieldChange('bantTimeline', value)}
                description="Defined implementation timeline"
              />
            </View>

            {/* Location & Business Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Location & Business</ThemedText>

              <EnhancedPicker
                label="Territory"
                value={formData.territoryId !== null ? String(formData.territoryId) : ''}
                onValueChange={(value: string | number | null) => {
                  const numValue = value && value !== '' ? Number(value) : null;
                  handleFieldChange('territoryId', numValue);
                }}
                items={[
                  { label: 'Select territory', value: '' },
                  ...territories.map((territory) => ({
                    label: `${territory.territoryName} (${territory.countyName})`,
                    value: String(territory.id),
                  })),
                ]}
                placeholder="Select territory"
                error={formErrors.territoryId}
                isRequired={true}
              />

              <TextInputField
                label="Town/Area"
                isRequired={true}
                value={formData.town}
                onChangeText={(text: any) => handleFieldChange('town', text)}
                placeholder="Enter town name"
                error={formErrors.town}
              />

              <TextInputField
                label="Street"
                isRequired={true}
                value={formData.street}
                onChangeText={(text: any) => handleFieldChange('street', text)}
                placeholder="Enter street name"
                error={formErrors.street}
              />

              <TextInputField
                label="Building"
                isRequired={true}
                value={formData.building}
                onChangeText={(text: any) => handleFieldChange('building', text)}
                placeholder="Enter building name"
                error={formErrors.building}
              />

              <TextInputField
                label="Services Needed"
                value={formData.servicesNeeded}
                onChangeText={(text: any) => handleFieldChange('servicesNeeded', text)}
                placeholder="Describe services needed"
                multiline={true}
                numberOfLines={3}
                error={formErrors.servicesNeeded}
              />
            </View>

            {locationLoading ? (
              <View style={styles.locationLoadingCard}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <ThemedText style={styles.locationLoadingText}>
                  Acquiring location...
                </ThemedText>
              </View>
            ) : location ? (
              <GPSIndicator location={location} />
            ) : null}

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View style={styles.submitButtonContent}>
                    <ActivityIndicator size="small" color="white" />
                    <ThemedText style={styles.submitButtonText}>
                      Registering...
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.submitButtonText}>
                    Register Client
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  locationLoadingCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  locationLoadingText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 52,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});