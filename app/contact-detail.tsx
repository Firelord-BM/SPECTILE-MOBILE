import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import ContactDetailScreen from '@/screens/ClientDetailScreen';
import { Contact, useContactStore } from '@/store/useContactStore';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ContactDetailPage() {
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
    <ThemedView style={styles.container}>
       <View style={styles.header}>
                  <ThemedText type="title" style={{ color: 'white' }}>
                    Contact Details
                  </ThemedText>
                </View>
                <ContactDetailScreen/>
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