import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import OrderStatusTimeline from '@/components/account/OrderStatusTimeline';
import SubscriptionManager from '@/components/account/SubscriptionManager';
import { 
  User, 
  Package, 
  RefreshCw,
  Loader2, 
  ShoppingBag,
  Edit,
  Save,
  X,
  RotateCcw,
  CreditCard,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const Account = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { addItem, openCart } = useCart();
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    postal_code: '',
    city: ''
  });

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch orders with items
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          return { ...order, items: items || [] };
        })
      );
      
      return ordersWithItems;
    },
    enabled: !!user
  });

  // Fetch subscriptions with items
  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['user-subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch items for each subscription
      const subsWithItems = await Promise.all(
        (subs || []).map(async (sub) => {
          const { data: items } = await supabase
            .from('subscription_items')
            .select('*, products(*)')
            .eq('subscription_id', sub.id);
          return { ...sub, items: items || [] };
        })
      );
      
      return subsWithItems;
    },
    enabled: !!user
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil mis à jour');
      setEditingProfile(false);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });


  // Initialize form when profile loads
  if (profile && !editingProfile && profileForm.first_name !== (profile.first_name || '')) {
    setProfileForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      address_line1: profile.address_line1 || '',
      address_line2: profile.address_line2 || '',
      postal_code: profile.postal_code || '',
      city: profile.city || ''
    });
  }

  if (authLoading) {
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

  const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    order_received: { label: 'Reçue', variant: 'outline' },
    payment_confirmed: { label: 'Confirmée', variant: 'default' },
    processing: { label: 'En traitement', variant: 'secondary' },
    preparing: { label: 'En préparation', variant: 'secondary' },
    packed: { label: 'Prête', variant: 'secondary' },
    shipped: { label: 'Expédiée', variant: 'secondary' },
    out_for_delivery: { label: 'En livraison', variant: 'secondary' },
    delivered: { label: 'Livrée', variant: 'default' },
    closed: { label: 'Clôturée', variant: 'default' },
    on_hold: { label: 'En attente', variant: 'outline' },
    delayed: { label: 'Retardée', variant: 'outline' },
    partially_shipped: { label: 'Partiellement expédiée', variant: 'secondary' },
    cancelled: { label: 'Annulée', variant: 'destructive' },
    returned: { label: 'Retournée', variant: 'destructive' },
    refunded: { label: 'Remboursée', variant: 'destructive' },
    active: { label: 'Actif', variant: 'default' },
    paused: { label: 'En pause', variant: 'outline' }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileForm);
  };

  return (
    <>
      <Helmet>
        <title>Mon compte | SerenCare</title>
        <meta name="description" content="Gérez votre compte, vos commandes et vos abonnements SerenCare." />
      </Helmet>
      <Layout>
        <div className="container-main py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-display font-bold mb-2">Mon compte</h1>
            <p className="text-muted-foreground mb-8">{user.email}</p>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Commandes</span>
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Abonnements</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>Gérez vos coordonnées et adresse de livraison</CardDescription>
                    </div>
                    {!editingProfile && (
                      <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {profileLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : editingProfile ? (
                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Prénom</Label>
                            <Input 
                              value={profileForm.first_name}
                              onChange={(e) => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input 
                              value={profileForm.last_name}
                              onChange={(e) => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Téléphone</Label>
                          <Input 
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Adresse</Label>
                          <Input 
                            value={profileForm.address_line1}
                            onChange={(e) => setProfileForm(p => ({ ...p, address_line1: e.target.value }))}
                            placeholder="Numéro et rue"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input 
                            value={profileForm.address_line2}
                            onChange={(e) => setProfileForm(p => ({ ...p, address_line2: e.target.value }))}
                            placeholder="Complément (optionnel)"
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Code postal</Label>
                            <Input 
                              value={profileForm.postal_code}
                              onChange={(e) => setProfileForm(p => ({ ...p, postal_code: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ville</Label>
                            <Input 
                              value={profileForm.city}
                              onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button type="submit" disabled={updateProfile.isPending}>
                            {updateProfile.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Enregistrer
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setEditingProfile(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Prénom</p>
                            <p className="font-medium">{profile?.first_name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Nom</p>
                            <p className="font-medium">{profile?.last_name || '-'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <p className="font-medium">{profile?.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Adresse de livraison</p>
                          <p className="font-medium">
                            {profile?.address_line1 ? (
                              <>
                                {profile.address_line1}
                                {profile.address_line2 && <>, {profile.address_line2}</>}
                                <br />
                                {profile.postal_code} {profile.city}
                              </>
                            ) : '-'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Historique des commandes</CardTitle>
                    <CardDescription>Retrouvez toutes vos commandes passées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : orders?.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Aucune commande pour le moment</p>
                        <Button asChild>
                          <Link to="/boutique">Découvrir nos produits</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders?.map((order) => (
                          <Collapsible key={order.id}>
                            <div className="p-4 border rounded-xl space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{order.order_number}</span>
                                    <Badge variant={statusLabels[order.status]?.variant || 'outline'}>
                                      {statusLabels[order.status]?.label || order.status}
                                    </Badge>
                                    {order.is_subscription_order && (
                                      <Badge variant="secondary">
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Abo
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="font-bold text-lg">{Number(order.total).toFixed(2)} €</p>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </CollapsibleTrigger>
                                </div>
                              </div>
                              
                              <CollapsibleContent className="space-y-4">
                                {/* Order Status Timeline */}
                                <OrderStatusTimeline 
                                  status={order.status} 
                                  createdAt={order.created_at}
                                  className="border-t pt-4"
                                />
                                
                                {/* Order items */}
                                {order.items && order.items.length > 0 && (
                                  <div className="pt-3 border-t space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Articles</h4>
                                    {order.items.map((item: any) => (
                                      <div key={item.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground">×{item.quantity}</span>
                                          <span>{item.product_name}</span>
                                          {item.product_size && (
                                            <span className="text-muted-foreground">({item.product_size})</span>
                                          )}
                                        </div>
                                        <span className="font-medium">{Number(item.total_price).toFixed(2)} €</span>
                                      </div>
                                    ))}
                                    {order.shipping_fee && Number(order.shipping_fee) > 0 && (
                                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Frais de livraison</span>
                                        <span>{Number(order.shipping_fee).toFixed(2)} €</span>
                                      </div>
                                    )}
                                    {order.discount_amount && Number(order.discount_amount) > 0 && (
                                      <div className="flex items-center justify-between text-sm text-green-600">
                                        <span>Réduction</span>
                                        <span>-{Number(order.discount_amount).toFixed(2)} €</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Action buttons */}
                                <div className="pt-3 border-t flex flex-wrap gap-2">
                                  <Button
                                    asChild
                                    size="sm"
                                  >
                                    <Link to={`/commande/${order.id}`}>
                                      <Package className="h-4 w-4 mr-1" />
                                      Voir le suivi
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      if (!order.items || order.items.length === 0) {
                                        toast.error('Cette commande ne contient aucun article');
                                        return;
                                      }
                                      
                                      // Fetch product details for each item
                                      for (const item of order.items) {
                                        if (item.product_id) {
                                          const { data: product } = await supabase
                                            .from('products')
                                            .select('*, product_images(*)')
                                            .eq('id', item.product_id)
                                            .single();
                                          
                                          if (product) {
                                            const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0];
                                            addItem({
                                              productId: product.id,
                                              productName: product.name,
                                              productImage: primaryImage?.image_url,
                                              size: item.product_size || undefined,
                                              quantity: item.quantity,
                                              unitPrice: Number(item.unit_price),
                                              isSubscription: false,
                                              subscriptionPrice: product.subscription_price ? Number(product.subscription_price) : undefined
                                            });
                                          }
                                        }
                                      }
                                      
                                      toast.success('Articles ajoutés au panier');
                                      openCart();
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Re-commander
                                  </Button>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions">
                {subsLoading ? (
                  <Card>
                    <CardContent className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </CardContent>
                  </Card>
                ) : subscriptions?.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Aucun abonnement actif</p>
                      <p className="text-sm text-muted-foreground mb-6">
                        Ajoutez des produits en abonnement pour économiser 10% et recevoir vos livraisons automatiquement.
                      </p>
                      <Button asChild>
                        <Link to="/boutique">Découvrir nos produits</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {subscriptions?.map((sub) => (
                      <SubscriptionManager 
                        key={sub.id} 
                        subscription={sub as any} 
                        userPreferences={{
                          incontinence_level: profile?.incontinence_level || undefined,
                          gender: profile?.gender || undefined,
                          usage_time: profile?.usage_time || undefined,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Manage Subscription Button */}
                {subscriptions && subscriptions.length > 0 && subscriptions.some(s => s.status === 'active') && (
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isOpeningPortal}
                      onClick={async () => {
                        setIsOpeningPortal(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('customer-portal');
                          if (error) throw error;
                          if (data?.url) {
                            window.open(data.url, '_blank');
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error('Impossible d\'ouvrir le portail de gestion');
                        } finally {
                          setIsOpeningPortal(false);
                        }
                      }}
                    >
                      {isOpeningPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Gérer mes paiements
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Reassurance */}
                <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground text-center">
                    <RefreshCw className="h-4 w-4 inline mr-2" />
                    Sans engagement. Modifiez, mettez en pause ou annulez votre abonnement à tout moment.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Account;
