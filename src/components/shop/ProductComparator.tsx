// SerenCare Product Comparator
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Scale, ChevronDown, Check, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { getEffectiveUsageTimes, getEffectiveMobilityLevels } from "@/hooks/useProductFilters";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductComparatorProps {
  initialProducts?: Product[];
  maxProducts?: number;
}

const incontinenceLevelLabels: Record<string, { label: string; level: number }> = {
  light: { label: "Légère", level: 1 },
  moderate: { label: "Modérée", level: 2 },
  heavy: { label: "Forte", level: 3 },
  very_heavy: { label: "Très forte", level: 4 },
};

const mobilityLabels: Record<string, string> = {
  mobile: "Mobile",
  reduced: "Mobilité réduite",
  bedridden: "Alité",
  reduite: "Mobilité réduite",
  alitee: "Alité",
};

const usageTimeLabels: Record<string, string> = {
  day: "Jour",
  night: "Nuit",
  day_night: "Jour & Nuit",
};

// Helper function to format usage times from multi-tags
const formatUsageTimes = (product: any): string => {
  const usageTimes = getEffectiveUsageTimes(product);
  if (!usageTimes) return "-";
  
  const tags = usageTimes.split('|').map(t => t.trim().toLowerCase());
  
  // If both day and night, show "Jour & Nuit"
  if (tags.includes('day') && tags.includes('night')) {
    return "Jour & Nuit";
  }
  
  // Map individual tags
  const labels = tags.map(tag => usageTimeLabels[tag]).filter(Boolean);
  return labels.length > 0 ? labels.join(' & ') : "-";
};

// Helper function to format mobility from multi-tags
const formatMobility = (product: any): string => {
  const mobilityLevels = getEffectiveMobilityLevels(product);
  if (!mobilityLevels) return "-";
  
  const tags = mobilityLevels.split('|').map(t => t.trim().toLowerCase());
  const labels = tags.map(tag => mobilityLabels[tag]).filter(Boolean);
  
  // Remove duplicates and join
  const uniqueLabels = [...new Set(labels)];
  return uniqueLabels.length > 0 ? uniqueLabels.join(', ') : (product.mobility ? mobilityLabels[product.mobility] || "-" : "-");
};

