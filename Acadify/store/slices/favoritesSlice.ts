import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Type for a book item stored in favorites
export type Book = {
  key: string; // Open Library work key or unique identifier (e.g. '/works/OL...')
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

type FavoritesState = {
  items: Book[];
};

const initialState: FavoritesState = {
  items: [],
};

/**
 * favoritesSlice
 * - stores an array of favorite books
 * - exposes add/remove actions
 * - designed to be persisted via redux-persist
 */
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite(state, action: PayloadAction<Book>) {
      // avoid duplicates by key
      const exists = state.items.find((b) => b.key === action.payload.key);
      if (!exists) state.items.push(action.payload);
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.items = state.items.filter((b) => b.key !== action.payload);
    },
    clearFavorites(state) {
      state.items = [];
    },
  },
});

export const { addFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
