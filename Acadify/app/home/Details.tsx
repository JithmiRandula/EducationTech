import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addFavorite, removeFavorite } from '@/store/slices/favoritesSlice';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RootState } from '@/store/store';

// Type for detailed book information from Open Library Works API
type BookDetails = {
  key: string;
  title: string;
  description?: string | { value: string };
  covers?: number[];
  authors?: Array<{ author: { key: string } }>;
  author_name?: string[];
  first_publish_year?: number;
  subjects?: string[];
};

/**
 * Details Screen for UniReads
 * - Fetches detailed book information from Open Library Works API
 * - Displays cover, title, author, description
 * - Allows adding/removing book from favorites
 * - Shows real-time favorite status from Redux
 */
export default function Details() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get workId from route params (e.g., "OL45804W")
  const workId = params.workId as string;

  // State management
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if book is already in favorites
  const favorites = useAppSelector((state: RootState) => (state as any).favorites?.items || []);
  const isFavorite = favorites.some((fav: any) => fav.key === `/works/${workId}`);

  /**
   * Fetch book details from Open Library Works API
   * Endpoint: https://openlibrary.org/works/{workId}.json
   */
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!workId) {
        setError('No book ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://openlibrary.org/works/${workId}.json`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Fetch author names if we have author keys
        if (data.authors && data.authors.length > 0) {
          const authorPromises = data.authors.map(async (author: any) => {
            try {
              const authorResponse = await fetch(`https://openlibrary.org${author.author.key}.json`);
              const authorData = await authorResponse.json();
              return authorData.name;
            } catch {
              return 'Unknown Author';
            }
          });
          const authorNames = await Promise.all(authorPromises);
          data.author_name = authorNames;
        }

        setBookDetails(data);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [workId]);

  /**
   * Handle add/remove from favorites
   * Dispatches appropriate Redux action and shows feedback
   */
  const handleFavoriteToggle = () => {
    if (!bookDetails) return;

    const bookData = {
      key: bookDetails.key,
      title: bookDetails.title,
      author_name: bookDetails.author_name,
      cover_i: bookDetails.covers?.[0],
      first_publish_year: bookDetails.first_publish_year,
    };

    if (isFavorite) {
      dispatch(removeFavorite(bookData.key));
      Alert.alert('Removed', 'Book removed from favorites');
    } else {
      dispatch(addFavorite(bookData));
      Alert.alert('Added', 'Book added to favorites');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </View>
    );
  }

  // Render error state
  if (error || !bookDetails) {
    return (
      <View style={styles.centerContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Book not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract description (can be string or object with value property)
  const description =
    typeof bookDetails.description === 'string'
      ? bookDetails.description
      : bookDetails.description?.value || 'No description available.';

  // Build cover image URL
  const coverUrl = bookDetails.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${bookDetails.covers[0]}-L.jpg`
    : null;

  const authors = bookDetails.author_name?.join(', ') || 'Unknown Author';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.cover} resizeMode="contain" />
        ) : (
          <View style={[styles.cover, styles.placeholderCover]}>
            <IconSymbol name="book" size={64} color="#9ca3af" />
            <Text style={styles.placeholderText}>No Cover</Text>
          </View>
        )}
      </View>

      {/* Book Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{bookDetails.title}</Text>
        <Text style={styles.author}>{authors}</Text>

        {bookDetails.first_publish_year && (
          <Text style={styles.publishYear}>First published: {bookDetails.first_publish_year}</Text>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={handleFavoriteToggle}>
          <IconSymbol
            name={isFavorite ? 'heart.fill' : 'heart'}
            size={24}
            color={isFavorite ? '#fff' : '#e11d48'}
          />
          <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Subjects/Tags */}
        {bookDetails.subjects && bookDetails.subjects.length > 0 && (
          <View style={styles.subjectsContainer}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <View style={styles.tagsContainer}>
              {bookDetails.subjects.slice(0, 10).map((subject, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{subject}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    paddingBottom: 32,
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
  backButton: {
    marginTop: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  coverContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  cover: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  placeholderCover: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 14,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  publishYear: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e11d48',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#e11d48',
    borderColor: '#e11d48',
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e11d48',
  },
  favoriteButtonTextActive: {
    color: '#fff',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  subjectsContainer: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#1e40af',
  },
});

