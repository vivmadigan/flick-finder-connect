# 🎬 CineMatch: Complete Matching Flow Documentation

## Overview

CineMatch uses a **manual two-way matching system** where users must explicitly choose to connect with each other. It's NOT automatic - both users must take action.

---

## 🔄 The Complete Flow

### **Step 1: Users Like Movies (Independent)**

**What Happens:**
```
User A discovers movies and likes:
  - "Inception" ❤️
  - "The Matrix" ❤️
  - "Interstellar" ❤️

User B discovers movies and likes:
  - "Inception" ❤️
  - "The Matrix" ❤️
  - "Dune" ❤️
```

**Backend:**
- Stores each like in `UserMovieLikes` table
- NO match requests created yet
- Users are independent at this point

**Frontend:**
- User clicks ❤️ button on movie card
- `POST /api/Movies/likes` called
- Movie saved to user's liked list

---

### **Step 2: User A Checks for Matches**

**What Happens:**
```
User A clicks "Matches" in navbar
→ Navigates to /matches page
→ Frontend calls GET /api/Matches/candidates
```

**Backend Logic:**
1. Query `UserMovieLikes` to find users who liked same movies as User A
2. Calculate shared movies between User A and each candidate
3. Check match status between User A and each candidate
4. Return candidates with their status

**API Response:**
```json
[
  {
    "userId": "user-b-id",
    "displayName": "User B",
    "overlapCount": 2,
    "sharedMovieIds": [27205, 603],
    "sharedMovies": [
      {
        "tmdbId": 27205,
        "title": "Inception",
        "posterUrl": "https://image.tmdb.org/t/p/w500/...",
        "releaseYear": "2010"
      },
      {
        "tmdbId": 603,
        "title": "The Matrix",
        "posterUrl": "https://image.tmdb.org/t/p/w500/...",
        "releaseYear": "1999"
      }
    ],
    "matchStatus": "none",
    "requestSentAt": null
  }
]
```

**Frontend Display:**
- Shows User B's card with shared movies
- Shows "Match" button (green)
- No pending status yet

---

### **Step 3: User A Sends Match Request (MANUAL ACTION)**

**What Happens:**
```
User A sees User B in candidates list
User A clicks "Match" button on User B's card
```

**Frontend Action:**
```typescript
// In Match.tsx - handleMatch()
const tmdbId = candidate.sharedMovieIds[0]; // Use first shared movie
await MatchService.acceptMatch(candidate.userId, tmdbId);
```

**API Call:**
```
POST /api/Matches/request
Body: {
  "targetUserId": "user-b-id",
  "tmdbId": 27205
}
```

**Backend Logic:**
1. Create match request: User A → User B (for movie "Inception")
2. Check if reverse request exists: Does User B → User A exist? **NO**
3. Send SignalR notification to User B: "matchRequestReceived"
4. Return response: Not a mutual match yet

**API Response:**
```json
{
  "matched": false,
  "roomId": null
}
```

**Frontend Updates:**
- Button changes to "Pending (sent 2 minutes ago)"
- Button is disabled
- matchStatus updates to "pending_sent"
- Toast: "Match request sent!"

**SignalR Event (User B receives):**
```javascript
// NotificationService.ts
connection.on('matchRequestReceived', (notification) => {
  toast.info('Someone wants to match with you!', {
    description: `${notification.displayName} wants to connect`,
    action: {
      label: 'View',
      onClick: () => navigate('/matches')
    }
  });
});
```

---

### **Step 4: User B Sees Pending Request**

**What Happens:**
```
User B receives toast notification (real-time via SignalR)
OR
User B navigates to /matches page
→ Frontend calls GET /api/Matches/candidates
```

**Backend Logic:**
1. Find users who liked same movies as User B
2. Find User A in the list
3. Check match status: User A → User B request exists
4. Set matchStatus to "pending_received"

**API Response:**
```json
[
  {
    "userId": "user-a-id",
    "displayName": "User A",
    "overlapCount": 2,
    "sharedMovies": [...],
    "matchStatus": "pending_received",
    "requestSentAt": "2025-10-30T12:34:56Z"
  }
]
```

**Frontend Display:**
- Shows User A's card with shared movies
- Shows two buttons:
  - ✅ "Accept Match" (green)
  - ❌ "Decline Match" (red)
- Shows message: "User A is waiting for your response!"
- Shows timestamp: "sent 2 minutes ago"

---

### **Step 5: User B Accepts Match (MANUAL ACTION)**

**What Happens:**
```
User B sees User A's pending request
User B clicks "Accept Match" button
```

**Frontend Action:**
```typescript
// In Match.tsx - handleMatch()
const tmdbId = candidate.sharedMovieIds[0]; // Use first shared movie
await MatchService.acceptMatch(candidate.userId, tmdbId);
```

**API Call:**
```
POST /api/Matches/request
Body: {
  "targetUserId": "user-a-id",
  "tmdbId": 27205
}
```

**Backend Logic:**
1. Create match request: User B → User A (for movie "Inception")
2. Check if reverse request exists: Does User A → User B exist? **YES! ✅**
3. **MUTUAL MATCH DETECTED!**
4. Create chat room
5. Add both users to chat room (ChatMemberships)
6. Send SignalR notifications to BOTH users: "mutualMatch"
7. Return response with room ID

**API Response:**
```json
{
  "matched": true,
  "roomId": "room-abc-123-def-456"
}
```

**Frontend Updates (User B):**
- Toast: "It's a match! 🎉"
- Action button: "Open Chat"
- User A removed from candidates list

