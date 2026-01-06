import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ShoppingCart, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeToAddProps {
  onSwipeComplete: () => void;
  price: number;
  isDisabled?: boolean;
  isComingSoon?: boolean;
}

const SwipeToAdd: React.FC<SwipeToAddProps> = ({ 
  onSwipeComplete, 
  price, 
  isDisabled = false,
  isComingSoon = false 
}) => {
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // Calculate max swipe distance (container width - button width - padding)
  const getMaxSwipe = () => {
    if (!containerRef.current) return 200;
    return containerRef.current.offsetWidth - 72 - 8; // 72px button, 8px padding
  };

  const progress = useTransform(x, [0, getMaxSwipe()], [0, 1]);
  const checkOpacity = useTransform(x, [getMaxSwipe() * 0.8, getMaxSwipe()], [0, 1]);
  const cartOpacity = useTransform(x, [0, getMaxSwipe() * 0.5], [1, 0]);
  const bgColor = useTransform(
    x, 
    [0, getMaxSwipe() * 0.5, getMaxSwipe()], 
    ['hsl(var(--primary))', 'hsl(var(--primary))', 'hsl(var(--secondary))']
  );

  // Trigger haptic feedback (vibration)
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const maxSwipe = getMaxSwipe();
    if (info.offset.x >= maxSwipe * 0.8) {
      // Complete the swipe - trigger vibration
      triggerHaptic();
      x.set(maxSwipe);
      setIsComplete(true);
      setTimeout(() => {
        onSwipeComplete();
        // Reset after a delay
        setTimeout(() => {
          x.set(0);
          setIsComplete(false);
        }, 500);
      }, 200);
    } else {
      // Spring back
      x.set(0);
    }
  };

  if (isComingSoon) {
    return (
      <div className="w-full h-14 bg-muted rounded-full flex items-center justify-center">
        <span className="text-muted-foreground font-medium">Bientôt disponible</span>
      </div>
    );
  }

  if (isDisabled) {
    return (
      <div className="w-full h-14 bg-muted rounded-full flex items-center justify-center">
        <span className="text-muted-foreground font-medium">Sélectionnez une taille</span>
      </div>
    );
  }

  return (
    <motion.div 
      ref={containerRef}
      className="relative w-full h-14 bg-muted rounded-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background progress */}
      <motion.div 
        className="absolute inset-0 bg-secondary/20 rounded-full origin-left"
        style={{ scaleX: progress }}
      />
      
      {/* Text hint */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.span 
          className="text-primary-foreground font-medium flex items-center gap-2"
          style={{ opacity: useTransform(x, [0, getMaxSwipe() * 0.3], [1, 0]) }}
        >
          <span className="hidden xs:inline">Glissez pour ajouter</span>
          <span className="xs:hidden">Glissez</span>
          <ChevronRight className="h-4 w-4 animate-pulse" />
          <span>{price.toFixed(2)} €</span>
        </motion.span>
        <motion.span 
          className="text-secondary-foreground font-medium absolute"
          style={{ opacity: checkOpacity }}
        >
          Ajouté au panier !
        </motion.span>
      </div>

      {/* Draggable button */}
      <motion.button
        className={cn(
          "absolute left-1 top-1 bottom-1 w-16 rounded-full",
          "bg-background shadow-lg flex items-center justify-center",
          "cursor-grab active:cursor-grabbing touch-none",
          isComplete && "pointer-events-none"
        )}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: getMaxSwipe() }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div style={{ opacity: cartOpacity }}>
          <ShoppingCart className="h-5 w-5 text-primary" />
        </motion.div>
        <motion.div className="absolute" style={{ opacity: checkOpacity }}>
          <Check className="h-5 w-5 text-secondary" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
};

export default SwipeToAdd;
