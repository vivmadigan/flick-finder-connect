import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatMessage } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ChatService } from '@/lib/services/ChatService';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isValid } from 'date-fns';

/**
 * Safely format a timestamp, returning empty string if invalid
 * Prevents crashes from malformed Date objects
 */
const safeFormatTime = (timestamp: Date | undefined): string => {
  if (!timestamp) return '';
  try {
    return isValid(timestamp) ? format(timestamp, 'p') : '';
  } catch {
    return '';
  }
};
import { debugFlow } from '@/lib/debug';

interface ChatWindowProps {
  roomId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

export function ChatWindow({ roomId, otherUserName, otherUserAvatar }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    debugFlow.userAction('ChatWindow', 'Component mounted for room', { roomId });
    
    // Load messages immediately
    const loadInitialMessages = async () => {
      try {
        debugFlow.apiCall('GET', `/api/Chats/${roomId}/messages`);
        const msgs = await ChatService.getMessages(roomId);
        debugFlow.apiResponse(`/api/Chats/${roomId}/messages`, 200, { count: msgs.length });
        
        // 🔍 DEBUG: Log timestamps to verify sorting
        console.log('[ChatWindow] Loaded messages with timestamps:', msgs.map(m => ({
          content: m.content.substring(0, 20),
          timestamp: m.timestamp,
          time: safeFormatTime(m.timestamp)
        })));
        
        setMessages(msgs);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    
    loadInitialMessages();
    
    // Capture userId to avoid dependency on user object
    const currentUserId = user?.id;
    
    // Subscribe to new messages
    const unsubscribe = ChatService.onMessage((message) => {
      if (message.roomId === roomId) {
        // 🚫 Filter out echo: Don't add our own messages (already added optimistically)
        if (message.senderId === currentUserId) {
          debugFlow.userAction('ChatWindow', 'Ignoring echo of own message', { 
            messageId: message.id 
          });
          return; // Skip our own messages from SignalR
        }
        
        debugFlow.userAction('ChatWindow', 'Received new message from other user', { 
          messageId: message.id,
          roomId: message.roomId,
          senderName: message.senderName
        });
        // ✅ Use functional update to avoid stale state
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      debugFlow.userAction('ChatWindow', 'Cleanup - unsubscribing from messages for room', { roomId });
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // ✅ CRITICAL: ONLY roomId - user?.id captured as const to avoid re-runs

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    // ScrollArea from shadcn wraps content in a viewport div
    const viewport = scrollViewportRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setLoading(true);
    try {
      debugFlow.userAction('ChatWindow', 'Sending message', { 
        roomId, 
        contentLength: input.trim().length 
      });
      
      const message = await ChatService.sendMessage(
        roomId,
        user.id,
        user.displayName,
        input.trim()
      );
      
      debugFlow.userAction('ChatWindow', 'Message sent successfully', { 
        messageId: message.id 
      });
      
      // ✅ Add message to local state immediately for optimistic update
      setMessages((prev) => [...prev, message]);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      debugFlow.userAction('ChatWindow', 'Failed to send message', { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] backdrop-blur-glass border-border/50 rounded-2xl">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUserAvatar} alt={otherUserName} />
            <AvatarFallback>{otherUserName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="font-display">{otherUserName}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollViewportRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] space-y-1 ${
                        isOwn ? 'items-end' : 'items-start'
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs text-muted-foreground px-3">
                          {message.senderName}
                        </p>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground px-3">
                        {safeFormatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={sendMessage}
          className="p-4 border-t border-border/50 flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            className="rounded-2xl"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-2xl">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
