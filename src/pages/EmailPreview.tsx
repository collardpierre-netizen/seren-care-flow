import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, Eye, CheckCircle2, Package, Truck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// SerenCare brand colors matching index.css
const brand = {
  primary: '#2563eb',      // Blue - hsl(220, 70%, 45%)
  primaryDark: '#1d4ed8',  // Darker blue
  secondary: '#4ade80',    // Sage green - hsl(160, 30%, 50%)
  accent: '#f97316',       // Coral/Orange - hsl(15, 80%, 60%)
  background: '#f8fafc',   // Light gray
  text: '#1e293b',         // Dark text
  muted: '#64748b',        // Muted text
  border: '#e2e8f0',       // Border
  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const EmailPreview = () => {
  const [isSending, setIsSending] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<'order' | 'notification' | 'shipped'>('order');
  const [testEmail, setTestEmail] = useState('test@serencare.be');

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
    trackingNumber: 'BE123456789',
    trackingUrl: 'https://track.bpost.be/btr/web/#/search?itemCode=BE123456789',
  };

  const generateOrderConfirmationHtml = () => {
    const itemsHtml = sampleOrderData.items.map(item => `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid ${brand.border};">
          <div style="display: flex; align-items: center;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, ${brand.background} 0%, ${brand.border} 100%); border-radius: 12px; margin-right: 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px;">📦</span>
            </div>
            <div>
              <p style="margin: 0; font-weight: 600; color: ${brand.text}; font-size: 15px;">${item.name}</p>
              ${item.size ? `<p style="margin: 4px 0 0; color: ${brand.muted}; font-size: 13px;">Taille ${item.size}</p>` : ''}
              <p style="margin: 4px 0 0; color: ${brand.muted}; font-size: 13px;">Quantité: ${item.quantity}</p>
            </div>
          </div>
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid ${brand.border}; text-align: right; vertical-align: middle;">
          <span style="font-weight: 700; color: ${brand.primary}; font-size: 16px;">${(item.price * item.quantity).toFixed(2)} €</span>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de commande</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: ${brand.fontFamily}; background-color: ${brand.background}; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${brand.background}; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px rgba(37, 99, 235, 0.08);">
                
                <!-- Header with SerenCare Blue -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%); padding: 48px 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <img src="https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/media/logo.png" alt="SerenCare" style="height: 50px; width: auto; margin-bottom: 20px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                          <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 16px 28px; display: none; margin-bottom: 20px;">
                            <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 26px; color: #FFFFFF; letter-spacing: -0.5px;">SerenCare</span>
                          </div>
                          <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.5px;">Merci pour votre commande !</h1>
                          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0; letter-spacing: 0.5px;">Votre bien-être, notre priorité</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Success Icon -->
                <tr>
                  <td align="center" style="padding: 48px 40px 32px; text-align: center;">
                    <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);">
                      <span style="font-size: 48px; line-height: 100px;">✓</span>
                    </div>
                    <h2 style="color: ${brand.primary}; font-size: 28px; margin: 0 0 12px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">Commande confirmée !</h2>
                    <p style="color: ${brand.muted}; font-size: 16px; margin: 0; line-height: 1.5;">Bonjour <strong style="color: ${brand.text};">${sampleOrderData.firstName}</strong>, merci pour votre confiance.</p>
                  </td>
                </tr>
                
                <!-- Order Number Badge -->
                <tr>
                  <td style="padding: 0 40px 32px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; padding: 24px 32px; display: inline-block; border: 1px solid #bfdbfe;">
                      <p style="color: ${brand.muted}; font-size: 12px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Numéro de commande</p>
                      <p style="color: ${brand.primary}; font-size: 26px; font-weight: 800; margin: 0; font-family: 'SF Mono', Monaco, 'Courier New', monospace; letter-spacing: 1px;">${sampleOrderData.orderNumber}</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Order Items -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background-color: #f8fafc; border-radius: 20px; overflow: hidden; border: 1px solid ${brand.border};">
                      <div style="background: linear-gradient(90deg, ${brand.primary} 0%, ${brand.primaryDark} 100%); padding: 16px 20px;">
                        <h3 style="color: #FFFFFF; font-size: 14px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📦 Récapitulatif</h3>
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF;">
                        ${itemsHtml}
                        <tr>
                          <td colspan="2" style="padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; color: ${brand.muted}; font-size: 14px;">Sous-total</td>
                                <td style="padding: 8px 0; text-align: right; color: ${brand.text}; font-size: 14px;">${sampleOrderData.subtotal.toFixed(2)} €</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: ${brand.muted}; font-size: 14px;">Livraison</td>
                                <td style="padding: 8px 0; text-align: right; color: #10B981; font-size: 14px; font-weight: 600;">${sampleOrderData.shipping === 0 ? '✓ Gratuite' : sampleOrderData.shipping.toFixed(2) + ' €'}</td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0 0; border-top: 2px solid ${brand.primary}; font-size: 18px; font-weight: 700; color: ${brand.text};">Total</td>
                                <td style="padding: 16px 0 0; border-top: 2px solid ${brand.primary}; text-align: right; font-size: 22px; font-weight: 800; color: ${brand.primary};">${sampleOrderData.total.toFixed(2)} €</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                
                ${sampleOrderData.hasSubscription ? `
                <!-- Subscription Info with Accent Color -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 16px; padding: 24px; border-left: 5px solid ${brand.accent};">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align: top; padding-right: 16px;">
                            <div style="width: 48px; height: 48px; background: rgba(249, 115, 22, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                              <span style="font-size: 24px; line-height: 48px;">🔄</span>
                            </div>
                          </td>
                          <td>
                            <h4 style="color: #c2410c; font-size: 16px; margin: 0 0 8px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">Abonnement activé !</h4>
                            <p style="color: #9a3412; font-size: 14px; margin: 0; line-height: 1.5;">Recevez vos produits automatiquement chaque mois avec <strong>10% de réduction</strong>. Modifiable ou annulable à tout moment.</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                ` : ''}
                
                <!-- Shipping Address -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid ${brand.border};">
                      <h3 style="color: ${brand.primary}; font-size: 14px; margin: 0 0 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-family: 'Plus Jakarta Sans', sans-serif;">📍 Adresse de livraison</h3>
                      <p style="margin: 0; color: ${brand.text}; line-height: 1.8; font-size: 15px; font-family: 'Inter', sans-serif;">
                        <strong>${sampleOrderData.shippingAddress.firstName} ${sampleOrderData.shippingAddress.lastName}</strong><br>
                        ${sampleOrderData.shippingAddress.address}<br>
                        ${sampleOrderData.shippingAddress.postalCode} ${sampleOrderData.shippingAddress.city}<br>
                        ${sampleOrderData.shippingAddress.country}
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 48px; text-align: center;">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%); color: #FFFFFF; text-decoration: none; padding: 18px 48px; border-radius: 60px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3); font-family: 'Plus Jakarta Sans', sans-serif;">
                      Suivre ma commande →
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px 40px; text-align: center; border-top: 1px solid ${brand.border};">
                    <p style="color: ${brand.muted}; font-size: 14px; margin: 0 0 12px; font-family: 'Inter', sans-serif;">Une question sur votre commande ?</p>
                    <p style="margin: 0; font-family: 'Inter', sans-serif;">
                      <a href="mailto:orders@serencare.be" style="color: ${brand.primary}; text-decoration: none; font-weight: 600;">orders@serencare.be</a>
                      <span style="color: #d1d5db; margin: 0 12px;">|</span>
                      <a href="tel:+3202648422" style="color: ${brand.primary}; text-decoration: none; font-weight: 600;">+32 02 648 42 22</a>
                    </p>
                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid ${brand.border};">
                      <p style="color: #9CA3AF; font-size: 12px; margin: 0; font-family: 'Inter', sans-serif;">
                        © ${new Date().getFullYear()} SerenCare. Tous droits réservés.<br>
                        <a href="#" style="color: #9CA3AF;">Se désinscrire</a> · <a href="#" style="color: #9CA3AF;">Confidentialité</a>
                      </p>
                    </div>
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
    const itemsList = sampleOrderData.items.map(item => 
      `<li style="padding: 8px 0; border-bottom: 1px solid ${brand.border};">${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ''} - ${(item.price * item.quantity).toFixed(2)}€</li>`
    ).join('');
    
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: ${brand.fontFamily}; background-color: ${brand.background};">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${brand.background}; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(37, 99, 235, 0.08);">
                
                <!-- Alert Header with Secondary Green -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px; text-align: center;">
                    <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 50px; margin-bottom: 12px;">
                      <span style="font-size: 20px;">🛒</span>
                      <span style="color: #FFFFFF; font-weight: 700; margin-left: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Plus Jakarta Sans', sans-serif;">Nouvelle Commande</span>
                    </div>
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: 800; font-family: 'Plus Jakarta Sans', sans-serif;">${sampleOrderData.total.toFixed(2)} €</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 32px;">
                    <!-- Order Badge -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <span style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 10px 20px; border-radius: 10px; font-family: 'SF Mono', Monaco, monospace; font-size: 16px; font-weight: 700; color: ${brand.primary};">${sampleOrderData.orderNumber}</span>
                    </div>
                    
                    <!-- Customer Info -->
                    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid #bfdbfe;">
                      <h3 style="color: ${brand.primaryDark}; font-size: 13px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">👤 Client</h3>
                      <p style="margin: 0; color: ${brand.text}; font-size: 16px; font-weight: 600;">${addr.firstName} ${addr.lastName}</p>
                      <p style="margin: 4px 0 0; color: ${brand.muted}; font-size: 14px;">${addr.email}</p>
                      <p style="margin: 4px 0 0; color: ${brand.muted}; font-size: 14px;">${addr.phone}</p>
                    </div>
                    
                    <!-- Shipping Address -->
                    <div style="background-color: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid ${brand.border};">
                      <h3 style="color: ${brand.primary}; font-size: 13px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">📦 Livraison</h3>
                      <p style="margin: 0; color: ${brand.text}; line-height: 1.6; font-size: 14px; font-family: 'Inter', sans-serif;">
                        ${addr.address}<br>
                        ${addr.postalCode} ${addr.city}<br>
                        ${addr.country}
                      </p>
                    </div>
                    
                    <!-- Order Items -->
                    <div style="background-color: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid ${brand.border};">
                      <h3 style="color: ${brand.primary}; font-size: 13px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">🛍️ Articles</h3>
                      <ul style="margin: 0; padding: 0; list-style: none; color: ${brand.text}; font-size: 14px; font-family: 'Inter', sans-serif;">
                        ${itemsList}
                      </ul>
                    </div>
                    
                    ${sampleOrderData.hasSubscription ? `
                    <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 12px; padding: 16px; text-align: center; border: 2px solid ${brand.accent};">
                      <span style="font-size: 16px;">🔄</span>
                      <span style="color: #c2410c; font-weight: 700; margin-left: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">Abonnement inclus</span>
                    </div>
                    ` : ''}
                  </td>
                </tr>
                
                <!-- CTA -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid ${brand.border};">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;">
                      Voir dans l'admin →
                    </a>
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

  const generateShippedHtml = () => {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: ${brand.fontFamily}; background-color: ${brand.background};">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${brand.background}; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px rgba(37, 99, 235, 0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%); padding: 48px 40px; text-align: center;">
                    <img src="https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/media/logo.png" alt="SerenCare" style="height: 50px; width: auto; margin-bottom: 16px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                    <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 16px 28px; display: none; margin-bottom: 16px;">
                      <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 26px; color: #FFFFFF;">SerenCare</span>
                    </div>
                  </td>
                </tr>
                
                <!-- Shipping Icon & Message -->
                <tr>
                  <td style="padding: 48px 40px 32px; text-align: center;">
                    <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);">
                      <span style="font-size: 48px; line-height: 100px;">🚚</span>
                    </div>
                    <h2 style="color: ${brand.primary}; font-size: 26px; margin: 0 0 12px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">Votre colis est en route !</h2>
                    <p style="color: ${brand.muted}; font-size: 16px; margin: 0; font-family: 'Inter', sans-serif;">Commande <strong style="color: ${brand.text};">${sampleOrderData.orderNumber}</strong></p>
                  </td>
                </tr>
                
                <!-- Tracking Info -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 20px; padding: 28px; text-align: center; border: 2px solid #93c5fd;">
                      <p style="color: ${brand.primaryDark}; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;">Numéro de suivi</p>
                      <p style="color: ${brand.primary}; font-size: 22px; font-weight: 800; margin: 0 0 20px; font-family: 'SF Mono', Monaco, monospace;">${sampleOrderData.trackingNumber}</p>
                      <a href="${sampleOrderData.trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3); font-family: 'Plus Jakarta Sans', sans-serif;">
                        📍 Suivre mon colis
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Timeline -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid ${brand.border};">
                      <h3 style="color: ${brand.primary}; font-size: 14px; margin: 0 0 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-family: 'Plus Jakarta Sans', sans-serif;">📋 Suivi de commande</h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-bottom: 16px;">
                            <div style="width: 32px; height: 32px; background: #10B981; border-radius: 50%; text-align: center; line-height: 32px;">
                              <span style="color: white; font-size: 14px;">✓</span>
                            </div>
                          </td>
                          <td style="padding-bottom: 16px;">
                            <p style="margin: 0; font-weight: 600; color: ${brand.text}; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;">Commande confirmée</p>
                            <p style="margin: 4px 0 0; color: ${brand.muted}; font-size: 13px; font-family: 'Inter', sans-serif;">06/01/2026 à 14:30</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-bottom: 16px;">
                            <div style="width: 32px; height: 32px; background: #10B981; border-radius: 50%; text-align: center; line-height: 32px;">
                              <span style="color: white; font-size: 14px;">✓</span>
                            </div>
                          </td>
                          <td style="padding-bottom: 16px;">
                            <p style="margin: 0; font-weight: 600; color: ${brand.text}; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;">En préparation</p>
                            <p style="margin: 4px 0 0; color: ${brand.muted}; font-size: 13px; font-family: 'Inter', sans-serif;">06/01/2026 à 15:00</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-bottom: 16px;">
                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%); border-radius: 50%; text-align: center; line-height: 32px; box-shadow: 0 0 0 4px #dbeafe;">
                              <span style="color: white; font-size: 12px;">🚚</span>
                            </div>
                          </td>
                          <td style="padding-bottom: 16px;">
                            <p style="margin: 0; font-weight: 700; color: ${brand.primary}; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;">Expédié</p>
                            <p style="margin: 4px 0 0; color: ${brand.muted}; font-size: 13px; font-family: 'Inter', sans-serif;">Aujourd'hui</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <div style="width: 32px; height: 32px; background: #e5e7eb; border-radius: 50%; text-align: center; line-height: 32px;">
                              <span style="color: #9CA3AF; font-size: 14px;">📦</span>
                            </div>
                          </td>
                          <td>
                            <p style="margin: 0; font-weight: 600; color: #9CA3AF; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;">Livré</p>
                            <p style="margin: 4px 0 0; color: #9CA3AF; font-size: 13px; font-family: 'Inter', sans-serif;">Estimation: 08-09/01/2026</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px 40px; text-align: center; border-top: 1px solid ${brand.border};">
                    <p style="color: ${brand.muted}; font-size: 14px; margin: 0 0 12px; font-family: 'Inter', sans-serif;">Questions sur votre livraison ?</p>
                    <p style="margin: 0; font-family: 'Inter', sans-serif;">
                      <a href="mailto:orders@serencare.be" style="color: ${brand.primary}; text-decoration: none; font-weight: 600;">orders@serencare.be</a>
                    </p>
                    <p style="color: #9CA3AF; font-size: 12px; margin: 24px 0 0; font-family: 'Inter', sans-serif;">© ${new Date().getFullYear()} SerenCare</p>
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

  const getEmailHtml = () => {
    switch (selectedEmail) {
      case 'order': return generateOrderConfirmationHtml();
      case 'notification': return generateNotificationHtml();
      case 'shipped': return generateShippedHtml();
    }
  };

  const getEmailSubject = () => {
    switch (selectedEmail) {
      case 'order': return `[TEST] Confirmation de commande ${sampleOrderData.orderNumber}`;
      case 'notification': return `[TEST] 🛒 Nouvelle commande ${sampleOrderData.orderNumber}`;
      case 'shipped': return `[TEST] 🚚 Votre colis est en route ! - ${sampleOrderData.orderNumber}`;
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }
    
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: testEmail,
          subject: getEmailSubject(),
          html: getEmailHtml(),
        }
      });

      if (error) throw error;
      toast.success(`Email envoyé à ${testEmail}`);
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
        <title>Prévisualisation Emails | SerenCare</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin" className="p-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <Mail className="h-8 w-8 text-primary" />
                Prévisualisation Emails
              </h1>
              <p className="text-muted-foreground mt-1">Testez et visualisez les templates d'emails</p>
            </div>
          </div>

          <Tabs value={selectedEmail} onValueChange={(v) => setSelectedEmail(v as 'order' | 'notification' | 'shipped')}>
            <TabsList className="mb-6 bg-card shadow-sm">
              <TabsTrigger value="order" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Confirmation Client
              </TabsTrigger>
              <TabsTrigger value="notification" className="gap-2">
                <Package className="h-4 w-4" />
                Notification Équipe
              </TabsTrigger>
              <TabsTrigger value="shipped" className="gap-2">
                <Truck className="h-4 w-4" />
                Expédition
              </TabsTrigger>
            </TabsList>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="testEmail" className="mb-2 block">Email de test</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSendTestEmail} disabled={isSending} className="gap-2">
                      <Send className="h-4 w-4" />
                      {isSending ? 'Envoi...' : 'Envoyer le test'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-muted">
                <TabsContent value="order" className="m-0">
                  <iframe
                    srcDoc={generateOrderConfirmationHtml()}
                    className="w-full h-[900px] border-0"
                    title="Order Confirmation Email Preview"
                  />
                </TabsContent>
                <TabsContent value="notification" className="m-0">
                  <iframe
                    srcDoc={generateNotificationHtml()}
                    className="w-full h-[700px] border-0"
                    title="Team Notification Email Preview"
                  />
                </TabsContent>
                <TabsContent value="shipped" className="m-0">
                  <iframe
                    srcDoc={generateShippedHtml()}
                    className="w-full h-[900px] border-0"
                    title="Shipped Email Preview"
                  />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default EmailPreview;