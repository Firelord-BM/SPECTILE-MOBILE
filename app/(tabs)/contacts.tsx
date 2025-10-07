import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import { useContactStore } from '@/store/useContactStore';
import { router } from 'expo-router';
import { Clock, MapPin, Phone, Plus, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ContactsScreen() {
  const { contacts, loadContacts } = useContactStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ color: 'white' }}>
          Contacts
        </ThemedText>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color={theme.colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.textLight}
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/contact-form')}
          >
            <Plus size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Contact List */}
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredContacts.map(contact => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => router.push({
                pathname: '/contact-detail',
                params: { id: contact.syncId }
              })}
            >
              <View style={styles.contactHeader}>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactName}>{contact.name}</ThemedText>
                  <View style={[
                    styles.stageBadge,
                    { backgroundColor: contact.stage === 'Customer' ? theme.colors.success : theme.colors.warning }
                  ]}>
                    <ThemedText style={styles.stageText}>{contact.stage}</ThemedText>
                  </View>
                </View>
                <MapPin size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.contactDetails}>
                <View style={styles.detailRow}>
                  <Phone size={14} color={theme.colors.textLight} />
                  <ThemedText style={styles.detailText}>{contact.phone}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color={theme.colors.textLight} />
                  <ThemedText style={styles.detailText}>{contact.lastActivity}</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
    paddingTop: 60,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 100,
  },
  contactCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  stageText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  contactDetails: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
});