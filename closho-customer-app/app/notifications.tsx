import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';
import * as Haptics from 'expo-haptics';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Order Delivered!',
    message: 'Your order #ORD-89432 has been delivered successfully. Enjoy your new outfit!',
    time: '2 hours ago',
    type: 'order',
    isRead: false
  },
  {
    id: '2',
    title: 'Flash Sale: 50% OFF',
    message: 'Hurry up! The midnight flash sale is live. Get 50% off on all sneakers.',
    time: '5 hours ago',
    type: 'promo',
    isRead: true
  }
];

export default function NotificationsScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'order': return 'cube-outline';
      case 'promo': return 'pricetag-outline';
      default: return 'notifications-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {MOCK_NOTIFICATIONS.map((notif) => (
          <TouchableOpacity 
            key={notif.id} 
            style={[styles.notificationCard, !notif.isRead && styles.unreadCard]}
            onPress={() => Haptics.selectionAsync()}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name={getIcon(notif.type)} size={24} color={colors.primary} />
            </View>
            <View style={styles.content}>
              <View style={styles.contentHeader}>
                <Text style={styles.title}>{notif.title}</Text>
                <Text style={styles.time}>{notif.time}</Text>
              </View>
              <Text style={styles.message}>{notif.message}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  message: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  }
});
