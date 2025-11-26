# 🔐 Authentication Guide - UniReads

## Overview
UniReads uses **DummyJSON API** (https://dummyjson.com) for authentication and user management. This is a free, public API that provides realistic dummy data for testing.

---

## 🌐 API Endpoint

**Login Endpoint:** `https://dummyjson.com/auth/login`

### Request Format
```json
POST https://dummyjson.com/auth/login
Content-Type: application/json

{
  "username": "emilys",
  "password": "emilyspass"
}
```

### Response Format
```json
{
  "id": 1,
  "username": "emilys",
  "email": "emily.johnson@x.dummyjson.com",
  "firstName": "Emily",
  "lastName": "Johnson",
  "gender": "female",
  "image": "https://dummyjson.com/icon/emilys/128",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👥 Test User Credentials

You can use any of these test users to login:

### User 1 - Emily Johnson
- **Username:** `emilys`
- **Password:** `emilyspass`
- **Email:** emily.johnson@x.dummyjson.com
- **Name:** Emily Johnson

### User 2 - Michael Williams
- **Username:** `michaelw`
- **Password:** `michaelwpass`
- **Email:** michael.williams@x.dummyjson.com
- **Name:** Michael Williams

### User 3 - Sophia Brown
- **Username:** `sophiab`
- **Password:** `sophiabpass`
- **Email:** sophia.brown@x.dummyjson.com
- **Name:** Sophia Brown

### User 4 - James Davis
- **Username:** `jamesd`
- **Password:** `jamesdpass`
- **Email:** james.davis@x.dummyjson.com
- **Name:** James Davis

### User 5 - Emma Miller
- **Username:** `emmam`
- **Password:** `emmampass`
- **Email:** emma.miller@x.dummyjson.com
- **Name:** Emma Miller

> **Note:** See full list at https://dummyjson.com/users

---

## 🔄 How It Works

### 1. Login Flow
```
User enters credentials
      ↓
POST to dummyjson.com/auth/login
      ↓
Receive user data + token
      ↓
Store token in AsyncStorage
      ↓
Store user data in Redux
      ↓
Navigate to app
```

### 2. Data Stored

**AsyncStorage:**
- Token: `unireads_token`

**Redux Store (userSlice):**
```typescript
{
  id: number,
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  image: string,
  token: string
}
```

### 3. Profile Display
The profile page displays:
- **Full Name:** `firstName + lastName` (e.g., "Emily Johnson")
- **Email:** User's email address
- **User ID:** Numeric ID from API

---

## 🎨 Implementation Details

### Login Screen (`app/auth/Login.tsx`)
- Beautiful glassmorphism UI design
- Form validation with Yup
- Error handling with user-friendly messages
- Pre-filled credentials for easy testing
- Shows loading spinner during authentication

### Profile Screen (`app/(tabs)/profile.tsx`)
- Displays user's full name instead of username
- Shows email and user ID
- Dark mode toggle
- Logout functionality

### User Management (`store/userSlice.ts`)
```typescript
export type User = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  token?: string;
};
```

---

## 🚀 Quick Start

### Testing Login
1. Start the app: `npx expo start`
2. You'll see the login screen
3. Use any test credentials above
4. Or use the pre-filled default: `emilys / emilyspass`
5. Click "Sign In"
6. You'll be logged in and see the user's name in the profile

### Testing Different Users
1. Logout from profile page
2. Login with different credentials
3. Notice the profile shows different user names

---

## 🔒 Security Features

1. **Token Persistence:** Auth token stored in AsyncStorage
2. **Auto-Login:** Users stay logged in after app restart
3. **Logout:** Clears token and Redux state
4. **Protected Routes:** App checks for token before showing content

---

## 🐛 Troubleshooting

### Login Failed
- Check internet connection
- Verify credentials are correct
- API might be temporarily down

### Profile Shows "Guest User"
- Token might be invalid
- Redux store might not be hydrated
- Try logging out and in again

### Token Expired
- DummyJSON tokens don't expire, but if issues occur:
  1. Logout
  2. Login again
  3. New token will be issued

---

## 📚 API Resources

- **DummyJSON Docs:** https://dummyjson.com/docs
- **Auth Endpoint:** https://dummyjson.com/docs/auth
- **Users List:** https://dummyjson.com/users
- **GitHub Issues:** https://github.com/Ovi/DummyJSON/issues

---

## ✅ Features Implemented

- ✅ Login with any DummyJSON user
- ✅ Display user's real name in profile
- ✅ Show email address
- ✅ Store complete user data
- ✅ Token persistence
- ✅ Auto-login on restart
- ✅ Logout functionality
- ✅ Beautiful UI with glassmorphism
- ✅ Form validation
- ✅ Error handling

---

**Made with ❤️ for UniReads**
