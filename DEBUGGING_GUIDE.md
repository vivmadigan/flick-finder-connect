# CineMatch Debugging Guide

## 🔍 How to Debug the Matching System

### Frontend Console Logging

The app now has comprehensive logging with color-coded labels:

- 🔐 **AUTH** (Green) - Login, logout, user authentication
- 👆 **ACTION** (Blue) - User actions like liking movies, changing preferences
- ❌ **ERROR** (Red) - Errors and failures
- 💕 **MATCH** (Pink) - Match notifications and events
- 🌐 **API** (Purple) - API calls to backend
- 🔔 **NOTIFICATION** (Orange) - Real-time SignalR notifications

### What You'll See When You:

#### 1. Login
```
🔐 AUTH: User logged in
   ↳ { userId: "...", email: "...", displayName: "..." }
🔔 NOTIFICATION: SignalR: Connected on login
```

#### 2. Choose Preferences (Onboarding)
```
👆 ACTION: Preferences updated
   ↳ { genre: "Action", lengthBucket: "medium" }
🌐 API: POST /api/UserPreferences
   ↳ { success: true }
```

#### 3. Like a Movie
```
👆 ACTION: 💚 Liking movie
   ↳ { userId: "...", movieId: "550", title: "Fight Club" }
🌐 API: POST /api/Movies/550/like
   ↳ { title: "Fight Club", posterPath: "...", releaseYear: "1999" }
👆 ACTION: ✅ Movie liked successfully - backend should create match requests
   ↳ { movieId: "550" }
👆 ACTION: Movie liked (added to local state)
   ↳ { movieId: "550" }
```

**CRITICAL**: After you see "Movie liked successfully", check your **BACKEND console** for these messages:

```
[MoviesController] User {userId} liking movie {tmdbId}
[MoviesController] Like saved successfully
[MoviesController] Calling CreateAutoMatchRequestsAsync for user {userId}, movie {tmdbId}
[MatchService] 🔍 Finding users who liked movie {tmdbId}...
[MatchService] ✅ Found {count} user(s) who liked movie {tmdbId}
[MatchService] ✅ Created match request: {userId} → {otherUserId} for movie {tmdbId}
[MatchService] ✅ Created match request: {otherUserId} → {userId} for movie {tmdbId}
[MatchService] 🎉 MUTUAL MATCH! Creating chat room for {userId} ↔ {otherUserId}
[MatchService] 🎉 Created chat room {roomId} for mutual match
[MatchService] 🎉 Sent mutual match notification to {userId}
[MatchService] 🎉 Sent mutual match notification to {otherUserId}
```

#### 4. Receive Match Notification (Frontend)
```
💕 MATCH: Received match notification
   ↳ { type: "mutualMatch", roomId: "...", user: {...}, sharedMovieTitle: "..." }
💕 MATCH: 🎉 MUTUAL MATCH! Chat room created
   ↳ { roomId: "...", otherUser: "John Doe", movie: "Fight Club" }
```

#### 5. Unlike a Movie
```
👆 ACTION: Unliking movie
   ↳ { userId: "...", movieId: "550" }
🌐 API: DELETE /api/Movies/550/like
👆 ACTION: ✅ Movie unliked successfully
   ↳ { movieId: "550" }
```

#### 6. Logout
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 AUTH: User logging out
   ↳ { userId: "...", email: "..." }
