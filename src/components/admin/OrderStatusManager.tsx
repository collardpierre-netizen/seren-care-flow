import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { statusConfig, OrderStatus, getStatusBadgeVariant } from '@/lib/orderStatus';
import { 
  Loader2, 
  ChevronDown, 
  Bell, 
  Truck, 
  Calendar, 
  MessageSquare,
  Send
} from 'lucide-react';

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: OrderStatus;
  onSuccess?: () => void;
}

interface Transition {
  from_status: string;
  to_status: string;
  is_exception: boolean;
  description: string;
}

const OrderStatusManager: React.FC<OrderStatusManagerProps> = ({ 
  orderId, 
  currentStatus,
  onSuccess 
}) => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [messagePublic, setMessagePublic] = useState('');
  const [messageInternal, setMessageInternal] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [carrier, setCarrier] = useState('');
  const [etaDate, setEtaDate] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch available transitions
  const { data: transitions, isLoading: transitionsLoading } = useQuery({
    queryKey: ['order-transitions', currentStatus],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_status_transitions')
        .select('*')
        .eq('from_status', currentStatus);
      
      if (error) throw error;
      return data as Transition[];
    }
  });

  // Update status mutation using RPC
  const updateStatus = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('set_order_status', {
        p_order_id: orderId,
        p_new_status: selectedStatus,
        p_message_public: messagePublic || null,
        p_message_internal: messageInternal || null,
        p_eta_date: etaDate || null,
        p_tracking_number: trackingNumber || null,
        p_tracking_url: trackingUrl || null,
        p_carrier: carrier || null,
        p_notify_customer: notifyCustomer
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-events', orderId] });
      toast.success(notifyCustomer ? 'Statut mis à jour et client notifié' : 'Statut mis à jour');
      resetForm();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const resetForm = () => {
    setSelectedStatus('');
    setMessagePublic('');
    setMessageInternal('');
    setTrackingNumber('');
    setTrackingUrl('');
    setCarrier('');
    setEtaDate('');
    setShowAdvanced(false);
  };

  // Séparer transitions normales et exceptions
  const normalTransitions = transitions?.filter(t => !t.is_exception) || [];
  const exceptionTransitions = transitions?.filter(t => t.is_exception) || [];

  if (transitionsLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!transitions || transitions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>Aucune transition disponible depuis ce statut</p>
      </div>
    );
  }

  const selectedConfig = selectedStatus ? statusConfig[selectedStatus as OrderStatus] : null;

  return (
    <div className="space-y-6">
      {/* Actions rapides (transitions normales) */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Actions rapides</Label>
        <div className="flex flex-wrap gap-2">
          {normalTransitions.map((transition) => {
            const config = statusConfig[transition.to_status as OrderStatus];
            if (!config) return null;
            const Icon = config.icon;
            
            return (
              <Button
                key={transition.to_status}
                variant={selectedStatus === transition.to_status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(transition.to_status)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Statuts exception */}
      {exceptionTransitions.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
              Statuts exception ({exceptionTransitions.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex flex-wrap gap-2">
              {exceptionTransitions.map((transition) => {
                const config = statusConfig[transition.to_status as OrderStatus];
                if (!config) return null;
                const Icon = config.icon;
                
                return (
                  <Button
                    key={transition.to_status}
                    variant={selectedStatus === transition.to_status ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus(transition.to_status)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Détails du changement */}
      {selectedStatus && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Nouveau statut:</span>
              <Badge variant={getStatusBadgeVariant(selectedStatus as OrderStatus)}>
                {selectedConfig?.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Bell className={`h-4 w-4 ${notifyCustomer ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch
                id="notify"
                checked={notifyCustomer}
                onCheckedChange={setNotifyCustomer}
              />
              <Label htmlFor="notify" className="text-sm cursor-pointer">
                Notifier le client
              </Label>
            </div>
          </div>

          {/* Message public (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="message-public" className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              Message pour le client (optionnel)
            </Label>
            <Textarea
              id="message-public"
              placeholder={selectedConfig?.description || 'Message visible par le client...'}
              value={messagePublic}
              onChange={(e) => setMessagePublic(e.target.value)}
              rows={2}
            />
          </div>

          {/* Options avancées */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 w-full justify-start">
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                Options avancées
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Tracking */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier" className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4" />
                    Transporteur
                  </Label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colissimo">Colissimo</SelectItem>
                      <SelectItem value="chronopost">Chronopost</SelectItem>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="dhl">DHL</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="mondialrelay">Mondial Relay</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking-number">N° de suivi</Label>
                  <Input
                    id="tracking-number"
                    placeholder="Ex: 6A12345678901"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking-url">URL de suivi</Label>
                  <Input
                    id="tracking-url"
                    placeholder="https://..."
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* ETA */}
              <div className="space-y-2">
                <Label htmlFor="eta" className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Date de livraison estimée
                </Label>
                <Input
                  id="eta"
                  type="date"
                  value={etaDate}
                  onChange={(e) => setEtaDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              {/* Message interne */}
              <div className="space-y-2">
                <Label htmlFor="message-internal">Note interne (non visible par le client)</Label>
                <Textarea
                  id="message-internal"
                  placeholder="Notes pour l'équipe..."
                  value={messageInternal}
                  onChange={(e) => setMessageInternal(e.target.value)}
                  rows={2}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Bouton de validation */}
          <Button 
            onClick={() => updateStatus.mutate()}
            disabled={updateStatus.isPending}
            className="w-full"
          >
            {updateStatus.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {notifyCustomer ? 'Appliquer et notifier' : 'Appliquer le changement'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderStatusManager;
