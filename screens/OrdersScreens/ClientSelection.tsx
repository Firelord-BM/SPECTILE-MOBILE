import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { theme } from "@/constants/theme";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Building2, MapPin, Search, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const API_BASE_URL = 'https://api.spectile.co.ke/api';

interface Client {
  id: number;
  syncId: string;
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  email?: string;
  territoryName: string;
  countyName: string;
  subCountyName?: string;
  businessTypeName: string;
  bantScore: number;
  qualificationStatus: boolean;
  stage: string;
  latitude: number;
  longitude: number;
}

interface ClientSelectionProps {
  onSelectClient: (client: any) => void;
  onBack?: () => void;
}

export default function ClientSelection({ onSelectClient, onBack }: ClientSelectionProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filterClients = () => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(client =>
      client.businessName.toLowerCase().includes(query) ||
      client.ownerName.toLowerCase().includes(query) ||
      client.phoneNumber.includes(query)
    );
    setFilteredClients(filtered);
  };

  const handleSelectClient = (client: Client) => {
    // Format client data for order creation
    const formattedClient = {
      id: client.id,
      name: client.businessName,
      ownerName: client.ownerName,
      phone: client.phoneNumber,
      email: client.email,
      territory: client.territoryName,
      county: client.countyName,
      businessType: client.businessTypeName,
      latitude: client.latitude,
      longitude: client.longitude,
      syncId: client.syncId
    };
    onSelectClient(formattedClient);
  };

  return (
    <View style={styles.screen}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ color: 'white' }}>
          Select Customer
        </ThemedText>
      </ThemedView>

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading clients...</ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.clientsList}>
          {/* Default Customer */}
          <TouchableOpacity
            style={styles.defaultClientCard}
            onPress={() => onSelectClient({ 
              id: 'default', 
              name: 'Default Customer',
              isDefault: true 
            })}
            activeOpacity={0.7}
          >
            <View style={styles.clientCardContent}>
              <View style={styles.defaultClientIcon}>
                <Text style={styles.defaultClientIconText}>👤</Text>
              </View>
              <View style={styles.clientTextContainer}>
                <Text style={styles.defaultClientName}>Default Customer</Text>
                <Text style={styles.clientSubtext}>Walk-in Customer</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              Registered Clients ({filteredClients.length})
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Registered Clients */}
          {filteredClients.length === 0 ? (
            <View style={styles.emptyState}>
              <Building2 size={48} color={theme.colors.border} />
              <ThemedText style={styles.emptyStateText}>
                {searchQuery ? 'No clients found' : 'No registered clients yet'}
              </ThemedText>
            </View>
          ) : (
            filteredClients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientCard}
                onPress={() => handleSelectClient(client)}
                activeOpacity={0.7}
              >
                <View style={styles.clientCardContent}>
                  <View style={styles.clientInitialContainer}>
                    <Building2 size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.clientTextContainer}>
                    <View style={styles.clientNameRow}>
                      <ThemedText style={styles.clientNameText}>
                        {client.businessName}
                      </ThemedText>
                      {client.qualificationStatus && (
                        <View style={styles.qualifiedBadge}>
                          <ThemedText style={styles.qualifiedBadgeText}>
                            Qualified
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={styles.clientInfoRow}>
                      <User size={12} color={theme.colors.textLight} />
                      <ThemedText style={styles.clientPhoneText}>
                        {client.ownerName}
                      </ThemedText>
                    </View>
                    <View style={styles.clientInfoRow}>
                      <MapPin size={12} color={theme.colors.textLight} />
                      <ThemedText style={styles.clientPhoneText} numberOfLines={1}>
                        {client.territoryName}, {client.countyName}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowText}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    paddingTop: 40,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textLight,
  },
  clientsList: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  defaultClientCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  clientCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  clientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultClientIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  defaultClientIconText: {
    fontSize: 24,
  },
  defaultClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  clientInitialContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  clientTextContainer: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  clientNameText: {
    fontSize: 16,
    fontWeight: '600',
  },
  qualifiedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualifiedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  clientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  clientSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  clientPhoneText: {
    fontSize: 13,
    color: theme.colors.textLight,
    flex: 1,
  },
  arrowContainer: {
    marginLeft: theme.spacing.sm,
  },
  arrowText: {
    fontSize: 28,
    color: theme.colors.textLight,
    fontWeight: '300',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
});