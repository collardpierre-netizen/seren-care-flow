import React, { useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Printer, QrCode } from 'lucide-react';
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
  confirmationUrl: string;
  preparerName?: string;
}

const DeliverySlip: React.FC<DeliverySlipProps> = ({
  order,
  items,
  shippingAddress,
  confirmationUrl,
  preparerName,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

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
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0F4C81; }
            .logo { height: 50px; }
            .order-info { text-align: right; }
            .order-number { font-size: 24px; font-weight: bold; color: #0F4C81; }
            .order-date { color: #666; margin-top: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: 600; color: #0F4C81; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
            .address-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .customer-name { font-size: 18px; font-weight: 600; margin-bottom: 5px; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th { background: #0F4C81; color: white; padding: 12px; text-align: left; }
            .items-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
            .items-table tr:nth-child(even) { background: #f8f9fa; }
            .size-badge { background: #e0e0e0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .qr-section { display: flex; gap: 30px; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ea 100%); border-radius: 12px; }
            .qr-code { width: 120px; height: 120px; background: white; padding: 8px; border-radius: 8px; }
            .qr-code img { width: 100%; height: 100%; }
            .qr-text { flex: 1; }
            .qr-title { font-size: 16px; font-weight: 600; color: #0F4C81; margin-bottom: 10px; }
            .qr-description { color: #666; font-size: 14px; line-height: 1.5; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
            .prepared-by { margin-top: 20px; font-style: italic; color: #888; }
            .notes { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
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
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(confirmationUrl)}&chld=M|2`;

  return (
    <div className="space-y-4">
      <Button onClick={handlePrint} className="w-full gap-2">
        <Printer className="h-4 w-4" />
        Imprimer le bon de livraison
      </Button>

      {/* Preview */}
      <div ref={printRef} className="bg-white p-6 rounded-lg border shadow-sm text-sm">
        <div className="slip">
          {/* Header */}
          <div className="header flex justify-between items-start mb-6 pb-4 border-b-2 border-primary">
            <img src={logo} alt="SerenCare" className="logo h-10" />
            <div className="order-info text-right">
              <div className="order-number text-xl font-bold text-primary">{order.order_number}</div>
              <div className="order-date text-muted-foreground text-xs">
                {format(new Date(order.created_at), 'dd MMMM yyyy', { locale: fr })}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="section mb-6">
              <div className="section-title text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                Adresse de livraison
              </div>
              <div className="address-box bg-muted/50 p-4 rounded-lg">
                <div className="customer-name font-semibold text-base mb-1">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </div>
                <div className="text-muted-foreground">
                  {shippingAddress.address}
                  {shippingAddress.address2 && <><br />{shippingAddress.address2}</>}
                  <br />
                  {shippingAddress.postalCode} {shippingAddress.city}
                  {shippingAddress.phone && <><br />📞 {shippingAddress.phone}</>}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="section mb-6">
              <div className="notes bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400 text-amber-800 text-sm">
                <strong>Note :</strong> {order.notes}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="section mb-6">
            <div className="section-title text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              Contenu du colis
            </div>
            <table className="items-table w-full border-collapse">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-3 text-left rounded-tl-lg">Produit</th>
                  <th className="p-3 text-center">Taille</th>
                  <th className="p-3 text-center rounded-tr-lg">Qté</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-3 border-b">{item.product_name}</td>
                    <td className="p-3 border-b text-center">
                      {item.product_size ? (
                        <span className="size-badge bg-muted px-2 py-1 rounded text-xs">
                          {item.product_size}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3 border-b text-center font-semibold">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* QR Code Section */}
          <div className="qr-section flex gap-6 mt-8 p-5 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
            <div className="qr-code w-28 h-28 bg-white p-2 rounded-lg shadow-sm flex items-center justify-center">
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            </div>
            <div className="qr-text flex-1">
              <div className="qr-title flex items-center gap-2 font-semibold text-primary mb-2">
                <QrCode className="h-4 w-4" />
                Confirmez votre livraison
              </div>
              <p className="qr-description text-muted-foreground text-sm leading-relaxed">
                Scannez ce QR code avec votre téléphone pour confirmer que votre commande est bien arrivée et en bon état, ou pour nous signaler un problème.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="footer mt-8 pt-4 border-t text-center text-muted-foreground text-xs">
            <p>Merci de votre confiance !</p>
            <p className="mt-1">SerenCare • www.serencare.be • contact@serencare.be</p>
            {preparerName && (
              <p className="prepared-by mt-3 italic">
                Préparé par : {preparerName} • {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySlip;
