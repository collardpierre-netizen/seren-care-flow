import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Search, 
  Loader2, 
  ShoppingCart, 
  Eye, 
  Bell, 
  Truck, 
  CreditCard, 
  Package, 
  CheckCircle2, 
  XCircle,
  Send,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import OrderDetailDialog from '@/components/admin/OrderDetailDialog';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: { label: 'En attente', variant: 'outline', icon: <Loader2 className="h-3 w-3" /> },
  paid: { label: 'Payée', variant: 'default', icon: <CreditCard className="h-3 w-3" /> },
  shipped: { label: 'Expédiée', variant: 'secondary', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Livrée', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Annulée', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

// Status flow with next actions
const statusActions: Record<string, { nextStatus: string; label: string; icon: React.ReactNode; color: string }[]> = {
  pending: [
    { nextStatus: 'paid', label: 'Marquer payée', icon: <CreditCard className="h-4 w-4" />, color: 'bg-green-600 hover:bg-green-700' },
    { nextStatus: 'cancelled', label: 'Annuler', icon: <XCircle className="h-4 w-4" />, color: 'bg-destructive hover:bg-destructive/90' },
  ],
  paid: [
    { nextStatus: 'shipped', label: 'Marquer expédiée', icon: <Truck className="h-4 w-4" />, color: 'bg-blue-600 hover:bg-blue-700' },
    { nextStatus: 'cancelled', label: 'Annuler', icon: <XCircle className="h-4 w-4" />, color: 'bg-destructive hover:bg-destructive/90' },
  ],
  shipped: [
    { nextStatus: 'delivered', label: 'Marquer livrée', icon: <Package className="h-4 w-4" />, color: 'bg-green-600 hover:bg-green-700' },
  ],
  delivered: [],
  cancelled: [],
};

const AdminOrders: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*, tracking_number, tracking_url, carrier')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(ordersData?.map(o => o.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]));
      
      return ordersData?.map(order => ({
        ...order,
        profile: order.user_id ? profileMap.get(order.user_id) : null
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, sendNotification }: { id: string; status: string; sendNotification: boolean }) => {
      const order = orders?.find(o => o.id === id);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' })
        .eq('id', id);
      if (error) throw error;

      // Log status change to history
      await supabase.from('order_status_history').insert({
        order_id: id,
        status,
        changed_by: user?.id,
        notification_sent: sendNotification && !!order?.profile?.email,
        notification_type: sendNotification ? 'email' : null,
      });

      // Send notification email if enabled
      if (sendNotification && order?.profile?.email) {
        try {
          await supabase.functions.invoke('send-order-status-email', {
            body: {
              orderId: id,
              orderNumber: order.order_number,
              customerEmail: order.profile.email,
              customerName: order.profile.first_name || '',
              newStatus: status,
              orderTotal: order.total,
              trackingNumber: order.tracking_number,
              trackingUrl: order.tracking_url,
            }
          });
        } catch (emailError) {
          console.error('Failed to send status email:', emailError);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      const message = variables.sendNotification 
        ? 'Statut mis à jour et client notifié' 
        : 'Statut mis à jour';
      toast.success(message);
    },
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Commandes</h1>
        <p className="text-muted-foreground">Gérez toutes les commandes clients</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par n° de commande..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 ml-auto">
              <Bell className={`h-4 w-4 ${notifyCustomer ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch
                id="notify-customer"
                checked={notifyCustomer}
                onCheckedChange={setNotifyCustomer}
              />
              <Label htmlFor="notify-customer" className="text-sm cursor-pointer">
                Notifier le client
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders?.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune commande trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions rapides</TableHead>
                  <TableHead className="text-right">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                    <TableCell>
                      {order.profile?.first_name} {order.profile?.last_name}
                      <br />
                      <span className="text-xs text-muted-foreground">{order.profile?.email}</span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="font-medium">{order.total?.toFixed(2)} €</TableCell>
                    <TableCell>
                      {order.is_subscription_order ? (
                        <Badge variant="secondary">Abonnement</Badge>
                      ) : (
                        <Badge variant="outline">Unique</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[order.status]?.variant || 'outline'} className="flex items-center gap-1 w-fit">
                        {statusLabels[order.status]?.icon}
                        {statusLabels[order.status]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {statusActions[order.status]?.map((action) => (
                          <Button
                            key={action.nextStatus}
                            size="sm"
                            className={`h-7 text-xs ${action.color} text-white`}
                            onClick={() => updateStatus.mutate({ 
                              id: order.id, 
                              status: action.nextStatus,
                              sendNotification: notifyCustomer 
                            })}
                            disabled={updateStatus.isPending}
                          >
                            {action.icon}
                            <span className="ml-1 hidden sm:inline">{action.label}</span>
                          </Button>
                        ))}
                        {statusActions[order.status]?.length === 0 && (
                          <span className="text-xs text-muted-foreground">Terminée</span>
                        )}
                        {notifyCustomer && order.profile?.email && statusActions[order.status]?.length > 0 && (
                          <span title="Email envoyé automatiquement">
                            <Mail className="h-3 w-3 text-muted-foreground ml-1" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {order.tracking_number && (
                          <Button variant="ghost" size="icon" asChild title="Suivi transporteur">
                            <a href={order.tracking_url || '#'} target="_blank" rel="noopener noreferrer">
                              <Truck className="h-4 w-4 text-primary" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrderId(order.id)} title="Voir les détails">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog 
        orderId={selectedOrderId} 
        onClose={() => setSelectedOrderId(null)} 
      />
    </div>
  );
};

export default AdminOrders;
