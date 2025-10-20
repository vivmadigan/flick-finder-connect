import { ChatMessage, ChatRoom, Conversation, User } from '@/types';
import { SignalRChatService } from './SignalRChatService';
import { toast } from 'sonner';

// TODO: Replace with actual SignalR connection to your ASP.NET Web API
// Set up SignalR hub connection:
// - Hub URL: /api/chat
// - Methods: SendMessage, ReceiveMessage, JoinRoom, LeaveRoom
// - Authentication: Pass Bearer token in connection setup

// In-memory store for mock data
const mockRooms = new Map<string, ChatRoom>();
const mockMessages = new Map<string, ChatMessage[]>();

let signalRService: SignalRChatService | null = null;
let isSignalRMode = false;

export class ChatService {
  static async initializeSignalR(token?: string): Promise<void> {
    if (!signalRService) {
      signalRService = new SignalRChatService();
      const connected = await signalRService.connect(token);
      
      if (connected) {
        isSignalRMode = true;
        console.log('[ChatService] SignalR connected');
      } else {
        isSignalRMode = false;
        toast('Connected in mock mode', { 
          description: 'SignalR not configured. Using local mock data.',
          duration: 3000 
        });
        console.log('[ChatService] Using mock mode');
      }
    }
  }

  static async listConversations(userId: string): Promise<Conversation[]> {
    console.log('[MOCK] Listing conversations for user:', userId);
    
    // TODO: Replace with API call
    // const response = await api.get(`/api/chat/conversations?userId=${userId}`);
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: return empty array for now
        resolve([]);
      }, 300);
    });
  }

  static async joinRoom(roomId: string, userId: string): Promise<ChatRoom> {
    console.log('[ChatService] Joining room:', { roomId, userId });
    
    if (isSignalRMode && signalRService?.isConnected()) {
      try {
        await signalRService.joinRoom(roomId);
        console.log('[ChatService] Joined room via SignalR');
      } catch (error) {
        console.error('[ChatService] SignalR join failed, falling back to mock:', error);
      }
    }
    
    // TODO: Replace with SignalR hub connection
    // await hubConnection.invoke('JoinRoom', roomId);
    // const room = await api.get(`/api/chat/rooms/${roomId}`);
    // return room.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingRoom = mockRooms.get(roomId);
        if (existingRoom) {
          resolve(existingRoom);
        } else {
          // Create a mock room
          const room: ChatRoom = {
            id: roomId,
            participants: [],
            messages: [],
            match: {} as any, // Would be populated from the match
          };
          mockRooms.set(roomId, room);
          mockMessages.set(roomId, []);
          resolve(room);
        }
      }, 300);
    });
  }

  static async sendMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    content: string
  ): Promise<ChatMessage> {
    console.log('[ChatService] Sending message:', { roomId, senderId, content });
    
    if (isSignalRMode && signalRService?.isConnected()) {
      try {
        await signalRService.sendMessage(roomId, content);
        console.log('[ChatService] Message sent via SignalR');
        // SignalR will trigger ReceiveMessage event with the full message
        // Return a placeholder that will be replaced by the real message from the hub
        return {
          id: `temp-${Date.now()}`,
          roomId,
          senderId,
          senderName,
          content,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error('[ChatService] SignalR send failed, falling back to mock:', error);
      }
    }
    
    // TODO: Replace with SignalR hub invoke
    // await hubConnection.invoke('SendMessage', roomId, content);
    
    return new Promise((resolve) => {
      setTimeout(() => {
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
        
        resolve(message);
      }, 200);
    });
  }

  static async getMessages(roomId: string): Promise<ChatMessage[]> {
    console.log('[MOCK] Getting messages for room:', roomId);
    
    // TODO: Replace with API call
    // const response = await api.get(`/api/chat/rooms/${roomId}/messages`);
    // return response.data;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = mockMessages.get(roomId) || [];
        resolve(messages);
      }, 300);
    });
  }

  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    console.log('[ChatService] Leaving room:', { roomId, userId });
    
    if (isSignalRMode && signalRService?.isConnected()) {
      try {
        await signalRService.leaveRoom(roomId);
        console.log('[ChatService] Left room via SignalR');
      } catch (error) {
        console.error('[ChatService] SignalR leave failed:', error);
      }
    }
    
    // TODO: Replace with SignalR hub invoke
    // await hubConnection.invoke('LeaveRoom', roomId);
    
    return Promise.resolve();
  }

  static onMessage(callback: (message: ChatMessage) => void): () => void {
    console.log('[ChatService] Subscribing to messages');
    
    if (isSignalRMode && signalRService) {
      return signalRService.onMessage(callback);
    }
    
    // Mock: no-op for now
    return () => {};
  }

  static async disconnect(): Promise<void> {
    if (signalRService) {
      await signalRService.disconnect();
      signalRService = null;
      isSignalRMode = false;
      console.log('[ChatService] Disconnected');
    }
  }
}
