# Frontend Chat Implementation - Backend Requirements

## 🎯 Overview
The frontend has been fully integrated with the backend's chat system. This document outlines the exact API contracts, data formats, and SignalR events that the frontend expects from the backend.

---

## 📡 API Endpoints Required

### 1. GET /api/Chats
**Purpose:** List all conversations for the current user

**Authentication:** Bearer token (JWT)

**Request:**
```http
GET /api/Chats
Authorization: Bearer {token}
```

**Expected Response (200 OK):**
```json
[
  {
    "roomId": "uuid-string",
    "otherUserId": "uuid-string",
    "otherDisplayName": "Alex",
    "tmdbId": 27205,
    "lastText": "Hey! Inception was amazing!",
    "lastAt": "2025-10-30T19:22:31Z"
  },
  {
    "roomId": "uuid-string-2",
    "otherUserId": "uuid-string-2",
    "otherDisplayName": "Jordan",
    "tmdbId": 550,
    "lastText": null,
    "lastAt": null
  }
]
```

**Frontend Mapping:**
- `roomId` → Conversation.roomId
- `otherUserId` → Conversation.otherUser.id
- `otherDisplayName` → Conversation.otherUser.displayName
- `lastText` → Conversation.lastMessage
- `lastAt` → Conversation.lastMessageTime (converted to Date)
- `tmdbId` → Optional movie context
- **Note:** Frontend sets `avatar: null` and `unreadCount: 0` (not tracked by backend yet)

---

### 2. GET /api/Chats/{roomId}
**Purpose:** Get room metadata when joining a chat

**Authentication:** Bearer token (JWT)

**Request:**
```http
GET /api/Chats/{roomId}
Authorization: Bearer {token}
```

**Expected Response (200 OK):**
```json
{
  "roomId": "uuid-string",
  "otherUserId": "uuid-string",
  "otherDisplayName": "Alex",
  "tmdbId": 27205
}
```

**Frontend Usage:**
- Called when Chat.tsx page loads
- Used to display room info in UI
- Validates that user has access to this room

---

### 3. GET /api/Chats/{roomId}/messages
**Purpose:** Get message history for a chat room

**Authentication:** Bearer token (JWT)

**Request:**
```http
GET /api/Chats/{roomId}/messages?take=50&beforeUtc=2025-10-30T19:22:31Z
Authorization: Bearer {token}
```

**Query Parameters:**
- `take` (optional): Number of messages to return (default: 50)
- `beforeUtc` (optional): ISO 8601 DateTime string for pagination (get messages before this timestamp)

**Expected Response (200 OK):**
```json
[
  {
    "id": "msg-uuid-1",
    "roomId": "room-uuid",
    "senderId": "user-uuid",
    "senderDisplayName": "Alex",
    "text": "Hello!",
    "sentAt": "2025-10-30T19:23:02Z"
  },
  {
    "id": "msg-uuid-2",
    "roomId": "room-uuid",
    "senderId": "user-uuid-2",
    "senderDisplayName": "Jordan",
    "text": "Hi there!",
    "sentAt": "2025-10-30T19:23:15Z"
  }
]
```

**⚠️ CRITICAL - Property Name Mapping:**

Frontend expects these exact backend property names:

| Backend Property | Frontend Property | Type Conversion |
|-----------------|-------------------|-----------------|
| `senderDisplayName` | `senderName` | none |
| `text` | `content` | none |
| `sentAt` | `timestamp` | ISO string → Date object |

**Frontend Mapper Function:**
```typescript
function mapBackendMessageToFrontend(backend: BackendMessage): ChatMessage {
  return {
    id: backend.id,
    roomId: backend.roomId,
    senderId: backend.senderId,
    senderName: backend.senderDisplayName,  // ⚠️ Property name change
    content: backend.text,                  // ⚠️ Property name change
    timestamp: new Date(backend.sentAt)     // ⚠️ String to Date conversion
  };
}
```

---

### 4. POST /api/Chats/{roomId}/leave
**Purpose:** Leave a chat room (cleanup membership)

**Authentication:** Bearer token (JWT)

**Request:**
```http
POST /api/Chats/{roomId}/leave
Authorization: Bearer {token}
```

**Expected Response:**
- `204 No Content` - Success
- `404 Not Found` - Room doesn't exist
- `403 Forbidden` - User not a member

**Frontend Usage:**
- Called when Chat.tsx component unmounts
- Cleanup when user navigates away from chat

---

### 5. POST /api/Matches/request
**Purpose:** Send or accept a match request

**Authentication:** Bearer token (JWT)

