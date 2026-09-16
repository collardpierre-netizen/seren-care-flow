import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AbsorptionDroplets from './AbsorptionDroplets';
import SubscriptionBadge from './SubscriptionBadge';
import { CompareButton } from './ProductComparator';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const hasSubscription = product.is_subscription_eligible === true && !!product.subscription_price && product.subscription_price < product.price;
  const discountPercent = product.subscription_discount_percent;
  
  // Calculate savings from recommended price
  const hasRecommendedPrice = product.recommended_price && product.recommended_price > product.price;
  const savingsPercent = hasRecommendedPrice && product.recommended_price ? Math.round(((product.recommended_price - product.price) / product.recommended_price) * 100) : 0;
  const availableSizes = activeSizes.map((size) => size.size).filter(Boolean);
  const units = activeSizes.find((size) => size.units_per_size)?.units_per_size || product.units_per_product;

  // Check if product has multiple sizes with different prices
  const activeSizes = product.sizes?.filter(s => s.is_active !== false) || [];
  const sizePrices = activeSizes.map(size => {
    if (size.sale_price && size.sale_price > 0) return size.sale_price;
    return product.price + (size.price_adjustment || 0);
  });
  
  // Add base price if no sizes or as fallback
  if (sizePrices.length === 0) {
    sizePrices.push(product.price);
  }
  
  const minPrice = Math.min(...sizePrices);
  const maxPrice = Math.max(...sizePrices);
  const hasPriceRange = activeSizes.length > 1 && minPrice !== maxPrice;

  return (
    <article 
      className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col bg-card rounded-lg border"
    >
      <Link 
        to={`/produit/${product.slug}`}
        className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg"
        aria-label={`Voir le produit ${product.name}${hasRecommendedPrice ? `, -${savingsPercent}%` : ''}`}
      >
        <div className={`relative bg-muted/30 overflow-hidden ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}>
          {primaryImage?.image_url ? (
            <img
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || product.name}
              className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${compact ? 'p-2' : 'p-4'}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
              <Package className={`text-muted-foreground/40 ${compact ? 'h-8 w-8' : 'h-16 w-16'}`} />
              <span className={`text-muted-foreground/50 text-center font-medium ${compact ? 'text-[10px] line-clamp-1' : 'text-xs line-clamp-2'}`}>
                {product.brand?.name || 'Photo à venir'}
              </span>
            </div>
          )}
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
          {!product.is_coming_soon && hasSubscription && discountPercent && !hasRecommendedPrice && (
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
      <div className={`flex-1 flex flex-col ${compact ? 'p-2' : 'p-4'}`}>
        <div className="flex items-center justify-between mb-1 gap-2">
          {product.brand && (
            <p className="text-sm text-muted-foreground">{product.brand.name}</p>
          )}
          {product.incontinence_level && !compact && (
            <AbsorptionDroplets level={product.incontinence_level} />
          )}
        </div>
        <h3 className="font-medium text-base leading-snug group-hover:text-primary transition-colors mb-2">
          {product.name}
        </h3>
        {product.category?.name && <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>}
        {availableSizes.length > 0 && <p className="text-sm text-muted-foreground">Taille : {availableSizes.join(', ')}</p>}
        {units && units > 1 && <p className="text-sm text-muted-foreground">{units} unités par paquet</p>}
        <p className="text-sm mt-2">{product.stock_status === 'out_of_stock' ? 'Indisponible' : 'Disponible'}</p>
        <div className="space-y-1 mt-auto">
          {product.is_coming_soon ? (
            <div className={`text-amber-600 font-medium ${compact ? 'text-xs' : ''}`}>
              Bientôt disponible
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1 flex-wrap">
                {hasPriceRange && (
                  <span className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>
                    À partir de
                  </span>
                )}
                <span className={`font-bold text-primary ${compact ? 'text-sm' : 'text-lg'}`}>
                  {minPrice.toFixed(2)} €
                </span>
              </div>
              {/* Price per unit */}
               {units && units > 1 && (
                <div className="text-xs text-muted-foreground">
                   {(minPrice / units).toFixed(2)} €/unité
                </div>
              )}
               {hasSubscription && discountPercent && !compact && (
                <div className="mt-1">
                  <SubscriptionBadge discountPercent={discountPercent} variant="small" />
                </div>
              )}
            </>
          )}
        </div>
        <Button asChild variant="outline" className="mt-4 min-h-11 w-full">
          <Link to={`/produit/${product.slug}`}>Voir le produit</Link>
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
