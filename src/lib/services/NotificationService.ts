import * as signalR from '@microsoft/signalr';
import { API_BASE, API_MODE } from '@/services/apiMode';
import { toast } from 'sonner';
import { Logger } from '@/lib/logger';

// NotificationService: Real-time match notifications using SignalR
// Connects to the same /chathub endpoint but listens for match events

export class NotificationService {
  private connection: signalR.HubConnection | null = null;
  private onMutualMatchCallback: ((matchData: any) => void) | null = null;
  private onMatchRequestCallback: ((matchData: any) => void) | null = null;

  async connect(): Promise<boolean> {
    if (API_MODE === 'mock') {
      console.log('[NotificationService] MOCK mode - no real connection');
      return true;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('[NotificationService] No token found, cannot connect');
        return false;
      }

      // Connect to the same ChatHub endpoint
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE}/chathub`, {
          accessTokenFactory: () => token,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Listen for "matchRequestReceived" - Someone sent you a match request
      this.connection.on('matchRequestReceived', (notification: any) => {
        Logger.match('📬 Match request received', notification);
        
        toast.info(notification.message || 'Someone wants to match with you!', {
          description: notification.sharedMoviesCount 
            ? `${notification.sharedMoviesCount} shared ${notification.sharedMoviesCount === 1 ? 'movie' : 'movies'}`
            : undefined,
          duration: 8000,
          action: {
            label: 'View Matches',
            onClick: () => {
              window.location.href = '/matches';
            },
          },
        });

        // Browser notification
        this.showBrowserNotification(
          'New Match Request',
          notification.message || `${notification.user?.displayName || 'Someone'} wants to match with you!`
        );

        // Call registered callback
        if (this.onMatchRequestCallback) {
          this.onMatchRequestCallback(notification);
        }
      });

      // Listen for "mutualMatch" - Both users matched, chat room created
      this.connection.on('mutualMatch', (notification: any) => {
        Logger.match('🎉 MUTUAL MATCH! Chat room created', {
          roomId: notification.roomId,
          otherUser: notification.user?.displayName,
          movie: notification.sharedMovieTitle
        });
        
        toast.success(`It's a match! 🎉`, {
          description: `You and ${notification.user?.displayName || 'someone'} both liked "${notification.sharedMovieTitle || 'the same movie'}"!`,
          duration: 10000,
          action: {
            label: 'Open Chat',
            onClick: () => {
              window.location.href = `/chat/${notification.roomId}`;
            },
          },
        });
        
        // Browser notification
        this.showBrowserNotification(
          'It\'s a Match! 🎉',
          `You and ${notification.user?.displayName || 'someone'} can chat now!`
        );

        // Call registered callback
        if (this.onMutualMatchCallback) {
          this.onMutualMatchCallback(notification);
        }
      });

      // Handle reconnection
      this.connection.onreconnecting(() => {
        console.log('[NotificationService] Reconnecting...');
      });

      this.connection.onreconnected(() => {
        console.log('[NotificationService] Reconnected to SignalR');
        toast.info('Reconnected to notifications');
      });

      this.connection.onclose(() => {
        console.log('[NotificationService] Connection closed');
      });

      await this.connection.start();
      console.log('[NotificationService] Connected to SignalR for notifications');
      return true;
    } catch (error) {
      console.error('[NotificationService] Failed to connect:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('[NotificationService] Disconnected');
      } catch (error) {
        console.error('[NotificationService] Error disconnecting:', error);
      }
      this.connection = null;
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // Register callbacks for different event types
  onMutualMatch(callback: (matchData: any) => void): void {
    this.onMutualMatchCallback = callback;
  }

  onMatchRequest(callback: (matchData: any) => void): void {
    this.onMatchRequestCallback = callback;
  }

  // Get the SignalR connection for direct access if needed
  getConnection(): signalR.HubConnection | null {
    return this.connection;
  }

  // Request browser notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[NotificationService] Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Show browser notification (in addition to toast)
  showBrowserNotification(title: string, body: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: 'cinematch-match',
        requireInteraction: false,
      });
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
