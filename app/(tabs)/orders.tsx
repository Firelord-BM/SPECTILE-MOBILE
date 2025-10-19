// src/screens/OrdersScreens/ModernOrderFlow.tsx
import ToastNotification from '@/components/common/ToastNotification';
import { theme } from '@/constants/theme';
import CartModal from '@/screens/OrdersScreens/CartModal';
import Checkout from '@/screens/OrdersScreens/Checkout';
import ClientSelection from '@/screens/OrdersScreens/ClientSelection';
import OrderDetails from '@/screens/OrdersScreens/OrderDetails';
import OrdersList from '@/screens/OrdersScreens/OrdersList';
import ProductsList from '@/screens/OrdersScreens/ProductsList';
import { Order, Product } from '@/types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ModernOrderFlow() {
  const [screen, setScreen] = useState('orders');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [cartModalVisible, setCartModalVisible] = useState(false);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    showToast(`${product.name} added to cart`);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== productId));
    } else {
      setCart(cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    const product = cart.find(item => item.id === productId);
    setCart(cart.filter((item) => item.id !== productId));
    if (product) {
      showToast(`${product.name} removed from cart`);
    }
  };

  const handleCompleteOrder = (order: Order) => {
    setCart([]);
    setSelectedClient(null);
    setScreen('orders');
    showToast('Order placed successfully');
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setScreen('orderDetails');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'orders':
        return (
          <OrdersList 
            onNewOrder={() => setScreen('clients')} 
            onOrderSelect={handleOrderSelect}
          />
        );
      case 'clients':
        return (
          <ClientSelection
            onSelectClient={(client) => {
              setSelectedClient(client);
              setScreen('products');
            }}
            onBack={() => setScreen('orders')}
          />
        );
      case 'products':
        return (
          <ProductsList
            selectedClient={selectedClient}
            cart={cart}
            onAddToCart={handleAddToCart}
            onViewCart={() => setCartModalVisible(true)}
            onBack={() => {
              setScreen('clients');
              setCart([]);
            }}
          />
        );
      case 'checkout':
        return (
          <Checkout
            cart={cart}
            selectedClient={selectedClient}
            onComplete={handleCompleteOrder}
            onBack={() => setScreen('products')}
          />
        );
      case 'orderDetails':
        return (
          <OrderDetails
            order={selectedOrder!}
            onBack={() => setScreen('orders')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      
      <CartModal
        visible={cartModalVisible}
        cart={cart}
        selectedClient={selectedClient}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={() => {
          setCartModalVisible(false);
          setScreen('checkout');
        }}
        onClose={() => setCartModalVisible(false)}
      />

      <ToastNotification
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast({ visible: false, message: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});