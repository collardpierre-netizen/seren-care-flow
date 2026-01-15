import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useSubscriptionCart } from '@/hooks/useSubscriptionCart';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AddToSubscriptionButtonProps {
  productId: string;
  productSize?: string;
  quantity?: number;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}

const AddToSubscriptionButton: React.FC<AddToSubscriptionButtonProps> = ({
  productId,
  productSize,
  quantity = 1,
  disabled = false,
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
}) => {
  const { user } = useAuth();
  const { addItem, isLoading } = useSubscriptionCart();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Connectez-vous pour créer un abonnement');
      navigate('/connexion');
      return;
    }

    addItem(productId, quantity, productSize);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon && <RefreshCw className="h-4 w-4 mr-2" />}
          Ajouter à l'abonnement
        </>
      )}
    </Button>
  );
};

export default AddToSubscriptionButton;
