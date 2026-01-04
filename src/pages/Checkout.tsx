import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useStoreSettings } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CreditCard, Truck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkout = () => {
  const { items, getSubtotal, getSubscriptionSavings } = useCart();
  const { data: settings } = useStoreSettings();
  
  const subtotal = getSubtotal();
  const savings = getSubscriptionSavings();
  const freeShippingThreshold = settings?.shipping?.free_shipping_threshold || 49;
  const shippingFee = settings?.shipping?.standard_shipping_fee || 4.90;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shippingCost;

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
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Récapitulatif ({items.length} article{items.length > 1 ? 's' : ''})</CardTitle>
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
                        {item.size && <p className="text-sm text-muted-foreground">Taille: {item.size}</p>}
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-8 bg-muted/30 rounded-xl text-center">
                    <p className="text-muted-foreground mb-4">
                      Le paiement sécurisé via Stripe sera bientôt disponible.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      En attendant, vous pouvez nous contacter pour passer commande.
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

                  <Button className="w-full h-12" size="lg" disabled>
                    Payer {total.toFixed(2)} €
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
