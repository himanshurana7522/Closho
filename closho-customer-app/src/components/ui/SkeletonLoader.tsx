import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: colors.borderLight,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton = () => (
  <View style={styles.cardContainer}>
    <Skeleton width="100%" height={220} borderRadius={16} />
    <View style={styles.cardInfo}>
      <Skeleton width="70%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={14} borderRadius={4} style={{ marginBottom: 12 }} />
      <Skeleton width="30%" height={18} borderRadius={4} />
    </View>
  </View>
);

export const ProductGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <View style={styles.gridContainer}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.gridItem}>
        <ProductCardSkeleton />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    marginBottom: 16,
  },
  cardInfo: {
    paddingTop: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
});
