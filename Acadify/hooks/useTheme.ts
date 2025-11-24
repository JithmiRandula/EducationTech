/**
 * useTheme Hook
 * 
 * Re-exports the useTheme hook from ThemeContext for convenience
 * This allows importing from hooks directory for consistency
 * 
 * @example
 * ```tsx
 * import { useTheme } from '@/hooks/useTheme';
 * 
 * const { colors, isDark, toggleTheme } = useTheme();
 * ```
 */
export { useTheme } from '@/contexts/ThemeContext';
export type { ThemeMode, ThemeColors } from '@/contexts/ThemeContext';
