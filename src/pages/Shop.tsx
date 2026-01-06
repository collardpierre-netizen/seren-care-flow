import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ChevronDown, Loader2, Package, Droplet, Moon, Sun, Footprints } from "lucide-react";
import { useProducts, useBrands, useCategories, Product } from "@/hooks/useProducts";
import ProductCard from "@/components/shop/ProductCard";
import ProductQuickView from "@/components/shop/ProductQuickView";

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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    brandId: selectedBrand !== "all" ? selectedBrand : undefined,
  });
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  // Filter products by incontinence, mobility, and usage time
  const filteredProducts = products?.filter(product => {
    if (selectedIncontinence !== "all" && product.incontinence_level !== selectedIncontinence) return false;
    if (selectedMobility !== "all" && product.mobility !== selectedMobility) return false;
    if (selectedUsageTime !== "all" && product.usage_time !== selectedUsageTime) return false;
    return true;
  });

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
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const FilterButton = ({ 
    options, 
    value, 
    onChange, 
    label,
    showDroplets = false
  }: { 
    options: { id: string; label: string; icon?: number }[]; 
    value: string; 
    onChange: (v: string) => void; 
    label: string;
    showDroplets?: boolean;
  }) => (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:border-primary transition-colors">
        {label}: {options.find(o => o.id === value)?.label || 'Tous'}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="absolute top-full left-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`w-full text-left px-4 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors flex items-center justify-between ${
              value === option.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
            }`}
          >
            <span>{option.label}</span>
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
        ))}
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
              className="max-w-2xl"
            >
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Nos produits
              </h1>
              <p className="text-lg text-muted-foreground">
                Sélectionnez les protections adaptées. Filtrez par besoin, nous vous recommandons les meilleures options.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-8 md:py-12">
          <div className="container-main">
            {/* Desktop Filters */}
            <div className="hidden lg:flex flex-wrap items-center gap-3 mb-8">
              <FilterButton options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} label="Catégorie" />
              <FilterButton options={brandOptions} value={selectedBrand} onChange={setSelectedBrand} label="Marque" />
              <FilterButton options={incontinenceLevelOptions} value={selectedIncontinence} onChange={setSelectedIncontinence} label="Absorption" showDroplets />
              <FilterButton options={mobilityOptions} value={selectedMobility} onChange={setSelectedMobility} label="Mobilité" />
              <FilterButton options={usageTimeOptions} value={selectedUsageTime} onChange={setSelectedUsageTime} label="Moment" />
              
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
                    transition={{ duration: 0.4, delay: index * 0.05 }}
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
