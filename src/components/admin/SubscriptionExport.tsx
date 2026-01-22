import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface SubscriptionItem {
  id: string;
  product_id: string;
  product_size: string | null;
  quantity: number;
  unit_price: number;
  product?: { name: string };
}

interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency_days: number;
  next_delivery_date: string | null;
  total_savings: number | null;
  created_at: string;
  stripe_subscription_id?: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  items: SubscriptionItem[];
}

interface SubscriptionExportProps {
  subscriptions: Subscription[];
}

const SubscriptionExport: React.FC<SubscriptionExportProps> = ({ subscriptions }) => {
  const exportToCSV = () => {
    if (!subscriptions?.length) {
      toast.error('Aucun abonnement à exporter');
      return;
    }

    const headers = [
      'ID',
      'Client',
      'Email',
      'Statut',
      'Fréquence (jours)',
      'Prochaine livraison',
      'Date création',
      'Produits',
      'Total mensuel (€)',
      'Économies totales (€)',
      'Stripe ID'
    ];

    const rows = subscriptions.map(sub => {
      const monthlyTotal = sub.items?.reduce((t, item) => t + (item.unit_price * item.quantity), 0) || 0;
      const products = sub.items?.map(item => `${item.product?.name || 'Produit'} x${item.quantity}`).join('; ') || '';
      
      return [
        sub.id,
        `${sub.profile?.first_name || ''} ${sub.profile?.last_name || ''}`.trim(),
        sub.profile?.email || '',
        sub.status,
        sub.frequency_days.toString(),
        sub.next_delivery_date ? format(new Date(sub.next_delivery_date), 'dd/MM/yyyy', { locale: fr }) : '',
        format(new Date(sub.created_at), 'dd/MM/yyyy', { locale: fr }),
        products,
        monthlyTotal.toFixed(2),
        (sub.total_savings || 0).toFixed(2),
        sub.stripe_subscription_id || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `abonnements_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${subscriptions.length} abonnements exportés`);
  };

  return (
    <Button variant="outline" onClick={exportToCSV} className="gap-2">
      <Download className="h-4 w-4" />
      Exporter CSV
    </Button>
  );
};

export default SubscriptionExport;
