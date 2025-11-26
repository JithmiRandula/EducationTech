# UniReads Login Credentials

## Default Test Account

Use these credentials to log into the UniReads application:

### Username
```
emilys
```

### Password
```
emilyspass
```

---

## Alternative Test Accounts

The app uses [DummyJSON API](https://dummyjson.com/docs/auth) for authentication. Here are additional test accounts you can use:

| Username | Password | Name |
|----------|----------|------|
| `emilys` | `emilyspass` | Emily Johnson |
| `michaelw` | `michaelwpass` | Michael Williams |
| `sophiab` | `sophiabpass` | Sophia Brown |
| `jamesd` | `jamesdpass` | James Davis |
| `emmaj` | `emmajpass` | Emma Miller |

---

## Features

✅ **Beautiful Modern UI**
- Gradient header with purple-to-pink colors
- Clean card-based form design
- Icon-enhanced input fields
- Show/hide password toggle
- Smooth error handling
- Loading states

✅ **Form Validation**
- Username validation (min 3 characters)
- Password validation (min 3 characters)
- Real-time error feedback
- Required field checks

✅ **Persistent Authentication**
- Token stored in AsyncStorage
- Auto-login on app restart
- Secure token management
- Redux state management

---

## Quick Start

1. Open the UniReads app
2. You'll see the login screen automatically
3. Default credentials are **pre-filled** for easy testing
4. Click "Sign In" to authenticate
5. You'll be redirected to the Home screen

---

## API Information

**Authentication Endpoint:** `https://dummyjson.com/auth/login`

**Request Format:**
```json
{
  "username": "emilys",
  "password": "emilyspass"
}
```

**Response Format:**
```json
{
  "id": 1,
  "username": "emilys",
  "email": "emily.johnson@x.dummyjson.com",
  "firstName": "Emily",
  "lastName": "Johnson",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Troubleshooting

### "Invalid credentials" error
- Make sure you're using the exact username and password (case-sensitive)
- Check your internet connection
- Try one of the alternative test accounts

### Network error
- Ensure you have active internet connection
- Check if the DummyJSON API is accessible
- Try restarting the app

### App stuck on login screen
- Clear app data and cache
- Restart the Metro bundler: `npx expo start --clear`
- Check AsyncStorage for stored tokens

---

**Last Updated:** November 24, 2025
