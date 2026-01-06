import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import OrderTimeline from '@/components/account/OrderTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Truck, 
  ExternalLink, 
  Calendar, 
  MapPin,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { statusConfig, OrderStatus, getStatusBadgeVariant } from '@/lib/orderStatus';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch order with items
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No order ID');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user
  });

  // Fetch order items
  const { data: items } = useQuery({
    queryKey: ['order-items', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!user
  });

  // Fetch status events
  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ['order-events', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('order_status_events')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!user
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_status_events',
          filter: `order_id=eq.${id}`
        },
        () => {
          refetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchEvents]);

  if (authLoading || orderLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (!order) {
    return (
      <Layout>
        <div className="container-main py-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
          <p className="text-muted-foreground mb-6">Cette commande n'existe pas ou vous n'y avez pas accès.</p>
          <Button asChild>
            <Link to="/mon-compte">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à mon compte
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const currentStatus = order.status as OrderStatus;
  const config = statusConfig[currentStatus] || statusConfig.order_received;
  const StatusIcon = config.icon;
  const shippingAddress = order.shipping_address as Record<string, string> | null;

  return (
    <>
      <Helmet>
        <title>Commande {order.order_number} | SerenCare</title>
        <meta name="description" content={`Suivez votre commande ${order.order_number} en temps réel`} />
      </Helmet>
      <Layout>
        <div className="container-main py-8 lg:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/mon-compte">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à mes commandes
              </Link>
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold">
                  Commande {order.order_number}
                </h1>
                <p className="text-muted-foreground">
                  Passée le {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
              <Badge 
                variant={getStatusBadgeVariant(currentStatus)}
                className={cn("flex items-center gap-2 text-base px-4 py-2", config.bgColor, config.color)}
              >
                <StatusIcon className="h-4 w-4" />
                {config.label}
              </Badge>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Timeline principal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Suivi de commande
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ETA si disponible */}
                  {order.eta_date && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Livraison estimée</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.eta_date), "EEEE d MMMM yyyy", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracking transporteur */}
                  {order.tracking_number && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{order.carrier || 'Transporteur'}</p>
                            <p className="text-sm font-mono text-muted-foreground">{order.tracking_number}</p>
                          </div>
                        </div>
                        {order.tracking_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                              Suivre le colis
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <OrderTimeline 
                    events={events || []} 
                    currentStatus={currentStatus}
                  />
                </CardContent>
              </Card>

              {/* Articles commandés */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          {item.product_size && (
                            <p className="text-sm text-muted-foreground">Taille: {item.product_size}</p>
                          )}
                          <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{Number(item.total_price).toFixed(2)} €</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{Number(order.subtotal).toFixed(2)} €</span>
                    </div>
                    {order.shipping_fee && Number(order.shipping_fee) > 0 && (
                      <div className="flex justify-between">
                        <span>Livraison</span>
                        <span>{Number(order.shipping_fee).toFixed(2)} €</span>
                      </div>
                    )}
                    {order.discount_amount && Number(order.discount_amount) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Réduction</span>
                        <span>-{Number(order.discount_amount).toFixed(2)} €</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>{Number(order.total).toFixed(2)} €</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Adresse de livraison */}
              {shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Adresse de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="font-medium">
                      {shippingAddress.first_name} {shippingAddress.last_name}
                    </p>
                    <p className="text-muted-foreground">{shippingAddress.address}</p>
                    {shippingAddress.address2 && (
                      <p className="text-muted-foreground">{shippingAddress.address2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {shippingAddress.postal_code} {shippingAddress.city}
                    </p>
                    {shippingAddress.country && (
                      <p className="text-muted-foreground">{shippingAddress.country}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Aide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HelpCircle className="h-4 w-4" />
                    Besoin d'aide ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Une question sur votre commande ? Notre équipe est là pour vous.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/contact">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Nous contacter
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/faq">
                      Consulter la FAQ
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  );
};

// Helper function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default OrderDetail;
