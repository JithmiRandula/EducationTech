/**
 * Components Index
 * 
 * Barrel export file for easy component imports
 * 
 * @example
 * ```tsx
 * import { BookCard, SearchBar, Header, ThemeToggle } from '@/components';
 * ```
 */

export { default as BookCard } from './BookCard';
export { default as SearchBar } from './SearchBar';
export { default as Header } from './Header';
export { default as ThemeToggle } from './ThemeToggle';

// Export types
export type { Book } from './BookCard';
export type { SearchBarProps } from './SearchBar';
export type { HeaderProps } from './Header';
export type { ThemeToggleProps } from './ThemeToggle';
