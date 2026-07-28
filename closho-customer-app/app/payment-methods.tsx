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

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useProfileStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAddCard = () => {
    if (cardNumber.length < 4) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const last4 = cardNumber.slice(-4);
    // Simple logic to guess brand from first digit
    const brand = cardNumber.startsWith('4') ? 'Visa' : (cardNumber.startsWith('5') ? 'Mastercard' : 'Card');
    
    addPaymentMethod({
      id: Date.now().toString(),
      brand,
      last4,
      exp: expiry || '12/30',
      isDefault: false
    });
    setModalVisible(false);
    setCardNumber('');
    setExpiry('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No payment methods saved.</Text>
          </View>
        ) : (
          paymentMethods.map((card) => (
            <View key={card.id} style={styles.cardItemWrapper}>
              <View style={styles.cardItem}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="card" size={24} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.cardBrand}>{card.brand} ending in {card.last4}</Text>
                    <Text style={styles.cardExp}>Expires {card.exp}</Text>
                  </View>
                </View>
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <View style={styles.actions}>
                {!card.isDefault && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(); setDefaultPaymentMethod(card.id); }}>
                    <Text style={styles.actionText}>Make Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(); removePaymentMethod(card.id); }}>
                  <Text style={[styles.actionText, { color: colors.status.error }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Add New Payment Method" 
          onPress={() => { Haptics.impactAsync(); setModalVisible(true); }} 
        />
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={colors.text.tertiary}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
              />
              
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="MM/YY"
                placeholderTextColor={colors.text.tertiary}
                value={expiry}
                onChangeText={setExpiry}
                keyboardType="number-pad"
                maxLength={5}
              />
              
              <Button title="Save Card" onPress={handleAddCard} style={{ marginTop: spacing.xl }} />
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
  cardItemWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    marginRight: spacing.lg,
  },
  actionText: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardBrand: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
    marginBottom: 4,
  },
  cardExp: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
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
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.md,
    height: 48,
  }
});
