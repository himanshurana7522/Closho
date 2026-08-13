import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import * as Haptics from 'expo-haptics';
import { useSnackbar } from '../ui/SnackbarContext';

import { useStoreStore } from '../../store/storeStore';
import { Store } from '../../types/store.types';

export const StoreSelector = () => {
  const { currentStore, availableStores, setCurrentStore, isSelectorOpen, setSelectorOpen } = useStoreStore();
  const { showSnackbar } = useSnackbar();

  const handleSelectStore = (store: Store) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStore(store);
    setSelectorOpen(false);
    showSnackbar(`Switched to ${store.name}`, 'success');
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={0.7} 
        onPress={() => {
          Haptics.selectionAsync();
          setSelectorOpen(true);
        }}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="location-sharp" size={18} color={colors.background} />
        </View>
        <View style={styles.storeInfo}>
          <Text style={styles.storeLabel}>Delivering to</Text>
          <Text style={styles.storeName} numberOfLines={1}>{currentStore ? currentStore.name : 'Select a store'}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={isSelectorOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectorOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Store</Text>
              <TouchableOpacity onPress={() => setSelectorOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableStores}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text.secondary }}>
                  No stores found nearby.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.storeItem,
                    currentStore?.id === item.id && styles.selectedStoreItem
                  ]}
                  onPress={() => handleSelectStore(item)}
                >
                  <View style={styles.storeItemLeft}>
                    <Ionicons 
                      name={currentStore?.id === item.id ? "location" : "location-outline"} 
                      size={24} 
                      color={currentStore?.id === item.id ? colors.primary : colors.text.secondary} 
                    />
                    <View style={styles.storeItemInfo}>
                      <Text style={[styles.storeItemName, currentStore?.id === item.id && styles.selectedStoreText]}>
                        {item.name}
                      </Text>
                      <Text style={styles.storeItemAddress}>{item.city}, {item.pincode}</Text>
                    </View>
                  </View>
                  <Text style={styles.storeItemDistance}>{item.deliveryRadiusKm ? `${item.deliveryRadiusKm} km` : ''}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    maxWidth: 220,
  },
  iconContainer: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
    flex: 1,
  },
  storeLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  storeName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
  },
  storeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceLight,
  },
  selectedStoreItem: {
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  storeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeItemInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  storeItemName: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  selectedStoreText: {
    color: colors.primary,
  },
  storeItemAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  storeItemDistance: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  }
});
