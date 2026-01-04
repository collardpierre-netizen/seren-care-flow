import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  RefreshCw, 
  Users, 
  TrendingUp,
  Euro,
  ArrowRight,
  Loader2,
  TrendingDown,
  Calendar,
  UserCheck
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const [products, orders, ordersLast7, subscriptions, customers, ordersPrevMonth, prescribers] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('id, total, status, created_at'),
        supabase.from('orders').select('id, total').gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('subscriptions').select('id, status, created_at, frequency_days'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total').gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
        (supabase.from('prescribers' as any) as any).select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      // Active subscriptions
      const activeSubscriptions = subscriptions.data?.filter(s => s.status === 'active') || [];
      const cancelledThisMonth = subscriptions.data?.filter(s => 
        s.status === 'cancelled' && 
        new Date(s.created_at) >= thisMonthStart
      ).length || 0;

      // Calculate MRR (Monthly Recurring Revenue) from active subscriptions
      // Assuming average order value for subscriptions
      const allOrders = orders.data || [];
      const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const avgOrderValue = allOrders.length ? totalRevenue / allOrders.length : 0;
      
      // MRR = active subscriptions * average order value
      const mrr = activeSubscriptions.length * avgOrderValue;

      // Orders last 7 days
      const ordersLast7Days = ordersLast7.data?.length || 0;
      const revenueLast7Days = ordersLast7.data?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

      // Churn rate (cancelled / total active at start of month)
      const churnRate = activeSubscriptions.length > 0 
        ? (cancelledThisMonth / (activeSubscriptions.length + cancelledThisMonth)) * 100 
        : 0;

      // Previous month revenue for comparison
      const prevMonthRevenue = ordersPrevMonth.data?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
      const revenueGrowth = prevMonthRevenue > 0 
        ? ((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
        : 0;

      return {
        productsCount: products.count || 0,
        ordersCount: allOrders.length,
        activeSubscriptions: activeSubscriptions.length,
        customersCount: customers.count || 0,
        prescribersCount: prescribers.count || 0,
        totalRevenue,
        avgOrderValue,
        mrr,
        ordersLast7Days,
        revenueLast7Days,
        churnRate,
        revenueGrowth,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'MRR (Revenu mensuel récurrent)',
      value: `${(stats?.mrr || 0).toFixed(0)} €`,
      subtitle: `${stats?.activeSubscriptions || 0} abonnements actifs`,
      icon: Euro,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Commandes (7 jours)',
      value: stats?.ordersLast7Days || 0,
      subtitle: `${(stats?.revenueLast7Days || 0).toFixed(2)} € de CA`,
      icon: ShoppingCart,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Panier moyen',
      value: `${(stats?.avgOrderValue || 0).toFixed(2)} €`,
      subtitle: `${stats?.ordersCount || 0} commandes totales`,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Taux de désabonnement',
      value: `${(stats?.churnRate || 0).toFixed(1)}%`,
      subtitle: 'Ce mois-ci',
      icon: stats?.churnRate && stats.churnRate > 5 ? TrendingDown : RefreshCw,
      color: stats?.churnRate && stats.churnRate > 5 ? 'text-destructive' : 'text-secondary',
      bgColor: stats?.churnRate && stats.churnRate > 5 ? 'bg-destructive/10' : 'bg-secondary/10',
    },
  ];

  const quickLinks = [
    { label: 'Commandes', href: '/admin/commandes', icon: ShoppingCart, count: stats?.ordersLast7Days },
    { label: 'Produits', href: '/admin/produits', icon: Package, count: stats?.productsCount },
    { label: 'Abonnements', href: '/admin/abonnements', icon: RefreshCw, count: stats?.activeSubscriptions },
    { label: 'Prescripteurs', href: '/admin/prescripteurs', icon: UserCheck, count: stats?.prescribersCount },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue sur votre espace d'administration SerenCare
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Accès rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 relative">
                  <link.icon className="h-6 w-6" />
                  <span className="text-sm">{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {link.count}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Revenus totaux</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats?.totalRevenue || 0).toFixed(2)} €</div>
            {stats?.revenueGrowth !== 0 && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${stats?.revenueGrowth && stats.revenueGrowth > 0 ? 'text-secondary' : 'text-destructive'}`}>
                {stats?.revenueGrowth && stats.revenueGrowth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stats?.revenueGrowth?.toFixed(1)}% vs mois précédent
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Clients</CardTitle>
            <Link to="/admin/clients">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.customersCount}</div>
            <p className="text-muted-foreground text-sm mt-1">clients inscrits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Abonnements actifs</CardTitle>
            <Link to="/admin/abonnements">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeSubscriptions}</div>
            <p className="text-muted-foreground text-sm mt-1">
              {stats?.mrr?.toFixed(0)} € MRR estimé
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
