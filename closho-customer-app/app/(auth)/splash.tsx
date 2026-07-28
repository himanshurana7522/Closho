import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true })
    ]).start();

    // Only proceed if SecureStore loading is complete
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 4000); // 4-second splash

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoMark}>C</Text>
        </View>
        <Text style={styles.logoText}>CLOSHO</Text>
        <Text style={styles.subLogoText}>CLOTHES & SHOES</Text>
        
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>WEAR IT TODAY</Text>
        </View>
      </Animated.View>

      <View style={styles.bottomContent}>
        <Text style={styles.poweredBy}>Powered by 499 stores</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoMark: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
  },
  logoText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 4,
  },
  subLogoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    letterSpacing: 2,
    marginTop: spacing.xxs,
  },
  taglineContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  tagline: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.inverse,
    letterSpacing: 1,
  },
  bottomContent: {
    alignItems: 'center',
  },
  loader: {
    marginBottom: spacing.md,
  },
  poweredBy: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});
