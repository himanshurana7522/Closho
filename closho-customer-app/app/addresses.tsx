import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';
import * as Haptics from 'expo-haptics';
import { Button } from '../src/components/ui/Button';
import { useProfileStore } from '../src/store/profileStore';

export default function AddressesScreen() {
  const router = useRouter();
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useProfileStore();
  const [isModalVisible, setModalVisible] = useState(false);
  
  const [newType, setNewType] = useState('Home');
  const [newAddress, setNewAddress] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAddress({
      id: Date.now().toString(),
      type: newType,
      address: newAddress,
      isDefault: false
    });
    setModalVisible(false);
    setNewAddress('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No addresses saved.</Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={styles.addressCard}>
              <View style={styles.cardHeader}>
                <View style={styles.typeWrapper}>
                  <Ionicons 
                    name={addr.type === 'Home' ? 'home-outline' : 'briefcase-outline'} 
                    size={20} 
                    color={colors.primary} 
                  />
                  <Text style={styles.typeText}>{addr.type}</Text>
                </View>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressText}>{addr.address}</Text>
              <View style={styles.actions}>
                {!addr.isDefault && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(); setDefaultAddress(addr.id); }}>
                    <Text style={styles.actionText}>Make Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(); removeAddress(addr.id); }}>
                  <Text style={[styles.actionText, { color: colors.status.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Add New Address" 
          onPress={() => { Haptics.impactAsync(); setModalVisible(true); }} 
        />
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.typeSelector}>
                {['Home', 'Work', 'Other'].map(type => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.typeBtn, newType === type && styles.typeBtnActive]}
                    onPress={() => setNewType(type)}
                  >
                    <Text style={[styles.typeBtnText, newType === type && styles.typeBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Full Address</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="123 Street Name, City, Zip"
                placeholderTextColor={colors.text.tertiary}
                value={newAddress}
                onChangeText={setNewAddress}
                multiline
              />
              
              <Button title="Save Address" onPress={handleAddAddress} style={{ marginTop: spacing.xl }} />
            </View>
          </View>
        </View>
      </Modal>
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
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
    marginLeft: spacing.sm,
  },
  defaultBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  addressText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  actionBtn: {
    marginRight: spacing.lg,
  },
  actionText: {
    color: colors.text.primary,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl * 2,
  },
  emptyText: {
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.xl,
  },
  inputLabel: {
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.md,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  typeBtnText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    minHeight: 100,
    textAlignVertical: 'top',
  }
});
