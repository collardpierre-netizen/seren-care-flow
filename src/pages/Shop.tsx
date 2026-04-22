import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ChevronDown, Loader2, Package, Droplet, Moon, Sun, Footprints, Sparkles, User, Euro } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, useBrands, useCategories, Product } from "@/hooks/useProducts";
import {
  useProductFilters,
  mobilityFilterOptions,
  usageTimeFilterOptions,
  genderFilterOptions,
  toMobilityTag,
  type MobilityFilterId,
} from "@/hooks/useProductFilters";
import { useUserPreferences, mapProfileToFilters } from "@/hooks/useUserPreferences";
import ProductCard from "@/components/shop/ProductCard";
import ProductQuickView from "@/components/shop/ProductQuickView";
import SearchBar from "@/components/shop/SearchBar";
import ProductSelector from "@/components/shop/ProductSelector";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { logMobilityDebug } from "@/lib/shopDebug";
import {
  validateMobilityConversion,
  shouldWarnUser,
  type MobilityConversionResult,
} from "@/lib/mobilityConversionValidator";
import { isMobilityTag } from "@/hooks/useProductFilters";

const incontinenceLevelOptions = [
  { id: "all", label: "Tous" },
  { id: "light", label: "Légère", icon: 1 },
  { id: "moderate", label: "Modérée", icon: 2 },
  { id: "heavy", label: "Forte", icon: 3 },
  { id: "very_heavy", label: "Très forte", icon: 4 },
];

