import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface SubscriptionItem {
  id: string;
  product_id: string | null;
  product_size: string | null;
  quantity: number;
  unit_price: number;
  products?: {
    name: string;
    price: number;
  } | null;
}

interface ExtraDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionItems: SubscriptionItem[];
  shippingAddress: any;
}

export const ExtraDeliveryDialog = ({
  open,
  onOpenChange,
  subscriptionItems,
  shippingAddress,
}: ExtraDeliveryDialogProps) => {
  const { data: settings } = useStoreSettings();
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    subscriptionItems.forEach(item => {
      initial[item.id] = item.quantity;
    });
    return initial;
  });

  // Reset quantities when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const initial: Record<string, number> = {};
      subscriptionItems.forEach(item => {
        initial[item.id] = item.quantity;
      });
      setQuantities(initial);
    }
    onOpenChange(newOpen);
  };

  const subtotal = subscriptionItems.reduce((sum, item) => {
    const qty = quantities[item.id] || 0;
    return sum + (item.unit_price * qty);
  }, 0);

  // Extra delivery always costs shipping (uses subscription extra delivery fee)
  const extraDeliveryFee = settings?.subscription.extra_delivery_fee || settings?.shipping.standard_shipping_fee || 4.90;
  const shippingFee = extraDeliveryFee;

  const total = subtotal + shippingFee;

  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  // Create extra order
  const createExtraOrder = useMutation({
    mutationFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      // Create order with items that have quantity > 0
      const itemsToOrder = subscriptionItems.filter(item => (quantities[item.id] || 0) > 0);
      
      if (itemsToOrder.length === 0) {
        throw new Error('Ajoutez au moins un produit');
      }

      // Generate order number
      const orderNumber = `SC-${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'order_received',
          subtotal,
          shipping_fee: shippingFee,
          total,
          shipping_address: shippingAddress,
          is_subscription_order: false,
          notes: 'Livraison ponctuelle supplémentaire',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = itemsToOrder.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.products?.name || 'Produit',
        product_size: item.product_size,
        quantity: quantities[item.id],
        unit_price: item.unit_price,
        total_price: item.unit_price * quantities[item.id],
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          orderId: order.id,
          cartItems: itemsToOrder.map(item => ({
            productId: item.product_id,
            name: item.products?.name || 'Produit',
            price: item.unit_price,
            quantity: quantities[item.id],
            size: item.product_size,
            isSubscription: false,
          })),
          shippingAddress,
          shippingCost: shippingFee,
        },
      });

      if (checkoutError) throw checkoutError;

      return checkoutData;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
        toast.success('Redirection vers le paiement...');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la commande');
    },
  });

  const hasItems = Object.values(quantities).some(q => q > 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Livraison ponctuelle
          </DialogTitle>
          <DialogDescription>
            Commandez une livraison supplémentaire avec les produits de votre choix.
            <span className="block mt-1 text-primary font-medium">
              Frais de livraison: {extraDeliveryFee.toFixed(2)} €
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Products */}
          <div className="space-y-3">
            {subscriptionItems.map(item => {
              const qty = quantities[item.id] || 0;
              return (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${qty === 0 ? 'opacity-50' : ''}`}>
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.products?.name || 'Produit'}
                      {item.product_size && (
                        <span className="text-muted-foreground ml-1">({item.product_size})</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.unit_price.toFixed(2)} € / unité
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      value={qty}
                      onChange={(e) => setQuantities(prev => ({
                        ...prev,
                        [item.id]: Math.max(0, parseInt(e.target.value) || 0),
                      }))}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison supplémentaire</span>
              <span>{shippingFee.toFixed(2)} €</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cette livraison est en plus de celle incluse dans votre abonnement mensuel.
            </p>
            <div className="flex justify-between font-medium text-base pt-2 border-t">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Action */}
          <Button
            className="w-full"
            onClick={() => createExtraOrder.mutate()}
            disabled={!hasItems || createExtraOrder.isPending}
          >
            {createExtraOrder.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ShoppingBag className="h-4 w-4 mr-2" />
            )}
            Commander ({total.toFixed(2)} €)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtraDeliveryDialog;
