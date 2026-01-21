import React from 'react';
import { Package, Lock, Calendar, XCircle, Truck, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReassuranceMessagesProps {
  variant?: 'compact' | 'full' | 'inline';
  className?: string;
  showDiscretion?: boolean;
  showFlexibility?: boolean;
  showShipping?: boolean;
  showSecurity?: boolean;
}

const ReassuranceMessages: React.FC<ReassuranceMessagesProps> = ({
  variant = 'compact',
  className,
  showDiscretion = true,
  showFlexibility = true,
  showShipping = true,
  showSecurity = true,
}) => {
  const messages = [
    {
      key: 'discretion',
      icon: Package,
      title: 'Livraison discrète',
      description: 'Colis neutre sans mention du contenu',
      show: showDiscretion,
    },
    {
      key: 'flexibility',
      icon: XCircle,
      title: 'Sans engagement',
      description: 'Modifiez ou annulez à tout moment',
      show: showFlexibility,
    },
    {
      key: 'shipping',
      icon: Truck,
      title: 'Livraison offerte',
      description: 'Dès 49€ d\'achats',
      show: showShipping,
    },
    {
      key: 'security',
      icon: Shield,
      title: 'Paiement sécurisé',
      description: 'Par carte bancaire ou Bancontact',
      show: showSecurity,
    },
  ].filter(m => m.show);

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-wrap gap-3 text-xs text-muted-foreground', className)}>
        {messages.map((msg) => (
          <span key={msg.key} className="flex items-center gap-1">
            <msg.icon className="h-3 w-3" />
            {msg.title}
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2 text-sm', className)}>
        {messages.map((msg) => (
          <div key={msg.key} className="flex items-center gap-2 text-muted-foreground">
            <msg.icon className="h-4 w-4 text-primary flex-shrink-0" />
            <span>{msg.title}</span>
          </div>
        ))}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {messages.map((msg) => (
        <div key={msg.key} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <msg.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm">{msg.title}</h4>
            <p className="text-xs text-muted-foreground">{msg.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReassuranceMessages;
