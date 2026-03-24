import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Search, Package, Upload, Link, X, Image as ImageIcon, Download, FileUp, Copy, CheckSquare, FileSpreadsheet } from 'lucide-react';
import { ProductSizesManager } from '@/components/admin/ProductSizesManager';
import * as XLSX from 'xlsx';

interface ProductFormData {
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;
  short_description: string;
  description: string;
  incontinence_level: string;
  mobility: string;
  usage_time: string;
  // New multi-tag fields
  mobility_levels: string;
  usage_times: string;
  gender: string;
  recommended_price: number;
  price: number;
  subscription_price: number;
  subscription_discount_percent: number;
  purchase_price: number;
  units_per_product: number;
  min_order_quantity: number;
  stock_quantity: number;
  stock_status: string;
  sku: string;
  ean_code: string;
  cnk_code: string;
  manufacturer_url: string;
  is_active: boolean;
  is_featured: boolean;
  is_coming_soon: boolean;
  show_size_guide: boolean;
  // New subscription & addon fields
  is_subscription_eligible: boolean;
  is_addon: boolean;
  addon_category: string;
}

const initialFormData: ProductFormData = {
  name: '',
  slug: '',
  brand_id: '',
  category_id: '',
  short_description: '',
  description: '',
  incontinence_level: '',
  mobility: '',
  usage_time: '',
  mobility_levels: '',
  usage_times: '',
  gender: '',
  recommended_price: 0,
  price: 0,
  subscription_price: 0,
  subscription_discount_percent: 10,
  purchase_price: 0,
  units_per_product: 1,
  min_order_quantity: 1,
  stock_quantity: 0,
  stock_status: 'in_stock',
  sku: '',
  ean_code: '',
  cnk_code: '',
  manufacturer_url: '',
  is_active: true,
  is_featured: false,
  is_coming_soon: false,
  show_size_guide: true,
  is_subscription_eligible: true,
  is_addon: false,
  addon_category: '',
};

const addonCategories = [
  { value: 'pharma', label: 'Produits pharma' },
  { value: 'hygiene', label: 'Hygiène' },
  { value: 'soins', label: 'Soins' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'confort', label: 'Confort' },
];

// Multi-tag options
const mobilityLevelOptions = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'reduite', label: 'Mobilité réduite' },
  { value: 'alitee', label: 'Alitée' },
];

const usageTimesOptions = [
  { value: 'day', label: 'Jour' },
  { value: 'night', label: 'Nuit' },
];

const genderOptions = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'unisex', label: 'Unisexe' },
];

const stockStatuses = [
  { value: 'in_stock', label: 'En stock' },
  { value: 'limited', label: 'Stock limité' },
  { value: 'out_of_stock', label: 'Rupture de stock' },
  { value: 'coming_soon', label: 'Prochainement' },
];

