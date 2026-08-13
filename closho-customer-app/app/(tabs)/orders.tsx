import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import * as Haptics from 'expo-haptics';
import { useSnackbar } from '../../src/components/ui/SnackbarContext';
import { useOrderStore } from '../../src/store/orderStore';
import { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { Button } from '../../src/components/ui/Button';

const TABS = ['All', 'Ordered', 'Shipped', 'Delivered', 'Cancelled'];



export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { orders, isLoading, fetchOrders } = useOrderStore();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return colors.status.success;
      case 'Shipped': return colors.status.info;
      case 'Cancelled': return colors.status.error;
      default: return colors.primary;
    }
  };

  const handleAction = (actionName: string, order: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (actionName === 'View Order' || actionName === 'Track Order' || actionName === 'View Details') {
      router.push({
        pathname: `/order/[id]`,
        params: { id: order.id, orderData: JSON.stringify(order) }
      });
    } else {
      showSnackbar(`${actionName} triggered`, 'info');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Orders</Text>
      
      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(tab);
              }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxxl }} />
        ) : orders.length === 0 ? (
          <View style={[styles.emptyContainer]}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cube-outline" size={60} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>You haven't placed any orders. Start exploring to find something you'll love!</Text>
            <Button 
              title="Browse Products" 
              onPress={() => router.push('/(tabs)')} 
              style={styles.shopBtn}
            />
          </View>
        ) : (
          orders.filter(order => activeTab === 'All' || order.status.toLowerCase() === activeTab.toLowerCase()).map(order => (
          <TouchableOpacity 
            key={order.id} 
            style={styles.orderCard} 
            activeOpacity={0.8}
            onPress={() => handleAction('View Order', order)}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardBody}>
              <Image source={{ uri: order.previewImage }} style={styles.previewImg} />
              <View style={styles.orderDetails}>
                <Text style={styles.itemsCount}>{order.itemsCount} {order.itemsCount === 1 ? 'Item' : 'Items'}</Text>
                <Text style={styles.orderTotal}>₹{(order.total || 0).toFixed(2)}</Text>
              </View>
            </View>
            
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('Track Order', order)}>
                <Text style={styles.actionBtnText}>Track</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => handleAction('View Details', order)}>
                <Text style={[styles.actionBtnText, { color: colors.text.inverse }]}>View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  shopBtn: {
    width: '100%',
    maxWidth: 300,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '900',
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: spacing.lg,
  },
  tabsWrapper: {
    marginBottom: spacing.md,
  },
  tabsScroll: {
    paddingHorizontal: spacing.lg,
  },
  tabBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  tabBtnActive: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  tabText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text.inverse,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  orderId: {
    color: colors.text.primary,
    fontWeight: '900',
    fontSize: typography.fontSize.md,
    marginBottom: 4,
  },
  orderDate: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
  },
  orderDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemsCount: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    marginBottom: 4,
  },
  orderTotal: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginLeft: spacing.sm,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionBtnText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  }
});
