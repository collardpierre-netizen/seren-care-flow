import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ChevronDown, Loader2, Package, Droplet, Moon, Sun, Footprints, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, useBrands, useCategories, Product } from "@/hooks/useProducts";
import { 
  useProductFilters, 
  mobilityFilterOptions, 
  usageTimeFilterOptions, 
  genderFilterOptions 
} from "@/hooks/useProductFilters";
import { useUserPreferences, mapProfileToFilters } from "@/hooks/useUserPreferences";
import ProductCard from "@/components/shop/ProductCard";
import ProductQuickView from "@/components/shop/ProductQuickView";
import SearchBar from "@/components/shop/SearchBar";
import ProductSelector from "@/components/shop/ProductSelector";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [selectedMobility, setSelectedMobility] = useState<string>("all");
  const [selectedUsageTime, setSelectedUsageTime] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [preferencesApplied, setPreferencesApplied] = useState(false);

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
        if (profileFilters.gender) setSelectedGender(profileFilters.gender);
        if (profileFilters.mobility) setSelectedMobility(profileFilters.mobility);
        if (profileFilters.incontinenceLevel) setSelectedIncontinence(profileFilters.incontinenceLevel);
        if (profileFilters.usageTime) setSelectedUsageTime(profileFilters.usageTime);
      }
      setPreferencesApplied(true);
    }
  }, [userPreferences, preferencesApplied]);

  // Use the new multi-tag filter system
  const { filteredProducts, filterCounts } = useProductFilters(products, {
    selectedMobility,
    selectedUsageTime,
    selectedGender,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedIncontinence,
    categories: categories as { id: string; parent_id: string | null }[],
  });

  const activeFiltersCount = [
    selectedCategory, 
    selectedBrand, 
    selectedIncontinence, 
    selectedMobility, 
    selectedUsageTime,
    selectedGender
  ].filter(f => f !== "all").length;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedIncontinence("all");
    setSelectedMobility("all");
    setSelectedUsageTime("all");
    setSelectedGender("all");
    setSearchQuery("");
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
    options: { id: string; label: string; icon?: number }[]; 
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

            {/* Mobile Filter Toggle */}
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
