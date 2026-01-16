import React, { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Printer, QrCode, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

interface DeliverySlipProps {
  order: {
    id: string;
    order_number: string;
    created_at: string;
    eta_date?: string;
    notes?: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    product_size?: string;
  }>;
  shippingAddress: {
    firstName?: string;
    lastName?: string;
    address?: string;
    address2?: string;
    postalCode?: string;
    city?: string;
    phone?: string;
  } | null;
  preparerName?: string;
  token?: string;
}

const DeliverySlip: React.FC<DeliverySlipProps> = ({
  order,
  items,
  shippingAddress,
  preparerName,
  token,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [confirmationUrl, setConfirmationUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the dynamic confirmation token
  useEffect(() => {
    const fetchConfirmationToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-delivery-slip', {
          body: { orderId: order.id, token },
        });

        if (error) throw error;
        if (data?.data?.confirmationUrl) {
          setConfirmationUrl(data.data.confirmationUrl);
        }
      } catch (err) {
        console.error('Error fetching confirmation token:', err);
        // Fallback URL
        const baseUrl = window.location.origin;
        setConfirmationUrl(`${baseUrl}/confirmation-livraison?order=${order.order_number}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfirmationToken();
  }, [order.id, order.order_number, token]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bon de livraison - ${order.order_number}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
            body { margin: 0; padding: 20px; color: #1a1a1a; }
            .slip { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #0F4C81; }
            .logo { height: 60px; }
            .order-info { text-align: right; }
            .order-number { font-size: 28px; font-weight: bold; color: #0F4C81; }
            .order-date { color: #666; margin-top: 8px; font-size: 14px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 12px; font-weight: 700; color: #0F4C81; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
            .address-box { background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #0F4C81; }
            .customer-name { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
            .address-line { color: #555; font-size: 15px; line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; }
            .items-table th { background: #0F4C81; color: white; padding: 14px 16px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .items-table td { padding: 14px 16px; border-bottom: 1px solid #e8e8e8; font-size: 15px; }
            .items-table tr:nth-child(even) { background: #f8f9fa; }
            .items-table tr:last-child td { border-bottom: none; }
            .size-badge { background: #e0e7ee; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; }
            .quantity { font-weight: 700; font-size: 18px; color: #0F4C81; }
            .qr-section { display: flex; gap: 30px; margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #e8f4fc 0%, #e8f8e8 100%); border-radius: 16px; border: 2px dashed #0F4C81; }
            .qr-code { width: 150px; height: 150px; background: white; padding: 10px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .qr-code img { width: 100%; height: 100%; }
            .qr-text { flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .qr-title { font-size: 20px; font-weight: 700; color: #0F4C81; margin-bottom: 12px; }
            .qr-description { color: #555; font-size: 15px; line-height: 1.6; }
            .qr-steps { margin-top: 16px; }
            .qr-step { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 14px; color: #444; }
            .step-number { background: #0F4C81; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
            .footer { margin-top: 50px; padding-top: 25px; border-top: 2px solid #e8e8e8; text-align: center; }
            .footer-logo { font-size: 24px; font-weight: 700; color: #0F4C81; margin-bottom: 8px; }
            .footer-contact { color: #666; font-size: 14px; }
            .prepared-by { margin-top: 20px; font-style: italic; color: #888; font-size: 13px; padding: 10px; background: #f0f0f0; border-radius: 8px; display: inline-block; }
            .notes { background: #fff3cd; padding: 16px 20px; border-radius: 10px; border-left: 4px solid #ffc107; margin-bottom: 25px; }
            .notes-title { font-weight: 600; color: #856404; margin-bottom: 6px; }
            .notes-text { color: #664d03; font-size: 14px; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .qr-section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Generate QR code URL using Google Charts API
  const qrCodeUrl = confirmationUrl 
    ? `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(confirmationUrl)}&chld=M|2`
    : '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Génération du bon de livraison...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={handlePrint} className="w-full gap-2" size="lg">
        <Printer className="h-5 w-5" />
        Imprimer le bon de livraison
      </Button>

      {/* Preview */}
      <div ref={printRef} className="bg-white p-8 rounded-lg border shadow-sm">
        <div className="slip">
          {/* Header */}
          <div className="header flex justify-between items-start mb-8 pb-5 border-b-[3px] border-primary">
            <img src={logo} alt="SerenCare" className="logo h-14" />
            <div className="order-info text-right">
              <div className="order-number text-2xl font-bold text-primary">{order.order_number}</div>
              <div className="order-date text-muted-foreground text-sm mt-2">
                Commande du {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
              </div>
              {order.eta_date && (
                <div className="text-sm text-primary font-medium mt-1">
                  Livraison prévue : {format(new Date(order.eta_date), 'dd MMMM yyyy', { locale: fr })}
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="section mb-8">
              <div className="section-title text-xs font-bold text-primary uppercase tracking-wider mb-3">
                📦 Adresse de livraison
              </div>
              <div className="address-box bg-muted/50 p-5 rounded-xl border-l-4 border-primary">
                <div className="customer-name font-semibold text-xl mb-2">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </div>
                <div className="address-line text-muted-foreground">
                  {shippingAddress.address}
                  {shippingAddress.address2 && <><br />{shippingAddress.address2}</>}
                  <br />
                  <span className="font-medium">{shippingAddress.postalCode} {shippingAddress.city}</span>
                  {shippingAddress.phone && (
                    <>
                      <br />
                      <span className="text-primary">📞 {shippingAddress.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="section mb-6">
              <div className="notes bg-amber-50 p-5 rounded-xl border-l-4 border-amber-400">
                <div className="notes-title font-semibold text-amber-700 mb-1">📝 Note importante</div>
                <div className="notes-text text-amber-800">{order.notes}</div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="section mb-8">
            <div className="section-title text-xs font-bold text-primary uppercase tracking-wider mb-3">
              📋 Contenu du colis ({items.length} article{items.length > 1 ? 's' : ''})
            </div>
            <table className="items-table w-full border-collapse rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-4 text-left font-semibold">Produit</th>
                  <th className="p-4 text-center font-semibold">Taille</th>
                  <th className="p-4 text-center font-semibold w-24">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-muted/30' : 'bg-white'}>
                    <td className="p-4 border-b border-muted">{item.product_name}</td>
                    <td className="p-4 border-b border-muted text-center">
                      {item.product_size ? (
                        <span className="size-badge bg-muted px-3 py-1.5 rounded-lg text-sm font-medium">
                          {item.product_size}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 border-b border-muted text-center">
                      <span className="quantity text-xl font-bold text-primary">{item.quantity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* QR Code Section */}
          <div className="qr-section flex gap-8 mt-10 p-8 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-2 border-dashed border-primary">
            <div className="qr-code w-36 h-36 bg-white p-3 rounded-xl shadow-md flex items-center justify-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
              ) : (
                <QrCode className="h-20 w-20 text-muted-foreground" />
              )}
            </div>
            <div className="qr-text flex-1">
              <div className="qr-title flex items-center gap-2 font-bold text-xl text-primary mb-3">
                <span>✅</span>
                Confirmez votre livraison
              </div>
              <p className="qr-description text-muted-foreground leading-relaxed mb-4">
                Scannez ce QR code avec votre téléphone pour nous confirmer que votre commande est bien arrivée.
              </p>
              <div className="qr-steps space-y-2">
                <div className="qr-step flex items-center gap-3 text-sm">
                  <span className="step-number w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  <span>Scannez le code avec l'appareil photo de votre téléphone</span>
                </div>
                <div className="qr-step flex items-center gap-3 text-sm">
                  <span className="step-number w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span>Confirmez que tout est en ordre OU signalez un problème</span>
                </div>
                <div className="qr-step flex items-center gap-3 text-sm">
                  <span className="step-number w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  <span>C'est tout ! Merci pour votre retour 💙</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer mt-12 pt-6 border-t-2 border-muted text-center">
            <div className="footer-logo text-2xl font-bold text-primary mb-2">SerenCare</div>
            <p className="footer-contact text-muted-foreground">
              🌐 www.serencare.be • 📧 contact@serencare.be • 📞 02 123 45 67
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Des questions ? Notre équipe est à votre écoute du lundi au vendredi de 9h à 18h.
            </p>
            {preparerName && (
              <p className="prepared-by mt-4 italic text-sm bg-muted px-4 py-2 rounded-lg inline-block">
                ✍️ Préparé avec soin par {preparerName} • {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySlip;
