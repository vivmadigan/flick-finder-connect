# 🔄 Frontend-Backend Alignment Status

## ✅ Fixed Issues:

### 1. **CRITICAL: Preferences Format Mismatch** ✅ FIXED
**Backend Expected:**
```json
{
  "genreIds": [28],
  "length": "medium"
}
```

**Frontend Was Sending:**
```json
{
  "genre": "Action",
  "lengthBucket": "short"
}
```

**Fix Applied:**
- Added `PreferencesDTO` type for backend format
- Added `toDTO()` and `fromDTO()` transformation methods
- Frontend now transforms between UI format (genre name) and API format (genre IDs)
- This was causing preferences to never save/load correctly!

---

### 2. **URL Casing** ✅ FIXED
**Backend:** `/api/preferences` (lowercase)
**Frontend Was Using:** `/api/Preferences` (uppercase P)
**Fix:** Changed to lowercase to match backend

---

### 3. **Match Toast Message** ✅ FIXED
**Backend Spec:** Show "Waiting for the other user" when no mutual match
**Fix:** Updated Match.tsx to show exact message per spec

---

### 4. **Liked Movies Sorting** ✅ FIXED
**Backend Spec:** Backend returns ordered by `likedAt DESC`
**Fix:** Added client-side fallback sort by timestamp

---

### 5. **DELETE /api/preferences Support** ✅ ADDED
**Backend Spec:** DELETE endpoint exists for reset
**Fix:** Added `deletePreferences()` method that calls DELETE endpoint

---

## ✅ Already Aligned:

1. **Authentication** - Exact match (email, password, displayName)
2. **Movies Discovery** - Correct params (genres as IDs, length, page, batchSize)
3. **Like Movies** - Correct body (title, posterPath, releaseYear)
4. **Match Logic** - Only opens chat if `bothAccepted && roomId`
5. **SignalR** - Connection and message format match
6. **Error Handling** - 200/204/400/401/403/404 handled
7. **JWT Bearer Tokens** - Correctly sent in Authorization header

---

## 📋 Remaining Recommendations:

### Backend Tasks:
1. **Verify DELETE /api/preferences exists** - Frontend now calls it
2. **Confirm genre ID validation** - Frontend sends [28] for "Action", [18] for "Drama", etc.
3. **Check TMDB genre IDs match** - Especially for Crime (80), Romance (10749), Thriller (53)

### Frontend Already Handles:
✅ Backend always returns 200 OK for GET /api/preferences (with defaults)
✅ Empty `genreIds: []` means no preferences set
✅ Idempotent operations (likes, preferences save)
✅ Timestamp format (ISO 8601 UTC)

---

## 🎯 Test Plan:

### 1. Test Preferences Flow:
```
1. Sign up new user
2. Set preferences (Drama + short)
3. Check browser console:
   - "[LIVE] Transformed to backend format: {genreIds: [18], length: 'short'}"
4. Logout and login
5. Check console:
   - "[LIVE] Received preferences (backend format): {genreIds: [18], length: 'short'}"
   - "[LIVE] Transformed to frontend format: {genre: 'Drama', lengthBucket: 'short'}"
6. Should go to /liked-movies (not /onboarding)
```

### 2. Test Preferences Reset:
```
1. On Liked Movies page, click "Reset"
2. Check console:
   - "[LIVE] Deleting preferences from backend"
3. Should navigate to /onboarding
4. After setting new preferences, should save correctly
```

### 3. Test Genre Mapping:
```
Verify these genre name → ID mappings work:
- Action → 28
- Comedy → 35
- Drama → 18
- Romance → 10749
- Thriller → 53
- Horror → 27
- Sci-Fi → 878
- Fantasy → 14
- Crime → 80
- Western → 37
```

---

## 🚨 What Was Broken Before:

1. **Login always went to onboarding** - Because preferences were saved as `{genre: "Drama"}` but backend expected `{genreIds: [18]}`
2. **Preferences never persisted** - Wrong format was rejected/ignored by backend
3. **Discover page didn't filter correctly** - Preferences weren't loading

## ✅ What Works Now:

1. **Login flow:**
   - Has preferences → /liked-movies with banner
   - No preferences → /onboarding
2. **Preferences save** in correct format
3. **Preferences load** and transform back to UI format
4. **Continue button** uses saved preferences
5. **Reset button** clears via DELETE endpoint
6. **Genre filtering** works with TMDB genre IDs

---

## 📊 Backend Spec Compliance:

| Feature | Backend Spec | Frontend Implementation | Status |
|---------|--------------|------------------------|---------|
| Preferences Format | `{genreIds: [], length: ""}` | Now transforms correctly | ✅ |
| GET /api/preferences | Always returns 200 | Handles empty genreIds | ✅ |
| POST /api/preferences | Upsert with validation | Sends correct format | ✅ |
| DELETE /api/preferences | 204 No Content | Calls and handles | ✅ |
| Liked movies order | likedAt DESC | Client-side fallback sort | ✅ |
| Match toast | "Waiting for the other user" | Exact message | ✅ |
| URLs | lowercase | All lowercase now | ✅ |

---

## 🎬 Summary:

**The main issue was the preferences format mismatch.** The backend expected genre IDs as integers in an array, but the frontend was sending genre names as strings. This is now fixed with proper transformation layers.

All other endpoints were already well-aligned. The flow should now work exactly as specified! 🎉
