# CineMatch Manual Test Plan

## Overview

This test plan covers the complete user flow from preferences through matching to chat, with specific acceptance criteria and debug log verification.

## Prerequisites

### Enable Debug Mode

Open browser console and run:
```javascript
window.__cineDebug = true
```

You should see:
```
🎬 CineMatch Debug Mode Enabled
Debug logs will appear below. Disable with: window.__cineDebug = false
```

### Test Environment

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:7119`
- **Mode**: Set `VITE_API_MODE=live` in `.env` for backend integration testing
- **Test Accounts**: Create 2 test users for match flow testing

---

## Test Suite 1: Preferences & Onboarding Flow

### Test 1.1: First-Time User Onboarding

**Steps:**
1. Navigate to `/onboarding` as a new user
2. Step 1: Select a genre (e.g., "Action")
3. Step 2: Select a length bucket (e.g., "medium")
4. Step 3: Review selections and click "Start Discovering"

**Expected Results:**
- ✅ Each selection updates immediately
- ✅ Navigation proceeds to `/discover` after completion
- ✅ Preferences persist in localStorage

**Debug Logs to Verify:**
```
[Onboarding] 🔄 User action: Genre selected { genre: "Action" }
[PreferencesContext] 🔄 User action: Preferences updated
[Onboarding] 🔄 User action: Length selected { lengthBucket: "medium" }
[Onboarding] 🔄 Navigation: /onboarding → /discover { reason: "Onboarding complete" }
```

**Acceptance Criteria:**
- [ ] Can complete all 3 steps without errors
- [ ] Preferences are saved after each step
- [ ] Automatically navigated to `/discover` after completion
- [ ] No console errors

---

### Test 1.2: Preferences Transformation

**Steps:**
1. Complete onboarding with Genre: "Sci-Fi", Length: "long"
2. Open browser DevTools → Network tab
3. Check POST request to `/api/preferences`

**Expected Results:**
- ✅ Frontend stores: `{ genre: "Sci-Fi", lengthBucket: "long" }`
- ✅ Backend receives: `{ genreIds: [878], length: "long" }`

**Debug Logs to Verify:**
```
[Adapter] 🔄 Transform: Preferences → PreferencesDTO { genreIds: [878], length: "long" }
[API] ℹ️ POST /api/preferences { genreIds: [878], length: "long" }
[API] ✅ /api/preferences → 200
```

**Acceptance Criteria:**
- [ ] Genre name correctly mapped to TMDB ID
- [ ] Backend saves preferences successfully
- [ ] No type errors in console

---

## Test Suite 2: Discover & Movie Flow

### Test 2.1: Discover Page Access Control

**Steps:**
1. Clear localStorage: `localStorage.clear()`
2. Navigate to `/discover`

**Expected Results:**
- ✅ Redirected to `/onboarding` automatically
- ✅ Toast message: "Complete your preferences first"

**Debug Logs to Verify:**
```
[Discover] ℹ️ User action: Component mounted
[Discover] ⚠️ Preferences missing, redirecting to onboarding
[Discover] 🔄 Navigation: /discover → /onboarding { reason: "Missing preferences" }
```

**Acceptance Criteria:**
- [ ] Cannot access `/discover` without preferences
- [ ] Automatic redirect to `/onboarding`
- [ ] Clear user feedback via toast

---

### Test 2.2: Movie Browsing

**Steps:**
1. Complete onboarding
2. Browse movies on `/discover`
3. Like 5+ movies

**Expected Results:**
- ✅ Movies load based on preferences
- ✅ Each swipe triggers API call
- ✅ After 5 decisions, modal prompt appears

**Debug Logs to Verify:**
```
[API] ℹ️ GET /api/Movies/discover?genre=Action&length=medium
[API] ✅ /api/Movies/discover → 200 { count: 20 }
[Discover] 🔄 User action: Movie liked { tmdbId: 12345, title: "Example Movie" }
[API] ℹ️ POST /api/Movies/like
```

**Acceptance Criteria:**
- [ ] Movies match selected preferences
- [ ] Like/dislike actions save successfully
- [ ] Decision modal appears after 5 swipes
- [ ] No infinite loading states

---

## Test Suite 3: Match Flow & State Machine

### Test 3.1: Finding Candidates

**Prerequisites:**
- User A: Liked movies [1, 2, 3, 4, 5]
- User B: Liked movies [3, 4, 5, 6, 7]
- Both users completed onboarding

**Steps (as User A):**
1. Navigate to `/matches`
2. Wait for candidates to load

**Expected Results:**
- ✅ User B appears in candidates list
- ✅ Shows 3 shared movies (3, 4, 5)
- ✅ Match status: `none`
- ✅ Buttons: "Match" and "Decline" enabled

**Debug Logs to Verify:**
```
[Match] ℹ️ User action: Component mounted
[API] ℹ️ GET /api/Matches/candidates
[API] ✅ /api/Matches/candidates → 200 { count: 1 }
[MatchStateMachine] ℹ️ Initialized for User B { userId: "...", initialState: "none" }
```

**Acceptance Criteria:**
- [ ] Candidates load successfully
- [ ] Shared movies displayed with posters
- [ ] Match status reflects backend state
- [ ] UI buttons match state

---

### Test 3.2: Sending Match Request (State: none → pending_sent)

**Steps (as User A):**
1. On `/matches` page with User B visible
2. Click "Match" button on User B's card

**Expected Results:**
- ✅ Toast: "Match request sent! Waiting for User B to respond"
- ✅ Card updates to show "Pending" state
- ✅ "Match" button disabled
- ✅ Card shows "Waiting for User B to respond" message

**Debug Logs to Verify:**
```
[Match] ℹ️ User action: Accepting match { targetUserId: "...", targetDisplayName: "User B", tmdbId: 3 }
[API] ℹ️ POST /api/Matches/request { targetUserId: "...", tmdbId: 3 }
[API] ✅ /api/Matches/request → 200 { matched: false, roomId: null }
[MatchCard] 🔄 State: none → pending_sent { trigger: "Match request sent" }
```

**Acceptance Criteria:**
- [ ] State transition: `none` → `pending_sent`
- [ ] Backend saves match request
- [ ] UI updates immediately
- [ ] Card remains in list (not removed)

---

### Test 3.3: Receiving Match Request (State: none → pending_received)

**Steps (as User B):**
1. Navigate to `/matches`
2. User A appears with status `pending_received`

**Expected Results:**
- ✅ Card shows "User A is waiting for your response!" message
- ✅ Buttons: "Accept Match" and "Decline"
- ✅ Clock icon with pulsing animation

**Debug Logs to Verify:**
```
[API] ℹ️ GET /api/Matches/candidates
[API] ✅ /api/Matches/candidates → 200 { count: 1 }
[MatchStateMachine] ℹ️ Initialized for User A { userId: "...", initialState: "pending_received" }
```

**Acceptance Criteria:**
- [ ] Backend correctly identifies pending request
- [ ] Frontend displays pending_received state
- [ ] UI clearly indicates action needed
- [ ] Accept/Decline buttons both enabled

---

### Test 3.4: Mutual Match (State: pending_sent/pending_received → matched)

**Steps (as User B):**
1. Click "Accept Match" on User A's card

**Expected Results:**
- ✅ Toast: "It's a match! 🎉 You and User A matched!"
- ✅ Toast action button: "Open Chat"
- ✅ Card removed from candidates list
- ✅ SignalR `mutualMatch` event fired to both users

**Debug Logs to Verify:**
```
[Match] ℹ️ User action: Accepting match { targetUserId: "...", targetDisplayName: "User A", tmdbId: 3 }
[API] ℹ️ POST /api/Matches/request { targetUserId: "...", tmdbId: 3 }
[API] ✅ /api/Matches/request → 200 { matched: true, roomId: "abc-123" }
[MatchCard] 🔄 State: pending_received → matched { trigger: "Mutual match confirmed" }
[SignalR] ℹ️ Event received: mutualMatch { roomId: "abc-123", userIds: ["...", "..."] }
```

**Acceptance Criteria:**
- [ ] Backend creates chat room
- [ ] Both users receive mutualMatch event
- [ ] Card removed from both users' lists
- [ ] Chat button navigates to correct roomId

---

### Test 3.5: Declining Match

**Steps (as User A):**
1. Click "Decline" on a candidate card

**Expected Results:**
- ✅ Toast: "Passed - You declined User B"
- ✅ Card removed from list immediately
- ✅ Backend records decline

**Debug Logs to Verify:**
```
[Match] ℹ️ User action: Declining match { targetUserId: "...", targetDisplayName: "User B", tmdbId: 3 }
[API] ℹ️ POST /api/Matches/decline
[MatchCard] 🔄 State: none → declined { trigger: "User declined match" }
```

**Acceptance Criteria:**
- [ ] State transition: `any` → `declined`
- [ ] Card removed from UI
- [ ] Backend records action
- [ ] No errors in console

---

## Test Suite 4: Chat Flow & Real-Time Messaging

### Test 4.1: Conversations List Auto-Refresh

**Prerequisites:**
- User A and User B have mutual match
- User A is on `/chats` page

**Steps (as User A):**
1. Open `/chats`
2. Verify conversation with User B exists

**Expected Results:**
- ✅ Conversation appears in list
- ✅ Shows other user's display name
- ✅ Shows last message (if any)

**Debug Logs to Verify:**
```
[Chats] ℹ️ User action: Subscribing to mutualMatch events
[API] ℹ️ GET /api/Chats { userId: "..." }
[API] ✅ /api/Chats → 200 { count: 1 }
[Adapter] 🔄 Transform: BackendConversation[] → Conversation[] { count: 1 }
```

**Acceptance Criteria:**
- [ ] Conversations load on page mount
- [ ] Listens for mutualMatch events
- [ ] Auto-refreshes list when new match occurs
- [ ] No duplicate conversations

---

### Test 4.2: Conversations Auto-Refresh on New Match

**Prerequisites:**
- User A on `/chats` page
- User C sends match request to User A
- User A accepts (creates mutual match)

**Steps:**
1. User A stays on `/chats` page
2. Accept User C's match from another tab OR backend fires mutualMatch

**Expected Results:**
- ✅ Toast: "New match! 🎉 Your conversation list has been updated"
- ✅ Conversation with User C appears immediately
- ✅ No page reload required

**Debug Logs to Verify:**
```
[SignalR] ℹ️ Event received: mutualMatch { roomId: "xyz-789", ... }
[Chats] ℹ️ User action: Refreshing conversations after mutualMatch
[API] ℹ️ GET /api/Chats
[API] ✅ /api/Chats → 200 { count: 2 }
```

**Acceptance Criteria:**
- [ ] mutualMatch listener active while on page
- [ ] Calls loadConversations() on event
- [ ] New conversation appears at top
- [ ] Toast notification shown

---

### Test 4.3: Chat Page Initialization Lifecycle

**Steps (as User A):**
1. Click on conversation with User B in `/chats`
2. Wait for chat to load

**Expected Results:**
- ✅ Loading spinner: "Connecting to chat..."
- ✅ Proper sequence: initializeSignalR → joinRoom → render ChatWindow
- ✅ No race conditions or errors
- ✅ Chat window renders with message history

**Debug Logs to Verify:**
```
[Chat] ℹ️ User action: Component mounted { roomId: "abc-123" }
[Chat] ℹ️ User action: Initializing SignalR
[SignalR] ✅ SignalR connected
[Chat] ℹ️ User action: Joining room { roomId: "abc-123", userId: "..." }
[API] ℹ️ POST /api/Chats/abc-123/join
[API] ✅ /api/Chats/abc-123/join → 200
[Chat] ℹ️ User action: Chat initialized successfully
```

**Acceptance Criteria:**
- [ ] Shows loading state during initialization
- [ ] Proper sequence: connect → join → render
- [ ] No race conditions
- [ ] Handles errors gracefully with error UI

---

### Test 4.4: Chat Page Error Handling

**Steps:**
1. Stop backend server
2. Navigate to `/chat/:roomId`

**Expected Results:**
- ✅ Error message: "Failed to connect to chat. Please try again."
- ✅ "Try Again" button appears
- ✅ "Back to Chats" button works
- ✅ No infinite loading or blank screen

**Debug Logs to Verify:**
```
[Chat] ℹ️ User action: Initializing SignalR
[Chat] ℹ️ User action: Initialization failed { error: ... }
```

**Acceptance Criteria:**
- [ ] Error state displayed
- [ ] User can retry connection
- [ ] Can navigate back to safety
- [ ] No crashes or blank screens

---

### Test 4.5: Sending & Receiving Messages

**Prerequisites:**
- User A and User B in same chat room

**Steps (as User A):**
1. Type message: "Hey, what movie should we watch?"
2. Press Enter or click Send
3. Verify message appears in chat
4. As User B, verify message received in real-time

**Expected Results:**
- ✅ Message sent via SignalR
- ✅ Appears immediately in sender's chat
- ✅ Receiver gets message via `ReceiveMessage` event
- ✅ Message persisted in backend

**Debug Logs to Verify (User A):**
```
[ChatWindow] ℹ️ User action: Sending message { roomId: "abc-123", content: "Hey, what movie should we watch?" }
[API] ℹ️ POST /api/Chats/abc-123/messages
[API] ✅ /api/Chats/abc-123/messages → 200
```

**Debug Logs to Verify (User B):**
```
[SignalR] ℹ️ Event received: ReceiveMessage { senderId: "...", content: "Hey, what movie should we watch?" }
[Adapter] 🔄 Transform: BackendMessage → ChatMessage
```

**Acceptance Criteria:**
- [ ] Message sends successfully
- [ ] Real-time delivery to other user
- [ ] Proper sender/receiver display
- [ ] Timestamps accurate
- [ ] Messages persist across page refresh

---

## Test Suite 5: Navigation & Routing

### Test 5.1: Matches Navigation Always Shows Page

**Steps:**
1. Click "Matches" in navbar
2. Verify page loads (even if no candidates)

**Expected Results:**
- ✅ Always shows `/matches` page
- ✅ Empty state: "No Matches Yet" with "Continue Discovering" button
- ✅ Never shows 404 or redirects away

**Acceptance Criteria:**
- [ ] /matches route always renders Match.tsx
- [ ] Empty state is user-friendly
- [ ] No console errors
- [ ] Call-to-action button works

---

### Test 5.2: Navigation Debug Logs

**Steps:**
1. With `window.__cineDebug = true`
2. Navigate: Discover → Matches → Chats → Chat room → Back to Chats

**Expected Results:**
- ✅ Every navigation logged with reason

**Debug Logs to Verify:**
```
[Navigation] 🔄 /discover → /matches
[Navigation] 🔄 /matches → /chats
[Navigation] 🔄 /chats → /chat/abc-123 { reason: "Open conversation" }
[Navigation] 🔄 /chat/abc-123 → /chats { reason: "Back button clicked" }
```

**Acceptance Criteria:**
- [ ] All navigation events logged
- [ ] Reasons are clear and accurate
- [ ] No missing transitions

---

## Test Suite 6: Adapter Layer Verification

### Test 6.1: Preferences Adapter

**Steps:**
1. Complete onboarding with different genres
2. Check Network tab for API payloads

**Test Cases:**

| Frontend Input | Expected Backend Output |
|---------------|------------------------|
| `{ genre: "Action", lengthBucket: "short" }` | `{ genreIds: [28], length: "short" }` |
| `{ genre: "Horror", lengthBucket: "medium" }` | `{ genreIds: [27], length: "medium" }` |
| `{ genre: "Sci-Fi", lengthBucket: "long" }` | `{ genreIds: [878], length: "long" }` |

**Acceptance Criteria:**
- [ ] All genre names map to correct IDs
- [ ] Length buckets pass through unchanged
- [ ] No undefined or null values

---

### Test 6.2: Chat Adapter

**Steps:**
1. Send messages in chat
2. Check debug logs for transformations

**Expected Transformations:**

**Backend → Frontend:**
```javascript
// Backend
{ senderDisplayName: "User A", text: "Hello", sentAt: "2024-01-15T10:30:00Z" }

