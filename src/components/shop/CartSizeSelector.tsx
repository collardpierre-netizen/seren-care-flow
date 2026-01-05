import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const availableSizes = ["S", "M", "L", "XL"];

interface CartSizeSelectorProps {
  currentSize: string;
  onSizeChange: (newSize: string) => void;
}

export const CartSizeSelector: React.FC<CartSizeSelectorProps> = ({
  currentSize,
  onSizeChange,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (size: string) => {
    if (size !== currentSize) {
      onSizeChange(size);
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
      <PopoverContent className="w-32 p-1" align="start">
        <div className="space-y-0.5">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSelect(size)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors",
                size === currentSize
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              )}
            >
              {size}
              {size === currentSize && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
