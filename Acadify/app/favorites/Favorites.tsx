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

  // Get favorites from Redux store
  const favorites = useAppSelector((state: RootState) => (state as any).favorites?.items || []);

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
        style={styles.card}
        onPress={() => handleBookPress(item)}
        activeOpacity={0.7}>
        <View style={styles.cardContent}>
          {/* Book Cover */}
          <View style={styles.coverContainer}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={[styles.cover, styles.placeholderCover]}>
                <IconSymbol name="book" size={32} color="#9ca3af" />
              </View>
            )}
          </View>

          {/* Book Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {authors}
            </Text>
            {item.first_publish_year && (
              <Text style={styles.year}>Published: {item.first_publish_year}</Text>
            )}
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol name="trash" size={22} color="#ef4444" />
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
      <IconSymbol name="heart" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Books you favorite will appear here.{'\n'}Start exploring to add your first favorite!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/(tabs)')}>
        <IconSymbol name="magnifyingglass" size={20} color="#fff" />
        <Text style={styles.exploreButtonText}>Explore Books</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Header with count */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Favorites</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{favorites.length}</Text>
            </View>
          </View>

          {/* Favorites List */}
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.key}
            renderItem={renderBookCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  countBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
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
    backgroundColor: '#e5e7eb',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  year: {
    fontSize: 12,
    color: '#9ca3af',
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
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
