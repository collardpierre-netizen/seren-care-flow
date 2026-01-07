import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Package,
  Lock,
  Loader2,
  CheckCircle,
  MapPin,
  User,
  Phone,
  AlertCircle,
  Printer,
} from 'lucide-react';

const OrderPreparation = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Check if user is admin - bypass password if so
  const { data: isAdmin } = useQuery({
    queryKey: ['user-is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'manager']);
      return (data?.length || 0) > 0;
    },
    enabled: !!user,
  });

  // Auto-authenticate admin users
  useEffect(() => {
    if (isAdmin === true) {
      setIsAuthenticated(true);
      setIsCheckingAdmin(false);
    } else if (isAdmin === false) {
      setIsCheckingAdmin(false);
    }
  }, [isAdmin]);

  const verifyAccess = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('verify-preparer-access', {
        body: { orderId, password },
      });
      if (error) throw error;
      if (!data.valid) throw new Error('Mot de passe incorrect');
      return data;
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast.success('Accès autorisé');
    },
    onError: (error) => {
      toast.error(error.message || 'Accès refusé');
    },
  });

  // Direct query for admin access (no edge function needed)
  const { data: order, isLoading } = useQuery({
    queryKey: ['preparer-order', orderId, isAdmin],
    queryFn: async () => {
      if (isAdmin) {
        // Admin direct access
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();
        
        if (orderError) throw orderError;
        
        const shippingAddress = orderData.shipping_address as any;
        return {
          ...orderData,
          customer_name: shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName}` : 'Client',
          customer_phone: shippingAddress?.phone,
          items: orderData.order_items,
          shipping_address: shippingAddress ? {
            address_line1: shippingAddress.address,
            address_line2: shippingAddress.address2,
            postal_code: shippingAddress.postalCode,
            city: shippingAddress.city,
          } : null,
        };
      } else {
        // Preparer access via edge function
        const { data, error } = await supabase.functions.invoke('get-order-for-preparer', {
          body: { orderId },
        });
        if (error) throw error;
        return data;
      }
    },
    enabled: isAuthenticated,
  });

  const handleToggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const allItemsChecked = order?.items?.every((item: any) => checkedItems[item.id]);

  // Show loading while checking admin status
  if (isCheckingAdmin && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Préparation commande | SerenCare</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Accès protégé</CardTitle>
                <CardDescription>
                  Entrez le mot de passe pour accéder aux détails de la commande
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    verifyAccess.mutate();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez le mot de passe"
                      autoFocus
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={verifyAccess.isPending || !password}
                  >
                    {verifyAccess.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Accéder à la commande
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Préparation {order?.order_number || 'commande'} | SerenCare</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : order ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary/20 print:border-0 print:shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center print:hidden">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{order.order_number}</CardTitle>
                          <CardDescription>
                            {format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          {order.status === 'paid' || order.status === 'payment_confirmed' ? 'À préparer' : order.status}
                        </Badge>
                        {isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.print()}
                            className="print:hidden"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Customer & Shipping */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        Destinataire
                      </div>
                      <p className="font-medium">{order.customer_name}</p>
                      {order.customer_phone && (
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {order.customer_phone}
                        </p>
                      )}
                    </div>
                    {order.shipping_address && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          Adresse
                        </div>
                        <div className="font-medium">
                          <p>{order.shipping_address.address_line1}</p>
                          {order.shipping_address.address_line2 && (
                            <p>{order.shipping_address.address_line2}</p>
                          )}
                          <p>{order.shipping_address.postal_code} {order.shipping_address.city}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Items to prepare */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Articles à préparer</CardTitle>
                    <CardDescription>
                      Cochez chaque article une fois ajouté au colis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.items?.map((item: any, index: number) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className={`p-4 border rounded-xl transition-all ${
                          checkedItems[item.id] 
                            ? 'bg-primary/5 border-primary/30' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            id={item.id}
                            checked={checkedItems[item.id] || false}
                            onCheckedChange={() => handleToggleItem(item.id)}
                            className="mt-1 h-6 w-6"
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={item.id}
                              className={`font-medium cursor-pointer block ${
                                checkedItems[item.id] ? 'line-through text-muted-foreground' : ''
                              }`}
                            >
                              {item.product_name}
                            </label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.product_size && (
                                <Badge variant="secondary">Taille: {item.product_size}</Badge>
                              )}
                              <Badge variant="outline" className="font-bold">
                                × {item.quantity}
                              </Badge>
                            </div>
                          </div>
                          {checkedItems[item.id] && (
                            <CheckCircle className="h-6 w-6 text-primary" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notes */}
              {order.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                        <AlertCircle className="h-5 w-5" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-amber-800">{order.notes}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Completion status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center py-4"
              >
                {allItemsChecked ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full text-primary font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Tous les articles sont prêts !
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {Object.values(checkedItems).filter(Boolean).length} / {order.items?.length || 0} articles préparés
                  </p>
                )}
              </motion.div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Commande non trouvée</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderPreparation;
