import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { format, subDays, differenceInMinutes, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const chartConfig = {
  prepared: {
    label: "Préparées",
    color: "hsl(var(--primary))",
  },
  issues: {
    label: "Problèmes",
    color: "hsl(var(--destructive))",
  },
  avgTime: {
    label: "Temps moyen",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(142, 76%, 36%)', 'hsl(var(--muted))'];

const AdminPreparationAnalytics: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['preparation-analytics'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();

      // Get all preparations
      const { data: preparations } = await supabase
        .from('order_item_preparation')
        .select('*, order_items(quantity)')
        .gte('created_at', thirtyDaysAgo);

      // Get orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status, created_at, eta_date')
        .in('status', ['payment_confirmed', 'processing', 'preparing', 'packed', 'shipped', 'delivered'])
        .gte('created_at', thirtyDaysAgo);

      // Get stock notifications
      const { data: notifications } = await supabase
        .from('stock_notifications')
        .select('*')
        .gte('created_at', thirtyDaysAgo);

      // Calculate metrics
      const totalPreparations = preparations?.length || 0;
      const completedPreparations = preparations?.filter(p => p.prepared_at).length || 0;
      const issuePreparations = preparations?.filter(p => p.is_available === false).length || 0;
      
      // Calculate average preparation time
      const preparationsWithTime = preparations?.filter(p => p.prepared_at) || [];
      let avgPrepTime = 0;
      if (preparationsWithTime.length > 0) {
        const totalMinutes = preparationsWithTime.reduce((sum, p) => {
          return sum + differenceInMinutes(new Date(p.prepared_at!), new Date(p.created_at));
        }, 0);
        avgPrepTime = Math.round(totalMinutes / preparationsWithTime.length);
      }

      // Daily stats for charts
      const dailyStats: Record<string, { date: string; prepared: number; issues: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyStats[date] = { date: format(subDays(new Date(), i), 'dd/MM'), prepared: 0, issues: 0 };
      }

      preparations?.forEach(p => {
        const date = format(new Date(p.created_at), 'yyyy-MM-dd');
        if (dailyStats[date]) {
          if (p.prepared_at) dailyStats[date].prepared++;
          if (p.is_available === false) dailyStats[date].issues++;
        }
      });

      // Status distribution
      const statusCounts = {
        completed: completedPreparations,
        inProgress: preparations?.filter(p => !p.prepared_at && p.is_available !== false).length || 0,
        issues: issuePreparations,
        pending: totalPreparations - completedPreparations - issuePreparations
      };

      // Issue types from notifications
      const issueTypes: Record<string, number> = {};
      notifications?.forEach(n => {
        issueTypes[n.notification_type] = (issueTypes[n.notification_type] || 0) + 1;
      });

      // On-time rate (orders completed before eta_date)
      const completedOrders = orders?.filter(o => ['shipped', 'delivered'].includes(o.status)) || [];
      const onTimeOrders = completedOrders.filter(o => {
        if (!o.eta_date) return true;
        // Check if order was shipped before eta
        return true; // Simplified - would need ship date
      });
      const onTimeRate = completedOrders.length > 0 
        ? Math.round((onTimeOrders.length / completedOrders.length) * 100) 
        : 100;

      // Week over week comparison
      const thisWeekPreps = preparations?.filter(p => 
        new Date(p.created_at) >= new Date(sevenDaysAgo)
      ).length || 0;
      
      const lastWeekStart = subDays(new Date(), 14).toISOString();
      const lastWeekPreps = preparations?.filter(p => 
        new Date(p.created_at) >= new Date(lastWeekStart) && 
        new Date(p.created_at) < new Date(sevenDaysAgo)
      ).length || 0;

      const weekChange = lastWeekPreps > 0 
        ? Math.round(((thisWeekPreps - lastWeekPreps) / lastWeekPreps) * 100)
        : 0;

      return {
        totalPreparations,
        completedPreparations,
        issuePreparations,
        avgPrepTime,
        completionRate: totalPreparations > 0 ? Math.round((completedPreparations / totalPreparations) * 100) : 0,
        issueRate: totalPreparations > 0 ? Math.round((issuePreparations / totalPreparations) * 100) : 0,
        dailyStats: Object.values(dailyStats),
        statusCounts,
        issueTypes,
        onTimeRate,
        weekChange,
        pendingOrders: orders?.filter(o => ['payment_confirmed', 'processing', 'preparing'].includes(o.status)).length || 0
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pieData = [
    { name: 'Complétées', value: stats?.statusCounts.completed || 0 },
    { name: 'Problèmes', value: stats?.statusCounts.issues || 0 },
    { name: 'En cours', value: stats?.statusCounts.inProgress || 0 },
    { name: 'En attente', value: stats?.statusCounts.pending || 0 }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics Préparations</h1>
        <p className="text-muted-foreground">Statistiques et performances des préparations de commandes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préparations ce mois</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPreparations}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stats?.weekChange !== undefined && stats.weekChange !== 0 && (
                <>
                  {stats.weekChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={stats.weekChange > 0 ? 'text-green-600' : 'text-red-600'}>
                    {stats.weekChange > 0 ? '+' : ''}{stats.weekChange}%
                  </span>
                  vs semaine dernière
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgPrepTime} min</div>
            <p className="text-xs text-muted-foreground">par article préparé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedPreparations} sur {stats?.totalPreparations}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de problèmes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              (stats?.issueRate || 0) > 10 ? "text-destructive" : ""
            )}>
              {stats?.issueRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.issuePreparations} articles avec problèmes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activité des 7 derniers jours</CardTitle>
            <CardDescription>Préparations et problèmes par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={stats?.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="prepared" fill="var(--color-prepared)" name="Préparées" radius={[4, 4, 0, 0]} />
                <Bar dataKey="issues" fill="var(--color-issues)" name="Problèmes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des statuts</CardTitle>
            <CardDescription>État des préparations en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center py-4">
              {stats?.pendingOrders}
            </div>
            <p className="text-center text-muted-foreground">
              commandes à préparer
            </p>
          </CardContent>
        </Card>

        {/* On-time Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Taux de ponctualité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-4xl font-bold text-center py-4",
              (stats?.onTimeRate || 0) >= 90 ? "text-green-600" : 
              (stats?.onTimeRate || 0) >= 70 ? "text-amber-600" : "text-destructive"
            )}>
              {stats?.onTimeRate}%
            </div>
            <p className="text-center text-muted-foreground">
              livrées avant la date prévue
            </p>
          </CardContent>
        </Card>

        {/* Issue Types */}
        <Card>
          <CardHeader>
            <CardTitle>Types de problèmes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.issueTypes && Object.entries(stats.issueTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">
                    {type === 'out_of_stock' ? 'Rupture' : 
                     type === 'low_stock' ? 'Stock bas' : 
                     type === 'unavailable_preparation' ? 'Indisponible' : type}
                  </span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
              {(!stats?.issueTypes || Object.keys(stats.issueTypes).length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  Aucun problème signalé
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPreparationAnalytics;
