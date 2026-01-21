import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionCart } from '@/hooks/useSubscriptionCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  ExternalLink,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SubscriptionProgressBar from '@/components/subscription/SubscriptionProgressBar';
import ReassuranceMessages from '@/components/shop/ReassuranceMessages';

const Subscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const {
    items,
    totalCents,
    totalFormatted,
    isValid,
    minimumCents,
    isLoading,
    removeItem,
    updateQuantity,
    checkout,
    isCheckingOut,
    refetch,
  } = useSubscriptionCart();

  const [isOpeningPortal, setIsOpeningPortal] = React.useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<string | null>(null);

  // Check for cancelled checkout
  useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      toast.info('Checkout annulé');
    }
  }, [searchParams]);

  // Check subscription status
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('is_member_active, subscription_status')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setSubscriptionStatus(data.is_member_active ? 'active' : data.subscription_status);
      }
    };
    
    checkStatus();
  }, [user]);

  const handleOpenPortal = async () => {
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
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Helmet>
          <title>Abonnement mensuel | SerenCare</title>
          <meta name="description" content="Recevez vos protections pour incontinence automatiquement chaque mois avec notre abonnement flexible. Sans engagement, livraison gratuite, -10% sur vos produits." />
        </Helmet>
        <div className="container py-12">
          {/* Hero section for logged-out users */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4">Sans engagement</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              L'abonnement mensuel qui simplifie votre quotidien
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Recevez vos produits automatiquement chaque mois. Plus de rupture de stock, plus de courses de dernière minute.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Livraison automatique</h3>
              <p className="text-sm text-muted-foreground">Vos produits livrés chaque mois, sans rien faire</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">-10% sur vos produits</h3>
              <p className="text-sm text-muted-foreground">Prix réduits exclusifs aux abonnés</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Flexible et sans risque</h3>
              <p className="text-sm text-muted-foreground">Modifiez ou annulez à tout moment</p>
            </Card>
          </div>

          {/* CTA Card */}
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Commencez dès maintenant</CardTitle>
              <CardDescription>
                Créez un compte gratuit pour configurer votre abonnement personnalisé.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3">
              <Button onClick={() => navigate('/inscription')} className="w-full" size="lg">
                Créer un compte
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Déjà client ?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/connexion')}>
                  Se connecter
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  const minimumFormatted = `${(minimumCents / 100).toFixed(2)}€`;
  const remainingCents = minimumCents - totalCents;
  const remainingFormatted = `${(remainingCents / 100).toFixed(2)}€`;

  return (
    <Layout>
      <Helmet>
        <title>Mon Abonnement | SerenCare</title>
        <meta name="description" content="Gérez votre abonnement mensuel SerenCare. Livraison automatique de vos produits d'incontinence chaque mois." />
      </Helmet>

      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Mon Abonnement</h1>
              <p className="text-muted-foreground">Recevez vos produits automatiquement chaque mois</p>
            </div>
          </div>

          {/* Active subscription banner */}
          {subscriptionStatus === 'active' && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <span>Votre abonnement est actif. Vos produits seront livrés automatiquement.</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenPortal}
                    disabled={isOpeningPortal}
                  >
                    {isOpeningPortal ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    Gérer mon abonnement
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Panier Abonnement
                  </CardTitle>
                  <CardDescription>
                    Ajoutez des produits depuis la boutique pour créer votre abonnement mensuel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Votre panier abonnement est vide</p>
                      <Button 
                        variant="link" 
                        onClick={() => navigate('/boutique')}
                        className="mt-2"
                      >
                        Parcourir la boutique
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => {
                        const primaryImage = item.product?.product_images?.find(img => img.is_primary)?.image_url 
                          || item.product?.product_images?.[0]?.image_url;
                        
                        return (
                          <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                            {primaryImage && (
                              <img 
                                src={primaryImage} 
                                alt={item.product?.name} 
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{item.product?.name}</h4>
                              {item.product_size && (
                                <Badge variant="secondary" className="mt-1">
                                  {item.product_size}
                                </Badge>
                              )}
                              <p className="text-sm text-muted-foreground mt-1">
                                {(item.unit_price_cents / 100).toFixed(2)}€/mois
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.product_size || undefined)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.product_size || undefined)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeItem(item.product_id, item.product_size || undefined)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total mensuel TTC</span>
                    <span>{totalFormatted}</span>
                  </div>
                  
                  <Separator />
                  
                  {!isValid && items.length > 0 && (
                    <SubscriptionProgressBar
                      currentAmount={totalCents / 100}
                      minimumAmount={minimumCents / 100}
                    />
                  )}

                  {isValid && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Votre panier atteint le minimum requis !
                      </AlertDescription>
                    </Alert>
                  )}

                  <Separator />
                  
                  <ReassuranceMessages variant="compact" />
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!isValid || items.length === 0 || isCheckingOut || subscriptionStatus === 'active'}
                    onClick={checkout}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Redirection...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Activer l'abonnement
                      </>
                    )}
                  </Button>
                  
                  {subscriptionStatus === 'active' && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleOpenPortal}
                      disabled={isOpeningPortal}
                    >
                      {isOpeningPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Gérer mon abonnement
                    </Button>
                  )}
                </CardFooter>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground text-center">
                    Paiement sécurisé par Stripe. 
                    Vous serez débité automatiquement chaque mois. 
                    Vous pouvez annuler à tout moment depuis le portail client.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
