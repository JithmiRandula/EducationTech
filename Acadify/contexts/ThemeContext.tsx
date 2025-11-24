import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Theme type definition
 * Supports 'light' and 'dark' modes
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Color palette for light and dark themes
 */
export interface ThemeColors {
  // Background colors
  background: string;
  cardBackground: string;
  surface: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  
  // Other UI elements
  placeholder: string;
  disabled: string;
  shadow: string;
}

/**
 * Theme context interface
 */
interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

/**
 * Light theme color palette
 */
const lightColors: ThemeColors = {
  background: '#f9fafb',
  cardBackground: '#ffffff',
  surface: '#ffffff',
  
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  border: '#e5e7eb',
  divider: '#e5e7eb',
  
  placeholder: '#d1d5db',
  disabled: '#9ca3af',
  shadow: '#000000',
};

/**
 * Dark theme color palette
 */
const darkColors: ThemeColors = {
  background: '#111827',
  cardBackground: '#1f2937',
  surface: '#374151',
  
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  
  primary: '#60a5fa',
  primaryLight: '#93c5fd',
  primaryDark: '#3b82f6',
  
  success: '#34d399',
  error: '#f87171',
  warning: '#fbbf24',
  info: '#60a5fa',
  
  border: '#374151',
  divider: '#4b5563',
  
  placeholder: '#6b7280',
  disabled: '#4b5563',
  shadow: '#000000',
};

// Create the context with undefined as default
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// AsyncStorage key for theme persistence
const THEME_STORAGE_KEY = '@unireads_theme';

/**
 * Theme Provider Component
 * Manages global theme state and provides theme switching functionality
 * Persists theme preference to AsyncStorage
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load theme preference from AsyncStorage on mount
   */
  useEffect(() => {
    loadTheme();
  }, []);

  /**
   * Load saved theme from AsyncStorage
   */
  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save theme preference to AsyncStorage
   */
  const saveTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  /**
   * Set specific theme mode
   */
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  // Get colors based on current theme
  const colors = theme === 'light' ? lightColors : darkColors;
  const isDark = theme === 'dark';

  // Context value
  const value: ThemeContextType = {
    theme,
    colors,
    toggleTheme,
    setTheme,
    isDark,
  };

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Custom hook to use theme context
 * Throws error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Export color palettes for direct usage if needed
 */
export { lightColors, darkColors };
