# Backend Enhancements for Match & Chat System

## 📋 Context

The frontend has been updated to use the new `matchStatus` and `sharedMovies` fields from the candidates API. However, there are several missing pieces that would significantly improve the user experience and real-time functionality of the matching system.

---

## 🚨 Critical Issues to Fix

### 1. ❌ **Real-Time Match Status Updates (SignalR)**

**Problem:** When User B accepts User A's match request, User A doesn't see the status change until they refresh the page.

**Required:** Add SignalR notifications for match status changes

**Implementation:**

#### **A. Update `MatchService.RequestAsync()` Method**

After creating a mutual match and chat room, emit SignalR events to both users:

```csharp
// File: Infrastructure/Services/Matches/MatchService.cs
// In RequestAsync() method, after chat room is created:

// Notify the target user (the one who just accepted)
await _hubContext.Clients.User(targetUserId).SendAsync("MatchAccepted", new
{
    userId = requestorId,
    displayName = requestor.DisplayName,
    matchStatus = "matched",
    roomId = chatRoom.Id,
    message = "It's a match! 🎉"
});

// Notify the requestor (the one who sent the original request)
await _hubContext.Clients.User(requestorId).SendAsync("MatchAccepted", new
{
    userId = targetUserId,
    displayName = targetUser.DisplayName,
    matchStatus = "matched",
    roomId = chatRoom.Id,
    message = "It's a match! 🎉"
});
```

**Frontend Impact:** Frontend will receive these events and can:
- Update the candidate's status from "pending_sent" to "matched"
- Show a toast notification: "It's a match! 🎉"
- Provide a button to navigate to the chat room

---

### 2. ❌ **Filter Matched Candidates from List**

**Problem:** Once users have matched and created a chat room, they still appear in the candidates list with a disabled "Matched!" button. This is confusing.

**Required:** Filter out matched candidates from `GET /api/Matches/candidates`

**Implementation:**

```csharp
// File: Infrastructure/Services/Matches/MatchService.cs
// In GetCandidatesAsync() method:

// After building the candidate list, filter out users who already have chat rooms with current user
var matchedUserIds = await _db.ChatMemberships
    .Where(m => m.UserId == userId)
    .Join(_db.ChatMemberships,
        m1 => m1.RoomId,
        m2 => m2.RoomId,
        (m1, m2) => m2.UserId)
    .Where(otherUserId => otherUserId != userId)
    .Distinct()
    .ToListAsync(ct);

// Filter candidates
var candidateDtos = candidates
    .Where(c => !matchedUserIds.Contains(c.UserId))
    .Select(c => new CandidateDto { ... })
    .ToList();
```

**Why:** Users who are already matched should appear in an "Active Matches" or "Chats" section, not in the candidates list.

---

## 🎯 High Priority Enhancements

### 3. ✨ **New Endpoint: Get Active Matches**

**Purpose:** Show users they've already matched with (have chat rooms)

**Endpoint:** `GET /api/Matches/active`

**Response:**
```json
[
  {
    "userId": "abc-123",
    "displayName": "Alex",
    "roomId": "room-456",
    "matchedAt": "2025-10-30T10:00:00Z",
    "lastMessageAt": "2025-10-30T12:30:00Z",
    "lastMessage": "Hey! Want to watch Inception tonight?",
    "unreadCount": 2,
    "sharedMovies": [
      {
        "tmdbId": 27205,
        "title": "Inception",
        "posterUrl": "https://...",
        "releaseYear": "2010"
      }
    ]
  }
]
```

**Implementation:**

```csharp
[HttpGet("active")]
[ProducesResponseType(typeof(IEnumerable<ActiveMatchDto>), StatusCodes.Status200OK)]
public async Task<IActionResult> GetActiveMatches(
    [FromServices] IMatchService matches,
    CancellationToken ct = default)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();
    
    var activeMatches = await matches.GetActiveMatchesAsync(userId, ct);
    return Ok(activeMatches);
}
```

**DTO:**

```csharp
// File: Infrastructure/Models/Matches/ActiveMatchDto.cs
public sealed class ActiveMatchDto
{
    public string UserId { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string RoomId { get; set; } = "";
    public DateTime MatchedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public string? LastMessage { get; set; }
    public int UnreadCount { get; set; }
    public List<SharedMovieDto> SharedMovies { get; set; } = [];
}
```

**Why:** Frontend needs a dedicated "Active Matches" page showing:
- Users they've matched with
- Quick link to chat
- Last message preview
- Unread count badge

---

### 4. ✨ **New Endpoint: Get Match Status with Specific User**

**Purpose:** Check current match status with a specific user (useful for profile pages, etc.)

