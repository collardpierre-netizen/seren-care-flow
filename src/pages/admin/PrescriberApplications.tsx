import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Loader2, UserPlus, Eye, Check, X, Clock, Phone, Mail, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

type ApplicationStatus = 'pending' | 'contacted' | 'approved' | 'rejected';

interface PrescriberApplication {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization_name: string | null;
  organization_type: string;
  job_title: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  patient_count: string | null;
  message: string | null;
  status: ApplicationStatus;
  notes: string | null;
}

const statusConfig: Record<ApplicationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: 'En attente', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  contacted: { label: 'Contacté', variant: 'outline', icon: <Phone className="h-3 w-3" /> },
  approved: { label: 'Approuvé', variant: 'default', icon: <Check className="h-3 w-3" /> },
  rejected: { label: 'Refusé', variant: 'destructive', icon: <X className="h-3 w-3" /> },
};

const organizationTypeLabels: Record<string, string> = {
  institution: 'Établissement de santé',
  doctor: 'Médecin',
  nurse: 'Infirmier(ère)',
  pharmacist: 'Pharmacien(ne)',
  other: 'Autre',
};

const AdminPrescriberApplications: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<PrescriberApplication | null>(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('pending');
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin-prescriber-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriber_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PrescriberApplication[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ApplicationStatus; notes: string }) => {
      const { error } = await supabase
        .from('prescriber_applications')
        .update({ status, notes })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prescriber-applications'] });
      toast({
        title: 'Candidature mise à jour',
        description: 'Le statut a été modifié avec succès.',
      });
      setSelectedApplication(null);
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la candidature.',
        variant: 'destructive',
      });
    },
  });

  const filteredApplications = applications?.filter(app => {
    const searchLower = search.toLowerCase();
    const matchesSearch = (
      app.first_name?.toLowerCase().includes(searchLower) ||
      app.last_name?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower) ||
      app.organization_name?.toLowerCase().includes(searchLower)
    );
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetails = (application: PrescriberApplication) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setNewStatus(application.status);
  };

  const handleSave = () => {
    if (selectedApplication) {
      updateMutation.mutate({
        id: selectedApplication.id,
        status: newStatus,
        notes,
      });
    }
  };

  const statusCounts = applications?.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Candidatures Partenaires</h1>
        <p className="text-muted-foreground">Gérez les demandes de partenariat prescripteurs</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{statusCounts.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contactées</p>
                <p className="text-2xl font-bold">{statusCounts.contacted || 0}</p>
              </div>
              <Phone className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvées</p>
                <p className="text-2xl font-bold">{statusCounts.approved || 0}</p>
              </div>
              <Check className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refusées</p>
                <p className="text-2xl font-bold">{statusCounts.rejected || 0}</p>
              </div>
              <X className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email ou organisation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="contacted">Contacté</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredApplications?.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune candidature trouvée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications?.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium">
                        {application.first_name} {application.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{application.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {organizationTypeLabels[application.organization_type] || application.organization_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{application.organization_name || '-'}</TableCell>
                    <TableCell>
                      {application.city ? `${application.postal_code || ''} ${application.city}`.trim() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[application.status].variant} className="gap-1">
                        {statusConfig[application.status].icon}
                        {statusConfig[application.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetails(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedApplication.email}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedApplication.email}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <a href={`tel:${selectedApplication.phone}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {selectedApplication.phone}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date de candidature</p>
                  <p className="font-medium">
                    {format(new Date(selectedApplication.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Professional info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informations professionnelles
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type d'activité</p>
                    <Badge variant="outline">
                      {organizationTypeLabels[selectedApplication.organization_type] || selectedApplication.organization_type}
                    </Badge>
                  </div>
                  {selectedApplication.job_title && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fonction</p>
                      <p className="font-medium">{selectedApplication.job_title}</p>
                    </div>
                  )}
                  {selectedApplication.organization_name && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Organisation</p>
                      <p className="font-medium">{selectedApplication.organization_name}</p>
                    </div>
                  )}
                  {selectedApplication.patient_count && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Patients concernés</p>
                      <p className="font-medium">{selectedApplication.patient_count}</p>
                    </div>
                  )}
                </div>
                
                {(selectedApplication.address || selectedApplication.city) && (
                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="font-medium">
                      {selectedApplication.address && `${selectedApplication.address}, `}
                      {selectedApplication.postal_code} {selectedApplication.city}
                    </p>
                  </div>
                )}
              </div>

              {/* Message */}
              {selectedApplication.message && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Message du candidat</h4>
                  <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedApplication.message}
                  </p>
                </div>
              )}

              {/* Status update */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold">Gestion de la candidature</h4>
                
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Statut</label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="contacted">Contacté</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="rejected">Refusé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Notes internes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajoutez des notes sur cette candidature..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApplication(null)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPrescriberApplications;
