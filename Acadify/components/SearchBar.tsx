import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Props for SearchBar component
 */
export type SearchBarProps = {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChangeText: (text: string) => void;
  /** Callback when search is submitted */
  onSearch?: () => void;
  /** Callback to clear search */
  onClear?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Custom container style */
  style?: ViewStyle;
  /** Whether the input is disabled */
  disabled?: boolean;
};

/**
 * SearchBar Component
 * 
 * Reusable search bar with:
 * - Theme-aware styling (light/dark mode)
 * - Search icon
 * - Clear button (when text exists)
 * - Submit button
 * - Fully typed with TypeScript
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   value={query}
 *   onChangeText={setQuery}
 *   onSearch={handleSearch}
 *   placeholder="Search books..."
 * />
 * ```
 */
export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder = 'Search...',
  style,
  disabled = false,
}: SearchBarProps) {
  const { colors, isDark } = useTheme();

  /**
   * Handle clear button press
   */
  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }, style]}>
      {/* Search Icon */}
      <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />

      {/* Text Input */}
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        onSubmitEditing={onSearch}
        returnKeyType="search"
        editable={!disabled}
      />

      {/* Clear Button (shown when text exists) */}
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <IconSymbol name="xmark.circle.fill" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      {/* Search Button */}
      {onSearch && (
        <TouchableOpacity
          onPress={onSearch}
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          disabled={disabled || value.length === 0}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.right" size={18} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  searchButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
