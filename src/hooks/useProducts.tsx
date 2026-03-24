import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  incontinence_level: 'light' | 'moderate' | 'heavy' | 'very_heavy' | null;
  mobility: 'mobile' | 'reduced' | 'bedridden' | null;
  usage_time: 'day' | 'night' | 'day_night' | null;
  mobility_levels: string | null;
  usage_times: string | null;
  gender: string | null;
  price: number;
  recommended_price: number | null;
  purchase_price: number | null;
  units_per_product: number | null;
  subscription_price: number | null;
  subscription_discount_percent: number | null;
  min_order_quantity: number | null;
  stock_quantity: number | null;
  stock_status: string | null;
  sku: string | null;
  ean_code: string | null;
  cnk_code: string | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  is_coming_soon: boolean | null;
  show_size_guide: boolean | null;
  is_subscription_eligible: boolean | null;
  is_addon: boolean | null;
  addon_category: string | null;
  created_at: string;
  updated_at: string;
  brand?: { id: string; name: string; slug: string } | null;
  category?: { id: string; name: string; slug: string } | null;
  images?: ProductImage[];
  sizes?: ProductSize[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
  is_primary: boolean | null;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  price_adjustment: number | null;
  stock_quantity: number | null;
  sku: string | null;
  is_active: boolean | null;
  sale_price: number | null;
  purchase_price: number | null;
  public_price: number | null;
  ean_code: string | null;
  cnk_code: string | null;
  units_per_size: number | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

export const useProducts = (filters?: { 
  categoryId?: string; 
  brandId?: string; 
  featured?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:categories(*),
          images:product_images(*),
          sizes:product_sizes(*)
        `)
        .eq('is_active', true)
        .eq('is_coming_soon', false) // Exclure les produits "prochainement"
        .gt('price', 0) // Filtrer les produits sans prix
        .order('created_at', { ascending: false });

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.brandId) {
        query = query.eq('brand_id', filters.brandId);
      }
      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filtrer les produits sans tailles actives avec prix valide
      const productsWithValidOffers = (data as Product[]).filter(product => {
        const activeSizes = product.sizes?.filter(s => s.is_active !== false) || [];
        // Le produit doit avoir au moins une taille active OU pas de tailles du tout (prix de base)
        if (activeSizes.length === 0 && product.sizes && product.sizes.length > 0) {
          return false; // Produit avec tailles mais aucune active
        }
        return true;
      });
      
      return productsWithValidOffers;
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:categories(*),
          images:product_images(*),
          sizes:product_sizes(*)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!slug,
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Brand[];
    },
  });
};

export interface CategoryWithCount extends Category {
  product_count?: number;
}

export const useCategories = (options?: { includeCount?: boolean; includeEmpty?: boolean }) => {
  return useQuery({
    queryKey: ['categories', options],
    queryFn: async () => {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      if (!options?.includeCount) {
        return categories as Category[];
      }
      
      // Get product counts per category (only products with price > 0)
      const { data: products } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true)
        .gt('price', 0);
      
      const counts: Record<string, number> = {};
      products?.forEach(p => {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      });
      
      // Aggregate child category counts into parent categories
      const parentCounts: Record<string, number> = { ...counts };
      categories?.forEach(cat => {
        if (cat.parent_id && counts[cat.id]) {
          parentCounts[cat.parent_id] = (parentCounts[cat.parent_id] || 0) + counts[cat.id];
        }
      });
      
      const categoriesWithCount = categories?.map(cat => ({
        ...cat,
        product_count: parentCounts[cat.id] || 0
      })) as CategoryWithCount[];
      
      // Filter out empty categories if requested
      if (!options?.includeEmpty) {
        return categoriesWithCount.filter(cat => cat.product_count > 0);
      }
      
      return categoriesWithCount;
    },
  });
};

export const useStoreSettings = () => {
  return useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*');

      if (error) throw error;
      
      const settings: Record<string, any> = {};
      data?.forEach(item => {
        settings[item.key] = item.value;
      });
      
      return settings;
    },
  });
};
