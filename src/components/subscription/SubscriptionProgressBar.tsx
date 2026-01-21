import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Gift } from 'lucide-react';

interface SubscriptionProgressBarProps {
  currentAmount: number;
  minimumAmount: number;
  className?: string;
  showMessage?: boolean;
}

const SubscriptionProgressBar: React.FC<SubscriptionProgressBarProps> = ({
  currentAmount,
  minimumAmount,
  className,
  showMessage = true,
}) => {
  const progress = Math.min(100, (currentAmount / minimumAmount) * 100);
  const remaining = Math.max(0, minimumAmount - currentAmount);
  const isValid = currentAmount >= minimumAmount;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {isValid ? (
            <span className="flex items-center gap-1.5 text-green-600 font-medium">
              <CheckCircle className="h-4 w-4" />
              Objectif atteint !
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Minimum requis : {minimumAmount.toFixed(2)} €/mois
            </span>
          )}
        </span>
        <span className={cn(
          'font-semibold',
          isValid ? 'text-green-600' : 'text-foreground'
        )}>
          {currentAmount.toFixed(2)} €
        </span>
      </div>

      <Progress 
        value={progress} 
        className={cn(
          'h-3',
          isValid ? '[&>div]:bg-green-500' : '[&>div]:bg-primary'
        )}
      />

      {showMessage && !isValid && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Gift className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Plus que <strong>{remaining.toFixed(2)} €</strong> pour activer votre abonnement et profiter de la livraison gratuite chaque mois !
          </p>
        </div>
      )}

      {showMessage && isValid && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Gift className="h-4 w-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">
            Votre abonnement inclut la <strong>livraison gratuite</strong> chaque mois !
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionProgressBar;