**Request:**
```http
POST /api/Matches/request
Authorization: Bearer {token}
Content-Type: application/json

{
  "targetUserId": "uuid-string",
  "tmdbId": 27205
}
```

**⚠️ CRITICAL - Request Body Format:**
The frontend sends exactly these property names (camelCase):
- `targetUserId` (NOT targetUserID or TargetUserId)
- `tmdbId` (NOT tmdbID or TmdbId)

**Expected Response (200 OK) - Match Request Sent:**
```json
{
  "matched": false,
  "roomId": null
}
```

**Expected Response (200 OK) - Mutual Match:**
```json
{
  "matched": true,
  "roomId": "room-uuid-string"
}
```

**Frontend Behavior:**
- If `matched: false` → Toast "Match request sent!" and update candidate status to "pending_sent"
- If `matched: true` → Toast "It's a match! 🎉" and navigate to `/chat/{roomId}`

**Backend Requirements:**
1. Check if both users have liked the same movie (tmdbId)
2. If only one match request exists → Return `matched: false`
3. If both users sent match requests → Create chat room, return `matched: true, roomId`
4. When mutual match occurs → Emit SignalR `mutualMatch` event to BOTH users

---

## 🔌 SignalR Hub Requirements

### Hub Connection
**Endpoint:** `wss://localhost:7119/chathub`

**Authentication:** JWT token via accessTokenFactory

**Frontend Connection Code:**
```typescript
this.connection = new HubConnectionBuilder()
  .withUrl(`${baseUrl}/chathub`, {
    accessTokenFactory: () => localStorage.getItem('access_token') || ''
  })
  .withAutomaticReconnect()
  .configureLogging(LogLevel.Information)
  .build();
```

**Requirements:**
- Accept JWT token from query string or header
- Validate token and identify user
- Support automatic reconnection
- Allow CORS from `localhost:5173` and `localhost:5174`

---

### Hub Methods (Client → Server)

#### 1. JoinRoom(roomId: string)
**Purpose:** Join a chat room SignalR group

**Called When:** User opens Chat.tsx page

**Frontend Code:**
```typescript
await connection.invoke('JoinRoom', roomId);
```

**Backend Requirements:**
1. Validate user has access to this room (is a member)
2. Add connection to SignalR group: `room:{roomId}`
3. Log: `[ChatHub] User {userId} joined room {roomId}`

---

#### 2. SendMessage(roomId: string, content: string)
**Purpose:** Send a message to a chat room

**Called When:** User submits message form

**Frontend Code:**
```typescript
await connection.invoke('SendMessage', roomId, content);
```

**Parameters:**
- `roomId`: UUID of chat room
- `content`: Message text (max 2000 characters)

**Backend Requirements:**
1. Validate user is member of room
2. Validate content not empty and under 2000 chars
3. Create Message entity in database
4. Broadcast to all room members via `ReceiveMessage` event
5. Update room's `lastText` and `lastAt` fields

---

#### 3. LeaveRoom(roomId: string)
**Purpose:** Leave a chat room SignalR group

**Called When:** User navigates away from Chat.tsx

**Frontend Code:**
```typescript
await connection.invoke('LeaveRoom', roomId);
```

**Backend Requirements:**
1. Remove connection from SignalR group
2. Log: `[ChatHub] User {userId} left room {roomId}`

---

### SignalR Events (Server → Client)

#### 1. ReceiveMessage
**Purpose:** Broadcast new message to all room members

**When to Emit:** After `SendMessage` hub method processes successfully

**Event Name:** `ReceiveMessage` (exact case)

**Payload:**
```json
{
  "id": "msg-uuid",
  "roomId": "room-uuid",
  "senderId": "user-uuid",
  "senderDisplayName": "Alex",
  "text": "Hello!",
  "sentAt": "2025-10-30T19:23:02Z"
}
```

**⚠️ CRITICAL Property Names:**
- `senderDisplayName` (NOT senderName)
- `text` (NOT content)
- `sentAt` (NOT timestamp)

**Frontend Listener:**
```typescript
connection.on('ReceiveMessage', (message: BackendMessage) => {
  // Frontend maps this to ChatMessage with different property names
  const frontendMessage = mapBackendMessageToFrontend(message);
  setMessages(prev => [...prev, frontendMessage]);
});
```

**Broadcasting:**
```csharp
// Backend should broadcast to room group
await Clients.Group($"room:{roomId}").SendAsync("ReceiveMessage", messageDto);
```

---

#### 2. mutualMatch
**Purpose:** Notify both users when mutual match occurs (chat room created)

**When to Emit:** After both users send match requests for same movie

**Event Name:** `mutualMatch` (exact case)

