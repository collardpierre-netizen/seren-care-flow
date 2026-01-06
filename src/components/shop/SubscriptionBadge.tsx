import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  discountPercent?: number;
  variant?: 'default' | 'small' | 'prominent';
  className?: string;
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  discountPercent = 10,
  variant = 'default',
  className,
}) => {
  if (variant === 'small') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        "bg-secondary/20 text-secondary border border-secondary/30",
        className
      )}>
        <RefreshCw className="w-3 h-3" />
        -{discountPercent}% abo
      </div>
    );
  }

  if (variant === 'prominent') {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        "bg-gradient-to-r from-secondary/20 to-primary/10 border border-secondary/30",
        className
      )}>
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Économisez {discountPercent}% en abonnement
          </p>
          <p className="text-xs text-muted-foreground">
            Sans engagement · Modifiable à tout moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
      "bg-secondary text-secondary-foreground",
      className
    )}>
      <RefreshCw className="w-3.5 h-3.5" />
      -{discountPercent}% en abonnement
    </div>
  );
};

export default SubscriptionBadge;
