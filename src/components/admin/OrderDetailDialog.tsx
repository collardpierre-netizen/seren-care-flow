import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderStatusHistory from '@/components/account/OrderStatusHistory';
import {
  Loader2,
  Send,
  Truck,
  ExternalLink,
  Package,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface OrderDetailDialogProps {
  orderId: string | null;
  onClose: () => void;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({ orderId, onClose }) => {
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [carrier, setCarrier] = useState('');
  const [isSendingToPreparer, setIsSendingToPreparer] = useState(false);
  const [preparerEmail, setPreparerEmail] = useState('');
  const [preparerPassword, setPreparerPassword] = useState('');
  const [includePdf, setIncludePdf] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order-detail', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (orderError) throw orderError;

      const { data: items } = await supabase
        .from('order_items')
        .select('*, products(name, slug)')
        .eq('order_id', orderId);

      const { data: profile } = orderData.user_id ? await supabase
        .from('profiles')
        .select('*')
        .eq('id', orderData.user_id)
        .single() : { data: null };

      setTrackingNumber(orderData.tracking_number || '');
      setTrackingUrl(orderData.tracking_url || '');
      setCarrier(orderData.carrier || '');

      return {
        ...orderData,
        items: items || [],
        profile,
      };
    },
    enabled: !!orderId,
  });

  const updateTracking = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          carrier: carrier || null,
        })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Informations de suivi mises à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const sendToPreparer = useMutation({
    mutationFn: async () => {
      if (!preparerEmail || !preparerPassword) {
        throw new Error('Email et mot de passe requis');
      }

      const { data, error } = await supabase.functions.invoke('send-order-to-preparer', {
        body: {
          orderId,
          orderNumber: order?.order_number,
          preparerEmail,
          password: preparerPassword,
          includePdf,
          orderItems: order?.items,
          shippingAddress: order?.shipping_address,
          customerName: order?.profile ? `${order.profile.first_name} ${order.profile.last_name}` : 'Client',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Commande envoyée au préparateur');
      setIsSendingToPreparer(false);
      setPreparerEmail('');
      setPreparerPassword('');
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    },
  });

  const copyOrderLink = async () => {
    if (!order) return;
    const url = `${window.location.origin}/commande-preparation/${orderId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Lien copié');
  };

  if (!orderId) return null;

  return (
    <Dialog open={!!orderId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isLoading ? 'Chargement...' : `Commande ${order?.order_number}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : order ? (
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="tracking">Suivi</TabsTrigger>
              <TabsTrigger value="preparer">Préparateur</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h3 className="font-medium">Client</h3>
                <p>{order.profile?.first_name} {order.profile?.last_name}</p>
                <p className="text-sm text-muted-foreground">{order.profile?.email}</p>
                <p className="text-sm text-muted-foreground">{order.profile?.phone}</p>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h3 className="font-medium">Adresse de livraison</h3>
                  <p className="text-sm">
                    {(order.shipping_address as any).address_line1}<br />
                    {(order.shipping_address as any).address_line2 && <>{(order.shipping_address as any).address_line2}<br /></>}
                    {(order.shipping_address as any).postal_code} {(order.shipping_address as any).city}
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2">
                <h3 className="font-medium">Articles</h3>
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      {item.product_size && (
                        <p className="text-sm text-muted-foreground">Taille: {item.product_size}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{item.total_price.toFixed(2)} €</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order Status History */}
              <OrderStatusHistory orderId={orderId} />

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">{order.total.toFixed(2)} €</span>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Transporteur</Label>
                  <Input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="Bpost, DPD, DHL..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Numéro de suivi</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ex: 3S12345678901234"
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL de suivi</Label>
                  <div className="flex gap-2">
                    <Input
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      placeholder="https://tracking.bpost.be/..."
                    />
                    {trackingUrl && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => updateTracking.mutate()}
                  disabled={updateTracking.isPending}
                  className="w-full"
                >
                  {updateTracking.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Truck className="h-4 w-4 mr-2" />
                  )}
                  Enregistrer le suivi
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preparer" className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Envoyer au préparateur
                </h3>
                <p className="text-sm text-muted-foreground">
                  Envoyez cette commande par email au préparateur. Il recevra un lien sécurisé 
                  avec mot de passe pour accéder aux détails de la commande.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email du préparateur</Label>
                  <Input
                    type="email"
                    value={preparerEmail}
                    onChange={(e) => setPreparerEmail(e.target.value)}
                    placeholder="preparateur@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mot de passe d'accès</Label>
                  <Input
                    type="text"
                    value={preparerPassword}
                    onChange={(e) => setPreparerPassword(e.target.value)}
                    placeholder="Créez un mot de passe temporaire"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce mot de passe sera requis pour accéder à la page de préparation
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="include-pdf"
                    checked={includePdf}
                    onCheckedChange={setIncludePdf}
                  />
                  <Label htmlFor="include-pdf" className="cursor-pointer">
                    Inclure un PDF en pièce jointe
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => sendToPreparer.mutate()}
                    disabled={sendToPreparer.isPending || !preparerEmail || !preparerPassword}
                    className="flex-1"
                  >
                    {sendToPreparer.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Envoyer par email
                  </Button>

                  <Button variant="outline" onClick={copyOrderLink}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
