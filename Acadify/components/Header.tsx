import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Props for Header component
 */
export type HeaderProps = {
  /** Header title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show back button */
  showBack?: boolean;
  /** Custom back button action */
  onBack?: () => void;
  /** Right side action button */
  rightAction?: {
    icon: any; // IconSymbol name type
    onPress: () => void;
  };
  /** Custom container style */
  style?: ViewStyle;
};

/**
 * Header Component
 * 
 * Reusable header with:
 * - Theme-aware styling (light/dark mode)
 * - Optional back button
 * - Title and subtitle
 * - Optional right action button
 * - TypeScript typed props
 * 
 * @example
 * ```tsx
 * <Header
 *   title="Book Details"
 *   subtitle="View information"
 *   showBack
 *   rightAction={{
 *     icon: 'heart',
 *     onPress: handleFavorite
 *   }}
 * />
 * ```
 */
export default function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  style,
}: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  /**
   * Handle back button press
   */
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }, style]}>
      {/* Left Side - Back Button */}
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center - Title and Subtitle */}
      <View style={styles.centerContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Side - Action Button */}
      <View style={styles.rightContainer}>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name={rightAction.icon} size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  actionButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