export function ProductComparator({ 
  initialProducts = [], 
  maxProducts = 3 
}: ProductComparatorProps) {
  const [compareProducts, setCompareProducts] = useState<Product[]>(initialProducts);
  const [isOpen, setIsOpen] = useState(false);
  const { data: allProducts } = useProducts();
  const { addItem, openCart } = useCart();

  const addToCompare = (productId: string) => {
    const product = allProducts?.find(p => p.id === productId);
    if (product && compareProducts.length < maxProducts) {
      setCompareProducts([...compareProducts, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareProducts(compareProducts.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareProducts([]);
  };

  const handleAddToCart = (product: Product) => {
    const images = product.images?.length ? product.images : [{ image_url: '/placeholder.svg' }];
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: images[0]?.image_url,
      quantity: 1,
      unitPrice: product.price,
      isSubscription: false,
    });
    toast.success("Produit ajouté au panier");
  };

  const availableProducts = allProducts?.filter(
    p => !compareProducts.find(cp => cp.id === p.id)
  ) || [];

  const CompareRow = ({ label, children, highlight = false }: { 
    label: string; 
    children: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div className={cn(
      "grid gap-4 py-3 border-b border-border",
      highlight && "bg-primary/5"
    )} style={{ gridTemplateColumns: `160px repeat(${compareProducts.length}, 1fr)` }}>
      <div className="text-sm font-medium text-muted-foreground px-4">{label}</div>
      {children}
    </div>
  );

  const AbsorptionDroplets = ({ level }: { level: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <Droplet
          key={i}
          className={cn(
            "w-4 h-4",
            i <= level ? "fill-primary text-primary" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* Floating compare button */}
      <AnimatePresence>
        {compareProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button size="lg" className="gap-2 shadow-lg">
                  <Scale className="w-5 h-5" />
                  Comparer ({compareProducts.length})
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                <SheetHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      Comparateur de produits
                    </SheetTitle>
                    <Button variant="ghost" size="sm" onClick={clearCompare}>
                      Tout effacer
                    </Button>
                  </div>
                </SheetHeader>

                <div className="py-6 overflow-x-auto">
                  {/* Product cards header */}
                  <div 
                    className="grid gap-4 mb-6" 
                    style={{ gridTemplateColumns: `160px repeat(${compareProducts.length}, 1fr)` }}
                  >
                    <div className="px-4">
                      {compareProducts.length < maxProducts && (
                        <Select onValueChange={addToCompare}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="+ Ajouter" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    {compareProducts.map(product => {
                      const image = product.images?.[0]?.image_url || '/placeholder.svg';
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative bg-card rounded-xl border p-4"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => removeFromCompare(product.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          
                          <Link to={`/produit/${product.slug}`}>
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full aspect-square object-contain mb-3 rounded-lg bg-muted/30"
                            />
                          </Link>
                          
                          {product.brand && (
                            <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                          )}
                          <Link to={`/produit/${product.slug}`}>
                            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Comparison rows */}
                  <div className="space-y-0">
                    <CompareRow label="Prix" highlight>
                      {compareProducts.map(product => (
                        <div key={product.id} className="text-center">
                          <span className="text-xl font-bold text-primary">
                            {product.price.toFixed(2)} €
                          </span>
                          {product.subscription_price && (
                            <p className="text-xs text-secondary mt-1">
                              {product.subscription_price.toFixed(2)} € / abo
                            </p>
                          )}
                        </div>
                      ))}
                    </CompareRow>

                    <CompareRow label="Marque">
                      {compareProducts.map(product => (
                        <div key={product.id} className="text-center text-sm">
                          {product.brand?.name || "-"}
                        </div>
                      ))}
                    </CompareRow>

                    <CompareRow label="Catégorie">
                      {compareProducts.map(product => (
                        <div key={product.id} className="text-center text-sm">
                          {product.category?.name || "-"}
                        </div>
                      ))}
                    </CompareRow>

                    <CompareRow label="Absorption" highlight>
                      {compareProducts.map(product => (
                        <div key={product.id} className="flex justify-center">
                          {product.incontinence_level ? (
                            <div className="flex flex-col items-center gap-1">
                              <AbsorptionDroplets 
                                level={incontinenceLevelLabels[product.incontinence_level]?.level || 0} 
                              />
                              <span className="text-xs text-muted-foreground">
                                {incontinenceLevelLabels[product.incontinence_level]?.label}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      ))}
                    </CompareRow>

                    <CompareRow label="Mobilité">
                      {compareProducts.map(product => (
                        <div key={product.id} className="text-center text-sm">
                          {formatMobility(product)}
                        </div>
                      ))}
                    </CompareRow>

                    <CompareRow label="Moment d'utilisation">
                      {compareProducts.map(product => (
                        <div key={product.id} className="text-center text-sm">
                          {formatUsageTimes(product)}
                        </div>
                      ))}
                    </CompareRow>

                    <CompareRow label="Tailles disponibles">
                      {compareProducts.map(product => (
                        <div key={product.id} className="flex flex-wrap justify-center gap-1">
                          {product.sizes?.filter(s => s.is_active).map(size => (
                            <Badge key={size.id} variant="outline" className="text-xs">
                              {size.size}
                            </Badge>
                          )) || <span className="text-muted-foreground text-sm">-</span>}
                        </div>
                      ))}
                    </CompareRow>

                    <CompareRow label="Unités / paquet">
                      {compareProducts.map(product => (
                        <div key={product.id} className="text-center text-sm">
                          {product.units_per_product || "-"}
                        </div>
                      ))}
                    </CompareRow>

                    {/* Actions */}
                    <div 
                      className="grid gap-4 pt-6" 
                      style={{ gridTemplateColumns: `160px repeat(${compareProducts.length}, 1fr)` }}
                    >
                      <div />
                      {compareProducts.map(product => (
                        <div key={product.id} className="flex flex-col gap-2 px-2">
                          <Button onClick={() => handleAddToCart(product)} className="w-full">
                            Ajouter au panier
                          </Button>
                          <Button variant="outline" asChild className="w-full">
                            <Link to={`/produit/${product.slug}`}>
                              Voir le produit
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Export a hook to manage compare state globally
import { create } from "zustand";

interface CompareStore {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  products: [],
  addProduct: (product) => {
    const { products } = get();
    if (products.length < 3 && !products.find(p => p.id === product.id)) {
      set({ products: [...products, product] });
      toast.success("Produit ajouté au comparateur");
    } else if (products.length >= 3) {
      toast.error("Maximum 3 produits à comparer");
    }
  },
  removeProduct: (productId) => {
    set({ products: get().products.filter(p => p.id !== productId) });
  },
  clearProducts: () => set({ products: [] }),
  isInCompare: (productId) => get().products.some(p => p.id === productId),
}));

// Compare button for product cards
interface CompareButtonProps {
  product: Product;
  className?: string;
}

export function CompareButton({ product, className }: CompareButtonProps) {
  const { addProduct, removeProduct, isInCompare } = useCompareStore();
  const inCompare = isInCompare(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeProduct(product.id);
    } else {
      addProduct(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full transition-colors",
        inCompare 
          ? "bg-primary text-primary-foreground" 
          : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground",
        className
      )}
      title={inCompare ? "Retirer du comparateur" : "Ajouter au comparateur"}
    >
      <Scale className="w-4 h-4" />
    </button>
  );
}

// Global comparator component to use in layout
export function GlobalProductComparator() {
  const { products, removeProduct, clearProducts } = useCompareStore();
  const [isOpen, setIsOpen] = useState(false);
  const { data: allProducts } = useProducts();
  const { addItem } = useCart();

  const addToCompare = (productId: string) => {
    const product = allProducts?.find(p => p.id === productId);
    if (product) {
      useCompareStore.getState().addProduct(product);
    }
  };

  const handleAddToCart = (product: Product) => {
    const images = product.images?.length ? product.images : [{ image_url: '/placeholder.svg' }];
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: images[0]?.image_url,
      quantity: 1,
      unitPrice: product.price,
      isSubscription: false,
    });
    toast.success("Produit ajouté au panier");
  };

  const availableProducts = allProducts?.filter(
    p => !products.find(cp => cp.id === p.id)
  ) || [];

  const AbsorptionDroplets = ({ level }: { level: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <Droplet
          key={i}
          className={cn(
            "w-4 h-4",
            i <= level ? "fill-primary text-primary" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );

  const CompareRow = ({ label, children, highlight = false }: { 
    label: string; 
    children: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div className={cn(
      "grid gap-4 py-3 border-b border-border",
      highlight && "bg-primary/5"
    )} style={{ gridTemplateColumns: `160px repeat(${products.length}, 1fr)` }}>
      <div className="text-sm font-medium text-muted-foreground px-4">{label}</div>
      {children}
    </div>
  );

  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="lg" className="gap-2 shadow-lg">
            <Scale className="w-5 h-5" />
            Comparer ({products.length})
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Comparateur de produits
              </SheetTitle>
              <Button variant="ghost" size="sm" onClick={clearProducts}>
                Tout effacer
              </Button>
            </div>
          </SheetHeader>

          <div className="py-6 overflow-x-auto">
            {/* Product cards header */}
            <div 
              className="grid gap-4 mb-6" 
              style={{ gridTemplateColumns: `160px repeat(${products.length}, 1fr)` }}
            >
              <div className="px-4">
                {products.length < 3 && (
                  <Select onValueChange={addToCompare}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="+ Ajouter" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {products.map(product => {
                const image = product.images?.[0]?.image_url || '/placeholder.svg';
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-card rounded-xl border p-4"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    
                    <Link to={`/produit/${product.slug}`} onClick={() => setIsOpen(false)}>
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full aspect-square object-contain mb-3 rounded-lg bg-muted/30"
                      />
                    </Link>
                    
                    {product.brand && (
                      <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                    )}
                    <Link to={`/produit/${product.slug}`} onClick={() => setIsOpen(false)}>
                      <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Comparison rows */}
            <div className="space-y-0">
              <CompareRow label="Prix" highlight>
                {products.map(product => (
                  <div key={product.id} className="text-center">
                    <span className="text-xl font-bold text-primary">
                      {product.price.toFixed(2)} €
                    </span>
                    {product.subscription_price && (
                      <p className="text-xs text-secondary mt-1">
                        {product.subscription_price.toFixed(2)} € / abo
                      </p>
                    )}
                  </div>
                ))}
              </CompareRow>

              <CompareRow label="Marque">
                {products.map(product => (
                  <div key={product.id} className="text-center text-sm">
                    {product.brand?.name || "-"}
                  </div>
                ))}
              </CompareRow>

              <CompareRow label="Catégorie">
                {products.map(product => (
                  <div key={product.id} className="text-center text-sm">
                    {product.category?.name || "-"}
                  </div>
                ))}
              </CompareRow>

              <CompareRow label="Absorption" highlight>
                {products.map(product => (
                  <div key={product.id} className="flex justify-center">
                    {product.incontinence_level ? (
                      <div className="flex flex-col items-center gap-1">
                        <AbsorptionDroplets 
                          level={incontinenceLevelLabels[product.incontinence_level]?.level || 0} 
                        />
                        <span className="text-xs text-muted-foreground">
                          {incontinenceLevelLabels[product.incontinence_level]?.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                ))}
              </CompareRow>

              <CompareRow label="Mobilité">
                {products.map(product => (
                  <div key={product.id} className="text-center text-sm">
                    {formatMobility(product)}
                  </div>
                ))}
              </CompareRow>

              <CompareRow label="Moment d'utilisation">
                {products.map(product => (
                  <div key={product.id} className="text-center text-sm">
                    {formatUsageTimes(product)}
                  </div>
                ))}
              </CompareRow>

              <CompareRow label="Tailles disponibles">
                {products.map(product => (
                  <div key={product.id} className="flex flex-wrap justify-center gap-1">
                    {product.sizes?.filter(s => s.is_active).map(size => (
                      <Badge key={size.id} variant="outline" className="text-xs">
                        {size.size}
                      </Badge>
                    )) || <span className="text-muted-foreground text-sm">-</span>}
                  </div>
                ))}
              </CompareRow>

              <CompareRow label="Unités / paquet">
                {products.map(product => (
                  <div key={product.id} className="text-center text-sm">
                    {product.units_per_product || "-"}
                  </div>
                ))}
              </CompareRow>

              {/* Actions */}
              <div 
                className="grid gap-4 pt-6" 
                style={{ gridTemplateColumns: `160px repeat(${products.length}, 1fr)` }}
              >
                <div />
                {products.map(product => (
                  <div key={product.id} className="flex flex-col gap-2 px-2">
                    <Button onClick={() => handleAddToCart(product)} className="w-full">
                      Ajouter au panier
                    </Button>
                    <Button variant="outline" asChild className="w-full" onClick={() => setIsOpen(false)}>
                      <Link to={`/produit/${product.slug}`}>
                        Voir le produit
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
