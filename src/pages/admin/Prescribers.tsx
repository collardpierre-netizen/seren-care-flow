import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Plus, Copy, Users, Euro, TrendingUp, Building } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type PrescriberType = 'nurse' | 'doctor' | 'pharmacy' | 'nursing_home';

interface Prescriber {
  id: string;
  type: PrescriberType;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  referral_code: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
}

const typeLabels: Record<PrescriberType, string> = {
  nurse: 'Infirmier(ère)',
  doctor: 'Médecin',
  pharmacy: 'Pharmacie',
  nursing_home: 'EHPAD',
};

const AdminPrescribers: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPrescriber, setNewPrescriber] = useState({
    type: 'nurse' as PrescriberType,
    name: '',
    email: '',
    phone: '',
    organization: '',
    commission_rate: 10,
  });

  const { data: prescribers, isLoading } = useQuery({
    queryKey: ['admin-prescribers'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('prescribers' as any) as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Prescriber[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['prescriber-stats'],
    queryFn: async () => {
      const [prescribersCount, commissionsData] = await Promise.all([
        (supabase.from('prescribers' as any) as any).select('id', { count: 'exact', head: true }).eq('is_active', true),
        (supabase.from('commissions' as any) as any).select('amount, status'),
      ]);

      const totalCommissions = commissionsData.data?.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0) || 0;
      const pendingCommissions = commissionsData.data?.filter((c: any) => c.status === 'pending').reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0) || 0;
      const paidCommissions = commissionsData.data?.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0) || 0;

      return {
        activePrescribers: prescribersCount.count || 0,
        totalCommissions,
        pendingCommissions,
        paidCommissions,
      };
    },
  });

  const generateReferralCode = () => {
    const prefix = 'SC';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const createPrescriber = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from('prescribers' as any) as any).insert({
        ...newPrescriber,
        referral_code: generateReferralCode(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prescribers'] });
      queryClient.invalidateQueries({ queryKey: ['prescriber-stats'] });
      setIsDialogOpen(false);
      setNewPrescriber({ type: 'nurse', name: '', email: '', phone: '', organization: '', commission_rate: 10 });
      toast.success('Prescripteur créé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase.from('prescribers' as any) as any)
        .update({ is_active: !is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prescribers'] });
      toast.success('Statut mis à jour');
    },
  });

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié !');
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
          <h1 className="text-3xl font-display font-bold">Prescripteurs</h1>
          <p className="text-muted-foreground">Gérez les codes parrainage et commissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau prescripteur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un prescripteur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newPrescriber.type}
                  onValueChange={(v) => setNewPrescriber({ ...newPrescriber, type: v as PrescriberType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">Infirmier(ère)</SelectItem>
                    <SelectItem value="doctor">Médecin</SelectItem>
                    <SelectItem value="pharmacy">Pharmacie</SelectItem>
                    <SelectItem value="nursing_home">EHPAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nom complet *</Label>
                <Input
                  value={newPrescriber.name}
                  onChange={(e) => setNewPrescriber({ ...newPrescriber, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newPrescriber.email}
                  onChange={(e) => setNewPrescriber({ ...newPrescriber, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={newPrescriber.phone}
                  onChange={(e) => setNewPrescriber({ ...newPrescriber, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Organisation</Label>
                <Input
                  value={newPrescriber.organization}
                  onChange={(e) => setNewPrescriber({ ...newPrescriber, organization: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Taux de commission (%)</Label>
                <Input
                  type="number"
                  value={newPrescriber.commission_rate}
                  onChange={(e) => setNewPrescriber({ ...newPrescriber, commission_rate: parseFloat(e.target.value) })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createPrescriber.mutate()}
                disabled={!newPrescriber.name || !newPrescriber.email || createPrescriber.isPending}
              >
                {createPrescriber.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer le prescripteur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prescripteurs actifs</p>
                <p className="text-2xl font-bold">{stats?.activePrescribers || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commissions totales</p>
                <p className="text-2xl font-bold">{(stats?.totalCommissions || 0).toFixed(2)} €</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <Euro className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{(stats?.pendingCommissions || 0).toFixed(2)} €</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Déjà payées</p>
                <p className="text-2xl font-bold">{(stats?.paidCommissions || 0).toFixed(2)} €</p>
              </div>
              <div className="p-3 rounded-xl bg-muted">
                <Building className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescribers list */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des prescripteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Code parrainage</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescribers?.map((prescriber) => (
                <TableRow key={prescriber.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{prescriber.name}</p>
                      <p className="text-sm text-muted-foreground">{prescriber.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[prescriber.type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{prescriber.referral_code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyReferralCode(prescriber.referral_code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{prescriber.commission_rate}%</TableCell>
                  <TableCell>
                    <Badge variant={prescriber.is_active ? 'default' : 'secondary'}>
                      {prescriber.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(prescriber.created_at), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive.mutate({ id: prescriber.id, is_active: prescriber.is_active })}
                    >
                      {prescriber.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!prescribers || prescribers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun prescripteur enregistré
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

export default AdminPrescribers;
