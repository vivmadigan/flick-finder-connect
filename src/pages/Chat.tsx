import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { ChatService } from '@/lib/services/ChatService';
import { ChatWindow } from '@/features/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { User } from '@/types';
import { TOKEN_KEY } from '@/services/apiMode';

export default function Chat() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPreset } = useVisualFX();

  const otherUser: User | undefined = location.state?.otherUser;

  useEffect(() => {
    setPreset('dense');
  }, [setPreset]);

  useEffect(() => {
    if (!roomId || !user) {
      navigate('/discover');
      return;
    }

    // Initialize chat (SignalR in LIVE mode, mock in MOCK mode)
    const initChat = async () => {
      try {
        await ChatService.initializeSignalR();
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    initChat();

    return () => {
      // Cleanup on unmount
      if (roomId) {
        ChatService.leaveRoom(roomId, user.id);
      }
    };
  }, [roomId, user, navigate]);

  if (!roomId || !otherUser) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/chats')}
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
