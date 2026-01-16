import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, MessageCircle, User, Bell, BellRing } from 'lucide-react';
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

interface OrderChatPanelProps {
  orderId: string;
  orderNumber: string;
}

const OrderChatPanel: React.FC<OrderChatPanelProps> = ({ orderId, orderNumber }) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    refetchInterval: 5000, // Poll every 5 seconds as fallback
  });

  // Fetch preparer logs
  const { data: logs = [] } = useQuery({
    queryKey: ['order-preparer-logs', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_preparer_logs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
          if (payload.new && (payload.new as Message).sender_type === 'preparer') {
            toast.info(`💬 Nouveau message du préparateur`, {
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

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const { error } = await supabase.from('order_messages').insert({
        order_id: orderId,
        sender_type: 'admin',
        sender_name: 'Admin',
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi du message');
    },
  });

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadCount = messages.filter(m => m.sender_type === 'preparer' && !m.is_read).length;

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Chat Préparateur</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
            </Badge>
          )}
        </div>
        {logs.length > 0 && logs[0].action === 'link_opened' && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            <BellRing className="h-3 w-3 mr-1" />
            Lien ouvert
          </Badge>
        )}
      </div>

      {/* Activity log */}
      {logs.length > 0 && (
        <div className="px-3 py-2 bg-blue-50 border-b text-xs text-blue-700 space-y-1">
          {logs.slice(0, 3).map((log) => (
            <div key={log.id} className="flex items-center gap-2">
              <Bell className="h-3 w-3" />
              <span>
                {log.action === 'link_opened' && '🔓 Lien ouvert'}
                {log.action === 'started_preparation' && '📦 Préparation démarrée'}
                {log.action === 'completed' && '✅ Préparation terminée'}
                {log.action === 'added_note' && '📝 Note ajoutée'}
                {!['link_opened', 'started_preparation', 'completed', 'added_note'].includes(log.action) && log.action}
              </span>
              <span className="text-blue-500">
                {format(new Date(log.created_at), 'HH:mm', { locale: fr })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground text-sm py-4">
              Chargement...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun message</p>
              <p className="text-xs">Les messages apparaîtront ici en temps réel</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.sender_type === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {msg.sender_name || (msg.sender_type === 'admin' ? 'Admin' : 'Préparateur')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_type === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
            disabled={!newMessage.trim() || sendMessage.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderChatPanel;
