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

/**
 * Search Screen for UniReads
 * - Search books from Open Library API
 * - Displays searchable book list
 * - Supports pull-to-refresh
 * - Shows loading and error states
 * - Allows adding books to favorites
 */
export default function SearchScreen() {
  const dispatch = useAppDispatch();
  
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
  };

  // Render loading state
  if (loading && books.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Searching books...</Text>
      </View>
    );
  }

  // Render error state
  if (error && books.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchBooks(searchQuery)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors, ISBN..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <IconSymbol name="arrow.right" size={20} color="#fff" />
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
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="magnifyingglass" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No books found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    color: '#6b7280',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1f2937',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#6b7280',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
});
