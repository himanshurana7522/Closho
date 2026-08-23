import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, Platform, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Reel, useReelsStore } from '../../store/reelsStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

interface ReelPlayerProps {
  reel: Reel;
  isActive: boolean;
  containerHeight: number;
}

// Global flag: has the user interacted with ANY video yet? (Safari needs one user gesture)
let safariUnlocked = false;

// ─── Web Video Player (plain HTML5 <video>) ───────────────────────────────────
const WebReelPlayer: React.FC<ReelPlayerProps> = ({ reel, isActive, containerHeight }) => {
  const router = useRouter();
  const toggleLike = useReelsStore(state => state.toggleLike);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false); // show tap overlay if autoplay blocked
  const videoRef = useRef<any>(null);
  const heartScale = useRef(new Animated.Value(1)).current;

  // Mount: set muted attribute via DOM (React's muted prop doesn't work in Safari)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
  }, []);

  // Play/pause when active state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = isMuted;
      const p = video.play();
      if (p && p.then) {
        p.then(() => {
          setIsPlaying(true);
          setNeedsTap(false);
          safariUnlocked = true;
        }).catch(() => {
          // Safari blocked autoplay — show tap overlay
          setIsPlaying(false);
          setNeedsTap(true);
        });
      } else {
        setIsPlaying(true);
        setNeedsTap(false);
      }
    } else {
      video.pause();
      setIsPlaying(false);
      setNeedsTap(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleTap = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!isPlaying || needsTap) {
      video.muted = isMuted;
      const p = video.play();
      if (p && p.then) {
        p.then(() => {
          setIsPlaying(true);
          setNeedsTap(false);
          safariUnlocked = true;
        }).catch(() => {});
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.5, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 100, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start();
  };

  const handleLike = () => { toggleLike(reel.id); animateHeart(); };
  const handleShop = () => reel.productId ? router.push(`/product/${reel.productId}`) : router.push('/(tabs)/explore');

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <TouchableOpacity activeOpacity={1} onPress={handleTap} style={styles.videoContainer}>
        {/* @ts-ignore */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' } as any}
        />
        {/* Show tap overlay if paused OR if safari blocked autoplay */}
        {(!isPlaying || needsTap) && (
          <View style={[styles.pausedIndicator, needsTap && styles.tapOverlay]}>
            {needsTap ? (
              <View style={styles.tapToPlayContainer}>
                <Ionicons name="play-circle" size={80} color="rgba(255,255,255,0.9)" />
                <Text style={styles.tapToPlayText}>Tap to Play</Text>
              </View>
            ) : (
              <Ionicons name="play" size={64} color="rgba(255,255,255,0.5)" />
            )}
          </View>
        )}
      </TouchableOpacity>

      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.bottomGradient} />

      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{reel.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{reel.description}</Text>
        </View>
        <View style={styles.actionColumn}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShop}>
            <View style={styles.shopIconBg}>
              <Ionicons name="bag-handle" size={22} color="#FFF" style={{ marginLeft: 1 }} />
            </View>
            <Text style={styles.actionText}>Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons name={reel.isLiked ? 'heart' : 'heart-outline'} size={36} color={reel.isLiked ? colors.status.error : '#FFF'} />
            </Animated.View>
            <Text style={styles.actionText}>{reel.likesCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => {
            Haptics.impactAsync();
            Share.share({ message: `Check out this reel: ${reel.title} on Closho!` });
          }}>
            <Ionicons name="paper-plane-outline" size={32} color="#FFF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setIsMuted(!isMuted)}>
            <Ionicons name={isMuted ? 'volume-mute-outline' : 'volume-medium-outline'} size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── Native Video Player (expo-video) ────────────────────────────────────────
let NativeReelPlayer: React.FC<ReelPlayerProps> = () => null;

if (!IS_WEB) {
  // Lazy require so expo-video is never loaded on web
  const { useVideoPlayer, VideoView } = require('expo-video');

  NativeReelPlayer = ({ reel, isActive, containerHeight }) => {
    const router = useRouter();
    const toggleLike = useReelsStore(state => state.toggleLike);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const heartScale = useRef(new Animated.Value(1)).current;

    const player = useVideoPlayer(reel.videoUrl, (p: any) => {
      p.loop = true;
      p.muted = true;
      if (isActive) {
        p.play();
        setIsPlaying(true);
      }
    });

    useEffect(() => { try { player.muted = isMuted; } catch (_) {} }, [isMuted, player]);

    useEffect(() => {
      try {
        if (isActive) { 
          player.play(); 
          setIsPlaying(true); 
        } else { 
          player.pause(); 
          setIsPlaying(false); 
        }
      } catch (err) {
        console.log("Player play/pause error", err);
      }
    }, [isActive, player]);

    const handleTogglePlay = () => {
      try {
        if (isPlaying) { player.pause(); } else { player.play(); }
        setIsPlaying(!isPlaying);
      } catch (_) {}
    };

    const animateHeart = () => {
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.5, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1, duration: 100, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]).start();
    };

    const handleLike = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleLike(reel.id);
      animateHeart();
    };
    const handleShop = () => reel.productId ? router.push(`/product/${reel.productId}`) : router.push('/(tabs)/explore');

    return (
      <View style={[styles.container, { height: containerHeight }]}>
        <TouchableOpacity activeOpacity={1} onPress={handleTogglePlay} style={styles.videoContainer}>
          <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
          {!isPlaying && (
            <View style={styles.pausedIndicator}>
              <Ionicons name="play" size={64} color="rgba(255,255,255,0.5)" />
            </View>
          )}
        </TouchableOpacity>

        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.bottomGradient} />

        <View style={styles.contentContainer}>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{reel.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{reel.description}</Text>
          </View>
          <View style={styles.actionColumn}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShop}>
              <View style={styles.shopIconBg}>
                <Ionicons name="bag-handle" size={22} color="#FFF" style={{ marginLeft: 1 }} />
              </View>
              <Text style={styles.actionText}>Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons name={reel.isLiked ? 'heart' : 'heart-outline'} size={36} color={reel.isLiked ? colors.status.error : '#FFF'} />
              </Animated.View>
              <Text style={styles.actionText}>{reel.likesCount || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => {
              Haptics.impactAsync();
              Share.share({ message: `Check out this reel: ${reel.title} on Closho!` });
            }}>
              <Ionicons name="paper-plane-outline" size={32} color="#FFF" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setIsMuted(!isMuted)}>
              <Ionicons name={isMuted ? 'volume-mute-outline' : 'volume-medium-outline'} size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
}

