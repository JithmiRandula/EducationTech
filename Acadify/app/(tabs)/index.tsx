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
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addFavorite } from '@/store/slices/favoritesSlice';
import { Book } from '@/components/BookCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import type { RootState } from '@/store/store';

/**
 * Home Screen for UniReads
 * - Fetches books from Open Library API
 * - Displays searchable book list
 * - Supports pull-to-refresh
 * - Shows loading and error states
 * - Allows adding books to favorites
 */
// Category type
type Category = {
  name: string;
  books: Book[];
};

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  
  // Get favorites from Redux
  const favorites = useAppSelector((state: RootState) => (state as any).favorites?.items || []);
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoritesWithSubjects, setFavoritesWithSubjects] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch subject/genre details for favorite books
   */
  const fetchFavoriteSubjects = useCallback(async () => {
    if (favorites.length === 0) return;

    try {
      const booksWithSubjects = await Promise.all(
        favorites.slice(0, 3).map(async (book: Book) => {
          try {
            const workId = book.key.split('/').pop();
            const response = await fetch(`https://openlibrary.org${book.key}.json`);
            
            if (!response.ok) return book;
            
            const workData = await response.json();
            return {
              ...book,
              subject: workData.subjects || [],
            };
          } catch {
            return book;
          }
        })
      );
      
      setFavoritesWithSubjects(booksWithSubjects);
    } catch (err) {
      console.error('Error fetching favorite subjects:', err);
      setFavoritesWithSubjects(favorites.slice(0, 3));
    }
  }, [favorites]);

  // Fetch subjects for favorites when favorites change
  React.useEffect(() => {
    fetchFavoriteSubjects();
  }, [favorites]);

  /**
   * Fetch books and organize by subjects
   */
  const fetchBooksWithSubjects = useCallback(async () => {
    try {
      // Technology and education related search queries
      const queries = [
        'computer science', 'artificial intelligence', 'machine learning', 'web development',
        'data science', 'software engineering', 'cybersecurity',
        'cloud computing', 'mobile development', 'algorithms', 'python programming'
      ];

      // Fetch books for multiple queries in parallel
      const fetchPromises = queries.map(async (query) => {
        try {
          const response = await fetch(
            `https://openlibrary.org/search.json?q=${query}&limit=15`
          );
          
          if (!response.ok) return { query, books: [] };
          
          const data = await response.json();
          const books = (data.docs || []).map((doc: any) => ({
            key: doc.key,
            title: doc.title,
            author_name: doc.author_name,
            cover_i: doc.cover_i,
            first_publish_year: doc.first_publish_year,
            edition_count: doc.edition_count,
            subject: doc.subject || [],
          }));
          
          return { query, books };
        } catch {
          return { query, books: [] };
        }
      });

      const results = await Promise.all(fetchPromises);
      
      // Convert to categories, capitalize first letter
      const categoryList: Category[] = results
        .filter(result => result.books.length > 0)
        .map(result => ({
          name: result.query.charAt(0).toUpperCase() + result.query.slice(1),
          books: result.books,
        }));

      setCategories(categoryList);
      
      // Set first category as selected
      if (categoryList.length > 0 && !selectedCategory) {
        setSelectedCategory(categoryList[0].name);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  }, [selectedCategory]);

  // Fetch books on mount
  React.useEffect(() => {
    setLoading(true);
    fetchBooksWithSubjects().finally(() => setLoading(false));
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooksWithSubjects().finally(() => setRefreshing(false));
  };

  // Navigate to book details
  const handleBookPress = (book: Book) => {
    const workId = book.key.split('/').pop() || book.key;
    router.push(`/home/Details?workId=${workId}`);
  };

  // Render loading state
  if (loading && categories.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading books...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }>
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={require('@/assets/images/books9.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          
        </View>
      </View>
      
      {/* My Books Section */}
      {favoritesWithSubjects.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My books</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/favorites')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.underline, { backgroundColor: colors.primary }]} />
          
          <ScrollView 
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false} 
            style={styles.horizontalScroll}
            snapToInterval={Dimensions.get('window').width - 32}
            decelerationRate="fast">
            {favoritesWithSubjects.map((book: Book) => (
              <TouchableOpacity
                key={book.key}
                style={[styles.myBookCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleBookPress(book)}
                activeOpacity={0.7}>
                <Image
                  source={{ 
                    uri: book.cover_i 
                      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                      : 'https://via.placeholder.com/120x180'
                  }}
                  style={styles.myBookCover}
                  resizeMode="cover"
                />
                <View style={styles.myBookInfo}>
                  <View>
                    <Text style={[styles.myBookTitle, { color: colors.text }]} numberOfLines={2}>
                      {book.title}
                    </Text>
                    <Text style={[styles.myBookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                      {book.author_name?.[0] || 'Unknown Author'}
                    </Text>
                  </View>
                  <View>
                    <View style={styles.genresContainer}>
                      {(book.subject && book.subject.length > 0) ? (
                        <View style={[styles.genreTag, { backgroundColor: colors.surface }]}>
                          <Text style={[styles.genreText, { color: colors.primary }]} numberOfLines={1}>
                            {book.subject[0]}
                          </Text>
                        </View>
                      ) : (
                        <Text style={[styles.noGenreText, { color: colors.textTertiary }]}>No category available</Text>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* For You Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>For you</Text>
          <TouchableOpacity>
            <IconSymbol name="slider.horizontal.3" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.underline, { backgroundColor: colors.primary }]} />

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryTab,
                selectedCategory === category.name && styles.categoryTabActive,
                selectedCategory === category.name && { backgroundColor: colors.primary },
                selectedCategory !== category.name && { backgroundColor: colors.surface }
              ]}
              onPress={() => setSelectedCategory(category.name)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.categoryTextActive,
                  selectedCategory === category.name && { color: Colors.cream },
                  selectedCategory !== category.name && { color: colors.textSecondary }
                ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Books */}
        {categories.map((category, index) => (
          selectedCategory === category.name && (
            <ScrollView key={index} horizontal showsHorizontalScrollIndicator={false} style={styles.booksScroll}>
              {category.books.map((book: Book) => (
                <TouchableOpacity
                  key={book.key}
                  style={styles.bookItem}
                  onPress={() => handleBookPress(book)}
                  activeOpacity={0.7}>
                  <Image
                    source={{ 
                      uri: book.cover_i 
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : 'https://via.placeholder.com/120x180'
                    }}
                    style={styles.bookCover}
                    resizeMode="cover"
                  />
                  <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                    {book.author_name?.[0] || 'Unknown'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )
        ))}
      </View>
    </ScrollView>
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
  heroSection: {
    width: '100%',
    height: 200,
    marginBottom: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    fontStyle: 'italic',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  underline: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -16,
  },
  myBookCard: {
    flexDirection: 'row',
    width: Dimensions.get('window').width - 32,
    height: 140,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  myBookCover: {
    width: 100,
    height: 140,
  },
  myBookInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  myBookTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  myBookAuthor: {
    fontSize: 13,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  genreText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noGenreText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryTabActive: {
    // backgroundColor set dynamically
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    // color set dynamically
  },
  booksScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  bookItem: {
    width: 120,
    marginRight: 16,
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 11,
  },
});
