import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AbsorptionDroplets from './AbsorptionDroplets';
import SubscriptionBadge from './SubscriptionBadge';
import { CompareButton } from './ProductComparator';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const hasSubscription = product.subscription_price && product.subscription_price < product.price;
  const discountPercent = product.subscription_discount_percent || 10;
  
  // Calculate savings from recommended price
  const hasRecommendedPrice = product.recommended_price && product.recommended_price > product.price;
  const savingsValue = hasRecommendedPrice ? product.recommended_price! - product.price : 0;
  const savingsPercent = hasRecommendedPrice ? Math.round((savingsValue / product.recommended_price!) * 100) : 0;

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
      onClick={onClick}
    >
      <Link 
        to={`/produit/${product.slug}`}
        onClick={(e) => e.stopPropagation()}
        className="block"
      >
        <div className="relative aspect-square bg-muted/30 overflow-hidden">
          <img
            src={primaryImage?.image_url || '/placeholder.svg'}
            alt={primaryImage?.alt_text || product.name}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
          {hasRecommendedPrice && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
              -{savingsPercent}%
            </Badge>
          )}
          {hasSubscription && !hasRecommendedPrice && (
            <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
              -{discountPercent}% abo
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="absolute top-3 left-3" variant="outline">
              Recommandé
            </Badge>
          )}
          {/* Compare button */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <CompareButton product={product} />
          </div>
        </div>
      </Link>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand.name}</p>
          )}
          {product.incontinence_level && (
            <AbsorptionDroplets level={product.incontinence_level} />
          )}
        </div>
        <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="space-y-1 mt-auto">
          {hasRecommendedPrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground line-through">
                Prix public : {product.recommended_price?.toFixed(2)} €
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {product.price.toFixed(2)} €
            </span>
            {hasRecommendedPrice && (
              <span className="text-xs font-medium text-destructive">
                Économisez {savingsValue.toFixed(2)} €
              </span>
            )}
          </div>
          {hasSubscription && (
            <div className="mt-2">
              <SubscriptionBadge discountPercent={discountPercent} variant="small" />
              <p className="text-xs text-muted-foreground mt-1">
                {product.subscription_price?.toFixed(2)} €/mois
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