**SignalR Events (BOTH users receive):**
```javascript
// NotificationService.ts
connection.on('mutualMatch', (notification) => {
  toast.success('It\'s a match! 🎉', {
    description: `You and ${notification.displayName} matched!`,
    action: {
      label: 'Open Chat',
      onClick: () => navigate(`/chat/${notification.roomId}`)
    }
  });
});
```

**Frontend Updates (User A - Real-Time):**
- Receives SignalR event
- Toast: "It's a match! 🎉"
- If on /matches page, User B removed from list
- Can navigate to chat room

---

### **Step 6: Both Users Can Chat**

**What Happens:**
```
Both users can now:
1. Navigate to /active-matches (Chats page)
2. See each other in the matched users list
3. Click to open chat room
4. Send messages in real-time
```

**Active Matches Page:**

**API Call:**
```
GET /api/Matches/active
```

**Backend Logic:**
1. Find all chat rooms where current user is a member
2. Find other users in those rooms
3. Get last message, unread count, shared movies
4. Return active matches

**API Response:**
```json
[
  {
    "userId": "user-b-id",
    "displayName": "User B",
    "roomId": "room-abc-123-def-456",
    "matchedAt": "2025-10-30T12:35:00Z",
    "lastMessageAt": null,
    "lastMessage": null,
    "unreadCount": 0,
    "sharedMovies": [
      {
        "tmdbId": 27205,
        "title": "Inception",
        "posterUrl": "https://...",
        "releaseYear": "2010"
      },
      {
        "tmdbId": 603,
        "title": "The Matrix",
        "posterUrl": "https://...",
        "releaseYear": "1999"
      }
    ]
  }
]
```

**Frontend Display:**
- Card showing matched user
- Shared movie posters
- Last message preview (if any)
- Unread count badge (if any)
- Click to open chat

---

## 📊 Match Status States

| Status | Meaning | Who Sees It | Actions Available |
|--------|---------|------------|-------------------|
| **none** | No request sent | Anyone in candidates | "Match" button |
| **pending_sent** | Current user sent request | User who sent request | "Pending (sent X ago)" (disabled) |
| **pending_received** | Other user sent request | User who received request | "Accept Match" / "Decline Match" |
| **matched** | Both users accepted | Neither (removed from candidates) | Appears in Active Matches instead |

---

## 🔔 SignalR Real-Time Events

### **1. matchRequestReceived**
**When:** User A sends match request to User B  
**Who Receives:** User B only  
**Payload:**
```json
{
  "userId": "user-a-id",
  "displayName": "User A",
  "sharedMoviesCount": 2,
  "message": "User A wants to match with you!"
}
```

### **2. mutualMatch**
**When:** User B accepts User A's request (creating mutual match)  
**Who Receives:** BOTH User A and User B  
**Payload:**
```json
{
  "userId": "user-b-id",
  "displayName": "User B",
  "matchStatus": "matched",
  "roomId": "room-abc-123-def-456",
  "message": "It's a match! 🎉"
}
```

---

## 🎯 Key Takeaways

### **✅ What IS Automatic:**
- Candidates list updates based on shared movies
- Real-time SignalR notifications
- Match status updates in UI
- Chat room creation on mutual match

### **❌ What is NOT Automatic:**
- Liking a movie does NOT create match requests
- Users must MANUALLY click "Match" button
- Users must MANUALLY click "Accept Match" button
- It's a **2-step manual approval process**

### **🔄 Flow Summary:**
1. ✅ User likes movies → Stored in database
2. ✅ User checks /matches → Sees candidates with shared movies
3. ⚠️ **MANUAL:** User clicks "Match" → Creates request
4. ✅ Other user receives notification → Sees pending request
5. ⚠️ **MANUAL:** Other user clicks "Accept" → Creates chat room
6. ✅ Both users notified → Can chat immediately

---

## 🧪 Testing the Full Flow

### **Setup:**
- Open 2 browser windows (or 2 different browsers)
- Login as User A in Window 1
- Login as User B in Window 2 (incognito/different profile)

### **Test Steps:**

1. **Both users like same movie:**
   - Window 1 (User A): Go to /discover, like "Inception"
   - Window 2 (User B): Go to /discover, like "Inception"

2. **User A views candidates:**
   - Window 1: Go to /matches
   - Should see User B with matchStatus: "none"
   - Shared movies should display

3. **User A sends request:**
   - Window 1: Click "Match" button on User B's card
   - Should see "Pending (sent X ago)"
   - Window 2: Should receive toast notification

4. **User B views request:**
   - Window 2: Go to /matches (or click notification)
   - Should see User A with matchStatus: "pending_received"
   - Should see "Accept Match" and "Decline Match" buttons

5. **User B accepts:**
   - Window 2: Click "Accept Match"
   - Both windows: Should receive "It's a match! 🎉" toast

6. **Both users access chat:**
   - Both windows: Go to /active-matches
   - Should see each other in matched users list
   - Click to open chat room
   - Send messages back and forth

---

## 📁 Related Files

### **Frontend:**
- `src/pages/Match.tsx` - Candidates page with match/decline logic
- `src/pages/ActiveMatches.tsx` - Matched users / chat list page
- `src/lib/services/MatchService.ts` - API calls for matching
- `src/lib/services/NotificationService.ts` - SignalR event handlers
- `src/components/Navbar.tsx` - Navigation with notification badges

### **Backend:**
- `MatchController.cs` - Endpoints for candidates, request, decline, active
- `MatchService.cs` - Business logic for matching
- `CandidateDto.cs` - Data structure for candidates
- `ActiveMatchDto.cs` - Data structure for active matches
- `ChatHub.cs` - SignalR hub for real-time notifications

---

**Last Updated:** October 30, 2025  
**Version:** 2.0 (Manual Two-Way Matching)  
**Status:** ✅ Fully Implemented & Tested
