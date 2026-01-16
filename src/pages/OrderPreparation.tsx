import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calendar,
  Clock,
  XCircle,
  AlertTriangle,
  Save,
  Camera,
  MessageCircle,
  FileText,
} from 'lucide-react';
import PhotoUpload from '@/components/preparer/PhotoUpload';
import PreparerChatPanel from '@/components/preparer/PreparerChatPanel';
import DeliverySlip from '@/components/preparer/DeliverySlip';

interface PreparationStatus {
  order_item_id: string;
  is_available: boolean;
  prepared_quantity: number;
  notes: string | null;
  prepared_at: string | null;
  prepared_by: string | null;
}

const OrderPreparation = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const magicToken = searchParams.get('token');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState(magicToken || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isVerifyingToken, setIsVerifyingToken] = useState(!!magicToken);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [preparerName, setPreparerName] = useState('');
  
  // Local state for preparation items
  const [preparationItems, setPreparationItems] = useState<Record<string, {
    isAvailable: boolean;
    quantity: number;
    notes: string;
  }>>({});

  // Check if user is admin
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

  // Auto-verify magic link token on mount
  useEffect(() => {
    if (magicToken && orderId && !isAuthenticated && !isAdmin) {
      const verifyMagicLink = async () => {
        setIsVerifyingToken(true);
        try {
          const { data, error } = await supabase.functions.invoke('verify-preparer-access', {
            body: { orderId, token: magicToken },
          });
          if (error) throw error;
          if (data.valid) {
            setIsAuthenticated(true);
            setSessionToken(magicToken);
            toast.success('Accès autorisé');
          } else {
            setTokenError(data.error || 'Lien invalide');
          }
        } catch (err) {
          setTokenError(err instanceof Error ? err.message : 'Erreur de vérification');
        } finally {
          setIsVerifyingToken(false);
        }
      };
      verifyMagicLink();
    }
  }, [magicToken, orderId, isAdmin, isAuthenticated]);

  useEffect(() => {
    if (isAdmin === true) {
      setIsAuthenticated(true);
      setIsCheckingAdmin(false);
    } else if (isAdmin === false) {
      setIsCheckingAdmin(false);
    }
  }, [isAdmin]);

  // Fetch order data
  const { data: order, isLoading } = useQuery({
    queryKey: ['preparer-order', orderId, isAdmin, sessionToken],
    queryFn: async () => {
      if (isAdmin) {
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
        // Pass magic token for authentication when fetching order data
        const { data, error } = await supabase.functions.invoke('get-order-for-preparer', {
          body: { orderId, token: sessionToken },
        });
        if (error) throw error;
        return data;
      }
    },
    enabled: isAuthenticated && (isAdmin || !!sessionToken),
  });

  // Fetch existing preparation statuses
  const { data: existingPreparation } = useQuery({
    queryKey: ['preparation-status', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_item_preparation')
        .select('*')
        .eq('order_id', orderId);
      
      if (error) throw error;
      return data as PreparationStatus[];
    },
    enabled: isAuthenticated && !!orderId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isAuthenticated || !orderId) return;

    const channel = supabase
      .channel(`preparation-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_item_preparation',
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['preparation-status', orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, orderId, queryClient]);

  // Initialize preparation items from existing data
  useEffect(() => {
    if (order?.items && existingPreparation) {
      const initial: typeof preparationItems = {};
      order.items.forEach((item: any) => {
        const existing = existingPreparation.find(p => p.order_item_id === item.id);
        initial[item.id] = {
          isAvailable: existing?.is_available ?? true,
          quantity: existing?.prepared_quantity ?? item.quantity,
          notes: existing?.notes || '',
        };
      });
      setPreparationItems(initial);
    } else if (order?.items) {
      const initial: typeof preparationItems = {};
      order.items.forEach((item: any) => {
        initial[item.id] = {
          isAvailable: true,
          quantity: item.quantity,
          notes: '',
        };
      });
      setPreparationItems(initial);
    }
  }, [order?.items, existingPreparation]);

  // Update preparation status
  const updatePreparation = useMutation({
    mutationFn: async (itemId: string) => {
      const itemData = preparationItems[itemId];
      if (!itemData) return;

      const { data, error } = await supabase.functions.invoke('update-preparation-status', {
        body: {
          orderId,
          orderItemId: itemId,
          isAvailable: itemData.isAvailable,
          preparedQuantity: itemData.quantity,
          notes: itemData.notes,
          preparerName: preparerName || 'Préparateur',
          token: sessionToken || undefined,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preparation-status', orderId] });
      toast.success('Statut mis à jour');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur de mise à jour');
    },
  });

  const handleItemChange = (itemId: string, field: keyof typeof preparationItems[string], value: any) => {
    setPreparationItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  // Calculate urgency
  const getUrgency = () => {
    if (!order?.eta_date) return null;
    const daysUntil = differenceInDays(new Date(order.eta_date), new Date());
    if (daysUntil < 0) return { level: 'critical', text: 'En retard', color: 'text-red-600 bg-red-100' };
    if (daysUntil === 0) return { level: 'urgent', text: "Aujourd'hui", color: 'text-orange-600 bg-orange-100' };
    if (daysUntil === 1) return { level: 'soon', text: 'Demain', color: 'text-amber-600 bg-amber-100' };
    return { level: 'normal', text: `Dans ${daysUntil} jours`, color: 'text-green-600 bg-green-100' };
  };

  const urgency = getUrgency();

  const allItemsPrepared = order?.items?.every((item: any) => {
    const prep = existingPreparation?.find(p => p.order_item_id === item.id);
    return prep && prep.prepared_at;
  });

  const hasIssues = existingPreparation?.some(p => !p.is_available || p.prepared_quantity < (order?.items?.find((i: any) => i.id === p.order_item_id)?.quantity || 0));

  if (isCheckingAdmin && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while verifying magic link
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  // Show error if magic link failed
  if (tokenError) {
    return (
      <>
        <Helmet>
          <title>Lien invalide | SerenCare</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Lien invalide ou expiré</CardTitle>
                <CardDescription>
                  {tokenError}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Ce lien d'accès n'est plus valide. Veuillez contacter l'administrateur pour obtenir un nouveau lien.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Accès protégé</CardTitle>
                <CardDescription>
                  Cette page nécessite un lien d'accès sécurisé envoyé par email.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Veuillez utiliser le lien sécurisé que vous avez reçu par email pour accéder à cette commande.
                </p>
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
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : order ? (
            <>
              {/* Header with urgency */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/20 print:border-0 print:shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center print:hidden">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{order.order_number}</CardTitle>
                          <CardDescription>
                            Créée le {format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Estimated delivery date with urgency */}
                        {order.eta_date && (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${urgency?.color || 'bg-muted'}`}>
                            <Calendar className="h-5 w-5" />
                            <div>
                              <p className="text-xs font-medium">Livraison prévue</p>
                              <p className="font-bold">
                                {format(new Date(order.eta_date), 'dd/MM/yyyy', { locale: fr })}
                                {urgency && <span className="ml-2 text-sm">({urgency.text})</span>}
                              </p>
                            </div>
                          </div>
                        )}
                        
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

                    {/* Status summary */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {allItemsPrepared && !hasIssues && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Tous les articles préparés
                        </Badge>
                      )}
                      {hasIssues && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Problèmes signalés
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Customer & Shipping */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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

              {/* Preparer name (if not admin) */}
              {!isAdmin && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="preparerName">Votre nom (préparateur)</Label>
                        <Input
                          id="preparerName"
                          value={preparerName}
                          onChange={(e) => setPreparerName(e.target.value)}
                          placeholder="Ex: Jean D."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Items to prepare with status controls */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Articles à préparer</CardTitle>
                    <CardDescription>
                      Indiquez la disponibilité et les quantités préparées pour chaque article
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.items?.map((item: any, index: number) => {
                      const itemState = preparationItems[item.id] || { isAvailable: true, quantity: item.quantity, notes: '' };
                      const existingStatus = existingPreparation?.find(p => p.order_item_id === item.id);
                      const isPrepared = !!existingStatus?.prepared_at;
                      const hasQuantityIssue = itemState.quantity < item.quantity;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className={`p-4 border rounded-xl transition-all ${
                            !itemState.isAvailable 
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                              : hasQuantityIssue
                              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                              : isPrepared
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex flex-col gap-4">
                            {/* Product info */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-medium text-lg">{item.product_name}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {item.product_size && (
                                    <Badge variant="secondary">Taille: {item.product_size}</Badge>
                                  )}
                                  <Badge variant="outline" className="font-bold">
                                    Commandé: {item.quantity}
                                  </Badge>
                                </div>
                              </div>
                              {isPrepared && (
                                <div className="text-right text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    Préparé
                                  </div>
                                  {existingStatus.prepared_by && (
                                    <p>par {existingStatus.prepared_by}</p>
                                  )}
                                  {existingStatus.prepared_at && (
                                    <p className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {format(new Date(existingStatus.prepared_at), 'HH:mm', { locale: fr })}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            <Separator />

                            {/* Availability toggle */}
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`available-${item.id}`} className="flex items-center gap-2 cursor-pointer">
                                {itemState.isAvailable ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                Produit disponible
                              </Label>
                              <Switch
                                id={`available-${item.id}`}
                                checked={itemState.isAvailable}
                                onCheckedChange={(checked) => handleItemChange(item.id, 'isAvailable', checked)}
                              />
                            </div>

                            {/* Quantity prepared */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`qty-${item.id}`}>Quantité préparée</Label>
                                <Input
                                  id={`qty-${item.id}`}
                                  type="number"
                                  min={0}
                                  max={item.quantity}
                                  value={itemState.quantity}
                                  onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                  className={hasQuantityIssue ? 'border-amber-500' : ''}
                                />
                                {hasQuantityIssue && (
                                  <p className="text-xs text-amber-600 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Quantité partielle
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`notes-${item.id}`}>Notes (optionnel)</Label>
                                <Textarea
                                  id={`notes-${item.id}`}
                                  value={itemState.notes}
                                  onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                                  placeholder="Problème de stock, lot..."
                                  className="h-10 resize-none"
                                />
                              </div>
                            </div>

                            {/* Save button */}
                            <Button
                              onClick={() => updatePreparation.mutate(item.id)}
                              disabled={updatePreparation.isPending}
                              variant={isPrepared ? 'outline' : 'default'}
                              className="w-full"
                            >
                              {updatePreparation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Save className="h-4 w-4 mr-2" />
                              )}
                              {isPrepared ? 'Mettre à jour' : 'Valider cet article'}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Additional Tools: Photos, Chat, Delivery Slip */}
              {!isAdmin && sessionToken && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Outils</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="photos" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="photos" className="gap-2">
                            <Camera className="h-4 w-4" />
                            Photos
                          </TabsTrigger>
                          <TabsTrigger value="chat" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Chat
                          </TabsTrigger>
                          <TabsTrigger value="slip" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Bon
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="photos" className="mt-4">
                          <PhotoUpload
                            orderId={orderId!}
                            token={sessionToken}
                            preparerName={preparerName}
                            onUploadComplete={() => toast.success('Photo ajoutée')}
                          />
                        </TabsContent>
                        <TabsContent value="chat" className="mt-4 h-80">
                          <PreparerChatPanel
                            orderId={orderId!}
                            token={sessionToken}
                            preparerName={preparerName || 'Préparateur'}
                          />
                        </TabsContent>
                        <TabsContent value="slip" className="mt-4">
                          <DeliverySlip
                            order={order}
                            items={order.items || []}
                            shippingAddress={order.shipping_address}
                            confirmationUrl={`https://serencare.be/confirmation-livraison?token=${orderId}`}
                            preparerName={preparerName}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Notes */}
              {order.notes && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-800">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <AlertCircle className="h-5 w-5" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-amber-800 dark:text-amber-200">{order.notes}</p>
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
                {allItemsPrepared && !hasIssues ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Tous les articles sont prêts !
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {existingPreparation?.filter(p => p.prepared_at).length || 0} / {order.items?.length || 0} articles préparés
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
