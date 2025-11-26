import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/colors';

// Book type matching Open Library API response
export type Book = {
  key: string; // e.g. "/works/OL45804W"
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
};

type BookCardProps = {
  book: Book;
  onFavoritePress?: (book: Book) => void;
};

/**
 * Generate a status badge based on book metadata
 * - Popular: if edition count > 50
 * - New: if first published within last 2 years
 * - Trending: default
 */
function getBookStatus(book: Book): string {
  const currentYear = new Date().getFullYear();
  if (book.edition_count && book.edition_count > 50) return 'Popular';
  if (book.first_publish_year && book.first_publish_year >= currentYear - 2) return 'New';
  return 'Trending';
}

/**
 * BookCard component
 * Displays a book with cover, title, author, and status badge
 * Tappable to navigate to Details screen
 */
export default function BookCard({ book, onFavoritePress }: BookCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  // Build cover image URL from Open Library cover API
  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : null;

  const status = getBookStatus(book);
  const authors = book.author_name?.join(', ') || 'Unknown Author';

  const handlePress = () => {
    // Navigate to Details screen, passing the book key as route param
    // Extract work ID from key like "/works/OL45804W" -> "OL45804W"
    const workId = book.key.split('/').pop() || book.key;
    router.push(`/home/Details?workId=${workId}`);
  };

  const handleFavoritePress = () => {
    if (onFavoritePress) onFavoritePress(book);
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.coverContainer}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.placeholderCover, { backgroundColor: colors.surface }]}>
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>No Cover</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
          {authors}
        </Text>

        <View style={styles.footer}>
          <View style={[styles.statusBadge, getStatusStyle(status)]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>

          {onFavoritePress && (
            <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton}>
              <IconSymbol name="heart" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Helper to get status badge color
function getStatusStyle(status: string) {
  switch (status) {
    case 'Popular':
      return styles.statusPopular;
    case 'New':
      return styles.statusNew;
    default:
      return styles.statusTrending;
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverContainer: {
    marginRight: 12,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statusPopular: {
    backgroundColor: '#f59e0b',
  },
  statusNew: {
    backgroundColor: '#10b981',
  },
  statusTrending: {
    backgroundColor: '#3b82f6',
  },
  favoriteButton: {
    padding: 4,
  },
});
