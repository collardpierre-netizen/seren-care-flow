import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/shop/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { SHOP_GROUPS, isNutritionCategory } from '@/lib/shopTaxonomy';

import lilleLogo from '@/assets/lille-logo.png';
import hartmannLogo from '@/assets/hartmann-logo.png';
import tenaLogo from '@/assets/tena-logo.png';

interface BrandPage {
  slug: string;
  name: string;
  logo: string;
  intro: string;
  website: string;
  /** Marques enregistrées en base rattachées à cette page. */
  brandSlugs: string[];
  note?: string;
}

const BRAND_PAGES: BrandPage[] = [
  {
    slug: 'tena',
    name: 'TENA',
    logo: tenaLogo,
    intro:
      "Les références TENA disponibles chez SerenCare, regroupées par forme de protection pour comparer les formats, les tailles et les prix.",
    website: 'https://www.tena.be/fr/',
    brandSlugs: ['tena'],
  },
  {
    slug: 'hartmann',
    name: 'HARTMANN',
    logo: hartmannLogo,
    intro:
      "Les références HARTMANN disponibles chez SerenCare, regroupées par forme de protection pour comparer les formats, les tailles et les prix.",
    website: 'https://www.hartmann.info/fr-be/',
    brandSlugs: ['hartmann', 'molicare'],
    note: 'MoliCare est la gamme de protections du fabricant HARTMANN.',
  },
  {
    slug: 'lille',
    name: 'Lille Healthcare',
    logo: lilleLogo,
    intro:
      "Les références Lille Healthcare disponibles chez SerenCare, regroupées par forme de protection pour comparer les formats, les tailles et les prix.",
    website: 'https://lillehealthcare.com/fr/',
    brandSlugs: ['lille', 'lille-healthcare'],
  },
];

const BrandShop: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const brandPage = BRAND_PAGES.find((b) => b.slug === slug);
  const { data: products, isLoading } = useProducts();

  const brandProducts = useMemo(() => {
    if (!products || !brandPage) return [];
    return products.filter(
      (p) => p.brand?.slug && brandPage.brandSlugs.includes(p.brand.slug)
    );
  }, [products, brandPage]);

  const sections = useMemo(() => {
    const result = SHOP_GROUPS.map((group) => ({
      id: group.id,
      label: group.label,
      explanation: group.explanation,
      items: brandProducts.filter(
        (p) => p.category_id && group.categoryIds.includes(p.category_id)
      ),
    })).filter((s) => s.items.length > 0);

    const nutrition = brandProducts.filter((p) => isNutritionCategory(p.category_id));
    if (nutrition.length > 0) {
      result.push({
        id: 'nutrition' as never,
        label: 'Nutrition',
        explanation: 'Boissons et crèmes nutritives, à distinguer des protections.',
        items: nutrition,
      });
    }

    const placed = new Set(result.flatMap((s) => s.items.map((i) => i.id)));
    const others = brandProducts.filter((p) => !placed.has(p.id));
    if (others.length > 0) {
      result.push({
        id: 'autres' as never,
        label: 'Autres références',
        explanation: 'Produits de la marque classés dans une autre catégorie.',
        items: others,
      });
    }
    return result;
  }, [brandProducts]);

  if (!brandPage) {
    return <Navigate to="/marques" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{`Produits ${brandPage.name} | SerenCare`}</title>
        <meta name="description" content={brandPage.intro.slice(0, 155)} />
        <link rel="canonical" href={`https://www.serencare.be/marque/${brandPage.slug}`} />
      </Helmet>
      <Layout>
        <div className="container-main py-8 md:py-12">
          <Link
            to="/marques"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Toutes les marques
          </Link>

          <header className="mt-4 flex flex-col md:flex-row md:items-center gap-6 border-b border-border pb-8">
            <div className="bg-card rounded-2xl border border-border p-5 w-fit">
              <img
                src={brandPage.logo}
                alt={`Logo ${brandPage.name}`}
                className="h-12 md:h-14 object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Produits {brandPage.name}
              </h1>
              <p className="text-muted-foreground max-w-2xl">{brandPage.intro}</p>
              {brandPage.note && (
                <p className="text-sm text-muted-foreground mt-2">{brandPage.note}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button asChild variant="outline" size="sm" className="gap-2 min-h-[44px]">
                  <a href={brandPage.website} target="_blank" rel="noopener noreferrer">
                    Site du fabricant
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button asChild size="sm" className="min-h-[44px]">
                  <Link to="/boutique">Voir toute la boutique</Link>
                </Button>
              </div>
            </div>
          </header>

          {isLoading ? (
            <p className="py-16 text-center text-muted-foreground">Chargement des produits…</p>
          ) : brandProducts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-foreground font-medium mb-2">
                Aucun produit {brandPage.name} n'est disponible actuellement.
              </p>
              <p className="text-muted-foreground mb-6">
                Vous pouvez consulter les autres marques de la boutique.
              </p>
              <Button asChild className="min-h-[44px]">
                <Link to="/boutique">Voir la boutique</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-12 py-10">
              <p className="text-sm text-muted-foreground">
                {brandProducts.length} référence{brandProducts.length > 1 ? 's' : ''} disponible
                {brandProducts.length > 1 ? 's' : ''}.
              </p>
              {sections.map((section) => (
                <section key={section.id} aria-labelledby={`section-${section.id}`}>
                  <div className="mb-5">
                    <h2
                      id={`section-${section.id}`}
                      className="font-display text-2xl font-bold text-foreground"
                    >
                      {section.label}
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        ({section.items.length})
                      </span>
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">{section.explanation}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {section.items.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default BrandShop;