// Frontend
{ senderName: "User A", content: "Hello", timestamp: Date object }
```

**Debug Logs to Verify:**
```
[Adapter] 🔄 Transform: BackendMessage → ChatMessage
```

**Acceptance Criteria:**
- [ ] Property names correctly mapped
- [ ] ISO strings converted to Date objects
- [ ] No data loss in transformation

---

## Test Suite 7: State Machine Validation

### Test 7.1: Invalid Transitions Blocked

**Steps:**
1. Open browser console
2. Try to create invalid transition:
```javascript
// This should throw error
const machine = new MatchStateMachine("user123", "Test User", "matched");
machine.transitionTo("pending_sent"); // Invalid: matched → pending_sent
```

**Expected Results:**
- ✅ Error thrown: "Invalid transition: matched → pending_sent"
- ✅ State remains `matched`

**Acceptance Criteria:**
- [ ] Invalid transitions throw errors
- [ ] State machine prevents illegal states
- [ ] Error logged to console

---

### Test 7.2: Valid Transition Sequences

**Test Cases:**

| From State | Action | To State | Valid? |
|-----------|---------|----------|--------|
| `none` | User clicks Match | `pending_sent` | ✅ |
| `none` | Other user matches | `pending_received` | ✅ |
| `pending_sent` | Other accepts | `matched` | ✅ |
| `pending_received` | User accepts | `matched` | ✅ |
| `pending_sent` | User declines | `declined` | ✅ |
| `matched` | Any action | `matched` | ❌ Terminal state |

**Acceptance Criteria:**
- [ ] All valid transitions succeed
- [ ] Terminal states cannot transition
- [ ] State descriptions accurate

---

## Regression Tests

### RT-1: Previous Bug Fixes

Verify these previously fixed bugs don't resurface:

1. **Navbar Link Bug**
   - [ ] "Chats" link goes to `/chats` (not `/matches`)

2. **Modal Persistence Bug**
   - [ ] Decision modal only appears after 5 swipes in current session
   - [ ] Doesn't appear on every page load

3. **Shared Movies Display Bug**
   - [ ] Match cards show shared movie posters
   - [ ] Grid displays correctly (3 movies visible)

4. **Match Status Bug**
   - [ ] Backend provides matchStatus in candidates API
   - [ ] Frontend displays correct state

---

## Performance & Edge Cases

### P-1: Empty States

**Test all empty states:**
- [ ] `/matches` with no candidates → "No Matches Yet"
- [ ] `/chats` with no conversations → "You don't have any chats yet"
- [ ] Chat room with no messages → "No messages yet. Start the conversation!"

### P-2: Loading States

**Verify loading indicators:**
- [ ] `/matches` while fetching candidates
- [ ] `/chats` while loading conversations
- [ ] `/chat/:roomId` while connecting
- [ ] All loading states have spinners + descriptive text

### P-3: Network Failures

**Test offline scenarios:**
- [ ] Backend offline → Error messages displayed
- [ ] SignalR disconnect → Reconnection attempt or error
- [ ] Failed API calls → Toast error notifications

---

## Debug Mode Quick Reference

### Enable Debug Logging
```javascript
window.__cineDebug = true
```

### Disable Debug Logging
```javascript
window.__cineDebug = false
```

### Key Debug Modules to Watch

| Module | What It Logs |
|--------|-------------|
| `Navigation` | Route changes and reasons |
| `API` | HTTP requests and responses |
| `SignalR` | Real-time events |
| `Adapter` | Data transformations |
| `MatchCard` | State transitions |
| `MatchStateMachine` | State machine operations |
| `Chat` | Chat initialization and lifecycle |

### Expected Log Volume

With debug enabled, expect:
- **Onboarding (complete)**: ~8-12 log lines
- **Discover (10 swipes)**: ~30-40 log lines
- **Match flow (find + accept)**: ~15-20 log lines
- **Chat (send 5 messages)**: ~25-30 log lines

---

## Sign-Off Checklist

### Core Flow
- [ ] Onboarding: Can complete all steps
- [ ] Preferences: Correctly transformed and saved
- [ ] Discover: Movies load based on preferences
- [ ] Match: Can send/receive/accept match requests
- [ ] Chat: Real-time messaging works

### State Management
- [ ] Match state machine enforces valid transitions
- [ ] Invalid states throw errors
- [ ] UI reflects backend state accurately

### Real-Time Features
- [ ] SignalR events fire correctly
- [ ] Conversations auto-refresh on mutualMatch
- [ ] Messages delivered in real-time

### Adapter Layer
- [ ] Preferences: Genre names ↔ IDs
- [ ] Chat: Property name mappings
- [ ] Match: Candidate data transformations

### Debug Logging
- [ ] Logs only appear when `window.__cineDebug = true`
- [ ] All major actions logged
- [ ] State transitions visible

### Error Handling
- [ ] Empty states render properly
- [ ] Loading states shown during async operations
- [ ] Network errors handled gracefully
- [ ] No unhandled exceptions

### Navigation
- [ ] All routes accessible
- [ ] Back buttons work correctly
- [ ] No infinite loops or broken links

---

## Notes for Testers

1. **Browser Console**: Keep DevTools open during testing to monitor debug logs
2. **Two Browsers**: Use Chrome + Firefox for two-user match flow testing
3. **Network Tab**: Monitor API calls to verify adapter transformations
4. **Incognito Mode**: Use for fresh sessions to test onboarding
5. **Clear Data**: Use `localStorage.clear()` to reset preferences between tests

## Known Limitations

- Backend doesn't track unread message counts yet
- Avatar URLs not provided by backend (using placeholder avatars)
- Match candidates don't update in real-time (requires page refresh)

## Success Criteria

✅ **All 40+ test cases pass**  
✅ **No console errors during normal flow**  
✅ **Debug logs verify each state transition**  
✅ **Real-time features work reliably**  
✅ **Adapter layer handles all transformations**  
✅ **State machine prevents invalid states**
