import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import * as Haptics from 'expo-haptics';
import { Button } from '../../src/components/ui/Button';

const MOCK_ORDER = {
  id: 'ORD-89432',
  date: '24 Jul 2026',
  status: 'Shipped',
  total: 169.99,
  trackingNumber: 'TRK9982348123',
  items: [
    {
      id: '1',
      name: 'Classic Cotton Hoodie',
      price: 65.00,
      size: 'M',
      colorName: 'Grey',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop',
    }
  ],
  timeline: [
    { status: 'Order Placed', date: '24 Jul, 10:30 AM', completed: true },
    { status: 'Processing', date: '24 Jul, 02:15 PM', completed: true },
    { status: 'Shipped', date: '25 Jul, 09:00 AM', completed: true },
    { status: 'Out for Delivery', date: 'Pending', completed: false },
    { status: 'Delivered', date: 'Pending', completed: false },
  ]
};

export default function OrderDetailsScreen() {
  const { id, orderData } = useLocalSearchParams();
  const router = useRouter();

  const order = orderData ? JSON.parse(orderData as string) : MOCK_ORDER;
  
  // If order is passed from previous screen, it might not have the full detail like timeline or items 
  // since MOCK_ORDERS in orders.tsx is simplified. Let's merge it with MOCK_ORDER to ensure it renders without crashing.
  const displayOrder = {
    ...MOCK_ORDER,
    ...order,
    timeline: order.timeline || MOCK_ORDER.timeline,
    items: order.items || MOCK_ORDER.items,
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.orderId}>{displayOrder.id}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{displayOrder.status}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>Placed on {displayOrder.date}</Text>
          <View style={styles.trackingContainer}>
            <Text style={styles.trackingLabel}>Tracking Number:</Text>
            <Text style={styles.trackingNumber}>{displayOrder.trackingNumber || `TRK${Math.floor(Math.random() * 100000000)}`}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Status</Text>
          <View style={styles.timeline}>
            {displayOrder.timeline.map((step: any, index: number) => (
              <View key={index} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, step.completed && styles.timelineDotActive]} />
                  {index !== displayOrder.timeline.length - 1 && (
                    <View style={[styles.timelineLine, step.completed && styles.timelineLineActive]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.stepStatus, !step.completed && styles.stepStatusPending]}>
                    {step.status}
                  </Text>
                  <Text style={styles.stepDate}>{step.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {displayOrder.items.map((item: any) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image || item.previewImage || MOCK_ORDER.items[0].image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name || 'Product'}</Text>
                <Text style={styles.itemVariant}>Size: {item.size || 'M'} | Color: {item.colorName || 'Default'}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>₹{item.price?.toFixed(2) || '0.00'}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Download Invoice" 
          onPress={() => Haptics.impactAsync()} 
        />
      </View>
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
    paddingBottom: spacing.xxxl * 4,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: typography.fontSize.lg,
    fontWeight: '900',
    color: colors.text.primary,
  },
  statusBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
  },
  orderDate: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
  },
  trackingLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.sm,
  },
  trackingNumber: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  timeline: {
    paddingLeft: spacing.sm,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.borderLight,
    zIndex: 2,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.borderLight,
    position: 'absolute',
    top: 10,
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: colors.primary,
  },
  timelineContent: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  stepStatus: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  stepStatusPending: {
    color: colors.text.tertiary,
  },
  stepDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  itemImage: {
    width: 70,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  itemQty: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
