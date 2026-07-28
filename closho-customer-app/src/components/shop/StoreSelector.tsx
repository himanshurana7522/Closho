import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import * as Haptics from 'expo-haptics';
import { useSnackbar } from '../ui/SnackbarContext';

const mockStores = [
  { id: '1', name: 'Closho Andheri', address: '123 Main St, Andheri West', distance: '1.2 km' },
  { id: '2', name: 'Closho Bandra', address: '45 Linking Road, Bandra West', distance: '3.5 km' },
  { id: '3', name: 'Closho Juhu', address: '78 Juhu Tara Road', distance: '5.1 km' },
];

export const StoreSelector = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState(mockStores[0]);
  const { showSnackbar } = useSnackbar();

  const handleSelectStore = (store: typeof mockStores[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStore(store);
    setModalVisible(false);
    showSnackbar(`Switched to ${store.name}`, 'success');
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        activeOpacity={0.7} 
        onPress={() => {
          Haptics.selectionAsync();
          setModalVisible(true);
        }}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="location-sharp" size={18} color={colors.background} />
        </View>
        <View style={styles.storeInfo}>
          <Text style={styles.storeLabel}>Delivering to</Text>
          <Text style={styles.storeName} numberOfLines={1}>{selectedStore.name}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Store</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={mockStores}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.storeItem,
                    selectedStore.id === item.id && styles.selectedStoreItem
                  ]}
                  onPress={() => handleSelectStore(item)}
                >
                  <View style={styles.storeItemLeft}>
                    <Ionicons 
                      name={selectedStore.id === item.id ? "location" : "location-outline"} 
                      size={24} 
                      color={selectedStore.id === item.id ? colors.primary : colors.text.secondary} 
                    />
                    <View style={styles.storeItemInfo}>
                      <Text style={[styles.storeItemName, selectedStore.id === item.id && styles.selectedStoreText]}>
                        {item.name}
                      </Text>
                      <Text style={styles.storeItemAddress}>{item.address}</Text>
                    </View>
                  </View>
                  <Text style={styles.storeItemDistance}>{item.distance}</Text>
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
