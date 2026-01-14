import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useProduct, useStoreSettings } from '@/hooks/useProducts';
import { useEstimatedDelivery } from '@/hooks/useEstimatedDelivery';
import { useCart } from '@/hooks/useCart';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { 
  ChevronLeft, 
  ChevronRight, 
  Minus, 
  Plus, 
  ShoppingCart,
  Truck,
  RefreshCw,
  Sun,
  Moon,
  Activity,
  ArrowLeft,
  Loader2,
  Shield,
  Clock,
  Package,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SizeGuideModal, SizeGuideButton } from '@/components/shop/SizeGuideModal';
import SubscriptionBadge from '@/components/shop/SubscriptionBadge';
import SubscriptionBenefits from '@/components/subscription/SubscriptionBenefits';
import MobileCartFooter from '@/components/shop/MobileCartFooter';

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: settings } = useStoreSettings();
  const { addItem, openCart } = useCart();
  const isMobile = useIsMobile();
  const { formattedDate: estimatedDeliveryDate } = useEstimatedDelivery();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [purchaseMode, setPurchaseMode] = useState<'one-time' | 'subscription'>('subscription');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (product?.min_order_quantity) {
      setQuantity(product.min_order_quantity);
    }
  }, [product]);

  // Auto-carousel for images
  useEffect(() => {
    const images = product?.images?.length ? product.images : [];
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [product?.images]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-main py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold mb-4">Produit introuvable</h1>
          <Button asChild>
            <Link to="/boutique">Retour à la boutique</Link>
          </Button>
        </div>
      </Layout>
    );
  }

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
  
  // Use variant-specific sale_price if defined, otherwise fall back to base price + adjustment
  const variantBasePrice = selectedSizeData?.sale_price ?? (basePrice + (selectedSizeData?.price_adjustment || 0));
  const variantSubscriptionPrice = selectedSizeData?.sale_price 
    ? selectedSizeData.sale_price * (1 - discountPercent / 100)
    : subscriptionPrice + (selectedSizeData?.price_adjustment || 0);
  
  const finalPrice = purchaseMode === 'subscription' 
    ? variantSubscriptionPrice 
    : variantBasePrice;
  
  const freeShippingThreshold = settings?.shipping?.free_shipping_threshold || 49;
  const subtotal = finalPrice * quantity;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const incontinenceLevelLabels: Record<string, string> = {
    light: 'Légère',
    moderate: 'Modérée',
    heavy: 'Forte',
    very_heavy: 'Très forte'
  };

  const mobilityLabels: Record<string, string> = {
    mobile: 'Mobile',
    reduced: 'Mobilité réduite',
    bedridden: 'Alité'
  };

  const usageTimeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    day: { label: 'Jour', icon: <Sun className="h-4 w-4" /> },
    night: { label: 'Nuit', icon: <Moon className="h-4 w-4" /> },
    day_night: { label: 'Jour & Nuit', icon: <Activity className="h-4 w-4" /> }
  };

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }

    const minQty = product.min_order_quantity || 1;
    if (quantity < minQty) {
      toast.error(`Quantité minimum: ${minQty}`);
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      productImage: images[0]?.image_url,
      size: selectedSize || undefined,
      quantity,
      unitPrice: variantBasePrice,
      isSubscription: purchaseMode === 'subscription',
      subscriptionPrice: variantSubscriptionPrice,
      publicPrice: selectedSizeData?.public_price ?? recommendedPrice ?? undefined,
    });

    toast.success('Produit ajouté au panier');
    openCart();
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <Helmet>
        <title>{product.name} | SerenCare</title>
        <meta name="description" content={product.short_description || product.description || `Achetez ${product.name} sur SerenCare.`} />
      </Helmet>
      <Layout>
        <div className="container-main py-6 lg:py-12">
          {/* Breadcrumb */}
          <Link 
            to="/boutique" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative bg-muted/30 rounded-2xl aspect-square overflow-hidden">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    
                    {/* Dots indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            idx === currentImageIndex 
                              ? "bg-primary w-6" 
                              : "bg-primary/30 hover:bg-primary/50"
                          )}
                          aria-label={`Aller à l'image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors",
                        idx === currentImageIndex ? "border-primary" : "border-transparent"
                      )}
                    >
                      <img 
                        src={img.image_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product details */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                {product.brand && (
                  <p className="text-sm text-muted-foreground mb-1">{product.brand.name}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl lg:text-4xl font-display font-bold">{product.name}</h1>
                  {product.is_coming_soon && (
                    <Badge className="bg-amber-500 text-white text-sm px-3 py-1">
                      Prochainement
                    </Badge>
                  )}
                </div>
                
                {/* Price display with recommended price */}
                {!product.is_coming_soon && (
                  <div className="mt-4 space-y-2">
                    {/* Public price crossed out - from variant or product */}
                    {(selectedSizeData?.public_price || hasRecommendedPrice) && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">
                          Prix public constaté : {(selectedSizeData?.public_price ?? recommendedPrice)?.toFixed(2)} €
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl font-bold text-primary">
                        Prix SerenCare : {variantBasePrice.toFixed(2)} €
                      </span>
                      {(selectedSizeData?.public_price || hasRecommendedPrice) && (
                        <Badge variant="destructive" className="text-sm px-3 py-1">
                          -{Math.round(((selectedSizeData?.public_price ?? recommendedPrice ?? 0) - variantBasePrice) / (selectedSizeData?.public_price ?? recommendedPrice ?? 1) * 100)}% | Vous économisez {((selectedSizeData?.public_price ?? recommendedPrice ?? 0) - variantBasePrice).toFixed(2)} €
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product attributes */}
              <div className="flex flex-wrap gap-2">
                {product.incontinence_level && (
                  <Badge variant="outline">
                    {incontinenceLevelLabels[product.incontinence_level]}
                  </Badge>
                )}
                {product.mobility && (
                  <Badge variant="outline">
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

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}

              {/* Size Guide Modal - only if show_size_guide is true */}
              {product.show_size_guide !== false && (
                <SizeGuideModal
                  open={sizeGuideOpen}
                  onOpenChange={setSizeGuideOpen}
                  brand={product.brand?.name}
                  availableSizes={sizes.map(s => s.size)}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />
              )}

              {/* Size selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Taille</Label>
                  {product.show_size_guide !== false && (
                    <SizeGuideButton onClick={() => setSizeGuideOpen(true)} />
                  )}
                </div>
                {sizes.length > 0 ? (
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
                ) : (
                  <p className="text-sm text-muted-foreground">Taille unique</p>
                )}
              </div>

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
                      <p className="text-xl font-bold text-secondary mt-2">
                        {variantSubscriptionPrice.toFixed(2)} €
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
                      <p className="text-xl font-bold mt-2">{variantBasePrice.toFixed(2)} €</p>
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
                <Label className="text-sm font-medium">
                  Quantité
                  {product.min_order_quantity && product.min_order_quantity > 1 && (
                    <span className="text-muted-foreground font-normal ml-2">
                      (min. {product.min_order_quantity})
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Estimated delivery date */}
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Livraison estimée</p>
                  <p className="font-semibold text-foreground">{estimatedDeliveryDate}</p>
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

              {/* Add to cart - hidden on mobile (shown in footer) */}
              {product.is_coming_soon ? (
                <Button 
                  className="w-full h-14 text-base hidden lg:flex" 
                  size="lg"
                  disabled
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Bientôt disponible
                </Button>
              ) : (
                <Button 
                  className="w-full h-14 text-base hidden lg:flex" 
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Ajouter au panier — {(finalPrice * quantity).toFixed(2)} €
                </Button>
              )}

              {/* Reassurance */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <Truck className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Livraison express</p>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Paiement sécurisé</p>
                </div>
                <div className="text-center">
                  <Clock className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">SAV réactif</p>
                </div>
              </div>

              {/* Subscription promo badge */}
              {product.subscription_price && (
                <SubscriptionBadge discountPercent={discountPercent} variant="prominent" />
              )}
            </motion.div>
          </div>

          {/* Subscription Benefits Section */}
          <div className="mt-16 pb-24 lg:pb-0">
            <SubscriptionBenefits variant="card" showCTA={false} />
          </div>
        </div>

        {/* Mobile fixed cart footer with swipe */}
        {product && (
          <MobileCartFooter
            isVisible={isMobile}
            onAddToCart={handleAddToCart}
            price={finalPrice}
            quantity={quantity}
            isDisabled={sizes.length > 0 && !selectedSize}
            isComingSoon={product.is_coming_soon || false}
            productName={product.name}
          />
        )}
      </Layout>
    </>
  );
};

export default ProductPage;
