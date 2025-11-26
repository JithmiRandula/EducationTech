import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removeFavorite } from '@/store/slices/favoritesSlice';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RootState } from '@/store/store';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Type definition for a favorite book
 * Matches the Book type from favoritesSlice.ts
 */
type Book = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
};

/**
 * Favorites Screen for UniReads
 * - Displays all favorite books from Redux store
 * - Shows book cover, title, and author for each card
 * - Allows removing books from favorites with confirmation
 * - Navigates to Details screen when card is tapped
 * - Shows empty state when no favorites exist
 */
export default function Favorites() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  // Get favorites from Redux store
  const favorites = useAppSelector((state: RootState) => (state as any).favorites?.items || []);
  
  // State for showing limited items
  const [visibleCount, setVisibleCount] = React.useState(5);

  /**
   * Navigate to Details screen with the selected book's work ID
   * Extracts work ID from the book key (e.g., "/works/OL45804W" -> "OL45804W")
   */
  const handleBookPress = (book: Book) => {
    const workId = book.key.replace('/works/', '');
    router.push(`/home/Details?workId=${workId}`);
  };

  /**
   * Remove a book from favorites with confirmation
   * Shows alert dialog to confirm deletion
   */
  const handleRemoveFavorite = (book: Book) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove "${book.title}" from your favorites?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeFavorite(book.key));
          },
        },
      ]
    );
  };

  /**
   * Render individual favorite book card
   */
  const renderBookCard = ({ item }: { item: Book }) => {
    // Build cover image URL from cover_i ID
    const coverUrl = item.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
      : null;

    const authors = item.author_name?.join(', ') || 'Unknown Author';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.text }]}
        onPress={() => handleBookPress(item)}
        activeOpacity={0.7}>
        <View style={styles.cardContent}>
          {/* Book Cover */}
          <View style={styles.coverContainer}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={[styles.cover, styles.placeholderCover, { backgroundColor: colors.surface }]}>
                <IconSymbol name="book" size={32} color={colors.textTertiary} />
              </View>
            )}
          </View>

          {/* Book Info */}
          <View style={styles.infoContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
              {authors}
            </Text>
            {item.first_publish_year && (
              <Text style={[styles.year, { color: colors.textTertiary }]}>Published: {item.first_publish_year}</Text>
            )}
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol name="trash" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state when no favorites exist
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="heart" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Favorites Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Books you favorite will appear here.{'\n'}Start exploring to add your first favorite!
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)')}>
        <IconSymbol name="magnifyingglass" size={20} color={Colors.cream} />
        <Text style={styles.exploreButtonText}>Explore Books</Text>
      </TouchableOpacity>
    </View>
  );

  // Get visible favorites
  const visibleFavorites = favorites.slice(0, visibleCount);
  const hasMore = favorites.length > visibleCount;

  // Handle show more
  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 5);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Header with count */}
          <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Favorites</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.countText}>{favorites.length}</Text>
            </View>
          </View>

          {/* Favorites List */}
          <FlatList
            data={visibleFavorites}
            keyExtractor={(item) => item.key}
            renderItem={renderBookCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              hasMore ? (
                <TouchableOpacity
                  style={[styles.showMoreButton, { backgroundColor: colors.primary }]}
                  onPress={handleShowMore}
                  activeOpacity={0.8}>
                  <Text style={styles.showMoreText}>Show More</Text>
                  <IconSymbol name="chevron.down" size={18} color={Colors.cream} />
                </TouchableOpacity>
              ) : null
            }
          />
        </>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    color: Colors.cream,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  coverContainer: {
    marginRight: 12,
  },
  cover: {
    width: 70,
    height: 100,
    borderRadius: 8,
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 4,
  },
  year: {
    fontSize: 12,
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  exploreButtonText: {
    color: Colors.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  showMoreText: {
    color: Colors.cream,
    fontSize: 12,
    fontWeight: '600',
  },
});
