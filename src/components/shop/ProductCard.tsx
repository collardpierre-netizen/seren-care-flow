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
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, compact = false }) => {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const hasSubscription = product.subscription_price && product.subscription_price < product.price;
  const discountPercent = product.subscription_discount_percent || 10;
  
  // Calculate savings from recommended price
  const hasRecommendedPrice = product.recommended_price && product.recommended_price > product.price;
  const savingsPercent = hasRecommendedPrice ? Math.round(((product.recommended_price! - product.price) / product.recommended_price!) * 100) : 0;

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
        <div className={`relative bg-muted/30 overflow-hidden ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}>
          <img
            src={primaryImage?.image_url || '/placeholder.svg'}
            alt={primaryImage?.alt_text || product.name}
            className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${compact ? 'p-2' : 'p-4'}`}
          />
          {product.is_coming_soon && (
            <Badge className={`absolute ${compact ? 'top-1.5 right-1.5 text-[10px] px-1.5 py-0.5' : 'top-3 right-3'} bg-amber-500 text-white`}>
              Prochainement
            </Badge>
          )}
          {!product.is_coming_soon && hasRecommendedPrice && (
            <Badge className={`absolute ${compact ? 'top-1.5 right-1.5 text-[10px] px-1.5 py-0.5' : 'top-3 right-3'} bg-destructive text-destructive-foreground`}>
              -{savingsPercent}%
            </Badge>
          )}
          {!product.is_coming_soon && hasSubscription && !hasRecommendedPrice && (
            <Badge className={`absolute ${compact ? 'top-1.5 right-1.5 text-[10px] px-1.5 py-0.5' : 'top-3 right-3'} bg-secondary text-secondary-foreground`}>
              -{discountPercent}% abo
            </Badge>
          )}
          {product.is_featured && !compact && (
            <Badge className="absolute top-3 left-3" variant="outline">
              Recommandé
            </Badge>
          )}
          {/* Compare button - hidden in compact mode */}
          {!compact && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <CompareButton product={product} />
            </div>
          )}
        </div>
      </Link>
      <CardContent className={`flex-1 flex flex-col ${compact ? 'p-2' : 'p-4'}`}>
        <div className="flex items-center justify-between mb-1">
          {product.brand && (
            <p className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>{product.brand.name}</p>
          )}
          {product.incontinence_level && !compact && (
            <AbsorptionDroplets level={product.incontinence_level} />
          )}
        </div>
        <h3 className={`font-medium group-hover:text-primary transition-colors ${compact ? 'text-xs line-clamp-1 mb-1' : 'line-clamp-2 mb-2 min-h-[2.5rem]'}`}>
          {product.name}
        </h3>
        <div className="space-y-1 mt-auto">
          {product.is_coming_soon ? (
            <div className={`text-amber-600 font-medium ${compact ? 'text-xs' : ''}`}>
              Bientôt disponible
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className={`font-bold text-primary ${compact ? 'text-sm' : 'text-lg'}`}>
                  {product.price.toFixed(2)} €
                </span>
              </div>
              {hasSubscription && !compact && (
                <div className="mt-1">
                  <SubscriptionBadge discountPercent={discountPercent} variant="small" />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
