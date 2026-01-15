import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { format, parseISO, startOfDay, subDays, eachDayOfInterval, startOfWeek, eachWeekOfInterval, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar } from "lucide-react";

interface ChartData {
  date: string;
  label: string;
  inscriptions: number;
  notifications: number;
  unsubscriptions: number;
}

export default function StockAlertEvolutionChart() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["admin-stock-alerts-evolution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_alerts")
        .select("created_at, notified_at, is_active")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const dailyData = useMemo(() => {
    if (!alerts) return [];

    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const inscriptions = alerts.filter((a) => {
        const createdAt = parseISO(a.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      const notifications = alerts.filter((a) => {
        if (!a.notified_at) return false;
        const notifiedAt = parseISO(a.notified_at);
        return notifiedAt >= dayStart && notifiedAt <= dayEnd;
      }).length;

      const unsubscriptions = alerts.filter((a) => {
        const createdAt = parseISO(a.created_at);
        return (
          createdAt >= dayStart &&
          createdAt <= dayEnd &&
          !a.is_active &&
          !a.notified_at
        );
      }).length;

      return {
        date: format(day, "yyyy-MM-dd"),
        label: format(day, "d MMM", { locale: fr }),
        inscriptions,
        notifications,
        unsubscriptions,
      };
    });
  }, [alerts]);

  const weeklyData = useMemo(() => {
    if (!alerts) return [];

    const endDate = new Date();
    const startDate = subWeeks(endDate, 12);
    const weeks = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 }
    );

    return weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const inscriptions = alerts.filter((a) => {
        const createdAt = parseISO(a.created_at);
        return createdAt >= weekStart && createdAt <= weekEnd;
      }).length;

      const notifications = alerts.filter((a) => {
        if (!a.notified_at) return false;
        const notifiedAt = parseISO(a.notified_at);
        return notifiedAt >= weekStart && notifiedAt <= weekEnd;
      }).length;

      const unsubscriptions = alerts.filter((a) => {
        const createdAt = parseISO(a.created_at);
        return (
          createdAt >= weekStart &&
          createdAt <= weekEnd &&
          !a.is_active &&
          !a.notified_at
        );
      }).length;

      return {
        date: format(weekStart, "yyyy-MM-dd"),
        label: `Sem. ${format(weekStart, "w", { locale: fr })}`,
        inscriptions,
        notifications,
        unsubscriptions,
      };
    });
  }, [alerts]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Évolution des alertes stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="daily" className="gap-2">
              <Calendar className="h-4 w-4" />
              30 derniers jours
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Calendar className="h-4 w-4" />
              12 dernières semaines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="inscriptions"
                    name="Inscriptions"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="notifications"
                    name="Notifiés"
                    stackId="2"
                    stroke="hsl(142.1 76.2% 36.3%)"
                    fill="hsl(142.1 76.2% 36.3%)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="unsubscriptions"
                    name="Désinscrits"
                    stackId="3"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="inscriptions"
                    name="Inscriptions"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="notifications"
                    name="Notifiés"
                    fill="hsl(142.1 76.2% 36.3%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="unsubscriptions"
                    name="Désinscrits"
                    fill="hsl(var(--muted-foreground))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
