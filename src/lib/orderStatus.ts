// Configuration des statuts de commande type Uber Eats
import { 
  ClipboardCheck, 
  CreditCard, 
  Cog, 
  ChefHat, 
  PackageCheck, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Lock,
  Pause,
  Clock,
  PackageX,
  XCircle,
  RotateCcw,
  Wallet
} from 'lucide-react';

export type OrderStatus = 
  | 'order_received'
  | 'payment_confirmed'
  | 'processing'
  | 'preparing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'closed'
  | 'on_hold'
  | 'delayed'
  | 'partially_shipped'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface StatusConfig {
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  isException: boolean;
  description: string;
}

export const statusConfig: Record<OrderStatus, StatusConfig> = {
  order_received: {
    label: 'Commande reçue',
    shortLabel: 'Reçue',
    icon: ClipboardCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    isException: false,
    description: 'Nous avons bien reçu votre commande.'
  },
  payment_confirmed: {
    label: 'Paiement confirmé',
    shortLabel: 'Payée',
    icon: CreditCard,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-500',
    isException: false,
    description: 'Votre paiement a été confirmé.'
  },
  processing: {
    label: 'Prise en charge',
    shortLabel: 'En cours',
    icon: Cog,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    borderColor: 'border-violet-500',
    isException: false,
    description: 'Votre commande est prise en charge.'
  },
  preparing: {
    label: 'En préparation',
    shortLabel: 'Préparation',
    icon: ChefHat,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    isException: false,
    description: 'Nos équipes préparent votre colis.'
  },
  packed: {
    label: 'Colis prêt',
    shortLabel: 'Prêt',
    icon: PackageCheck,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-500',
    isException: false,
    description: 'Votre colis attend le transporteur.'
  },
  shipped: {
    label: 'Expédiée',
    shortLabel: 'Expédiée',
    icon: Truck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-500',
    isException: false,
    description: 'Votre colis est en route.'
  },
  out_for_delivery: {
    label: 'En livraison',
    shortLabel: 'Livraison',
    icon: MapPin,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-500',
    isException: false,
    description: 'Votre colis arrive bientôt.'
  },
  delivered: {
    label: 'Livrée',
    shortLabel: 'Livrée',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    isException: false,
    description: 'Votre commande a été livrée.'
  },
  closed: {
    label: 'Clôturée',
    shortLabel: 'Terminée',
    icon: Lock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
    isException: false,
    description: 'Commande terminée. Merci.'
  },
  on_hold: {
    label: 'En attente',
    shortLabel: 'Attente',
    icon: Pause,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-500',
    isException: true,
    description: 'En attente d\'informations.'
  },
  delayed: {
    label: 'Retardée',
    shortLabel: 'Retard',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    isException: true,
    description: 'Votre commande a pris du retard.'
  },
  partially_shipped: {
    label: 'Partiellement expédiée',
    shortLabel: 'Partielle',
    icon: PackageX,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    isException: true,
    description: 'Une partie de votre commande a été expédiée.'
  },
  cancelled: {
    label: 'Annulée',
    shortLabel: 'Annulée',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    isException: true,
    description: 'Votre commande a été annulée.'
  },
  returned: {
    label: 'Retournée',
    shortLabel: 'Retour',
    icon: RotateCcw,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    isException: true,
    description: 'Votre retour est en cours.'
  },
  refunded: {
    label: 'Remboursée',
    shortLabel: 'Remboursée',
    icon: Wallet,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    isException: true,
    description: 'Votre remboursement a été effectué.'
  }
};

// Ordre normal de progression
export const normalFlow: OrderStatus[] = [
  'order_received',
  'payment_confirmed',
  'processing',
  'preparing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'closed'
];

// Obtenir l'index du statut dans le flow normal
export function getStatusIndex(status: OrderStatus): number {
  const index = normalFlow.indexOf(status);
  return index >= 0 ? index : -1;
}

// Vérifier si un statut est une exception
export function isExceptionStatus(status: OrderStatus): boolean {
  return statusConfig[status]?.isException ?? false;
}

// Obtenir la couleur de badge selon le statut
export function getStatusBadgeVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (['cancelled', 'returned'].includes(status)) return 'destructive';
  if (['delivered', 'closed', 'refunded'].includes(status)) return 'default';
  if (isExceptionStatus(status)) return 'outline';
  return 'secondary';
}
