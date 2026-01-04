import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ChevronDown, Loader2, Package } from "lucide-react";
import { useProducts, useBrands, useCategories, Product } from "@/hooks/useProducts";
import ProductCard from "@/components/shop/ProductCard";
import ProductQuickView from "@/components/shop/ProductQuickView";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useProducts({
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    brandId: selectedBrand !== "all" ? selectedBrand : undefined,
  });
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  const activeFiltersCount = [selectedCategory, selectedBrand].filter(f => f !== "all").length;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const FilterButton = ({ 
    options, 
    value, 
    onChange, 
    label 
  }: { 
    options: { id: string; label: string }[]; 
    value: string; 
    onChange: (v: string) => void; 
    label: string 
  }) => (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:border-primary transition-colors">
        {label}: {options.find(o => o.id === value)?.label || 'Tous'}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="absolute top-full left-0 mt-2 w-48 bg-card rounded-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`w-full text-left px-4 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors ${
              value === option.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
            }`}
          >
            {option.label}
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
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <FilterButton options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} label="Catégorie" />
              <FilterButton options={brandOptions} value={selectedBrand} onChange={setSelectedBrand} label="Marque" />
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Effacer les filtres
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
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" onClick={clearFilters} className="w-full">
                      Effacer les filtres
                    </Button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-6">
              {products?.length || 0} produit{(products?.length || 0) > 1 ? "s" : ""}
            </p>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aucun produit ne correspond à vos critères.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Voir tous les produits
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products?.map((product, index) => (
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
