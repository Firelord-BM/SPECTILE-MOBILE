import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { theme } from "@/constants/theme";
import apiService from "@/services/api.service";
import { Order } from "@/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface OrdersListProps {
  onNewOrder: () => void;
  onOrderSelect?: (order: Order) => void;
}

export default function OrdersList({ onNewOrder, onOrderSelect }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (pageNum = 0, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiService.getOrders({ page: pageNum, size: 20 });
      const data = response.data;

      if (refresh || pageNum === 0) {
        setOrders(data.content);
      } else {
        setOrders(prev => [...prev, ...data.content]);
      }

      setHasMore(!data.last);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadOrders(0, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadOrders(page + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return theme.colors.success;
      case 'DISPATCHED':
      case 'READY_FOR_DELIVERY': return '#F59E0B';
      case 'PENDING':
      case 'PROCESSING': return theme.colors.accent;
      case 'CANCELLED': return '#EF4444';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ');
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.modernOrderCard}
      onPress={() => onOrderSelect?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.orderCardHeader}>
        <Text style={styles.orderIdText}>{item.orderNumber}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.orderCustomerText}>{item.clientName}</Text>
      <View style={styles.orderCardFooter}>
        <Text style={styles.orderAmountText}>
          KES {item.totalAmount.toLocaleString()}
        </Text>
        <Text style={styles.orderDateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {item.paymentStatus && (
        <View style={styles.paymentStatusContainer}>
          <Text style={styles.paymentStatusLabel}>Payment: </Text>
          <Text style={[
            styles.paymentStatusText,
            item.paymentStatus === 'PAID' && styles.paymentStatusPaid
          ]}>
            {item.paymentStatus}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ color: 'white' }}>Orders</ThemedText>
      </ThemedView>

      {loading && page === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ordersList}
          renderItem={renderOrder}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListFooterComponent={
            loading && page > 0 ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No orders yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to create your first order
              </Text>
            </View>
          }
        />
      )}

      <FloatingActionButton onPress={onNewOrder} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordersList: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  modernOrderCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderCustomerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmountText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  orderDateText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  paymentStatusLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    textTransform: 'capitalize',
  },
  paymentStatusPaid: {
    color: theme.colors.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
});