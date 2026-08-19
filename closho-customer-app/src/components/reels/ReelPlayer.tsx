import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated, Easing, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
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
  const router = useRouter();
  const toggleLike = useReelsStore(state => state.toggleLike);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Heart animation
  const heartScale = useRef(new Animated.Value(1)).current;

  const player = useVideoPlayer(reel.videoUrl, player => {
    player.loop = true;
    player.muted = isMuted;
  });

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    try {
      if (isActive) {
        player.play();
        setIsPlaying(true);
      } else {
        player.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.warn('Video playback error (likely web autoplay policy):', error);
    }
  }, [isActive, player]);

  const handleTogglePlay = () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.warn('Video playback error:', error);
    }
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
    } else {
      router.push('/(tabs)/explore');
    }
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleTogglePlay}
        style={styles.videoContainer}
      >
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
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
        </View>

        {/* Action Buttons Column */}
        <View style={styles.actionColumn}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShop}>
            <View style={styles.shopIconBg}>
              <Ionicons name="bag-handle" size={22} color="#FFFFFF" style={{ marginLeft: 1 }} />
            </View>
            <Text style={styles.actionText}>Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons 
                name={reel.isLiked ? "heart" : "heart-outline"} 
                size={36} 
                color={reel.isLiked ? colors.status.error : '#FFFFFF'} 
              />
            </Animated.View>
            <Text style={styles.actionText}>{reel.likesCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={32} color="#FFFFFF" style={styles.iconShadow} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setIsMuted(!isMuted)}>
            <Ionicons name={isMuted ? "volume-mute-outline" : "volume-medium-outline"} size={32} color="#FFFFFF" style={styles.iconShadow} />
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
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shopIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
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
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  iconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});
