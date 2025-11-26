/**
 * API Service
 * Centralized API calls for UniReads application
 * 
 * APIs Used:
 * 1. DummyJSON API - Authentication
 * 2. Open Library API - Book data, search, and details
 */

// ==================== API BASE URLS ====================
const DUMMYJSON_BASE_URL = 'https://dummyjson.com';
const OPENLIBRARY_BASE_URL = 'https://openlibrary.org';
const COVERS_BASE_URL = 'https://covers.openlibrary.org';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com';

// ==================== TYPES ====================
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  accessToken?: string;
}

export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
  subject?: string[];
  isbn?: string[];
  publisher?: string[];
}

export interface BookDetails {
  key: string;
  title: string;
  description?: string | { value: string };
  covers?: number[];
  subjects?: string[];
  authors?: Array<{ author: { key: string }; type?: { key: string } }>;
  first_publish_date?: string;
  number_of_pages?: number;
}

export interface AuthorDetails {
  key: string;
  name: string;
  birth_date?: string;
  bio?: string | { value: string };
  photos?: number[];
}

export interface SearchBooksParams {
  query?: string;
  author?: string;
  title?: string;
  isbn?: string;
  subject?: string;
  limit?: number;
  offset?: number;
  sort?: 'new' | 'old' | 'rating' | 'editions';
}

// ==================== AUTHENTICATION API (DummyJSON) ====================

/**
 * Login user with username and password
 * @param credentials - Username and password
 * @returns User data with token
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${DUMMYJSON_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};

// ==================== OPEN LIBRARY API ====================

/**
 * Search for books with various filters
 * @param params - Search parameters
 * @returns Array of books
 */
export const searchBooks = async (params: SearchBooksParams): Promise<Book[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('q', params.query);
    if (params.author) queryParams.append('author', params.author);
    if (params.title) queryParams.append('title', params.title);
    if (params.isbn) queryParams.append('isbn', params.isbn);
    if (params.subject) queryParams.append('subject', params.subject);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const url = `${OPENLIBRARY_BASE_URL}/search.json?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to search books');
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Search Books API Error:', error);
    throw error;
  }
};

/**
 * Get book details by work ID
 * @param workId - Work ID (e.g., "OL45804W")
 * @returns Book details
 */
export const getBookDetails = async (workId: string): Promise<BookDetails> => {
  try {
    const response = await fetch(`${OPENLIBRARY_BASE_URL}/works/${workId}.json`);

    if (!response.ok) {
      throw new Error('Failed to fetch book details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get Book Details API Error:', error);
    throw error;
  }
};

/**
 * Get author details by author key
 * @param authorKey - Author key (e.g., "/authors/OL23919A")
 * @returns Author details
 */
export const getAuthorDetails = async (authorKey: string): Promise<AuthorDetails> => {
  try {
    const response = await fetch(`${OPENLIBRARY_BASE_URL}${authorKey}.json`);

    if (!response.ok) {
      throw new Error('Failed to fetch author details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get Author Details API Error:', error);
    throw error;
  }
};

/**
 * Get book editions by work ID
 * @param workId - Work ID
 * @param limit - Number of editions to fetch
 * @returns Array of editions
 */
export const getBookEditions = async (workId: string, limit: number = 10): Promise<any[]> => {
  try {
    const response = await fetch(
      `${OPENLIBRARY_BASE_URL}/works/${workId}/editions.json?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch book editions');
    }

    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('Get Book Editions API Error:', error);
    throw error;
  }
};

/**
 * Get books by subject/category
 * @param subject - Subject name (e.g., "science_fiction")
 * @param limit - Number of books to fetch
 * @returns Array of books
 */
