import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import * as Haptics from 'expo-haptics';
import { useWishlistStore } from '../../store/wishlistStore';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 3) / 2; // 2 columns with padding

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  imageUrl: string;
  isWishlisted?: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onWishlistPress?: () => void;
  style?: any;
}

export const ProductCard = ({ product, onPress, style }: ProductCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
  };

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlist(product);
  };

  return (
    <Animated.View style={[styles.container, style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPressIn={handlePressIn} 
        onPressOut={handlePressOut} 
        onPress={onPress}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
          
          <TouchableOpacity style={styles.wishlistBtn} onPress={handleWishlist}>
            <View style={styles.wishlistIconBg}>
              <Ionicons 
                name={isWishlisted ? "heart" : "heart-outline"} 
                size={18} 
                color={isWishlisted ? colors.primary : colors.text.inverse} 
              />
            </View>
          </TouchableOpacity>

          <View style={styles.badgesBottom}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Ionicons name="star" size={10} color={colors.primary} style={{ marginLeft: 2 }} />
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</Text>
            )}
            {product.discount && (
              <Text style={styles.discountText}>({product.discount}% OFF)</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: spacing.xl,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth * 1.45,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  wishlistIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgesBottom: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
  },
  ratingBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingHorizontal: 2,
  },
  name: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  originalPrice: {
    color: colors.text.tertiary,
    fontSize: typography.fontSize.xs,
    textDecorationLine: 'line-through',
    marginRight: spacing.xs,
  },
  discountText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
});
