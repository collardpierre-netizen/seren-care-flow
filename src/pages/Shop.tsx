import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingCart, RefreshCw, Filter, X } from "lucide-react";

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

const mobilityLevels = [
  { id: "all", label: "Toute mobilité" },
  { id: "mobile", label: "Mobile" },
  { id: "semi-mobile", label: "Semi-mobile" },
  { id: "bedridden", label: "Alité" },
];

const brands = [
  { id: "all", label: "Toutes marques" },
  { id: "TENA", label: "TENA" },
  { id: "Hartmann", label: "Hartmann" },
  { id: "Lille Healthcare", label: "Lille Healthcare" },
];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIncontinence, setSelectedIncontinence] = useState("all");
  const [selectedMobility, setSelectedMobility] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
    if (selectedIncontinence !== "all" && product.incontinence !== selectedIncontinence) return false;
    if (selectedMobility !== "all" && product.mobility !== selectedMobility) return false;
    if (selectedBrand !== "all" && product.brand !== selectedBrand) return false;
    return true;
  });

  const activeFiltersCount = [selectedCategory, selectedIncontinence, selectedMobility, selectedBrand].filter(f => f !== "all").length;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedIncontinence("all");
    setSelectedMobility("all");
    setSelectedBrand("all");
  };

  return (
    <>
      <Helmet>
        <title>Boutique - Protections incontinence | SerenCare</title>
        <meta name="description" content="Découvrez notre sélection de protections pour l'incontinence. TENA, Hartmann, Lille Healthcare. Livraison gratuite, abonnement flexible." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-accent/30 py-12 md:py-20">
          <div className="container-main">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Choisissez vos protections
              </h1>
              <p className="text-lg text-muted-foreground">
                Filtrez par besoin pour trouver la solution adaptée. Toutes nos marques sont de confiance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="section-padding">
          <div className="container-main">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
                    )}
                  </span>
                  {showFilters ? <X className="w-4 h-4" /> : null}
                </Button>
              </div>

              {/* Sidebar Filters */}
              <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-semibold text-foreground">Filtres</h3>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                        Effacer
                      </Button>
                    )}
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Type de protection</h4>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === cat.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Incontinence Level */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Niveau d'incontinence</h4>
                    <div className="space-y-2">
                      {incontinenceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setSelectedIncontinence(level.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedIncontinence === level.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobility */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Mobilité</h4>
                    <div className="space-y-2">
                      {mobilityLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setSelectedMobility(level.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedMobility === level.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Marque</h4>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => setSelectedBrand(brand.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedBrand === brand.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {brand.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
                  </p>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
                    <p className="text-muted-foreground mb-4">Aucun produit ne correspond à vos critères.</p>
                    <Button variant="outline" onClick={clearFilters}>
                      Voir tous les produits
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-card transition-all duration-300 flex flex-col"
                      >
                        {/* Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary" className="text-xs">
                            {product.brand}
                          </Badge>
                          {product.recommended && (
                            <Badge className="bg-secondary text-secondary-foreground text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Recommandé
                            </Badge>
                          )}
                        </div>

                        {/* Product Image Placeholder */}
                        <div className="aspect-square bg-accent/50 rounded-xl mb-4 flex items-center justify-center">
                          <span className="text-4xl text-muted-foreground/50">📦</span>
                        </div>

                        {/* Content */}
                        <h3 className="font-display font-semibold text-foreground mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1">
                          {product.description}
                        </p>

                        {/* Sizes */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.sizes.map((size) => (
                            <span
                              key={size}
                              className="px-2 py-1 text-xs bg-accent rounded-md text-foreground"
                            >
                              {size}
                            </span>
                          ))}
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div>
                            <span className="text-2xl font-display font-bold text-foreground">
                              {product.price.toFixed(2)}€
                            </span>
                            <span className="text-sm text-muted-foreground">/mois</span>
                          </div>
                          <Button size="sm" className="gap-1">
                            <RefreshCw className="w-3 h-3" />
                            S'abonner
                          </Button>
                        </div>

                        {/* One-time purchase option */}
                        <button className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          Ou acheter une fois
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Shop;
