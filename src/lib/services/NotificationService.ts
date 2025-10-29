import * as signalR from '@microsoft/signalr';
import { API_BASE, API_MODE } from '@/services/apiMode';
import { toast } from 'sonner';
import { Logger } from '@/lib/logger';

// NotificationService: Real-time match notifications using SignalR
// Connects to the same /chathub endpoint but listens for match events

export class NotificationService {
  private connection: signalR.HubConnection | null = null;
  private onNewMatchCallback: ((matchData: any) => void) | null = null;

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

      // Listen for "NewMatch" events from backend
      // Note: With manual matching, we only listen for mutual match confirmations
      this.connection.on('NewMatch', (matchData: any) => {
        Logger.match('Received match notification', matchData);
        
        // Only handle mutual match notifications (when both users clicked "Match")
        if (matchData.type === 'mutualMatch' && matchData.roomId) {
          Logger.match('🎉 MUTUAL MATCH! Chat room created', {
            roomId: matchData.roomId,
            otherUser: matchData.user?.displayName,
            movie: matchData.sharedMovieTitle
          });
          
          // Show toast notification (non-blocking)
          toast.success(`It's a match! 🎉`, {
            description: `You and ${matchData.user?.displayName || 'someone'} both liked "${matchData.sharedMovieTitle || 'the same movie'}"!`,
            duration: 10000,
            action: {
              label: 'Open Chat',
              onClick: () => {
                window.location.href = `/chat/${matchData.roomId}`;
              },
            },
          });
          
          // Show browser notification
          this.showBrowserNotification(
            'It\'s a Match! 🎉',
            `You and ${matchData.user?.displayName || 'someone'} can chat now!`
          );
        }
        // Ignore other notification types (auto-match requests no longer sent)

        // Call registered callback if any
        if (this.onNewMatchCallback) {
          this.onNewMatchCallback(matchData);
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

  // Register a callback for when new matches arrive
  onNewMatch(callback: (matchData: any) => void): void {
    this.onNewMatchCallback = callback;
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
