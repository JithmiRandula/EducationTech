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
  Modal,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addFavorite, removeFavorite } from '@/store/slices/favoritesSlice';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RootState } from '@/store/store';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  number_of_pages_median?: number;
  ratings_average?: number;
  ratings_count?: number;
};

// Type for edition data
type EditionData = {
  entries?: Array<{
    number_of_pages?: number;
    languages?: Array<{ key: string }>;
  }>;
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
  const { colors } = useTheme();

  // Get workId from route params (e.g., "OL45804W")
  const workId = params.workId as string;

  // State management
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [language, setLanguage] = useState<string>('ENG');
  const [rating, setRating] = useState<number>(4.2);
  const [reviewCount, setReviewCount] = useState<number>(45);
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

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

        // Fetch editions data for page count and language
        try {
          const editionsResponse = await fetch(`https://openlibrary.org/works/${workId}/editions.json?limit=10`);
          const editionsData: EditionData = await editionsResponse.json();
          
          if (editionsData.entries && editionsData.entries.length > 0) {
            // Get page count from first edition that has it
            const editionWithPages = editionsData.entries.find(e => e.number_of_pages);
            if (editionWithPages?.number_of_pages) {
              setPageCount(editionWithPages.number_of_pages);
            }
            
            // Get language from first edition
            const editionWithLang = editionsData.entries.find(e => e.languages && e.languages.length > 0);
            if (editionWithLang?.languages) {
              const langKey = editionWithLang.languages[0].key;
              setLanguage(langKey.includes('eng') ? 'ENG' : langKey.replace('/languages/', '').toUpperCase());
            }
          }
        } catch (err) {
          console.log('Could not fetch edition details:', err);
        }

        // Set rating data (using mock data as Open Library doesn't have ratings API)
        setRating(3.5 + Math.random() * 1.5); // Random between 3.5-5.0
        setReviewCount(Math.floor(10 + Math.random() * 200)); // Random between 10-210

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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading book details...</Text>
      </View>
    );
  }

  // Render error state
  if (error || !bookDetails) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error || 'Book not found'}</Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render star rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<IconSymbol key={i} name="star.fill" size={12} color="#FFA500" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<IconSymbol key={i} name="star.leadinghalf.filled" size={12} color="#FFA500" />);
      } else {
        stars.push(<IconSymbol key={i} name="star" size={12} color="#D3D3D3" />);
      }
    }
    return stars;
  };

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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      {/* Header with back button and favorite */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteBtn}>
          <IconSymbol
            name={isFavorite ? 'heart.fill' : 'heart'}
            size={20}
            color={isFavorite ? Colors.error : colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <IconSymbol name="square.and.arrow.up" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Book Cover Section */}
      <View style={[styles.coverSection, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity 
          onPress={() => coverUrl && setShowImageModal(true)}
          activeOpacity={coverUrl ? 0.8 : 1}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImage, styles.placeholderCover, { backgroundColor: colors.surface }]}>
              <IconSymbol name="book" size={64} color={colors.textTertiary} />
            </View>
          )}
        </TouchableOpacity>
        
        {/* Badge */}
        {bookDetails.first_publish_year && bookDetails.first_publish_year >= new Date().getFullYear() - 2 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
      </View>

      {/* Book Title and Author */}
      <View style={styles.titleSection}>
        <Text style={[styles.bookTitle, { color: colors.text }]}>{bookDetails.title}</Text>
        <Text style={[styles.authorName, { color: colors.textSecondary }]}>{authors}</Text>
      </View>

      {/* Rating Section */}
      <View style={[styles.ratingSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <View style={styles.ratingContent}>
          <View style={styles.ratingLeft}>
            <View style={styles.ratingScoreContainer}>
              <IconSymbol name="star.fill" size={16} color="#FFA500" />
              <Text style={[styles.ratingScore, { color: colors.text }]}>{rating.toFixed(1)}</Text>
            </View>
            <View style={styles.starsRow}>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
            </View>
            <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>{reviewCount} Reviews</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.yourRatingButton, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
            <IconSymbol name="star" size={14} color={colors.primary} />
            <Text style={[styles.yourRatingText, { color: colors.primary }]}>Rate this book</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Book Info Grid */}
      <View style={styles.infoGrid}>
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Language</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{language}</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pages</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{pageCount || 345}</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Libraries</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>54</Text>
        </View>
      </View>

      {/* More Details Button */}
      <TouchableOpacity 
        style={[styles.moreDetailsButton, { backgroundColor: colors.cardBackground }]}
        onPress={() => setShowMoreDetails(!showMoreDetails)}
        activeOpacity={0.7}>
        <Text style={[styles.moreDetailsText, { color: colors.text }]}>More Details</Text>
        <IconSymbol 
          name={showMoreDetails ? "chevron.up" : "chevron.down"} 
          size={20} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>

      {/* Description - Shows when More Details is expanded */}
      {showMoreDetails && description && description !== 'No description available.' && (
        <View style={[styles.descriptionSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About the Book</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      )}

      {/* Subjects/Tags */}
      {bookDetails.subjects && bookDetails.subjects.length > 0 && (
        <View style={[styles.subjectsSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Genres & Topics</Text>
          <View style={styles.tagsContainer}>
            {bookDetails.subjects.slice(0, 8).map((subject, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.addToListButton, { backgroundColor: colors.primary }]}
          onPress={handleFavoriteToggle}>
          <IconSymbol name={isFavorite ? "checkmark" : "plus"} size={16} color={Colors.cream} />
          <Text style={styles.addToListText}>{isFavorite ? 'In Favorites' : 'Add to Favorites'}</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={() => setShowImageModal(false)}>
            <View style={styles.modalContent}>
              {coverUrl && (
                <Image 
                  source={{ uri: coverUrl }} 
                  style={styles.fullScreenImage} 
                  resizeMode="contain" 
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  backBtn: {
    padding: 8,
  },
  favoriteBtn: {
    padding: 6,
    position: 'absolute',
    right: 60,
  },
  shareBtn: {
    padding: 8,
  },
  coverSection: {
    alignItems: 'center',
    paddingVertical: 24,
    position: 'relative',
  },
  coverImage: {
    width: 180,
    height: 270,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 32,
    right: 80,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 16,
    textAlign: 'center',
  },
  ratingSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLeft: {
    flex: 1,
    alignItems: 'center',
  },
  ratingScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingScore: {
    fontSize: 20,
    fontWeight: '700',
  },
  starsRow: {
    marginBottom: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  yourRatingButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  yourRatingText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  reviewText: {
    fontSize: 14,
  },
  ratingButton: {
    alignSelf: 'flex-start',
  },
  yourRating: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  moreDetailsButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreDetailsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
  },
  subjectsSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  addToListText: {
    color: Colors.cream,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
});

