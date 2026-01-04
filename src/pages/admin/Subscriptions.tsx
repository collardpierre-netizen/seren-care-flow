import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Loader2, RefreshCw, Pause, Play } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Actif', variant: 'default' },
  paused: { label: 'En pause', variant: 'secondary' },
  cancelled: { label: 'Annulé', variant: 'destructive' },
};

const AdminSubscriptions: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data: subsData, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(subsData?.map(s => s.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      
      // Fetch subscription items
      const subIds = subsData?.map(s => s.id) || [];
      const { data: items } = await supabase
        .from('subscription_items')
        .select('*, product:products(name)')
        .in('subscription_id', subIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]));
      const itemsMap = new Map<string, any[]>();
      items?.forEach(item => {
        const existing = itemsMap.get(item.subscription_id) || [];
        itemsMap.set(item.subscription_id, [...existing, item]);
      });
      
      return subsData?.map(sub => ({
        ...sub,
        profile: profileMap.get(sub.user_id),
        items: itemsMap.get(sub.id) || []
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: status as 'active' | 'paused' | 'cancelled' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Statut mis à jour');
    },
  });

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const name = `${sub.profile?.first_name} ${sub.profile?.last_name}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || 
                         sub.profile?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMRR = subscriptions
    ?.filter(s => s.status === 'active')
    .reduce((sum, sub) => {
      const itemsTotal = sub.items?.reduce((t: number, item: any) => t + (item.unit_price * item.quantity), 0) || 0;
      return sum + itemsTotal;
    }, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Abonnements</h1>
        <p className="text-muted-foreground">Gérez les abonnements clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Abonnements actifs</div>
            <div className="text-2xl font-bold">
              {subscriptions?.filter(s => s.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Revenu mensuel récurrent</div>
            <div className="text-2xl font-bold">{totalMRR.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">En pause</div>
            <div className="text-2xl font-bold">
              {subscriptions?.filter(s => s.status === 'paused').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSubscriptions?.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun abonnement trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Produits</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Prochaine livraison</TableHead>
                  <TableHead>Économies totales</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions?.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      {sub.profile?.first_name} {sub.profile?.last_name}
                      <br />
                      <span className="text-xs text-muted-foreground">{sub.profile?.email}</span>
                    </TableCell>
                    <TableCell>
                      {sub.items?.length || 0} produit(s)
                    </TableCell>
                    <TableCell>{sub.frequency_days} jours</TableCell>
                    <TableCell>
                      {sub.next_delivery_date 
                        ? format(new Date(sub.next_delivery_date), 'dd MMM yyyy', { locale: fr })
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="font-medium text-secondary">
                      {sub.total_savings?.toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[sub.status]?.variant || 'secondary'}>
                        {statusLabels[sub.status]?.label || sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {sub.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => updateStatus.mutate({ id: sub.id, status: 'paused' })}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {sub.status === 'paused' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => updateStatus.mutate({ id: sub.id, status: 'active' })}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
