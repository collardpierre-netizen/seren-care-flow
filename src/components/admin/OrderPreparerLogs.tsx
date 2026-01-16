import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Eye, 
  Play, 
  CheckCircle2, 
  FileText, 
  Clock,
  Monitor,
  MapPin
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreparerLog {
  id: string;
  order_id: string;
  action: string;
  details: string | null;
  preparer_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const actionConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  link_opened: { icon: Eye, label: 'Lien ouvert', color: 'text-blue-600 bg-blue-50' },
  started_preparation: { icon: Play, label: 'Préparation démarrée', color: 'text-yellow-600 bg-yellow-50' },
  completed: { icon: CheckCircle2, label: 'Préparation terminée', color: 'text-green-600 bg-green-50' },
  added_note: { icon: FileText, label: 'Note ajoutée', color: 'text-purple-600 bg-purple-50' },
  message_sent: { icon: FileText, label: 'Message envoyé', color: 'text-indigo-600 bg-indigo-50' },
};

interface OrderPreparerLogsProps {
  orderId: string;
}

const OrderPreparerLogs: React.FC<OrderPreparerLogsProps> = ({ orderId }) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['order-preparer-logs', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_preparer_logs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PreparerLog[];
    },
  });

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Chargement...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Aucune activité enregistrée</p>
        <p className="text-xs">Les actions du préparateur apparaîtront ici</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3 pr-4">
        {logs.map((log) => {
          const config = actionConfig[log.action] || {
            icon: Clock,
            label: log.action,
            color: 'text-gray-600 bg-gray-50',
          };
          const Icon = config.icon;

          return (
            <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
              <div className={`p-2 rounded-full ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{config.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: fr })}
                  </span>
                </div>
                {log.preparer_name && (
                  <p className="text-xs text-muted-foreground">
                    Par: {log.preparer_name}
                  </p>
                )}
                {log.details && (
                  <p className="text-sm mt-1 text-muted-foreground">{log.details}</p>
                )}
                {log.ip_address && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{log.ip_address}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default OrderPreparerLogs;
