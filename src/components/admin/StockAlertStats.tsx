import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Bell,
  Mail,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StockAlertEvolutionChart from "./StockAlertEvolutionChart";

interface ProductAlertStats {
  product_id: string;
  product_name: string;
  total_alerts: number;
  active_alerts: number;
  notified_alerts: number;
  unsubscribed_alerts: number;
}

export default function StockAlertStats() {
  // Fetch all alerts with product info
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["admin-stock-alerts-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_alerts")
        .select(`
          *,
          products (id, name, slug, stock_status)
        `);

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!alerts) return null;

    const total = alerts.length;
    const active = alerts.filter((a) => a.is_active && !a.notified_at).length;
    const notified = alerts.filter((a) => a.notified_at).length;
    const unsubscribed = alerts.filter((a) => !a.is_active && !a.notified_at).length;
    const conversionRate = total > 0 ? Math.round((notified / total) * 100) : 0;

    // Group by product
    const byProduct = alerts.reduce((acc, alert) => {
      const productId = alert.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product_id: productId,
          product_name: alert.products?.name || "Produit supprimé",
          total_alerts: 0,
          active_alerts: 0,
          notified_alerts: 0,
          unsubscribed_alerts: 0,
        };
      }
      acc[productId].total_alerts++;
      if (alert.is_active && !alert.notified_at) {
        acc[productId].active_alerts++;
      }
      if (alert.notified_at) {
        acc[productId].notified_alerts++;
      }
      if (!alert.is_active && !alert.notified_at) {
        acc[productId].unsubscribed_alerts++;
      }
      return acc;
    }, {} as Record<string, ProductAlertStats>);

    // Sort by active alerts (most requested)
    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.active_alerts - a.active_alerts)
      .slice(0, 5);

    return {
      total,
      active,
      notified,
      unsubscribed,
      conversionRate,
      topProducts,
    };
  }, [alerts]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Evolution chart */}
      <StockAlertEvolutionChart />
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Total inscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats.total}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-500" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-amber-600">{stats.active}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Notifiés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">{stats.notified}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              Désinscrits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats.unsubscribed}</span>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taux de conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-primary">{stats.conversionRate}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Top products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Produits les plus demandés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.total_alerts} inscription(s) au total
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.active_alerts > 0 && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        <Mail className="h-3 w-3 mr-1" />
                        {product.active_alerts} en attente
                      </Badge>
                    )}
                    {product.notified_alerts > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {product.notified_alerts} notifiés
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
