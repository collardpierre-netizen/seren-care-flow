import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useStoreSettings } from '@/hooks/useProducts';
import { useEstimatedDelivery } from '@/hooks/useEstimatedDelivery';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Truck, RefreshCw, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SizeGuideDialog } from './SizeGuideDialog';
import { CartSizeSelector } from './CartSizeSelector';
import { toast } from 'sonner';

const CartDrawer: React.FC = () => {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    updateSize,
    getSubtotal, 
    getSubscriptionSavings,
    getItemCount 
  } = useCart();
  
  const { data: settings } = useStoreSettings();
  const { formattedDate: estimatedDeliveryDate } = useEstimatedDelivery();
  
  const subtotal = getSubtotal();
  const savings = getSubscriptionSavings();
  const freeShippingThreshold = settings?.shipping?.free_shipping_threshold || 49;
  const shippingFee = settings?.shipping?.standard_shipping_fee || 4.90;
  const minimumOrderAmount = settings?.checkout?.minimum_order_amount || 25;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shippingCost;
  const isMinimumMet = subtotal >= minimumOrderAmount;
  const remainingForMinimum = Math.max(0, minimumOrderAmount - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Votre panier ({getItemCount()})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Votre panier est vide</p>
            <p className="text-muted-foreground mb-6">Découvrez nos produits et commencez vos achats</p>
            <Button onClick={closeCart} asChild>
              <Link to="/boutique">Voir la boutique</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="p-4 bg-muted/50 rounded-xl space-y-2 my-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Plus que <strong>{remainingForFreeShipping.toFixed(2)} €</strong> pour la livraison gratuite
                  </span>
                ) : (
                  <span className="text-secondary font-medium">✓ Livraison gratuite !</span>
                )}
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary transition-all"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item, index) => (
                <div 
                  key={`${item.productId}-${item.size}-${item.isSubscription}`}
                  className="flex gap-4 p-4 bg-card rounded-xl border border-border"
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium line-clamp-1">{item.productName}</h4>
                        {item.size && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>Taille:</span>
                            <CartSizeSelector
                              currentSize={item.size}
                              onSizeChange={(newSize) => {
                                updateSize(item.productId, item.size, newSize, item.isSubscription);
                                toast.success(`Taille modifiée: ${newSize}`);
                              }}
                            />
                            <SizeGuideDialog />
                          </div>
                        )}
                        {item.isSubscription && (
                          <div className="flex items-center gap-1 text-sm text-secondary mt-1">
                            <RefreshCw className="h-3 w-3" />
                            Abonnement
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.productId, item.size, item.isSubscription)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.isSubscription)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.isSubscription)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {((item.isSubscription && item.subscriptionPrice ? item.subscriptionPrice : item.unitPrice) * item.quantity).toFixed(2)} €
                        </p>
                        {item.isSubscription && item.subscriptionPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {(item.unitPrice * item.quantity).toFixed(2)} €
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-border pt-4 space-y-3">
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
                <span>Livraison</span>
                <span className={cn(isFreeShipping && "text-secondary")}>
                  {isFreeShipping ? 'Gratuite' : `${shippingCost.toFixed(2)} €`}
                </span>
              </div>
              
              {/* Estimated delivery */}
              <div className="flex items-center gap-2 text-sm p-2 bg-primary/5 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Livraison estimée:</span>
                <span className="font-medium text-primary">{estimatedDeliveryDate}</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
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
                    Ajoutez encore {remainingForMinimum.toFixed(2)} € pour commander.
                  </p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-destructive transition-all"
                      style={{ width: `${Math.min(100, (subtotal / minimumOrderAmount) * 100)}%` }}
                    />
                  </div>
              </div>
              )}
              
              <div className="space-y-2">
                <Button 
                  className="w-full h-12" 
                  size="lg" 
                  asChild={isMinimumMet}
                  disabled={!isMinimumMet}
                >
                  {isMinimumMet ? (
                    <Link to="/checkout" onClick={closeCart}>
                      Passer commande
                    </Link>
                  ) : (
                    <span>Passer commande</span>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full h-10 text-muted-foreground hover:text-foreground" 
                  onClick={closeCart}
                  asChild
                >
                  <Link to="/boutique">
                    Continuer mes achats
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
