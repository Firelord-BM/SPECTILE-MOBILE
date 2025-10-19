import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { theme } from "@/constants/theme";
import apiService from "@/services/api.service";
import { Product } from "@/types";
import { Search } from 'lucide-react-native';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface ProductsListProps {
  selectedClient: any;
  cart: any[];
  onAddToCart: (product: Product) => void;
  onViewCart: () => void;
  onBack: () => void;
}

export default function ProductsList({ 
  selectedClient, 
  cart, 
  onAddToCart, 
  onViewCart, 
  onBack 
}: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchProducts();
    } else {
      loadProducts();
    }
  }, [searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({ 
        active: true, 
        page, 
        size: 20 
      });
      
      const data = response.data;
      setProducts(data.content);
      setHasMore(!data.last);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.searchProducts(searchQuery);
      const data = response.data;
      setProducts(data.content);
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderProduct = ({ item }: { item: Product }) => {
    const cartItem = cart.find(cartItem => cartItem.id === item.id);
    const itemQuantity = cartItem ? cartItem.quantity : 0;

    return (
      <TouchableOpacity
        style={styles.modernProductCard}
        onPress={() => onAddToCart(item)}
        activeOpacity={0.7}
      >
        {item.primaryImageUrl && (
          <Image 
            source={{ uri: item.primaryImageUrl }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.productCardContent}>
          <View style={styles.productInfo}>
            <Text style={styles.productNameText}>{item.name}</Text>
            <Text style={styles.productCategoryText}>{item.categoryName}</Text>
            {item.currentStock !== null && (
              <Text style={[
                styles.stockText,
                item.currentStock <= (item.lowStockThreshold || 0) && styles.lowStockText
              ]}>
                Stock: {item.currentStock} {item.unitOfMeasureName}
              </Text>
            )}
            {itemQuantity > 0 && (
              <View style={styles.quantityBadge}>
                <Text style={styles.productQuantityText}>
                  {itemQuantity} in cart
                </Text>
              </View>
            )}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.productPriceText}>
              KES {item.price.toLocaleString()}
            </Text>
            {item.taxPercentage && (
              <Text style={styles.taxText}>
                +{item.taxPercentage}% tax
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={{ color: 'white' }}>Products</ThemedText>
        <Text style={styles.modernHeaderSubtitle}>{selectedClient?.name}</Text>
      </ThemedView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && page === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productsList}
          renderItem={renderProduct}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 0 ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No products found</Text>
            </View>
          }
        />
      )}

      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={onViewCart} activeOpacity={0.9}>
          <View style={styles.cartBarContent}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarText}>View Cart</Text>
            <Text style={styles.cartBarAmount}>KES {cartTotal.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
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
  modernHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
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
  productsList: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },
  modernProductCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.surface,
  },
  productCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  productInfo: {
    flex: 1,
  },
  productNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  productCategoryText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: 4,
  },
  lowStockText: {
    color: '#F59E0B',
  },
  quantityBadge: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  productQuantityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  productPriceText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  taxText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cartBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cartBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cartBarText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
    marginLeft: theme.spacing.md,
  },
  cartBarAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
});