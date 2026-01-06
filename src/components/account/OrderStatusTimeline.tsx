import React from 'react';
import { motion } from 'framer-motion';
import { Package, CreditCard, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusTimelineProps {
  status: string;
  createdAt: string;
  className?: string;
}

const statusSteps = [
  { 
    key: 'pending', 
    label: 'Reçue', 
    icon: Clock,
    description: 'Commande enregistrée'
  },
  { 
    key: 'paid', 
    label: 'Confirmée', 
    icon: CreditCard,
    description: 'Paiement validé'
  },
  { 
    key: 'shipped', 
    label: 'Expédiée', 
    icon: Truck,
    description: 'En cours de livraison'
  },
  { 
    key: 'delivered', 
    label: 'Livrée', 
    icon: CheckCircle,
    description: 'Commande remise'
  },
];

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ 
  status, 
  createdAt,
  className 
}) => {
  const isCancelled = status === 'cancelled';
  const currentIndex = statusSteps.findIndex(s => s.key === status);

  if (isCancelled) {
    return (
      <div className={cn("py-4", className)}>
        <div className="flex items-center justify-center gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
          <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-destructive">Commande annulée</p>
            <p className="text-sm text-muted-foreground">
              Cette commande a été annulée
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("py-4", className)}>
      {/* Mobile: Vertical timeline */}
      <div className="sm:hidden space-y-0">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex gap-3">
              {/* Line and dot */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted 
                      ? isCurrent 
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                        : "bg-primary/80 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                {index < statusSteps.length - 1 && (
                  <div 
                    className={cn(
                      "w-0.5 h-8 transition-colors duration-300",
                      index < currentIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
              
              {/* Content */}
              <div className="pb-6">
                <p className={cn(
                  "font-medium transition-colors",
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Horizontal timeline */}
      <div className="hidden sm:block">
        <div className="flex items-start justify-between relative">
          {/* Progress line background */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-border rounded-full" />
          
          {/* Progress line filled */}
          <motion.div 
            className="absolute top-5 left-0 h-1 bg-primary rounded-full"
            initial={{ width: '0%' }}
            animate={{ 
              width: currentIndex >= 0 
                ? `${(currentIndex / (statusSteps.length - 1)) * 100}%` 
                : '0%' 
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.key}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center relative z-10 flex-1"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 bg-background",
                    isCompleted 
                      ? isCurrent 
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                        : "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className={cn(
                  "mt-2 text-sm font-medium text-center transition-colors",
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-[100px]">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
