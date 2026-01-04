import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw, Filter, X, ChevronDown } from "lucide-react";

// Product data
const products = [
  {
    id: 1,
    name: "Protection légère jour",
    brand: "TENA",
    category: "pads",
    incontinence: "light",
    mobility: "mobile",
    moment: "day",
    sizes: ["S", "M", "L"],
    price: 24.90,
    recommended: true,
    description: "Discret et confortable pour une protection légère au quotidien.",
  },
  {
    id: 2,
    name: "Sous-vêtement absorbant",
    brand: "Hartmann",
    category: "pants",
    incontinence: "moderate",
    mobility: "mobile",
    moment: "day-night",
    sizes: ["M", "L", "XL"],
    price: 34.90,
    recommended: false,
    description: "Comme un sous-vêtement classique, avec une absorption renforcée.",
  },
  {
    id: 3,
    name: "Change complet nuit",
    brand: "Lille Healthcare",
    category: "all-in-one",
    incontinence: "strong",
    mobility: "semi-mobile",
    moment: "night",
    sizes: ["M", "L", "XL", "XXL"],
    price: 42.90,
    recommended: true,
    description: "Protection maximale pour des nuits sereines.",
  },
  {
    id: 4,
    name: "Protection modérée",
    brand: "TENA",
    category: "pads",
    incontinence: "moderate",
    mobility: "mobile",
    moment: "day",
    sizes: ["S", "M", "L", "XL"],
    price: 29.90,
    recommended: false,
    description: "Absorption optimale pour une activité quotidienne normale.",
  },
  {
    id: 5,
    name: "Alèse de protection",
    brand: "Hartmann",
    category: "bed-protection",
    incontinence: "strong",
    mobility: "bedridden",
    moment: "night",
    sizes: ["60x90", "90x180"],
    price: 19.90,
    recommended: false,
    description: "Protection imperméable pour le lit, douce et absorbante.",
  },
  {
    id: 6,
    name: "Slip absorbant ultra",
    brand: "Lille Healthcare",
    category: "pants",
    incontinence: "very-strong",
    mobility: "semi-mobile",
    moment: "day-night",
    sizes: ["M", "L", "XL"],
    price: 39.90,
    recommended: true,
    description: "Absorption maximale dans un format slip confortable.",
  },
];

const categories = [
  { id: "all", label: "Tous" },
  { id: "pads", label: "Protège-slips" },
  { id: "pants", label: "Sous-vêtements" },
  { id: "all-in-one", label: "Changes complets" },
  { id: "bed-protection", label: "Protection lit" },
];

const incontinenceLevels = [
  { id: "all", label: "Tous niveaux" },
  { id: "light", label: "Légère" },
  { id: "moderate", label: "Modérée" },
  { id: "strong", label: "Forte" },
  { id: "very-strong", label: "Très forte" },
];

const brands = [
  { id: "all", label: "Toutes" },
  { id: "TENA", label: "TENA" },
  { id: "Hartmann", label: "Hartmann" },
  { id: "Lille Healthcare", label: "Lille" },
];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIncontinence, setSelectedIncontinence] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
    if (selectedIncontinence !== "all" && product.incontinence !== selectedIncontinence) return false;
    if (selectedBrand !== "all" && product.brand !== selectedBrand) return false;
    return true;
  });

  const activeFiltersCount = [selectedCategory, selectedIncontinence, selectedBrand].filter(f => f !== "all").length;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedIncontinence("all");
    setSelectedBrand("all");
  };

  const FilterButton = ({ options, value, onChange, label }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void; label: string }) => (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:border-primary transition-colors">
        {label}: {options.find(o => o.id === value)?.label}
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
              <FilterButton options={categories} value={selectedCategory} onChange={setSelectedCategory} label="Type" />
              <FilterButton options={incontinenceLevels} value={selectedIncontinence} onChange={setSelectedIncontinence} label="Niveau" />
              <FilterButton options={brands} value={selectedBrand} onChange={setSelectedBrand} label="Marque" />
              
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
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Type</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
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
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Niveau</p>
                    <div className="flex flex-wrap gap-2">
                      {incontinenceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setSelectedIncontinence(level.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedIncontinence === level.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Marque</p>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((brand) => (
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
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
            </p>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <p className="text-muted-foreground mb-4">Aucun produit ne correspond à vos critères.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Voir tous les produits
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-card rounded-2xl border border-border shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* Product Image Area */}
                    <div className="aspect-[4/3] bg-muted/50 relative flex items-center justify-center">
                      <span className="text-5xl opacity-30">📦</span>
                      {product.recommended && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-secondary text-secondary-foreground shadow-md">
                            <Check className="w-3 h-3 mr-1" />
                            Recommandé
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="shadow-sm">
                          {product.brand}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {product.description}
                      </p>

                      {/* Sizes */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {product.sizes.map((size) => (
                          <span
                            key={size}
                            className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground font-medium"
                          >
                            {size}
                          </span>
                        ))}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-5 border-t border-border">
                        <div>
                          <span className="text-2xl font-display font-bold text-foreground">
                            {product.price.toFixed(2)}€
                          </span>
                          <span className="text-sm text-muted-foreground">/mois</span>
                        </div>
                        <Button size="sm" className="gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5" />
                          S'abonner
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Shop;
