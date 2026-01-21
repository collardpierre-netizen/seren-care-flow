import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Users, UserPlus, Shield, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  roles: AppRole[];
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  user: 'Utilisateur',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-destructive text-destructive-foreground',
  manager: 'bg-primary text-primary-foreground',
  user: 'bg-muted text-muted-foreground',
};

const ROLE_ICONS: Record<AppRole, React.ReactNode> = {
  admin: <ShieldAlert className="h-3 w-3" />,
  manager: <ShieldCheck className="h-3 w-3" />,
  user: <Shield className="h-3 w-3" />,
};

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');

  // Fetch all profiles with their roles
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-with-roles'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Map roles to users
      const rolesByUser: Record<string, AppRole[]> = {};
      roles?.forEach(r => {
        if (!rolesByUser[r.user_id]) {
          rolesByUser[r.user_id] = [];
        }
        rolesByUser[r.user_id].push(r.role);
      });

      // Combine profiles with roles
      const usersWithRoles: UserWithRoles[] = profiles.map(profile => ({
        ...profile,
        roles: rolesByUser[profile.id] || ['user'],
      }));

      return usersWithRoles;
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Cet utilisateur a déjà ce rôle');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-roles'] });
      toast.success('Rôle ajouté avec succès');
      setIsAddRoleDialogOpen(false);
      setSelectedUserId(null);
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-roles'] });
      toast.success('Rôle retiré avec succès');
    },
    onError: (error: Error) => {
      toast.error('Erreur', { description: error.message });
    },
  });

  const filteredUsers = users?.filter(user => {
    const searchLower = search.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const openAddRoleDialog = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedRole('user');
    setIsAddRoleDialogOpen(true);
  };

  const handleAddRole = () => {
    if (selectedUserId && selectedRole) {
      addRoleMutation.mutate({ userId: selectedUserId, role: selectedRole });
    }
  };

  const handleRemoveRole = (userId: string, role: AppRole) => {
    if (confirm(`Retirer le rôle "${ROLE_LABELS[role]}" de cet utilisateur ?`)) {
      removeRoleMutation.mutate({ userId, role });
    }
  };

  const selectedUser = users?.find(u => u.id === selectedUserId);
  const availableRoles = selectedUser 
    ? (['admin', 'manager', 'user'] as AppRole[]).filter(r => !selectedUser.roles.includes(r))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">Gérez les utilisateurs et leurs rôles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total utilisateurs</CardDescription>
            <CardTitle className="text-2xl">{users?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Administrateurs</CardDescription>
            <CardTitle className="text-2xl">
              {users?.filter(u => u.roles.includes('admin')).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Managers</CardDescription>
            <CardTitle className="text-2xl">
              {users?.filter(u => u.roles.includes('manager')).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
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
          ) : filteredUsers?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : 'Utilisateur'}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge 
                            key={role} 
                            variant="secondary"
                            className={`${ROLE_COLORS[role]} flex items-center gap-1 cursor-pointer hover:opacity-80`}
                            onClick={() => handleRemoveRole(user.id, role)}
                            title="Cliquer pour retirer ce rôle"
                          >
                            {ROLE_ICONS[role]}
                            {ROLE_LABELS[role]}
                            <Trash2 className="h-3 w-3 ml-1 opacity-60" />
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddRoleDialog(user.id)}
                        disabled={user.roles.length >= 3}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Ajouter rôle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un rôle</DialogTitle>
            <DialogDescription>
              Attribuer un nouveau rôle à {selectedUser?.first_name || selectedUser?.email || 'cet utilisateur'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableRoles.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Cet utilisateur possède déjà tous les rôles disponibles.
              </p>
            ) : (
              <div className="space-y-2">
                <Label>Sélectionner un rôle</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          {ROLE_ICONS[role]}
                          {ROLE_LABELS[role]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddRole} 
              disabled={addRoleMutation.isPending || availableRoles.length === 0}
            >
              {addRoleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter le rôle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
