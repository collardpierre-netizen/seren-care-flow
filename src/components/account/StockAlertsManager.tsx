import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Bell, Trash2, Loader2, CheckCircle2, Mail, Package, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    stock_status: string;
  } | null;
}

export default function StockAlertsManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's stock alerts
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["user-stock-alerts", user?.id],
    queryFn: async () => {
      if (!user?.email) return [];
      
      // Get user email from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      const email = profile?.email || user.email;

      const { data, error } = await supabase
        .from("stock_alerts")
        .select(`
          *,
          products (id, name, slug, stock_status)
        `)
        .eq("email", email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as StockAlert[];
    },
    enabled: !!user,
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
      queryClient.invalidateQueries({ queryKey: ["user-stock-alerts"] });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Mes alertes stock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts?.filter((a) => a.is_active && !a.notified_at) || [];
  const notifiedAlerts = alerts?.filter((a) => a.notified_at) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Mes alertes stock
        </CardTitle>
        <CardDescription>
          Recevez un email dès qu'un produit est de nouveau disponible
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Aucune alerte configurée
            </p>
            <p className="text-sm text-muted-foreground">
              Visitez nos produits et inscrivez-vous aux alertes pour être notifié dès leur retour en stock.
            </p>
            <Button asChild className="mt-4">
              <Link to="/boutique">Voir nos produits</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active alerts */}
            {activeAlerts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-500" />
                  En attente ({activeAlerts.length})
                </h4>
                <div className="space-y-2">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Link
                            to={`/produit/${alert.products?.slug}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {alert.products?.name || "Produit supprimé"}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {alert.size && (
                              <Badge variant="outline" className="text-xs">
                                Taille {alert.size}
                              </Badge>
                            )}
                            <span>
                              Inscrit le {format(new Date(alert.created_at), "dd MMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
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
                              Vous ne serez plus notifié quand ce produit sera de nouveau en stock.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(alert.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Supprimer"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notified alerts */}
            {notifiedAlerts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Notifications envoyées ({notifiedAlerts.length})
                </h4>
                <div className="space-y-2">
                  {notifiedAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <Link
                            to={`/produit/${alert.products?.slug}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {alert.products?.name || "Produit supprimé"}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {alert.size && (
                              <Badge variant="outline" className="text-xs">
                                Taille {alert.size}
                              </Badge>
                            )}
                            <span>
                              Notifié le {format(new Date(alert.notified_at!), "dd MMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {alert.products?.stock_status === "in_stock" && (
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/produit/${alert.products?.slug}`}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Voir
                          </Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
