import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { statusConfig, OrderStatus } from '@/lib/orderStatus';

interface OrderStatusHistoryProps {
  orderId: string;
  className?: string;
}

interface StatusEvent {
  id: string;
  status: string;
  message_public: string | null;
  message_internal: string | null;
  created_at: string;
  is_visible_to_customer: boolean | null;
  notification_sent: boolean | null;
  notification_type: string | null;
}

const OrderStatusHistory: React.FC<OrderStatusHistoryProps> = ({ orderId, className }) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['order-status-events', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_status_events')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as StatusEvent[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground italic", className)}>
        Aucun historique disponible
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Historique des statuts
      </h4>
      <div className="space-y-2">
        {history.map((entry, index) => {
          const config = statusConfig[entry.status as OrderStatus] || statusConfig.order_received;
          const Icon = config.icon;
          
          return (
            <div 
              key={entry.id} 
              className="flex items-start gap-3 text-sm"
            >
              <div className="flex flex-col items-center">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  config.bgColor,
                  config.color
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                {index < history.length - 1 && (
                  <div className="w-0.5 h-4 bg-border" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(entry.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                </p>
                {entry.message_public && (
                  <p className="text-xs text-muted-foreground mt-1">{entry.message_public}</p>
                )}
                {entry.notification_sent && entry.notification_type && (
                  <p className="text-xs text-primary mt-1">
                    ✓ Notification {entry.notification_type} envoyée
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusHistory;
