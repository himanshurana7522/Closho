import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ViewToken, SafeAreaView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';
import * as Haptics from 'expo-haptics';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

interface ReelData {
  id: string;
  videoUrl: string;
  thumbnail?: string;
  title: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  user: string;
  productId: string;
  isLiked: boolean;
}

// High-quality mock data for Reels based on new API structure
const INITIAL_MOCK_REELS: ReelData[] = [
  {
    id: 'reel_1',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://via.placeholder.com/400x800',
    title: 'Summer Styling Tips',
    description: 'How to look fresh in 40°C heat while keeping it casual.',
    likesCount: 12400,
    commentsCount: 342,
    user: '@stylebyclosho',
    productId: '8553ef60-59c8-4d3c-ba9c-cd694f828e8a', // Real product ID from Postman
    isLiked: false
  },
  {
    id: 'reel_2',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'New Shoe Drops',
    description: 'Exclusive sneak peek at next weeks arrivals. Don\'t miss out!',
    likesCount: 8900,
    commentsCount: 128,
    user: '@sneakerhead',
    productId: '8553ef60-59c8-4d3c-ba9c-cd694f828e8a',
    isLiked: false
  },
  {
    id: 'reel_3',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    title: 'Office to Party Transition',
    description: 'One jacket, two completely different looks.',
    likesCount: 45100,
    commentsCount: 890,
    user: '@dailyfashion',
    productId: '8553ef60-59c8-4d3c-ba9c-cd694f828e8a',
    isLiked: true
  }
];

export default function ReelsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialIndex = params.index ? parseInt(params.index as string, 10) : 0;
  
  const [activeVideoIndex, setActiveVideoIndex] = useState(initialIndex);
  const [reels, setReels] = useState<ReelData[]>(INITIAL_MOCK_REELS);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].isViewable) {
      setActiveVideoIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const handleLikeToggle = (id: string, currentlyLiked: boolean) => {
    Haptics.selectionAsync();
    // Optimistic UI update
    setReels(current => 
      current.map(reel => {
        if (reel.id === id) {
          return {
            ...reel,
            isLiked: !currentlyLiked,
            likesCount: currentlyLiked ? reel.likesCount - 1 : reel.likesCount + 1
          };
        }
        return reel;
      })
    );
    // In the future: await api.post(`/reels/${id}/like`) or api.delete(`/reels/${id}/like`)
  };

  const renderItem = ({ item, index }: { item: ReelData, index: number }) => {
    const isActive = index === activeVideoIndex;
    
    // Format large numbers (e.g. 12400 -> 12.4K)
    const formatCount = (count: number) => {
      if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
      return count.toString();
    };
    
    return (
      <View style={[styles.reelContainer, { height: WINDOW_HEIGHT }]}>
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive}
          isLooping
          isMuted={false}
        />
        
        {/* Overlay Gradients/Shadows could go here */}
        
        {/* Top Header - Back Button */}
        <SafeAreaView style={styles.topHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              Haptics.impactAsync();
              router.back();
            }}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text.inverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reels</Text>
          <View style={{ width: 28 }} />
        </SafeAreaView>

        {/* Right Side Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLikeToggle(item.id, item.isLiked)}>
            <Ionicons name={item.isLiked ? "heart" : "heart-outline"} size={32} color={item.isLiked ? "#ff2a5f" : colors.text.inverse} />
            <Text style={styles.actionText}>{formatCount(item.likesCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => Haptics.selectionAsync()}>
            <Ionicons name="chatbubble-outline" size={30} color={colors.text.inverse} />
            <Text style={styles.actionText}>{formatCount(item.commentsCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => Haptics.selectionAsync()}>
            <Ionicons name="paper-plane-outline" size={30} color={colors.text.inverse} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Details */}
        <View style={styles.bottomDetails}>
          <Text style={styles.userText}>{item.user}</Text>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
          
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => {
              Haptics.impactAsync();
              if (item.productId) {
                router.push(`/product/${item.productId}`);
              } else {
                router.push('/(tabs)/explore');
              }
            }}
          >
            <Ionicons name="bag-handle-outline" size={16} color={colors.text.inverse} />
            <Text style={styles.shopButtonText}>Shop This Look</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={WINDOW_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: WINDOW_HEIGHT,
          offset: WINDOW_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  reelContainer: {
    width: WINDOW_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  topHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rightActions: {
    position: 'absolute',
    right: spacing.md,
    bottom: 120,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  actionText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomDetails: {
    position: 'absolute',
    bottom: 40,
    left: spacing.md,
    right: 80, // leave space for right actions
  },
  userText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    opacity: 0.9,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  shopButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
    marginLeft: 6,
  }
});
