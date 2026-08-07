import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Animated, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { ProductCard, Product } from '../../src/components/product/ProductCard';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Video, ResizeMode } from 'expo-av';
import { useStoreStore } from '../../src/store/storeStore';
import api from '../../src/services/api';

const CATEGORIES = [
  { id: '1', name: 'T-Shirt', icon: 'shirt-outline' },
  { id: '2', name: 'Pants', icon: 'server-outline' },
  { id: '3', name: 'Jacket', icon: 'body-outline' },
  { id: '4', name: 'Cap', icon: 'glasses-outline' },
  { id: '5', name: 'Shoes', icon: 'footsteps-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { currentStore, fetchNearestStore } = useStoreStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Subtle entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();

    // Fetch nearest store if not available (mock coords for Mumbai)
    if (!currentStore) {
      fetchNearestStore(19.1197, 72.8468);
    }
  }, [currentStore]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // As per request, try /products first without any storeId to prevent zero products
        const url = `/products?limit=14`;
        const res = await api.get(url);
        if (res.data) {
          const responseData = res.data.data !== undefined ? res.data.data : res.data;
          const productsArray = Array.isArray(responseData) ? responseData : (responseData?.products || []);
          
          if (Array.isArray(productsArray) && productsArray.length > 0) {
            // Normalize prices from string to number and handle null images
            const formattedProducts = productsArray.map((p: any) => ({
              ...p,
              price: Number(p.price) || 0,
              originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
              imageUrl: p.thumbnail || p.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image',
            }));
            setProducts(formattedProducts);
          } else {
            console.log('Products array is empty or invalid:', productsArray);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch home products:', err?.message || err);
        if (err?.response) console.error('Response data:', err.response.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentStore]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* ── HEADER ── */}
      <Animated.View style={[styles.topHeader, { opacity: fadeAnim }]}>

        {/* LEFT: Row 1 = Logo | Row 2 = Store selector */}
        <View style={styles.headerLeft}>
          <Text style={styles.logoText}>CLOSHO</Text>
          <TouchableOpacity
            style={styles.locationRow}
            activeOpacity={0.7}
            onPress={() => Haptics.selectionAsync()}
          >
            <Text style={styles.deliveryLabel}>Delivering to </Text>
            <Text style={styles.storeName}>{currentStore ? currentStore.name : 'Locating...'}</Text>
            <Ionicons name="chevron-down" size={11} color={colors.primary} style={{ marginLeft: 2, marginTop: 1 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={15} color={colors.text.primary} />
            </View>
          </TouchableOpacity>
        </View>

      </Animated.View>

      {/* ── SEARCH BAR ── */}
      <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
        <Ionicons name="search" size={18} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          placeholder="Search for clothes, shoes..."
          placeholderTextColor={colors.text.tertiary}
          style={styles.searchInput}
          onFocus={() => router.push('/(tabs)/explore')}
          editable={false}
          pointerEvents="none"
        />
      </Animated.View>

      {/* Banner */}
      <Animated.View style={[styles.bannerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=800&auto=format&fit=crop' }} 
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerSub}>NEW COLLECTION</Text>
          <Text style={styles.bannerTitle}>Wear it{'\n'}Today</Text>
          <TouchableOpacity style={styles.bannerBtn} onPress={() => { Haptics.impactAsync(); router.push('/(tabs)/explore'); }}>
            <Ionicons name="arrow-forward" size={18} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.categoriesContainer, { opacity: fadeAnim }]}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={styles.categoryItem} 
            activeOpacity={0.7}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/(tabs)/explore');
            }}
          >
            <View style={styles.categoryIconCircle}>
              <Ionicons name={cat.icon as any} size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {/* Most Loved Section */}
      <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Loved</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {products.slice(0, 6).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                style={styles.horizontalProductCard}
                onPress={() => router.push(`/product/${product.id}`)} 
              />
            ))}
          </ScrollView>
        )}
      </Animated.View>

      {/* Trending Reels (Thumbnail trigger) */}
      <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim, marginBottom: spacing.xxxl }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.reelsTitleContainer}>
            <Ionicons name="play-circle-outline" size={24} color={colors.primary} style={styles.reelsIcon} />
            <Text style={styles.sectionTitle}>Trending Looks</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAllText}>Explore</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          <TouchableOpacity style={styles.reelCard} onPress={() => Haptics.impactAsync()}>
            <Video
              style={styles.reelVideo}
              source={{ uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' }}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
            <View style={styles.playIconContainer}>
              <View style={styles.playIconBg}>
                <Ionicons name="play" size={20} color={colors.text.inverse} style={{ marginLeft: 2 }} />
              </View>
            </View>
            <Text style={styles.reelTitle} numberOfLines={2}>Summer Styling Tips</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reelCard} onPress={() => Haptics.impactAsync()}>
            <Video
              style={styles.reelVideo}
              source={{ uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
            <View style={styles.playIconContainer}>
              <View style={styles.playIconBg}>
                <Ionicons name="play" size={20} color={colors.text.inverse} style={{ marginLeft: 2 }} />
              </View>
            </View>
            <Text style={styles.reelTitle} numberOfLines={2}>New Shoe Drops</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* New Arrivals / Recommended */}
      <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={styles.gridContainer}>
            {products.slice(6, 14).map(product => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard 
                  product={product} 
                  onPress={() => router.push(`/product/${product.id}`)} 
                />
              </View>
            ))}
          </View>
        )}
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.xxxl * 3,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',   // icons align to top of the logo, not centre
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  logoText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLabel: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: '400',
  },
  storeName: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,             // nudge icons to sit level with the logo cap-height
  },
  iconBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    marginLeft: 2,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
  },
  filterBtn: {
    padding: spacing.xs,
  },
  bannerContainer: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    padding: spacing.xl,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerSub: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    letterSpacing: 3,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  bannerTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xxxl,
    fontWeight: '900',
    lineHeight: 38,
    letterSpacing: 1,
  },
  bannerBtn: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  categoryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: spacing.lg,
  },
  horizontalProductCard: {
    marginRight: spacing.md,
  },
  reelsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reelsIcon: {
    marginRight: spacing.xs,
  },
  reelCard: {
    width: 140,
    height: 220,
    marginRight: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reelVideo: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelTitle: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: spacing.md,
  }
});
