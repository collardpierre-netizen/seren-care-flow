import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Package, 
  Calendar, 
  Euro, 
  Minus, 
  Plus, 
  Trash2, 
  User, 
  Mail, 
  CreditCard,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface SubscriptionItem {
  id: string;
  product_id: string;
  product_size: string | null;
  quantity: number;
  unit_price: number;
  product?: { name: string };
}

interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency_days: number;
  next_delivery_date: string | null;
  total_savings: number | null;
  created_at: string;
  stripe_subscription_id?: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  items: SubscriptionItem[];
}

interface SubscriptionDetailDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Actif', variant: 'default' },
  paused: { label: 'En pause', variant: 'secondary' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
};

const frequencyLabels: Record<number, string> = {
  14: 'Toutes les 2 semaines',
  28: 'Mensuel (28 jours)',
  30: 'Mensuel (30 jours)',
  60: 'Tous les 2 mois',
  90: 'Trimestriel',
};

const SubscriptionDetailDialog: React.FC<SubscriptionDetailDialogProps> = ({
  subscription,
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [editedItems, setEditedItems] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const updateItemsMutation = useMutation({
    mutationFn: async () => {
      if (!subscription) return;
      
      for (const [itemId, quantity] of Object.entries(editedItems)) {
        if (quantity === 0) {
          const { error } = await supabase
            .from('subscription_items')
            .delete()
            .eq('id', itemId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('subscription_items')
            .update({ quantity })
            .eq('id', itemId);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Abonnement mis à jour');
      setIsEditing(false);
      setEditedItems({});
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!subscription) return;
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Abonnement annulé');
      setShowCancelDialog(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'annulation');
    },
  });

  if (!subscription) return null;

  const getItemQuantity = (itemId: string, originalQty: number) => {
    return editedItems[itemId] ?? originalQty;
  };

  const handleQuantityChange = (itemId: string, delta: number, currentQty: number) => {
    const newQty = Math.max(0, currentQty + delta);
    setEditedItems(prev => ({ ...prev, [itemId]: newQty }));
  };

  const calculateTotal = () => {
    return subscription.items.reduce((sum, item) => {
      const qty = getItemQuantity(item.id, item.quantity);
      return sum + (item.unit_price * qty);
    }, 0);
  };

  const hasChanges = Object.keys(editedItems).length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                Détails de l'abonnement
                <Badge variant={statusLabels[subscription.status]?.variant || 'secondary'}>
                  {statusLabels[subscription.status]?.label || subscription.status}
                </Badge>
              </DialogTitle>
            </div>
            <DialogDescription>
              Créé le {format(new Date(subscription.created_at), 'dd MMMM yyyy', { locale: fr })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Client Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations client
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nom:</span>
                  <span className="ml-2 font-medium">
                    {subscription.profile?.first_name} {subscription.profile?.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{subscription.profile?.email}</span>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Fréquence</p>
                  <p className="font-medium text-sm">
                    {frequencyLabels[subscription.frequency_days] || `${subscription.frequency_days} jours`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <CreditCard className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Prochaine livraison</p>
                  <p className="font-medium text-sm">
                    {subscription.next_delivery_date 
                      ? format(new Date(subscription.next_delivery_date), 'dd MMM yyyy', { locale: fr })
                      : 'Non planifiée'
                    }
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produits ({subscription.items.length})
                </h3>
                {subscription.status !== 'cancelled' && (
                  <Button
                    variant={isEditing ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isEditing && hasChanges) {
                        updateItemsMutation.mutate();
                      } else {
                        setIsEditing(!isEditing);
                        if (!isEditing) setEditedItems({});
                      }
                    }}
                    disabled={updateItemsMutation.isPending}
                  >
                    {updateItemsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isEditing ? (hasChanges ? 'Enregistrer' : 'Annuler') : 'Modifier'}
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {subscription.items.map((item) => {
                  const qty = getItemQuantity(item.id, item.quantity);
                  const isDeleted = qty === 0;
                  
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                        isDeleted ? 'opacity-50 bg-destructive/5 border-destructive/20' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`font-medium ${isDeleted ? 'line-through' : ''}`}>
                          {item.product?.name || 'Produit inconnu'}
                        </p>
                        {item.product_size && (
                          <p className="text-xs text-muted-foreground">
                            Taille: {item.product_size}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, -1, qty)}
                            >
                              {qty === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                            </Button>
                            <Input
                              type="number"
                              value={qty}
                              onChange={(e) => setEditedItems(prev => ({ 
                                ...prev, 
                                [item.id]: Math.max(0, parseInt(e.target.value) || 0) 
                              }))}
                              className="w-16 text-center h-8"
                              min={0}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, 1, qty)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            x{item.quantity}
                          </span>
                        )}
                        
                        <div className="text-right min-w-[80px]">
                          <p className="font-medium">
                            {(item.unit_price * (isEditing ? qty : item.quantity)).toFixed(2)} €
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.unit_price.toFixed(2)} €/u
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-primary" />
                <span className="font-medium">Total mensuel</span>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{calculateTotal().toFixed(2)} €</p>
                {subscription.total_savings && subscription.total_savings > 0 && (
                  <p className="text-sm text-green-600">
                    Économies: {subscription.total_savings.toFixed(2)} €
                  </p>
                )}
              </div>
            </div>

            {/* Stripe ID */}
            {subscription.stripe_subscription_id && (
              <div className="text-xs text-muted-foreground">
                Stripe ID: <code className="bg-muted px-1 rounded">{subscription.stripe_subscription_id}</code>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {subscription.status !== 'cancelled' && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Annuler l'abonnement
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cet abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action mettra fin à l'abonnement de {subscription.profile?.first_name} {subscription.profile?.last_name}.
              Le client ne recevra plus de livraisons automatiques.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SubscriptionDetailDialog;
