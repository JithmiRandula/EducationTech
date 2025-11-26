import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/userSlice';
import { clearFavorites } from '@/store/slices/favoritesSlice';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RootState } from '@/store/store';
import { Colors } from '@/constants/colors';

/**
 * Profile Screen for UniReads
 * 
 * Features:
 * 1️⃣ Displays logged-in user's username and email
 * 2️⃣ Dark Mode toggle switch with real-time UI updates
 * 3️⃣ Theme preference stored in AsyncStorage via ThemeContext
 * 4️⃣ Logout functionality that clears user data and navigation
 * 5️⃣ Clean, modern UI with Feather icons
 * 6️⃣ Fully typed with TypeScript
 * 7️⃣ Dynamic theming based on light/dark mode
 */
export default function Profile() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get theme context for dark mode toggle
  const { theme, colors, toggleTheme, isDark } = useTheme();
  
  // Get user info from Redux store
  const user = useAppSelector((state: RootState) => (state as any).user);
  const username = user?.username || 'Guest User';
  const userId = user?.id || 'N/A';

  /**
   * Handle user logout
   * - Clears user token from AsyncStorage
   * - Clears user and favorites from Redux store
   * - Navigates back to login screen
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear token from AsyncStorage
              await AsyncStorage.removeItem('unireads_token');
              
              // Clear Redux store
              dispatch(clearUser());
              dispatch(clearFavorites());
              
              // Navigate to login screen
              router.replace('/auth/Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <View style={[styles.avatarContainer, { backgroundColor: Colors.primary }]}>
          <IconSymbol name="person.fill" size={48} color={Colors.cream} />
        </View>
        <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
        <Text style={[styles.userId, { color: colors.textSecondary }]}>ID: {userId}</Text>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

        {/* Dark Mode Toggle */}
        <View style={[styles.settingCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? Colors.darkOlive : Colors.lightBeige }]}>
                <IconSymbol 
                  name={isDark ? 'moon.fill' : 'sun.max.fill'} 
                  size={24} 
                  color={isDark ? Colors.olive : Colors.primary} 
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: Colors.lightGray, true: Colors.primary }}
              thumbColor={isDark ? Colors.cream : Colors.lightBeige}
              ios_backgroundColor={Colors.lightGray}
            />
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

        {/* Account Info Card */}
        <TouchableOpacity 
          style={[styles.settingCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.lightBeige }]}>
                <IconSymbol name="person.circle" size={24} color={Colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Account Details</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  View and edit profile
                </Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        {/* Favorites Count Card */}
        <TouchableOpacity 
          style={[styles.settingCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)')}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.lightBeige }]}>
                <IconSymbol name="heart.fill" size={24} color={Colors.error} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>My Favorites</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  View saved books
                </Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

        {/* App Version */}
        <View style={[styles.settingCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.lightBeige }]}>
                <IconSymbol name="info.circle" size={24} color={Colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>App Version</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  UniReads v1.0.0
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: Colors.error }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color={Colors.cream} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={[styles.footer, { color: colors.textTertiary }]}>
        Made with ❤️ for UniReads
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
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
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: Colors.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
});
