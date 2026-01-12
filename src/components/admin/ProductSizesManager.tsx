import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, Ruler } from 'lucide-react';

interface ProductSize {
  id?: string;
  size: string;
  sku: string;
  ean_code: string;
  cnk_code: string;
  units_per_size: number;
  public_price: number | null;
  sale_price: number | null;
  purchase_price: number | null;
  stock_quantity: number;
  is_active: boolean;
}

interface ProductSizesManagerProps {
  productId: string | null;
  productSku?: string;
  basePrice?: number;
  basePurchasePrice?: number;
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const ProductSizesManager: React.FC<ProductSizesManagerProps> = ({
  productId,
  productSku = '',
  basePrice = 0,
  basePurchasePrice = 0,
}) => {
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [newSize, setNewSize] = useState('');
  const queryClient = useQueryClient();

  // Fetch existing sizes
  const { data: existingSizes, isLoading } = useQuery({
    queryKey: ['product-sizes', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', productId)
        .order('size');
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (existingSizes) {
      setSizes(existingSizes.map(s => ({
        id: s.id,
        size: s.size,
        sku: s.sku || '',
        ean_code: (s as any).ean_code || '',
        cnk_code: (s as any).cnk_code || '',
        units_per_size: (s as any).units_per_size || 1,
        public_price: (s as any).public_price != null ? Number((s as any).public_price) : null,
        sale_price: s.sale_price != null ? Number(s.sale_price) : null,
        purchase_price: s.purchase_price != null ? Number(s.purchase_price) : null,
        stock_quantity: s.stock_quantity || 0,
        is_active: s.is_active !== false,
      })));
    }
  }, [existingSizes]);

  const saveSizesMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error('Product ID required');

      // Delete all existing sizes first
      await supabase.from('product_sizes').delete().eq('product_id', productId);

      // Insert new sizes
      if (sizes.length > 0) {
        const sizesToInsert = sizes.map(s => ({
          product_id: productId,
          size: s.size,
          sku: s.sku || null,
          ean_code: s.ean_code || null,
          cnk_code: s.cnk_code || null,
          units_per_size: s.units_per_size || 1,
          public_price: s.public_price,
          sale_price: s.sale_price,
          purchase_price: s.purchase_price,
          stock_quantity: s.stock_quantity || 0,
          is_active: s.is_active,
        }));

        const { error } = await supabase.from('product_sizes').insert(sizesToInsert as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-sizes', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Tailles enregistrées');
    },
    onError: () => {
      toast.error('Erreur lors de l\'enregistrement des tailles');
    },
  });

  const addSize = (size: string) => {
    if (!size.trim()) return;
    if (sizes.some(s => s.size.toUpperCase() === size.toUpperCase())) {
      toast.error('Cette taille existe déjà');
      return;
    }

    setSizes(prev => [...prev, {
      size: size.toUpperCase(),
      sku: productSku ? `${productSku}-${size.toUpperCase()}` : '',
      ean_code: '',
      cnk_code: '',
      units_per_size: 1,
      public_price: null,
      sale_price: null,
      purchase_price: null,
      stock_quantity: 0,
      is_active: true,
    }]);
    setNewSize('');
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof ProductSize, value: unknown) => {
    setSizes(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addDefaultSizes = () => {
    const newSizes: ProductSize[] = [];
    DEFAULT_SIZES.forEach(size => {
      if (!sizes.some(s => s.size === size)) {
        newSizes.push({
          size,
          sku: productSku ? `${productSku}-${size}` : '',
          ean_code: '',
          cnk_code: '',
          units_per_size: 1,
          public_price: null,
          sale_price: null,
          purchase_price: null,
          stock_quantity: 0,
          is_active: true,
        });
      }
    });
    setSizes(prev => [...prev, ...newSizes]);
  };

  if (!productId) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center text-muted-foreground">
        <Ruler className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Enregistrez d'abord le produit pour gérer les tailles</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          <h4 className="font-semibold text-sm">Tailles / Variantes</h4>
          {sizes.length > 0 && (
            <Badge variant="secondary">{sizes.length} taille(s)</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDefaultSizes}
          >
            + Tailles standard
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => saveSizesMutation.mutate()}
            disabled={saveSizesMutation.isPending}
          >
            {saveSizesMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Add new size */}
      <div className="flex gap-2">
        <Input
          placeholder="Nouvelle taille (ex: S, M, L, 38, 40...)"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSize(newSize);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addSize(newSize)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Sizes list */}
      {sizes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune taille définie. Ce produit sera vendu sans sélection de taille.
        </p>
      ) : (
        <div className="space-y-3">
          {sizes.map((size, index) => (
            <div key={index} className="bg-background p-3 rounded-md border space-y-3">
              {/* Row 1: Size, SKU, EAN, CNK */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1">
                  <Badge variant="outline" className="font-mono text-xs w-full justify-center">
                    {size.size}
                  </Badge>
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">SKU</label>
                  <Input
                    value={size.sku}
                    onChange={(e) => updateSize(index, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Code EAN</label>
                  <Input
                    value={size.ean_code}
                    onChange={(e) => updateSize(index, 'ean_code', e.target.value)}
                    placeholder="Code EAN"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Code CNK</label>
                  <Input
                    value={size.cnk_code}
                    onChange={(e) => updateSize(index, 'cnk_code', e.target.value)}
                    placeholder="Code CNK"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeSize(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Row 2: Units, Public Price, SerenCare Price, Purchase Price, Stock, Active */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1"></div>
                <div className="col-span-2">
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Unités/variant</label>
                  <Input
                    type="number"
                    value={size.units_per_size || ''}
                    onChange={(e) => updateSize(index, 'units_per_size', parseInt(e.target.value) || 1)}
                    placeholder="1"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Prix public (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={size.public_price ?? ''}
                    onChange={(e) => updateSize(index, 'public_price', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="0.00"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Prix SerenCare (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={size.sale_price ?? ''}
                    onChange={(e) => updateSize(index, 'sale_price', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={basePrice ? basePrice.toFixed(2) : "0.00"}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Prix achat (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={size.purchase_price ?? ''}
                    onChange={(e) => updateSize(index, 'purchase_price', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={basePurchasePrice ? basePurchasePrice.toFixed(2) : "0.00"}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] text-muted-foreground mb-0.5 block">Stock</label>
                  <Input
                    type="number"
                    value={size.stock_quantity || ''}
                    onChange={(e) => updateSize(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-2 flex items-end gap-2 pb-0.5">
                  <Switch
                    checked={size.is_active}
                    onCheckedChange={(v) => updateSize(index, 'is_active', v)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {size.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p>💡 <strong>Prix public :</strong> Prix de vente conseillé (PVPC)</p>
        <p>💡 <strong>Prix SerenCare :</strong> Prix de vente sur notre site (si vide, utilise le prix de base)</p>
        <p>💡 <strong>Prix achat :</strong> Prix d'achat fournisseur pour cette variante</p>
        <p>💡 <strong>Unités :</strong> Nombre d'unités dans cette variante (ex: paquet de 28)</p>
      </div>
    </div>
  );
};
