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
  Image,
  Dimensions,
} from 'react-native';
import { useAppDispatch } from '@/store/hooks';
import { addFavorite } from '@/store/slices/favoritesSlice';
import BookCard, { Book } from '@/components/BookCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

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
  const { colors } = useTheme();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('javascript'); // Default search term
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'trending' | 'popular' | null>(null);

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

  // Fetch trending books (recent, popular topics)
  const fetchTrendingBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActiveFilter('trending');

    try {
      // Fetch books from trending subjects
      const trendingSubjects = ['artificial intelligence', 'machine learning', 'data science', 'blockchain'];
      const randomSubject = trendingSubjects[Math.floor(Math.random() * trendingSubjects.length)];
      
      const response = await fetch(
        `https://openlibrary.org/search.json?subject=${encodeURIComponent(randomSubject)}&sort=new&limit=20`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
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
      console.error('Error fetching trending books:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending books');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch popular books (most editions, classic books)
  const fetchPopularBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActiveFilter('popular');

    try {
      // Fetch popular books sorted by edition count
      const response = await fetch(
        `https://openlibrary.org/search.json?q=bestseller&sort=editions&limit=20`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
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
      console.error('Error fetching popular books:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch popular books');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search button press
  const handleSearch = () => {
    setActiveFilter(null);
    fetchBooks(searchQuery);
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    if (activeFilter === 'trending') {
      fetchTrendingBooks();
    } else if (activeFilter === 'popular') {
      fetchPopularBooks();
    } else {
      fetchBooks(searchQuery, true);
    }
  };

  // Handle adding book to favorites
  const handleFavoritePress = (book: Book) => {
    dispatch(addFavorite(book));
  };

  // Render loading state
  if (loading && books.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching books...</Text>
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
      {/* Hero Image with Search Bar */}
      <View style={styles.heroImageContainer}>
        <Image
          source={require('@/assets/images/search1.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          {/* Discover Text */}
          <Text style={styles.heroTitle}>Discover Your Next Read</Text>

          {/* Main Search Bar Below Text */}
          <View style={styles.heroSearchContainer}>
            <View style={[styles.heroSearchInput, { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: colors.primary }]}>
              <IconSymbol name="magnifyingglass" size={20} color={colors.primary} style={styles.searchIcon} />
              <TextInput
                style={[styles.mainSearchInput, { color: colors.text }]}
                placeholder="Search for books, authors, topics..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <IconSymbol name="xmark.circle.fill" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.inlineSearchButton, { backgroundColor: colors.primary }]} 
                onPress={handleSearch}
                activeOpacity={0.8}>
                <IconSymbol name="arrow.right" size={18} color={Colors.cream} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Trending and Popular Buttons */}
      <View style={[styles.filterButtonsContainer, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { backgroundColor: activeFilter === 'trending' ? colors.primary : colors.surface, 
              borderColor: colors.border, 
              borderWidth: activeFilter === 'trending' ? 0 : 1.5 
            }
          ]}
          onPress={fetchTrendingBooks}
          activeOpacity={0.8}>
          <Text style={[
            activeFilter === 'trending' ? styles.filterButtonText : styles.filterButtonTextSecondary,
            { color: activeFilter === 'trending' ? Colors.cream : colors.text }
          ]}>
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { backgroundColor: activeFilter === 'popular' ? colors.primary : colors.surface, 
              borderColor: colors.border, 
              borderWidth: activeFilter === 'popular' ? 0 : 1.5 
            }
          ]}
          onPress={fetchPopularBooks}
          activeOpacity={0.8}>
          <Text style={[
            activeFilter === 'popular' ? styles.filterButtonText : styles.filterButtonTextSecondary,
            { color: activeFilter === 'popular' ? Colors.cream : colors.text }
          ]}>
            Popular
          </Text>
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
            <IconSymbol name="magnifyingglass" size={64} color={colors.textTertiary} />
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
  heroImageContainer: {
    width: width,
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroSearchContainer: {
    width: '90%',
  },
  heroSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  mainSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    marginRight: 6,
  },
  inlineSearchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  smallSearchContainer: {
    width: '85%',
  },
  smallSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  smallSearchText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.cream,
  },
  filterButtonTextSecondary: {
    fontSize: 13,
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