**Payload:**
```json
{
  "type": "mutualMatch",
  "matchId": "match-uuid",
  "roomId": "room-uuid",
  "user": {
    "id": "other-user-uuid",
    "displayName": "Alex"
  },
  "sharedMovieTitle": "Inception",
  "timestamp": "2025-10-30T19:22:31Z"
}
```

**Frontend Listener:**
```typescript
connection.on('mutualMatch', (event: MutualMatchEvent) => {
  toast.success(`It's a match with ${event.user.displayName}! 🎉`, {
    action: {
      label: 'Open Chat',
      onClick: () => navigate(`/chat/${event.roomId}`)
    }
  });
});
```

**Broadcasting:**
```csharp
// Backend should send to BOTH users individually
await Clients.User(userId1).SendAsync("mutualMatch", matchEventDto);
await Clients.User(userId2).SendAsync("mutualMatch", matchEventDto);
```

**Requirements:**
- Emit to BOTH users (user who sent request + user who accepted)
- Include `roomId` so frontend can navigate to chat
- Include other user's info for toast message

---

#### 3. matchRequestReceived
**Purpose:** Notify user when someone sends them a match request

**When to Emit:** After POST /api/Matches/request when matched: false (one-way request)

**Event Name:** `matchRequestReceived` (exact case)

**Payload:**
```json
{
  "type": "matchRequestReceived",
  "matchId": "match-uuid",
  "fromUser": {
    "id": "sender-user-uuid",
    "displayName": "Jordan"
  },
  "sharedMovieTitle": "Inception",
  "timestamp": "2025-10-30T19:22:31Z"
}
```

**Frontend Listener:**
```typescript
connection.on('matchRequestReceived', (notification: any) => {
  toast.info('Someone wants to match with you!', {
    action: {
      label: 'View',
      onClick: () => navigate('/matches')
    }
  });
});
```

**Broadcasting:**
```csharp
// Backend should send only to the target user
await Clients.User(targetUserId).SendAsync("matchRequestReceived", notificationDto);
```

---

## 🔄 Complete Flow Example

### Scenario: User A and User B match and chat

**Step 1: Both users like "Inception" (tmdbId: 27205)**
```
User A: POST /api/Movies/like { tmdbId: 27205 }
User B: POST /api/Movies/like { tmdbId: 27205 }
```

**Step 2: User A sends match request**
```http
POST /api/Matches/request
{
  "targetUserId": "user-b-uuid",
  "tmdbId": 27205
}

Response:
{
  "matched": false,
  "roomId": null
}
```

**Backend Action:**
- Store match request: UserA → UserB for movie 27205
- Emit to User B:
```csharp
await Clients.User("user-b-uuid").SendAsync("matchRequestReceived", {
  type: "matchRequestReceived",
  matchId: "match-uuid",
  fromUser: { id: "user-a-uuid", displayName: "User A" },
  sharedMovieTitle: "Inception",
  timestamp: DateTime.UtcNow
});
```

**Step 3: User B receives notification**
- Frontend shows toast: "Someone wants to match with you!"
- User B clicks "View" → navigates to /matches
- Sees User A with status "pending_received"

**Step 4: User B accepts match**
```http
POST /api/Matches/request
{
  "targetUserId": "user-a-uuid",
  "tmdbId": 27205
}

Response:
{
  "matched": true,
  "roomId": "new-room-uuid"
}
```

**Backend Action:**
- Detect mutual match (both sent requests for same movie)
- Create ChatRoom entity
- Create 2 ChatMembership entities
- Emit to BOTH users:
```csharp
await Clients.User("user-a-uuid").SendAsync("mutualMatch", {
  type: "mutualMatch",
  matchId: "match-uuid",
  roomId: "new-room-uuid",
  user: { id: "user-b-uuid", displayName: "User B" },
  sharedMovieTitle: "Inception",
  timestamp: DateTime.UtcNow
});

await Clients.User("user-b-uuid").SendAsync("mutualMatch", {
  type: "mutualMatch",
  matchId: "match-uuid",
  roomId: "new-room-uuid",
  user: { id: "user-a-uuid", displayName: "User A" },
  sharedMovieTitle: "Inception",
  timestamp: DateTime.UtcNow
});
```

**Step 5: Both users navigate to chat**
- Frontend shows toast with "Open Chat" button
- Click → Navigate to `/chat/new-room-uuid`

**Step 6: User A opens chat**
```http
# Initialize SignalR connection to /chathub

# Join room
invoke("JoinRoom", "new-room-uuid")

# Fetch message history
GET /api/Chats/new-room-uuid/messages?take=50

