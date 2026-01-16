import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, MessageCircle, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  order_id: string;
  sender_type: 'admin' | 'preparer';
  sender_name: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface PreparerChatPanelProps {
  orderId: string;
  token: string;
  preparerName: string;
}

const PreparerChatPanel: React.FC<PreparerChatPanelProps> = ({
  orderId,
  token,
  preparerName,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['preparer-messages', orderId],
    queryFn: async () => {
      // Use edge function to fetch messages with token auth
      const { data, error } = await supabase.functions.invoke('preparer-message', {
        body: { orderId, token, action: 'get_messages' },
      });
      if (error) throw error;
      return (data.messages || []) as Message[];
    },
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel(`preparer-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['preparer-messages', orderId] });
          if (payload.new && (payload.new as Message).sender_type === 'admin') {
            toast.info('💬 Nouveau message de l\'équipe SerenCare', {
              description: (payload.new as Message).message.substring(0, 50),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('preparer-message', {
        body: {
          orderId,
          token,
          action: 'send_message',
          message: newMessage.trim(),
          senderName: preparerName || 'Préparateur',
        },
      });

      if (error) throw error;

      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['preparer-messages', orderId] });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div className="p-3 border-b bg-primary/5 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Chat avec SerenCare</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun message</p>
              <p className="text-xs">Envoyez un message si vous avez une question</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'preparer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.sender_type === 'preparer'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {msg.sender_name || (msg.sender_type === 'admin' ? 'SerenCare' : 'Moi')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_type === 'preparer' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrire un message..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreparerChatPanel;
