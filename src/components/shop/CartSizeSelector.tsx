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

interface ProductSize {
  id: string;
  size: string;
  sale_price: number | null;
  public_price: number | null;
  price_adjustment: number | null;
  is_active: boolean | null;
}

interface CartSizeSelectorProps {
  currentSize: string;
  productId: string;
  basePrice: number;
  subscriptionDiscountPercent: number;
  onSizeChange: (newSize: string, unitPrice: number, subscriptionPrice?: number, publicPrice?: number) => void;
}

export const CartSizeSelector: React.FC<CartSizeSelectorProps> = ({
  currentSize,
  productId,
  basePrice,
  subscriptionDiscountPercent,
  onSizeChange,
}) => {
  const [open, setOpen] = useState(false);

  // Fetch product sizes when popover opens
  const { data: sizes, isLoading } = useQuery({
    queryKey: ['product-sizes', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_sizes')
        .select('id, size, sale_price, public_price, price_adjustment, is_active')
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

  return (
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
      <PopoverContent className="w-48 p-1" align="start">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : sizes && sizes.length > 0 ? (
          <div className="space-y-0.5">
            {sizes.map((sizeData) => {
              const sizePrice = sizeData.sale_price ?? (basePrice + (sizeData.price_adjustment || 0));
              return (
                <button
                  key={sizeData.id}
                  onClick={() => handleSelect(sizeData)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors",
                    sizeData.size === currentSize
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  )}
                >
                  <span>{sizeData.size}</span>
                  <span className="text-xs text-muted-foreground">
                    {sizePrice.toFixed(2)} €
                  </span>
                  {sizeData.size === currentSize && <Check className="h-3 w-3 ml-1" />}
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
  );
};