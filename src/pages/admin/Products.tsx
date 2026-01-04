import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Search, Package } from 'lucide-react';

interface ProductFormData {
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;
  short_description: string;
  description: string;
  incontinence_level: string;
  mobility: string;
  usage_time: string;
  price: number;
  subscription_price: number;
  min_order_quantity: number;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  slug: '',
  brand_id: '',
  category_id: '',
  short_description: '',
  description: '',
  incontinence_level: '',
  mobility: '',
  usage_time: '',
  price: 0,
  subscription_price: 0,
  min_order_quantity: 1,
  stock_quantity: 0,
  sku: '',
  is_active: true,
  is_featured: false,
};

const AdminProducts: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, brand:brands(name), category:categories(name)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const insertData = {
        name: data.name,
        slug: data.slug,
        brand_id: data.brand_id || null,
        category_id: data.category_id || null,
        short_description: data.short_description || null,
        description: data.description || null,
        incontinence_level: (data.incontinence_level || null) as 'light' | 'moderate' | 'heavy' | 'very_heavy' | null,
        mobility: (data.mobility || null) as 'mobile' | 'reduced' | 'bedridden' | null,
        usage_time: (data.usage_time || null) as 'day' | 'night' | 'day_night' | null,
        price: data.price,
        subscription_price: data.subscription_price || null,
        min_order_quantity: data.min_order_quantity,
        stock_quantity: data.stock_quantity,
        sku: data.sku || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
      };
      const { error } = await supabase.from('products').insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produit créé avec succès');
      setIsDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: () => {
      toast.error('Erreur lors de la création du produit');
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const updateData = {
        name: data.name,
        slug: data.slug,
        brand_id: data.brand_id || null,
        category_id: data.category_id || null,
        short_description: data.short_description || null,
        description: data.description || null,
        incontinence_level: (data.incontinence_level || null) as 'light' | 'moderate' | 'heavy' | 'very_heavy' | null,
        mobility: (data.mobility || null) as 'mobile' | 'reduced' | 'bedridden' | null,
        usage_time: (data.usage_time || null) as 'day' | 'night' | 'day_night' | null,
        price: data.price,
        subscription_price: data.subscription_price || null,
        min_order_quantity: data.min_order_quantity,
        stock_quantity: data.stock_quantity,
        sku: data.sku || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
      };
      const { error } = await supabase.from('products').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produit mis à jour');
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(initialFormData);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produit supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      brand_id: product.brand_id || '',
      category_id: product.category_id || '',
      short_description: product.short_description || '',
      description: product.description || '',
      incontinence_level: product.incontinence_level || '',
      mobility: product.mobility || '',
      usage_time: product.usage_time || '',
      price: product.price,
      subscription_price: product.subscription_price || 0,
      min_order_quantity: product.min_order_quantity || 1,
      stock_quantity: product.stock_quantity || 0,
      sku: product.sku || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: formData });
    } else {
      createProduct.mutate(formData);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const incontinenceLevels = [
    { value: 'light', label: 'Légère' },
    { value: 'moderate', label: 'Modérée' },
    { value: 'heavy', label: 'Forte' },
    { value: 'very_heavy', label: 'Très forte' },
  ];

  const mobilityTypes = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'reduced', label: 'Réduite' },
    { value: 'bedridden', label: 'Alité' },
  ];

  const usageTimes = [
    { value: 'day', label: 'Jour' },
    { value: 'night', label: 'Nuit' },
    { value: 'day_night', label: 'Jour & Nuit' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Produits</h1>
          <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            setFormData(initialFormData);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        name: e.target.value,
                        slug: editingProduct ? formData.slug : generateSlug(e.target.value)
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marque</Label>
                  <Select value={formData.brand_id} onValueChange={(v) => setFormData({ ...formData, brand_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {brands?.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description courte</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description complète</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Niveau d'incontinence</Label>
                  <Select value={formData.incontinence_level} onValueChange={(v) => setFormData({ ...formData, incontinence_level: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {incontinenceLevels.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mobilité</Label>
                  <Select value={formData.mobility} onValueChange={(v) => setFormData({ ...formData, mobility: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {mobilityTypes.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moment d'utilisation</Label>
                  <Select value={formData.usage_time} onValueChange={(v) => setFormData({ ...formData, usage_time: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {usageTimes.map(u => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription_price">Prix abonnement (€)</Label>
                  <Input
                    id="subscription_price"
                    type="number"
                    step="0.01"
                    value={formData.subscription_price}
                    onChange={(e) => setFormData({ ...formData, subscription_price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantité min.</Label>
                  <Input
                    type="number"
                    value={formData.min_order_quantity}
                    onChange={(e) => setFormData({ ...formData, min_order_quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                  <Label htmlFor="is_active">Actif</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                  />
                  <Label htmlFor="is_featured">Mis en avant</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                  {(createProduct.isPending || updateProduct.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingProduct ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun produit trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand?.name || '-'}</TableCell>
                    <TableCell>{product.category?.name || '-'}</TableCell>
                    <TableCell>{product.price.toFixed(2)} €</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            if (confirm('Supprimer ce produit ?')) {
                              deleteProduct.mutate(product.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
    </div>
  );
};

export default AdminProducts;