**Endpoint:** `GET /api/Matches/status/{userId}`

**Response:**
```json
{
  "status": "pending_sent",
  "canMatch": false,
  "canDecline": true,
  "requestSentAt": "2025-10-30T10:00:00Z",
  "roomId": null,
  "sharedMovies": [
    {
      "tmdbId": 27205,
      "title": "Inception",
      "posterUrl": "https://...",
      "releaseYear": "2010"
    }
  ]
}
```

**Implementation:**

```csharp
[HttpGet("status/{targetUserId}")]
[ProducesResponseType(typeof(MatchStatusDto), StatusCodes.Status200OK)]
public async Task<IActionResult> GetMatchStatus(
    [FromServices] IMatchService matches,
    string targetUserId,
    CancellationToken ct = default)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();
    
    var status = await matches.GetMatchStatusAsync(userId, targetUserId, ct);
    return Ok(status);
}
```

**Why:** Allows frontend to:
- Show match button on user profile pages
- Display accurate status without loading full candidates list
- Enable/disable action buttons based on status

---

## 🔧 Medium Priority Enhancements

### 5. ⏱️ **Add Request Timestamp to CandidateDto**

**Purpose:** Show how long ago a match request was sent

**Update:**

```csharp
// File: Infrastructure/Models/Matches/CandidateDto.cs
public sealed class CandidateDto
{
    public string UserId { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public int OverlapCount { get; set; }
    public List<int> SharedMovieIds { get; set; } = [];
    public List<SharedMovieDto> SharedMovies { get; set; } = [];
    public string MatchStatus { get; set; } = "none";
    public DateTime? RequestSentAt { get; set; }  // 👈 NEW
}
```

**Frontend Usage:**
```tsx
{candidate.requestSentAt && (
  <span className="text-xs text-muted-foreground">
    Sent {formatDistanceToNow(candidate.requestSentAt)} ago
  </span>
)}
```

---

### 6. 🔔 **Enhanced SignalR Event: Match Request Received**

**Purpose:** Notify user immediately when someone sends them a match request

**Implementation:**

```csharp
// In MatchService.RequestAsync(), after creating the FIRST match request:

if (!mutualMatchExists) // Only if it's not a mutual match yet
{
    await _hubContext.Clients.User(targetUserId).SendAsync("MatchRequestReceived", new
    {
        userId = requestorId,
        displayName = requestor.DisplayName,
        sharedMoviesCount = sharedMovies.Count,
        message = $"{requestor.DisplayName} wants to match with you!"
    });
}
```

**Frontend Impact:**
- Show toast notification: "Alex wants to match with you!"
- Update notification badge count
- Refresh candidates list to show new "pending_received" status

---

### 7. 📄 **Add Pagination to Candidates Endpoint**

**Purpose:** Avoid returning 100+ candidates at once

**Update:**

```csharp
[HttpGet("candidates")]
[ProducesResponseType(typeof(PaginatedResult<CandidateDto>), StatusCodes.Status200OK)]
public async Task<IActionResult> GetCandidates(
    [FromServices] IMatchService matches,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    CancellationToken ct = default)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();
    
    var result = await matches.GetCandidatesAsync(userId, page, pageSize, ct);
    return Ok(result);
}
```

**Response:**
```json
{
  "items": [...],
  "page": 1,
  "pageSize": 20,
  "totalCount": 47,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

## 🎨 Nice-to-Have Features

### 8. 🗑️ **Cancel Match Request**

**Purpose:** Allow users to cancel a match request they sent

**Endpoint:** `DELETE /api/Matches/request/{userId}`

**Implementation:**

```csharp
[HttpDelete("request/{targetUserId}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
public async Task<IActionResult> CancelMatchRequest(
    [FromServices] IMatchService matches,
    string targetUserId,
    CancellationToken ct = default)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();
    
    await matches.CancelMatchRequestAsync(userId, targetUserId, ct);
    return NoContent();
}
```

**Frontend Usage:**
```tsx
// On pending_sent candidates
<Button onClick={() => cancelMatchRequest(candidate.userId)}>
  Cancel Request
</Button>
```

---

### 9. 💔 **Unmatch Feature**

**Purpose:** Allow users to end an existing match

**Endpoint:** `POST /api/Matches/unmatch/{userId}`

**Implementation:**

```csharp
[HttpPost("unmatch/{targetUserId}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
public async Task<IActionResult> Unmatch(
    [FromServices] IMatchService matches,
    string targetUserId,
    CancellationToken ct = default)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId)) return Unauthorized();
    
    await matches.UnmatchAsync(userId, targetUserId, ct);
    
    // Notify the other user
    await _hubContext.Clients.User(targetUserId).SendAsync("Unmatched", new
    {
        userId = userId,
        message = "A user has ended the match"
    });
    
    return NoContent();
}
```

**Note:** This should:
- Delete the chat room
- Delete all messages
- Remove both match requests
- Notify both users

---

## 🧪 Testing Scenarios

After implementing these changes, test:

### **Scenario 1: Fresh Match Request**
```
1. User A likes "Inception"
2. User B likes "Inception"
3. User A opens /matches → sees User B with matchStatus: "none"
4. User A clicks "Match"
   ✅ Frontend shows "Pending" button
   ✅ User B receives SignalR event "MatchRequestReceived"
   ✅ User B sees notification toast
