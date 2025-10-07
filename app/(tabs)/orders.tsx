import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { MapPin, Plus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OrdersScreen() {
  const orders = [
    {
      id: 'ORD-001',
      customer: 'Acme Corp',
      amount: 45000,
      status: 'In Transit',
      source: 'Mobile App',
      date: '2025-10-03',
    },
    {
      id: 'ORD-002',
      customer: 'Tech Solutions Ltd',
      amount: 28500,
      status: 'Delivered',
      source: 'WhatsApp',
      date: '2025-10-01',
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ color: 'white' }}>
          Orders
        </ThemedText>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.newOrderButton}
          onPress={() => router.push('/order-form')}
        >
          <Plus size={18} color="white" />
          <ThemedText style={styles.newOrderText}>New Order</ThemedText>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.listContainer}>
          {orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <ThemedText style={styles.orderId}>{order.id}</ThemedText>
                  <ThemedText style={styles.orderCustomer}>{order.customer}</ThemedText>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: order.status === 'Delivered' ? theme.colors.success : theme.colors.warning }
                ]}>
                  <ThemedText style={styles.statusText}>{order.status}</ThemedText>
                </View>
              </View>
              <View style={styles.orderFooter}>
                <ThemedText style={styles.orderAmount}>
                  KES {order.amount.toLocaleString()}
                </ThemedText>
                <View style={styles.sourceContainer}>
                  <MapPin size={14} color={theme.colors.textLight} />
                  <ThemedText style={styles.sourceText}>{order.source}</ThemedText>
                </View>
              </View>
            </View>
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
  newOrderButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  newOrderText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderCustomer: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceText: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
});