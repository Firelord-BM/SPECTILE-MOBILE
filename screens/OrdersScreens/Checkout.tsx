import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { theme } from "@/constants/theme";
import apiService from "@/services/api.service";
import { CreateOrderRequest } from "@/types";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface CheckoutProps {
  cart: any[];
  selectedClient: any;
  onComplete: (order: any) => void;
  onBack: () => void;
}

export default function Checkout({ cart, selectedClient, onComplete, onBack }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [paymentTiming, setPaymentTiming] = useState('now');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => {
    const itemSubtotal = item.price * item.quantity;
    return sum + itemSubtotal;
  }, 0);

  const taxAmount = cart.reduce((sum, item) => {
    const itemSubtotal = item.price * item.quantity;
    const itemTax = item.taxPercentage 
      ? (itemSubtotal * item.taxPercentage / 100) 
      : 0;
    return sum + itemTax;
  }, 0);

  const total = subtotal + taxAmount;

  const handleCompleteOrder = async () => {
    try {
      setLoading(true);

      const orderData: CreateOrderRequest = {
        clientId: selectedClient?.id !== 'default' ? selectedClient?.id : undefined,
        clientName: selectedClient?.id === 'default' ? 'Default Customer' : selectedClient?.name,
        clientPhone: selectedClient?.phone || selectedClient?.phoneNumber,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod: paymentMethod,
        paymentTiming: paymentTiming,
      };

      const response = await apiService.createOrder(orderData);
      
      Alert.alert(
        'Success',
        `Order ${response.data.orderNumber} created successfully!`,
        [
          {
            text: 'OK',
            onPress: () => onComplete(response.data),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to create order:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer</Text>
              <Text style={styles.summaryValue}>{selectedClient?.name}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{cart.length} products</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>KES {subtotal.toLocaleString()}</Text>
            </View>
            {taxAmount > 0 && (
              <>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>KES {taxAmount.toLocaleString()}</Text>
                </View>
              </>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Total Amount</Text>
              <Text style={styles.summaryTotal}>KES {total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Cart Items Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.itemPreview}>
              <View style={styles.itemPreviewInfo}>
                <Text style={styles.itemPreviewName}>{item.name}</Text>
                <Text style={styles.itemPreviewDetails}>
                  {item.quantity} × KES {item.price.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.itemPreviewTotal}>
                KES {(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Timing</Text>
          <View style={styles.paymentTimingContainer}>
            <TouchableOpacity
              style={[
                styles.paymentTimingBtn,
                paymentTiming === 'now' && styles.paymentTimingBtnActive,
              ]}
              onPress={() => setPaymentTiming('now')}
            >
              <Text
                style={[
                  styles.paymentTimingText,
                  paymentTiming === 'now' && styles.paymentTimingTextActive,
                ]}
              >
                Pay Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentTimingBtn,
                paymentTiming === 'later' && styles.paymentTimingBtnActive,
              ]}
              onPress={() => setPaymentTiming('later')}
            >
              <Text
                style={[
                  styles.paymentTimingText,
                  paymentTiming === 'later' && styles.paymentTimingTextActive,
                ]}
              >
                Pay Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodContainer}>
            {['MPESA', 'CASH', 'BANK_TRANSFER'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentMethodBtn,
                  paymentMethod === method && styles.paymentMethodBtnActive,
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === method && styles.paymentMethodTextActive,
                  ]}
                >
                  {method.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, loading && styles.completeButtonDisabled]}
          onPress={handleCompleteOrder}
          activeOpacity={0.9}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.completeButtonText}>Complete Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 40,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
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
    fontWeight: '600',
    color: theme.colors.text,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  itemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemPreviewInfo: {
    flex: 1,
  },
  itemPreviewName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemPreviewDetails: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  itemPreviewTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentTimingContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paymentTimingBtn: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTimingBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentTimingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentTimingTextActive: {
    color: theme.colors.background,
    fontWeight: '700',
  },
  paymentMethodContainer: {
    gap: theme.spacing.sm,
  },
  paymentMethodBtn: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentMethodTextActive: {
    color: theme.colors.background,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: 24,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
});