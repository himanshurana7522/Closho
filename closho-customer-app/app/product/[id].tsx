import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Animated, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/ui/Button';
import * as Haptics from 'expo-haptics';
import { useSnackbar } from '../../src/components/ui/SnackbarContext';
import { useCartStore } from '../../src/store/cartStore';
import { useWishlistStore } from '../../src/store/wishlistStore';
import { useStoreStore } from '../../src/store/storeStore';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { currentStore } = useStoreStore();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const api = require('../../src/services/api').default;
        const storeIdParam = currentStore ? `?storeId=${currentStore.id}` : '';
        const response = await api.get(`/products/${id}${storeIdParam}`);
        
        if (response.data.success) {
          const p = response.data.data;
          
          // Format based on API Contract
          const formatted = {
            id: p.id,
            name: p.name,
            description: p.description || 'Designed for everyday comfort with a clean and timeless look.',
            price: Number(p.price),
            originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
            discount: p.discountPercent,
            images: (p.images && p.images.length > 0) ? p.images : (p.thumbnail ? [p.thumbnail] : ['https://via.placeholder.com/600x800?text=No+Image']),
            imageUrl: p.thumbnail || p.images?.[0] || 'https://via.placeholder.com/600x800?text=No+Image',
            rating: p.rating || 4.5,
            reviews: p.reviewCount || 0,
            stock: p.variants?.[0]?.stock || 0,
            colors: p.variants ? 
              Array.from(new Set(p.variants.map((v: any) => v.color))).map((c: any) => ({
                id: c,
                name: c,
                hex: p.variants.find((v: any) => v.color === c)?.colorHex || '#000000'
              })) : [{ id: 'c1', name: 'Default', hex: '#000000' }],
            sizes: p.variants ? 
              Array.from(new Set(p.variants.map((v: any) => v.size))) : ['M'],
          };
          
          setProduct(formatted);
          setSelectedColor(formatted.colors[0]?.id);
          setSelectedSize(formatted.sizes[0]);
        } else {
          showSnackbar('Failed to load product', 'error');
        }
      } catch (err) {
        console.error('Error fetching product details', err);
        showSnackbar('Error connecting to server', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, currentStore]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleColorSelect = (cId: string) => {
    Haptics.selectionAsync();
    setSelectedColor(cId);
  };

  const handleSizeSelect = (size: string) => {
    Haptics.selectionAsync();
    setSelectedSize(size);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      rating: product.rating,
      imageUrl: product.imageUrl,
    });
    showSnackbar(
      isInWishlist(product.id) ? 'Removed from Wishlist' : 'Added to Wishlist',
      'info'
    );
  };

  if (isLoading || !product) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: colors.text.secondary }}>Loading product...</Text>
      </View>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  return (
    <View style={styles.container}>
      {/* Animated Header Background */}
      <Animated.View style={[styles.headerBg, { opacity: headerOpacity }]} />

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleWishlistToggle}>
          <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={24} color={isWishlisted ? colors.status.error : colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.imageGallery}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images.map((img: string, index: number) => (
              <Image key={index} source={{ uri: img }} style={styles.productImage} />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {product.images.map((_: any, index: number) => (
              <View key={index} style={[styles.dot, index === 0 && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.name}</Text>
            <TouchableOpacity onPress={handleWishlistToggle} style={styles.wishlistBtn}>
              <Ionicons 
                name={isWishlisted ? "heart" : "heart-outline"} 
                size={28} 
                color={isWishlisted ? colors.primary : colors.text.primary} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewText}>({product.reviews || 0})</Text>
            </View>
          </View>
          
          <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>₹{product.originalPrice.toFixed(2)}</Text>
          )}
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <View style={styles.selectorRow}>
              {product.colors.map((c: any) => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[styles.colorCircle, selectedColor === c.id && styles.colorCircleSelected]}
                  onPress={() => handleColorSelect(c.id)}
                >
                  <View style={[styles.colorInner, { backgroundColor: c.hex }]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sizeHeader}>
              <Text style={styles.sectionTitle}>Size</Text>
              {product.stock <= 5 && <Text style={styles.lowStock}>Only {product.stock} left</Text>}
            </View>
            <View style={styles.selectorRow}>
              {product.sizes.map((s: string) => (
                <TouchableOpacity 
                  key={s} 
                  style={[styles.sizeBox, selectedSize === s && styles.sizeBoxSelected]}
                  onPress={() => handleSizeSelect(s)}
                >
                  <Text style={[styles.sizeText, selectedSize === s && styles.sizeTextSelected]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Buy Now" 
          variant="outline" 
          style={styles.checkoutBtn} 
          onPress={() => {
            Haptics.impactAsync();
            const colorObj = product.colors.find((c: any) => c.id === selectedColor);
            addToCart({
              productId: product.id,
              name: product.name,
              price: product.price,
              size: selectedSize,
              colorName: colorObj ? colorObj.name : 'Default',
              colorHex: colorObj ? colorObj.hex : '#000000',
              quantity: 1,
              image: product.imageUrl,
            });
            showSnackbar('Added to Cart! Redirecting...', 'success');
            router.push('/(tabs)/cart');
          }}
        />
        <Button 
          title="Add to Cart" 
          style={styles.addToCartBtn} 
          onPress={async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const colorObj = product.colors.find((c: any) => c.id === selectedColor);
            await addToCart({
              productId: product.id,
              name: product.name,
              price: product.price,
              size: selectedSize,
              colorName: colorObj ? colorObj.name : 'Default',
              colorHex: colorObj ? colorObj.hex : '#000000',
              quantity: 1,
              image: product.imageUrl,
            });
            showSnackbar('Added to Cart', 'success');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: colors.background,
    zIndex: 9,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageScroll: {
    height: 500,
  },
  productImage: {
    width: width,
    height: 500,
    resizeMode: 'cover',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageGallery: {
    backgroundColor: colors.surfaceLight,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
  content: {
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: '900',
    flex: 1,
    marginRight: spacing.md,
    lineHeight: 30,
  },
  wishlistBtn: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  productName: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: '900',
    flex: 1,
    marginRight: spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reviewText: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    marginLeft: 4,
  },
  price: {
    color: colors.primary,
    fontSize: typography.fontSize.display,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  originalPrice: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
    textDecorationLine: 'line-through',
    marginBottom: spacing.md,
  },
  discountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  discountText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lowStock: {
    color: colors.status.warning,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  colorCircleSelected: {
    borderColor: colors.primary,
  },
  colorInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sizeBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.surface,
  },
  sizeBoxSelected: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  sizeText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
  },
  sizeTextSelected: {
    color: colors.text.inverse,
  },
  descriptionText: {
    color: colors.text.secondary,
    lineHeight: 24,
    fontSize: typography.fontSize.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  checkoutBtn: {
    flex: 1,
    marginRight: spacing.md,
  },
  addToCartBtn: {
    flex: 1.5,
  }
});