// ─── Exported Component — routes to correct implementation ───────────────────
export const ReelPlayer: React.FC<ReelPlayerProps> = (props) => {
  if (IS_WEB) return <WebReelPlayer {...props} />;
  return <NativeReelPlayer {...props} />;
};

// ─── Shared Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { width, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  videoContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  video: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%' as any, height: '100%' as any },
  pausedIndicator: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  tapOverlay: { backgroundColor: 'rgba(0,0,0,0.4)' },
  tapToPlayContainer: { alignItems: 'center', gap: 12 },
  tapToPlayText: { color: '#FFF', fontSize: 18, fontWeight: '600', letterSpacing: 1 },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 300 },
  contentContainer: { position: 'absolute', bottom: 100, left: 0, right: 0, flexDirection: 'row', paddingHorizontal: spacing.md, alignItems: 'flex-end' },
  infoContainer: { flex: 1, paddingRight: spacing.md },
  title: { fontSize: typography.fontSize.xl, fontWeight: 'bold', color: '#FFF', marginBottom: spacing.xs, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  description: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.md, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  shopIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  actionColumn: { width: 60, alignItems: 'center', justifyContent: 'flex-end', gap: spacing.lg },
  actionButton: { alignItems: 'center' },
  actionText: { fontSize: typography.fontSize.xs, color: '#FFF', marginTop: 4, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  iconShadow: { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
});