Response: []  # Empty for new room
```

**Backend Action:**
- Validate User A is member of room
- Add connection to SignalR group `room:new-room-uuid`

**Step 7: User A sends first message**
```typescript
invoke("SendMessage", "new-room-uuid", "Hey! Loved Inception!")
```

**Backend Action:**
1. Validate User A is member
2. Create Message entity:
```csharp
var message = new Message {
  Id = Guid.NewGuid(),
  RoomId = roomId,
  SenderId = userId,
  Text = "Hey! Loved Inception!",
  SentAt = DateTime.UtcNow
};
await _context.Messages.AddAsync(message);
await _context.SaveChangesAsync();
```

3. Update room last message:
```csharp
var room = await _context.ChatRooms.FindAsync(roomId);
room.LastText = message.Text;
room.LastAt = message.SentAt;
await _context.SaveChangesAsync();
```

4. Broadcast to room:
```csharp
await Clients.Group($"room:{roomId}").SendAsync("ReceiveMessage", new {
  id = message.Id,
  roomId = message.RoomId,
  senderId = message.SenderId,
  senderDisplayName = "User A",  // ⚠️ Get from user entity
  text = message.Text,            // ⚠️ NOT "content"
  sentAt = message.SentAt.ToString("O")  // ⚠️ ISO 8601
});
```

**Step 8: User B receives message in real-time**
- SignalR `ReceiveMessage` event fires
- Frontend maps backend format to frontend format
- Message appears in chat UI immediately

**Step 9: User B replies**
```typescript
invoke("SendMessage", "new-room-uuid", "Me too! The ending was mind-blowing!")
```

- Same backend flow as Step 7
- Both users see message in real-time

**Step 10: User A navigates to /chats**
```http
GET /api/Chats

Response:
[
  {
    "roomId": "new-room-uuid",
    "otherUserId": "user-b-uuid",
    "otherDisplayName": "User B",
    "tmdbId": 27205,
    "lastText": "Me too! The ending was mind-blowing!",
    "lastAt": "2025-10-30T19:25:14Z"
  }
]
```

- Frontend displays conversation with last message preview
- Click → Reopen chat room

---

## 🔐 Authentication Requirements

### JWT Token
**Frontend Storage:** `localStorage.getItem('access_token')`

**Format:** Standard JWT Bearer token

**Claims Required:**
- User ID (for identifying sender)
- User display name (for message attribution)
- Standard expiration, issued at, etc.

**Usage:**
1. HTTP API calls: `Authorization: Bearer {token}` header
2. SignalR connection: `accessTokenFactory: () => token`

**Backend Validation:**
- All `/api/Chats/*` endpoints require valid token
- All `/api/Matches/*` endpoints require valid token
- SignalR `/chathub` requires valid token
- Return 401 Unauthorized if token missing/invalid

---

## 🚨 Critical Implementation Notes

### 1. Property Name Consistency
**⚠️ The backend MUST use these exact property names:**

```json
{
  "senderDisplayName": "...",  // NOT senderName
  "text": "...",               // NOT content or message
  "sentAt": "..."              // NOT timestamp or createdAt
}
```

If property names don't match, frontend mapping will fail and messages won't display.

### 2. DateTime Format
**⚠️ All timestamps MUST be ISO 8601 format:**

```csharp
// ✅ Correct
sentAt = DateTime.UtcNow.ToString("O")  // 2025-10-30T19:22:31.1234567Z

// ❌ Wrong
sentAt = DateTime.Now.ToString()  // 10/30/2025 7:22:31 PM
```

Frontend uses `new Date(backend.sentAt)` which requires ISO 8601.

### 3. SignalR Group Names
**⚠️ Use consistent group naming:**

```csharp
// ✅ Correct
string groupName = $"room:{roomId}";
await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
await Clients.Group(groupName).SendAsync("ReceiveMessage", message);

// ❌ Wrong (inconsistent naming)
await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
await Clients.Group($"chatroom:{roomId}").SendAsync("ReceiveMessage", message);
```

### 4. Mutual Match Event Timing
**⚠️ Emit mutualMatch event AFTER chat room is created:**

```csharp
// ✅ Correct order
var chatRoom = new ChatRoom { /* ... */ };
await _context.ChatRooms.AddAsync(chatRoom);
await _context.SaveChangesAsync();

// NOW emit events
await _hubContext.Clients.User(userId1).SendAsync("mutualMatch", event);
await _hubContext.Clients.User(userId2).SendAsync("mutualMatch", event);

