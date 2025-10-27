import * as signalR from '@microsoft/signalr';
import { ChatMessage } from '@/types';
import { API_BASE, TOKEN_KEY } from '@/services/apiMode';

// SignalR connection to ASP.NET Web API /chathub
// Hub methods: JoinRoom(roomId), SendMessage(roomId, content), LeaveRoom(roomId)
// Hub client events: ReceiveMessage(message)
// Authentication: JWT via accessTokenFactory

export class SignalRChatService {
  private connection: signalR.HubConnection | null = null;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  
  async connect(): Promise<boolean> {
    const hubUrl = `${API_BASE}/chathub`;
    const token = localStorage.getItem(TOKEN_KEY) || '';
    
    if (!token) {
      console.warn('[SignalR] No access token found, cannot connect');
      return false;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.elapsedMilliseconds < 60000) {
              return Math.random() * 10000;
            }
            return null;
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on('ReceiveMessage', (message: ChatMessage) => {
        console.log('[SignalR] Message received:', message);
        this.messageCallbacks.forEach(cb => cb(message));
      });

      this.connection.onreconnecting((error) => {
        console.warn('[SignalR] Reconnecting...', error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log('[SignalR] Reconnected:', connectionId);
      });

      this.connection.onclose((error) => {
        console.error('[SignalR] Connection closed:', error);
      });

      await this.connection.start();
      console.log('[SignalR] Connected successfully');
      return true;
    } catch (error) {
      console.error('[SignalR] Connection failed:', error);
      return false;
    }
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('JoinRoom', roomId);
      console.log('[SignalR] Joined room:', roomId);
    } catch (error) {
      console.error('[SignalR] Failed to join room:', error);
      throw error;
    }
  }

  async sendMessage(roomId: string, content: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    try {
      await this.connection.invoke('SendMessage', roomId, content);
      console.log('[SignalR] Message sent');
    } catch (error) {
      console.error('[SignalR] Failed to send message:', error);
      throw error;
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('LeaveRoom', roomId);
      console.log('[SignalR] Left room:', roomId);
    } catch (error) {
      console.error('[SignalR] Failed to leave room:', error);
    }
  }

  onMessage(callback: (message: ChatMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('[SignalR] Disconnected');
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}
