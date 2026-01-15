import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubscriptionCartItem {
  id: string;
  product_id: string;
  product_size: string | null;
  quantity: number;
  unit_price_cents: number;
  stripe_price_id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    subscription_price: number | null;
    product_images: { image_url: string; is_primary: boolean }[];
  };
}

interface SubscriptionCart {
  cart_id: string;
  items: SubscriptionCartItem[];
  total_cents: number;
  total_formatted: string;
  minimum_cents: number;
  is_valid: boolean;
}

export const useSubscriptionCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cart, isLoading, refetch } = useQuery({
    queryKey: ['subscription-cart', user?.id],
    queryFn: async (): Promise<SubscriptionCart | null> => {
      if (!user) return null;

      const { data, error } = await supabase.functions.invoke('subscription-cart', {
        method: 'GET',
      });

      if (error) {
        console.error('Error fetching subscription cart:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ 
      product_id, 
      product_size, 
      quantity 
    }: { 
      product_id: string; 
      product_size?: string; 
      quantity: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('subscription-cart', {
        method: 'POST',
        body: { product_id, product_size, quantity },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-cart'] });
      toast.success('Produit ajouté à l\'abonnement');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout');
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async ({ 
      product_id, 
      product_size 
    }: { 
      product_id: string; 
      product_size?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('subscription-cart', {
        method: 'DELETE',
        body: { product_id, product_size },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-cart'] });
      toast.success('Produit retiré de l\'abonnement');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('checkout-subscription', {
        body: {
          success_url: `${window.location.origin}/compte?subscription=success`,
          cancel_url: `${window.location.origin}/abonnement?cancelled=true`,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      if (error.message?.includes('abonnement actif')) {
        toast.error('Vous avez déjà un abonnement actif. Gérez-le depuis votre compte.');
      } else {
        toast.error(error.message || 'Erreur lors de la création du checkout');
      }
    },
  });

  const addItem = useCallback((product_id: string, quantity: number, product_size?: string) => {
    if (!user) {
      toast.error('Connectez-vous pour créer un abonnement');
      return;
    }
    addItemMutation.mutate({ product_id, product_size, quantity });
  }, [user, addItemMutation]);

  const removeItem = useCallback((product_id: string, product_size?: string) => {
    removeItemMutation.mutate({ product_id, product_size });
  }, [removeItemMutation]);

  const updateQuantity = useCallback((product_id: string, quantity: number, product_size?: string) => {
    if (quantity <= 0) {
      removeItem(product_id, product_size);
    } else {
      addItemMutation.mutate({ product_id, product_size, quantity });
    }
  }, [addItemMutation, removeItem]);

  const checkout = useCallback(() => {
    if (!cart?.is_valid) {
      toast.error(`Minimum 69€/mois TTC requis. Total actuel: ${cart?.total_formatted || '0€'}`);
      return;
    }
    checkoutMutation.mutate();
  }, [cart, checkoutMutation]);

  return {
    cart,
    items: cart?.items || [],
    totalCents: cart?.total_cents || 0,
    totalFormatted: cart?.total_formatted || '0,00€',
    isValid: cart?.is_valid || false,
    minimumCents: cart?.minimum_cents || 6900,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    checkout,
    isCheckingOut: checkoutMutation.isPending,
    refetch,
  };
};
