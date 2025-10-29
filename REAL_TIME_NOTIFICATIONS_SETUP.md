# Real-Time Match Notifications - Setup Guide

## 🎯 Overview

This document explains the real-time notification system that alerts users when someone likes a movie they also liked, creating a potential match.

---

## ✅ Frontend Implementation (COMPLETED)

### **Files Created:**

1. **`src/lib/services/NotificationService.ts`**
   - Connects to SignalR `/chathub` endpoint
   - Listens for `NewMatch` events from backend
   - Shows toast notifications with "View Match" action
   - Supports browser notifications (with permission)
   - Auto-reconnects if connection drops

### **Files Modified:**

2. **`src/context/AuthContext.tsx`**
   - Connects to notification service on login
   - Connects on app startup if user already logged in
   - Disconnects on logout
   - Requests browser notification permission

3. **`src/components/Navbar.tsx`**
   - Added "Matches" button with bell icon
   - Shows red badge dot when new match arrives
   - Badge auto-clears after 10 seconds
   - Links to `/match` page

### **How It Works:**

1. User logs in → `NotificationService.connect()` is called
2. Service establishes WebSocket connection to `/chathub`
3. When backend sends `NewMatch` event, service:
   - Shows toast: "New Match! 🎉 [User] liked [Movie]"
   - Shows browser notification (if permitted)
   - Triggers badge on navbar "Matches" button
4. User can click "View Match" in toast or "Matches" in navbar
5. On logout, connection is closed

---

## 🔧 Backend Implementation (REQUIRED)

### **Step 1: Create/Update ChatHub**

**File:** `Presentation/Hubs/ChatHub.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace Presentation.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        // Track userId -> connectionId mapping for targeted notifications
        private static readonly ConcurrentDictionary<string, string> UserConnections = new();

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                UserConnections[userId] = Context.ConnectionId;
                Console.WriteLine($"[ChatHub] User {userId} connected with connection {Context.ConnectionId}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                UserConnections.TryRemove(userId, out _);
                Console.WriteLine($"[ChatHub] User {userId} disconnected");
            }
            await base.OnDisconnectedAsync(exception);
        }

        // Method to send notification to a specific user
        public static async Task NotifyNewMatch(IHubContext<ChatHub> hubContext, string targetUserId, object matchData)
        {
            if (UserConnections.TryGetValue(targetUserId, out var connectionId))
            {
                try
                {
                    await hubContext.Clients.Client(connectionId).SendAsync("NewMatch", matchData);
                    Console.WriteLine($"[ChatHub] Sent NewMatch notification to user {targetUserId}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ChatHub] Failed to send notification to {targetUserId}: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"[ChatHub] User {targetUserId} not connected, cannot send notification");
            }
        }

        // Existing chat methods...
        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            Console.WriteLine($"[ChatHub] User joined room {roomId}");
        }

        public async Task SendMessage(string roomId, string content)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var displayName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

            await Clients.Group(roomId).SendAsync("ReceiveMessage", new
            {
                userId,
                displayName,
                content,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
```

---

### **Step 2: Update MatchService**

**File:** `Infrastructure/Services/Matches/MatchService.cs`

Add `IHubContext<ChatHub>` injection and notification logic:

```csharp
using Microsoft.AspNetCore.SignalR;
using Presentation.Hubs;

public class MatchService : IMatchService
{
    private readonly ApplicationDbContext _db;
    private readonly IHubContext<ChatHub> _hubContext; // Add this

    public MatchService(ApplicationDbContext db, IHubContext<ChatHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    public async Task<MatchResultDto> RequestAsync(
        string requestorId,
        string targetUserId,
        int tmdbId,
        CancellationToken ct)
    {
        // ... existing match creation logic ...

        // After determining if it's a new potential match (overlap >= 1):
        var requestorUser = await _db.Users.FindAsync(requestorId);
        var sharedMovie = await _db.UserMovieLikes
            .Where(l => l.UserId == requestorId && l.TmdbId == tmdbId)
            .FirstOrDefaultAsync(ct);

        // Send notification to target user
        _ = Task.Run(async () =>
        {
            try
            {
                await ChatHub.NotifyNewMatch(_hubContext, targetUserId, new
                {
                    type = "newMatch",
                    matchId = $"match-{requestorId}-{targetUserId}",
                    user = new
                    {
                        id = requestorId,
                        displayName = requestorUser?.DisplayName ?? "Someone"
                    },
                    sharedMovieTitle = sharedMovie?.Title ?? "a movie you liked",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MatchService] Failed to send notification: {ex.Message}");
            }
        });

        // ... rest of method ...
    }
}
```

