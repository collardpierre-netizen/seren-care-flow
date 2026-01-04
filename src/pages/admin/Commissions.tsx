import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Download, Euro, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Commission {
  id: string;
  prescriber_id: string;
  order_id: string | null;
  subscription_id: string | null;
  amount: number;
  status: 'pending' | 'payable' | 'paid';
  paid_at: string | null;
  created_at: string;
  prescriber?: {
    name: string;
    referral_code: string;
  };
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'outline' },
  payable: { label: 'À payer', variant: 'secondary' },
  paid: { label: 'Payée', variant: 'default' },
};

const AdminCommissions: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: commissions, isLoading } = useQuery({
    queryKey: ['admin-commissions', statusFilter],
    queryFn: async () => {
      let query = (supabase.from('commissions' as any) as any)
        .select(`
          *,
          prescriber:prescribers(name, referral_code)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Commission[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['commission-stats'],
    queryFn: async () => {
      const { data } = await (supabase.from('commissions' as any) as any).select('amount, status');
      
      const pending = data?.filter((c: any) => c.status === 'pending').reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
      const payable = data?.filter((c: any) => c.status === 'payable').reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
      const paid = data?.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
      const total = pending + payable + paid;

      return { pending, payable, paid, total };
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }
      
      const { error } = await (supabase.from('commissions' as any) as any)
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      queryClient.invalidateQueries({ queryKey: ['commission-stats'] });
      toast.success('Statut mis à jour');
    },
  });

  const exportCSV = () => {
    if (!commissions || commissions.length === 0) {
      toast.error('Aucune commission à exporter');
      return;
    }

    const headers = ['Date', 'Prescripteur', 'Code', 'Montant', 'Statut', 'Date paiement'];
    const rows = commissions.map(c => [
      format(new Date(c.created_at), 'dd/MM/yyyy'),
      c.prescriber?.name || '',
      c.prescriber?.referral_code || '',
      c.amount.toFixed(2),
      statusLabels[c.status]?.label || c.status,
      c.paid_at ? format(new Date(c.paid_at), 'dd/MM/yyyy') : '',
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commissions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export téléchargé');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Commissions</h1>
          <p className="text-muted-foreground">Suivi et paiement des commissions prescripteurs</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total généré</p>
                <p className="text-2xl font-bold">{(stats?.total || 0).toFixed(2)} €</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Euro className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{(stats?.pending || 0).toFixed(2)} €</p>
              </div>
              <div className="p-3 rounded-xl bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">À payer</p>
                <p className="text-2xl font-bold text-secondary">{(stats?.payable || 0).toFixed(2)} €</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payées</p>
                <p className="text-2xl font-bold">{(stats?.paid || 0).toFixed(2)} €</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <CheckCircle className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="payable">À payer</SelectItem>
            <SelectItem value="paid">Payées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commissions list */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Prescripteur</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions?.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    {format(new Date(commission.created_at), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {commission.prescriber?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {commission.prescriber?.referral_code || '-'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {commission.order_id ? 'Commande' : 'Abonnement'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">
                    {Number(commission.amount).toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusLabels[commission.status]?.variant}>
                      {statusLabels[commission.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={commission.status}
                      onValueChange={(v) => updateStatus.mutate({ id: commission.id, status: v })}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="payable">À payer</SelectItem>
                        <SelectItem value="paid">Payée</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {(!commissions || commissions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune commission enregistrée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommissions;
