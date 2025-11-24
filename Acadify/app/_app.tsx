import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';

// Global app wrapper for Expo Router. This wraps the app with Redux Provider and PersistGate
// so global state (favorites) is available and persisted across launches.
export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
