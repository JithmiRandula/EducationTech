import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';
import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * Global app wrapper for Expo Router
 * 
 * Wraps the app with multiple providers:
 * 1. Redux Provider - for global state management
 * 2. PersistGate - for persisting Redux state to AsyncStorage
 * 3. ThemeProvider - for global dark/light mode theming
 * 4. GestureHandlerRootView - for gesture support
 * 
 * This ensures all context and state is available throughout the app
 */
export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
