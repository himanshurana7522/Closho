import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
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

const { width } = Dimensions.get('window');

import { MOCK_PRODUCTS } from '../../src/data/mockProducts';

const MOCK_PRODUCT_DETAILS = {
  description: 'Designed for everyday comfort with a clean and timeless look. Made from premium fabric, it offers a perfect fit that\'s easy to wear and ideal for layering.',
  images: [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop',
  ],
  colors: [
    { id: 'c1', name: 'Grey', hex: '#A9A9A9' },
    { id: 'c2', name: 'Black', hex: '#000000' },
    { id: 'c3', name: 'Cream', hex: '#FFFDD0' },
  ],
  sizes: ['S', 'M', 'L', 'XL'],
  stock: 5,
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  
  const baseProduct = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  const product = {
    ...MOCK_PRODUCT_DETAILS,
    ...baseProduct,
    images: [baseProduct.imageUrl, ...MOCK_PRODUCT_DETAILS.images],
  };

  const isWishlisted = isInWishlist(product.id);
  const [selectedColor, setSelectedColor] = useState(product.colors[0].id);
  const [selectedSize, setSelectedSize] = useState('M');

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

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
            {product.images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.productImage} />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {product.images.map((_, index) => (
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
              {product.colors.map(c => (
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
              {product.sizes.map(s => (
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
            const colorObj = product.colors.find(c => c.id === selectedColor);
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
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const colorObj = product.colors.find(c => c.id === selectedColor);
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
