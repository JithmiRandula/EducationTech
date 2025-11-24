import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addFavorite, removeFavorite } from '@/store/slices/favoritesSlice';
import type { RootState } from '@/store/store';

/**
 * Book type for favorites
 */
export type Book = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
};

/**
 * Hook return interface
 */
export interface UseFavoritesState {
  /** Array of all favorite books */
  favorites: Book[];
  /** Check if a book is in favorites */
  isFavorite: (bookKey: string) => boolean;
  /** Add a book to favorites */
  addToFavorites: (book: Book) => void;
  /** Remove a book from favorites */
  removeFromFavorites: (bookKey: string) => void;
  /** Toggle favorite status (add if not favorite, remove if favorite) */
  toggleFavorite: (book: Book) => void;
  /** Get number of favorites */
  favoritesCount: number;
}

/**
 * useFavorites Hook
 * 
 * Custom hook for managing favorite books with Redux integration
 * 
 * Features:
 * - Add/remove books from favorites
 * - Check if a book is favorited
 * - Toggle favorite status
 * - Get favorites count
 * - Redux state management with persistence
 * - TypeScript typed return values
 * - User feedback with alerts
 * 
 * @example
 * ```tsx
 * const {
 *   favorites,
 *   isFavorite,
 *   addToFavorites,
 *   removeFromFavorites,
 *   toggleFavorite
 * } = useFavorites();
 * 
 * // Check if book is favorited
 * const favorited = isFavorite(book.key);
 * 
 * // Toggle favorite
 * toggleFavorite(book);
 * ```
 * 
 * @returns Hook state with favorites data and control functions
 */
export function useFavorites(): UseFavoritesState {
  const dispatch = useAppDispatch();

  // Get favorites from Redux store
  const favorites = useAppSelector(
    (state: RootState) => (state as any).favorites?.items || []
  );

  /**
   * Check if a book is in favorites
   * 
   * @param bookKey - The book's unique key (e.g., "/works/OL45804W")
   * @returns True if book is in favorites, false otherwise
   */
  const isFavorite = useCallback(
    (bookKey: string): boolean => {
      return favorites.some((book: Book) => book.key === bookKey);
    },
    [favorites]
  );

  /**
   * Add a book to favorites
   * 
   * @param book - Book object to add
   */
  const addToFavorites = useCallback(
    (book: Book) => {
      // Check if already favorited
      if (isFavorite(book.key)) {
        Alert.alert('Already Favorited', 'This book is already in your favorites.');
        return;
      }

      // Dispatch Redux action
      dispatch(addFavorite(book));
      Alert.alert('Added to Favorites', `"${book.title}" has been added to your favorites.`);
    },
    [dispatch, isFavorite]
  );

  /**
   * Remove a book from favorites
   * 
   * @param bookKey - The book's unique key to remove
   */
  const removeFromFavorites = useCallback(
    (bookKey: string) => {
      // Dispatch Redux action
      dispatch(removeFavorite(bookKey));
    },
    [dispatch]
  );

  /**
   * Toggle favorite status
   * Add if not favorited, remove if favorited
   * 
   * @param book - Book object to toggle
   */
  const toggleFavorite = useCallback(
    (book: Book) => {
      if (isFavorite(book.key)) {
        removeFromFavorites(book.key);
        Alert.alert('Removed from Favorites', `"${book.title}" has been removed from your favorites.`);
      } else {
        addToFavorites(book);
      }
    },
    [isFavorite, addToFavorites, removeFromFavorites]
  );

  /**
   * Get number of favorite books
   */
  const favoritesCount = favorites.length;

  return {
    favorites,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    favoritesCount,
  };
}
