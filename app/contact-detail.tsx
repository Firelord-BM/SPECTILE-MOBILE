import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import { Contact, useContactStore } from '@/store/useContactStore';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Mail, MapPin, Phone } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getContactById } = useContactStore();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (id) {
      const foundContact = getContactById(id);
      if (foundContact) {
        setContact(foundContact);
      }
    }
  }, [id]);

  if (!contact) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Contact not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: contact.name,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: 'white',
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Location Info */}
          <View style={styles.infoCard}>
            <View style={styles.locationRow}>
              <MapPin size={16} color={theme.colors.primary} />
              <ThemedText style={styles.locationText}>
                Location: {contact.location.latitude.toFixed(4)}, {contact.location.longitude.toFixed(4)}
              </ThemedText>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              >
                <Phone size={16} color="white" />
                <ThemedText style={styles.buttonText}>Call</ThemedText>
              </TouchableOpacity>

              {contact.email && (
                <TouchableOpacity
                  style={styles.emailButton}
                  onPress={() => Linking.openURL(`mailto:${contact.email}`)}
                >
                  <Mail size={16} color={theme.colors.primary} />
                  <ThemedText style={styles.emailButtonText}>Email</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => router.push('/order-form')}
            >
              <ThemedText style={styles.buttonText}>Create Order</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push('/activity-form')}
            >
              <ThemedText style={styles.secondaryActionText}>Log Activity</ThemedText>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.textLight,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  callButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emailButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  emailButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});