import { theme } from "@/constants/theme";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function CartReview({ cart, selectedClient, onUpdateQuantity, onRemove, onCheckout, onBack }:any) {
  const total = cart.reduce((sum: number, item: { price: number; quantity: number; }) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.screen}>
      <View style={styles.modernHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.modernHeaderTitle}>Cart</Text>
      </View>

      <ScrollView contentContainerStyle={styles.cartContent}>
        <View style={styles.cartClientInfo}>
          <Text style={styles.cartClientLabel}>Customer</Text>
          <Text style={styles.cartClientName}>{selectedClient?.name}</Text>
        </View>

        {cart.map((item: { id: React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; price: { toLocaleString: () => string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }; quantity: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
          <View key={item.id} style={styles.cartItemCard}>
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName}>{item.name}</Text>
              <Text style={styles.cartItemPrice}>KES {item.price.toLocaleString()}</Text>
            </View>
            <View style={styles.cartItemActions}>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Text style={styles.quantityBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Text style={styles.quantityBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.cartTotal}>
          <Text style={styles.cartTotalLabel}>Total</Text>
          <Text style={styles.cartTotalAmount}>KES {total.toLocaleString()}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout} activeOpacity={0.9}>
        <Text style={styles.checkoutButtonText}>Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
screen: {
    flex: 1,
  },
  modernHeader: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 40,
    paddingBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modernHeaderTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  checkoutContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  checkoutSection: {
    marginBottom: theme.spacing.xl,
  },
  checkoutSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paymentTimingContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  paymentTimingBtn: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  paymentTimingBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  paymentTimingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentTimingTextActive: {
    color: theme.colors.background,
  },
  paymentMethodBtn: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
    backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: 28,
    color: theme.colors.text,
  },

  cartContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  cartClientInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cartClientLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cartClientName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cartItemCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cartItemInfo: {
    marginBottom: theme.spacing.md,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  cartItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: '300',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
  },
  removeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  cartTotal: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  cartTotalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cartTotalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.background,
  },

  // Checkout Button
  checkoutButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
  },
})