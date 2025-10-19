import { theme } from "@/constants/theme";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CartModal({ visible, cart, selectedClient, onUpdateQuantity, onRemove, onCheckout, onClose }: any) {
  const total = cart.reduce((sum: number, item: { price: number; quantity: number; }) => sum + item.price * item.quantity, 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cart Review</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.cartClientInfo}>
              <Text style={styles.cartClientLabel}>Customer</Text>
              <Text style={styles.cartClientName}>{selectedClient?.name}</Text>
            </View>

            {cart.map((item: any) => (
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

          <TouchableOpacity 
            style={styles.checkoutButton} 
            onPress={onCheckout} 
            activeOpacity={0.9}
            disabled={cart.length === 0}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  modalContent: {
    padding: theme.spacing.lg,
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
    justifyContent:'space-between',
    flexDirection:'row'
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
  checkoutButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
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
});