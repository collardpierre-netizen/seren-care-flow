import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailPreview = () => {
  const [isSending, setIsSending] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<'order' | 'notification'>('order');

  // Sample order data for preview
  const sampleOrderData = {
    firstName: 'Jean',
    orderNumber: 'SC260106-TEST',
    items: [
      { name: 'TENA Pants Plus', quantity: 2, price: 24.90, size: 'M' },
      { name: 'TENA Lady Maxi', quantity: 1, price: 18.50 },
    ],
    subtotal: 68.30,
    shipping: 0,
    total: 68.30,
    shippingAddress: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'test@example.com',
      phone: '+32 470 00 00 00',
      address: 'Rue de l\'Exemple 123',
      postalCode: '1000',
      city: 'Bruxelles',
      country: 'Belgique',
    },
    hasSubscription: true,
  };

  const generateOrderConfirmationHtml = () => {
    const itemsHtml = sampleOrderData.items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5;">
          <strong>${item.name}</strong>${item.size ? ` - Taille ${item.size}` : ''}
          <br><span style="color: #6B7280; font-size: 14px;">Qté: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; text-align: right; font-weight: 600;">
          ${(item.price * item.quantity).toFixed(2)} €
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F7F6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); padding: 40px 40px 30px; text-align: center;">
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700;">SerenCare</h1>
                    <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Votre bien-être, notre priorité</p>
                  </td>
                </tr>
                
                <!-- Success Icon -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <div style="width: 80px; height: 80px; background-color: #E8F5E9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                      <span style="font-size: 40px;">✓</span>
                    </div>
                    <h2 style="color: #2D5A4A; font-size: 24px; margin: 0 0 10px;">Merci pour votre commande !</h2>
                    <p style="color: #6B7280; font-size: 16px; margin: 0;">Bonjour ${sampleOrderData.firstName},</p>
                  </td>
                </tr>
                
                <!-- Order Number -->
                <tr>
                  <td style="padding: 0 40px 30px; text-align: center;">
                    <div style="background-color: #F5F7F6; border-radius: 12px; padding: 20px; display: inline-block;">
                      <p style="color: #6B7280; font-size: 14px; margin: 0 0 5px;">Numéro de commande</p>
                      <p style="color: #2D5A4A; font-size: 24px; font-weight: 700; margin: 0; font-family: monospace;">${sampleOrderData.orderNumber}</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Order Items -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <h3 style="color: #2D5A4A; font-size: 18px; margin: 0 0 15px; border-bottom: 2px solid #2D5A4A; padding-bottom: 10px;">Récapitulatif de votre commande</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 15px 0 5px; color: #6B7280;">Sous-total</td>
                        <td style="padding: 15px 0 5px; text-align: right; color: #6B7280;">${sampleOrderData.subtotal.toFixed(2)} €</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #6B7280;">Livraison</td>
                        <td style="padding: 5px 0; text-align: right; color: #6B7280;">${sampleOrderData.shipping === 0 ? 'Gratuite' : sampleOrderData.shipping.toFixed(2) + ' €'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-top: 2px solid #2D5A4A; font-size: 18px; font-weight: 700; color: #2D5A4A;">Total</td>
                        <td style="padding: 15px 0; border-top: 2px solid #2D5A4A; text-align: right; font-size: 18px; font-weight: 700; color: #2D5A4A;">${sampleOrderData.total.toFixed(2)} €</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                ${sampleOrderData.hasSubscription ? `
                <!-- Subscription Info -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <div style="background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #F9A825;">
                      <h4 style="color: #F57F17; font-size: 16px; margin: 0 0 10px;">🔄 Abonnement activé</h4>
                      <p style="color: #5D4037; font-size: 14px; margin: 0;">Votre abonnement mensuel est maintenant actif. Vous recevrez automatiquement vos produits chaque mois avec 15% de réduction.</p>
                    </div>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Shipping Address -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <h3 style="color: #2D5A4A; font-size: 18px; margin: 0 0 15px;">Adresse de livraison</h3>
                    <div style="background-color: #F5F7F6; border-radius: 12px; padding: 20px;">
                      <p style="margin: 0; color: #374151; line-height: 1.6;">
                        ${sampleOrderData.shippingAddress.firstName} ${sampleOrderData.shippingAddress.lastName}<br>
                        ${sampleOrderData.shippingAddress.address}<br>
                        ${sampleOrderData.shippingAddress.postalCode} ${sampleOrderData.shippingAddress.city}<br>
                        ${sampleOrderData.shippingAddress.country}
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 40px; text-align: center;">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                      Suivre ma commande
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #F5F7F6; padding: 30px 40px; text-align: center;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px;">Des questions sur votre commande ?</p>
                    <p style="color: #2D5A4A; font-size: 14px; margin: 0;">
                      <a href="mailto:orders@serencare.be" style="color: #2D5A4A; text-decoration: none;">orders@serencare.be</a> |
                      <a href="tel:+32123456789" style="color: #2D5A4A; text-decoration: none;">+32 123 456 789</a>
                    </p>
                    <p style="color: #9CA3AF; font-size: 12px; margin: 20px 0 0;">
                      © ${new Date().getFullYear()} SerenCare. Tous droits réservés.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  const generateNotificationHtml = () => {
    const addr = sampleOrderData.shippingAddress;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F7F6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td style="background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #FFFFFF; font-size: 24px; margin: 0;">🛒 Nouvelle commande !</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="color: #2D5A4A; margin: 0 0 20px;">Commande ${sampleOrderData.orderNumber}</h2>
                    
                    <div style="background-color: #F5F7F6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                      <h3 style="color: #2D5A4A; margin: 0 0 15px; font-size: 16px;">📦 Client</h3>
                      <p style="margin: 0; color: #374151; line-height: 1.6;">
                        <strong>${addr.firstName} ${addr.lastName}</strong><br>
                        ${addr.email}<br>
                        ${addr.phone}
                      </p>
                    </div>
                    
                    <div style="background-color: #F5F7F6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                      <h3 style="color: #2D5A4A; margin: 0 0 15px; font-size: 16px;">📍 Adresse de livraison</h3>
                      <p style="margin: 0; color: #374151; line-height: 1.6;">
                        ${addr.address}<br>
                        ${addr.postalCode} ${addr.city}<br>
                        ${addr.country}
                      </p>
                    </div>
                    
                    <div style="background-color: #E8F5E9; border-radius: 12px; padding: 20px; border-left: 4px solid #2D5A4A;">
                      <h3 style="color: #2D5A4A; margin: 0 0 10px; font-size: 16px;">💰 Montant</h3>
                      <p style="margin: 0; color: #2D5A4A; font-size: 24px; font-weight: bold;">${sampleOrderData.total.toFixed(2)} €</p>
                      ${sampleOrderData.hasSubscription ? '<p style="margin: 10px 0 0; color: #F57F17; font-size: 14px;">🔄 Inclut un abonnement</p>' : ''}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #F5F7F6; padding: 20px; text-align: center;">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 600;">Voir la commande</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  const handleSendTestEmail = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: 'collardpierre@gmail.com',
          subject: selectedEmail === 'order' 
            ? `[TEST] Confirmation de commande ${sampleOrderData.orderNumber}` 
            : `[TEST] 🛒 Nouvelle commande ${sampleOrderData.orderNumber}`,
          html: selectedEmail === 'order' ? generateOrderConfirmationHtml() : generateNotificationHtml(),
        }
      });

      if (error) throw error;
      toast.success('Email de test envoyé !');
    } catch (error) {
      console.error('Email send error:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Prévisualisation Emails | Admin</title>
      </Helmet>
      <Layout>
        <div className="container-main py-8">
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <Mail className="h-8 w-8" />
            Prévisualisation Emails
          </h1>

          <Tabs value={selectedEmail} onValueChange={(v) => setSelectedEmail(v as 'order' | 'notification')}>
            <TabsList className="mb-6">
              <TabsTrigger value="order">Email Confirmation Client</TabsTrigger>
              <TabsTrigger value="notification">Notification Équipe</TabsTrigger>
            </TabsList>

            <div className="flex gap-4 mb-6">
              <Button onClick={handleSendTestEmail} disabled={isSending}>
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Envoi...' : 'Envoyer à collardpierre@gmail.com'}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="order" className="m-0">
                  <iframe
                    srcDoc={generateOrderConfirmationHtml()}
                    className="w-full h-[800px] border-0"
                    title="Order Confirmation Email Preview"
                  />
                </TabsContent>
                <TabsContent value="notification" className="m-0">
                  <iframe
                    srcDoc={generateNotificationHtml()}
                    className="w-full h-[600px] border-0"
                    title="Team Notification Email Preview"
                  />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </Layout>
    </>
  );
};

export default EmailPreview;
