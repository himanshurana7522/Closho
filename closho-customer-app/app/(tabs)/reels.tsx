import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ActivityIndicator, Text, ViewToken } from 'react-native';
import { useReelsStore } from '../../src/store/reelsStore';
import { ReelPlayer } from '../../src/components/reels/ReelPlayer';
import { colors } from '../../src/theme/colors';

const { height } = Dimensions.get('window');

export default function ReelsScreen() {
  const { reels, fetchReels, isLoading, hasMore } = useReelsStore();
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  
  // To handle the screen height correctly, considering tabs
  let tabBarHeight = 85; 
  
  const containerHeight = height - tabBarHeight;

  useEffect(() => {
    fetchReels(true); // Initial fetch
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveReelId(viewableItems[0].item.id);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  const renderItem = ({ item }: { item: any }) => (
    <ReelPlayer 
      reel={item} 
      isActive={item.id === activeReelId} 
      containerHeight={containerHeight}
    />
  );

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchReels();
    }
  };

  if (isLoading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <FlatList
        data={reels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={containerHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No reels found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  }
});
