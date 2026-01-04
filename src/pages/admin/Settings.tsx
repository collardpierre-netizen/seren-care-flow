import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*');
      if (error) throw error;
      
      const settingsMap: Record<string, any> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value;
      });
      return settingsMap;
    },
  });

  const [shippingThreshold, setShippingThreshold] = React.useState('');
  const [shippingFee, setShippingFee] = React.useState('');
  const [subscriptionDiscount, setSubscriptionDiscount] = React.useState('');

  React.useEffect(() => {
    if (settings) {
      setShippingThreshold(settings.shipping?.free_shipping_threshold?.toString() || '49');
      setShippingFee(settings.shipping?.standard_shipping_fee?.toString() || '4.90');
      setSubscriptionDiscount(settings.subscription?.discount_percent?.toString() || '10');
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      await supabase
        .from('store_settings')
        .upsert([
          {
            key: 'shipping',
            value: {
              free_shipping_threshold: parseFloat(shippingThreshold),
              standard_shipping_fee: parseFloat(shippingFee)
            }
          },
          {
            key: 'subscription',
            value: {
              discount_percent: parseInt(subscriptionDiscount),
              default_frequency_days: 30
            }
          }
        ], { onConflict: 'key' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Paramètres enregistrés');
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre boutique</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Livraison</CardTitle>
            <CardDescription>Configurez les frais et seuils de livraison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Seuil livraison gratuite (€)</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.01"
                  value={shippingThreshold}
                  onChange={(e) => setShippingThreshold(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Frais de livraison (€)</Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abonnements</CardTitle>
            <CardDescription>Configurez les remises sur les abonnements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Réduction abonnement (%)</Label>
              <Input
                id="discount"
                type="number"
                value={subscriptionDiscount}
                onChange={(e) => setSubscriptionDiscount(e.target.value)}
                className="max-w-[200px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => updateSettings.mutate()} disabled={updateSettings.isPending}>
            {updateSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
