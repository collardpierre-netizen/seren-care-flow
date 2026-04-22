import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Loader2, Sparkles } from 'lucide-react';

interface ProductToAdd {
  id: string;
  name: string;
  price: number;
  subscription_price: number | null;
  subscription_discount_percent: number | null;
}

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingProductIds: string[];
  userPreferences?: {
    incontinence_level?: string;
    gender?: string;
    usage_time?: string;
  };
  onAddProduct: (product: ProductToAdd, size: string | null, quantity: number) => void;
}

export const AddProductDialog = ({
  open,
  onOpenChange,
  existingProductIds,
  userPreferences,
  onAddProduct,
}: AddProductDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductToAdd | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch all active products with sizes
  const { data: products, isLoading } = useQuery({
    queryKey: ['products-for-subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, price, subscription_price, subscription_discount_percent,
          incontinence_level, gender, usage_time,
          product_sizes (id, size, is_active, stock_quantity),
          product_images (image_url, is_primary)
        `)
        .eq('is_active', true)
        .eq('is_coming_soon', false);
      
      if (error) throw error;
      return data;
    },
  });

  // Filter products - exclude already in subscription
  const availableProducts = products?.filter(p => !existingProductIds.includes(p.id)) || [];

  // Separate suggested and other products — use normalised matchers so
  // alias/casing differences (e.g. 'Femme' vs 'female') never miss a match.
  const suggestedProducts = availableProducts.filter(p => {
    if (!userPreferences) return false;
    const matchLevel = !userPreferences.incontinence_level
      || matchesIncontinenceLevel(p.incontinence_level, userPreferences.incontinence_level);
    const matchGender = !userPreferences.gender
      || matchesGender(p.gender, userPreferences.gender);
    return matchLevel || matchGender;
  });

  const otherProducts = availableProducts.filter(p => !suggestedProducts.includes(p));

  // Search filter
  const filterBySearch = (prods: typeof availableProducts) => {
    if (!searchQuery.trim()) return prods;
    return prods.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredSuggested = filterBySearch(suggestedProducts);
  const filteredOther = filterBySearch(otherProducts);

  // Get sizes for selected product
  const selectedProductData = products?.find(p => p.id === selectedProduct?.id);
  const availableSizes = selectedProductData?.product_sizes?.filter(s => s.is_active && (s.stock_quantity ?? 0) > 0) || [];

  const handleSelectProduct = (product: typeof products[0]) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      subscription_price: product.subscription_price,
      subscription_discount_percent: product.subscription_discount_percent,
    });
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleAdd = () => {
    if (!selectedProduct) return;
    onAddProduct(selectedProduct, selectedSize, quantity);
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(1);
    onOpenChange(false);
  };

  const getSubscriptionPrice = (product: ProductToAdd) => {
    if (product.subscription_price) return product.subscription_price;
    const discount = product.subscription_discount_percent || 10;
    return product.price * (1 - discount / 100);
  };

  const renderProductItem = (product: typeof products[0], isSuggested: boolean) => {
    const primaryImage = product.product_images?.find(i => i.is_primary)?.image_url || 
                         product.product_images?.[0]?.image_url;
    const subPrice = getSubscriptionPrice(product);
    const isSelected = selectedProduct?.id === product.id;

    return (
      <div
        key={product.id}
        onClick={() => handleSelectProduct(product)}
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
        }`}
      >
        {primaryImage && (
          <img src={primaryImage} alt={product.name} className="w-12 h-12 object-cover rounded" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{product.name}</p>
            {isSuggested && (
              <Badge variant="secondary" className="text-xs shrink-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Recommandé
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground line-through">{product.price.toFixed(2)} €</span>
            <span className="text-primary font-medium">{subPrice.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ajouter un produit à l'abonnement</DialogTitle>
          <DialogDescription>
            Choisissez un produit à ajouter à votre abonnement
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : selectedProduct ? (
          /* Size and quantity selection */
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-primary">
                  {getSubscriptionPrice(selectedProduct).toFixed(2)} € / unité
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                Changer
              </Button>
            </div>

            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Taille</label>
                <Select value={selectedSize || ''} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map(size => (
                      <SelectItem key={size.id} value={size.size}>
                        {size.size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantité</label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Retour
              </Button>
              <Button 
                onClick={handleAdd}
                disabled={availableSizes.length > 0 && !selectedSize}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter ({(getSubscriptionPrice(selectedProduct) * quantity).toFixed(2)} €)
              </Button>
            </div>
          </div>
        ) : (
          /* Product list */
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 pb-4">
              {filteredSuggested.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Recommandés pour vous
                  </h4>
                  <div className="space-y-2">
                    {filteredSuggested.map(p => renderProductItem(p, true))}
                  </div>
                </div>
              )}

              {filteredOther.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Tous les produits
                  </h4>
                  <div className="space-y-2">
                    {filteredOther.map(p => renderProductItem(p, false))}
                  </div>
                </div>
              )}

              {filteredSuggested.length === 0 && filteredOther.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucun produit disponible
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
