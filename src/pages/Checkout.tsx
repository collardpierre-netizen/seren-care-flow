import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useStoreSettings } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CreditCard, Truck, RefreshCw, Tag, Check, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SizeGuideDialog } from '@/components/shop/SizeGuideDialog';
import { CartSizeSelector } from '@/components/shop/CartSizeSelector';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
}

const Checkout = () => {
  const { items, getSubtotal, getSubscriptionSavings, updateSize, clearCart } = useCart();
  const { data: settings } = useStoreSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Belgique',
  });
  
  const subtotal = getSubtotal();
  const savings = getSubscriptionSavings();
  const freeShippingThreshold = settings?.shipping?.free_shipping_threshold || 49;
  const shippingFee = settings?.shipping?.standard_shipping_fee || 4.90;
  const minimumOrderAmount = settings?.checkout?.minimum_order_amount || 25;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shippingCost;
  const isMinimumMet = subtotal >= minimumOrderAmount;
  const remainingForMinimum = Math.max(0, minimumOrderAmount - subtotal);

  const isFormValid = () => {
    return (
      shippingAddress.firstName.trim() &&
      shippingAddress.lastName.trim() &&
      shippingAddress.email.trim() &&
      shippingAddress.phone.trim() &&
      shippingAddress.address.trim() &&
      shippingAddress.postalCode.trim() &&
      shippingAddress.city.trim()
    );
  };

  const validateReferralCode = async () => {
    if (!referralCode.trim()) return;
    
    setIsValidating(true);
    try {
      const { data, error } = await (supabase.from('prescribers' as any) as any)
        .select('id, name')
        .eq('referral_code', referralCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (data) {
        setReferralValid(true);
        toast.success(`Code valide ! Recommandé par ${data.name}`);
      } else {
        setReferralValid(false);
        toast.error('Code parrainage invalide');
      }
    } catch {
      setReferralValid(false);
      toast.error('Code parrainage invalide');
    } finally {
      setIsValidating(false);
    }
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SC${year}${month}${day}-${random}`;
  };

  const handleSubmitOrder = async () => {
    if (!isFormValid() || !isMinimumMet) return;
    
    setIsSubmitting(true);
    
    try {
      const newOrderNumber = generateOrderNumber();
      const hasSubscription = items.some(item => item.isSubscription);
      
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: newOrderNumber,
          user_id: user?.id || null,
          subtotal: subtotal,
          shipping_fee: shippingCost,
          total: total,
          status: 'pending',
          referral_code: referralValid ? referralCode.toUpperCase() : null,
          is_subscription_order: hasSubscription,
          shipping_address: shippingAddress as any,
          billing_address: shippingAddress as any,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        product_size: item.size || null,
        quantity: item.quantity,
        unit_price: item.isSubscription && item.subscriptionPrice ? item.subscriptionPrice : item.unitPrice,
        total_price: (item.isSubscription && item.subscriptionPrice ? item.subscriptionPrice : item.unitPrice) * item.quantity,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Send confirmation email
      try {
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            type: 'order',
            to: shippingAddress.email,
            data: {
              orderNumber: newOrderNumber,
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              total: total.toFixed(2),
              itemsCount: items.length,
            }
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
      
      // Clear cart and show success
      clearCart();
      setOrderNumber(newOrderNumber);
      setOrderComplete(true);
      
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order complete view
  if (orderComplete) {
    return (
      <>
        <Helmet>
          <title>Commande confirmée | SerenCare</title>
        </Helmet>
        <Layout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-secondary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2 text-center">Commande confirmée !</h1>
            <p className="text-muted-foreground mb-2 text-center">
              Merci pour votre commande
            </p>
            <p className="text-lg font-mono font-bold text-primary mb-6">{orderNumber}</p>
            <div className="bg-card border border-border rounded-xl p-6 max-w-md text-center mb-8">
              <p className="text-sm text-muted-foreground mb-4">
                Un email de confirmation a été envoyé à <strong>{shippingAddress.email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Notre équipe vous contactera sous 24h pour finaliser le paiement et organiser la livraison.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline">
                <Link to="/boutique">Continuer mes achats</Link>
              </Button>
              <Button asChild>
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Panier vide | SerenCare</title>
        </Helmet>
        <Layout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-display font-bold mb-2">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-6">Découvrez nos produits et commencez vos achats</p>
            <Button asChild>
              <Link to="/boutique">Voir la boutique</Link>
            </Button>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Finaliser la commande | SerenCare</title>
      </Helmet>
      <Layout>
        <div className="container-main py-8 md:py-12">
          <Link to="/boutique" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>

          <h1 className="text-3xl font-display font-bold mb-8">Finaliser la commande</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary & Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Récapitulatif ({items.length} article{items.length > 1 ? 's' : ''})</CardTitle>
                  {items.some(item => item.size) && <SizeGuideDialog />}
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div 
                      key={`${item.productId}-${item.size}-${item.isSubscription}`}
                      className="flex gap-4 py-4 border-b border-border last:border-0"
                    >
                      {item.productImage && (
                        <div className="w-20 h-20 bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        {item.size && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Taille:</span>
                            <CartSizeSelector 
                              currentSize={item.size}
                              onSizeChange={(newSize) => {
                                updateSize(item.productId, item.size, newSize, item.isSubscription);
                                toast.success('Taille modifiée');
                              }}
                            />
                          </div>
                        )}
                        {item.isSubscription && (
                          <div className="flex items-center gap-1 text-sm text-secondary mt-1">
                            <RefreshCw className="h-3 w-3" />
                            Abonnement mensuel
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">Qté: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {((item.isSubscription && item.subscriptionPrice ? item.subscriptionPrice : item.unitPrice) * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="jean@exemple.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+32 470 00 00 00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rue de l'Exemple 123"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Bruxelles"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Code parrainage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Entrez votre code"
                        value={referralCode}
                        onChange={(e) => {
                          setReferralCode(e.target.value.toUpperCase());
                          setReferralValid(null);
                        }}
                        className={cn(
                          referralValid === true && "border-secondary",
                          referralValid === false && "border-destructive"
                        )}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={validateReferralCode}
                      disabled={isValidating || !referralCode.trim()}
                    >
                      {referralValid === true ? (
                        <Check className="h-4 w-4 text-secondary" />
                      ) : (
                        'Valider'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Si vous avez été recommandé par un professionnel de santé
                  </p>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-muted/30 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      Après validation de votre commande, notre équipe vous contactera pour organiser le paiement sécurisé 
                      (carte bancaire, Bancontact ou virement).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Total */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {savings > 0 && (
                    <div className="flex justify-between text-sm text-secondary">
                      <span>Économies abonnement</span>
                      <span className="font-medium">-{savings.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Livraison
                    </span>
                    <span className={cn(isFreeShipping && "text-secondary font-medium")}>
                      {isFreeShipping ? 'Gratuite' : `${shippingCost.toFixed(2)} €`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-4 border-t border-border">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>

                  {/* Minimum order warning */}
                  {!isMinimumMet && (
                    <div className="p-3 bg-destructive/10 rounded-lg text-sm">
                      <p className="text-destructive font-medium">
                        Commande minimum: {minimumOrderAmount.toFixed(2)} €
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Ajoutez encore {remainingForMinimum.toFixed(2)} € pour valider votre commande.
                      </p>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full bg-destructive transition-all"
                          style={{ width: `${Math.min(100, (subtotal / minimumOrderAmount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full h-12" 
                    size="lg" 
                    disabled={!isMinimumMet || !isFormValid() || isSubmitting}
                    onClick={handleSubmitOrder}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      `Confirmer la commande • ${total.toFixed(2)} €`
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Paiement sécurisé • Livraison en 48-72h
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Checkout;