```

---

## 🐛 Debugging the Matching Bug

### Current Problem
Users report: **"Im still not getting matched when we both like the same movie"**

### Root Cause Investigation

The `MatchRequests` table in your database is **completely empty** (all NULL values). This means `CreateAutoMatchRequestsAsync()` is either:
1. Not being called at all
2. Failing silently without creating any records
3. Throwing an exception that's being swallowed

### Backend Code Analysis

Your `MoviesController.cs` has:
```csharp
await matchService.CreateAutoMatchRequestsAsync(userId, tmdbId, ct);
```

But your `MatchService.cs` implementation uses:
```csharp
_ = Task.Run(async () => { ... }, ct);
```

**Potential Issues:**
1. `Task.Run` with `CancellationToken` might be causing the task to be cancelled immediately
2. Background tasks might be failing silently
3. Database context might be disposed before background task completes
4. No exception handling at the Task.Run level

### Step-by-Step Debugging

#### Step 1: Add Backend Logging (REQUIRED)

Add this to your `MoviesController.cs` Like endpoint:

```csharp
[HttpPost("{tmdbId:int}/like")]
public async Task<IActionResult> Like(
    int tmdbId,
    [FromBody] LikeMovieRequestDto body,
    [FromServices] IUserLikesService likes,
    [FromServices] Infrastructure.Services.Matches.IMatchService matchService,
    CancellationToken ct)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();

    Console.WriteLine($"[MoviesController] ═══════════════════════════════════════");
    Console.WriteLine($"[MoviesController] User {userId} liking movie {tmdbId}");
    Console.WriteLine($"[MoviesController] Movie: {body.Title} ({body.ReleaseYear})");

    // Save the like
    await likes.UpsertLikeAsync(userId, tmdbId, body.Title, body.PosterPath, body.ReleaseYear, ct);
    Console.WriteLine($"[MoviesController] ✅ Like saved successfully");

    // ✅ NEW: Automatically create match requests
    try
    {
        Console.WriteLine($"[MoviesController] Calling CreateAutoMatchRequestsAsync...");
        await matchService.CreateAutoMatchRequestsAsync(userId, tmdbId, ct);
        Console.WriteLine($"[MoviesController] ✅ CreateAutoMatchRequestsAsync completed");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[MoviesController] ❌ ERROR in CreateAutoMatchRequestsAsync:");
        Console.WriteLine($"[MoviesController]    Message: {ex.Message}");
        Console.WriteLine($"[MoviesController]    Stack: {ex.StackTrace}");
        // Don't fail the like if matching fails
    }

    Console.WriteLine($"[MoviesController] ═══════════════════════════════════════");
    return NoContent();
}
```

#### Step 2: Test with Two Accounts

1. **Open two browsers** (or one normal + one incognito)
2. **Account A**: Login, choose preferences, like movie ID 550 (Fight Club)
3. **Account B**: Login, choose same preferences, like movie ID 550
4. **Watch BOTH consoles** (frontend + backend)

**Expected Backend Logs:**
```
[MoviesController] ═══════════════════════════════════════
[MoviesController] User abc123 liking movie 550
[MoviesController] ✅ Like saved successfully
[MoviesController] Calling CreateAutoMatchRequestsAsync...
[MatchService] 🔍 Finding users who liked movie 550...
[MatchService] ✅ Found 1 user(s) who liked movie 550
[MatchService] ✅ Created match request: abc123 → xyz789 for movie 550
[MatchService] ✅ Created match request: xyz789 → abc123 for movie 550
[MatchService] 🎉 MUTUAL MATCH! Creating chat room
[MatchService] 🎉 Created chat room {guid} for mutual match
[MatchService] 🎉 Sent mutual match notification to abc123
[MatchService] 🎉 Sent mutual match notification to xyz789
[MoviesController] ✅ CreateAutoMatchRequestsAsync completed
[MoviesController] ═══════════════════════════════════════
```

**If you DON'T see MatchService logs:**
- `CreateAutoMatchRequestsAsync()` is not executing
- Task.Run might be failing immediately
- CancellationToken issue

**If you see MatchService logs but no database entries:**
- Database context disposed before SaveChangesAsync
- Transaction not committed
- Foreign key constraint violation

#### Step 3: Check Database

After both users like the same movie, run this SQL query:

```sql
SELECT * FROM MatchRequests 
WHERE TmdbId = 550
ORDER BY CreatedAt DESC
```

**Expected Result**: 2 rows (bidirectional match requests)

```
Id      | RequestorId | TargetUserId | TmdbId | CreatedAt
--------|-------------|--------------|--------|-------------------
guid1   | abc123      | xyz789       | 550    | 2025-10-29 ...
guid2   | xyz789      | abc123       | 550    | 2025-10-29 ...
```

**If table is empty**: Background task failed or never ran

#### Step 4: Check SignalR Connection

In frontend console after login, you should see:
```
🔔 NOTIFICATION: SignalR: Connected on login
```

If you don't see this, check:
1. Backend ChatHub is running
2. CORS allows credentials
3. JWT token is valid
4. WebSocket connection succeeds

---

## 🔧 Potential Fixes

### Fix 1: Remove Task.Run (Recommended)

In `MatchService.cs`, change `CreateAutoMatchRequestsAsync` to run synchronously:

```csharp
public async Task CreateAutoMatchRequestsAsync(string userId, int tmdbId, CancellationToken ct)
{
    try
    {
        Console.WriteLine($"[MatchService] 🔍 Finding users who liked movie {tmdbId}...");

        // Find all users who already liked this movie
        var usersWhoLiked = await _db.UserMovieLikes
            .AsNoTracking()
            .Where(x => x.TmdbId == tmdbId && x.UserId != userId)
            .Select(x => x.UserId)
            .Distinct()
            .ToListAsync(ct);

        if (usersWhoLiked.Count == 0)
        {
            Console.WriteLine($"[MatchService] ℹ️ No other users liked movie {tmdbId} yet");
            return;
        }

        Console.WriteLine($"[MatchService] ✅ Found {usersWhoLiked.Count} user(s) who liked movie {tmdbId}");

        // Create match requests for each user
        foreach (var otherUserId in usersWhoLiked)
        {
            try
            {
                var (mutualMatch, roomId) = await CreateBidirectionalMatchRequestsAsync(userId, otherUserId, tmdbId, ct);

                if (mutualMatch)
                {
                    Console.WriteLine($"[MatchService] 🎉 MUTUAL MATCH! Chat room: {roomId}");
                    await SendMutualMatchNotificationAsync(userId, otherUserId, tmdbId, roomId);
                }
                else
                {
                    await SendMatchNotificationAsync(userId, otherUserId, tmdbId);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MatchService] ❌ Failed to create match for user {otherUserId}: {ex.Message}");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[MatchService] ❌ Failed to create auto-match requests: {ex.Message}");
        Console.WriteLine($"[MatchService] Stack: {ex.StackTrace}");
        throw; // Re-throw so controller can catch it
    }
}
```

**Advantages:**
- Errors are visible in controller
- Database context stays alive
- Easier to debug
- Match creation is guaranteed before API response

**Disadvantages:**
- Slightly slower API response (but only by ~100ms)

### Fix 2: Use Separate DbContext for Background Task

Keep Task.Run but create a new scoped DbContext:

```csharp
_ = Task.Run(async () =>
{
    using var scope = _serviceScopeFactory.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        // ... matching logic using 'db' instead of '_db' ...
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[MatchService] ❌ Background task failed: {ex.Message}");
    }
});
```

---

## ✅ Success Criteria

Matching is working when:

1. ✅ Frontend shows: "Movie liked successfully - backend should create match requests"
2. ✅ Backend logs: "[MatchService] ✅ Found X user(s) who liked movie Y"
3. ✅ Database has 2 rows in MatchRequests table (bidirectional)
4. ✅ Both users receive: "🎉 MUTUAL MATCH! Chat room created"
5. ✅ Frontend notification shows "It's a match!" with "Open Chat" button
6. ✅ Clicking "Open Chat" navigates to `/chat/{roomId}`
7. ✅ Chat room has both users as members

---

## 📊 Monitoring User Flow

Use browser console to track entire user journey:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 AUTH: User logged in
   ↳ { userId: "abc123", email: "user@example.com", displayName: "John" }
🔔 NOTIFICATION: SignalR: Connected on login
👆 ACTION: Preferences updated
   ↳ { genre: "Action", lengthBucket: "medium" }
🌐 API: POST /api/UserPreferences
👆 ACTION: 💚 Liking movie
   ↳ { userId: "abc123", movieId: "550", title: "Fight Club" }
🌐 API: POST /api/Movies/550/like
👆 ACTION: ✅ Movie liked successfully - backend should create match requests
💕 MATCH: Received match notification
💕 MATCH: 🎉 MUTUAL MATCH! Chat room created
   ↳ { roomId: "...", otherUser: "Jane", movie: "Fight Club" }
```

---

## 🚨 Common Issues

### Issue 1: No backend logs after liking movie
**Cause**: CreateAutoMatchRequestsAsync not being called
**Fix**: Check MoviesController.cs has the matchService call

### Issue 2: Backend logs show "No other users liked movie X"
**Cause**: Other user hasn't liked the movie yet, or liked a different movie ID
**Fix**: Make sure both users like the EXACT same movieId

### Issue 3: MatchRequests table empty despite backend logs
**Cause**: Task.Run background task fails, or DbContext disposed
**Fix**: Use Fix #1 (remove Task.Run) or Fix #2 (scoped DbContext)

### Issue 4: No SignalR notification received
**Cause**: SignalR connection failed, or NotificationService not connected
**Fix**: Check frontend console for "SignalR: Connected" message

### Issue 5: "It's a match!" shows but can't find chat room
**Cause**: ChatRoom created but memberships not saved
**Fix**: Check CreateMutualMatchAsync saves both ChatMemberships

---

## 🎯 Next Steps

1. Add the backend logging code from Step 1
2. Test with two accounts simultaneously
3. Share the backend console output with me
4. Check the database MatchRequests table
5. Based on the logs, we'll identify the exact failure point
