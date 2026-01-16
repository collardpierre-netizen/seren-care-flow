import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInHours, differenceInMinutes, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search,
  Filter,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  Calendar,
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

interface PreparerStats {
  totalPrepared: number;
  avgPrepTime: number;
  successRate: number;
  todayPrepared: number;
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
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);

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

  // Fetch preparer stats
  const { data: stats } = useQuery<PreparerStats>({
    queryKey: ['preparer-stats', preparerName],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      
      // Get all preparation logs for this preparer
      const { data: logs } = await supabase
        .from('order_preparer_logs')
        .select('created_at, action, order_id')
        .eq('preparer_name', preparerName)
        .order('created_at', { ascending: false });

      // Get completed orders (for timing calculation)
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('id, created_at, updated_at, status')
        .in('status', ['shipped', 'delivered', 'closed'])
        .gte('updated_at', subDays(today, 30).toISOString());

      const todayLogs = logs?.filter(l => 
        new Date(l.created_at) >= new Date(startOfToday)
      ) || [];

      const uniqueOrdersToday = new Set(todayLogs.map(l => l.order_id)).size;
      const totalPrepared = new Set(logs?.map(l => l.order_id) || []).size;

      // Calculate average prep time (from creation to packed)
      let avgPrepTime = 0;
      if (completedOrders && completedOrders.length > 0) {
        const prepTimes = completedOrders.map(o => {
          const created = new Date(o.created_at);
          const updated = new Date(o.updated_at);
          return differenceInMinutes(updated, created);
        }).filter(t => t > 0 && t < 1440); // Filter out outliers

        if (prepTimes.length > 0) {
          avgPrepTime = Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length);
        }
      }

      // Calculate success rate (orders without issues)
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['shipped', 'delivered', 'closed'])
        .gte('created_at', subDays(today, 30).toISOString());

      const { data: issueData } = await supabase
        .from('order_preparer_logs')
        .select('id', { count: 'exact', head: true })
        .eq('action', 'delivery_issue_reported')
        .gte('created_at', subDays(today, 30).toISOString());
      
      const issueOrders = issueData ? 1 : 0;

      const successRate = totalOrders && totalOrders > 0 
        ? Math.round(((totalOrders - (issueOrders || 0)) / totalOrders) * 100) 
        : 100;

      return {
        totalPrepared,
        avgPrepTime,
        successRate,
        todayPrepared: uniqueOrdersToday,
      };
    },
    enabled: isAuthenticated && !!preparerName,
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

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_city.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'ready' && getProgress(order) !== 100) return false;
        if (statusFilter === 'in_progress' && (getProgress(order) === 0 || getProgress(order) === 100)) return false;
        if (statusFilter === 'pending' && getProgress(order) !== 0) return false;
        if (statusFilter === 'issues' && !order.has_issues) return false;
      }

      // Date filter
      if (dateFilter !== 'all' && order.eta_date) {
        const etaDate = new Date(order.eta_date);
        const today = new Date();
        if (dateFilter === 'today' && etaDate.toDateString() !== today.toDateString()) return false;
        if (dateFilter === 'tomorrow') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (etaDate.toDateString() !== tomorrow.toDateString()) return false;
        }
        if (dateFilter === 'week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (etaDate > weekFromNow) return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, dateFilter]);

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
  const overdueOrders = filteredOrders.filter(o => getUrgencyLevel(o) === 'overdue');
  const criticalOrders = filteredOrders.filter(o => getUrgencyLevel(o) === 'critical');
  const urgentOrders = filteredOrders.filter(o => getUrgencyLevel(o) === 'urgent');
  const normalOrders = filteredOrders.filter(o => getUrgencyLevel(o) === 'normal');

  return (
    <>
      <Helmet>
        <title>Dashboard Préparateur | SerenCare</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={logo} alt="SerenCare" className="h-8 invert brightness-0" />
                <div className="hidden sm:block">
                  <p className="text-white font-semibold">Bonjour, {preparerName || 'Préparateur'} 👋</p>
                  <p className="text-slate-400 text-sm">{filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowStats(!showStats)}
                  className={cn(
                    "text-slate-400 hover:text-white hover:bg-slate-700",
                    showStats && "bg-slate-700 text-white"
                  )}
                >
                  <BarChart3 className="h-5 w-5" />
                </Button>
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
                  {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* New Order Animation */}
        <AnimatePresence>
          {showNewOrderAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-green-500/20 pointer-events-none flex items-center justify-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} className="text-center">
                <Sparkles className="h-24 w-24 text-green-400 mx-auto mb-4" />
                <p className="text-3xl font-bold text-white">Nouvelle commande !</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Performance Stats */}
          <AnimatePresence>
            {showStats && stats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-400" />
                      Mes performances (30 jours)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                        <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{stats.todayPrepared}</p>
                        <p className="text-slate-400 text-xs">Aujourd'hui</p>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                        <Package className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{stats.totalPrepared}</p>
                        <p className="text-slate-400 text-xs">Total préparées</p>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                        <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{stats.avgPrepTime}min</p>
                        <p className="text-slate-400 text-xs">Temps moyen</p>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
                        <p className="text-slate-400 text-xs">Taux succès</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher par n° commande, client, ville..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-slate-700 border-slate-600 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="ready">Prêtes</SelectItem>
                    <SelectItem value="issues">Avec problèmes</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-slate-700 border-slate-600 text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Toutes dates</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="tomorrow">Demain</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-white">{filteredOrders.length}</p>
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
                  {filteredOrders.filter(o => getProgress(o) === 100 && !o.has_issues).length}
                </p>
                <p className="text-green-300 text-sm">Prêtes</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-900/30 border-amber-700/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-amber-400">
                  {filteredOrders.filter(o => o.has_issues).length}
                </p>
                <p className="text-amber-300 text-sm">Problèmes</p>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-16 text-center">
                <PackageCheck className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <p className="text-xl text-white mb-2">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? 'Aucune commande trouvée' 
                    : 'Aucune commande en attente'}
                </p>
                <p className="text-slate-400">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Essayez de modifier vos filtres'
                    : 'Profitez-en pour prendre une pause ☕'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Overdue + Critical */}
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

              {/* Urgent */}
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

              {/* Normal */}
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
