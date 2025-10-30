# 🚨 URGENT: Backend Bug Breaking Matching System

## The Problem

The `GET /api/Matches/active` endpoint is throwing this exception:

```
System.Collections.Generic.KeyNotFoundException: 
'The given key 'EmptyProjectionMember' was not present in the dictionary.'
```

This is crashing the Active Matches page, preventing users from seeing their chat list.

---

## What's Broken

1. **Active Matches Page**: Users click "Chats" → App crashes with 500 error
2. **Error Type**: Entity Framework LINQ projection error
3. **Location**: `GET /api/Matches/active` endpoint implementation

---

## Quick Fix

The error happens when Entity Framework can't translate a complex LINQ query to SQL. 

**DO NOT use complex projections with `.ToDictionaryAsync()` or nested `.Select()` inside queries.**

### ✅ **Working Pattern:**

```csharp
// BAD - This causes the error
var result = await _db.ChatMemberships
    .Where(m => m.UserId == userId)
    .Select(m => new 
    {
        User = m.User,
        SharedMovies = m.User.MovieLikes.Where(...).ToDictionary(...) // ❌ Don't do this
    })
    .ToListAsync();

// GOOD - Query in stages
var roomIds = await _db.ChatMemberships
    .Where(m => m.UserId == userId)
    .Select(m => m.RoomId)
    .ToListAsync(); // ✅ Simple query first

var matchedUsers = await _db.ChatMemberships
    .Where(m => roomIds.Contains(m.RoomId) && m.UserId != userId)
    .Include(m => m.User)
    .ToListAsync(); // ✅ Get data

// Then process in memory
var result = matchedUsers.Select(m => new ActiveMatchDto 
{
    UserId = m.UserId,
    DisplayName = m.User.DisplayName,
    // ... build DTO here
}).ToList();
```

---

## Minimal Working Implementation

Replace your current `GetActiveMatchesAsync()` method with this:

```csharp
public async Task<List<ActiveMatchDto>> GetActiveMatchesAsync(string userId, CancellationToken ct)
{
    // Step 1: Get user's chat rooms
    var roomIds = await _db.ChatMemberships
        .Where(m => m.UserId == userId)
        .Select(m => m.RoomId)
        .ToListAsync(ct);

    if (!roomIds.Any()) return new List<ActiveMatchDto>();

    // Step 2: Get other members in those rooms
    var matches = await _db.ChatMemberships
        .Where(m => roomIds.Contains(m.RoomId) && m.UserId != userId)
        .Select(m => new 
        {
            m.UserId,
            m.RoomId,
            m.User.DisplayName,
            RoomCreatedAt = m.Room.CreatedAt
        })
        .ToListAsync(ct);

    // Step 3: Build DTOs (in memory, not in database query)
    var result = matches.Select(m => new ActiveMatchDto
    {
        UserId = m.UserId,
        DisplayName = m.DisplayName,
        RoomId = m.RoomId,
        MatchedAt = m.RoomCreatedAt,
        LastMessageAt = null,
        LastMessage = null,
        UnreadCount = 0,
        SharedMovies = new List<SharedMovieDto>() // Start with empty, add later if needed
    }).ToList();

    return result;
}
```

This gives you a **working endpoint immediately**. You can add last message, unread count, and shared movies in **separate queries** after this works.

---

## Testing

After fixing, test:

```bash
curl https://localhost:7119/api/Matches/active -H "Authorization: Bearer TOKEN"
```

Should return: `200 OK` with array of matches (or empty array `[]`)

---

## Priority

**CRITICAL** - Users cannot access their chats until this is fixed.

Please fix this ASAP so we can test the full matching flow.
