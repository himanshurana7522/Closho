import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, Easing, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Reel, useReelsStore } from '../../store/reelsStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface ReelPlayerProps {
  reel: Reel;
  isActive: boolean;
  containerHeight: number;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({ reel, isActive, containerHeight }) => {
  const videoRef = useRef<Video>(null);
  const router = useRouter();
  const toggleLike = useReelsStore(state => state.toggleLike);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Heart animation
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      videoRef.current?.playAsync().catch(e => {
        console.log('Autoplay blocked by browser:', e);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } else {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync().catch(e => {
        console.log('Play blocked by browser:', e);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleLike(reel.id);
    
    // Animate heart
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.5,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleShop = () => {
    if (reel.productId) {
      router.push(`/product/${reel.productId}`);
    }
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleTogglePlay}
        style={styles.videoContainer}
      >
        <Video
          ref={videoRef}
          source={{ uri: reel.videoUrl }}
          style={styles.video}
          videoStyle={Platform.OS === 'web' ? { width: '100%', height: '100%', objectFit: 'cover' as any } : undefined}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted={isMuted}
          shouldPlay={isActive}
        />
        
        {/* Play/Pause indicator overlay when paused */}
        {!isPlaying && (
          <View style={styles.pausedIndicator}>
            <Ionicons name="play" size={64} color="rgba(255, 255, 255, 0.5)" />
          </View>
        )}
      </TouchableOpacity>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      />

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {/* Info Area */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{reel.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{reel.description}</Text>
          
          {reel.productId && (
            <TouchableOpacity style={styles.shopButton} onPress={handleShop}>
              <Ionicons name="cart-outline" size={16} color={colors.background} style={{ marginRight: 6 }}/>
              <Text style={styles.shopButtonText}>Shop this Look</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons Column */}
        <View style={styles.actionColumn}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons 
                name={reel.isLiked ? "heart" : "heart-outline"} 
                size={36} 
                color={reel.isLiked ? colors.status.error : colors.background} 
              />
            </Animated.View>
            <Text style={styles.actionText}>{reel.likesCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={32} color={colors.background} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setIsMuted(!isMuted)}>
            <Ionicons name={isMuted ? "volume-mute-outline" : "volume-medium-outline"} size={32} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    ...(StyleSheet.absoluteFill as object),
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  video: {
    ...(StyleSheet.absoluteFill as object),
    width: '100%',
    height: '100%',
  },
  pausedIndicator: {
    ...(StyleSheet.absoluteFill as object),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 100, // Leave space for tabs
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
  },
  infoContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.md,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.background,
    fontWeight: 'bold',
  },
  actionColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    color: colors.background,
    marginTop: 4,
    fontWeight: '600',
  }
});
