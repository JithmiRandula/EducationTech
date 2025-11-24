import { useState, useCallback } from 'react';

/**
 * Book type matching Open Library API response
 */
export type Book = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
};

/**
 * Hook state interface
 */
export interface UseFetchBooksState {
  /** Array of fetched books */
  books: Book[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch fails */
  error: string | null;
  /** Fetch books with a search query */
  fetchBooks: (query: string, limit?: number) => Promise<void>;
  /** Refresh/refetch with last query */
  refresh: () => Promise<void>;
  /** Clear current results */
  clear: () => void;
}

/**
 * useFetchBooks Hook
 * 
 * Custom hook for fetching books from Open Library API
 * 
 * Features:
 * - Fetches books by search query
 * - Handles loading and error states
 * - Refresh functionality
 * - Clear functionality
 * - TypeScript typed return values
 * 
 * @example
 * ```tsx
 * const { books, loading, error, fetchBooks, refresh } = useFetchBooks();
 * 
 * useEffect(() => {
 *   fetchBooks('javascript');
 * }, []);
 * 
 * // Refresh data
 * await refresh();
 * ```
 * 
 * @returns Hook state with books data and control functions
 */
export function useFetchBooks(): UseFetchBooksState {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [lastLimit, setLastLimit] = useState<number>(20);

  /**
   * Fetch books from Open Library API
   * 
   * @param query - Search query (e.g., "javascript", "python")
   * @param limit - Maximum number of results (default: 20)
   */
  const fetchBooks = useCallback(async (query: string, limit: number = 20) => {
    if (!query.trim()) {
      setError('Search query cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastQuery(query);
      setLastLimit(limit);

      // Call Open Library Search API
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to Book type
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
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh books with the last used query
   */
  const refresh = useCallback(async () => {
    if (lastQuery) {
      await fetchBooks(lastQuery, lastLimit);
    }
  }, [lastQuery, lastLimit, fetchBooks]);

  /**
   * Clear current books and reset state
   */
  const clear = useCallback(() => {
    setBooks([]);
    setError(null);
    setLastQuery('');
  }, []);

  return {
    books,
    loading,
    error,
    fetchBooks,
    refresh,
    clear,
  };
}
