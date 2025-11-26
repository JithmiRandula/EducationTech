# Open Library API Integration Guide for UniReads

This document outlines how UniReads uses Open Library APIs and provides examples for future enhancements.

---

## 🌐 Currently Implemented APIs

### 1. **Book Search API** ✅ IMPLEMENTED
**Endpoint:** `https://openlibrary.org/search.json`

**Current Usage:**
- Used in: `useFetchBooks.ts`, `Home.tsx`
- Purpose: Search for books by query term

**Example:**
```typescript
const response = await fetch(
  `https://openlibrary.org/search.json?q=${encodeURIComponent('javascript')}&limit=20`
);

// Response includes:
// - docs[] array of books
// - title, author_name, cover_i, first_publish_year, edition_count
```

**Parameters:**
- `q` - Query string (book title, author, ISBN, etc.)
- `limit` - Number of results (default: 100, max: 100)
- `offset` - Pagination offset
- `fields` - Specific fields to return
- `sort` - Sort order (new, old, random, etc.)

**Advanced Search Examples:**
```typescript
// Search by author
`https://openlibrary.org/search.json?author=tolkien`

// Search by ISBN
`https://openlibrary.org/search.json?isbn=9780140328721`

// Search with multiple fields
`https://openlibrary.org/search.json?title=lord+of+the+rings&author=tolkien`

// Pagination
`https://openlibrary.org/search.json?q=javascript&limit=20&offset=20`
```

---

### 2. **Work API** ✅ IMPLEMENTED
**Endpoint:** `https://openlibrary.org/works/{WORK_ID}.json`

**Current Usage:**
- Used in: `Details.tsx`
- Purpose: Fetch detailed book information

**Example:**
```typescript
const response = await fetch(
  `https://openlibrary.org/works/OL45804W.json`
);

// Response includes:
// - title, description, covers[], subjects[], authors[]
```

---

### 3. **Authors API** ✅ IMPLEMENTED
**Endpoint:** `https://openlibrary.org/authors/{AUTHOR_ID}.json`

**Current Usage:**
- Used in: `Details.tsx` (to fetch author names)

**Example:**
```typescript
const response = await fetch(
  `https://openlibrary.org/authors/OL23919A.json`
);

// Response includes:
// - name, bio, birth_date, photos[], alternate_names[]
```

---

### 4. **Covers API** ✅ IMPLEMENTED
**Endpoint:** `https://covers.openlibrary.org/b/{TYPE}/{ID}-{SIZE}.jpg`

**Current Usage:**
- Used in: `BookCard.tsx`, `Details.tsx`, `Favorites.tsx`

**Sizes:**
- `S` - Small (50px)
- `M` - Medium (180px)
- `L` - Large (500px)

**Example:**
```typescript
// By cover ID
`https://covers.openlibrary.org/b/id/8234882-L.jpg`

// By ISBN
`https://covers.openlibrary.org/b/isbn/9780140328721-M.jpg`

// By OLID
`https://covers.openlibrary.org/b/olid/OL45804W-S.jpg`
```

---

## 🚀 APIs Available for Future Features

### 5. **Edition API** ⚡ SUGGESTED
**Endpoint:** `https://openlibrary.org/books/{EDITION_ID}.json`

**Use Case:** Get specific edition details (publisher, publish date, pages, etc.)

**Example:**
```typescript
// Fetch edition details
const response = await fetch(
  `https://openlibrary.org/books/OL7353617M.json`
);

// Response includes:
// - publishers[], publish_date, number_of_pages, isbn_13[], isbn_10[]
```

**Suggested Implementation:**
```typescript
// hooks/useEditionDetails.ts
export function useEditionDetails() {
  const fetchEdition = async (editionId: string) => {
    const response = await fetch(
      `https://openlibrary.org/books/${editionId}.json`
    );
    return await response.json();
  };
  return { fetchEdition };
}
```

---

### 6. **Subjects API** ⚡ SUGGESTED
**Endpoint:** `https://openlibrary.org/subjects/{SUBJECT}.json`

**Use Case:** Browse books by subject/genre (e.g., Science Fiction, History)

**Example:**
```typescript
// Fetch books in a subject
const response = await fetch(
  `https://openlibrary.org/subjects/science_fiction.json?limit=20`
);

// Popular subjects:
// - science_fiction, romance, history, biography
// - programming, mathematics, philosophy
```

**Suggested Feature: Browse by Genre Screen**
```typescript
// app/browse/Subjects.tsx
const genres = [
  'science_fiction', 'fantasy', 'mystery', 'romance',
  'history', 'biography', 'programming', 'mathematics'
];

genres.map(genre => (
  <GenreCard 
    genre={genre}
    onPress={() => router.push(`/browse/${genre}`)}
  />
))
```

---

### 7. **Recent Changes API** ⚡ SUGGESTED
**Endpoint:** `https://openlibrary.org/recentchanges.json`

