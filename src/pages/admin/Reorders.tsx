import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Plus, 
  Loader2,
  Package,
  Truck,
  Check,
  Clock,
  X,
  ShoppingCart,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReorderItem {
  id: string;
  product_id: string;
  product_size: string | null;
  quantity: number;
  unit_price: number | null;
  received_quantity: number;
  products?: {
    name: string;
    sku: string | null;
  };
}

interface ReorderRequest {
  id: string;
  supplier_id: string;
  status: string;
  notes: string | null;
  total_amount: number | null;
  ordered_at: string | null;
  received_at: string | null;
  created_at: string;
  suppliers?: {
    name: string;
  };
  reorder_items?: ReorderItem[];
}

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  purchase_price: number | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-800', icon: Clock },
  ordered: { label: 'Commandé', color: 'bg-blue-100 text-blue-800', icon: ShoppingCart },
  shipped: { label: 'Expédié', color: 'bg-purple-100 text-purple-800', icon: Truck },
  received: { label: 'Reçu', color: 'bg-green-100 text-green-800', icon: Check },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: X }
};

const AdminReorders: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{
    product_id: string;
    product_size: string;
    quantity: number;
    unit_price: number;
  }>>([]);

  const { data: reorders, isLoading } = useQuery({
    queryKey: ['reorder-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reorder_requests')
        .select(`
          *,
          suppliers (name),
          reorder_items (
            *,
            products (name, sku)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReorderRequest[];
    }
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Supplier[];
    }
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-reorder'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, purchase_price')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Product[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      // Create reorder request
      const { data: reorder, error: reorderError } = await supabase
        .from('reorder_requests')
        .insert({
          supplier_id: selectedSupplier,
          notes: notes || null,
          total_amount: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        })
        .select()
        .single();

      if (reorderError) throw reorderError;

      // Create reorder items
      const reorderItems = items.map(item => ({
        reorder_request_id: reorder.id,
        product_id: item.product_id,
        product_size: item.product_size || null,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('reorder_items')
        .insert(reorderItems);

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reorder-requests'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Demande de réassort créée');
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, any> = { status };
      
      if (status === 'ordered') {
        updates.ordered_at = new Date().toISOString();
      } else if (status === 'received') {
        updates.received_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reorder_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reorder-requests'] });
      toast.success('Statut mis à jour');
    }
  });

  const resetForm = () => {
    setSelectedSupplier('');
    setNotes('');
    setItems([]);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', product_size: '', quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price from product
    if (field === 'product_id' && products) {
      const product = products.find(p => p.id === value);
      if (product?.purchase_price) {
        newItems[index].unit_price = Number(product.purchase_price);
      }
    }
    
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Réassort</h1>
          <p className="text-muted-foreground">Gérez vos commandes de réapprovisionnement</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusConfig).slice(0, 4).map(([status, config]) => {
          const count = reorders?.filter(r => r.status === status).length || 0;
          const Icon = config.icon;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-full", config.color.replace('text-', 'bg-').replace('-800', '-100'))}>
                    <Icon className={cn("h-4 w-4", config.color.split(' ')[1])} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reorders List */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de réassort</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !reorders || reorders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune demande de réassort</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {reorders.map((reorder) => {
                const config = statusConfig[reorder.status] || statusConfig.pending;
                const StatusIcon = config.icon;

                return (
                  <AccordionItem key={reorder.id} value={reorder.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4 w-full mr-4">
                        <Badge className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <span className="font-medium">{reorder.suppliers?.name}</span>
                        <span className="text-muted-foreground text-sm">
                          {format(new Date(reorder.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="ml-auto font-medium">
                          {reorder.total_amount?.toFixed(2)} €
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {/* Items */}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produit</TableHead>
                              <TableHead>Taille</TableHead>
                              <TableHead className="text-right">Qté commandée</TableHead>
                              <TableHead className="text-right">Qté reçue</TableHead>
                              <TableHead className="text-right">Prix unit.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reorder.reorder_items?.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.products?.name}</TableCell>
                                <TableCell>{item.product_size || '-'}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{item.received_quantity}</TableCell>
                                <TableCell className="text-right">{item.unit_price?.toFixed(2)} €</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {/* Notes */}
                        {reorder.notes && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {reorder.notes}
                          </p>
                        )}

                        {/* Status Actions */}
                        <div className="flex gap-2">
                          {reorder.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ id: reorder.id, status: 'ordered' })}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Marquer comme commandé
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateStatusMutation.mutate({ id: reorder.id, status: 'cancelled' })}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Annuler
                              </Button>
                            </>
                          )}
                          {reorder.status === 'ordered' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ id: reorder.id, status: 'shipped' })}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Marquer comme expédié
                            </Button>
                          )}
                          {reorder.status === 'shipped' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ id: reorder.id, status: 'received' })}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Marquer comme reçu
                            </Button>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de réassort</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fournisseur *</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Articles</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun article ajouté
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">Produit</Label>
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => updateItem(index, 'product_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Produit" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} {product.sku && `(${product.sku})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Label className="text-xs">Taille</Label>
                        <Input
                          placeholder="Taille"
                          value={item.product_size}
                          onChange={(e) => updateItem(index, 'product_size', e.target.value)}
                        />
                      </div>
                      <div className="w-20">
                        <Label className="text-xs">Qté</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">Prix unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className="text-right font-medium">
                  Total: {totalAmount.toFixed(2)} €
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes pour cette commande..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => createMutation.mutate()}
              disabled={!selectedSupplier || items.length === 0 || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReorders;
