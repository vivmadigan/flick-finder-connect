import { ChatMessage, ChatRoom, Conversation, User } from '@/types';
import { SignalRChatService } from './SignalRChatService';
import { API_MODE, API_BASE, TOKEN_KEY } from '@/services/apiMode';
import { toast } from 'sonner';
import { ChatAdapter, BackendMessage, BackendConversation } from '@/lib/adapters';
import { debugFlow } from '@/lib/debug';

// ChatService: follows MOCK/LIVE pattern (like authService.ts)
// MOCK mode: in-memory data with simulated delays
// LIVE mode: SignalR connection to ASP.NET /chathub

// In-memory store for MOCK mode
const mockRooms = new Map<string, ChatRoom>();
const mockMessages = new Map<string, ChatMessage[]>();

let signalRService: SignalRChatService | null = null;

export class ChatService {
  // Initialize SignalR in LIVE mode only
  static async initializeSignalR(): Promise<void> {
    if (API_MODE === 'mock') {
      console.log('[ChatService] MOCK mode - using in-memory data');
      toast('Chat in mock mode', { 
        description: 'Using local mock data. Set VITE_API_MODE=live to connect.',
        duration: 3000 
      });
      return;
    }

    // TODO: LIVE mode - connect to ASP.NET /chathub
    if (!signalRService) {
      signalRService = new SignalRChatService();
      const connected = await signalRService.connect();
      
      if (connected) {
        console.log('[ChatService] SignalR connected (LIVE mode)');
      } else {
        console.warn('[ChatService] SignalR connection failed, check token/backend');
      }
    }
  }

  static async listConversations(userId: string): Promise<Conversation[]> {
    if (API_MODE === 'mock') {
      debugFlow.apiCall('GET', '/api/Chats (MOCK)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return [];
    }

    // LIVE mode
    const endpoint = `${API_BASE}/api/Chats`;
    debugFlow.apiCall('GET', endpoint);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      debugFlow.apiResponse('/api/Chats', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to list conversations: ${response.status}`);
      }
      
      const backendData: BackendConversation[] = await response.json();
      const conversations = backendData.map(ChatAdapter.conversationFromDTO);
      
      debugFlow.transform('BackendConversation[]', 'Conversation[]', {
        count: conversations.length,
      });
      
      return conversations;
    } catch (error) {
      console.error('[LIVE] Failed to list conversations:', error);
      throw error;
    }
  }

  static async joinRoom(roomId: string, userId: string): Promise<ChatRoom> {
    console.log('[ChatService] Joining room:', { roomId, userId });
    
    if (API_MODE === 'live' && signalRService?.isConnected()) {
      try {
        await signalRService.joinRoom(roomId);
        console.log('[ChatService] Joined room via SignalR (LIVE)');
        
        // Fetch room details from API
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await fetch(`${API_BASE}/api/Chats/${roomId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          return response.json();
        }
      } catch (error) {
        console.error('[ChatService] Failed to join room:', error);
        throw error;
      }
    }
    
    // MOCK mode: create in-memory room
    await new Promise(resolve => setTimeout(resolve, 300));
    const existingRoom = mockRooms.get(roomId);
    if (existingRoom) {
      return existingRoom;
    }
    
    const room: ChatRoom = {
      id: roomId,
      participants: [],
      messages: [],
      match: { 
        id: roomId, 
        user: { id: '', email: '', displayName: '' }, 
        sharedMovies: [], 
        status: 'accepted', 
        createdAt: new Date() 
      },
    };
    mockRooms.set(roomId, room);
    mockMessages.set(roomId, []);
    return room;
  }

