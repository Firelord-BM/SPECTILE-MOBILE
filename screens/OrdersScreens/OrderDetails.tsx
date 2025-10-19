import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { theme } from "@/constants/theme";
import { Order } from "@/types";
import { ChevronLeft, MapPin } from 'lucide-react-native';
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
}

export default function OrderDetails({ order, onBack }: OrderDetailsProps) {
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

  return (
    <View style={styles.screen}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>{order.orderNumber}</ThemedText>
          <Text style={styles.headerSubtitle}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order.status) }]} />
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>Order Status</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(order.status) }]}>
              {order.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{order.clientName}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{order.clientPhone}</Text>
            </View>
            {order.clientEmail && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{order.clientEmail}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemContent}>
                {item.primaryImageUrl && (
                  <Image 
                    source={{ uri: item.primaryImageUrl }} 
                    style={styles.itemImage}
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} × KES {item.unitPrice.toLocaleString()}
                  </Text>
                  {item.taxPercentage && item.taxPercentage > 0 && (
                    <Text style={styles.itemTax}>
                      Tax ({item.taxPercentage}%): KES {item.taxAmount.toLocaleString()}
                    </Text>
                  )}
                </View>
                <Text style={styles.itemTotal}>
                  KES {item.total.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Method</Text>
              <Text style={styles.infoValue}>
                {order.paymentMethod.replace('_', ' ')}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[
                styles.infoValue,
                order.paymentStatus === 'PAID' && styles.paymentPaid
              ]}>
                {order.paymentStatus}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timing</Text>
              <Text style={styles.infoValue}>
                {order.paymentTiming === 'now' ? 'Paid Now' : 'Pay Later'}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        {order.delivery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Delivery Number</Text>
                <Text style={styles.infoValue}>{order.delivery.deliveryNumber}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{order.delivery.status}</Text>
              </View>
              {order.delivery.deliveryAddress && (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <MapPin size={16} color={theme.colors.textLight} />
                    <Text style={[styles.infoValue, { flex: 1, marginLeft: 8 }]}>
                      {order.delivery.deliveryAddress}
                    </Text>
                  </View>
                </>
              )}
              {order.delivery.deliveryAgentName && (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Agent</Text>
                    <Text style={styles.infoValue}>{order.delivery.deliveryAgentName}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                KES {order.subtotal.toLocaleString()}
              </Text>
            </View>
            {order.taxAmount > 0 && (
              <>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>
                    KES {order.taxAmount.toLocaleString()}
                  </Text>
                </View>
              </>
            )}
            {order.discountAmount > 0 && (
              <>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                    -KES {order.discountAmount.toLocaleString()}
                  </Text>
                </View>
              </>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Total</Text>
              <Text style={styles.summaryTotal}>
                KES {order.totalAmount.toLocaleString()}
              </Text>
            </View>
            {order.paidAmount > 0 && (
              <>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Paid</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                    KES {order.paidAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Balance</Text>
                  <Text style={styles.summaryValue}>
                    KES {(order.totalAmount - order.paidAmount).toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 40,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  statusCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'right',
  },
  paymentPaid: {
    color: theme.colors.success,
  },
  infoDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  itemCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  itemTax: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  summaryTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  notesCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});