5. User B opens /matches → sees User A with matchStatus: "pending_received"
   ✅ Shows "Accept Match" button
   ✅ Shows message: "User A is waiting for your response!"
```

### **Scenario 2: Mutual Match**
```
6. User B clicks "Accept Match"
   ✅ Backend creates chat room
   ✅ Both users receive SignalR event "MatchAccepted"
   ✅ User B's screen: Toast "It's a match! 🎉" with "Open Chat" button
   ✅ User A's screen: Toast "It's a match! 🎉" (real-time update)
7. User A refreshes /matches page
   ✅ User B no longer appears in candidates (they're matched)
8. User A visits new endpoint: GET /api/Matches/active
   ✅ User B appears in active matches with roomId
```

### **Scenario 3: Declined Match**
```
9. User C sends match request to User A
10. User A opens /matches → sees User C with matchStatus: "pending_received"
11. User A clicks "Decline"
    ✅ Match request deleted
    ✅ User C removed from User A's candidates list
    ✅ (Optional) User C receives notification their request was declined
```

---

## 📊 Priority Summary

### **Must Have (Critical):**
1. ✅ Real-time match status updates (SignalR events)
2. ✅ Filter matched candidates from list
3. ✅ GET /api/Matches/active endpoint

### **Should Have (High Priority):**
4. ✅ GET /api/Matches/status/{userId} endpoint
5. ✅ Add requestSentAt timestamp to CandidateDto
6. ✅ SignalR event for match request received

### **Nice to Have (Medium Priority):**
7. ⭐ Pagination for candidates
8. ⭐ DELETE /api/Matches/request/{userId} (cancel request)

### **Optional (Low Priority):**
9. 💡 POST /api/Matches/unmatch/{userId}

---

## 🎯 Expected Outcomes

After implementing these enhancements:

### **For Users:**
- ✅ Instant notifications when someone wants to match
- ✅ Real-time updates when matches happen
- ✅ Clear separation between candidates and active matches
- ✅ No confusion about button states
- ✅ Professional, responsive UX

### **For Frontend:**
- ✅ No need for page refreshes to see updates
- ✅ Accurate match states from single source of truth
- ✅ Easy to build "Active Matches" page
- ✅ Easy to add match buttons on profile pages
- ✅ Reduced complexity in state management

### **For Backend:**
- ✅ Clean separation of concerns
- ✅ Efficient queries with pagination
- ✅ Proper real-time architecture
- ✅ Scalable to thousands of users

---

## 📝 Implementation Checklist

### **Phase 1: Critical Fixes**
- [ ] Add SignalR event "MatchAccepted" in RequestAsync()
- [ ] Add SignalR event "MatchRequestReceived" in RequestAsync()
- [ ] Filter matched candidates from GET /api/Matches/candidates
- [ ] Create ActiveMatchDto model
- [ ] Implement GET /api/Matches/active endpoint

### **Phase 2: High Priority**
- [ ] Add RequestSentAt to CandidateDto
- [ ] Create MatchStatusDto model
- [ ] Implement GET /api/Matches/status/{userId} endpoint
- [ ] Update MatchService to populate RequestSentAt

### **Phase 3: Medium Priority**
- [ ] Add pagination to candidates endpoint
- [ ] Create PaginatedResult<T> generic class
- [ ] Implement DELETE /api/Matches/request/{userId}

### **Phase 4: Optional**
- [ ] Implement POST /api/Matches/unmatch/{userId}
- [ ] Add notification preferences (mute matches, etc.)

---

## 🚀 Questions?

If anything is unclear or you need more details on:
- Database queries for any endpoint
- DTOs structure
- SignalR hub configuration
- Testing approach

Please let me know and I'll provide more specific implementation details!

---

**Last Updated:** October 30, 2025  
**Status:** Ready for Backend Implementation  
**Priority:** Phase 1 (Critical) should be completed first  
**Estimated Effort:** Phase 1 = 2-3 hours, Phase 2 = 1-2 hours
