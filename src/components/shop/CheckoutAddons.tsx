import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Plus, Sparkles, RefreshCw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface AddonProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  subscription_price: number | null;
  addon_category: string | null;
  is_subscription_eligible: boolean | null;
  product_images: { image_url: string; is_primary: boolean }[];
}

interface CheckoutAddonsProps {
  mode?: 'oneshot' | 'subscription';
}

const categoryLabels: Record<string, string> = {
  pharma: 'Produits pharma',
  hygiene: 'Hygiène',
  soins: 'Soins',
  accessoires: 'Accessoires',
  confort: 'Confort',
};

const CheckoutAddons: React.FC<CheckoutAddonsProps> = ({ mode = 'oneshot' }) => {
  const { items: cartItems, addItem } = useCart();

  const { data: addons, isLoading } = useQuery({
    queryKey: ['addon-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          subscription_price,
          addon_category,
          is_subscription_eligible,
          product_images (image_url, is_primary)
        `)
        .eq('is_active', true)
        .eq('is_addon', true)
        .gt('price', 0)
        .order('addon_category');

      if (error) throw error;
      return data as AddonProduct[];
    },
  });

  if (isLoading || !addons || addons.length === 0) {
    return null;
  }

  // Filter out products already in cart
  const cartProductIds = new Set(cartItems.map(item => item.productId));
  const availableAddons = addons.filter(addon => !cartProductIds.has(addon.id));

  if (availableAddons.length === 0) {
    return null;
  }

  // Group by category
  const groupedAddons = availableAddons.reduce((acc, addon) => {
    const cat = addon.addon_category || 'autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(addon);
    return acc;
  }, {} as Record<string, AddonProduct[]>);

  const handleAddAddon = (addon: AddonProduct, isSubscription: boolean) => {
    const primaryImage = addon.product_images?.find(img => img.is_primary)?.image_url 
      || addon.product_images?.[0]?.image_url;

    addItem({
      productId: addon.id,
      productName: addon.name,
      productImage: primaryImage,
      unitPrice: addon.price,
      subscriptionPrice: addon.subscription_price,
      quantity: 1,
      isSubscription,
    });

    toast.success(`${addon.name} ajouté au panier`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Complétez votre commande
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Produits complémentaires recommandés
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedAddons).map(([category, products]) => (
          <div key={category} className="space-y-3">
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[category] || category}
            </Badge>
            <div className="grid gap-3">
              {products.slice(0, 3).map((addon) => {
                const primaryImage = addon.product_images?.find(img => img.is_primary)?.image_url 
                  || addon.product_images?.[0]?.image_url;
                const showSubscriptionOption = mode === 'subscription' && addon.is_subscription_eligible && addon.subscription_price;

                return (
                  <div 
                    key={addon.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    {primaryImage && (
                      <div className="w-14 h-14 bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={primaryImage}
                          alt={addon.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{addon.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold">
                          {addon.price.toFixed(2)} €
                        </span>
                        {showSubscriptionOption && (
                          <span className="text-xs text-secondary">
                            ou {addon.subscription_price!.toFixed(2)} €/mois
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3"
                        onClick={() => handleAddAddon(addon, false)}
                      >
                        <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                        <span className="sr-only sm:not-sr-only">Ajouter</span>
                      </Button>
                      {showSubscriptionOption && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 px-3"
                          onClick={() => handleAddAddon(addon, true)}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          <span className="sr-only sm:not-sr-only">Abo</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CheckoutAddons;
