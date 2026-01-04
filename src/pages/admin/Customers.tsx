import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminCustomers: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderCounts } = useQuery({
    queryKey: ['customer-order-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('user_id');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(order => {
        if (order.user_id) {
          counts[order.user_id] = (counts[order.user_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const { data: subscriptionCounts } = useQuery({
    queryKey: ['customer-subscription-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('user_id, status')
        .eq('status', 'active');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(sub => {
        counts[sub.user_id] = (counts[sub.user_id] || 0) + 1;
      });
      return counts;
    },
  });

  const filteredCustomers = customers?.filter(customer => {
    const searchLower = search.toLowerCase();
    return (
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.first_name?.toLowerCase().includes(searchLower) ||
      customer.last_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Clients</h1>
        <p className="text-muted-foreground">Consultez les profils clients</p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCustomers?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun client trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Abonnements actifs</TableHead>
                  <TableHead>Inscrit le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers?.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.city || '-'}</TableCell>
                    <TableCell>{orderCounts?.[customer.id] || 0}</TableCell>
                    <TableCell>{subscriptionCounts?.[customer.id] || 0}</TableCell>
                    <TableCell>
                      {format(new Date(customer.created_at), 'dd MMM yyyy', { locale: fr })}
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

export default AdminCustomers;