  static async sendMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    content: string
  ): Promise<ChatMessage> {
    console.log('[ChatService] Sending message:', { roomId, senderId, content });
    
    if (API_MODE === 'live' && signalRService?.isConnected()) {
      try {
        await signalRService.sendMessage(roomId, content);
        console.log('[ChatService] Message sent via SignalR (LIVE)');
        // Return temp message; real one will come via ReceiveMessage event
        return {
          id: `temp-${Date.now()}`,
          roomId,
          senderId,
          senderName,
          content,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error('[ChatService] SignalR send failed:', error);
        throw error;
      }
    }
    
    // MOCK mode: simulate delay and store message
    await new Promise(resolve => setTimeout(resolve, 200));
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId,
      senderName,
      content,
      timestamp: new Date(),
    };
    
    const messages = mockMessages.get(roomId) || [];
    messages.push(message);
    mockMessages.set(roomId, messages);
    return message;
  }

  static async getMessages(roomId: string): Promise<ChatMessage[]> {
    if (API_MODE === 'mock') {
      debugFlow.apiCall('GET', `/api/Chats/${roomId}/messages (MOCK)`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMessages.get(roomId) || [];
    }

    // LIVE mode
    const endpoint = `${API_BASE}/api/Chats/${roomId}/messages?take=50`;
    debugFlow.apiCall('GET', endpoint);
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      debugFlow.apiResponse(`/api/Chats/${roomId}/messages`, response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.status}`);
      }
      
      const backendData: BackendMessage[] = await response.json();
      
      // 🔍 DEBUG: Log raw backend timestamps
      console.log('[ChatService] Raw backend messages:', backendData.map(m => ({
        text: m.text.substring(0, 20),
        sentAt: m.sentAt,
        parsed: new Date(m.sentAt)
      })));
      
      const messages = backendData
        .map(ChatAdapter.messageFromDTO)
        .filter(msg => {
          // Filter out messages with invalid timestamps
          if (!msg.timestamp || Number.isNaN(msg.timestamp.getTime())) {
            console.warn('[ChatService] Skipping message with invalid timestamp:', msg.id);
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          // ✅ Sort messages by timestamp (oldest first)
          return a.timestamp.getTime() - b.timestamp.getTime();
        });
      
      // 🔍 DEBUG: Log sorted messages
      console.log('[ChatService] Sorted messages:', messages.map(m => ({
        content: m.content.substring(0, 20),
        timestamp: m.timestamp,
        ms: m.timestamp.getTime()
      })));
      
      debugFlow.transform('BackendMessage[]', 'ChatMessage[]', {
        count: messages.length,
        roomId,
        sorted: true
      });
      
      return messages;
    } catch (error) {
      console.error('[LIVE] Failed to get messages:', error);
      throw error;
    }
  }

  /**
   * Leave SignalR room group ONLY (for navigation)
   * Does NOT deactivate membership - user stays in chat list
   */
  static leaveSignalRRoom(roomId: string): void {
    console.log('[ChatService] Leaving SignalR group (navigation)', { roomId });
    debugFlow.userAction('ChatService', 'Leaving SignalR group only', { roomId });
    
    if (API_MODE === 'live' && signalRService?.isConnected()) {
      try {
        signalRService.leaveRoom(roomId);
        console.log('[ChatService] Left SignalR group (membership still active)');
      } catch (error) {
        console.error('[ChatService] Failed to leave SignalR group:', error);
      }
    }
  }

  /**
   * Leave room permanently (unmatch/block)
   * Deactivates membership in database - chat disappears from list
   */
  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    console.log('[ChatService] 🚪 LEAVING ROOM PERMANENTLY - Deactivating membership!', { roomId, userId });
    debugFlow.userAction('ChatService', '🚪 LEAVING ROOM PERMANENTLY', { 
      roomId, 
      userId,
      timestamp: new Date().toISOString(),
      stack: new Error().stack // Capture stack trace to see who called this
    });
    
    if (API_MODE === 'live' && signalRService?.isConnected()) {
      try {
        await signalRService.leaveRoom(roomId);
        
        // ⚠️ THIS SETS IsActive=false IN DATABASE
        const token = localStorage.getItem(TOKEN_KEY);
        await fetch(`${API_BASE}/api/Chats/${roomId}/leave`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('[ChatService] Left room via SignalR AND deactivated membership (LIVE)');
      } catch (error) {
        console.error('[ChatService] Failed to leave room:', error);
      }
    }
    
    // MOCK mode: no-op
  }

  static onMessage(callback: (message: ChatMessage) => void): () => void {
    if (API_MODE === 'live' && signalRService) {
      return signalRService.onMessage(callback);
    }
    
    // MOCK mode: no real-time events
    return () => {};
  }

  static async disconnect(): Promise<void> {
    if (signalRService) {
      await signalRService.disconnect();
      signalRService = null;
      console.log('[ChatService] Disconnected (LIVE)');
    }
  }
}
