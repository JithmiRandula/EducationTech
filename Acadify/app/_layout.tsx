import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import { ThemeProvider } from '@/contexts/ThemeContext';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'auth/Login',
};

/**
 * Root Layout Component with Authentication Protection
 * - Checks for auth token on app start
 * - Redirects to login if no token found
 * - Shows tabs if authenticated
 */
function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Check if user has a valid token
        const token = await AsyncStorage.getItem('unireads_token');
        console.log('Auth check - Token exists:', !!token);
        
        // Set initial route based on token
        if (!token) {
          setInitialRoute('auth/Login');
        } else {
          setInitialRoute('tabs');
        }
        
        // Get current route
        const inAuthGroup = segments[0] === 'auth';
        
        if (!token && !inAuthGroup) {
          // No token and not in auth screens, redirect to login
          console.log('Redirecting to login - no token');
          router.replace('/auth/Login');
        } else if (token && inAuthGroup) {
          // Has token but in auth screens, redirect to app
          console.log('Redirecting to home - has token');
          router.replace('/');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setInitialRoute('auth/Login');
      } finally {
        setIsReady(true);
      }
    })();
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/Login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="home/Details" options={{ headerShown: true, title: 'Book Details' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

/**
 * Root Layout Component
 * Wraps entire app with necessary providers:
 * - Redux Provider for state management
 * - PersistGate for state persistence
 * - ThemeProvider for dark/light mode
 * - NavigationThemeProvider for navigation theming
 * - GestureHandlerRootView for gesture support
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <RootLayoutNav />
              <StatusBar style="auto" />
            </NavigationThemeProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
