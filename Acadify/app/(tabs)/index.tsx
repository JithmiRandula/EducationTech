import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch } from '@/store/hooks';
import { addFavorite } from '@/store/slices/favoritesSlice';
import BookCard, { Book } from '@/components/BookCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Home Screen for UniReads
 * - Fetches books from Open Library API
 * - Displays searchable book list
 * - Supports pull-to-refresh
 * - Shows loading and error states
 * - Allows adding books to favorites
 */
export default function Home() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('javascript'); // Default search term
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch books from Open Library search API
   * @param query - Search term (e.g., "python", "react")
   * @param isRefresh - Whether this is a pull-to-refresh action
   */
  const fetchBooks = useCallback(async (query: string, isRefresh = false) => {
    if (!query.trim()) return;

    // Set appropriate loading state
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract relevant book data from API response
      const fetchedBooks: Book[] = (data.docs || []).map((doc: any) => ({
        key: doc.key,
        title: doc.title,
        author_name: doc.author_name,
        cover_i: doc.cover_i,
        first_publish_year: doc.first_publish_year,
        edition_count: doc.edition_count,
      }));

      setBooks(fetchedBooks);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch initial books on mount
  React.useEffect(() => {
    fetchBooks(searchQuery);
  }, []);

  // Handle search button press
  const handleSearch = () => {
    fetchBooks(searchQuery);
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    fetchBooks(searchQuery, true);
  };

  // Handle adding book to favorites
  const handleFavoritePress = (book: Book) => {
    dispatch(addFavorite(book));
    // Optional: Show a toast/snackbar notification
  };

  // Render loading state
  if (loading && books.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading books...</Text>
      </View>
    );
  }

  // Render error state
  if (error && books.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => fetchBooks(searchQuery)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search books..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <BookCard book={item} onFavoritePress={handleFavoritePress} />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="book" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No books found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Try a different search term</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: Colors.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
  },
});
