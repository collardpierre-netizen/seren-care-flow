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
  Loader2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, orders, subscriptions, customers] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total, status', { count: 'exact' }),
        supabase.from('subscriptions').select('id, status', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const activeSubscriptions = subscriptions.data?.filter(s => s.status === 'active').length || 0;
      const totalRevenue = orders.data?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
      const avgOrderValue = orders.data?.length ? totalRevenue / orders.data.length : 0;

      return {
        productsCount: products.count || 0,
        ordersCount: orders.count || 0,
        activeSubscriptions,
        customersCount: customers.count || 0,
        totalRevenue,
        avgOrderValue,
        recentOrders: orders.data?.slice(0, 5) || [],
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
      title: 'Abonnements actifs',
      value: stats?.activeSubscriptions || 0,
      icon: RefreshCw,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Revenu mensuel',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} €`,
      icon: Euro,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Panier moyen',
      value: `${(stats?.avgOrderValue || 0).toFixed(2)} €`,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total commandes',
      value: stats?.ordersCount || 0,
      icon: ShoppingCart,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  const quickLinks = [
    { label: 'Voir les commandes', href: '/admin/commandes', icon: ShoppingCart },
    { label: 'Gérer les produits', href: '/admin/produits', icon: Package },
    { label: 'Abonnements', href: '/admin/abonnements', icon: RefreshCw },
    { label: 'Clients', href: '/admin/clients', icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Bienvenue sur votre espace d'administration SerenCare</p>
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
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                  <link.icon className="h-6 w-6" />
                  <span className="text-sm">{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Produits</CardTitle>
            <Link to="/admin/produits">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.productsCount}</div>
            <p className="text-muted-foreground text-sm mt-1">produits actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Clients</CardTitle>
            <Link to="/admin/clients">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.customersCount}</div>
            <p className="text-muted-foreground text-sm mt-1">clients inscrits</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