export const getBooksBySubject = async (subject: string, limit: number = 20): Promise<Book[]> => {
  try {
    const response = await fetch(
      `${OPENLIBRARY_BASE_URL}/subjects/${subject}.json?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch books by subject');
    }

    const data = await response.json();
    return data.works || [];
  } catch (error) {
    console.error('Get Books by Subject API Error:', error);
    throw error;
  }
};

/**
 * Search trending books (AI/ML/Data Science subjects)
 * @param limit - Number of books to fetch
 * @returns Array of books
 */
export const getTrendingBooks = async (limit: number = 20): Promise<Book[]> => {
  try {
    const subjects = ['artificial intelligence', 'machine learning', 'data science'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    
    const response = await fetch(
      `${OPENLIBRARY_BASE_URL}/search.json?subject=${encodeURIComponent(randomSubject)}&sort=new&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch trending books');
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Get Trending Books API Error:', error);
    throw error;
  }
};

/**
 * Search popular books (bestsellers by edition count)
 * @param limit - Number of books to fetch
 * @returns Array of books
 */
export const getPopularBooks = async (limit: number = 20): Promise<Book[]> => {
  try {
    const response = await fetch(
      `${OPENLIBRARY_BASE_URL}/search.json?q=bestseller&sort=editions&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch popular books');
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Get Popular Books API Error:', error);
    throw error;
  }
};

/**
 * Get books by multiple tech-related queries
 * @param queries - Array of search queries
 * @param limit - Number of books per query
 * @returns Object with query as key and books array as value
 */
export const getBooksByQueries = async (
  queries: string[],
  limit: number = 15
): Promise<{ [key: string]: Book[] }> => {
  try {
    const results: { [key: string]: Book[] } = {};

    const fetchPromises = queries.map(async (query) => {
      try {
        const response = await fetch(
          `${OPENLIBRARY_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
        );

        if (!response.ok) return { query, books: [] };

        const data = await response.json();
        return { query, books: data.docs || [] };
      } catch {
        return { query, books: [] };
      }
    });

    const resolvedResults = await Promise.all(fetchPromises);
    
    resolvedResults.forEach(({ query, books }) => {
      results[query] = books;
    });

    return results;
  } catch (error) {
    console.error('Get Books by Queries API Error:', error);
    throw error;
  }
};

/**
 * Fetch subject details for a book by its key
 * @param bookKey - Book key (e.g., "/works/OL45804W")
 * @returns Book with subject array
 */
export const getBookSubjects = async (bookKey: string): Promise<BookDetails> => {
  try {
    const response = await fetch(`${OPENLIBRARY_BASE_URL}${bookKey}.json`);

    if (!response.ok) {
      throw new Error('Failed to fetch book subjects');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get Book Subjects API Error:', error);
    throw error;
  }
};

// ==================== IMAGE URLS ====================

/**
 * Get book cover image URL
 * @param coverId - Cover ID
 * @param size - Size: S (small), M (medium), L (large)
 * @returns Cover image URL
 */
export const getCoverImageUrl = (coverId: number, size: 'S' | 'M' | 'L' = 'M'): string => {
  if (!coverId) return `${PLACEHOLDER_IMAGE}/120x180`;
  return `${COVERS_BASE_URL}/b/id/${coverId}-${size}.jpg`;
};

/**
 * Get placeholder image URL
 * @param width - Image width
 * @param height - Image height
 * @returns Placeholder image URL
 */
export const getPlaceholderImageUrl = (width: number = 120, height: number = 180): string => {
  return `${PLACEHOLDER_IMAGE}/${width}x${height}`;
};

/**
 * Get author photo URL
 * @param photoId - Photo ID
 * @param size - Size: S (small), M (medium), L (large)
 * @returns Author photo URL
 */
export const getAuthorPhotoUrl = (photoId: number, size: 'S' | 'M' | 'L' = 'M'): string => {
  if (!photoId) return `${PLACEHOLDER_IMAGE}/128x128`;
  return `${COVERS_BASE_URL}/a/id/${photoId}-${size}.jpg`;
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format book description (handle string or object format)
 * @param description - Description from API
 * @returns Formatted description string
 */
export const formatDescription = (description: string | { value: string } | undefined): string => {
  if (!description) return 'No description available';
  if (typeof description === 'string') return description;
  return description.value || 'No description available';
};

/**
 * Format author bio (handle string or object format)
 * @param bio - Bio from API
 * @returns Formatted bio string
 */
export const formatBio = (bio: string | { value: string } | undefined): string => {
  if (!bio) return 'No biography available';
  if (typeof bio === 'string') return bio;
  return bio.value || 'No biography available';
};

/**
 * Extract work ID from book key
 * @param key - Book key (e.g., "/works/OL45804W")
 * @returns Work ID (e.g., "OL45804W")
 */
export const extractWorkId = (key: string): string => {
  return key.split('/').pop() || key;
};

// ==================== EXPORT ALL ====================
export default {
  // Authentication
  loginUser,

  // Book Search & Details
  searchBooks,
  getBookDetails,
  getBookEditions,
  getBooksBySubject,
  getTrendingBooks,
  getPopularBooks,
  getBooksByQueries,
  getBookSubjects,

  // Author
  getAuthorDetails,

  // Images
  getCoverImageUrl,
  getPlaceholderImageUrl,
  getAuthorPhotoUrl,

  // Utilities
  formatDescription,
  formatBio,
  extractWorkId,
};
