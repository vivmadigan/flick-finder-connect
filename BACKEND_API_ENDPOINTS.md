# Backend API Endpoints - Integration Guide

This document lists all the API endpoints that the frontend expects from the backend.

## ✅ Authentication Endpoints (Already Working)

### POST /api/SignUp
**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "johndoe"
}
```
**Response:**
```json
{
  "token": "eyJhbGc...",
  "userId": "uuid-here",
  "email": "user@example.com",
  "displayName": "johndoe"
}
```

### POST /api/SignIn
**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
**Response:**
```json
{
  "token": "eyJhbGc...",
  "userId": "uuid-here",
  "email": "user@example.com",
  "displayName": "johndoe"
}
```

### GET /api/MyInformation
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "johndoe"
}
```

---

## 🎬 Movies Endpoints

### GET /api/Movies/discover
**Query Parameters:**
- `genres` (optional): string - Comma-separated TMDB genre IDs (e.g., "28,35" for Action+Comedy)
- `length` (optional): string - "short", "medium", or "long"
- `page` (optional): number - Page number (default: 1)
- `batchSize` (optional): number - Number of movies per page (default: 5)
- `language` (optional): string - Language code (e.g., "en-US")
- `region` (optional): string - Region code (e.g., "US")

**Genre ID Mapping:**
- Action: 28
- Comedy: 35
- Drama: 18
- Romance: 10749
- Thriller: 53
- Sci-Fi: 878
- Fantasy: 14
- Horror: 27
- Western: 37
- Crime: 80
- Animated: 16
- Documentary: 99

**Response:**
```json
[
  {
    "id": "550",
    "title": "Fight Club",
    "titleEn": "Fight Club",
    "overview": "...",
    "posterUrl": "https://image.tmdb.org/t/p/w500/...",
    "backdropUrl": "https://image.tmdb.org/t/p/original/...",
    "releaseYear": "1999",
    "rating": "8.4",
    "tmdbUrl": "https://www.themoviedb.org/movie/550"
  }
]
```

### POST /api/Movies/{tmdbId}/like
**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK` or `204 No Content`

### DELETE /api/Movies/{tmdbId}/like
**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK` or `204 No Content`

### GET /api/Movies/likes
**Headers:** `Authorization: Bearer {token}`

**Response:** Returns the current user's liked movies (most recent first)

---

## ⚙️ Preferences Endpoints

### GET /api/Preferences
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "genre": "Action",
  "lengthBucket": "medium"
}
```

### POST /api/Preferences
**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "genre": "Action",
  "lengthBucket": "medium"
}
```

**Response:** `200 OK` or `204 No Content`

---

## 🤝 Match Endpoints

### GET /api/Matches/candidates
**Headers:** `Authorization: Bearer {token}`

**Description:** Get match candidates - users who share movie likes with the current user. Ordered by overlap count (DESC), then efficiency (DESC).

**Response:**
```json
[
  {
    "id": "match-1",
    "user": {
      "id": "other-user-id",
      "email": "other@example.com",
      "displayName": "OtherUser",
      "avatar": "https://..."
    },
    "sharedMovies": [
      {
        "id": "movie-1",
        "title": "Shared Movie",
        "year": 2024,
        "runtime": 120,
        "poster": "https://...",
        "genres": ["Action"],
        "lengthBucket": "medium",
        "rating": 8.5,
        "synopsis": "..."
      }
    ],
    "status": "pending",
    "createdAt": "2024-10-29T12:00:00Z"
  }
]
```

### POST /api/Matches/request
**Headers:** `Authorization: Bearer {token}`

**Description:** Request a match with another user for a specific movie. If the target user has already requested you for the same movie, a chat room is created.

**Request:**
```json
{
  "targetUserId": "other-user-id",
  "movieId": "tmdb-movie-id"
}
```

**Response:**
```json
{
  "roomId": "room-123",  // Only if both users accepted
  "bothAccepted": true
}
```

---

## 💬 Chat Endpoints

### GET /api/Chats
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "roomId": "room-1",
    "matchId": "match-1",
    "otherUser": {
      "id": "other-user-id",
      "displayName": "OtherUser",
      "avatar": "https://..."
    },
    "lastMessage": {
      "content": "Hey!",
      "timestamp": "2024-10-29T12:00:00Z"
    },
    "unreadCount": 2
  }
]
```

### GET /api/Chats/{roomId}
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "id": "room-1",
  "participants": [
    {
      "id": "user-1",
      "displayName": "User1",
      "avatar": "https://..."
    }
  ],
  "messages": [],
  "match": {
    "id": "match-1",
    "user": {...},
    "sharedMovies": [...],
    "status": "accepted",
    "createdAt": "2024-10-29T12:00:00Z"
  }
}
```

### GET /api/Chats/{roomId}/messages
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `take` (optional): number - number of messages to retrieve (default: 50)

**Response:**
```json
[
  {
    "id": "msg-1",
    "roomId": "room-1",
    "senderId": "user-1",
    "senderName": "User1",
    "content": "Hello!",
    "timestamp": "2024-10-29T12:00:00Z"
  }
]
```

### POST /api/Chats/{roomId}/leave
**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK` or `204 No Content`

---

## 🔌 SignalR Hub

### Connection: /chathub
**Authentication:** JWT via query string `?access_token={token}`

**Hub Methods (client can invoke):**
- `JoinRoom(string roomId)`
- `LeaveRoom(string roomId)`
- `SendMessage(string roomId, string content)`

**Hub Events (server pushes to client):**
- `ReceiveMessage(ChatMessage message)`
  ```json
  {
    "id": "msg-1",
    "roomId": "room-1",
    "senderId": "user-1",
    "senderName": "User1",
    "content": "Hello!",
    "timestamp": "2024-10-29T12:00:00Z"
  }
  ```

---

## 🔐 CORS Configuration

Make sure your backend has CORS configured for:
- `https://localhost:5173`
- `https://localhost:5174`
- `http://localhost:5173`
- `http://localhost:5174`

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend-dev", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
            origin.StartsWith("http://localhost:") || 
            origin.StartsWith("https://localhost:")
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

app.UseCors("frontend-dev");
```

---

## 📝 Notes

- All endpoints except SignUp/SignIn require JWT Bearer token
- Token should be in `Authorization: Bearer {token}` header
- SignalR connection uses query string auth: `?access_token={token}`
- Dates are in ISO 8601 format
- All responses are JSON
