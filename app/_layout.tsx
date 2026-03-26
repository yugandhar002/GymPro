import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useAuthStore } from '@/store/useAuthStore';

function useProtectedRoute(user: any) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isNavigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    if (!navigationState?.key) return;
    setNavigationReady(true);
  }, [navigationState?.key]);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAuthenticated = !!user;

    if (!isAuthenticated) {
      // If NOT logged in, and NOT on an auth screen (login/register), go to login
      if (segments[1] !== 'login' && segments[1] !== 'register') {
        router.replace('/(auth)/login');
      }
    } else if (isAuthenticated) {
      if (user.status === 'pending') {
        if (segments[1] !== 'pending') {
          router.replace('/(auth)/pending');
        }
      } else if (user.status === 'denied') {
        alert("Your application was denied by the owner.");
        useAuthStore.getState().logout();
      } else {
        // Approved user
        if (inAuthGroup && segments[1] !== 'pending') {
          router.replace('/(tabs)');
        }
      }
    }
  }, [user, segments, isNavigationReady]);
}

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  useProtectedRoute(user);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(admin)" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
