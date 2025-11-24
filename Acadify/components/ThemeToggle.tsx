import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Props for ThemeToggle component
 */
export type ThemeToggleProps = {
  /** Show as compact button instead of full row */
  compact?: boolean;
  /** Show labels */
  showLabels?: boolean;
  /** Custom container style */
  style?: ViewStyle;
};

/**
 * ThemeToggle Component
 * 
 * Reusable dark mode toggle with:
 * - Two variants: full row or compact button
 * - Theme-aware styling
 * - Visual feedback with sun/moon icons
 * - Integrates with ThemeContext
 * - TypeScript typed props
 * 
 * @example
 * ```tsx
 * // Full row variant
 * <ThemeToggle showLabels />
 * 
 * // Compact button variant
 * <ThemeToggle compact />
 * ```
 */
export default function ThemeToggle({
  compact = false,
  showLabels = true,
  style,
}: ThemeToggleProps) {
  const { colors, isDark, toggleTheme } = useTheme();

  /**
   * Render compact button variant
   */
  if (compact) {
    return (
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.compactButton,
          { backgroundColor: colors.cardBackground, borderColor: colors.border },
          style,
        ]}
        activeOpacity={0.7}
      >
        <IconSymbol
          name={isDark ? 'moon.fill' : 'sun.max.fill'}
          size={22}
          color={isDark ? '#fbbf24' : '#f59e0b'}
        />
      </TouchableOpacity>
    );
  }

  /**
   * Render full row variant
   */
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.leftContent}>
        {/* Theme Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
          ]}
        >
          <IconSymbol
            name={isDark ? 'moon.fill' : 'sun.max.fill'}
            size={24}
            color={isDark ? '#fbbf24' : '#f59e0b'}
          />
        </View>

        {/* Labels */}
        {showLabels && (
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            </Text>
          </View>
        )}
      </View>

      {/* Switch */}
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: '#d1d5db', true: colors.primary }}
        thumbColor={isDark ? '#ffffff' : '#f9fafb'}
        ios_backgroundColor="#d1d5db"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  compactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
