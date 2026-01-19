import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Pause, 
  Play, 
  Edit, 
  Save, 
  X, 
  Loader2, 
  Package, 
  Calendar,
  TrendingDown,
  Truck,
  RefreshCw,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { AddProductDialog } from './AddProductDialog';
import { ExtraDeliveryDialog } from './ExtraDeliveryDialog';

interface SubscriptionItem {
  id: string;
  product_id: string | null;
  product_size: string | null;
  quantity: number;
  unit_price: number;
  products?: {
    name: string;
    price: number;
    subscription_price: number | null;
  } | null;
}

interface Subscription {
  id: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency_days: number | null;
  next_delivery_date: string | null;
  total_savings: number | null;
  items: SubscriptionItem[];
  shipping_address: any;
  user_id: string;
}

interface SubscriptionManagerProps {
  subscription: Subscription;
  userPreferences?: {
    incontinence_level?: string;
    gender?: string;
    usage_time?: string;
  };
}

const frequencyOptions = [
  { value: 14, label: 'Toutes les 2 semaines', surcharge: 4.90 },
  { value: 30, label: 'Tous les mois', surcharge: 0 },
  { value: 45, label: 'Toutes les 6 semaines', surcharge: 0 },
  { value: 60, label: 'Tous les 2 mois', surcharge: 0 },
];

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  active: { label: 'Actif', variant: 'default' },
  paused: { label: 'En pause', variant: 'outline' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
};

