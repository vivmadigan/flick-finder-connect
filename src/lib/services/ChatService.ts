import { ChatMessage, ChatRoom } from '@/types';

// TODO: Replace with actual SignalR connection to your ASP.NET Web API
// Set up SignalR hub connection:
// - Hub URL: /api/chat
// - Methods: SendMessage, ReceiveMessage, JoinRoom, LeaveRoom
// - Authentication: Pass Bearer token in connection setup

// In-memory store for mock data
const mockRooms = new Map<string, ChatRoom>();
const mockMessages = new Map<string, ChatMessage[]>();

export class ChatService {
  static async joinRoom(roomId: string, userId: string): Promise<ChatRoom> {
    console.log('[MOCK] Joining room:', { roomId, userId });
    
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
    console.log('[MOCK] Sending message:', { roomId, senderId, content });
    
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
    console.log('[MOCK] Leaving room:', { roomId, userId });
    
    // TODO: Replace with SignalR hub invoke
    // await hubConnection.invoke('LeaveRoom', roomId);
    
    return Promise.resolve();
  }

  // Mock: Subscribe to new messages (in real app, use SignalR OnReceiveMessage)
  static onMessage(callback: (message: ChatMessage) => void): () => void {
    console.log('[MOCK] Subscribing to messages');
    
    // TODO: Replace with SignalR event handler
    // hubConnection.on('ReceiveMessage', callback);
    // return () => hubConnection.off('ReceiveMessage', callback);
    
    // Mock: no-op for now
    return () => {};
  }
}
