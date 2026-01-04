import React from 'react';
import { Product } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const hasSubscription = product.subscription_price && product.subscription_price < product.price;
  const discountPercent = product.subscription_discount_percent || 10;

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        <img
          src={primaryImage?.image_url || '/placeholder.svg'}
          alt={primaryImage?.alt_text || product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        {hasSubscription && (
          <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
            -{discountPercent}% abo
          </Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute top-3 left-3" variant="outline">
            Recommandé
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        {product.brand && (
          <p className="text-xs text-muted-foreground mb-1">{product.brand.name}</p>
        )}
        <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          {hasSubscription ? (
            <>
              <span className="text-lg font-bold text-secondary">
                {product.subscription_price?.toFixed(2)} €
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {product.price.toFixed(2)} €
              </span>
            </>
          ) : (
            <span className="text-lg font-bold">{product.price.toFixed(2)} €</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
