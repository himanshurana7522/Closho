import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { ProductCard, Product } from '../../src/components/product/ProductCard';
import { Button } from '../../src/components/ui/Button';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSnackbar } from '../../src/components/ui/SnackbarContext';
import { MOCK_PRODUCTS } from '../../src/data/mockProducts';

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState('Recommended');
  const { showSnackbar } = useSnackbar();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const api = require('../../src/services/api').default;
      
      // Build query string based on filters
      let query = `/products?page=1&limit=50`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;
      if (activeCategory) query += `&category=${activeCategory.toLowerCase()}`;
      
      let sortParam = 'recommended';
      if (activeSort === 'Price: Low to High') sortParam = 'price_asc';
      if (activeSort === 'Price: High to Low') sortParam = 'price_desc';
      if (activeSort === 'Newest Arrivals') sortParam = 'newest';
      query += `&sort=${sortParam}`;

      const response = await api.get(query);
      if (response.data) {
        const responseData = response.data.data !== undefined ? response.data.data : response.data;
        const productsArray = Array.isArray(responseData) ? responseData : (responseData?.products || []);
        
        if (Array.isArray(productsArray) && productsArray.length > 0) {
          const formattedProducts = productsArray.map((p: any) => ({
            ...p,
            price: Number(p.price) || 0,
            originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
            imageUrl: p.thumbnail || p.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image',
          }));
          setProducts(formattedProducts);
        } else {
          console.log('Explore products array is empty or invalid:', productsArray);
          showSnackbar('No products found', 'info');
        }
      } else {
        showSnackbar('Failed to load products', 'error');
      }
    } catch (error) {
      console.error('Explore products fetch error:', error);
      showSnackbar('Error connecting to server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when filters or search change
  // Note: For search, you might want to debounce in a real app
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, activeSort]);

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}`);
  };

  const applyFilters = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsFilterVisible(false);
    showSnackbar('Filters applied', 'success');
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput 
            placeholder="Search for clothes, shoes..."
            placeholderTextColor={colors.text.tertiary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.filterBtn} 
            onPress={() => {
              Haptics.selectionAsync();
              setIsFilterVisible(true);
            }}
          >
            <Ionicons name="options-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ opacity: fadeAnim }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Products</Text>
          <Text style={styles.resultsCount}>{products.length} results</Text>
        </View>

        {isLoading ? (
          <View style={{ alignItems: 'center', marginTop: spacing.xxxl }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.text.secondary, marginTop: spacing.md }}>Loading...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: spacing.xxxl }}>
            <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
            <Text style={{ color: colors.text.secondary, marginTop: spacing.md }}>No products found</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onPress={() => handleProductPress(product.id)} 
                onWishlistPress={() => console.log('Toggle wishlist', product.id)}
              />
            ))}
          </View>
        )}
      </Animated.ScrollView>

      {/* Filter Modal */}
      <Modal visible={isFilterVisible} animationType="slide" transparent={true} onRequestClose={() => setIsFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterScroll}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <View style={styles.filterChips}>
                {['Men', 'Women', 'Footwear', 'Accessories'].map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.filterChip, activeCategory === cat && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setActiveCategory(activeCategory === cat ? null : cat);
                    }}
                  >
                    <Text style={[styles.filterChipText, activeCategory === cat && { color: colors.primary, fontWeight: 'bold' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputBox}><Text style={styles.priceInputText}>₹0</Text></View>
                <Text style={styles.priceDivider}>to</Text>
                <View style={styles.priceInputBox}><Text style={styles.priceInputText}>₹10,000+</Text></View>
              </View>

              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {['Recommended', 'Newest Arrivals', 'Price: Low to High', 'Price: High to Low'].map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    style={[styles.sortOption, activeSort === opt && styles.sortOptionActive]}
                    onPress={() => { Haptics.selectionAsync(); setActiveSort(opt); }}
                  >
                    <Text style={[styles.sortOptionText, activeSort === opt && styles.sortOptionTextActive]}>{opt}</Text>
                    {activeSort === opt && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Reset" variant="outline" style={styles.resetBtn} onPress={() => {
                setActiveCategory(null);
                setSearchQuery('');
              }} />
              <Button title="Apply Filters" style={styles.applyBtn} onPress={applyFilters} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.sm,
  },
  filterBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl * 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resultsCount: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  filterScroll: {
    padding: spacing.xl,
  },
  filterSectionTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChipText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  priceInputBox: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceInputText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
  },
  priceDivider: {
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  sortOptions: {
    marginBottom: spacing.xxxl,
  },
  sortOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sortOptionActive: {
    borderBottomColor: colors.primary,
  },
  sortOptionText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  resetBtn: {
    flex: 1,
    marginRight: spacing.md,
  },
  applyBtn: {
    flex: 2,
  },
});
