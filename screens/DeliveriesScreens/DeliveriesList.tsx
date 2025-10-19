import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { theme } from "@/constants/theme";
import apiService from "@/services/api.service";
import { Delivery } from "@/types";
import { CheckCircle, MapPin, Package } from 'lucide-react-native';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DeliveriesList() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  useEffect(() => {
    loadDeliveries();
  }, [activeTab]);

  const loadDeliveries = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const status = activeTab === 'ALL' ? undefined : activeTab;
      const response = await apiService.getDeliveries({ status });
      const data = response.data;

      setDeliveries(data.content);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcknowledge = async (delivery: Delivery) => {
    try {
      Alert.alert(
        'Acknowledge Delivery',
        `Confirm delivery of ${delivery.orderNumber}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              await apiService.acknowledgeDelivery(delivery.id);
              Alert.alert('Success', 'Delivery acknowledged successfully');
              loadDeliveries(true);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to acknowledge delivery');
    }
  };

  const handleUpdateStatus = async (delivery: Delivery, newStatus: string) => {
    try {
      await apiService.updateDeliveryStatus(delivery.id, newStatus);
      Alert.alert('Success', `Delivery status updated to ${newStatus}`);
      loadDeliveries(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update delivery status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return theme.colors.success;
      case 'IN_TRANSIT':
      case 'DISPATCHED': return '#F59E0B';
      case 'ASSIGNED': return theme.colors.accent;
      case 'PENDING': return theme.colors.textSecondary;
      case 'FAILED': return '#EF4444';
      default: return theme.colors.textSecondary;
    }
  };

  const renderDelivery = ({ item }: { item: Delivery }) => (
    <View style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <View style={styles.deliveryHeaderLeft}>
          <Package size={20} color={theme.colors.primary} />
          <View style={styles.deliveryHeaderInfo}>
            <Text style={styles.deliveryNumber}>{item.deliveryNumber}</Text>
            <Text style={styles.orderNumber}>Order: {item.orderNumber}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Recipient:</Text>
          <Text style={styles.infoValue}>{item.recipientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{item.recipientPhone}</Text>
        </View>
        {item.deliveryAddress && (
          <View style={styles.addressRow}>
            <MapPin size={14} color={theme.colors.textLight} />
            <Text style={styles.addressText}>{item.deliveryAddress}</Text>
          </View>
        )}
        {item.scheduledDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Scheduled:</Text>
            <Text style={styles.infoValue}>
              {new Date(item.scheduledDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {item.status === 'DELIVERED' && !item.isAcknowledged && (
        <TouchableOpacity
          style={styles.acknowledgeButton}
          onPress={() => handleAcknowledge(item)}
        >
          <CheckCircle size={18} color="white" />
          <Text style={styles.acknowledgeButtonText}>Acknowledge Delivery</Text>
        </TouchableOpacity>
      )}

      {item.status === 'DISPATCHED' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUpdateStatus(item, 'IN_TRANSIT')}
          >
            <Text style={styles.actionButtonText}>In Transit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => handleUpdateStatus(item, 'DELIVERED')}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
              Mark Delivered
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const tabs = ['ALL', 'PENDING', 'ASSIGNED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];

  return (
    <View style={styles.screen}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ color: 'white' }}>Deliveries</ThemedText>
      </ThemedView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={tabs}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item && styles.tabActive]}
              onPress={() => setActiveTab(item)}
            >
              <Text style={[styles.tabText, activeTab === item && styles.tabTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.deliveriesList}
          renderItem={renderDelivery}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadDeliveries(true)}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package size={48} color={theme.colors.border} />
              <Text style={styles.emptyStateText}>No deliveries found</Text>
            </View>
          }
        />
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
  tabsContainer: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveriesList: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  deliveryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  deliveryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliveryHeaderInfo: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  deliveryNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  orderNumber: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deliveryInfo: {
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    gap: 6,
  },
  addressText: {
    fontSize: 12,
    color: theme.colors.textLight,
    flex: 1,
  },
  acknowledgeButton: {
    backgroundColor: theme.colors.success,
    borderRadius: 8,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acknowledgeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  actionButtonTextPrimary: {
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
});