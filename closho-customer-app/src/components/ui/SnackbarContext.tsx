import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Animated, Text, StyleSheet, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import * as Haptics from 'expo-haptics';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarContextData {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextData>({
  showSnackbar: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const showSnackbar = (msg: string, msgType: SnackbarType = 'info') => {
    setMessage(msg);
    setType(msgType);

    // Haptics for premium feel
    if (msgType === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (msgType === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Slide in
    Animated.spring(slideAnim, {
      toValue: 20, // Slide down from top
      useNativeDriver: true,
      bounciness: 8,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return colors.status.success;
      case 'error': return colors.status.error;
      default: return colors.surfaceLight;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'warning';
      default: return 'information-circle';
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <SafeAreaView style={styles.safeArea} pointerEvents="none">
        <Animated.View 
          style={[
            styles.snackbar, 
            { 
              backgroundColor: getBackgroundColor(),
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Ionicons name={getIcon() as any} size={24} color={colors.text.inverse} style={styles.icon} />
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      </SafeAreaView>
    </SnackbarContext.Provider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
  },
  snackbar: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    minWidth: 200,
    maxWidth: '90%',
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
});
