import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

  const [hasAcceptedTC, setHasAcceptedTC] = useState(true);

  // Load auth state and T&C status on app start
  useEffect(() => {
    console.log('[App Startup] Running loadAuth effect');
    const loadAuth = async () => {
      try {
        console.log('[App Startup] loadAuth executing...');
        const accepted = await AsyncStorage.getItem('hasAcceptedTC');
        if (!accepted) {
          setHasAcceptedTC(false);
        }
        setLoading(false);
        console.log('[App Startup] loadAuth finished successfully');
      } catch (err) {
        console.error('[App Startup] FATAL ERROR in loadAuth:', err);
      }
    };
    loadAuth();
  }, []);

  const handleAcceptTC = async () => {
    await AsyncStorage.setItem('hasAcceptedTC', 'true');
    setHasAcceptedTC(true);
  };

  // Guard routing
  useEffect(() => {
    try {
      console.log('[App Startup] Running routing guard effect');
      if (isLoading || !hasAcceptedTC) {
        console.log('[App Startup] Guard: isLoading or T&C not accepted, skipping routing');
        return;
      }
      
      if (!segments || !segments.length) {
        return;
      }

      console.log('[App Startup] Guard evaluating segments:', segments);
      const inAuthGroup = segments[0] === '(auth)';
      const isSplash = segments[1] === 'splash';
      
      if (!isAuthenticated && !inAuthGroup) {
        console.log('[App Startup] Guard: Redirecting to login');
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup && !isSplash) {
        console.log('[App Startup] Guard: Redirecting to reels');
        router.replace('/(tabs)/reels');
      }
    } catch (err) {
      console.error('[App Startup] FATAL ERROR in routing guard:', err);
    }
  }, [isAuthenticated, isLoading, segments, hasAcceptedTC]);

  try {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <Stack screenOptions={{ headerShown: false }} />
            {!hasAcceptedTC && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: 20 }}>
                <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '100%', maxWidth: 400 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#000' }}>Terms & Conditions</Text>
                  <Text style={{ fontSize: 14, color: '#555', marginBottom: 12, lineHeight: 20 }}>
                    Welcome to Closho! By continuing to use this application, you agree to our Terms of Service and Privacy Policy.
                  </Text>
                  <Text style={{ fontSize: 14, color: '#555', marginBottom: 24, lineHeight: 20 }}>
                    We collect your location and phone number to provide you with the best shopping experience and nearest stores.
                  </Text>
                  <TouchableOpacity onPress={handleAcceptTC} style={{ backgroundColor: '#ff3b30', paddingVertical: 14, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>I Accept & Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </SnackbarProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  } catch (err) {
    console.error('[App Startup] FATAL ERROR in RootLayout render:', err);
    return <Slot />; // Safe fallback
  }
}