**Key Points:**
- Notification is sent asynchronously (`Task.Run`) so it doesn't block the API response
- Errors in notification don't break the match creation
- Only the TARGET user gets notified (not the requestor)
- Notification is sent when overlap count reaches 1 or more

---

### **Step 3: Register ChatHub (Already Done)**

Your `Program.cs` already has:
```csharp
builder.Services.AddSignalR();
app.MapHub<ChatHub>("/chathub");
```

✅ This is correct!

---

### **Step 4: Update MatchService DI Registration**

In `Program.cs`, ensure `IHubContext<ChatHub>` is available:

```csharp
// SignalR must be registered BEFORE MatchService
builder.Services.AddSignalR();

// MatchService will automatically receive IHubContext<ChatHub> via DI
builder.Services.AddScoped<IMatchService, MatchService>();
```

✅ No changes needed if SignalR is registered before services.

---

## 🧪 Testing the Notification System

### **Test Scenario:**

1. **User A** logs in and likes Movie X
2. **User B** logs in and likes Movie X
3. **Expected Result:**
   - User A should see a toast: "New Match! 🎉 User B liked Movie X"
   - User A should see a red badge on "Matches" button in navbar
   - User A can click "View Match" to see User B in match candidates

### **How to Test:**

1. Open two browser windows (or incognito + regular)
2. Sign in as User A in window 1
3. Sign in as User B in window 2
4. User A: Like a movie (e.g., "The Shawshank Redemption")
5. User B: Like the same movie
6. Watch User A's window for toast notification
7. Check User A's navbar for red badge on "Matches" button

### **Debugging:**

**Backend Console:**
```
[ChatHub] User {userId} connected with connection {connectionId}
[MatchService] New potential match: User A <-> User B (overlap: 1)
[ChatHub] Sent NewMatch notification to user {targetUserId}
```

**Frontend Console (F12):**
```
[NotificationService] Connected to SignalR for notifications
[NotificationService] Received new match notification: {...}
```

**If Not Working:**
1. Check backend logs for `[ChatHub]` messages
2. Check frontend console for connection errors
3. Verify JWT token is valid (`localStorage.getItem('access_token')`)
4. Verify CORS allows WebSocket connections
5. Check Network tab for WebSocket connection status

---

## 📱 Browser Notifications

The system also supports browser notifications (the ones that pop up outside the browser window).

**How It Works:**
1. On login, system requests notification permission
2. User sees browser prompt: "Allow notifications?"
3. If granted, new matches show as browser notifications
4. Works even when tab is in background

**To Enable:**
- User must click "Allow" when prompted
- Or manually enable in browser settings: Site Settings → Notifications

---

## 🔄 Connection Management

**Auto-Reconnect:**
- SignalR automatically reconnects if connection drops
- Toast notification: "Reconnected to notifications"

**Connection States:**
- ✅ Connected: Real-time notifications active
- ⚠️ Reconnecting: Attempting to reconnect
- ❌ Disconnected: No notifications (user logged out)

**When User Closes Tab:**
- Connection automatically closes
- Backend removes user from UserConnections map
- No memory leaks

---

## 🚀 Next Steps

1. Implement the backend code above
2. Test with two users
3. Optional: Add match count badge instead of just red dot
4. Optional: Add notification history page
5. Optional: Add push notifications for mobile

---

## 📝 Notes

- **Security:** SignalR uses the same JWT authentication as REST APIs
- **Performance:** Notifications are sent to specific users only (not broadcast)
- **Scalability:** For multiple server instances, use Redis backplane
- **Fallback:** If SignalR fails, users can still manually check matches

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Connection failed" | Check CORS allows WebSockets |
| "No notification received" | Check backend console for `[ChatHub]` logs |
| "Badge doesn't appear" | Check browser console for errors |
| "Permission denied" | User must allow notifications in browser settings |

---

✅ **Frontend: READY**  
⚠️ **Backend: Needs implementation (use prompt above)**  
🧪 **Testing: Ready to test after backend implementation**
