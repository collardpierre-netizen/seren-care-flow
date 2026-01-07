import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StoreSettings {
  shipping: {
    free_shipping_threshold: number;
    standard_shipping_fee: number;
  };
  subscription: {
    discount_percent: number;
    minimum_amount: number;
    default_frequency_days: number;
  };
  checkout: {
    minimum_order_amount: number;
  };
  delivery: {
    working_days_delay: number;
  };
}

const defaultSettings: StoreSettings = {
  shipping: {
    free_shipping_threshold: 49,
    standard_shipping_fee: 4.90,
  },
  subscription: {
    discount_percent: 10,
    minimum_amount: 69,
    default_frequency_days: 30,
  },
  checkout: {
    minimum_order_amount: 25,
  },
  delivery: {
    working_days_delay: 3,
  },
};

export const useStoreSettings = () => {
  return useQuery({
    queryKey: ['store-settings'],
    queryFn: async (): Promise<StoreSettings> => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*');
      
      if (error) throw error;
      
      const settingsMap: Record<string, any> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value;
      });
      
      return {
        shipping: {
          ...defaultSettings.shipping,
          ...settingsMap.shipping,
        },
        subscription: {
          ...defaultSettings.subscription,
          ...settingsMap.subscription,
        },
        checkout: {
          ...defaultSettings.checkout,
          ...settingsMap.checkout,
        },
        delivery: {
          ...defaultSettings.delivery,
          ...settingsMap.delivery,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export default useStoreSettings;