// ❌ Wrong (emit before saving)
await _hubContext.Clients.User(userId1).SendAsync("mutualMatch", event);
// Room doesn't exist yet! Frontend will navigate to invalid roomId
await _context.SaveChangesAsync();
```

### 5. CORS Configuration
**⚠️ Allow WebSocket upgrades:**

```csharp
app.UseCors(policy => policy
    .WithOrigins("https://localhost:5173", "https://localhost:5174")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials()  // ⚠️ Required for SignalR
);
```

### 6. Message Ordering
**⚠️ Return messages in chronological order:**

```csharp
// ✅ Correct
var messages = await _context.Messages
    .Where(m => m.RoomId == roomId)
    .OrderBy(m => m.SentAt)  // Oldest first
    .Take(take)
    .ToListAsync();

// ❌ Wrong (reverse order)
.OrderByDescending(m => m.SentAt)
```

Frontend displays messages as received - no reordering.

---

## ✅ Testing Checklist

Use this checklist to verify backend implementation:

### API Endpoints
- [ ] GET /api/Chats returns 200 with conversation array
- [ ] GET /api/Chats returns empty array [] for new user (not error)
- [ ] GET /api/Chats/{roomId} returns 200 with room metadata
- [ ] GET /api/Chats/{roomId} returns 404 if room doesn't exist
- [ ] GET /api/Chats/{roomId} returns 403 if user not a member
- [ ] GET /api/Chats/{roomId}/messages returns 200 with message array
- [ ] GET /api/Chats/{roomId}/messages returns empty array [] for new room
- [ ] GET /api/Chats/{roomId}/messages respects `take` parameter
- [ ] GET /api/Chats/{roomId}/messages respects `beforeUtc` parameter for pagination
- [ ] POST /api/Chats/{roomId}/leave returns 204 on success
- [ ] POST /api/Matches/request accepts camelCase property names
- [ ] POST /api/Matches/request returns `matched: false` for one-way request
- [ ] POST /api/Matches/request returns `matched: true, roomId` for mutual match

### SignalR Hub
- [ ] /chathub accepts JWT token via accessTokenFactory
- [ ] JoinRoom validates user is member of room
- [ ] JoinRoom adds connection to correct SignalR group
- [ ] SendMessage validates message content
- [ ] SendMessage saves to database before broadcasting
- [ ] SendMessage broadcasts to all room members via ReceiveMessage
- [ ] SendMessage updates room lastText and lastAt
- [ ] LeaveRoom removes connection from group
- [ ] Connection survives disconnect/reconnect

### SignalR Events
- [ ] ReceiveMessage event uses exact property names (senderDisplayName, text, sentAt)
- [ ] ReceiveMessage timestamps are ISO 8601 format
- [ ] mutualMatch event emits to BOTH users
- [ ] mutualMatch event includes valid roomId
- [ ] mutualMatch event emits AFTER room is created
- [ ] matchRequestReceived event emits only to target user
- [ ] Events fire in correct order (request → notification → match → room created)

### Data Consistency
- [ ] Property names match documented format exactly
- [ ] Timestamps are UTC in ISO 8601 format
- [ ] roomId values are consistent across endpoints
- [ ] User display names are consistent across endpoints

### Error Handling
- [ ] 401 Unauthorized for missing/invalid token
- [ ] 403 Forbidden for unauthorized room access
- [ ] 404 Not Found for nonexistent resources
- [ ] 400 Bad Request for invalid input
- [ ] SignalR hub methods throw meaningful errors

---

## 📞 Frontend Contact Points

If you need clarification or encounter issues:

**Files to Reference:**
- `src/lib/services/ChatService.ts` - API call implementations
- `src/lib/services/SignalRChatService.ts` - SignalR hub methods
- `src/lib/services/MatchService.ts` - Match request implementation
- `src/pages/Chat.tsx` - Chat room page
- `src/pages/Chats.tsx` - Conversations list
- `src/pages/Match.tsx` - Matching flow

**Key Data Mappers:**
```typescript
// ChatService.ts lines 18-40
function mapBackendMessageToFrontend(backend: BackendMessage): ChatMessage
function mapRoomToConversation(room: BackendConversation): Conversation
```

---

## 🎯 Summary

The frontend is fully implemented and ready to integrate with your backend. The key requirements are:

1. **Exact property names** in API responses (senderDisplayName, text, sentAt)
2. **ISO 8601 timestamps** for all DateTime fields
3. **Mutual match flow** emits `mutualMatch` to BOTH users with roomId
4. **SignalR ReceiveMessage** broadcasts to room group with correct format
5. **CORS** allows WebSocket upgrades from localhost:5173/5174
6. **JWT authentication** on all endpoints and SignalR hub

Everything else (UI, routing, state management, real-time updates) is handled by the frontend.

**The chat system will work seamlessly once these API contracts are met!** 🎉