const Shop = () => {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedIncontinence, setSelectedIncontinence] = useState<string>("all");
  // `selectedMobility` should always be a French UI tag (or "all"). The
  // mismatch banner below catches any external code that breaks this invariant.
  const [selectedMobility, setSelectedMobility] = useState<MobilityFilterId | string>("all");
  const [selectedUsageTime, setSelectedUsageTime] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [priceRangeInitialized, setPriceRangeInitialized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [preferencesApplied, setPreferencesApplied] = useState(false);
  // Soft, non-blocking notice shown when the mobility value coming from the
  // profile had to be auto-translated (e.g. DB enum "reduced" → UI tag "reduite").
  const [mobilityAutoTranslation, setMobilityAutoTranslation] = useState<
    { from: string; to: { id: string; label: string } } | null
  >(null);
  const [showMobilityExplanation, setShowMobilityExplanation] = useState(false);

  // Load all products without category/brand filter - we filter client-side
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: brands } = useBrands();
  const { data: categories } = useCategories({ includeCount: true, includeEmpty: false });
  const { data: userPreferences } = useUserPreferences();

  // Apply user preferences as default filters (only once on mount)
  useEffect(() => {
    if (userPreferences && !preferencesApplied) {
      const profileFilters = mapProfileToFilters(userPreferences);
      if (profileFilters) {
        // DEV-only debug log. The literal `import.meta.env.DEV` guard lets
        // Vite/esbuild fold the condition to `false` in production builds and
        // strip the entire block (logger import, message string, lazy
        // provider) via dead-code elimination. The provider is also lazy so
        // the field values themselves are never even read in prod.
        if (import.meta.env.DEV) {
          logMobilityDebug(() => ({
            profileMobilityLevel: userPreferences.mobility_level,
            appliedFilterTag: profileFilters.mobility,
          }));
        }
        if (profileFilters.gender) setSelectedGender(profileFilters.gender);
        if (profileFilters.mobility) setSelectedMobility(profileFilters.mobility);
        if (profileFilters.incontinenceLevel) setSelectedIncontinence(profileFilters.incontinenceLevel);
        if (profileFilters.usageTime) setSelectedUsageTime(profileFilters.usageTime);
      }
      setPreferencesApplied(true);
    }
  }, [userPreferences, preferencesApplied]);

  // Compute global price bounds from all products
  const priceBounds = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 500 };
    const prices = products.map(p => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  // Detect when the active mobility filter doesn't match any known UI option
  // and suggest the auto-translated value (e.g. profile sent "reduced" → "reduite")
  const mobilityHint = useMemo(() => {
    if (selectedMobility === 'all') return null;
    const matchesOption = mobilityFilterOptions.some(opt => opt.id === selectedMobility);
    if (matchesOption) return null;
    // Try to translate (English DB enum → French UI tag)
    const translated = toMobilityTag(selectedMobility);
    const suggestion = translated && mobilityFilterOptions.find(opt => opt.id === translated);
    return {
      currentValue: selectedMobility,
      suggestion: suggestion ? { id: suggestion.id, label: suggestion.label } : null,
    };
  }, [selectedMobility]);

  // Auto-apply the translated value when we have a confident suggestion, and
  // surface a non-blocking info banner explaining what just happened.
  useEffect(() => {
    if (mobilityHint?.suggestion) {
      const { currentValue, suggestion } = mobilityHint;
      setMobilityAutoTranslation({ from: currentValue, to: suggestion });
      setSelectedMobility(suggestion.id);
    }
  }, [mobilityHint]);

  // End-to-end validation: compare the raw profile value with the tag that
  // actually landed in the shop filter state. Surfaces a clear, non-blocking
  // warning whenever the conversion silently failed (unknown profile value,
  // mapping bug, etc.) — the user would otherwise see an unexplained empty
  // product list. Result is `null` when there is nothing to compare yet.
  //
  // We pass `selectedMobility` *raw* (rather than pre-filtering it through
  // `isMobilityTag`) so the validator can distinguish three cases that
  // require different UX:
  //   - real tag           → "ok" / "auto_corrected"
  //   - UI sentinel ("all")→ "unknown_filter_tag" (silent, safe fallback)
  //   - null/undefined     → "mapping_failed" (genuine pipeline bug)
  // This is what gives us the "voluntary Tous → no warning" guarantee.
  const mobilityConversion = useMemo<MobilityConversionResult | null>(() => {
    if (!preferencesApplied || !userPreferences) return null;
    return validateMobilityConversion(userPreferences.mobility_level, selectedMobility);
  }, [preferencesApplied, userPreferences, selectedMobility]);

  // Extra UX safeguard: even when the validator *would* warn (e.g. the
  // profile value is `invalid_profile_value`), suppress the banner if the
  // user has explicitly set the filter to "Tous". Their intent is clear —
  // they don't want a mobility filter right now — and a banner pushing
  // them to "fix" their profile would be intrusive.
  const showMobilityConversionWarning =
    !!mobilityConversion &&
    shouldWarnUser(mobilityConversion.status) &&
    selectedMobility !== 'all';

  // Initialize price range once products load
  useEffect(() => {
    if (products && products.length > 0 && !priceRangeInitialized) {
      setPriceRange([priceBounds.min, priceBounds.max]);
      setPriceRangeInitialized(true);
    }
  }, [products, priceBounds, priceRangeInitialized]);

  const isPriceFilterActive = priceRangeInitialized && (priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max);

  // Use the new multi-tag filter system
  const { filteredProducts, filterCounts } = useProductFilters(products, {
    selectedMobility,
    selectedUsageTime,
    selectedGender,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedIncontinence,
    priceMin: priceRange[0],
    priceMax: priceRange[1],
    categories: categories as { id: string; parent_id: string | null }[],
  });

  const activeFiltersCount = [
    selectedCategory, 
    selectedBrand, 
    selectedIncontinence, 
    selectedMobility, 
    selectedUsageTime,
    selectedGender
  ].filter(f => f !== "all").length + (isPriceFilterActive ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedIncontinence("all");
    setSelectedMobility("all");
    setSelectedUsageTime("all");
    setSelectedGender("all");
    setSearchQuery("");
    setPriceRange([priceBounds.min, priceBounds.max]);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  // Categories where incontinence-specific filters make sense
  const INCONTINENCE_CATEGORY_IDS = useMemo(() => {
    if (!categories) return new Set<string>();
    const incontinenceParentId = '6c55f927-f627-41fa-bb30-fccefbc2475d';
    const relatedTopLevel = [
      'c958ff37-2b2c-4abe-92fb-61a52576ee4d', // Changes complets
      '568a3823-0b40-4741-be64-ee66fadc73cf', // Protections anatomiques
      'ec26095f-a47f-4608-85a6-f15864908796', // Sous-vêtements absorbants
      'a4541b4c-59a0-4b52-90c5-a4b2f61e4baa', // Alèses
    ];
    const childIds = categories.filter(c => c.parent_id === incontinenceParentId).map(c => c.id);
    return new Set([incontinenceParentId, ...childIds, ...relatedTopLevel]);
  }, [categories]);

  const showIncontinenceFilters = selectedCategory === 'all' || INCONTINENCE_CATEGORY_IDS.has(selectedCategory);

  // Reset incontinence filters when switching to a non-incontinence category
  useEffect(() => {
    if (!showIncontinenceFilters) {
      setSelectedIncontinence('all');
      setSelectedMobility('all');
      setSelectedUsageTime('all');
    }
  }, [showIncontinenceFilters]);

  const handleSelectorFiltersApply = (filters: {
    gender?: string;
    usageTime?: string;
    mobility?: string;
    incontinenceLevel?: string;
  }) => {
    if (filters.usageTime) setSelectedUsageTime(filters.usageTime);
    if (filters.mobility) setSelectedMobility(filters.mobility);
    if (filters.incontinenceLevel) setSelectedIncontinence(filters.incontinenceLevel);
    if (filters.gender) setSelectedGender(filters.gender);
    setShowProductSelector(false);
  };

  const isFilterActive = (value: string) => value !== "all";

  const FilterButton = ({ 
    options, 
    value, 
    onChange, 
    label,
    showDroplets = false,
    counts
  }: { 
    options: ReadonlyArray<{ id: string; label: string; icon?: number }>; 
    value: string; 
    onChange: (v: string) => void; 
    label: string;
    showDroplets?: boolean;
    counts?: Record<string, number>;
  }) => {
    const active = isFilterActive(value);
    const selectedOption = options.find(o => o.id === value);
    
    return (
      <div className="relative group">
        <button className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
          active 
            ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20" 
            : "bg-card border border-border text-foreground hover:border-primary"
        )}>
          <span className={cn(active && "font-semibold")}>
            {active ? selectedOption?.label : `${label}: Tous`}
          </span>
          {active && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange("all");
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {!active && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <div className="absolute top-full left-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          {options.map((option) => {
            const count = option.id === "all" ? products?.length : counts?.[option.id];
            const hasProducts = option.id === "all" || !counts || (count && count > 0);
            
            return (
              <button
                key={option.id}
                onClick={() => onChange(option.id)}
                disabled={!hasProducts}
                className={`w-full text-left px-4 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors flex items-center justify-between ${
                  !hasProducts
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : value === option.id 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  {option.label}
                  {counts && option.id !== "all" && (
                    <span className={`text-xs ${value === option.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      ({count || 0})
                    </span>
                  )}
                </span>
                {showDroplets && option.icon && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Droplet
                        key={i}
                        className={`w-3 h-3 ${
                          i < option.icon! 
                            ? value === option.id ? 'fill-primary-foreground text-primary-foreground' : 'fill-primary text-primary'
                            : value === option.id ? 'fill-primary-foreground/30 text-primary-foreground/30' : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const categoryOptions = [
    { id: "all", label: "Toutes" },
    ...(categories?.map(c => ({ id: c.id, label: c.name })) || [])
  ];

  const brandOptions = [
    { id: "all", label: "Toutes" },
    ...(brands?.map(b => ({ id: b.id, label: b.name })) || [])
  ];

  return (
    <>
      <Helmet>
        <title>Boutique - Protections incontinence | SerenCare</title>
        <meta name="description" content="Découvrez notre sélection de protections pour l'incontinence. TENA, Hartmann, Lille Healthcare. Livraison gratuite, abonnement flexible." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-background py-12 md:py-16 border-b border-border">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mb-8"
            >
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Nos produits
              </h1>
              <p className="text-lg text-muted-foreground">
                Sélectionnez les protections adaptées. Filtrez par besoin, nous vous recommandons les meilleures options.
              </p>
            </motion.div>

            {/* Search & Product Selector CTA */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 max-w-xl">
                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Rechercher un produit, une marque..."
                  resultCount={searchQuery ? filteredProducts?.length : undefined}
                />
              </div>
              <Button 
                onClick={() => setShowProductSelector(true)}
                className="gap-2 h-12"
                variant="outline"
              >
                <Sparkles className="w-4 h-4" />
                Aide au choix guidé
              </Button>
            </div>
          </div>
        </section>

        {/* Product Selector Modal */}
        <AnimatePresence>
          {showProductSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl"
              >
                <ProductSelector 
                  onFiltersApply={handleSelectorFiltersApply}
                  onClose={() => setShowProductSelector(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category CTAs */}
        {categories && categories.length > 0 && (
          <section className="py-8 md:py-10 border-b border-border">
            <div className="container-main">
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Catégories populaires
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                {categories
                  .filter(c => !c.parent_id) // Only parent categories
                  .map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(isActive ? "all" : cat.id);
                        }}
                        className={cn(
                          "flex-shrink-0 w-[120px] md:w-auto flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 group",
                          isActive
                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                            : "border-border bg-card hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
                        )}
                      >
                        <div className={cn(
                          "w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
                          isActive && "ring-2 ring-primary/30"
                        )}>
                          {cat.image_url ? (
                            <img 
                              src={cat.image_url} 
                              alt={cat.name} 
                              className="w-full h-full object-contain p-1"
                              loading="lazy"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <span className={cn(
                          "text-xs md:text-sm font-medium text-center leading-tight line-clamp-2",
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* Filters & Products */}
        <section className="py-8 md:py-12">
          <div className="container-main">
            {/* Desktop Filters */}
            <div className="hidden lg:flex flex-wrap items-center gap-3 mb-8">
              <FilterButton options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} label="Catégorie" />
              <FilterButton options={brandOptions} value={selectedBrand} onChange={setSelectedBrand} label="Marque" />
              {showIncontinenceFilters && (
                <>
                  <FilterButton options={incontinenceLevelOptions} value={selectedIncontinence} onChange={setSelectedIncontinence} label="Absorption" showDroplets counts={filterCounts.incontinence} />
                  <FilterButton options={mobilityFilterOptions} value={selectedMobility} onChange={setSelectedMobility} label="Mobilité" counts={filterCounts.mobility} />
                  <FilterButton options={usageTimeFilterOptions} value={selectedUsageTime} onChange={setSelectedUsageTime} label="Moment" counts={filterCounts.usageTime} />
                </>
              )}
              <FilterButton options={genderFilterOptions} value={selectedGender} onChange={setSelectedGender} label="Genre" counts={filterCounts.gender} />
              
              {/* Price Range Filter */}
              <div className="relative group">
                <button className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isPriceFilterActive 
                    ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20" 
                    : "bg-card border border-border text-foreground hover:border-primary"
                )}>
                  <Euro className="w-4 h-4" />
                  <span className={cn(isPriceFilterActive && "font-semibold")}>
                    {isPriceFilterActive ? `${priceRange[0]}€ – ${priceRange[1]}€` : "Prix"}
                  </span>
                  {isPriceFilterActive ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPriceRange([priceBounds.min, priceBounds.max]); }}
                      className="ml-1 p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <div className="absolute top-full left-0 mt-2 w-72 bg-card rounded-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Fourchette de prix</p>
                  <Slider
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={1}
                    value={priceRange}
                    onValueChange={(v) => setPriceRange(v as [number, number])}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between text-sm text-foreground">
                    <span>{priceRange[0]}€</span>
                    <span>{priceRange[1]}€</span>
                  </div>
                </div>
              </div>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Effacer ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Non-blocking info: mobility value was auto-translated */}
            {mobilityAutoTranslation && (
              <div
                role="status"
                aria-live="polite"
                className="mb-6 flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5 text-foreground"
              >
                <div className="flex-1 text-sm space-y-2">
                  <p>
                    <strong>Filtre mobilité ajusté :</strong>{" "}
                    la valeur <span className="font-mono">"{mobilityAutoTranslation.from}"</span>{" "}
                    a été automatiquement traduite en{" "}
                    <strong>{mobilityAutoTranslation.to.label}</strong>.
                    {" "}
                    <button
                      type="button"
                      onClick={() => setShowMobilityExplanation(v => !v)}
                      className="underline text-primary hover:text-primary/80 transition-colors"
                      aria-expanded={showMobilityExplanation}
                    >
                      {showMobilityExplanation ? "Masquer l'explication" : "Pourquoi ?"}
                    </button>
                  </p>
                  {showMobilityExplanation && (
                    <p className="text-xs text-muted-foreground">
                      Votre profil enregistre le niveau de mobilité avec un code interne
                      (par ex. <span className="font-mono">reduced</span>), tandis que la
                      boutique utilise des libellés en français
                      (par ex. <span className="font-mono">reduite</span>).
                      Nous avons appliqué la correspondance automatiquement pour vous
                      afficher les bons produits.{" "}
                      <Link
                        to="/compte"
                        className="underline text-primary hover:text-primary/80"
                      >
                        Mettre à jour mes préférences
                      </Link>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setMobilityAutoTranslation(null)}
                  className="self-start sm:self-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Masquer ce message"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobility filter mismatch hint (no auto-translation possible) */}
            {mobilityHint && !mobilityHint.suggestion && (
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-foreground">
                <div className="flex-1 text-sm">
                  <strong>Filtre mobilité non reconnu :</strong>{" "}
                  <span className="font-mono">"{mobilityHint.currentValue}"</span> ne correspond à aucune option disponible.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedMobility('all')}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}

            {/* End-to-end conversion warning: profile value → filter tag failed.
                a11y: this is informational, not an emergency. We use
                role="status" with aria-live="polite" so screen readers
                announce it on the next pause instead of interrupting the
                user mid-sentence (which role="alert" / aria-live="assertive"
                would do). aria-atomic ensures the full message is re-read
                if it changes (e.g. when the explainer is toggled). */}
            {showMobilityConversionWarning && mobilityConversion && (
              <section
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-labelledby="mobility-warning-heading"
                className="mb-6 flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-foreground"
              >
                <div className="flex-1 text-sm space-y-2">
                  {/* h2 keeps the banner consistent with the page's section
                      hierarchy (h1 "Nos produits" → h2 for siblings like
                      "Catégories populaires"). Visually styled as inline
                      body copy to preserve the compact banner layout. */}
                  <h2
                    id="mobility-warning-heading"
                    className="text-sm font-bold inline"
                  >
                    Filtre mobilité non appliqué.
                  </h2>{" "}
                  <p className="inline">
                    {mobilityConversion.warningMessage}
                  </p>
                  {/* Status-specific, actionable guidance — tells the user
                      exactly what to fix on the account screen. */}
                  <p className="text-sm">
                    <strong>À corriger&nbsp;:</strong>{" "}
                    {mobilityConversion.status === 'invalid_profile_value' ? (
                      <>
                        la valeur enregistrée pour votre niveau de mobilité
                        (<span className="font-mono">"{mobilityConversion.rawProfileValue}"</span>)
                        n'est plus reconnue. Ouvrez la section{" "}
                        <em>Préférences de soins</em> de votre compte et
                        sélectionnez à nouveau l'une des options proposées
                        (Mobile, Mobilité réduite ou Alité·e).
                      </>
                    ) : (
                      <>
                        rouvrez la section <em>Préférences de soins</em> de
                        votre compte et resélectionnez votre niveau de
                        mobilité pour réappliquer le filtre automatiquement.
                      </>
                    )}
                  </p>

                  {/* Plain-language explainer disclosure. Kept collapsed by
                      default so it doesn't compete with the actionable
                      guidance above; useful for users who don't grasp the
                      "profil vs filtre" distinction at first glance. The
                      copy here intentionally avoids any tag/enum jargon —
                      the technical breadcrumbs live in the next paragraph. */}
                  <p>
                    <button
                      type="button"
                      onClick={() => setShowMobilityExplanation((v) => !v)}
                      aria-expanded={showMobilityExplanation}
                      aria-controls="mobility-warning-explanation"
                      className="text-sm font-medium text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      {showMobilityExplanation
                        ? 'Masquer l\u2019explication'
                        : 'Pourquoi je vois ce message\u00a0?'}
                    </button>
                  </p>
                  {showMobilityExplanation && (
                    <div
                      id="mobility-warning-explanation"
                      className="rounded-lg border border-border bg-background/60 p-3 text-sm text-muted-foreground space-y-2"
                    >
                      <p>
                        Votre <strong>profil</strong> contient une indication
                        sur votre mobilité (par exemple « Mobile » ou
                        « Mobilité réduite »). La boutique s\u2019en sert
                        pour activer automatiquement le bon{" "}
                        <strong>filtre</strong> de produits, afin de ne vous
                        montrer que ceux qui correspondent à votre situation.
                      </p>
                      <p>
                        Ici, ces deux informations ne correspondent pas\u00a0:
                        nous n\u2019avons pas pu choisir un filtre adapté à
                        partir de la valeur enregistrée dans votre profil.
                        Aucun produit n\u2019a été masqué\u00a0— vous pouvez
                        continuer à parcourir la boutique normalement, ou
                        mettre à jour votre profil pour retrouver des
                        recommandations personnalisées.
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Détails techniques :{" "}
                    <span className="font-mono">
                      profil = "{mobilityConversion.rawProfileValue ?? '∅'}"
                      {" → "}
                      filtre = "{mobilityConversion.resolvedFilterTag ?? '∅'}"
                    </span>
                    {" "}(<span className="font-mono">{mobilityConversion.status}</span>)
                  </p>
                </div>
                {/* Deep-link with hash anchor: Account.tsx scrolls the
                    matching section into view on mount. */}
                <Link
                  to="/compte#preferences-soins"
                  aria-label="Ouvrir mes préférences de soins pour corriger mon niveau de mobilité"
                  className="self-start px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Corriger ma mobilité dans mon compte
                </Link>
              </section>
            )}

            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2">{activeFiltersCount}</Badge>
                  )}
                </span>
                {showFilters ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 bg-card rounded-xl border border-border space-y-4"
                >
                  {/* Catégorie */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Catégorie</p>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedCategory === cat.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marque */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Marque</p>
                    <div className="flex flex-wrap gap-2">
                      {brandOptions.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => setSelectedBrand(brand.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedBrand === brand.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {brand.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {showIncontinenceFilters && (
                    <>
                      {/* Absorption */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                          <Droplet className="w-3 h-3" /> Absorption
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {incontinenceLevelOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setSelectedIncontinence(opt.id)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                selectedIncontinence === opt.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {opt.label}
                              {opt.icon && (
                                <span className="flex items-center gap-0.5">
                                  {Array.from({ length: opt.icon }).map((_, i) => (
                                    <Droplet key={i} className={`w-2.5 h-2.5 ${selectedIncontinence === opt.id ? 'fill-primary-foreground' : 'fill-primary'}`} />
                                  ))}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobilité */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                          <Footprints className="w-3 h-3" /> Mobilité
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {mobilityFilterOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setSelectedMobility(opt.id)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                selectedMobility === opt.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Moment d'utilisation */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                          <Sun className="w-3 h-3" /> Moment
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {usageTimeFilterOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setSelectedUsageTime(opt.id)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                selectedUsageTime === opt.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                   {/* Genre */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                      <User className="w-3 h-3" /> Genre
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {genderFilterOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedGender(opt.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedGender === opt.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prix */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                      <Euro className="w-3 h-3" /> Prix
                    </p>
                    <Slider
                      min={priceBounds.min}
                      max={priceBounds.max}
                      step={1}
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      className="mb-2"
                    />
                    <div className="flex items-center justify-between text-sm text-foreground">
                      <span>{priceRange[0]}€</span>
                      <span>{priceRange[1]}€</span>
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" onClick={clearFilters} className="w-full">
                      Effacer les filtres ({activeFiltersCount})
                    </Button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-6">
              {filteredProducts?.length || 0} produit{(filteredProducts?.length || 0) > 1 ? "s" : ""}
            </p>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aucun produit ne correspond à vos critères.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Voir tous les produits
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                {[...filteredProducts]
                  .sort((a, b) => {
                    // Priority: incontinence products first, then by category
                    const aIsIncontinence = !!a.incontinence_level;
                    const bIsIncontinence = !!b.incontinence_level;
                    if (aIsIncontinence && !bIsIncontinence) return -1;
                    if (!aIsIncontinence && bIsIncontinence) return 1;
                    // Then featured products
                    if (a.is_featured && !b.is_featured) return -1;
                    if (!a.is_featured && b.is_featured) return 1;
                    return 0;
                  })
                  .map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.5) }}
                    className="h-full"
                  >
                    <ProductCard 
                      product={product} 
                      onClick={() => handleProductClick(product)}
                      compact={isMobile}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Guides CTA Section */}
        <section className="py-12 md:py-16 bg-muted/30 border-t border-border">
          <div className="container-main">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Besoin d'aide pour choisir ?
              </h2>
              <p className="text-muted-foreground">
                Consultez nos guides pratiques pour faire le bon choix.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowProductSelector(true)} 
                className="block w-full text-left group"
              >
                <div className="p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-300 text-center cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1">
                  <Droplet className="w-8 h-8 mx-auto mb-3 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Choisir le bon produit
                  </h3>
                </div>
              </button>
              <Link to="/guides/comment-choisir-la-bonne-taille" className="block group">
                <div className="p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-300 text-center transform hover:scale-[1.02] hover:-translate-y-1">
                  <Footprints className="w-8 h-8 mx-auto mb-3 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Choisir la bonne taille
                  </h3>
                </div>
              </Link>
              <Link to="/guides" className="block group">
                <div className="p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-300 text-center transform hover:scale-[1.02] hover:-translate-y-1">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Tous nos guides
                  </h3>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Product Quick View */}
        <ProductQuickView 
          product={selectedProduct}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      </Layout>
    </>
  );
};

export default Shop;
