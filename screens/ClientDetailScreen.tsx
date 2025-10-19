import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  Award,
  Building2,
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const API_BASE_URL = 'https://api.spectile.co.ke/api';

interface Client {
  id: number;
  syncId: string;
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  email?: string;
  kraPin?: string;
  businessTypeName: string;
  territoryName: string;
  countyName: string;
  subCountyName?: string;
  town: string;
  street: string;
  building: string;
  servicesNeeded?: string;
  stage: string;
  latitude: number;
  longitude: number;
  locationTimestamp: string;
  bantBudget: boolean;
  bantAuthority: boolean;
  bantNeed: boolean;
  bantTimeline: boolean;
  bantScore: number;
  qualificationStatus: boolean;
  registeredByName: string;
  createdAt: string;
  updatedAt: string;
}

const STAGE_COLORS: Record<string, string> = {
  LEAD: '#6B7280',
  QUALIFIED: '#3B82F6',
  PROPOSAL: '#8B5CF6',
  NEGOTIATION: '#F59E0B',
  CLOSED_WON: '#10B981',
  CLOSED_LOST: '#EF4444'
};

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }

      const result = await response.json();
      setClient(result.data);
    } catch (error) {
      console.error('Failed to fetch client:', error);
      Alert.alert('Error', 'Failed to load client details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (client?.phoneNumber) {
      Linking.openURL(`tel:${client.phoneNumber}`);
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  const handleOpenMaps = () => {
    if (client) {
      const scheme = Platform.select({
        ios: 'maps:0,0?q=',
        android: 'geo:0,0?q='
      });
      const latLng = `${client.latitude},${client.longitude}`;
      const label = client.businessName;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });
      Linking.openURL(url!);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStageLabel = (stage: string): string => {
    return stage.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading client details...</ThemedText>
      </ThemedView>
    );
  }

  if (!client) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>Client not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: client.businessName,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: 'white',
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push(`/edit-client/${client.id}`)}
            >
              <Edit size={20} color="white" />
            </TouchableOpacity>
          )
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.businessIconContainer}>
              <Building2 size={32} color={theme.colors.primary} />
            </View>
            <ThemedText style={styles.businessName}>
              {client.businessName}
            </ThemedText>
            <View style={styles.ownerRow}>
              <User size={14} color={theme.colors.textLight} />
              <ThemedText style={styles.ownerName}>
                {client.ownerName}
              </ThemedText>
            </View>
            <View
              style={[
                styles.stageBadgeLarge,
                { backgroundColor: STAGE_COLORS[client.stage] || '#6B7280' }
              ]}
            >
              <ThemedText style={styles.stageBadgeText}>
                {getStageLabel(client.stage)}
              </ThemedText>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Phone size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Call</ThemedText>
            </TouchableOpacity>
            {client.email && (
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleEmail}>
                <Mail size={20} color={theme.colors.primary} />
                <ThemedText style={styles.actionButtonSecondaryText}>Email</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleOpenMaps}>
              <MapPin size={20} color={theme.colors.primary} />
              <ThemedText style={styles.actionButtonSecondaryText}>Maps</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
            <View style={styles.infoRow}>
              <Phone size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Phone Number</ThemedText>
                <ThemedText style={styles.infoValue}>{client.phoneNumber}</ThemedText>
              </View>
            </View>
            {client.email && (
              <View style={styles.infoRow}>
                <Mail size={16} color={theme.colors.textLight} />
                <View style={styles.infoContent}>
                  <ThemedText style={styles.infoLabel}>Email</ThemedText>
                  <ThemedText style={styles.infoValue}>{client.email}</ThemedText>
                </View>
              </View>
            )}
            {client.kraPin && (
              <View style={styles.infoRow}>
                <TrendingUp size={16} color={theme.colors.textLight} />
                <View style={styles.infoContent}>
                  <ThemedText style={styles.infoLabel}>KRA PIN</ThemedText>
                  <ThemedText style={styles.infoValue}>{client.kraPin}</ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* Business Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Business Information</ThemedText>
            <View style={styles.infoRow}>
              <Building2 size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Business Type</ThemedText>
                <ThemedText style={styles.infoValue}>{client.businessTypeName}</ThemedText>
              </View>
            </View>
            {client.servicesNeeded && (
              <View style={styles.infoRow}>
                <TrendingUp size={16} color={theme.colors.textLight} />
                <View style={styles.infoContent}>
                  <ThemedText style={styles.infoLabel}>Services Needed</ThemedText>
                  <ThemedText style={styles.infoValue}>{client.servicesNeeded}</ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* Location Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Location</ThemedText>
            <View style={styles.infoRow}>
              <MapPin size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Territory</ThemedText>
                <ThemedText style={styles.infoValue}>{client.territoryName}</ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>County</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {client.countyName}
                  {client.subCountyName && ` - ${client.subCountyName}`}
                </ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Address</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {client.building}, {client.street}, {client.town}
                </ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>GPS Coordinates</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {client.latitude.toFixed(6)}, {client.longitude.toFixed(6)}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* BANT Qualification */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>BANT Qualification</ThemedText>
              <View style={styles.bantScoreBadge}>
                <Award size={16} color="white" />
                <ThemedText style={styles.bantScoreText}>{client.bantScore}/4</ThemedText>
              </View>
            </View>
            <View style={styles.bantGrid}>
              <View style={[styles.bantItem, client.bantBudget && styles.bantItemActive]}>
                <View style={[styles.bantCheckbox, client.bantBudget && styles.bantCheckboxActive]}>
                  {client.bantBudget && <ThemedText style={styles.bantCheckmark}>✓</ThemedText>}
                </View>
                <ThemedText style={[styles.bantLabel, client.bantBudget && styles.bantLabelActive]}>
                  Budget
                </ThemedText>
              </View>
              <View style={[styles.bantItem, client.bantAuthority && styles.bantItemActive]}>
                <View style={[styles.bantCheckbox, client.bantAuthority && styles.bantCheckboxActive]}>
                  {client.bantAuthority && <ThemedText style={styles.bantCheckmark}>✓</ThemedText>}
                </View>
                <ThemedText style={[styles.bantLabel, client.bantAuthority && styles.bantLabelActive]}>
                  Authority
                </ThemedText>
              </View>
              <View style={[styles.bantItem, client.bantNeed && styles.bantItemActive]}>
                <View style={[styles.bantCheckbox, client.bantNeed && styles.bantCheckboxActive]}>
                  {client.bantNeed && <ThemedText style={styles.bantCheckmark}>✓</ThemedText>}
                </View>
                <ThemedText style={[styles.bantLabel, client.bantNeed && styles.bantLabelActive]}>
                  Need
                </ThemedText>
              </View>
              <View style={[styles.bantItem, client.bantTimeline && styles.bantItemActive]}>
                <View style={[styles.bantCheckbox, client.bantTimeline && styles.bantCheckboxActive]}>
                  {client.bantTimeline && <ThemedText style={styles.bantCheckmark}>✓</ThemedText>}
                </View>
                <ThemedText style={[styles.bantLabel, client.bantTimeline && styles.bantLabelActive]}>
                  Timeline
                </ThemedText>
              </View>
            </View>
            <View style={[
              styles.qualificationBadge,
              client.qualificationStatus ? styles.qualifiedBadge : styles.notQualifiedBadge
            ]}>
              <ThemedText style={styles.qualificationText}>
                {client.qualificationStatus ? '✓ Qualified Lead' : '○ Not Qualified'}
              </ThemedText>
            </View>
          </View>

          {/* Registration Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Registration Details</ThemedText>
            <View style={styles.infoRow}>
              <User size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Registered By</ThemedText>
                <ThemedText style={styles.infoValue}>{client.registeredByName}</ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Created At</ThemedText>
                <ThemedText style={styles.infoValue}>{formatDate(client.createdAt)}</ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Last Updated</ThemedText>
                <ThemedText style={styles.infoValue}>{formatDate(client.updatedAt)}</ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <TrendingUp size={16} color={theme.colors.textLight} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Sync ID</ThemedText>
                <ThemedText style={[styles.infoValue, styles.syncId]}>
                  {client.syncId}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => router.push('/order-form')}
            >
              <ThemedText style={styles.primaryActionButtonText}>Create Order</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => router.push('/activity-form')}
            >
              <ThemedText style={styles.secondaryActionButtonText}>Log Activity</ThemedText>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  headerButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  businessIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  businessName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  ownerName: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  stageBadgeLarge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  actionButtonSecondaryText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncId: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bantScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: 6,
  },
  bantScoreText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  bantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  bantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  bantItemActive: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  bantCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bantCheckboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  bantCheckmark: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  bantLabel: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  bantLabelActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  qualificationBadge: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  qualifiedBadge: {
    backgroundColor: '#D1FAE5',
  },
  notQualifiedBadge: {
    backgroundColor: '#FEF3C7',
  },
  qualificationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickActionsSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryActionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  primaryActionButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryActionButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  secondaryActionButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});