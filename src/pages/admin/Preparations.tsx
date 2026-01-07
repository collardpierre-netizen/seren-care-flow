import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Eye,
  RefreshCw,
  XCircle,
  PackageCheck
} from 'lucide-react';
import { format, differenceInHours, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PreparationItem {
  id: string;
  order_id: string;
  order_item_id: string;
  is_available: boolean | null;
  prepared_quantity: number;
  notes: string | null;
  prepared_at: string | null;
}

interface OrderWithPreparation {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  eta_date: string | null;
  total: number;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    product_size: string | null;
    preparation?: PreparationItem;
  }>;
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

const AdminPreparations: React.FC = () => {
  const navigate = useNavigate();
  const [stockAlerts, setStockAlerts] = useState<Array<{
    order_number: string;
    order_id: string;
    product_name: string;
    requested: number;
    prepared: number;
    notes: string | null;
  }>>([]);

  // Fetch orders in preparation phase
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-preparations'],
    queryFn: async () => {
      // Get orders that are in preparation statuses
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, status, created_at, eta_date, total, user_id')
        .in('status', ['payment_confirmed', 'processing', 'preparing', 'packed'])
        .order('eta_date', { ascending: true, nullsFirst: false });
      
      if (ordersError) throw ordersError;
      if (!ordersData || ordersData.length === 0) return [];

      // Get order items
      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, product_name, quantity, product_size')
        .in('order_id', orderIds);
      
      if (itemsError) throw itemsError;

      // Get preparation status
      const { data: prepData } = await supabase
        .from('order_item_preparation')
        .select('*')
        .in('order_id', orderIds);

      // Get profiles
      const userIds = [...new Set(ordersData.map(o => o.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));
      const prepMap = new Map(prepData?.map(p => [p.order_item_id, p]));

      return ordersData.map(order => ({
        ...order,
        profile: order.user_id ? profileMap.get(order.user_id) : null,
        items: itemsData?.filter(i => i.order_id === order.id).map(item => ({
          ...item,
          preparation: prepMap.get(item.id)
        })) || []
      })) as OrderWithPreparation[];
    },
    refetchInterval: 30000 // Refresh every 30s
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('preparation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_item_preparation'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Calculate stock alerts
  useEffect(() => {
    if (!orders) return;

    const alerts: typeof stockAlerts = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const prep = item.preparation;
        if (prep) {
          // Alert if not available or prepared quantity < requested
          if (prep.is_available === false || (prep.prepared_at && prep.prepared_quantity < item.quantity)) {
            alerts.push({
              order_number: order.order_number,
              order_id: order.id,
              product_name: item.product_name,
              requested: item.quantity,
              prepared: prep.prepared_quantity,
              notes: prep.notes
            });
          }
        }
      });
    });

    setStockAlerts(alerts);
  }, [orders]);

  const getUrgencyLevel = (etaDate: string | null, createdAt: string) => {
    if (etaDate) {
      const hoursUntil = differenceInHours(new Date(etaDate), new Date());
      if (hoursUntil <= 24) return 'critical';
      if (hoursUntil <= 48) return 'warning';
    }
    
    const daysOld = differenceInDays(new Date(), new Date(createdAt));
    if (daysOld >= 3) return 'warning';
    return 'normal';
  };

  const getPreparationProgress = (order: OrderWithPreparation) => {
    if (order.items.length === 0) return 0;
    
    const preparedItems = order.items.filter(
      item => item.preparation?.prepared_at != null
    ).length;
    
    return Math.round((preparedItems / order.items.length) * 100);
  };

  const getStatusInfo = (order: OrderWithPreparation) => {
    const progress = getPreparationProgress(order);
    const hasIssues = order.items.some(
      item => item.preparation?.is_available === false
    );
    
    if (hasIssues) {
      return { icon: AlertTriangle, color: 'text-destructive', label: 'Problème stock' };
    }
    if (progress === 100) {
      return { icon: CheckCircle2, color: 'text-green-600', label: 'Prêt' };
    }
    if (progress > 0) {
      return { icon: Package, color: 'text-amber-600', label: 'En cours' };
    }
    return { icon: Clock, color: 'text-muted-foreground', label: 'En attente' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Préparations en cours</h1>
          <p className="text-muted-foreground">Suivi en temps réel des préparations de commandes</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertes Stock ({stockAlerts.length})
            </CardTitle>
            <CardDescription>
              Produits indisponibles ou quantités insuffisantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stockAlerts.map((alert, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-destructive/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="font-medium">{alert.product_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.order_number}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Demandé: {alert.requested} — Préparé: {alert.prepared}
                      {alert.notes && <span className="ml-2 italic">"{alert.notes}"</span>}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/commande-preparation/${alert.order_id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preparations Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <PackageCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune commande en préparation</p>
          </div>
        ) : (
          orders?.map(order => {
            const urgency = getUrgencyLevel(order.eta_date, order.created_at);
            const progress = getPreparationProgress(order);
            const statusInfo = getStatusInfo(order);
            const StatusIcon = statusInfo.icon;

            return (
              <Card 
                key={order.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow",
                  urgency === 'critical' && "border-destructive/50",
                  urgency === 'warning' && "border-amber-500/50"
                )}
                onClick={() => navigate(`/commande-preparation/${order.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-mono">
                        {order.order_number}
                      </CardTitle>
                      {urgency !== 'normal' && (
                        <Badge 
                          variant="destructive" 
                          className={cn(
                            "text-xs",
                            urgency === 'warning' && "bg-amber-500"
                          )}
                        >
                          {urgency === 'critical' ? 'Urgent' : 'À traiter'}
                        </Badge>
                      )}
                    </div>
                    <div className={cn("flex items-center gap-1", statusInfo.color)}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-xs">{statusInfo.label}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.profile?.first_name} {order.profile?.last_name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* ETA */}
                    {order.eta_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Livraison prévue: {format(new Date(order.eta_date), 'dd MMM', { locale: fr })}</span>
                      </div>
                    )}

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Items summary */}
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''} — {Number(order.total).toFixed(2)} €
                    </div>

                    {/* Items list */}
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map(item => {
                        const prep = item.preparation;
                        const hasIssue = prep?.is_available === false;
                        const isReady = prep?.prepared_at != null && !hasIssue;

                        return (
                          <div 
                            key={item.id}
                            className={cn(
                              "flex items-center gap-2 text-sm p-1.5 rounded",
                              hasIssue && "bg-destructive/10 text-destructive",
                              isReady && "bg-green-50 text-green-700"
                            )}
                          >
                            {hasIssue ? (
                              <XCircle className="h-3 w-3 flex-shrink-0" />
                            ) : isReady ? (
                              <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate flex-1">
                              {item.quantity}x {item.product_name}
                            </span>
                            {item.product_size && (
                              <Badge variant="outline" className="text-xs">
                                {item.product_size}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                      {order.items.length > 3 && (
                        <p className="text-xs text-muted-foreground pl-5">
                          +{order.items.length - 3} autres articles
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Table */}
      {orders && orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Livraison prévue</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => {
                  const progress = getPreparationProgress(order);
                  const statusInfo = getStatusInfo(order);
                  const StatusIcon = statusInfo.icon;
                  const urgency = getUrgencyLevel(order.eta_date, order.created_at);

                  return (
                    <TableRow 
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/commande-preparation/${order.id}`)}
                    >
                      <TableCell className="font-mono">{order.order_number}</TableCell>
                      <TableCell>
                        {order.profile?.first_name} {order.profile?.last_name}
                      </TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={progress} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.eta_date ? (
                          <span className={cn(
                            urgency === 'critical' && "text-destructive font-medium",
                            urgency === 'warning' && "text-amber-600"
                          )}>
                            {format(new Date(order.eta_date), 'dd MMM', { locale: fr })}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1", statusInfo.color)}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm">{statusInfo.label}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPreparations;
