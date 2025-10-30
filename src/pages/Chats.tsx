import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useVisualFX } from '@/context/VisualFXProvider';
import { Conversation } from '@/types';
import { ChatService } from '@/lib/services/ChatService';
import { notificationService } from '@/lib/services/NotificationService';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { debugFlow } from '@/lib/debug';

export default function Chats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPreset } = useVisualFX();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPreset('dense');
  }, [setPreset]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      debugFlow.apiCall('GET', '/api/Chats', { userId: user.id });
      const data = await ChatService.listConversations(user.id);
      debugFlow.apiResponse('/api/Chats', 200, { count: data.length });
      setConversations(data);
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Listen for mutualMatch events to auto-refresh conversations
  useEffect(() => {
    if (!user) return;

    debugFlow.userAction('Chats', 'Subscribing to mutualMatch events');

    notificationService.onMutualMatch((data) => {
      debugFlow.signalREvent('mutualMatch', data);
      
      toast.success('New match! 🎉', {
        description: 'Your conversation list has been updated',
      });
      
      // Refresh conversations to include new match
      loadConversations();
    });

    return () => {
      debugFlow.userAction('Chats', 'Unsubscribing from mutualMatch events');
      notificationService.onMutualMatch(() => {}); // Clear callback
    };
  }, [user, loadConversations]);

  const handleConversationClick = (conversation: Conversation) => {
    debugFlow.navigate('/chats', `/chat/${conversation.roomId}`, 'Open conversation');
    navigate(`/chat/${conversation.roomId}`, {
      state: { otherUser: conversation.otherUser }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen relative pt-20">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl font-display font-semibold">Chats</h1>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-20">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-display font-semibold">Chats</h1>

          {conversations.length === 0 ? (
            <div className="text-center py-16 space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <MessageCircle className="w-24 h-24 text-muted-foreground/50" />
                  <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl text-muted-foreground">You don't have any chats yet</p>
                <p className="text-sm text-muted-foreground">
                  Find your CineMatch to start a conversation
                </p>
              </div>
              <Button onClick={() => navigate('/discover')} size="lg" className="rounded-2xl">
                Discover Movies
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="cursor-pointer hover:shadow-glow transition-all rounded-2xl"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.otherUser.avatar} />
                        <AvatarFallback>
                          {conversation.otherUser.displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold truncate">
                            {conversation.otherUser.displayName}
                          </h3>
                          {conversation.lastMessageTime && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(conversation.lastMessageTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto shrink-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
