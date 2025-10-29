# Backend Verification Checklist

## Issue: User's Liked Movies Not Showing

The frontend now has a `/liked-movies` page that calls `GET /api/Movies/likes` to fetch the current user's liked movies. Based on the Swagger test showing an empty array `[]`, we need to verify the backend is correctly storing and retrieving likes.

---

## What to Ask Copilot on the Backend

### 1. Verify the Likes Endpoint Exists and Works

**Prompt for Copilot:**
```
I need to verify the GET /api/Movies/likes endpoint is working correctly. It should:

1. Return the current authenticated user's liked movies from the UserMovieLikes table
2. Join with the movie snapshot data we save when liking (title, posterPath, releaseYear)
3. Return movies in order (most recent first - ORDER BY LikedAt DESC)
4. The response format should be a JSON array like:
   [
     {
       "tmdbId": 1151031,
       "title": "Bring Her Back",
       "posterPath": "https://image.tmdb.org/t/p/w342/1Q3GlCXGYWELifxANYZ5OVMRVZl.jpg",
       "releaseYear": "2025",
       "likedAt": "2025-10-29T12:34:56Z"
     }
   ]

Can you check the MoviesController GET /api/Movies/likes endpoint and make sure it:
- Uses [Authorize] attribute
- Gets the current user's ID from User.FindFirst(ClaimTypes.NameIdentifier)
- Queries UserMovieLikes table filtered by userId
- Returns the movie data we saved (not making new TMDB calls)
- Orders by LikedAt descending
```

---

### 2. Verify Likes Are Being Saved Correctly

**Prompt for Copilot:**
```
When a user likes a movie via POST /api/Movies/{tmdbId}/like, we should be:

1. Saving to the UserMovieLikes table with:
   - UserId (from authenticated user)
   - TmdbId (from URL parameter)
   - Title, PosterPath, ReleaseYear (from request body)
   - LikedAt timestamp (DateTime.UtcNow)

2. Making the like idempotent (if user already liked it, just update LikedAt or return success)

Can you verify the POST /api/Movies/{tmdbId}/like endpoint in MoviesController is correctly saving all this data?
```

---

### 3. Check Database Schema

**Prompt for Copilot:**
```
Can you verify the UserMovieLikes table has these columns:

- Id (primary key)
- UserId (foreign key to AspNetUsers)
- TmdbId (int - the TMDB movie ID)
- Title (string)
- PosterPath (string - full URL)
- ReleaseYear (string)
- LikedAt (DateTime)

And that there's a unique constraint or index on (UserId, TmdbId) to prevent duplicate likes?
```

---

### 4. Test the Flow End-to-End

**Prompt for Copilot:**
```
Can you help me test the like flow:

1. Authenticate as a user (get JWT token)
2. POST to /api/Movies/1151031/like with body:
   {
     "title": "Test Movie",
     "posterPath": "https://image.tmdb.org/t/p/w342/test.jpg",
     "releaseYear": "2025"
   }
3. Then GET /api/Movies/likes to verify the movie appears

The GET should return the movie we just liked with all the data we sent.
```

---

## Expected Backend Response Format

When the frontend calls `GET /api/Movies/likes`, it expects:

```json
[
  {
    "tmdbId": 1151031,
    "title": "Bring Her Back",
    "posterPath": "https://image.tmdb.org/t/p/w342/1Q3GlCXGYWELifxANYZ5OVMRVZl.jpg",
    "releaseYear": "2025",
    "likedAt": "2025-10-29T12:34:56.789Z",
    "oneLiner": "Optional - brief synopsis if available"
  }
]
```

---

## Frontend Changes Made

✅ Created `MoviesService.getLikedMovies()` method that calls `GET /api/Movies/likes`
✅ Created `/liked-movies` page component with grid display
✅ Added route to App.tsx
✅ Added "Liked Movies" menu item in Navbar dropdown
✅ Proper error handling and loading states

---

## What Should Work After Backend Fix

1. User likes movies on `/discover` page → saves to database ✅ (already working)
2. User clicks profile menu → "Liked Movies" option
3. User clicks "Liked Movies" → sees grid of all movies they've liked
4. Movies display with poster, title, and year
5. Empty state shows if no likes yet

---

## Testing Steps

1. **Test Like Storage:**
   - Use Swagger to POST a like
   - Check database to verify row was created
   - Verify all fields are populated

2. **Test Like Retrieval:**
   - Use Swagger to GET /api/Movies/likes
   - Should return array of liked movies
   - Should be ordered by most recent first

3. **Test in Frontend:**
   - Login to frontend
   - Like 3-5 movies on discover page
   - Click profile menu → "Liked Movies"
   - Should see grid of all liked movies
   - Console should show `[LIVE] Received liked movies: [...]`

---

## Common Issues to Check

❌ **Empty array returned** = No data in UserMovieLikes table OR userId not matching
❌ **401 Unauthorized** = Missing [Authorize] attribute or JWT not being sent
❌ **404 Not Found** = Route doesn't exist or incorrect URL
❌ **500 Server Error** = Database query error or missing table/columns
❌ **Wrong user's data** = Not filtering by current user's ID correctly
