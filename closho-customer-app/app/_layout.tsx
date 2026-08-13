import 'react-native-gesture-handler';
import 'react-native-reanimated';
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
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('[App Startup] Error preventing splash screen auto hide');
});

const queryClient = new QueryClient();

export default function RootLayout() {
  console.log('[App Startup] RootLayout rendering...');
  
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Load auth state on app start
  useEffect(() => {
    console.log('[App Startup] Running loadAuth effect');
    const loadAuth = async () => {
      try {
        console.log('[App Startup] loadAuth executing...');
        // Zustand persist handles hydration automatically, so we don't need to manually read from AsyncStorage.
        setLoading(false);
        console.log('[App Startup] loadAuth finished successfully');
      } catch (err) {
        console.error('[App Startup] FATAL ERROR in loadAuth:', err);
      }
    };
    loadAuth();
  }, []);

  // Guard routing
  useEffect(() => {
    try {
      console.log('[App Startup] Running routing guard effect');
      if (isLoading) {
        console.log('[App Startup] Guard: isLoading is true, skipping routing');
        return;
      }
      
      // Wait for segments to be fully populated by Expo Router before checking auth guards
      // This prevents a race condition with index.tsx redirecting to splash
      if (!segments || segments.length === 0) {
        console.log('[App Startup] Guard: segments not ready, skipping routing');
        return;
      }

      console.log('[App Startup] Guard evaluating segments:', segments);
      const inAuthGroup = segments[0] === '(auth)';
      const isSplash = segments[1] === 'splash';
      
      console.log(`[App Startup] Guard state: isAuthenticated=${isAuthenticated}, inAuthGroup=${inAuthGroup}, isSplash=${isSplash}`);
      
      // We let the splash screen handle the 4s delay before making the final jump,
      // but if we are already authenticated and not on splash, ensure we are in tabs.
      if (!isAuthenticated && !inAuthGroup) {
        console.log('[App Startup] Guard: Redirecting to login');
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup && !isSplash) {
        console.log('[App Startup] Guard: Redirecting to tabs');
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('[App Startup] FATAL ERROR in routing guard:', err);
    }
  }, [isAuthenticated, isLoading, segments]);

  try {
    if (isLoading) {
      console.log('[App Startup] RootLayout returning null for isLoading');
      // Replace `return null` with a safe empty View during loading to prevent native crashes in Bridgeless mode
      return <SafeAreaProvider><Slot /></SafeAreaProvider>; 
    }

    console.log('[App Startup] RootLayout returning main provider tree');
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SnackbarProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  } catch (err) {
    console.error('[App Startup] FATAL ERROR in RootLayout render:', err);
    return <Slot />; // Safe fallback
  }
}
