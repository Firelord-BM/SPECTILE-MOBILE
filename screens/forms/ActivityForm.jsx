import { Picker } from '@react-native-picker/picker';
import { CheckCircle, MapPin, ShoppingCart } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useActivityStore } from '../../store/useActivityStore';
import { useContactStore } from '../../store/useContactStore';
import { getCurrentLocation } from '../../utils/location';
import { theme } from '../../utils/theme';

export default function ActivityForm({ navigation }) {
  const { addActivity } = useActivityStore();
  const { contacts } = useContactStore();
  const [formData, setFormData] = useState({
    type: 'Product Demo',
    contactSyncId: '',
    outcome: '',
    notes: '',
  });
  const [location, setLocation] = useState(null);
  const [showOrderPrompt, setShowOrderPrompt] = useState(false);

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (formData.outcome === 'Order Placed') {
      setShowOrderPrompt(true);
    } else {
      setShowOrderPrompt(false);
    }
  }, [formData.outcome]);

  const loadLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (error) {
      Alert.alert('Location Error', 'Could not get your location');
    }
  };

  const handleSubmit = async () => {
    try {
      const activity = await addActivity(formData);
      
      if (formData.outcome === 'Order Placed') {
        // Navigate to order form with pre-filled data
        Alert.alert(
          'Activity Logged!',
          'Would you like to create the order now?',
          [
            { text: 'Later', onPress: () => navigation.goBack() },
            {
              text: 'Create Order',
              onPress: () => navigation.navigate('OrderForm', {
                prefilledContact: formData.contactSyncId,
                sourceActivity: activity.syncId,
              })
            }
          ]
        );
      } else {
        Alert.alert('Success', 'Activity logged successfully!');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log activity');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* GPS Location */}
      {location && (
        <View style={styles.locationCard}>
          <MapPin size={20} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle}>Activity Location</Text>
            <Text style={styles.locationText}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </View>
          <CheckCircle size={20} color={theme.colors.success} />
        </View>
      )}

      {/* Activity Type */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Activity Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <Picker.Item label="Product Demo" value="Product Demo" />
            <Picker.Item label="Meeting" value="Meeting" />
            <Picker.Item label="Phone Call" value="Phone Call" />
            <Picker.Item label="Site Visit" value="Site Visit" />
            <Picker.Item label="Promotion" value="Promotion" />
            <Picker.Item label="BI Sourcing" value="BI Sourcing" />
          </Picker>
        </View>
      </View>

      {/* Contact Selection */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.contactSyncId}
            onValueChange={(value) => setFormData({ ...formData, contactSyncId: value })}
          >
            <Picker.Item label="Select Contact" value="" />
            {contacts.map(contact => (
              <Picker.Item key={contact.syncId} label={contact.name} value={contact.syncId} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Activity notes..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Outcome */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Outcome</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.outcome}
            onValueChange={(value) => setFormData({ ...formData, outcome: value })}
          >
            <Picker.Item label="Select Outcome" value="" />
            <Picker.Item label="Interested" value="Interested" />
            <Picker.Item label="Not Interested" value="Not Interested" />
            <Picker.Item label="Follow-up Required" value="Follow-up Required" />
            <Picker.Item label="Order Placed" value="Order Placed" />
            <Picker.Item label="Quote Requested" value="Quote Requested" />
          </Picker>
        </View>
      </View>

      {/* Order Placed Prompt */}
      {showOrderPrompt && (
        <View style={styles.orderPrompt}>
          <ShoppingCart size={24} color={theme.colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.orderPromptTitle}>Great! 🎉</Text>
            <Text style={styles.orderPromptText}>
              You'll be able to create the order after logging this activity
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Log Activity</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  locationCard: {
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
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  locationText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  orderPrompt: {
    backgroundColor: theme.colors.success + '20',
    borderColor: theme.colors.success,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  orderPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.success,
  },
  orderPromptText: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});