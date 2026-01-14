import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface ProductSize {
  id: string;
  size: string;
  sale_price: number | null;
  public_price: number | null;
  price_adjustment: number | null;
  is_active: boolean | null;
  stock_quantity: number | null;
}

interface CartSizeSelectorProps {
  currentSize: string;
  productId: string;
  basePrice: number;
  subscriptionDiscountPercent: number;
  onSizeChange: (newSize: string, unitPrice: number, subscriptionPrice?: number, publicPrice?: number) => void;
  displayPrice?: number;
}

export const CartSizeSelector: React.FC<CartSizeSelectorProps> = ({
  currentSize,
  productId,
  basePrice,
  subscriptionDiscountPercent,
  onSizeChange,
  displayPrice,
}) => {
  const [open, setOpen] = useState(false);

  // Fetch product sizes when popover opens
  const { data: sizes, isLoading } = useQuery({
    queryKey: ['product-sizes', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_sizes')
        .select('id, size, sale_price, public_price, price_adjustment, is_active, stock_quantity')
        .eq('product_id', productId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as ProductSize[];
    },
    enabled: open,
  });

  const handleSelect = (sizeData: ProductSize) => {
    if (sizeData.size !== currentSize) {
      const unitPrice = sizeData.sale_price ?? (basePrice + (sizeData.price_adjustment || 0));
      const subscriptionPrice = sizeData.sale_price 
        ? sizeData.sale_price * (1 - subscriptionDiscountPercent / 100)
        : (basePrice + (sizeData.price_adjustment || 0)) * (1 - subscriptionDiscountPercent / 100);
      
      onSizeChange(sizeData.size, unitPrice, subscriptionPrice, sizeData.public_price ?? undefined);
    }
    setOpen(false);
  };

  const getStockLabel = (stock: number | null) => {
    if (stock === null || stock === undefined) return null;
    if (stock === 0) return { label: 'Rupture', className: 'text-destructive bg-destructive/10' };
    if (stock <= 5) return { label: `${stock} restants`, className: 'text-orange-600 bg-orange-100' };
    return { label: 'En stock', className: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            {currentSize}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1" align="start">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : sizes && sizes.length > 0 ? (
            <div className="space-y-0.5">
              {sizes.map((sizeData) => {
                const sizePrice = sizeData.sale_price ?? (basePrice + (sizeData.price_adjustment || 0));
                const stockInfo = getStockLabel(sizeData.stock_quantity);
                const isOutOfStock = sizeData.stock_quantity === 0;
                
                return (
                  <button
                    key={sizeData.id}
                    onClick={() => !isOutOfStock && handleSelect(sizeData)}
                    disabled={isOutOfStock}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                      sizeData.size === currentSize
                        ? "bg-primary/10 text-primary font-medium"
                        : isOutOfStock 
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{sizeData.size}</span>
                      {stockInfo && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", stockInfo.className)}>
                          {stockInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {sizePrice.toFixed(2)} €
                      </span>
                      {sizeData.size === currentSize && <Check className="h-3 w-3 ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Aucune taille disponible
            </p>
          )}
        </PopoverContent>
      </Popover>
      
      {displayPrice !== undefined && (
        <AnimatePresence mode="wait">
          <motion.span
            key={displayPrice}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium text-primary"
          >
            {displayPrice.toFixed(2)} €
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
};
