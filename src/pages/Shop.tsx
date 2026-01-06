import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ChevronDown, Loader2, Package, Droplet, Moon, Sun, Footprints, Sparkles } from "lucide-react";
import { useProducts, useBrands, useCategories, Product } from "@/hooks/useProducts";
import ProductCard from "@/components/shop/ProductCard";
import ProductQuickView from "@/components/shop/ProductQuickView";
import SearchBar from "@/components/shop/SearchBar";
import ProductSelector from "@/components/shop/ProductSelector";
import { Link } from "react-router-dom";

const incontinenceLevelOptions = [
  { id: "all", label: "Tous" },
  { id: "light", label: "Légère", icon: 1 },
  { id: "moderate", label: "Modérée", icon: 2 },
  { id: "heavy", label: "Forte", icon: 3 },
  { id: "very_heavy", label: "Très forte", icon: 4 },
];

const mobilityOptions = [
  { id: "all", label: "Toutes" },
  { id: "mobile", label: "Mobile" },
  { id: "reduced", label: "Réduite" },
  { id: "bedridden", label: "Alitée" },
];

const usageTimeOptions = [
  { id: "all", label: "Tous" },
  { id: "day", label: "Jour" },
  { id: "night", label: "Nuit" },
  { id: "day_night", label: "Jour & Nuit" },
];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedIncontinence, setSelectedIncontinence] = useState<string>("all");
  const [selectedMobility, setSelectedMobility] = useState<string>("all");
  const [selectedUsageTime, setSelectedUsageTime] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    brandId: selectedBrand !== "all" ? selectedBrand : undefined,
  });
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  // Filter products by search, incontinence, mobility, and usage time
  const filteredProducts = useMemo(() => {
    return products?.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand?.name.toLowerCase().includes(query);
        const matchesDescription = product.short_description?.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesDescription) return false;
      }
      
      // Only filter if not "all" and product has a value for that attribute
      if (selectedIncontinence !== "all" && product.incontinence_level && product.incontinence_level !== selectedIncontinence) return false;
      if (selectedMobility !== "all" && product.mobility && product.mobility !== selectedMobility) return false;
      if (selectedUsageTime !== "all") {
        // day_night products should show for both "day" and "night" filters
        if (product.usage_time === "day_night") {
          // day_night products match all usage time filters
        } else if (product.usage_time !== selectedUsageTime) {
          return false;
        }
      }
      return true;
    });
  }, [products, searchQuery, selectedIncontinence, selectedMobility, selectedUsageTime]);

  // Calculate count of products for each filter option
  const getFilterCounts = useMemo(() => {
    const counts = {
      incontinence: {} as Record<string, number>,
      mobility: {} as Record<string, number>,
      usageTime: {} as Record<string, number>,
    };
    
    products?.forEach(product => {
      if (product.incontinence_level) {
        counts.incontinence[product.incontinence_level] = (counts.incontinence[product.incontinence_level] || 0) + 1;
      }
      if (product.mobility) {
        counts.mobility[product.mobility] = (counts.mobility[product.mobility] || 0) + 1;
      }
      if (product.usage_time) {
        counts.usageTime[product.usage_time] = (counts.usageTime[product.usage_time] || 0) + 1;
        // day_night also counts for day and night
        if (product.usage_time === "day_night") {
          counts.usageTime["day"] = (counts.usageTime["day"] || 0) + 1;
          counts.usageTime["night"] = (counts.usageTime["night"] || 0) + 1;
        }
      }
    });
    
    return counts;
  }, [products]);

  const activeFiltersCount = [
    selectedCategory, 
    selectedBrand, 
    selectedIncontinence, 
    selectedMobility, 
    selectedUsageTime
  ].filter(f => f !== "all").length;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedIncontinence("all");
    setSelectedMobility("all");
    setSelectedUsageTime("all");
    setSearchQuery("");
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleSelectorFiltersApply = (filters: {
    gender?: string;
    usageTime?: string;
    mobility?: string;
    incontinenceLevel?: string;
  }) => {
    if (filters.usageTime) setSelectedUsageTime(filters.usageTime);
    if (filters.mobility) setSelectedMobility(filters.mobility);
    if (filters.incontinenceLevel) setSelectedIncontinence(filters.incontinenceLevel);
    setShowProductSelector(false);
  };

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
  }) => (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:border-primary transition-colors">
        {label}: {options.find(o => o.id === value)?.label || 'Tous'}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="absolute top-full left-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        {options.map((option) => {
          const count = option.id === "all" ? products?.length : counts?.[option.id];
          const hasProducts = option.id === "all" || (count && count > 0);
          
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

        {/* Filters & Products */}
        <section className="py-8 md:py-12">
          <div className="container-main">
            {/* Desktop Filters */}
            <div className="hidden lg:flex flex-wrap items-center gap-3 mb-8">
              <FilterButton options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} label="Catégorie" />
              <FilterButton options={brandOptions} value={selectedBrand} onChange={setSelectedBrand} label="Marque" />
              <FilterButton options={incontinenceLevelOptions} value={selectedIncontinence} onChange={setSelectedIncontinence} label="Absorption" showDroplets counts={getFilterCounts.incontinence} />
              <FilterButton options={mobilityOptions} value={selectedMobility} onChange={setSelectedMobility} label="Mobilité" counts={getFilterCounts.mobility} />
              <FilterButton options={usageTimeOptions} value={selectedUsageTime} onChange={setSelectedUsageTime} label="Moment" counts={getFilterCounts.usageTime} />
              
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
                      {mobilityOptions.map((opt) => (
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
                      {usageTimeOptions.map((opt) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts?.map((product, index) => (
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
              <Link to="/guides/comment-choisir-le-bon-produit" className="block">
                <div className="p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all text-center group">
                  <Droplet className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Choisir le bon produit
                  </h3>
                </div>
              </Link>
              <Link to="/guides/comment-choisir-la-bonne-taille" className="block">
                <div className="p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all text-center group">
                  <Footprints className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Choisir la bonne taille
                  </h3>
                </div>
              </Link>
              <Link to="/guides" className="block">
                <div className="p-6 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all text-center group">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
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
