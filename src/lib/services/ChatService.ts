import { ChatMessage, ChatRoom, Conversation, User } from '@/types';
import { SignalRChatService } from './SignalRChatService';
import { API_MODE } from '@/services/apiMode';
import { toast } from 'sonner';

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
      console.log('[MOCK] Listing conversations');
      await new Promise(resolve => setTimeout(resolve, 300));
      return []; // Mock: empty for now
    }

    // TODO: LIVE mode - call GET /api/chats
    // const response = await fetch(`${API_BASE}/api/chats`, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
    // });
    // return response.json();
    return [];
  }

  static async joinRoom(roomId: string, userId: string): Promise<ChatRoom> {
    console.log('[ChatService] Joining room:', { roomId, userId });
    
    if (API_MODE === 'live' && signalRService?.isConnected()) {
      // TODO: LIVE mode - invoke SignalR JoinRoom
      try {
        await signalRService.joinRoom(roomId);
        console.log('[ChatService] Joined room via SignalR (LIVE)');
      } catch (error) {
        console.error('[ChatService] SignalR join failed:', error);
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
      match: {} as any,
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
      // TODO: LIVE mode - invoke SignalR SendMessage
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
      console.log('[MOCK] Getting messages for room:', roomId);
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMessages.get(roomId) || [];
    }

    // TODO: LIVE mode - call GET /api/chats/{roomId}/messages?take=50
    // const token = localStorage.getItem(TOKEN_KEY);
    // const response = await fetch(`${API_BASE}/api/chats/${roomId}/messages?take=50`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.json();
    return [];
  }

  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    console.log('[ChatService] Leaving room:', { roomId, userId });
    
    if (API_MODE === 'live' && signalRService?.isConnected()) {
      // TODO: LIVE mode - invoke SignalR LeaveRoom + POST /api/chats/{roomId}/leave
      try {
        await signalRService.leaveRoom(roomId);
        console.log('[ChatService] Left room via SignalR (LIVE)');
      } catch (error) {
        console.error('[ChatService] SignalR leave failed:', error);
      }
    }
    
    // MOCK mode: no-op
  }

  static onMessage(callback: (message: ChatMessage) => void): () => void {
    if (API_MODE === 'live' && signalRService) {
      // TODO: LIVE mode - subscribe to SignalR ReceiveMessage event
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
