import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

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
 * Light theme color palette - Using neutral color scheme
 */
const lightColors: ThemeColors = {
  background: Colors.background,        // #FFFBF8 - Cream
  cardBackground: Colors.card,          // #FFFFFF - White
  surface: Colors.lightBeige,           // #F5F1ED - Light Beige
  
  text: Colors.text,                    // #3D3D3D - Dark Olive
  textSecondary: Colors.textSecondary,  // #6B7062 - Olive
  textTertiary: Colors.textLight,       // #B0B0B0 - Medium Gray
  
  primary: Colors.primary,              // #6B7062 - Olive
  primaryLight: Colors.olive,           // #6B7062 - Olive
  primaryDark: Colors.darkOlive,        // #3D3D3D - Dark Olive
  
  success: '#10b981',
  error: Colors.error,                  // #DC2626 - Error Red
  warning: '#f59e0b',
  info: Colors.primary,
  
  border: Colors.lightGray,             // #D3D3D3 - Light Gray
  divider: Colors.lightGray,            // #D3D3D3 - Light Gray
  
  placeholder: Colors.mediumGray,       // #B0B0B0 - Medium Gray
  disabled: Colors.mediumGray,          // #B0B0B0 - Medium Gray
  shadow: '#000000',
};

/**
 * Dark theme color palette - Darker neutral tones
 */
const darkColors: ThemeColors = {
  background: '#1a1a1a',                // Very Dark Gray
  cardBackground: '#2d2d2d',            // Dark Gray
  surface: '#3d3d3d',                   // Medium Dark Gray
  
  text: Colors.cream,                   // #FFFBF8 - Cream (for dark bg)
  textSecondary: Colors.lightBeige,     // #F5F1ED - Light Beige
  textTertiary: Colors.mediumGray,      // #B0B0B0 - Medium Gray
  
  primary: Colors.olive,                // #6B7062 - Olive
  primaryLight: '#8a9080',              // Lighter Olive
  primaryDark: Colors.darkOlive,        // #3D3D3D - Dark Olive
  
  success: '#34d399',
  error: '#f87171',                     // Lighter red for dark mode
  warning: '#fbbf24',
  info: Colors.olive,
  
  border: '#4a4a4a',                    // Dark border
  divider: '#4a4a4a',                   // Dark divider
  
  placeholder: Colors.mediumGray,       // #B0B0B0 - Medium Gray
  disabled: '#6b6b6b',                  // Disabled gray
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
