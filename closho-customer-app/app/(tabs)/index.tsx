import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Animated, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { ProductCard, Product } from '../../src/components/product/ProductCard';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import * as Location from 'expo-location';
import { useStoreStore } from '../../src/store/storeStore';
import { useReelsStore } from '../../src/store/reelsStore';
import api from '../../src/services/api';
import { ProductGridSkeleton } from '../../src/components/ui/SkeletonLoader';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { currentStore, availableStores, fetchAllStores, fetchNearestStore, setCurrentStore } = useStoreStore();
  const { reels, fetchReels } = useReelsStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Subtle entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();
    
    // Fetch all stores and reels
    fetchAllStores();
    fetchReels();

    const initLocationAndStores = async () => {
      if (currentStore) return;
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied, fetching default stores');
          await fetchNearestStore(19.1197, 72.8468, 99999, false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        await fetchNearestStore(location.coords.latitude, location.coords.longitude, 15);
      } catch (error) {
        console.warn('Error getting location', error);
        await fetchNearestStore(19.1197, 72.8468, 99999);
      }
    };
    initLocationAndStores();
  }, [currentStore]);

  const fetchProducts = async () => {
    try {
      const url = `/products?limit=14`;
      const res = await api.get(url);
      if (res.data) {
        const responseData = res.data.data !== undefined ? res.data.data : res.data;
        const productsArray = Array.isArray(responseData) ? responseData : (responseData?.products || []);
        
        if (Array.isArray(productsArray) && productsArray.length > 0) {
          const formattedProducts = productsArray.map((p: any) => ({
            ...p,
            price: Number(p.price) || 0,
            originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
            imageUrl: p.thumbnail || p.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image',
          }));
          setProducts(formattedProducts);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch home products:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentStore]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAllStores(),
      fetchReels(),
      fetchProducts()
    ]);
    setRefreshing(false);
  }, []);

  const handleSelectStore = async (store: any) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    await setCurrentStore(store);
    router.push('/(tabs)/explore');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        
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
              <Text style={styles.deliveryLabel}>Exploring </Text>
              <Text style={styles.storeName}>{currentStore ? currentStore.name : 'All Stores'}</Text>
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

        {/* Store Selection (Replaces Men/Women Categories) */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Store</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storesHorizontalList}>
            {availableStores.map((store, index) => {
              const isActive = currentStore?.id === store.id;
              return (
                <TouchableOpacity 
                  key={store.id || index}
                  style={[styles.storeCardBox, isActive && styles.storeCardBoxActive]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectStore(store)}
                >
                  <View style={styles.storeCardImageContainer}>
                    <Ionicons 
                      name="storefront" 
                      size={24} 
                      color={isActive ? colors.background : colors.text.primary} 
                    />
                  </View>
                  <Text style={[styles.storeCardTitle, isActive && styles.storeCardTitleActive]} numberOfLines={1}>
                    {store.name}
                  </Text>
                  <Text style={[styles.storeCardSubtitle, isActive && styles.storeCardSubtitleActive]} numberOfLines={1}>
                    {store.address || 'Explore Collection'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

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
        {reels.length > 0 && (
          <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.reelsTitleContainer}>
                <Ionicons name="play-circle-outline" size={24} color={colors.primary} style={styles.reelsIcon} />
                <Text style={styles.sectionTitle}>Trending Looks</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/reels')}>
                <Text style={styles.seeAllText}>Explore</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {reels.slice(0, 5).map((reel, index) => (
                <TouchableOpacity 
                  key={reel.id}
                  style={styles.reelCard} 
                  onPress={() => {
                    Haptics.impactAsync();
                    router.push('/(tabs)/reels');
                  }}
                >
                  <Image
                    style={styles.reelVideo}
                    source={{ uri: reel.thumbnail || reel.videoUrl }}
                  />
                  <View style={styles.playIconContainer}>
                    <View style={styles.playIconBg}>
                      <Ionicons name="play" size={20} color={colors.text.inverse} style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                  <Text style={styles.reelTitle} numberOfLines={2}>{reel.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* New Arrivals / Recommended */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim, marginTop: spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
          </View>
          {isLoading ? (
            <View style={{ paddingHorizontal: spacing.sm }}>
              <ProductGridSkeleton count={4} />
            </View>
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
    </View>
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
    alignItems: 'flex-start',
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
    paddingTop: 4,
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
    borderColor: colors.borderLight,
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
    borderColor: colors.borderLight,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
  },
  bannerContainer: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  bannerOverlay: {
    ...(StyleSheet.absoluteFill as object),
    padding: spacing.xl,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
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
  storesHorizontalList: {
    paddingRight: spacing.lg,
    alignItems: 'center',
    paddingVertical: 4,
  },
  storeCardBox: {
    width: 160,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.md,
  },
  storeCardBoxActive: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  storeCardImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  storeCardTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storeCardTitleActive: {
    color: colors.background,
  },
  storeCardSubtitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  storeCardSubtitleActive: {
    color: colors.background,
    opacity: 0.8,
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
    ...(StyleSheet.absoluteFill as object),
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
