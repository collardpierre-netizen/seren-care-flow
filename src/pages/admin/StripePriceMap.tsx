import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Search, CreditCard, RefreshCw, AlertCircle, Zap, Check, Package } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface StripePriceMapEntry {
  id: string;
  product_id: string;
  product_size: string | null;
  stripe_price_id: string;
  type: string;
  unit_amount: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  product?: {
    name: string;
    slug: string;
  };
}

interface ProductWithDetails {
  id: string;
  name: string;
  slug: string;
  price: number;
  subscription_price: number | null;
  sizes: { size: string; is_active: boolean; sale_price: number | null; price_adjustment: number | null }[];
}

interface FormData {
  product_id: string;
  product_size: string;
  stripe_price_id: string;
  type: string;
  unit_amount: number;
  currency: string;
  is_active: boolean;
}

const initialFormData: FormData = {
  product_id: '',
  product_size: '',
  stripe_price_id: '',
  type: 'subscription',
  unit_amount: 0,
  currency: 'eur',
  is_active: true,
};

const AdminStripePriceMap: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StripePriceMapEntry | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [autoCreateDialogOpen, setAutoCreateDialogOpen] = useState(false);
  const [selectedForAutoCreate, setSelectedForAutoCreate] = useState<Set<string>>(new Set());
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch price mappings
  const { data: priceMappings, isLoading } = useQuery({
    queryKey: ['stripe-price-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_price_map')
        .select(`
          *,
          product:products(name, slug)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as StripePriceMapEntry[];
    },
  });

  // Fetch products with subscription prices
  const { data: products } = useQuery({
    queryKey: ['products-for-mapping'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, price, subscription_price, sizes:product_sizes(size, is_active, sale_price, price_adjustment)')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as ProductWithDetails[];
    },
  });

  // Products without mapping (for auto-create)
  const productsWithoutMapping = products?.filter(product => {
    const hasMapping = priceMappings?.some(m => m.product_id === product.id);
    const hasSubscriptionPrice = product.subscription_price && product.subscription_price > 0;
    return !hasMapping && hasSubscriptionPrice;
  }) || [];

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('stripe_price_map').insert({
        product_id: data.product_id,
        product_size: data.product_size || null,
        stripe_price_id: data.stripe_price_id,
        type: data.type,
        unit_amount: data.unit_amount,
        currency: data.currency,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-price-map'] });
      toast.success('Mapping créé avec succès');
      closeDialog();
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Ce mapping existe déjà (produit + taille + type)');
      } else {
        toast.error('Erreur lors de la création');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const { error } = await supabase.from('stripe_price_map').update({
        product_id: data.product_id,
        product_size: data.product_size || null,
        stripe_price_id: data.stripe_price_id,
        type: data.type,
        unit_amount: data.unit_amount,
        currency: data.currency,
        is_active: data.is_active,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-price-map'] });
      toast.success('Mapping mis à jour');
      closeDialog();
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stripe_price_map').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-price-map'] });
      toast.success('Mapping supprimé');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
    setFormData(initialFormData);
  };

  const openEditDialog = (entry: StripePriceMapEntry) => {
    setEditingEntry(entry);
    setFormData({
      product_id: entry.product_id,
      product_size: entry.product_size || '',
      stripe_price_id: entry.stripe_price_id,
      type: entry.type,
      unit_amount: entry.unit_amount,
      currency: entry.currency,
      is_active: entry.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.stripe_price_id) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Auto-create prices
  const handleAutoCreate = async () => {
    if (selectedForAutoCreate.size === 0) {
      toast.error('Sélectionnez au moins un produit');
      return;
    }

    setIsAutoCreating(true);
    let successCount = 0;
    let errorCount = 0;

    for (const productId of selectedForAutoCreate) {
      const product = products?.find(p => p.id === productId);
      if (!product || !product.subscription_price) continue;

      try {
        const priceCents = Math.round(product.subscription_price * 100);
        
        const { data, error } = await supabase.functions.invoke('create-stripe-price', {
          body: {
            product_id: productId,
            product_size: null,
            price_cents: priceCents,
          },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);
        
        successCount++;
      } catch (err) {
        console.error(`Failed to create price for ${product.name}:`, err);
        errorCount++;
      }
    }

    setIsAutoCreating(false);
    setAutoCreateDialogOpen(false);
    setSelectedForAutoCreate(new Set());
    queryClient.invalidateQueries({ queryKey: ['stripe-price-map'] });

    if (successCount > 0) {
      toast.success(`${successCount} prix Stripe créés avec succès`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} erreurs lors de la création`);
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSet = new Set(selectedForAutoCreate);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setSelectedForAutoCreate(newSet);
  };

  const selectAllProducts = () => {
    if (selectedForAutoCreate.size === productsWithoutMapping.length) {
      setSelectedForAutoCreate(new Set());
    } else {
      setSelectedForAutoCreate(new Set(productsWithoutMapping.map(p => p.id)));
    }
  };

  // Get sizes for selected product in manual form
  const selectedProduct = products?.find(p => p.id === formData.product_id);
  const availableSizes = selectedProduct?.sizes?.filter((s: any) => s.is_active) || [];

  const filteredMappings = priceMappings?.filter(mapping => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      mapping.product?.name?.toLowerCase().includes(searchLower) ||
      mapping.stripe_price_id.toLowerCase().includes(searchLower) ||
      mapping.product_size?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Stripe Price Map
          </h1>
          <p className="text-muted-foreground mt-1">
            Associez les produits aux prix récurrents Stripe pour les abonnements
          </p>
        </div>
        <div className="flex gap-2">
          {productsWithoutMapping.length > 0 && (
            <Button variant="secondary" onClick={() => setAutoCreateDialogOpen(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Auto-créer ({productsWithoutMapping.length})
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEntry(null); setFormData(initialFormData); }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter manuellement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Modifier le mapping' : 'Nouveau mapping'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product_id">Produit *</Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(v) => setFormData({ ...formData, product_id: v, product_size: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="product_size">Taille (optionnel)</Label>
                    <Select
                      value={formData.product_size}
                      onValueChange={(v) => setFormData({ ...formData, product_size: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes tailles (prix par défaut)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes tailles</SelectItem>
                        {availableSizes.map((size: any) => (
                          <SelectItem key={size.size} value={size.size}>
                            {size.size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="stripe_price_id">Stripe Price ID *</Label>
                  <Input
                    id="stripe_price_id"
                    value={formData.stripe_price_id}
                    onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                    placeholder="price_..."
                  />
                  <p className="text-xs text-muted-foreground">
                    ID du prix récurrent Stripe (ex: price_1234abcd)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_amount">Montant (centimes TTC)</Label>
                    <Input
                      id="unit_amount"
                      type="number"
                      min={0}
                      value={formData.unit_amount}
                      onChange={(e) => setFormData({ ...formData, unit_amount: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(formData.unit_amount / 100).toFixed(2)} €
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Abonnement</SelectItem>
                        <SelectItem value="one_shot">Achat unique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                  />
                  <Label htmlFor="is_active">Actif</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingEntry ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Création automatique des prix Stripe</p>
              <p className="text-amber-700">
                Cliquez sur "Auto-créer" pour générer automatiquement les prix récurrents dans Stripe 
                à partir des prix d'abonnement définis dans les fiches produits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !filteredMappings?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun mapping trouvé</p>
              <p className="text-sm">Commencez par ajouter un mapping produit ↔ Stripe</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Stripe Price ID</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium">
                      {mapping.product?.name || mapping.product_id}
                    </TableCell>
                    <TableCell>
                      {mapping.product_size || <span className="text-muted-foreground">Toutes</span>}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {mapping.stripe_price_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      {(mapping.unit_amount / 100).toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <Badge variant={mapping.type === 'subscription' ? 'default' : 'secondary'}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {mapping.type === 'subscription' ? 'Abo' : 'Unique'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={mapping.is_active ? 'default' : 'outline'}>
                        {mapping.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(mapping)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(mapping.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Auto-create dialog */}
      <Dialog open={autoCreateDialogOpen} onOpenChange={setAutoCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Créer automatiquement les prix Stripe
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les produits pour lesquels créer un prix récurrent Stripe.
              Le prix sera basé sur le "Prix abonnement" défini dans la fiche produit.
            </p>

            {productsWithoutMapping.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Tous les produits avec un prix d'abonnement ont déjà un mapping Stripe !</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={selectedForAutoCreate.size === productsWithoutMapping.length}
                    onCheckedChange={selectAllProducts}
                  />
                  <Label className="text-sm font-medium">
                    Tout sélectionner ({productsWithoutMapping.length} produits)
                  </Label>
                </div>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {productsWithoutMapping.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <Checkbox 
                        checked={selectedForAutoCreate.has(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                      />
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Prix abo: {product.subscription_price?.toFixed(2)} € / mois
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {Math.round((product.subscription_price || 0) * 100)} cts
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAutoCreate} 
              disabled={selectedForAutoCreate.size === 0 || isAutoCreating}
            >
              {isAutoCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Créer {selectedForAutoCreate.size} prix
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce mapping ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les produits associés ne pourront plus être ajoutés aux abonnements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminStripePriceMap;
