import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Package,
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Bell,
  BellOff,
  RefreshCw,
  Flame,
  Timer,
  PackageCheck,
  Sparkles,
  XCircle,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

interface OrderForPreparer {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  eta_date: string | null;
  total: number;
  customer_name: string;
  customer_city: string;
  items_count: number;
  items_prepared: number;
  has_issues: boolean;
}

const PreparerDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = searchParams.get('token');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [preparerName, setPreparerName] = useState(localStorage.getItem('preparerName') || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNewOrderAnimation, setShowNewOrderAnimation] = useState(false);

  // Verify preparer access
  useEffect(() => {
    const verifyAccess = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-preparer-access', {
          body: { token, action: 'verify_dashboard' },
        });
        
        if (error) throw error;
        if (data.valid) {
          setIsAuthenticated(true);
          if (data.preparerName) {
            setPreparerName(data.preparerName);
            localStorage.setItem('preparerName', data.preparerName);
          }
        }
      } catch {
        toast.error('Lien d\'accès invalide');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [token]);

  // Enable notifications
  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications activées !');
      }
    }
  };

  // Fetch orders for preparer
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['preparer-dashboard-orders', token],
    queryFn: async () => {
      // For now, fetch directly - in production this would use token auth
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id, 
          order_number, 
          status, 
          created_at, 
          eta_date, 
          total, 
          shipping_address,
          order_items(id, quantity)
        `)
        .in('status', ['payment_confirmed', 'processing', 'preparing', 'packed'])
        .order('eta_date', { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Get preparation status
      const orderIds = ordersData?.map(o => o.id) || [];
      const { data: prepData } = await supabase
        .from('order_item_preparation')
        .select('order_id, order_item_id, prepared_at, is_available')
        .in('order_id', orderIds);

      return ordersData?.map(order => {
        const shipping = order.shipping_address as any;
        const items = order.order_items || [];
        const preps = prepData?.filter(p => p.order_id === order.id) || [];
        
        return {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          created_at: order.created_at,
          eta_date: order.eta_date,
          total: order.total,
          customer_name: shipping ? `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() : 'Client',
          customer_city: shipping?.city || '',
          items_count: items.length,
          items_prepared: preps.filter(p => p.prepared_at).length,
          has_issues: preps.some(p => !p.is_available),
        } as OrderForPreparer;
      }) || [];
    },
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  // Subscribe to new orders
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('preparer-new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as any;
          if (['payment_confirmed', 'processing'].includes(newOrder.status)) {
            setShowNewOrderAnimation(true);
            setTimeout(() => setShowNewOrderAnimation(false), 3000);
            
            toast.info('🆕 Nouvelle commande !', {
              description: `Commande ${newOrder.order_number}`,
              duration: 10000,
            });

            if (notificationsEnabled && 'Notification' in window) {
              new Notification('Nouvelle commande SerenCare !', {
                body: `Commande ${newOrder.order_number} à préparer`,
                icon: '/logo-192.png',
              });
            }

            refetch();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, notificationsEnabled, refetch]);

  const getUrgencyLevel = (order: OrderForPreparer) => {
    if (order.eta_date) {
      const hoursUntil = differenceInHours(new Date(order.eta_date), new Date());
      if (hoursUntil <= 0) return 'overdue';
      if (hoursUntil <= 12) return 'critical';
      if (hoursUntil <= 24) return 'urgent';
    }
    return 'normal';
  };

  const getProgress = (order: OrderForPreparer) => {
    if (order.items_count === 0) return 0;
    return Math.round((order.items_prepared / order.items_count) * 100);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Dashboard Préparateur | SerenCare</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Accès Préparateur</h1>
              <p className="text-muted-foreground">
                Cette page nécessite un lien d'accès sécurisé.
              </p>
              <Input
                placeholder="Entrez votre nom"
                value={preparerName}
                onChange={(e) => {
                  setPreparerName(e.target.value);
                  localStorage.setItem('preparerName', e.target.value);
                }}
                className="text-center"
              />
              <Button 
                onClick={() => {
                  if (preparerName.trim()) {
                    setIsAuthenticated(true);
                  } else {
                    toast.error('Veuillez entrer votre nom');
                  }
                }}
                className="w-full"
              >
                Accéder au dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Group orders by urgency
  const overdueOrders = orders.filter(o => getUrgencyLevel(o) === 'overdue');
  const criticalOrders = orders.filter(o => getUrgencyLevel(o) === 'critical');
  const urgentOrders = orders.filter(o => getUrgencyLevel(o) === 'urgent');
  const normalOrders = orders.filter(o => getUrgencyLevel(o) === 'normal');

  return (
    <>
      <Helmet>
        <title>Dashboard Préparateur | SerenCare</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header - Uber Eats style */}
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={logo} alt="SerenCare" className="h-8 invert brightness-0" />
                <div className="hidden sm:block">
                  <p className="text-white font-semibold">Bonjour, {preparerName || 'Préparateur'} 👋</p>
                  <p className="text-slate-400 text-sm">{orders.length} commande{orders.length > 1 ? 's' : ''} en attente</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetch()}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
                <Button
                  variant={notificationsEnabled ? "default" : "outline"}
                  size="icon"
                  onClick={requestNotifications}
                  className={cn(
                    notificationsEnabled 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "border-slate-600 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {notificationsEnabled ? (
                    <Bell className="h-5 w-5" />
                  ) : (
                    <BellOff className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* New Order Animation Overlay */}
        <AnimatePresence>
          {showNewOrderAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-green-500/20 pointer-events-none flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="text-center"
              >
                <Sparkles className="h-24 w-24 text-green-400 mx-auto mb-4" />
                <p className="text-3xl font-bold text-white">Nouvelle commande !</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-white">{orders.length}</p>
                <p className="text-slate-400 text-sm">Total</p>
              </CardContent>
            </Card>
            <Card className="bg-red-900/30 border-red-700/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{overdueOrders.length + criticalOrders.length}</p>
                <p className="text-red-300 text-sm">Urgentes</p>
              </CardContent>
            </Card>
            <Card className="bg-green-900/30 border-green-700/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-400">
                  {orders.filter(o => getProgress(o) === 100 && !o.has_issues).length}
                </p>
                <p className="text-green-300 text-sm">Prêtes</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-900/30 border-amber-700/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-amber-400">
                  {orders.filter(o => o.has_issues).length}
                </p>
                <p className="text-amber-300 text-sm">Problèmes</p>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-16 text-center">
                <PackageCheck className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <p className="text-xl text-white mb-2">Aucune commande en attente</p>
                <p className="text-slate-400">Profitez-en pour prendre une pause ☕</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Overdue + Critical Orders */}
              {(overdueOrders.length > 0 || criticalOrders.length > 0) && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-red-400">
                      Urgentes ({overdueOrders.length + criticalOrders.length})
                    </h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...overdueOrders, ...criticalOrders].map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        urgency="critical"
                        progress={getProgress(order)}
                        onClick={() => navigate(`/commande-preparation/${order.id}${token ? `?token=${token}` : ''}`)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Urgent Orders */}
              {urgentOrders.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Timer className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-semibold text-amber-400">
                      Aujourd'hui ({urgentOrders.length})
                    </h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {urgentOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        urgency="urgent"
                        progress={getProgress(order)}
                        onClick={() => navigate(`/commande-preparation/${order.id}${token ? `?token=${token}` : ''}`)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Normal Orders */}
              {normalOrders.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-slate-300">
                      À venir ({normalOrders.length})
                    </h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {normalOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        urgency="normal"
                        progress={getProgress(order)}
                        onClick={() => navigate(`/commande-preparation/${order.id}${token ? `?token=${token}` : ''}`)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

// Order Card Component
interface OrderCardProps {
  order: OrderForPreparer;
  urgency: 'critical' | 'urgent' | 'normal';
  progress: number;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, urgency, progress, onClick }) => {
  const isReady = progress === 100 && !order.has_issues;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all overflow-hidden",
          urgency === 'critical' && "bg-gradient-to-br from-red-900/40 to-red-950/60 border-red-700/50 hover:border-red-500",
          urgency === 'urgent' && "bg-gradient-to-br from-amber-900/40 to-amber-950/60 border-amber-700/50 hover:border-amber-500",
          urgency === 'normal' && "bg-slate-800/50 border-slate-700 hover:border-slate-500",
          isReady && "bg-gradient-to-br from-green-900/40 to-green-950/60 border-green-700/50"
        )}
        onClick={onClick}
      >
        {/* Urgency indicator bar */}
        <div className={cn(
          "h-1",
          urgency === 'critical' && "bg-red-500",
          urgency === 'urgent' && "bg-amber-500",
          urgency === 'normal' && "bg-slate-600",
          isReady && "bg-green-500"
        )} />

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white font-bold text-lg">{order.order_number}</p>
              <p className="text-slate-400 text-sm">{order.customer_name}</p>
            </div>
            <div className="flex items-center gap-2">
              {order.has_issues && (
                <Badge variant="destructive" className="bg-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Problème
                </Badge>
              )}
              {isReady && (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Prêt
                </Badge>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <MapPin className="h-4 w-4" />
            <span>{order.customer_city || 'Adresse'}</span>
          </div>

          {/* ETA */}
          {order.eta_date && (
            <div className={cn(
              "flex items-center gap-2 text-sm mb-3",
              urgency === 'critical' && "text-red-400",
              urgency === 'urgent' && "text-amber-400",
              urgency === 'normal' && "text-slate-400"
            )}>
              <Clock className="h-4 w-4" />
              <span>Livraison: {format(new Date(order.eta_date), 'dd MMM à HH:mm', { locale: fr })}</span>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                {order.items_prepared}/{order.items_count} articles
              </span>
              <span className={cn(
                "font-medium",
                progress === 100 ? "text-green-400" : "text-white"
              )}>
                {progress}%
              </span>
            </div>
            <Progress 
              value={progress} 
              className={cn(
                "h-2",
                isReady && "[&>div]:bg-green-500"
              )} 
            />
          </div>

          {/* Action */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
            <span className="text-slate-400 text-sm">
              {Number(order.total).toFixed(2)} €
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              Préparer
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PreparerDashboard;
