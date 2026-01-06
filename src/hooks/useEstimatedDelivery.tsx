import { useMemo } from 'react';
import { useStoreSettings } from './useProducts';
import { format, addDays, isWeekend, nextMonday } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Adds working days (excludes weekends) to a date
 */
const addWorkingDays = (startDate: Date, workingDays: number): Date => {
  let result = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < workingDays) {
    result = addDays(result, 1);
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return result;
};

/**
 * Hook to calculate estimated delivery date based on working days
 */
export const useEstimatedDelivery = () => {
  const { data: settings, isLoading } = useStoreSettings();
  
  const estimatedDelivery = useMemo(() => {
    // Default: 3 working days
    const workingDaysDelay = settings?.delivery?.working_days_delay ?? 3;
    
    const today = new Date();
    const deliveryDate = addWorkingDays(today, workingDaysDelay);
    
    // Format the date in French
    const formattedDate = format(deliveryDate, "EEEE d MMMM", { locale: fr });
    
    // Capitalize first letter
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    return {
      date: deliveryDate,
      formattedDate: capitalizedDate,
      workingDays: workingDaysDelay
    };
  }, [settings]);
  
  return {
    ...estimatedDelivery,
    isLoading
  };
};
