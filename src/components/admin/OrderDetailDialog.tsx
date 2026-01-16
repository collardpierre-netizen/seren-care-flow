import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderStatusHistory from '@/components/account/OrderStatusHistory';
import OrderStatusManager from '@/components/admin/OrderStatusManager';
import OrderChatPanel from '@/components/admin/OrderChatPanel';
import OrderPreparerLogs from '@/components/admin/OrderPreparerLogs';
import { statusConfig, OrderStatus } from '@/lib/orderStatus';
import {
  Loader2,
  Send,
  Truck,
  ExternalLink,
  Package,
  FileText,
  Copy,
  Check,
  RefreshCw,
  MessageCircle,
  ClipboardList,
  StickyNote,
} from 'lucide-react';

// Generate a secure random password
const generatePassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

interface OrderDetailDialogProps {
  orderId: string | null;
  onClose: () => void;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({ orderId, onClose }) => {
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [carrier, setCarrier] = useState('');
  const [preparerEmail, setPreparerEmail] = useState('');
  const [preparerPassword, setPreparerPassword] = useState(() => generatePassword());
  const [includePdf, setIncludePdf] = useState(false);
  const [preparerNotes, setPreparerNotes] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-generate password on mount
  useEffect(() => {
    if (orderId) {
      setPreparerPassword(generatePassword());
    }
  }, [orderId]);

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
      setPreparerNotes((orderData as any).preparer_notes || '');

      return {
        ...orderData,
        items: items || [],
        profile,
      };
    },
    enabled: !!orderId,
  });

  // Check for unread messages
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['order-unread-messages', orderId],
    queryFn: async () => {
      if (!orderId) return 0;
      const { count } = await supabase
        .from('order_messages')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', orderId)
        .eq('sender_type', 'preparer')
        .eq('is_read', false);
      return count || 0;
    },
    enabled: !!orderId,
    refetchInterval: 10000,
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

  const updatePreparerNotes = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('orders')
        .update({ preparer_notes: preparerNotes || null })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] });
      toast.success('Notes sauvegardées');
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde');
    },
  });

  const sendToPreparer = useMutation({
    mutationFn: async () => {
      if (!preparerEmail) {
        throw new Error('Email requis');
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
    onSuccess: () => {
      toast.success('Commande envoyée au préparateur');
      setPreparerEmail('');
      setPreparerPassword(generatePassword());
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="status">Statut</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="tracking">Suivi</TabsTrigger>
              <TabsTrigger value="preparer">Préparateur</TabsTrigger>
              <TabsTrigger value="chat" className="relative">
                Chat
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="logs">Activité</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <OrderStatusManager 
                orderId={orderId} 
                currentStatus={order.status as OrderStatus}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] })}
              />
            </TabsContent>

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
                    {(order.shipping_address as any).address_line1 || (order.shipping_address as any).address}<br />
                    {(order.shipping_address as any).address_line2 && <>{(order.shipping_address as any).address_line2}<br /></>}
                    {(order.shipping_address as any).postal_code || (order.shipping_address as any).postalCode} {(order.shipping_address as any).city}
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
              {/* Notes pour le préparateur */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <h3 className="font-medium flex items-center gap-2 text-amber-800">
                  <StickyNote className="h-4 w-4" />
                  Notes pour le préparateur
                </h3>
                <Textarea
                  value={preparerNotes}
                  onChange={(e) => setPreparerNotes(e.target.value)}
                  placeholder="Instructions spéciales, remarques..."
                  className="bg-white"
                  rows={3}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updatePreparerNotes.mutate()}
                  disabled={updatePreparerNotes.isPending}
                >
                  {updatePreparerNotes.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder les notes
                </Button>
              </div>

              <Separator />

              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Envoyer au préparateur
                </h3>
                <p className="text-sm text-muted-foreground">
                  Envoyez cette commande par email au préparateur. Il recevra un lien sécurisé 
                  pour accéder aux détails et pourra communiquer en temps réel.
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
                  <Label>Mot de passe d'accès (optionnel)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={preparerPassword}
                      onChange={(e) => setPreparerPassword(e.target.value)}
                      placeholder="Mot de passe auto-généré"
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPreparerPassword(generatePassword())}
                      title="Générer un nouveau mot de passe"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Le préparateur accède via un lien magique sécurisé.
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
                    disabled={sendToPreparer.isPending || !preparerEmail}
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

            <TabsContent value="chat" className="h-[400px]">
              <OrderChatPanel orderId={orderId} orderNumber={order.order_number} />
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Journal d'activité du préparateur
                </h3>
                <p className="text-sm text-muted-foreground">
                  Historique des actions du préparateur sur cette commande.
                </p>
              </div>
              <OrderPreparerLogs orderId={orderId} />
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
