import { FloatingActionButton } from '@/components/common/FloatingActionButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { Building2, MapPin, Phone, Plus, Search, TrendingUp, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
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
  businessTypeName: string;
  territoryName: string;
  countyName: string;
  subCountyName?: string;
  town: string;
  street: string;
  building: string;
  stage: string;
  bantScore: number;
  qualificationStatus: boolean;
  registeredByName: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

const STAGE_COLORS: Record<string, string> = {
  LEAD: '#6B7280',
  QUALIFIED: '#3B82F6',
  PROPOSAL: '#8B5CF6',
  NEGOTIATION: '#F59E0B',
  CLOSED_WON: '#10B981',
  CLOSED_LOST: '#EF4444'
};

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, clients]);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/clients?size=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const result = await response.json();
      const data = result.data?.content || [];
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      Alert.alert('Error', 'Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  }, []);

  const filterClients = () => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(client =>
      client.businessName.toLowerCase().includes(query) ||
      client.ownerName.toLowerCase().includes(query) ||
      client.phoneNumber.includes(query) ||
      client.territoryName.toLowerCase().includes(query) ||
      client.countyName.toLowerCase().includes(query)
    );
    setFilteredClients(filtered);
  };

  const handleClientPress = (client: Client) => {
    router.push(`/clients/${client.id}`);
  };

  const getStageLabel = (stage: string): string => {
    return stage.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Loading clients...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Clients',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: 'white',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/register-client')}
              style={styles.headerButton}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={theme.colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients..."
              placeholderTextColor={theme.colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        {/* Clients List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.clientsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {filteredClients.length === 0 ? (
            <View style={styles.emptyState}>
              <Building2 size={64} color={theme.colors.border} />
              <ThemedText style={styles.emptyStateTitle}>
                {searchQuery ? 'No clients found' : 'No clients yet'}
              </ThemedText>
              <ThemedText style={styles.emptyStateText}>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Start by registering your first client'}
              </ThemedText>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => router.push('/register-client')}
                >
                  <Plus size={20} color="white" />
                  <ThemedText style={styles.emptyStateButtonText}>
                    Add Client
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientCard}
                onPress={() => handleClientPress(client)}
                activeOpacity={0.7}
              >
                <View style={styles.clientCardHeader}>
                  <View style={styles.clientIconContainer}>
                    <Building2 size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.clientHeaderInfo}>
                    <ThemedText style={styles.clientBusinessName}>
                      {client.businessName}
                    </ThemedText>
                    <View style={styles.clientOwnerRow}>
                      <User size={12} color={theme.colors.textLight} />
                      <ThemedText style={styles.clientOwnerName}>
                        {client.ownerName}
                      </ThemedText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.stageBadge,
                      { backgroundColor: STAGE_COLORS[client.stage] || '#6B7280' }
                    ]}
                  >
                    <ThemedText style={styles.stageBadgeText}>
                      {getStageLabel(client.stage)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.clientCardBody}>
                  <View style={styles.infoRow}>
                    <Phone size={14} color={theme.colors.textLight} />
                    <ThemedText style={styles.infoText}>
                      {client.phoneNumber}
                    </ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={14} color={theme.colors.textLight} />
                    <ThemedText style={styles.infoText} numberOfLines={1}>
                      {client.territoryName}, {client.countyName}
                    </ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <TrendingUp size={14} color={theme.colors.textLight} />
                    <ThemedText style={styles.infoText}>
                      {client.businessTypeName}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.clientCardFooter}>
                  <View style={styles.bantScoreContainer}>
                    <ThemedText style={styles.bantScoreLabel}>
                      BANT Score:
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.bantScoreValue,
                        client.qualificationStatus && styles.bantScoreQualified
                      ]}
                    >
                      {client.bantScore}/4
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.registeredByText}>
                    by {client.registeredByName}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <FloatingActionButton
         icon="person-add"
          onPress={() => router.push('/register-client')}/>
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
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  clientsList: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  clientCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clientCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  clientIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  clientHeaderInfo: {
    flex: 1,
  },
  clientBusinessName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  clientOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientOwnerName: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  stageBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  stageBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  clientCardBody: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.textLight,
    flex: 1,
  },
  clientCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bantScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bantScoreLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  bantScoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  bantScoreQualified: {
    color: '#10B981',
  },
  registeredByText: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});