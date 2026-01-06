import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeToAdd from './SwipeToAdd';
import { cn } from '@/lib/utils';

interface MobileCartFooterProps {
  isVisible: boolean;
  onAddToCart: () => void;
  price: number;
  quantity: number;
  isDisabled?: boolean;
  isComingSoon?: boolean;
  productName?: string;
}

const MobileCartFooter: React.FC<MobileCartFooterProps> = ({
  isVisible,
  onAddToCart,
  price,
  quantity,
  isDisabled = false,
  isComingSoon = false,
  productName,
}) => {
  const totalPrice = price * quantity;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-background/95 backdrop-blur-lg border-t border-border",
            "px-4 pb-safe pt-3",
            "lg:hidden" // Only show on mobile
          )}
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
        >
          {/* Product summary */}
          {productName && (
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground truncate max-w-[60%]">
                {productName} {quantity > 1 && `× ${quantity}`}
              </span>
              <span className="font-semibold text-foreground">
                {totalPrice.toFixed(2)} €
              </span>
            </div>
          )}

          {/* Swipe to add */}
          <SwipeToAdd
            onSwipeComplete={onAddToCart}
            price={totalPrice}
            isDisabled={isDisabled}
            isComingSoon={isComingSoon}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileCartFooter;
