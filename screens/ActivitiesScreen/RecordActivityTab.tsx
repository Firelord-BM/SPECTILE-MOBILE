import { theme } from '@/constants/theme';
import { useActivityStore } from '@/store/useActivityStore';
import { getCurrentLocation, LocationData } from '@/utils/location';
import NetInfo from '@react-native-community/netinfo';
import { CheckCircle, ChevronDown, MapPin, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const activityTypes = [
  'Product Demo',
  'Meeting',
  'Phone Call',
  'Site Visit',
  'Promotion',
  'BI Sourcing',
  'Follow-up',
  'Training',
  'Consultation',
];

export default function RecordActivityTab() {
  const { addActivity, isOnline, isSyncing, setOnlineStatus, syncActivities } = useActivityStore();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activityType: 'Product Demo',
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    loadLocation();
    checkNetworkStatus();

    // Listen to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnlineStatus(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const checkNetworkStatus = async () => {
    const state = await NetInfo.fetch();
    setOnlineStatus(state.isConnected ?? false);
  };

  const loadLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Access',
        'Location permission is required to log activities. Using default location.',
        [{ text: 'OK' }]
      );
      setLocation({
        latitude: -1.286389,
        longitude: 36.817223,
        accuracy: null,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.contactPerson) {
      Alert.alert('Validation Error', 'Business name and contact person are required');
      return;
    }

    setLoading(true);

    try {
      await addActivity({
        ...formData,
        location,
        timestamp: new Date().toISOString(),
      });
      
      Alert.alert(
        'Success', 
        isOnline 
          ? 'Activity logged and synced successfully!' 
          : 'Activity saved locally. Will sync when online.',
        [{ text: 'OK' }]
      );
      
      // Reset form
      setFormData({
        activityType: 'Product Demo',
        businessName: '',
        contactPerson: '',
        email: '',
        phone: '',
        notes: '',
      });

      // Reload location for next activity
      loadLocation();
    } catch (error) {
      console.error('Failed to log activity:', error);
      Alert.alert('Error', 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }

    try {
      await syncActivities();
      Alert.alert('Success', 'Activities synced successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync activities');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Online Status Banner */}
      <View style={[styles.statusBanner, isOnline ? styles.onlineBanner : styles.offlineBanner]}>
        {isOnline ? (
          <Wifi size={16} color="#10B981" />
        ) : (
          <WifiOff size={16} color="#EF4444" />
        )}
        <Text style={[styles.statusText, isOnline ? styles.onlineText : styles.offlineText]}>
          {isOnline ? 'Online' : 'Offline - Activities will sync when online'}
        </Text>
        {isOnline && (
          <TouchableOpacity onPress={handleManualSync} disabled={isSyncing} style={styles.syncButton}>
            {isSyncing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <RefreshCw size={16} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Activity Type Dropdown */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Activity Type *</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.pickerButtonText}>{formData.activityType}</Text>
          <ChevronDown size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.businessName}
          onChangeText={(text) => setFormData({ ...formData, businessName: text })}
          placeholder="Enter business name"
          placeholderTextColor={theme.colors.textSecondary}
          editable={!loading}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Person *</Text>
        <TextInput
          style={styles.input}
          value={formData.contactPerson}
          onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
          placeholder="Enter contact person name"
          placeholderTextColor={theme.colors.textSecondary}
          editable={!loading}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="email@example.com"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="+254 712 345 678"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
          editable={!loading}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Activity notes and observations..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      {location && (
        <View style={styles.locationCard}>
          <MapPin size={20} color={theme.colors.primary} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Activity Location</Text>
            <Text style={styles.locationText}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            {location.accuracy && (
              <Text style={styles.accuracyText}>
                Accuracy: ±{location.accuracy.toFixed(0)}m
              </Text>
            )}
          </View>
          <CheckCircle size={20} color={theme.colors.success} />
        </View>
      )}

      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitButtonText}>Logging Activity...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Log Activity</Text>
        )}
      </TouchableOpacity>

      {/* Activity Type Modal */}
      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Activity Type</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {activityTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.option,
                    formData.activityType === type && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, activityType: type });
                    setPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.activityType === type && styles.selectedOptionText,
                    ]}
                  >
                    {type}
                  </Text>
                  {formData.activityType === type && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  onlineBanner: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  offlineBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  onlineText: {
    color: '#065F46',
  },
  offlineText: {
    color: '#991B1B',
  },
  syncButton: {
    padding: theme.spacing.xs,
  },
  locationCard: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  locationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  accuracyText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pickerButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  pickerButtonText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    paddingTop: theme.spacing.md,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.primary + '80',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    fontSize: 32,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  option: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: theme.colors.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});