/**
 * Hooks Index
 * 
 * Barrel export file for easy hook imports
 * 
 * @example
 * ```tsx
 * import { useFetchBooks, useFavorites, useTheme } from '@/hooks';
 * ```
 */

export { useFetchBooks } from './useFetchBooks';
export { useFavorites } from './useFavorites';
export { useTheme } from './useTheme';

// Export types
export type { UseFetchBooksState, Book as FetchBook } from './useFetchBooks';
export type { UseFavoritesState, Book as FavoriteBook } from './useFavorites';
export type { ThemeMode, ThemeColors } from './useTheme';