interface ProductImage {
  id?: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

const AdminProducts: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, brand:brands(name), category:categories(name), images:product_images(*)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    },
  });

  // Helper to auto-create Stripe subscription price
  const createStripePrice = async (productId: string, subscriptionPrice: number) => {
    if (!subscriptionPrice || subscriptionPrice <= 0) return;
    
    try {
      const priceCents = Math.round(subscriptionPrice * 100);
      const { data, error } = await supabase.functions.invoke('create-stripe-price', {
        body: { product_id: productId, price_cents: priceCents },
      });
      
      if (error) {
        console.error('Stripe price creation error:', error);
        toast.info('Prix Stripe non créé automatiquement. Créez-le manuellement dans Admin → Prix Stripe.');
      } else if (data?.success) {
        toast.success('Prix Stripe abonnement créé automatiquement');
      }
    } catch (err) {
      console.error('Stripe price creation failed:', err);
    }
  };

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const insertData = {
        name: data.name,
        slug: data.slug,
        brand_id: data.brand_id || null,
        category_id: data.category_id || null,
        short_description: data.short_description || null,
        description: data.description || null,
        incontinence_level: (data.incontinence_level || null) as 'light' | 'moderate' | 'heavy' | 'very_heavy' | null,
        mobility: (data.mobility || null) as 'mobile' | 'reduced' | 'bedridden' | null,
        usage_time: (data.usage_time || null) as 'day' | 'night' | 'day_night' | null,
        mobility_levels: data.mobility_levels || '',
        usage_times: data.usage_times || '',
        gender: data.gender || '',
        recommended_price: data.recommended_price || null,
        price: data.price,
        subscription_price: data.subscription_price || null,
        purchase_price: data.purchase_price || null,
        units_per_product: data.units_per_product || 1,
        min_order_quantity: data.min_order_quantity,
        stock_quantity: data.stock_quantity,
        stock_status: data.stock_status || 'in_stock',
        sku: data.sku || null,
        ean_code: data.ean_code || '',
        cnk_code: data.cnk_code || '',
        manufacturer_url: data.manufacturer_url || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
        is_coming_soon: data.is_coming_soon || false,
        show_size_guide: data.show_size_guide,
        is_subscription_eligible: data.is_subscription_eligible,
        is_addon: data.is_addon,
        addon_category: data.addon_category || null,
      };
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;

      // Insert product images
      if (productImages.length > 0 && newProduct) {
        const imagesToInsert = productImages.map((img, index) => ({
          product_id: newProduct.id,
          image_url: img.image_url,
          alt_text: img.alt_text || data.name,
          is_primary: index === 0,
          sort_order: index,
        }));
        const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert);
        if (imgError) throw imgError;
      }

      // Auto-create Stripe subscription price
      if (data.subscription_price && data.subscription_price > 0 && newProduct) {
        await createStripePrice(newProduct.id, data.subscription_price);
      }

      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produit créé avec succès');
      setIsDialogOpen(false);
      setFormData(initialFormData);
      setProductImages([]);
    },
    onError: (error: any) => {
      if (error?.message?.includes('products_slug_key') || error?.code === '23505') {
        toast.error('Ce slug existe déjà. Veuillez utiliser un slug unique.');
      } else {
        toast.error('Erreur lors de la création du produit');
      }
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const updateData = {
        name: data.name,
        slug: data.slug,
        brand_id: data.brand_id || null,
        category_id: data.category_id || null,
        short_description: data.short_description || null,
        description: data.description || null,
        incontinence_level: (data.incontinence_level || null) as 'light' | 'moderate' | 'heavy' | 'very_heavy' | null,
        mobility: (data.mobility || null) as 'mobile' | 'reduced' | 'bedridden' | null,
        usage_time: (data.usage_time || null) as 'day' | 'night' | 'day_night' | null,
        mobility_levels: data.mobility_levels || '',
        usage_times: data.usage_times || '',
        gender: data.gender || '',
        recommended_price: data.recommended_price || null,
        price: data.price,
        subscription_price: data.subscription_price || null,
        purchase_price: data.purchase_price || null,
        units_per_product: data.units_per_product || 1,
        min_order_quantity: data.min_order_quantity,
        stock_quantity: data.stock_quantity,
        stock_status: data.stock_status || 'in_stock',
        sku: data.sku || null,
        ean_code: data.ean_code || '',
        cnk_code: data.cnk_code || '',
        manufacturer_url: data.manufacturer_url || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
        is_coming_soon: data.is_coming_soon || false,
        show_size_guide: data.show_size_guide,
        is_subscription_eligible: data.is_subscription_eligible,
        is_addon: data.is_addon,
        addon_category: data.addon_category || null,
      };
      const { error } = await supabase.from('products').update(updateData).eq('id', id);
      if (error) throw error;

      // Update images: delete old ones and insert new ones
      await supabase.from('product_images').delete().eq('product_id', id);
      if (productImages.length > 0) {
        const imagesToInsert = productImages.map((img, index) => ({
          product_id: id,
          image_url: img.image_url,
          alt_text: img.alt_text || data.name || '',
          is_primary: index === 0,
          sort_order: index,
        }));
        const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert);
        if (imgError) throw imgError;
      }

      // Auto-create Stripe subscription price if subscription_price is set and no mapping exists
      if (data.subscription_price && data.subscription_price > 0) {
        // Check if mapping already exists
        const { data: existingMapping } = await supabase
          .from('stripe_price_map')
          .select('id')
          .eq('product_id', id)
          .eq('type', 'subscription')
          .maybeSingle();
        
        if (!existingMapping) {
          await createStripePrice(id, data.subscription_price);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produit mis à jour');
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(initialFormData);
      setProductImages([]);
    },
    onError: (error: any) => {
      if (error?.message?.includes('products_slug_key') || error?.code === '23505') {
        toast.error('Ce slug existe déjà. Veuillez utiliser un slug unique.');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Produit supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const bulkDeleteProducts = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('products').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setSelectedProducts(new Set());
      setShowDeleteDialog(false);
      toast.success(`${selectedProducts.size} produit(s) supprimé(s)`);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const duplicateProducts = useMutation({
    mutationFn: async (ids: string[]) => {
      let duplicatedCount = 0;
      for (const id of ids) {
        const product = products?.find(p => p.id === id);
        if (!product) continue;

        // Create new product with copied data
        const newSlug = `${product.slug}-copie-${Date.now()}`;
        const { data: newProduct, error } = await supabase.from('products').insert({
          name: `${product.name} (copie)`,
          slug: newSlug,
          brand_id: product.brand_id,
          category_id: product.category_id,
          short_description: product.short_description,
          description: product.description,
          incontinence_level: product.incontinence_level,
          mobility: product.mobility,
          usage_time: product.usage_time,
          mobility_levels: product.mobility_levels,
          usage_times: product.usage_times,
          gender: product.gender,
          recommended_price: product.recommended_price,
          price: product.price,
          subscription_price: product.subscription_price,
          subscription_discount_percent: product.subscription_discount_percent,
          purchase_price: product.purchase_price,
          units_per_product: product.units_per_product,
          min_order_quantity: product.min_order_quantity,
          stock_quantity: product.stock_quantity,
          stock_status: product.stock_status,
          sku: product.sku ? `${product.sku}-COPY` : null,
          ean_code: '',
          cnk_code: '',
          manufacturer_url: product.manufacturer_url,
          is_active: false,
          is_featured: false,
          is_coming_soon: product.is_coming_soon,
          show_size_guide: product.show_size_guide,
        }).select().single();

        if (error) throw error;

        // Copy images
        if (product.images && product.images.length > 0 && newProduct) {
          const imagesToInsert = product.images.map((img: any, index: number) => ({
            product_id: newProduct.id,
            image_url: img.image_url,
            alt_text: img.alt_text,
            is_primary: img.is_primary,
            sort_order: index,
          }));
          await supabase.from('product_images').insert(imagesToInsert);
        }

        // Copy sizes
        if (newProduct) {
          const { data: sizes } = await supabase
            .from('product_sizes')
            .select('*')
            .eq('product_id', id);
          
          if (sizes && sizes.length > 0) {
            const sizesToInsert = sizes.map((size: any) => ({
              product_id: newProduct.id,
              size: size.size,
              price_adjustment: size.price_adjustment,
              stock_quantity: size.stock_quantity,
              is_active: size.is_active,
              sale_price: size.sale_price,
              purchase_price: size.purchase_price,
              public_price: size.public_price,
              units_per_size: size.units_per_size,
              sku: size.sku ? `${size.sku}-COPY` : null,
              ean_code: '',
              cnk_code: '',
            }));
            await supabase.from('product_sizes').insert(sizesToInsert);
          }
        }
        
        duplicatedCount++;
      }
      return duplicatedCount;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setSelectedProducts(new Set());
      toast.success(`${count} produit(s) dupliqué(s)`);
    },
    onError: () => {
      toast.error('Erreur lors de la duplication');
    },
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      brand_id: product.brand_id || '',
      category_id: product.category_id || '',
      short_description: product.short_description || '',
      description: product.description || '',
      incontinence_level: product.incontinence_level || '',
      mobility: product.mobility || '',
      usage_time: product.usage_time || '',
      mobility_levels: product.mobility_levels || '',
      usage_times: product.usage_times || '',
      gender: product.gender || '',
      recommended_price: product.recommended_price || 0,
      price: product.price,
      subscription_price: product.subscription_price || 0,
      subscription_discount_percent: product.subscription_discount_percent || 10,
      purchase_price: product.purchase_price || 0,
      units_per_product: product.units_per_product || 1,
      min_order_quantity: product.min_order_quantity || 1,
      stock_quantity: product.stock_quantity || 0,
      stock_status: product.stock_status || 'in_stock',
      sku: product.sku || '',
      ean_code: product.ean_code || '',
      cnk_code: product.cnk_code || '',
      manufacturer_url: product.manufacturer_url || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_coming_soon: product.is_coming_soon || false,
      show_size_guide: product.show_size_guide !== false,
      is_subscription_eligible: product.is_subscription_eligible !== false,
      is_addon: product.is_addon || false,
      addon_category: product.addon_category || '',
    });
    setProductImages(
      product.images?.map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        is_primary: img.is_primary,
        sort_order: img.sort_order,
      })) || []
    );
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: formData });
    } else {
      createProduct.mutate(formData);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        setProductImages(prev => [
          ...prev,
          {
            image_url: publicUrl,
            alt_text: '',
            is_primary: prev.length === 0,
            sort_order: prev.length,
          },
        ]);
      }
      toast.success('Image(s) téléchargée(s)');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    setProductImages(prev => [
      ...prev,
      {
        image_url: imageUrl.trim(),
        alt_text: '',
        is_primary: prev.length === 0,
        sort_order: prev.length,
      },
    ]);
    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setProductImages(prev => 
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  // Calculate savings
  const savingsPercent = formData.recommended_price > 0 && formData.price > 0
    ? Math.round(((formData.recommended_price - formData.price) / formData.recommended_price) * 100)
    : 0;
  const savingsValue = formData.recommended_price > 0 && formData.price > 0
    ? formData.recommended_price - formData.price
    : 0;

  // Calculate unit price
  const unitPrice = formData.units_per_product > 0 && formData.price > 0
    ? formData.price / formData.units_per_product
    : 0;

  // Calculate margin (backend only display)
  const marginValue = formData.price > 0 && formData.purchase_price > 0
    ? formData.price - formData.purchase_price
    : 0;
  const marginPercent = formData.purchase_price > 0 && formData.price > 0
    ? Math.round(((formData.price - formData.purchase_price) / formData.price) * 100)
    : 0;

  // Calculate margin for subscription price
  const subscriptionMarginValue = formData.subscription_price > 0 && formData.purchase_price > 0
    ? formData.subscription_price - formData.purchase_price
    : 0;
  const subscriptionMarginPercent = formData.purchase_price > 0 && formData.subscription_price > 0
    ? Math.round(((formData.subscription_price - formData.purchase_price) / formData.subscription_price) * 100)
    : 0;

  // Auto-calculate subscription price based on discount
  const handlePriceChange = (newPrice: number) => {
    const discountPercent = formData.subscription_discount_percent || 10;
    const autoSubscriptionPrice = newPrice * (1 - discountPercent / 100);
    setFormData({ 
      ...formData, 
      price: newPrice,
      subscription_price: Math.round(autoSubscriptionPrice * 100) / 100
    });
  };

  const handleDiscountChange = (newDiscount: number) => {
    const autoSubscriptionPrice = formData.price * (1 - newDiscount / 100);
    setFormData({ 
      ...formData, 
      subscription_discount_percent: newDiscount,
      subscription_price: Math.round(autoSubscriptionPrice * 100) / 100
    });
  };

  const handleSubscriptionPriceChange = (newSubPrice: number) => {
    // Recalculate discount based on new subscription price
    const autoDiscount = formData.price > 0 
      ? Math.round(((formData.price - newSubPrice) / formData.price) * 100)
      : 10;
    setFormData({ 
      ...formData, 
      subscription_price: newSubPrice,
      subscription_discount_percent: autoDiscount
    });
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Selection handlers
  const handleSelectAll = () => {
    if (!filteredProducts) return;
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedProducts(newSelection);
  };

  const handleBulkDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleBulkDuplicate = () => {
    duplicateProducts.mutate(Array.from(selectedProducts));
  };

  const handleBulkEdit = () => {
    if (selectedProducts.size === 1) {
      const productId = Array.from(selectedProducts)[0];
      const product = products?.find(p => p.id === productId);
      if (product) {
        handleEdit(product);
        setSelectedProducts(new Set());
      }
    } else {
      toast.info('Sélectionnez un seul produit pour l\'éditer');
    }
  };

  // Download empty CSV template for mass import
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // ── Feuille "Produits" ──
    const headers = [
      'name', 'slug', 'sku', 'brand', 'category', 'short_description', 'description',
      'incontinence_level', 'mobility', 'usage_time', 'mobility_levels', 'usage_times', 'gender',
      'recommended_price', 'price', 'subscription_price', 'subscription_discount_percent',
      'purchase_price', 'units_per_product', 'min_order_quantity', 'stock_quantity', 'stock_status',
      'ean_code', 'cnk_code', 'manufacturer_url',
      'is_active', 'is_featured', 'is_coming_soon', 'show_size_guide',
      'is_subscription_eligible', 'is_addon', 'addon_category',
      'supplier',
    ];

    const exampleRow = [
      'Protection Plus Taille M', 'protection-plus-taille-m', 'PROT-PLUS-001',
      'TENA', 'Protections', 'Protection absorbante confort', 'Description longue du produit...',
      'moderate', 'mobile', 'day', 'mobile,reduite', 'day,night', 'unisex',
      15.90, 12.90, 11.61, 10,
      6.50, 28, 1, 100, 'in_stock',
      '5412345678901', 'CNK1234567', 'https://fabricant.com/produit',
      'true', 'false', 'false', 'true',
      'true', 'false', '',
      'Nom du fournisseur',
    ];

    const wsProducts = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    // Set column widths
    wsProducts['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 16) }));
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Produits');

    // ── Feuille "Variantes (tailles)" ──
    const sizeHeaders = [
      'product_slug', 'size', 'sku', 'ean_code', 'cnk_code',
      'units_per_size', 'public_price', 'sale_price', 'purchase_price',
      'stock_quantity', 'is_active',
    ];

    const sizeExamples = [
      ['protection-plus-taille-m', 'S', 'PROT-PLUS-001-S', '5412345678902', 'CNK1234568', 28, 15.90, 12.90, 6.50, 50, 'true'],
      ['protection-plus-taille-m', 'M', 'PROT-PLUS-001-M', '5412345678903', 'CNK1234569', 28, 15.90, 12.90, 6.50, 100, 'true'],
      ['protection-plus-taille-m', 'L', 'PROT-PLUS-001-L', '5412345678904', 'CNK1234570', 28, 15.90, 12.90, 6.50, 75, 'true'],
    ];

    const wsSizes = XLSX.utils.aoa_to_sheet([sizeHeaders, ...sizeExamples]);
    wsSizes['!cols'] = sizeHeaders.map(h => ({ wch: Math.max(h.length + 2, 16) }));
    XLSX.utils.book_append_sheet(wb, wsSizes, 'Variantes');

    // ── Feuille "Instructions" ──
    const instructions = [
      ['INSTRUCTIONS IMPORT PRODUITS SERENCARE'],
      [],
      ['Colonnes obligatoires (feuille Produits):', 'name, slug, price'],
      ['Colonnes optionnelles:', 'toutes les autres'],
      [],
      ['VALEURS POSSIBLES'],
      ['incontinence_level', 'light, moderate, heavy, very_heavy'],
      ['mobility', 'mobile, reduced, bedridden'],
      ['usage_time', 'day, night, day_night'],
      ['mobility_levels', 'mobile, reduite, alitee (séparés par virgule)'],
      ['usage_times', 'day, night (séparés par virgule)'],
      ['gender', 'male, female, unisex'],
      ['stock_status', 'in_stock, limited, out_of_stock, coming_soon'],
      ['addon_category', 'pharma, hygiene, soins, accessoires, confort'],
      ['supplier', 'Nom exact du fournisseur tel que configuré dans l\'admin'],
      ['Booléens', 'true ou false'],
      [],
      ['brand / category / supplier', 'Nom exact tel que configuré dans l\'admin'],
      [],
      ['FEUILLE VARIANTES'],
      ['product_slug', 'Doit correspondre au slug du produit dans la feuille Produits'],
      ['Ajoutez une ligne par taille/variante'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 35 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    XLSX.writeFile(wb, `template-import-produits-serencare.xlsx`);
    toast.success('Template Excel téléchargé');
  };

  // Export products to XLSX
  const handleExportCSV = async () => {
    if (!products || products.length === 0) {
      toast.error('Aucun produit à exporter');
      return;
    }

    const wb = XLSX.utils.book_new();

    // ── Feuille Produits ──
    const prodHeaders = [
      'name', 'slug', 'sku', 'brand', 'category', 'short_description', 'description',
      'incontinence_level', 'mobility', 'usage_time', 'mobility_levels', 'usage_times', 'gender',
      'recommended_price', 'price', 'subscription_price', 'subscription_discount_percent',
      'purchase_price', 'units_per_product', 'min_order_quantity', 'stock_quantity', 'stock_status',
      'ean_code', 'cnk_code', 'manufacturer_url',
      'is_active', 'is_featured', 'is_coming_soon', 'show_size_guide',
      'is_subscription_eligible', 'is_addon', 'addon_category',
      'supplier',
    ];

    // Fetch preferred suppliers for export
    const { data: productSuppliers } = await supabase
      .from('product_suppliers')
      .select('product_id, supplier:suppliers(name)')
      .eq('is_preferred', true);
    const supplierMap: Record<string, string> = {};
    productSuppliers?.forEach((ps: any) => {
      if (ps.supplier?.name) supplierMap[ps.product_id] = ps.supplier.name;
    });

    const prodRows = products.map((p: any) => [
      p.name || '', p.slug || '', p.sku || '',
      p.brand?.name || '', p.category?.name || '',
      p.short_description || '', p.description || '',
      p.incontinence_level || '', p.mobility || '', p.usage_time || '',
      p.mobility_levels || '', p.usage_times || '', p.gender || '',
      p.recommended_price ?? '', p.price ?? 0, p.subscription_price ?? '', p.subscription_discount_percent ?? 10,
      p.purchase_price ?? '', p.units_per_product ?? 1, p.min_order_quantity ?? 1,
      p.stock_quantity ?? 0, p.stock_status || 'in_stock',
      p.ean_code || '', p.cnk_code || '', p.manufacturer_url || '',
      p.is_active ? 'true' : 'false', p.is_featured ? 'true' : 'false',
      p.is_coming_soon ? 'true' : 'false', p.show_size_guide ? 'true' : 'false',
      p.is_subscription_eligible !== false ? 'true' : 'false',
      p.is_addon ? 'true' : 'false', p.addon_category || '',
      supplierMap[p.id] || '',
    ]);

    const wsProducts = XLSX.utils.aoa_to_sheet([prodHeaders, ...prodRows]);
    wsProducts['!cols'] = prodHeaders.map(h => ({ wch: Math.max(h.length + 2, 14) }));
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Produits');

    // ── Feuille Variantes ──
    const sizeHeaders = [
      'product_slug', 'size', 'sku', 'ean_code', 'cnk_code',
      'units_per_size', 'public_price', 'sale_price', 'purchase_price',
      'stock_quantity', 'is_active',
    ];

    const sizeRows: any[][] = [];
    for (const p of products as any[]) {
      if (p.product_sizes && p.product_sizes.length > 0) {
        for (const s of p.product_sizes) {
          sizeRows.push([
            p.slug, s.size, s.sku || '', s.ean_code || '', s.cnk_code || '',
            s.units_per_size ?? 1, s.public_price ?? '', s.sale_price ?? '',
            s.purchase_price ?? '', s.stock_quantity ?? 0,
            s.is_active !== false ? 'true' : 'false',
          ]);
        }
      }
    }

    const wsSizes = XLSX.utils.aoa_to_sheet([sizeHeaders, ...sizeRows]);
    wsSizes['!cols'] = sizeHeaders.map(h => ({ wch: Math.max(h.length + 2, 14) }));
    XLSX.utils.book_append_sheet(wb, wsSizes, 'Variantes');

    XLSX.writeFile(wb, `produits-serencare-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`${products.length} produits exportés (XLSX)`);
  };

  // Import products from CSV or XLSX
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      let rows: string[][] = [];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        // Read "Produits" sheet or first sheet
        const sheetName = workbook.SheetNames.includes('Produits') ? 'Produits' : workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsed: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        rows = parsed.filter(r => r.some(c => c != null && String(c).trim() !== ''));
      } else {
        const text = await file.text();
        rows = text.split('\n').filter(l => l.trim()).map(l => l.split(';').map(v => v.trim()));
      }

      if (rows.length < 2) {
        toast.error('Fichier vide ou invalide');
        return;
      }

      const headers = rows[0].map(h => String(h).trim().toLowerCase());
      const idx = (col: string) => headers.indexOf(col);

      if (idx('name') === -1 || idx('slug') === -1) {
        toast.error('Le fichier doit contenir les colonnes "name" et "slug"');
        return;
      }

      const parseBool = (v: any) => v != null && String(v).toLowerCase() === 'true';
      const parseNum = (v: any) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
      const parseInt2 = (v: any) => { const n = parseInt(v); return isNaN(n) ? null : n; };
      const str = (v: any) => (v != null && String(v).trim() !== '') ? String(v).trim() : null;

      let imported = 0, updated = 0, errors = 0;

      for (let i = 1; i < rows.length; i++) {
        const v = rows[i];
        const val = (col: string) => idx(col) >= 0 ? v[idx(col)] : undefined;
        if (!val('name') || !val('slug')) continue;

        const productData: any = {
          name: str(val('name')),
          slug: str(val('slug')),
          sku: str(val('sku')),
          short_description: str(val('short_description')),
          description: str(val('description')),
          incontinence_level: str(val('incontinence_level')),
          mobility: str(val('mobility')),
          usage_time: str(val('usage_time')),
          mobility_levels: str(val('mobility_levels')) || '',
          usage_times: str(val('usage_times')) || '',
          gender: str(val('gender')) || '',
          recommended_price: parseNum(val('recommended_price')),
          price: parseNum(val('price')) ?? 0,
          subscription_price: parseNum(val('subscription_price')),
          subscription_discount_percent: parseInt2(val('subscription_discount_percent')) ?? 10,
          purchase_price: parseNum(val('purchase_price')),
          units_per_product: parseInt2(val('units_per_product')) ?? 1,
          min_order_quantity: parseInt2(val('min_order_quantity')) ?? 1,
          stock_quantity: parseInt2(val('stock_quantity')) ?? 0,
          stock_status: str(val('stock_status')) || 'in_stock',
          ean_code: str(val('ean_code')) || '',
          cnk_code: str(val('cnk_code')) || '',
          manufacturer_url: str(val('manufacturer_url')),
          is_active: idx('is_active') >= 0 ? parseBool(val('is_active')) : true,
          is_featured: parseBool(val('is_featured')),
          is_coming_soon: parseBool(val('is_coming_soon')),
          show_size_guide: idx('show_size_guide') >= 0 ? parseBool(val('show_size_guide')) : true,
          is_subscription_eligible: idx('is_subscription_eligible') >= 0 ? parseBool(val('is_subscription_eligible')) : true,
          is_addon: parseBool(val('is_addon')),
          addon_category: str(val('addon_category')),
        };

        // Match brand by name
        const brandName = str(val('brand'));
        if (brandName && brands) {
          const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
          if (brand) productData.brand_id = brand.id;
        }

        // Match category by name
        const categoryName = str(val('category'));
        if (categoryName && categories) {
          const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
          if (category) productData.category_id = category.id;
        }

        // Match supplier by name
        const supplierName = str(val('supplier'));

        try {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('slug', productData.slug)
            .single();

          let productId: string;
          if (existing) {
            await supabase.from('products').update(productData).eq('id', existing.id);
            productId = existing.id;
            updated++;
          } else {
            const { data: newProd } = await supabase.from('products').insert(productData).select('id').single();
            productId = newProd?.id;
            imported++;
          }

          // Link supplier if specified
          if (supplierName && suppliers && productId) {
            const supplier = suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
            if (supplier) {
              const { data: existingLink } = await supabase
                .from('product_suppliers')
                .select('id')
                .eq('product_id', productId)
                .eq('supplier_id', supplier.id)
                .single();
              if (!existingLink) {
                await supabase.from('product_suppliers').insert({
                  product_id: productId,
                  supplier_id: supplier.id,
                  is_preferred: true,
                  purchase_price: productData.purchase_price,
                });
              }
            }
          }
        } catch {
          errors++;
        }
      }

      // ── Import sizes from "Variantes" sheet if XLSX ──
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        if (workbook.SheetNames.includes('Variantes')) {
          const sizeSheet = workbook.Sheets['Variantes'];
          const sizeRows: string[][] = XLSX.utils.sheet_to_json(sizeSheet, { header: 1 });
          const sHeaders = sizeRows[0]?.map(h => String(h).trim().toLowerCase()) || [];
          const si = (col: string) => sHeaders.indexOf(col);

          if (si('product_slug') >= 0 && si('size') >= 0) {
            for (let i = 1; i < sizeRows.length; i++) {
              const sv = sizeRows[i];
              const slug = str(sv[si('product_slug')]);
              const size = str(sv[si('size')]);
              if (!slug || !size) continue;

              // Get product id by slug
              const { data: prod } = await supabase.from('products').select('id').eq('slug', slug).single();
              if (!prod) continue;

              const sizeData: any = {
                product_id: prod.id,
                size,
                sku: str(sv[si('sku')]),
                ean_code: str(sv[si('ean_code')]),
                cnk_code: str(sv[si('cnk_code')]),
                units_per_size: parseInt2(sv[si('units_per_size')]) ?? 1,
                public_price: parseNum(sv[si('public_price')]),
                sale_price: parseNum(sv[si('sale_price')]),
                purchase_price: parseNum(sv[si('purchase_price')]),
                stock_quantity: parseInt2(sv[si('stock_quantity')]) ?? 0,
                is_active: si('is_active') >= 0 ? parseBool(sv[si('is_active')]) : true,
              };

              // Upsert by product_id + size
              const { data: existingSize } = await supabase
                .from('product_sizes')
                .select('id')
                .eq('product_id', prod.id)
                .eq('size', size)
                .single();

              if (existingSize) {
                await supabase.from('product_sizes').update(sizeData).eq('id', existingSize.id);
              } else {
                await supabase.from('product_sizes').insert(sizeData);
              }
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(`Import terminé: ${imported} créés, ${updated} mis à jour${errors > 0 ? `, ${errors} erreurs` : ''}`);
    } catch (error) {
      toast.error('Erreur lors de l\'import du fichier');
    } finally {
      setIsImporting(false);
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const incontinenceLevels = [
    { value: 'light', label: 'Légère' },
    { value: 'moderate', label: 'Modérée' },
    { value: 'heavy', label: 'Forte' },
    { value: 'very_heavy', label: 'Très forte' },
  ];

  const mobilityTypes = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'reduced', label: 'Réduite' },
    { value: 'bedridden', label: 'Alité' },
  ];

  const usageTimes = [
    { value: 'day', label: 'Jour' },
    { value: 'night', label: 'Nuit' },
    { value: 'day_night', label: 'Jour & Nuit' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Produits</h1>
          <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Import CSV */}
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleImportCSV}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => importInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileUp className="h-4 w-4 mr-2" />
            )}
            Importer CSV
          </Button>
          
          {/* Template CSV */}
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Template Excel
          </Button>

          {/* Export CSV */}
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProduct(null);
              setFormData(initialFormData);
              setProductImages([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        name: e.target.value,
                        slug: editingProduct ? formData.slug : generateSlug(e.target.value)
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marque</Label>
                  <Select value={formData.brand_id} onValueChange={(v) => setFormData({ ...formData, brand_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {brands?.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description courte</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description complète</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Product Images */}
              <div className="space-y-4">
                <Label>Images du produit</Label>
                
                {/* Current images */}
                {productImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {productImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.image_url}
                          alt={img.alt_text}
                          className={`w-full aspect-square object-cover rounded-lg border-2 ${
                            img.is_primary ? 'border-primary' : 'border-border'
                          }`}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetPrimaryImage(index)}
                            disabled={img.is_primary}
                          >
                            {img.is_primary ? 'Principal' : 'Définir'}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload options */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Télécharger
                    </Button>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="URL de l'image..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={handleAddImageUrl}>
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product attributes */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Niveau d'incontinence</Label>
                  <Select value={formData.incontinence_level} onValueChange={(v) => setFormData({ ...formData, incontinence_level: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {incontinenceLevels.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mobilité</Label>
                  <Select value={formData.mobility} onValueChange={(v) => setFormData({ ...formData, mobility: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {mobilityTypes.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moment d'utilisation</Label>
                  <Select value={formData.usage_time} onValueChange={(v) => setFormData({ ...formData, usage_time: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {usageTimes.map(u => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Multi-tag filters section */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Filtres multi-tags (pour le filtrage front)
                </h4>
                
                {/* Mobility Levels */}
                <div className="space-y-2">
                  <Label className="text-sm">Niveaux de mobilité</Label>
                  <div className="flex flex-wrap gap-4">
                    {mobilityLevelOptions.map((option) => {
                      const isChecked = formData.mobility_levels.split('|').includes(option.value);
                      return (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentTags = formData.mobility_levels.split('|').filter(t => t);
                              const newTags = checked
                                ? [...currentTags, option.value]
                                : currentTags.filter(t => t !== option.value);
                              setFormData({ ...formData, mobility_levels: newTags.join('|') });
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Usage Times */}
                <div className="space-y-2">
                  <Label className="text-sm">Moments d'utilisation</Label>
                  <div className="flex flex-wrap gap-4">
                    {usageTimesOptions.map((option) => {
                      const isChecked = formData.usage_times.split('|').includes(option.value);
                      return (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentTags = formData.usage_times.split('|').filter(t => t);
                              const newTags = checked
                                ? [...currentTags, option.value]
                                : currentTags.filter(t => t !== option.value);
                              setFormData({ ...formData, usage_times: newTags.join('|') });
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-sm">Genre</Label>
                  <div className="flex flex-wrap gap-4">
                    {genderOptions.map((option) => {
                      const isChecked = formData.gender.split('|').includes(option.value);
                      return (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentTags = formData.gender.split('|').filter(t => t);
                              const newTags = checked
                                ? [...currentTags, option.value]
                                : currentTags.filter(t => t !== option.value);
                              setFormData({ ...formData, gender: newTags.join('|') });
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Ces tags permettent un filtrage multi-valeurs côté boutique. Si vides, les valeurs sont calculées automatiquement.
                </p>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold">Tarification</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recommended_price">Prix public recommandé (€)</Label>
                    <Input
                      id="recommended_price"
                      type="number"
                      step="0.01"
                      value={formData.recommended_price || ''}
                      onChange={(e) => setFormData({ ...formData, recommended_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Prix SerenCare (€) {!formData.is_coming_soon && '*'}
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                      required={!formData.is_coming_soon}
                    />
                  </div>
                </div>

                {/* Savings display */}
                {savingsPercent > 0 && (
                  <div className="flex items-center gap-4 p-3 bg-accent/20 rounded-lg">
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      -{savingsPercent}%
                    </Badge>
                    <span className="text-sm">
                      Économie de <strong>{savingsValue.toFixed(2)} €</strong> par rapport au prix public
                    </span>
                  </div>
                )}

                {/* Subscription pricing */}
                <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30 space-y-4">
                  <h5 className="font-medium text-sm flex items-center gap-2">
                    <span className="text-secondary">💳</span> Prix abonnement
                  </h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subscription_discount_percent">Réduction (%)</Label>
                      <Input
                        id="subscription_discount_percent"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.subscription_discount_percent || ''}
                        onChange={(e) => handleDiscountChange(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription_price">Prix abonnement (€)</Label>
                      <Input
                        id="subscription_price"
                        type="number"
                        step="0.01"
                        value={formData.subscription_price || ''}
                        onChange={(e) => handleSubscriptionPriceChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Économie abonnement</Label>
                      <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm">
                        {formData.price > 0 && formData.subscription_price > 0 ? (
                          <span className="text-secondary font-medium">
                            -{(formData.price - formData.subscription_price).toFixed(2)} € / commande
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Units and unit price */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="units_per_product">Unités par produit</Label>
                    <Input
                      id="units_per_product"
                      type="number"
                      min="1"
                      value={formData.units_per_product || 1}
                      onChange={(e) => setFormData({ ...formData, units_per_product: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix unitaire</Label>
                    <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm">
                      {unitPrice > 0 ? `${unitPrice.toFixed(4)} €/unité` : '-'}
                    </div>
                  </div>
                </div>

                {/* Purchase price (admin only) */}
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-muted-foreground mb-3">🔒 Données internes (non visibles en boutique)</p>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchase_price">Prix d'achat (€)</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        step="0.01"
                        value={formData.purchase_price || ''}
                        onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Marge SerenCare</Label>
                      <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm gap-2">
                        {marginValue > 0 ? (
                          <>
                            <span className="text-green-600 font-medium">{marginValue.toFixed(2)} €</span>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {marginPercent}%
                            </Badge>
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Marge Abonnement</Label>
                      <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm gap-2">
                        {subscriptionMarginValue > 0 ? (
                          <>
                            <span className="text-secondary font-medium">{subscriptionMarginValue.toFixed(2)} €</span>
                            <Badge variant="outline" className="text-secondary border-secondary">
                              {subscriptionMarginPercent}%
                            </Badge>
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock & SKU */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Quantité min.</Label>
                  <Input
                    type="number"
                    value={formData.min_order_quantity}
                    onChange={(e) => setFormData({ ...formData, min_order_quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statut stock</Label>
                  <Select value={formData.stock_status} onValueChange={(v) => setFormData({ ...formData, stock_status: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {stockStatuses.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              {/* Product Codes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code EAN</Label>
                  <Input
                    value={formData.ean_code}
                    onChange={(e) => setFormData({ ...formData, ean_code: e.target.value })}
                    placeholder="Ex: 4015400..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code CNK</Label>
                  <Input
                    value={formData.cnk_code}
                    onChange={(e) => setFormData({ ...formData, cnk_code: e.target.value })}
                    placeholder="Ex: 123456..."
                  />
                </div>
              </div>

              {/* Manufacturer URL */}
              <div className="space-y-2">
                <Label>URL fiche produit fabricant</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.manufacturer_url}
                    onChange={(e) => setFormData({ ...formData, manufacturer_url: e.target.value })}
                    placeholder="https://www.tena.be/produit/..."
                    type="url"
                  />
                  {formData.manufacturer_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(formData.manufacturer_url, '_blank')}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Product Sizes Manager */}
              <ProductSizesManager 
                productId={editingProduct?.id || null}
                productSku={formData.sku}
              />

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                  <Label htmlFor="is_active">Actif</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                  />
                  <Label htmlFor="is_featured">Mis en avant</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_coming_soon"
                    checked={formData.is_coming_soon}
                    onCheckedChange={(v) => setFormData({ ...formData, is_coming_soon: v })}
                  />
                  <Label htmlFor="is_coming_soon" className="text-amber-600">Prochainement</Label>
                  <span className="text-xs text-muted-foreground">(visible sans prix, non achetable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show_size_guide"
                    checked={formData.show_size_guide}
                    onCheckedChange={(v) => setFormData({ ...formData, show_size_guide: v })}
                  />
                  <Label htmlFor="show_size_guide">Guide des tailles</Label>
                </div>
              </div>

              {/* Subscription & Addon Section */}
              <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-800">Abonnement & Add-ons</h4>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_subscription_eligible"
                      checked={formData.is_subscription_eligible}
                      onCheckedChange={(v) => setFormData({ ...formData, is_subscription_eligible: v })}
                    />
                    <Label htmlFor="is_subscription_eligible">Éligible abonnement</Label>
                    <span className="text-xs text-muted-foreground">(peut être ajouté à un abonnement mensuel)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_addon"
                      checked={formData.is_addon}
                      onCheckedChange={(v) => setFormData({ ...formData, is_addon: v })}
                    />
                    <Label htmlFor="is_addon" className="text-blue-700">Produit Add-on</Label>
                    <span className="text-xs text-muted-foreground">(proposé en complément au checkout)</span>
                  </div>
                </div>
                {formData.is_addon && (
                  <div className="space-y-2">
                    <Label>Catégorie Add-on</Label>
                    <Select 
                      value={formData.addon_category} 
                      onValueChange={(v) => setFormData({ ...formData, addon_category: v })}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {addonCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                  {(createProduct.isPending || updateProduct.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingProduct ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.size > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {selectedProducts.size} produit{selectedProducts.size > 1 ? 's' : ''} sélectionné{selectedProducts.size > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedProducts.size === 1 && (
                  <Button variant="outline" size="sm" onClick={handleBulkEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Éditer
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkDuplicate}
                  disabled={duplicateProducts.isPending}
                >
                  {duplicateProducts.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Dupliquer
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProducts(new Set())}>
                  <X className="h-4 w-4 mr-2" />
                  Désélectionner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedProducts.size} produit{selectedProducts.size > 1 ? 's' : ''} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteProducts.mutate(Array.from(selectedProducts))}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteProducts.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun produit trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredProducts && selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Marge</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => {
                  const productMargin = product.price && product.purchase_price 
                    ? Math.round(((product.price - product.purchase_price) / product.price) * 100)
                    : null;
                  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                  
                  return (
                    <TableRow key={product.id} className={selectedProducts.has(product.id) ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => handleSelectProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {primaryImage ? (
                          <img 
                            src={primaryImage.image_url} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{product.price.toFixed(2)} €</div>
                          {product.recommended_price && product.recommended_price > product.price && (
                            <div className="text-xs text-muted-foreground line-through">
                              {product.recommended_price.toFixed(2)} €
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {productMargin !== null && productMargin > 0 ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {productMargin}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        {(() => {
                          const status = product.stock_status || 'in_stock';
                          const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
                            in_stock: { label: 'En stock', variant: 'default' },
                            limited: { label: 'Limité', variant: 'outline' },
                            out_of_stock: { label: 'Rupture', variant: 'destructive' },
                            coming_soon: { label: 'Bientôt', variant: 'secondary' },
                          };
                          const config = statusConfig[status] || statusConfig.in_stock;
                          return <Badge variant={config.variant}>{config.label}</Badge>;
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.is_active !== false}
                            onCheckedChange={async (checked) => {
                              const { error } = await supabase
                                .from('products')
                                .update({ is_active: checked })
                                .eq('id', product.id);
                              if (error) {
                                toast.error('Erreur lors de la mise à jour');
                              } else {
                                toast.success(checked ? 'Produit activé' : 'Produit désactivé');
                                queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                              }
                            }}
                          />
                          <span className={`text-xs ${product.is_active !== false ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {product.is_active !== false ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} title="Modifier">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Dupliquer"
                            disabled={duplicateProducts.isPending}
                            onClick={() => {
                              duplicateProducts.mutate([product.id]);
                            }}
                          >
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Supprimer"
                            onClick={() => {
                              if (confirm('Supprimer ce produit ?')) {
                                deleteProduct.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
