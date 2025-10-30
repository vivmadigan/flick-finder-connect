import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { ChatService } from '@/lib/services/ChatService';
import { ChatWindow } from '@/features/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { User } from '@/types';
import { debugFlow } from '@/lib/debug';

export default function Chat() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPreset } = useVisualFX();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherUser: User | undefined = location.state?.otherUser;

  useEffect(() => {
    setPreset('dense');
    debugFlow.userAction('Chat', 'Component mounted', { roomId });
  }, [setPreset, roomId]);

  useEffect(() => {
    if (!roomId || !user) {
      debugFlow.navigate('/chat/:roomId', '/discover', 'Missing roomId or user');
      navigate('/discover');
      return;
    }

    const userId = user.id; // Capture userId to avoid dependency on entire user object

    // Initialize chat with proper lifecycle:
    // 1. Connect to SignalR
    // 2. Join room
    // 3. ChatWindow will fetch messages and listen for events
    const initChat = async () => {
      try {
        setIsInitialized(false);
        setError(null);
        
        debugFlow.userAction('Chat', 'Initializing SignalR');
        await ChatService.initializeSignalR();
        
        debugFlow.userAction('Chat', 'Joining room', { roomId, userId });
        await ChatService.joinRoom(roomId, userId);
        
        debugFlow.userAction('Chat', 'Chat initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        debugFlow.userAction('Chat', 'Initialization failed', { error });
        setError('Failed to connect to chat. Please try again.');
      }
    };

    initChat();

    return () => {
      // ✅ ONLY leave SignalR room (unsubscribe from messages)
      // ❌ DO NOT call leaveRoom() - that deactivates membership in DB!
      // User should stay a member even when navigating away
      debugFlow.userAction('Chat', 'Component unmounting - leaving SignalR group only', { roomId });
      ChatService.leaveSignalRRoom(roomId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, navigate]); // ✅ FIX: Only roomId and navigate - user check is just a guard

  if (!roomId || !otherUser) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Button
              variant="ghost"
              onClick={() => {
                debugFlow.navigate('/chat/:roomId', '/chats', 'Back button clicked');
                navigate('/chats');
              }}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chats
            </Button>
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <Button
                className="mt-4"
                onClick={() => {
                  setError(null);
                  setIsInitialized(false);
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Button
              variant="ghost"
              onClick={() => {
                debugFlow.navigate('/chat/:roomId', '/chats', 'Back button clicked');
                navigate('/chats');
              }}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chats
            </Button>
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Connecting to chat...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => {
              debugFlow.navigate('/chat/:roomId', '/chats', 'Back button clicked');
              navigate('/chats');
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chats
          </Button>

          <ChatWindow
            roomId={roomId}
            otherUserName={otherUser.displayName}
            otherUserAvatar={otherUser.avatar}
          />
        </div>
      </div>
    </div>
  );
}
