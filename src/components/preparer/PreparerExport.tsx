import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { 
  Download, 
  FileSpreadsheet,
  FileText,
  Calendar as CalendarIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PreparerExportProps {
  preparerName: string;
}

interface ExportData {
  order_number: string;
  customer_name: string;
  customer_city: string;
  status: string;
  items_count: number;
  prepared_at: string;
  preparation_time_minutes: number;
  has_issues: boolean;
}

export const PreparerExport: React.FC<PreparerExportProps> = ({ preparerName }) => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch orders prepared by this preparer
  const { data: preparedOrders = [], isLoading } = useQuery({
    queryKey: ['preparer-export-data', preparerName, startDate, endDate],
    queryFn: async () => {
      const start = startOfDay(startDate).toISOString();
      const end = endOfDay(endDate).toISOString();

      // Get logs for this preparer in date range
      const { data: logs } = await supabase
        .from('order_preparer_logs')
        .select('order_id, created_at, action')
        .eq('preparer_name', preparerName)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false });

      if (!logs || logs.length === 0) return [];

      const orderIds = [...new Set(logs.map(l => l.order_id))];

      // Get order details
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          created_at,
          updated_at,
          shipping_address,
          order_items(id)
        `)
        .in('id', orderIds);

      // Get preparation data
      const { data: preps } = await supabase
        .from('order_item_preparation')
        .select('order_id, prepared_at, is_available')
        .in('order_id', orderIds);

      return orders?.map(order => {
        const shipping = order.shipping_address as any;
        const orderPreps = preps?.filter(p => p.order_id === order.id) || [];
        const firstLog = logs.find(l => l.order_id === order.id);
        const lastPrep = orderPreps.find(p => p.prepared_at);
        
        let prepTimeMinutes = 0;
        if (lastPrep?.prepared_at) {
          prepTimeMinutes = Math.round(
            (new Date(lastPrep.prepared_at).getTime() - new Date(order.created_at).getTime()) / 60000
          );
        }

        return {
          order_number: order.order_number,
          customer_name: shipping ? `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() : 'Client',
          customer_city: shipping?.city || '',
          status: order.status,
          items_count: order.order_items?.length || 0,
          prepared_at: lastPrep?.prepared_at || firstLog?.created_at || order.created_at,
          preparation_time_minutes: prepTimeMinutes,
          has_issues: orderPreps.some(p => !p.is_available),
        } as ExportData;
      }) || [];
    },
    enabled: !!preparerName,
  });

  const handleDateRangeChange = (range: string) => {
    setDateRange(range as any);
    const now = new Date();
    switch (range) {
      case 'today':
        setStartDate(now);
        setEndDate(now);
        break;
      case '7days':
        setStartDate(subDays(now, 7));
        setEndDate(now);
        break;
      case '30days':
        setStartDate(subDays(now, 30));
        setEndDate(now);
        break;
    }
  };

  const exportToCSV = (data: ExportData[]) => {
    const headers = [
      'N° Commande',
      'Client',
      'Ville',
      'Statut',
      'Articles',
      'Date préparation',
      'Temps (min)',
      'Problèmes'
    ];

    const statusLabels: Record<string, string> = {
      order_received: 'Reçue',
      payment_confirmed: 'Paiement confirmé',
      processing: 'En traitement',
      preparing: 'En préparation',
      packed: 'Emballée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      closed: 'Clôturée',
    };

    const rows = data.map(row => [
      row.order_number,
      row.customer_name,
      row.customer_city,
      statusLabels[row.status] || row.status,
      row.items_count.toString(),
      format(new Date(row.prepared_at), 'dd/MM/yyyy HH:mm'),
      row.preparation_time_minutes.toString(),
      row.has_issues ? 'Oui' : 'Non'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    return blob;
  };

  const exportToExcel = (data: ExportData[]) => {
    // For Excel, we create a more complete CSV that Excel can open
    // In a production app, you'd use a library like xlsx
    return exportToCSV(data);
  };

  const handleExport = async () => {
    if (preparedOrders.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    setIsExporting(true);
    try {
      const blob = exportFormat === 'csv' 
        ? exportToCSV(preparedOrders)
        : exportToExcel(preparedOrders);

      const filename = `rapport-preparateur-${preparerName}-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.${exportFormat === 'csv' ? 'csv' : 'csv'}`;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export réussi !', {
        description: `${preparedOrders.length} commandes exportées`
      });
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // Summary stats
  const totalOrders = preparedOrders.length;
  const avgPrepTime = totalOrders > 0
    ? Math.round(preparedOrders.reduce((sum, o) => sum + o.preparation_time_minutes, 0) / totalOrders)
    : 0;
  const issuesCount = preparedOrders.filter(o => o.has_issues).length;
  const successRate = totalOrders > 0
    ? Math.round(((totalOrders - issuesCount) / totalOrders) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Export Settings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exporter le rapport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-slate-300">Période</Label>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="7days">7 derniers jours</SelectItem>
                  <SelectItem value="30days">30 derniers jours</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label className="text-slate-300">Format</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV (Excel compatible)
                    </span>
                  </SelectItem>
                  <SelectItem value="excel">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Excel
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Date début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-white"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, 'd MMM yyyy', { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Date fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-white"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, 'd MMM yyyy', { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            disabled={isExporting || isLoading || preparedOrders.length === 0}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exporter ({preparedOrders.length} commandes)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Résumé de la période</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">{totalOrders}</p>
              <p className="text-slate-400 text-sm">Commandes</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-primary">{avgPrepTime}m</p>
              <p className="text-slate-400 text-sm">Temps moyen</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{successRate}%</p>
              <p className="text-slate-400 text-sm">Taux réussite</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{issuesCount}</p>
              <p className="text-slate-400 text-sm">Problèmes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Aperçu des données</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : preparedOrders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Aucune commande préparée sur cette période
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400">Commande</th>
                    <th className="text-left py-2 text-slate-400">Client</th>
                    <th className="text-left py-2 text-slate-400">Statut</th>
                    <th className="text-right py-2 text-slate-400">Temps</th>
                    <th className="text-center py-2 text-slate-400">État</th>
                  </tr>
                </thead>
                <tbody>
                  {preparedOrders.slice(0, 5).map((order, index) => (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="py-2 text-white font-mono text-xs">{order.order_number}</td>
                      <td className="py-2 text-slate-300">{order.customer_name}</td>
                      <td className="py-2 text-slate-300 capitalize">{order.status.replace('_', ' ')}</td>
                      <td className="py-2 text-right text-slate-300">{order.preparation_time_minutes}m</td>
                      <td className="py-2 text-center">
                        {order.has_issues ? (
                          <span className="text-red-400">⚠️</span>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preparedOrders.length > 5 && (
                <p className="text-slate-400 text-sm text-center mt-4">
                  + {preparedOrders.length - 5} autres commandes
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
