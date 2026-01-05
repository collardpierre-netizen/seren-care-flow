import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useStoreSettings, Product } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Minus, 
  Plus, 
  ShoppingCart,
  Truck,
  RefreshCw,
  Sun,
  Moon,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [purchaseMode, setPurchaseMode] = useState<'one-time' | 'subscription'>('subscription');
  const [quantity, setQuantity] = useState(1);
  
  const { addItem, openCart } = useCart();
  const { data: settings } = useStoreSettings();

  if (!product) return null;

  const images = product.images?.length ? product.images : [{ image_url: '/placeholder.svg', alt_text: product.name }];
  const sizes = product.sizes?.filter(s => s.is_active) || [];
  
  const basePrice = product.price;
  const subscriptionPrice = product.subscription_price || basePrice * 0.9;
  const discountPercent = product.subscription_discount_percent || 10;
  const recommendedPrice = product.recommended_price;
  
  // Calculate savings from recommended price
  const hasRecommendedPrice = recommendedPrice && recommendedPrice > basePrice;
  const savingsValue = hasRecommendedPrice ? recommendedPrice - basePrice : 0;
  const savingsPercent = hasRecommendedPrice ? Math.round((savingsValue / recommendedPrice) * 100) : 0;
  
  const selectedSizeData = sizes.find(s => s.size === selectedSize);
  const priceAdjustment = selectedSizeData?.price_adjustment || 0;
  
  const finalPrice = purchaseMode === 'subscription' 
    ? subscriptionPrice + priceAdjustment 
    : basePrice + priceAdjustment;
  
  const freeShippingThreshold = settings?.shipping?.free_shipping_threshold || 49;
  const shippingFee = settings?.shipping?.standard_shipping_fee || 4.90;
  const subtotal = finalPrice * quantity;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const incontinenceLevelLabels: Record<string, string> = {
    light: 'légère',
    moderate: 'modérée',
    heavy: 'forte',
    very_heavy: 'très forte'
  };

  const mobilityLabels: Record<string, string> = {
    mobile: 'mobile',
    reduced: 'à mobilité réduite',
    bedridden: 'alitée'
  };

  const usageTimeLabels: Record<string, { label: string; icon: React.ReactNode; phrase: string }> = {
    day: { label: 'Jour', icon: <Sun className="h-4 w-4" />, phrase: 'la journée' },
    night: { label: 'Nuit', icon: <Moon className="h-4 w-4" />, phrase: 'la nuit' },
    day_night: { label: 'Jour & Nuit', icon: <Activity className="h-4 w-4" />, phrase: 'jour et nuit' }
  };

  // Generate situation sentence
  const generateSituationSentence = () => {
    const parts: string[] = [];
    
    if (product.incontinence_level) {
      parts.push(`incontinence ${incontinenceLevelLabels[product.incontinence_level]}`);
    }
    
    if (product.mobility) {
      parts.push(`personne ${mobilityLabels[product.mobility]}`);
    }
    
    if (product.usage_time) {
      parts.push(`usage ${usageTimeLabels[product.usage_time]?.phrase}`);
    }
    
    if (parts.length === 0) return null;
    
    return `Idéal pour ${parts.join(', ')}.`;
  };

  const situationSentence = generateSituationSentence();

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      productImage: images[0]?.image_url,
      size: selectedSize || undefined,
      quantity,
      unitPrice: basePrice + priceAdjustment,
      isSubscription: purchaseMode === 'subscription',
      subscriptionPrice: subscriptionPrice + priceAdjustment,
    });

    toast.success('Produit ajouté au panier');
    openCart();
    onClose();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="grid md:grid-cols-2">
          {/* Image carousel */}
          <div className="relative bg-muted/30 aspect-square md:aspect-auto md:min-h-[500px]">
            <img
              src={images[currentImageIndex]?.image_url || '/placeholder.svg'}
              alt={images[currentImageIndex]?.alt_text || product.name}
              className="w-full h-full object-contain p-8"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        idx === currentImageIndex ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product details */}
          <div className="p-6 space-y-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Header */}
            <div>
              {product.brand && (
                <p className="text-sm text-muted-foreground mb-1">{product.brand.name}</p>
              )}
              <h2 className="text-2xl font-display font-bold">{product.name}</h2>
              
              {/* Price display with recommended price */}
              <div className="mt-3 space-y-1">
                {hasRecommendedPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      Prix public constaté : {recommendedPrice?.toFixed(2)} €
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-primary">
                    {basePrice.toFixed(2)} €
                  </span>
                  {hasRecommendedPrice && (
                    <Badge variant="destructive" className="text-xs">
                      -{savingsPercent}% | Économie {savingsValue.toFixed(2)} €
                    </Badge>
                  )}
                </div>
              </div>
              
              {product.short_description && (
                <p className="text-muted-foreground mt-2">{product.short_description}</p>
              )}
              {situationSentence && (
                <p className="text-sm text-secondary mt-2 italic">{situationSentence}</p>
              )}
            </div>

            {/* Product attributes */}
            <div className="flex flex-wrap gap-2">
              {product.incontinence_level && (
                <Badge variant="outline" className="capitalize">
                  {incontinenceLevelLabels[product.incontinence_level]}
                </Badge>
              )}
              {product.mobility && (
                <Badge variant="outline" className="capitalize">
                  {mobilityLabels[product.mobility]}
                </Badge>
              )}
              {product.usage_time && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {usageTimeLabels[product.usage_time]?.icon}
                  {usageTimeLabels[product.usage_time]?.label}
                </Badge>
              )}
            </div>

            {/* Size selection */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Taille</Label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.size)}
                      className={cn(
                        "px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
                        selectedSize === size.size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      )}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Mode d'achat</Label>
              <RadioGroup 
                value={purchaseMode} 
                onValueChange={(v) => setPurchaseMode(v as 'one-time' | 'subscription')}
                className="space-y-3"
              >
                <div
                  className={cn(
                    "relative flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all",
                    purchaseMode === 'subscription' 
                      ? "border-secondary bg-secondary/5 ring-2 ring-secondary/20" 
                      : "border-border hover:border-muted-foreground"
                  )}
                  onClick={() => setPurchaseMode('subscription')}
                >
                  <RadioGroupItem value="subscription" id="subscription" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="subscription" className="font-medium cursor-pointer">
                        Abonnement mensuel
                      </Label>
                      <Badge className="bg-secondary text-secondary-foreground">
                        -{discountPercent}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Livraison automatique chaque mois
                    </p>
                    <p className="text-lg font-bold text-secondary mt-2">
                      {subscriptionPrice.toFixed(2)} €
                    </p>
                  </div>
                  <RefreshCw className="h-5 w-5 text-secondary" />
                </div>

                <div
                  className={cn(
                    "relative flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all",
                    purchaseMode === 'one-time' 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                      : "border-border hover:border-muted-foreground"
                  )}
                  onClick={() => setPurchaseMode('one-time')}
                >
                  <RadioGroupItem value="one-time" id="one-time" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="one-time" className="font-medium cursor-pointer">
                      Achat unique
                    </Label>
                    <p className="text-lg font-bold mt-2">{basePrice.toFixed(2)} €</p>
                  </div>
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </div>
              </RadioGroup>
              
              {purchaseMode === 'subscription' && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Sans engagement. Modifiez ou annulez à tout moment.
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quantité</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Shipping indicator */}
            <div className="p-4 bg-muted/50 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Plus que <strong>{remainingForFreeShipping.toFixed(2)} €</strong> pour la livraison gratuite
                  </span>
                ) : (
                  <span className="text-secondary font-medium">Livraison gratuite !</span>
                )}
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary transition-all"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Add to cart */}
            <Button 
              className="w-full h-12 text-base" 
              size="lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ajouter au panier — {(finalPrice * quantity).toFixed(2)} €
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
