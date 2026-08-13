import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../src/types/auth.types';
import { SnackbarProvider } from '../src/components/ui/SnackbarContext';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, isLoading, setLoading, setAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Load auth state on app start
  useEffect(() => {
    const loadAuth = async () => {
        // Zustand persist handles hydration automatically, so we don't need to manually read from AsyncStorage.
        setLoading(false);
    };
    loadAuth();
  }, []);

  // Guard routing
  useEffect(() => {
    if (isLoading) return;
    
    // Wait for segments to be fully populated by Expo Router before checking auth guards
    // This prevents a race condition with index.tsx redirecting to splash
    if (!segments || segments.length === 0) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isSplash = segments[1] === 'splash';
    
    // We let the splash screen handle the 4s delay before making the final jump,
    // but if we are already authenticated and not on splash, ensure we are in tabs.
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup && !isSplash) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return null; // Don't render anything while loading storage, Splash screen will mount next
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SnackbarProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
