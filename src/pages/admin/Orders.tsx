import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Loader2, 
  ShoppingCart, 
  Eye, 
  Truck
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import OrderDetailDialog from '@/components/admin/OrderDetailDialog';
import { statusConfig, OrderStatus, getStatusBadgeVariant, normalFlow } from '@/lib/orderStatus';

const AdminOrders: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
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

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.profile?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Générer les options de filtre depuis les statuts disponibles
  const statusOptions = [
    ...normalFlow.slice(0, -1), // Exclure 'closed' des options principales
    'on_hold', 'delayed', 'cancelled', 'returned', 'refunded'
  ] as OrderStatus[];

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
                placeholder="Rechercher par n° ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {statusOptions.map((status) => {
                  const config = statusConfig[status];
                  return (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order) => {
                  const status = order.status as OrderStatus;
                  const config = statusConfig[status] || statusConfig.order_received;
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{order.profile?.first_name} {order.profile?.last_name}</span>
                          <span className="text-xs text-muted-foreground">{order.profile?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">{Number(order.total).toFixed(2)} €</TableCell>
                      <TableCell>
                        {order.is_subscription_order ? (
                          <Badge variant="secondary">Abonnement</Badge>
                        ) : (
                          <Badge variant="outline">Unique</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(status)} 
                          className={`flex items-center gap-1.5 w-fit ${config.bgColor} ${config.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {config.shortLabel}
                        </Badge>
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedOrderId(order.id)} 
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Gérer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog 
        orderId={selectedOrderId} 
        onClose={() => {
          setSelectedOrderId(null);
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }} 
      />
    </div>
  );
};

export default AdminOrders;
