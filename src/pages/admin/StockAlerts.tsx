import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Trash2, Mail, Search, Loader2, CheckCircle2, XCircle, Send, BarChart3, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StockAlertStats from "@/components/admin/StockAlertStats";

interface StockAlert {
  id: string;
  email: string;
  size: string | null;
  is_active: boolean;
  notified_at: string | null;
  created_at: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function AdminStockAlerts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "notified">("all");

  // Fetch all stock alerts with product info
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["admin-stock-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_alerts")
        .select(`
          *,
          products (id, name, slug)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as StockAlert[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("stock_alerts")
        .delete()
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alerte supprimée");
      queryClient.invalidateQueries({ queryKey: ["admin-stock-alerts"] });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  // Send alerts for a specific product
  const sendAlertsMutation = useMutation({
    mutationFn: async ({ productId, size }: { productId: string; size?: string | null }) => {
      const { data, error } = await supabase.functions.invoke("send-stock-alert", {
        body: { product_id: productId, size: size || undefined },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.sent || 0} email(s) envoyé(s)`);
      queryClient.invalidateQueries({ queryKey: ["admin-stock-alerts"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi des alertes");
    },
  });

  // Filter alerts
  const filteredAlerts = alerts?.filter((alert) => {
    const matchesSearch =
      alert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.products?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && alert.is_active && !alert.notified_at) ||
      (statusFilter === "notified" && alert.notified_at);

    return matchesSearch && matchesStatus;
  });

  // Group alerts by product
  const alertsByProduct = filteredAlerts?.reduce((acc, alert) => {
    const productId = alert.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        product: alert.products,
        alerts: [],
        activeCount: 0,
      };
    }
    acc[productId].alerts.push(alert);
    if (alert.is_active && !alert.notified_at) {
      acc[productId].activeCount++;
    }
    return acc;
  }, {} as Record<string, { product: StockAlert["products"]; alerts: StockAlert[]; activeCount: number }>);

  // Stats
  const totalAlerts = alerts?.length || 0;
  const activeAlerts = alerts?.filter((a) => a.is_active && !a.notified_at).length || 0;
  const notifiedAlerts = alerts?.filter((a) => a.notified_at).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Alertes Stock</h1>
          <p className="text-muted-foreground">
            Gérez les inscriptions aux alertes de retour en stock
          </p>
        </div>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Liste des alertes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <StockAlertStats />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total inscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{totalAlerts}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold">{activeAlerts}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Notifiés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{notifiedAlerts}</span>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par email ou produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">En attente</SelectItem>
            <SelectItem value="notified">Notifiés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts by product */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : alertsByProduct && Object.keys(alertsByProduct).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(alertsByProduct).map(([productId, { product, alerts, activeCount }]) => (
            <Card key={productId}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {product?.name || "Produit supprimé"}
                    </CardTitle>
                    <CardDescription>
                      {alerts.length} inscription(s) • {activeCount} en attente
                    </CardDescription>
                  </div>
                  {activeCount > 0 && (
                    <Button
                      size="sm"
                      onClick={() => sendAlertsMutation.mutate({ productId })}
                      disabled={sendAlertsMutation.isPending}
                    >
                      {sendAlertsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Envoyer les alertes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.email}</TableCell>
                        <TableCell>
                          {alert.size ? (
                            <Badge variant="outline">{alert.size}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Toutes</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(alert.created_at), "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {alert.notified_at ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Notifié le {format(new Date(alert.notified_at), "dd/MM", { locale: fr })}
                            </Badge>
                          ) : alert.is_active ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              <Mail className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'alerte ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action supprimera l'inscription de {alert.email} pour ce produit.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(alert.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune inscription aux alertes</p>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
