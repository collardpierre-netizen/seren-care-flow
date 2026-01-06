import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
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
  const [maxSwipe, setMaxSwipe] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // Update max swipe on mount and resize
  useEffect(() => {
    const updateMaxSwipe = () => {
      if (containerRef.current) {
        setMaxSwipe(containerRef.current.offsetWidth - 72 - 8);
      }
    };
    updateMaxSwipe();
    window.addEventListener('resize', updateMaxSwipe);
    return () => window.removeEventListener('resize', updateMaxSwipe);
  }, []);

  const progress = useTransform(x, [0, maxSwipe], [0, 1]);
  const checkOpacity = useTransform(x, [maxSwipe * 0.8, maxSwipe], [0, 1]);
  const cartOpacity = useTransform(x, [0, maxSwipe * 0.5], [1, 0]);
  const textOpacity = useTransform(x, [0, maxSwipe * 0.3], [1, 0]);

  // Trigger haptic feedback (vibration)
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([50, 30, 50]); // Double pulse
      } catch (e) {
        // Vibration not supported
      }
    }
  }, []);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isComplete) return;
    
    const threshold = maxSwipe * 0.7;
    
    if (info.offset.x >= threshold) {
      // Complete the swipe
      triggerHaptic();
      animate(x, maxSwipe, { type: 'spring', stiffness: 400, damping: 30 });
      setIsComplete(true);
      
      setTimeout(() => {
        onSwipeComplete();
        // Reset after completion
        setTimeout(() => {
          animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
          setIsComplete(false);
        }, 600);
      }, 150);
    } else {
      // Spring back
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  }, [isComplete, maxSwipe, onSwipeComplete, triggerHaptic, x]);

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
    <div 
      ref={containerRef}
      className="relative w-full h-14 bg-primary rounded-full overflow-hidden select-none"
    >
      {/* Background progress fill */}
      <motion.div 
        className="absolute inset-0 bg-secondary rounded-full origin-left"
        style={{ scaleX: progress }}
      />
      
      {/* Text hint - centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.span 
          className="text-primary-foreground font-medium flex items-center gap-2 text-sm sm:text-base"
          style={{ opacity: textOpacity }}
        >
          <span>Glissez pour ajouter</span>
          <ChevronRight className="h-4 w-4 animate-pulse" />
          <span>{price.toFixed(2)} €</span>
        </motion.span>
        <motion.span 
          className="text-secondary-foreground font-semibold absolute"
          style={{ opacity: checkOpacity }}
        >
          Ajouté au panier !
        </motion.span>
      </div>

      {/* Draggable button */}
      <motion.div
        className={cn(
          "absolute left-1 top-1 bottom-1 w-14 rounded-full",
          "bg-background shadow-lg flex items-center justify-center",
          "cursor-grab active:cursor-grabbing",
          isComplete && "pointer-events-none"
        )}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: maxSwipe }}
        dragElastic={0.02}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        <motion.div style={{ opacity: cartOpacity }}>
          <ShoppingCart className="h-5 w-5 text-primary" />
        </motion.div>
        <motion.div className="absolute" style={{ opacity: checkOpacity }}>
          <Check className="h-5 w-5 text-secondary" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SwipeToAdd;
