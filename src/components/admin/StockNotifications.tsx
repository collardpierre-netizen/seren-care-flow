import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  Package, 
  X, 
  Check,
  Eye,
  Loader2 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface StockNotification {
  id: string;
  product_id: string;
  product_size: string | null;
  order_id: string | null;
  notification_type: string;
  message: string | null;
  is_read: boolean;
  resolved_at: string | null;
  created_at: string;
  products?: {
    name: string;
    sku: string | null;
  };
}

const StockNotifications: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['stock-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_notifications')
        .select(`
          *,
          products (name, sku)
        `)
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as StockNotification[];
    },
    refetchInterval: 30000
  });

  // Subscribe to realtime notifications
  useEffect(() => {
    const channel = supabase
      .channel('stock-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_notifications'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['stock-notifications'] });
          toast.warning('Nouvelle alerte stock', {
            description: (payload.new as StockNotification).message
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stock_notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-notifications'] });
    }
  });

  const resolveNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stock_notifications')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-notifications'] });
      toast.success('Alerte résolue');
    }
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return { icon: X, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Rupture' };
      case 'low_stock':
        return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Stock bas' };
      case 'unavailable_preparation':
        return { icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Indisponible' };
      default:
        return { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Alerte' };
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Alertes Stock
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>Aucune alerte en cours</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => {
                      const typeInfo = getTypeInfo(notification.notification_type);
                      const TypeIcon = typeInfo.icon;

                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-3 hover:bg-muted/50 transition-colors",
                            !notification.is_read && "bg-primary/5"
                          )}
                          onClick={() => {
                            if (!notification.is_read) {
                              markAsReadMutation.mutate(notification.id);
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={cn("p-2 rounded-full h-fit", typeInfo.bg)}>
                              <TypeIcon className={cn("h-4 w-4", typeInfo.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">
                                  {notification.products?.name || 'Produit inconnu'}
                                </span>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {typeInfo.label}
                                </Badge>
                              </div>
                              {notification.product_size && (
                                <p className="text-xs text-muted-foreground">
                                  Taille: {notification.product_size}
                                </p>
                              )}
                              {notification.message && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: fr
                                })}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {notification.order_id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/commande-preparation/${notification.order_id}`);
                                    setIsOpen(false);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resolveNotificationMutation.mutate(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              {notifications && notifications.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => {
                      navigate('/admin/preparations');
                      setIsOpen(false);
                    }}
                  >
                    Voir toutes les alertes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StockNotifications;