export const SubscriptionManager = ({ subscription, userPreferences }: SubscriptionManagerProps) => {
  const queryClient = useQueryClient();
  const { data: settings } = useStoreSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<Record<string, number>>({});
  const [editedFrequency, setEditedFrequency] = useState(subscription.frequency_days || 30);
  const [pendingItems, setPendingItems] = useState<Array<{
    product_id: string;
    product_name: string;
    product_size: string | null;
    quantity: number;
    unit_price: number;
  }>>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showExtraDelivery, setShowExtraDelivery] = useState(false);

  const minimumAmount = settings?.subscription.minimum_amount || 69;

  // Calculate totals with pending items
  const calculateSubtotal = () => {
    const existingTotal = subscription.items.reduce((sum, item) => {
      const qty = editedItems[item.id] ?? item.quantity;
      return sum + (item.unit_price * qty);
    }, 0);
    const pendingTotal = pendingItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    return existingTotal + pendingTotal;
  };

  const originalSubtotal = subscription.items.reduce((sum, item) => {
    const qty = editedItems[item.id] ?? item.quantity;
    const originalPrice = item.products?.price || item.unit_price;
    return sum + (originalPrice * qty);
  }, 0) + pendingItems.reduce((sum, item) => {
    // Approximate original price (add 10% discount back)
    return sum + (item.unit_price / 0.9 * item.quantity);
  }, 0);

  const currentSubtotal = calculateSubtotal();
  const savings = originalSubtotal - currentSubtotal;
  const isUnderMinimum = currentSubtotal < minimumAmount;

  // Calculate bi-weekly surcharge
  const selectedFrequency = frequencyOptions.find(f => f.value === editedFrequency);
  const frequencySurcharge = selectedFrequency?.surcharge || 0;

  // Update subscription mutation
  const updateSubscription = useMutation({
    mutationFn: async (data: { 
      status?: 'active' | 'paused' | 'cancelled';
      frequency_days?: number;
    }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update(data)
        .eq('id', subscription.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      toast.success('Abonnement mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  // Update subscription items
  const updateItems = useMutation({
    mutationFn: async () => {
      // Validate minimum amount
      if (isUnderMinimum) {
        throw new Error(`Le montant minimum d'abonnement est de ${minimumAmount} €`);
      }

      // Update frequency
      if (editedFrequency !== subscription.frequency_days) {
        const { error: freqError } = await supabase
          .from('subscriptions')
          .update({ frequency_days: editedFrequency })
          .eq('id', subscription.id);
        if (freqError) throw freqError;
      }

      // Update existing item quantities
      for (const item of subscription.items) {
        const newQty = editedItems[item.id];
        if (newQty !== undefined && newQty !== item.quantity) {
          if (newQty === 0) {
            // Remove item
            const { error } = await supabase
              .from('subscription_items')
              .delete()
              .eq('id', item.id);
            if (error) throw error;
          } else {
            // Update quantity
            const { error } = await supabase
              .from('subscription_items')
              .update({ quantity: newQty })
              .eq('id', item.id);
            if (error) throw error;
          }
        }
      }

      // Add new pending items
      if (pendingItems.length > 0) {
        const newItems = pendingItems.map(item => ({
          subscription_id: subscription.id,
          product_id: item.product_id,
          product_size: item.product_size,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        const { error: insertError } = await supabase
          .from('subscription_items')
          .insert(newItems);
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      toast.success('Modifications enregistrées');
      setIsEditing(false);
      setEditedItems({});
      setPendingItems([]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    }
  });

  const handleStartEdit = () => {
    setIsEditing(true);
    // Initialize edited quantities
    const initial: Record<string, number> = {};
    subscription.items.forEach(item => {
      initial[item.id] = item.quantity;
    });
    setEditedItems(initial);
    setEditedFrequency(subscription.frequency_days || 30);
    setPendingItems([]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedItems({});
    setPendingItems([]);
  };

  const handleSave = () => {
    if (isUnderMinimum) {
      toast.error(`Le montant minimum d'abonnement est de ${minimumAmount} €`);
      return;
    }
    updateItems.mutate();
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const qty = parseInt(value) || 0;
    setEditedItems(prev => ({ ...prev, [itemId]: Math.max(0, qty) }));
  };

  const handleAddProduct = (product: any, size: string | null, quantity: number) => {
    const subscriptionPrice = product.subscription_price || product.price * 0.9;
    setPendingItems(prev => [...prev, {
      product_id: product.id,
      product_name: product.name,
      product_size: size,
      quantity,
      unit_price: subscriptionPrice,
    }]);
  };

  const handleRemovePendingItem = (index: number) => {
    setPendingItems(prev => prev.filter((_, i) => i !== index));
  };

  const existingProductIds = [
    ...subscription.items.map(i => i.product_id).filter(Boolean) as string[],
    ...pendingItems.map(i => i.product_id),
  ];

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <CardTitle>Mon Abonnement</CardTitle>
                <Badge variant={statusLabels[subscription.status]?.variant || 'outline'}>
                  {statusLabels[subscription.status]?.label || subscription.status}
                </Badge>
              </div>
              <CardDescription>
                {subscription.next_delivery_date && subscription.status === 'active' && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Prochaine livraison: {format(new Date(subscription.next_delivery_date), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {subscription.status === 'active' && !isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowExtraDelivery(true)}
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    Livraison ponctuelle
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateSubscription.mutate({ status: 'paused' })}
                    disabled={updateSubscription.isPending}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                </>
              )}
              {subscription.status === 'paused' && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => updateSubscription.mutate({ status: 'active' })}
                  disabled={updateSubscription.isPending}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Reprendre
                </Button>
              )}
              {isEditing && (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSave}
                    disabled={updateItems.isPending || isUnderMinimum}
                  >
                    {updateItems.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Enregistrer
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Minimum amount warning */}
          {isEditing && isUnderMinimum && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Le montant minimum d'abonnement est de {minimumAmount} €. 
                Montant actuel: {currentSubtotal.toFixed(2)} €
              </AlertDescription>
            </Alert>
          )}

          {/* Frequency selector */}
          {isEditing ? (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fréquence de livraison
              </Label>
              <Select 
                value={editedFrequency.toString()} 
                onValueChange={(v) => setEditedFrequency(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                      {opt.surcharge > 0 && (
                        <span className="text-amber-600 ml-2">(+{opt.surcharge.toFixed(2)} €/livraison)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>
                {frequencyOptions.find(f => f.value === subscription.frequency_days)?.label || 
                 `Tous les ${subscription.frequency_days || 30} jours`}
              </span>
            </div>
          )}

          <Separator />

          {/* Items list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produits dans votre abonnement
              </h4>
              {isEditing && (
                <Button variant="outline" size="sm" onClick={() => setShowAddProduct(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              )}
            </div>
            
            {subscription.items.map((item) => {
              const qty = editedItems[item.id] ?? item.quantity;
              const subtotal = item.unit_price * qty;
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${qty === 0 ? 'opacity-50 bg-muted' : ''}`}
                >
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
                  
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <Input 
                          type="number" 
                          min="0"
                          value={qty}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="text-center"
                        />
                      </div>
                      <span className="text-right w-20 font-medium">
                        {subtotal.toFixed(2)} €
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="font-medium">{subtotal.toFixed(2)} €</p>
                      <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pending items to add */}
            {pendingItems.map((item, index) => (
              <div 
                key={`pending-${index}`} 
                className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.product_name}</p>
                    <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                  </div>
                  {item.product_size && (
                    <span className="text-sm text-muted-foreground">Taille: {item.product_size}</span>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {item.unit_price.toFixed(2)} € / unité
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">x{item.quantity}</span>
                  <span className="font-medium">{(item.unit_price * item.quantity).toFixed(2)} €</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleRemovePendingItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{currentSubtotal.toFixed(2)} €</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm text-secondary">
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Économie abonnement
                </span>
                <span>-{savings.toFixed(2)} €</span>
              </div>
            )}
            {frequencySurcharge > 0 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Supplément bi-hebdomadaire
                </span>
                <span>+{frequencySurcharge.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total par livraison</span>
              <span>{(currentSubtotal + frequencySurcharge).toFixed(2)} €</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              <p>✓ Minimum d'abonnement: {minimumAmount} € (inclut {settings?.subscription.included_deliveries || 1} livraison{(settings?.subscription.included_deliveries || 1) > 1 ? 's' : ''} / mois)</p>
              <p>📦 Livraison supplémentaire: {(settings?.subscription.extra_delivery_fee || 4.90).toFixed(2)} €</p>
              {frequencySurcharge > 0 && (
                <p className="text-amber-600">⚠️ Un supplément de {frequencySurcharge.toFixed(2)} € s'applique pour les livraisons toutes les 2 semaines</p>
              )}
            </div>
          </div>

          {/* Info box */}
          {subscription.status === 'active' && !isEditing && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                💡 Vous pouvez modifier les quantités, ajouter des produits, changer la fréquence ou demander une livraison ponctuelle à tout moment.
              </p>
            </div>
          )}

          {subscription.status === 'paused' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                ⏸️ Votre abonnement est en pause. Cliquez sur "Reprendre" pour réactiver vos livraisons.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={showAddProduct}
        onOpenChange={setShowAddProduct}
        existingProductIds={existingProductIds}
        userPreferences={userPreferences}
        onAddProduct={handleAddProduct}
      />

      {/* Extra Delivery Dialog */}
      <ExtraDeliveryDialog
        open={showExtraDelivery}
        onOpenChange={setShowExtraDelivery}
        subscriptionItems={subscription.items}
        shippingAddress={subscription.shipping_address}
      />
    </>
  );
};

export default SubscriptionManager;
