import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Euro, Percent, AlertTriangle } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubscriptionItem {
  id: string;
  product_id: string;
  product_size: string | null;
  quantity: number;
  unit_price: number;
  product?: { name: string };
}

interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency_days: number;
  next_delivery_date: string | null;
  total_savings: number | null;
  created_at: string;
  stripe_subscription_id?: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  items: SubscriptionItem[];
}

interface SubscriptionAnalyticsProps {
  subscriptions: Subscription[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))'];

const SubscriptionAnalytics: React.FC<SubscriptionAnalyticsProps> = ({ subscriptions }) => {
  const analytics = useMemo(() => {
    if (!subscriptions?.length) return null;

    // Generate last 6 months data
    const months: { month: Date; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      months.push({
        month,
        label: format(month, 'MMM yy', { locale: fr })
      });
    }

    // Calculate MRR per month
    const mrrData = months.map(({ month, label }) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Count active subscriptions created before or during this month
      const activeSubsThisMonth = subscriptions.filter(sub => {
        const createdAt = parseISO(sub.created_at);
        const wasCreatedBefore = createdAt <= monthEnd;
        const isActiveOrWasActive = sub.status === 'active' || 
          (sub.status !== 'cancelled' && isWithinInterval(monthEnd, { start: monthStart, end: new Date() }));
        return wasCreatedBefore && (sub.status === 'active' || isActiveOrWasActive);
      });

      const mrr = activeSubsThisMonth.reduce((sum, sub) => {
        return sum + (sub.items?.reduce((t, item) => t + (item.unit_price * item.quantity), 0) || 0);
      }, 0);

      return { month: label, mrr: Math.round(mrr), subscribers: activeSubsThisMonth.length };
    });

    // Calculate subscriber growth
    const subscriberGrowth = months.map(({ month, label }) => {
      const monthEnd = endOfMonth(month);
      const newSubs = subscriptions.filter(sub => {
        const createdAt = parseISO(sub.created_at);
        return isWithinInterval(createdAt, { start: startOfMonth(month), end: monthEnd });
      }).length;
      
      const cancelledSubs = subscriptions.filter(sub => {
        return sub.status === 'cancelled' && 
          isWithinInterval(parseISO(sub.created_at), { start: startOfMonth(month), end: monthEnd });
      }).length;

      return { month: label, nouveaux: newSubs, annulés: cancelledSubs };
    });

    // Status distribution
    const statusDistribution = [
      { name: 'Actifs', value: subscriptions.filter(s => s.status === 'active').length, color: COLORS[0] },
      { name: 'En pause', value: subscriptions.filter(s => s.status === 'paused').length, color: COLORS[1] },
      { name: 'Annulés', value: subscriptions.filter(s => s.status === 'cancelled').length, color: COLORS[2] },
    ];

    // Calculate churn rate (cancelled in last 30 days / active at start)
    const last30Days = subMonths(new Date(), 1);
    const cancelledRecently = subscriptions.filter(s => 
      s.status === 'cancelled' && parseISO(s.created_at) >= last30Days
    ).length;
    const totalAtStart = subscriptions.filter(s => parseISO(s.created_at) < last30Days).length;
    const churnRate = totalAtStart > 0 ? (cancelledRecently / totalAtStart) * 100 : 0;

    // Current MRR
    const currentMRR = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, sub) => sum + (sub.items?.reduce((t, item) => t + (item.unit_price * item.quantity), 0) || 0), 0);

    // MRR growth (compare last 2 months)
    const lastMonthMRR = mrrData[mrrData.length - 2]?.mrr || 0;
    const currentMonthMRR = mrrData[mrrData.length - 1]?.mrr || 0;
    const mrrGrowth = lastMonthMRR > 0 ? ((currentMonthMRR - lastMonthMRR) / lastMonthMRR) * 100 : 0;

    // Average subscription value
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const avgSubscriptionValue = activeSubscriptions.length > 0 
      ? currentMRR / activeSubscriptions.length 
      : 0;

    return {
      mrrData,
      subscriberGrowth,
      statusDistribution,
      churnRate,
      currentMRR,
      mrrGrowth,
      avgSubscriptionValue,
      totalSubscribers: subscriptions.filter(s => s.status === 'active').length
    };
  }, [subscriptions]);

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    mrr: { label: 'MRR', color: 'hsl(var(--primary))' },
    subscribers: { label: 'Abonnés', color: 'hsl(var(--primary))' },
    nouveaux: { label: 'Nouveaux', color: 'hsl(var(--primary))' },
    annulés: { label: 'Annulés', color: 'hsl(var(--destructive))' },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold">{analytics.currentMRR.toFixed(0)} €</p>
              </div>
              <div className={`flex items-center gap-1 text-sm ${analytics.mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.mrrGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(analytics.mrrGrowth).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abonnés actifs</p>
                <p className="text-2xl font-bold">{analytics.totalSubscribers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Panier moyen</p>
                <p className="text-2xl font-bold">{analytics.avgSubscriptionValue.toFixed(0)} €</p>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de churn</p>
                <p className="text-2xl font-bold">{analytics.churnRate.toFixed(1)}%</p>
              </div>
              {analytics.churnRate > 5 ? (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              ) : (
                <Percent className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* MRR Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Évolution du MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <LineChart data={analytics.mrrData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subscriber Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Croissance des abonnés</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={analytics.subscriberGrowth}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="nouveaux" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="annulés" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Répartition des statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {analytics.statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionAnalytics;
