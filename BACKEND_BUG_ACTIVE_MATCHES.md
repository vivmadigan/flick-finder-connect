# 🐛 Backend Bug Report: Active Matches Endpoint

## Issue Summary

The `GET /api/Matches/active` endpoint is throwing an exception that prevents users from viewing their active matches/chats.

---

## Error Details

**Exception:** `System.Collections.Generic.KeyNotFoundException`

**Message:** `"The given key 'EmptyProjectionMember' was not present in the dictionary."`

**Location:** Backend LINQ query in the Active Matches endpoint implementation

---

## Observed Behavior

1. User clicks "Chats" button in navbar (navigates to `/active-matches`)
2. Frontend calls `GET /api/Matches/active`
3. Backend throws exception
4. Frontend receives 500 error
5. UI shows toast: "Failed to load active matches"
6. Console shows: "Backend Error: The Active Matches endpoint has a bug"

---

## Backend Logs

```
Exception User-Unhandled
System.Collections.Generic.KeyNotFoundException: 'The given key 'EmptyProjectionMember' was not present in the dictionary.'
```

This error typically occurs when Entity Framework cannot translate a LINQ projection properly.

---

## Root Cause

The error `'EmptyProjectionMember' was not present in the dictionary` is a **Entity Framework projection issue**. This happens when you try to:

1. **Project to an anonymous type with complex nested queries**
2. **Use `.ToDictionaryAsync()` with a projection that EF can't translate**
3. **Reference navigation properties in a way EF can't compile to SQL**

---

## Expected Endpoint Behavior

**Endpoint:** `GET /api/Matches/active`

**Should Return:**
```json
[
  {
    "userId": "user-123",
    "displayName": "John Doe",
    "roomId": "room-456",
    "matchedAt": "2025-10-30T10:00:00Z",
    "lastMessageAt": "2025-10-30T12:00:00Z",
    "lastMessage": "Hey! Want to watch that movie tonight?",
    "unreadCount": 2,
    "sharedMovies": [
      {
        "tmdbId": 27205,
        "title": "Inception",
        "posterUrl": "https://image.tmdb.org/t/p/w500/...",
        "releaseYear": "2010"
      }
    ]
  }
]
```

---

## Suggested Fix

The issue is likely in how you're building the Active Matches query. Here's a working implementation:

### **Step 1: Get User's Chat Rooms**

```csharp
// Get all rooms where current user is a member
var userRoomIds = await _db.ChatMemberships
    .Where(m => m.UserId == userId)
    .Select(m => m.RoomId)
    .ToListAsync(ct);
```

### **Step 2: Get Matched Users**

```csharp
// Get OTHER members in those rooms (the matched users)
var matchedUserIds = await _db.ChatMemberships
    .Where(m => userRoomIds.Contains(m.RoomId) && m.UserId != userId)
    .Select(m => new { m.UserId, m.RoomId })
    .ToListAsync(ct);
```

### **Step 3: Build Result (Avoid Complex Projections)**

