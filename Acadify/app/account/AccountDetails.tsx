import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RootState } from '@/store/store';
import { Colors } from '@/constants/colors';

/**
 * Account Details Screen
 * Displays complete information about the logged-in user
 */
export default function AccountDetails() {
  const router = useRouter();
  const { colors } = useTheme();
  
  // Get user info from Redux store
  const userState = useAppSelector((state: RootState) => state.user);
  const user = userState?.user;
  
  // Get user details
  const username = user?.username || 'N/A';
  const email = user?.email || 'N/A';
  const userId = user?.id || 'N/A';
  const gender = user?.gender || 'N/A';
  
  // Get gender-based profile image
  const profileImage = gender === 'female' 
    ? require('@/assets/images/female.png') 
    : require('@/assets/images/male.png');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Profile Image Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.avatarContainer}>
            <Image 
              source={profileImage} 
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.mainUsername, { color: colors.text }]}>{username}</Text>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

          {/* User ID */}
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.lightBeige }]}>
                  <IconSymbol name="number" size={22} color={Colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>User ID</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{userId}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Username */}
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.lightBeige }]}>
                  <IconSymbol name="person.fill" size={22} color={Colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Username</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{username}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Gender */}
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.lightBeige }]}>
                  <IconSymbol 
                    name={gender === 'female' ? "figure.stand.dress" : "figure.stand"} 
                    size={22} 
                    color={Colors.primary} 
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Gender</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.lightBeige }]}>
                  <IconSymbol name="envelope.fill" size={22} color={Colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{email}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Account Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Status</Text>
          
          <View style={[styles.statusCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
              Your account is active and in good standing
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  mainUsername: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoLeft: {
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
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
