import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';
import { useAuthStore } from '../src/store/authStore';
import { Session } from '../src/types/auth.types';

export default function SessionsScreen() {
  const router = useRouter();
  const { sessions, fetchSessions, revokeSession, logoutAll, isLoading } = useAuthStore();
  const [isRevoking, setIsRevoking] = React.useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Revoke Session",
      "Are you sure you want to log out from this device?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Revoke", 
          style: "destructive",
          onPress: async () => {
            setIsRevoking(sessionId);
            const res = await revokeSession(sessionId);
            setIsRevoking(null);
            if (!res.success) {
              Alert.alert("Error", res.error || "Failed to revoke session");
            }
          }
        }
      ]
    );
  };

  const handleLogoutAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Log Out All Devices",
      "Are you sure you want to log out from all devices? You will be logged out of this device as well.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out All", 
          style: "destructive",
          onPress: async () => {
            const res = await logoutAll();
            if (!res.success) {
              Alert.alert("Error", res.error || "Failed to logout from all devices");
            } else {
              router.replace('/(auth)/login');
            }
          }
        }
      ]
    );
  };

  const renderSessionItem = ({ item }: { item: Session }) => {
    const isCurrent = item.isCurrentSession;
    return (
      <View style={[styles.sessionCard, isCurrent && styles.currentSessionCard]}>
        <View style={styles.sessionInfo}>
          <View style={styles.deviceRow}>
            <Ionicons 
              name={item.device?.toLowerCase().includes('mobile') || item.device?.toLowerCase().includes('iphone') || item.device?.toLowerCase().includes('android') ? 'phone-portrait-outline' : 'laptop-outline'} 
              size={24} 
              color={isCurrent ? colors.primary : colors.text.secondary} 
            />
            <Text style={[styles.deviceName, isCurrent && styles.currentDeviceName]}>
              {item.device || 'Unknown Device'}
              {isCurrent && ' (This Device)'}
            </Text>
          </View>
          <Text style={styles.sessionDetails}>IP: {item.ip || 'Unknown'}</Text>
          <Text style={styles.sessionDetails}>Last Active: {item.lastActive ? new Date(item.lastActive).toLocaleString() : 'N/A'}</Text>
        </View>

        {!isCurrent && (
          <TouchableOpacity 
            style={styles.revokeButton} 
            onPress={() => handleRevoke(item.id)}
            disabled={isRevoking === item.id}
          >
            {isRevoking === item.id ? (
              <ActivityIndicator size="small" color={colors.status.error} />
            ) : (
              <Text style={styles.revokeText}>Revoke</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Sessions</Text>
      </View>
      
      {isLoading && sessions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="hardware-chip-outline" size={64} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No active sessions found.</Text>
            </View>
          }
          ListFooterComponent={
            sessions.length > 0 ? (
              <TouchableOpacity style={styles.logoutAllButton} onPress={handleLogoutAll}>
                <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
                <Text style={styles.logoutAllText}>Log Out From All Devices</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
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
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  listContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentSessionCard: {
    borderColor: colors.primary + '50',
    backgroundColor: colors.primary + '05',
  },
  sessionInfo: {
    flex: 1,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  deviceName: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  currentDeviceName: {
    color: colors.primary,
  },
  sessionDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  revokeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.status.error + '15',
  },
  revokeText: {
    color: colors.status.error,
    fontWeight: 'bold',
    fontSize: typography.fontSize.sm,
  },
  logoutAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.status.error + '50',
  },
  logoutAllText: {
    marginLeft: spacing.sm,
    color: colors.status.error,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl * 2,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  }
});