```csharp
var result = new List<ActiveMatchDto>();

foreach (var match in matchedUserIds)
{
    // Get user details
    var matchedUser = await _db.Users
        .Where(u => u.Id == match.UserId)
        .Select(u => new { u.Id, u.DisplayName })
        .FirstOrDefaultAsync(ct);
    
    if (matchedUser == null) continue;
    
    // Get room details
    var room = await _db.ChatRooms
        .Where(r => r.Id == match.RoomId)
        .FirstOrDefaultAsync(ct);
    
    if (room == null) continue;
    
    // Get last message (separately to avoid projection issues)
    var lastMessage = await _db.ChatMessages
        .Where(msg => msg.RoomId == match.RoomId)
        .OrderByDescending(msg => msg.SentAt)
        .Select(msg => new { msg.Content, msg.SentAt })
        .FirstOrDefaultAsync(ct);
    
    // Get unread count
    var unreadCount = await _db.ChatMessages
        .Where(msg => msg.RoomId == match.RoomId 
                   && msg.SenderId != userId 
                   && !msg.IsRead)
        .CountAsync(ct);
    
    // Get shared movies (c) Bulk fetch: Shared movies between current user and matched users
var myLikes = await _db.UserMovieLikes
    .AsNoTracking()
    .Where(x => x.UserId == userId)
    .Select(x => x.TmdbId)
    .ToListAsync(ct);

var theirLikes = await _db.UserMovieLikes
    .AsNoTracking()
    .Where(x => matchedUserIds.Contains(x.UserId) && myLikes.Contains(x.TmdbId))
    .GroupBy(g => g.UserId)
    .Select(g => new
    {
        UserId = g.Key,
        SharedMovieIds = g.Select(x => x.TmdbId).Distinct().ToList()
    })
    .ToDictionaryAsync(x => x.UserId, x => x.SharedMovieIds, ct);

// (7) Bulk fetch: Movie details for all shared movies
var allSharedMovieIds = theirLikes.Values.SelectMany(ids => ids).Distinct().ToList();
var movieDetails = await _db.UserMovieLikes
    .AsNoTracking()
    .Where(ml => allSharedMovieIds.Contains(ml.TmdbId))
    .GroupBy(ml => ml.TmdbId)
    .Select(g => g.First())
    .Select(ml => new SharedMovieDto
    {
        TmdbId = ml.TmdbId,
        Title = ml.Title ?? string.Empty,
        PosterUrl = string.IsNullOrEmpty(ml.PosterPath) ? "" : $"https://image.tmdb.org/t/p/w500{ml.PosterPath}",
        ReleaseYear = ml.ReleaseYear
    })
    .ToListAsync(ct);

var moviesById = movieDetails.ToDictionary(m => m.TmdbId);
    
    var sharedMovies = theirLikes.TryGetValue(match.UserId, out var ids) 
        ? ids.Select(id => moviesById.TryGetValue(id, out var movie) ? movie : null)
             .Where(m => m != null)
             .Cast<SharedMovieDto>()
             .ToList()
        : new List<SharedMovieDto>();
    
    // Add to result
    result.Add(new ActiveMatchDto
    {
        UserId = matchedUser.Id,
        DisplayName = matchedUser.DisplayName,
        RoomId = room.Id,
        MatchedAt = room.CreatedAt,
        LastMessageAt = lastMessage?.SentAt,
        LastMessage = lastMessage?.Content,
        UnreadCount = unreadCount,
        SharedMovies = sharedMovies
    });
}

return result;
```

---

## Alternative: Simpler Query (If Above is Complex)

If the above is too complex, you can start with a **minimal version** that just returns basic info:

```csharp
var userRoomIds = await _db.ChatMemberships
    .Where(m => m.UserId == userId)
    .Select(m => m.RoomId)
    .ToListAsync(ct);

var matchedUsers = await _db.ChatMemberships
    .Where(m => userRoomIds.Contains(m.RoomId) && m.UserId != userId)
    .Select(m => new 
    {
        m.UserId,
        m.RoomId,
        m.User.DisplayName,
        Room = _db.ChatRooms.FirstOrDefault(r => r.Id == m.RoomId)
    })
    .ToListAsync(ct);

var result = matchedUsers.Select(m => new ActiveMatchDto
{
    UserId = m.UserId,
    DisplayName = m.DisplayName ?? "Unknown",
    RoomId = m.RoomId,
    MatchedAt = m.Room?.CreatedAt ?? DateTime.UtcNow,
    LastMessageAt = null,
    LastMessage = null,
    UnreadCount = 0,
    SharedMovies = new List<SharedMovieDto>() // Empty for now
}).ToList();

return result;
```

Then **gradually add** the last message, unread count, and shared movies in separate queries.

---

## Testing

After fixing, test with:

```bash
curl -X GET "https://localhost:7119/api/Matches/active" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected: 200 OK with array of matches (or empty array if no matches)

---

## Priority

**HIGH** - This blocks users from accessing their active chats

---

## Frontend Workaround

Frontend has been updated to:
1. Show friendly error message when backend fails
2. Display empty state instead of infinite loading
3. Provide "Browse Candidates" button as alternative navigation

But this still needs to be fixed in the backend for full functionality.

---

**Reporter:** Frontend Team  
**Date:** October 30, 2025  
**Status:** Needs Backend Fix
