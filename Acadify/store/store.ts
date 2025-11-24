import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import userReducer from './userSlice';
import favoritesReducer from './slices/favoritesSlice';

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  favorites: favoritesReducer,
});

// Persist config: persist favorites and user if needed
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['favorites'], // persist only favorites (token/user can be handled separately)
};

const persistedReducer = persistReducer(persistConfig, rootReducer as any);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // turn off serializable check for redux-persist actions
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