**Use Case:** Show recently added/updated books

**Example:**
```typescript
const response = await fetch(
  `https://openlibrary.org/recentchanges.json?limit=50`
);

// Can filter by type: add-book, edit-book, etc.
```

---

### 8. **Partner/Read API** ⚡ SUGGESTED
**Endpoint:** `https://openlibrary.org/api/books`

**Use Case:** Fetch books by ISBN, LCCN, or OCLC numbers

**Example:**
```typescript
// Multiple ISBNs
const response = await fetch(
  `https://openlibrary.org/api/books?bibkeys=ISBN:9780980200447,ISBN:9780140328721&format=json&jscmd=data`
);
```

---

### 9. **Search Inside API** ⚡ ADVANCED
**Endpoint:** `https://openlibrary.org/search/inside`

**Use Case:** Search for text within book content

**Example:**
```typescript
const response = await fetch(
  `https://openlibrary.org/search/inside?q=javascript+functions`
);
```

---

### 10. **Lists API** ⚡ SUGGESTED
**Endpoint:** `https://openlibrary.org/people/{USERNAME}/lists`

**Use Case:** Create public reading lists (requires authentication)

**Note:** This requires Open Library user authentication

---

## 🔐 Authentication (DummyJSON)

**Currently Using:** `https://dummyjson.com/auth/login` ✅

**Current Implementation:**
```typescript
// app/auth/Login.tsx
const response = await fetch('https://dummyjson.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: values.email,
    password: values.password,
  }),
});
```

**Available Users (DummyJSON):**
```json
{
  "username": "emilys",
  "password": "emilyspass"
}
```

---

## 📊 Suggested Enhancements

### **Feature 1: Browse by Subject/Genre**
Create a new screen that uses the Subjects API to browse books by category.

```typescript
// app/browse/[genre].tsx
import { useFetchBooksBySubject } from '@/hooks/useFetchBooksBySubject';

export default function GenreBrowse() {
  const { genre } = useLocalSearchParams();
  const { books, loading } = useFetchBooksBySubject(genre);
  
  return (
    <FlatList
      data={books}
      renderItem={({ item }) => <BookCard book={item} />}
    />
  );
}
```

### **Feature 2: Related Books**
Show books with similar subjects on the Details screen.

```typescript
// In Details.tsx
const relatedBooks = await fetch(
  `https://openlibrary.org/subjects/${bookDetails.subjects[0]}.json?limit=5`
);
```

### **Feature 3: Advanced Search**
Add filters for year, language, author in the search.

```typescript
// Enhanced search parameters
const buildSearchUrl = (filters: SearchFilters) => {
  const params = new URLSearchParams({
    q: filters.query,
    ...(filters.author && { author: filters.author }),
    ...(filters.year && { first_publish_year: filters.year }),
    ...(filters.language && { language: filters.language }),
  });
  return `https://openlibrary.org/search.json?${params}`;
};
```

### **Feature 4: ISBN Scanner**
Use device camera to scan book ISBN and fetch details.

```typescript
// After scanning ISBN
const response = await fetch(
  `https://openlibrary.org/api/books?bibkeys=ISBN:${scannedISBN}&format=json&jscmd=data`
);
```

---

## 🎯 API Rate Limits

**Open Library:**
- No strict rate limit
- Be respectful (don't hammer the API)
- Consider caching responses

**Best Practices:**
1. Cache book covers locally
2. Implement debouncing for search
3. Use pagination for large result sets
4. Cache API responses with expiry

---

## 📝 API Response Examples

### Search API Response
```json
{
  "numFound": 1234,
  "start": 0,
  "docs": [
    {
      "key": "/works/OL45804W",
      "title": "JavaScript: The Good Parts",
      "author_name": ["Douglas Crockford"],
      "cover_i": 8234882,
      "first_publish_year": 2008,
      "edition_count": 12,
      "isbn": ["9780596517748"]
    }
  ]
}
```

### Work API Response
```json
{
  "title": "The Lord of the Rings",
  "key": "/works/OL27448W",
  "authors": [
    {
      "author": {
        "key": "/authors/OL26320A"
      }
    }
  ],
  "description": "Epic fantasy novel...",
  "subjects": ["Fantasy", "Middle Earth", "Adventure"],
  "covers": [8234882, 8234883]
}
```

---

## 🔗 Useful Links

- [Open Library API Docs](https://openlibrary.org/developers/api)
- [DummyJSON Docs](https://dummyjson.com/docs)
- [Open Library Search](https://openlibrary.org/search)
- [Developer Forum](https://github.com/internetarchive/openlibrary/discussions)

---

**Current API Integration Status: ✅ Excellent!**

Your app is already using the core Open Library APIs correctly. The suggestions above are for future enhancements to make UniReads even more powerful! 🚀
