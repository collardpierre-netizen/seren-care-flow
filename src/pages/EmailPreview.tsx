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

const EmailPreview = () => {
  const [isSending, setIsSending] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<'order' | 'notification' | 'shipped'>('order');
  const [testEmail, setTestEmail] = useState('collardpierre@gmail.com');

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
        <td style="padding: 16px 20px; border-bottom: 1px solid #E8EBE9;">
          <div style="display: flex; align-items: center;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #F0F4F2 0%, #E8EBE9 100%); border-radius: 12px; margin-right: 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px;">📦</span>
            </div>
            <div>
              <p style="margin: 0; font-weight: 600; color: #1F2937; font-size: 15px;">${item.name}</p>
              ${item.size ? `<p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">Taille ${item.size}</p>` : ''}
              <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">Quantité: ${item.quantity}</p>
            </div>
          </div>
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E8EBE9; text-align: right; vertical-align: middle;">
          <span style="font-weight: 700; color: #2D5A4A; font-size: 16px;">${(item.price * item.quantity).toFixed(2)} €</span>
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
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F0F4F2; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0F4F2; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px rgba(45, 90, 74, 0.08);">
                
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2D5A4A 0%, #3A7464 50%, #4A8A74 100%); padding: 48px 40px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.15); border-radius: 20px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 32px;">🌿</span>
                          </div>
                          <h1 style="color: #FFFFFF; font-size: 32px; margin: 0 0 8px; font-weight: 800; letter-spacing: -0.5px;">SerenCare</h1>
                          <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 0; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;">Votre bien-être, notre priorité</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Success Banner -->
                <tr>
                  <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(180deg, #FFFFFF 0%, #F8FAF9 100%);">
                    <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(76, 175, 80, 0.2);">
                      <span style="font-size: 48px;">✓</span>
                    </div>
                    <h2 style="color: #2D5A4A; font-size: 28px; margin: 0 0 12px; font-weight: 700;">Commande confirmée !</h2>
                    <p style="color: #6B7280; font-size: 16px; margin: 0; line-height: 1.5;">Bonjour <strong style="color: #2D5A4A;">${sampleOrderData.firstName}</strong>, merci pour votre confiance.</p>
                  </td>
                </tr>
                
                <!-- Order Number Badge -->
                <tr>
                  <td style="padding: 0 40px 32px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #F0F4F2 0%, #E8EBE9 100%); border-radius: 16px; padding: 24px 32px; display: inline-block; border: 1px solid #E0E5E2;">
                      <p style="color: #6B7280; font-size: 12px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Numéro de commande</p>
                      <p style="color: #2D5A4A; font-size: 26px; font-weight: 800; margin: 0; font-family: 'SF Mono', Monaco, 'Courier New', monospace; letter-spacing: 1px;">${sampleOrderData.orderNumber}</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Order Items -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background-color: #F8FAF9; border-radius: 20px; overflow: hidden; border: 1px solid #E8EBE9;">
                      <div style="background: linear-gradient(90deg, #2D5A4A 0%, #3A7464 100%); padding: 16px 20px;">
                        <h3 style="color: #FFFFFF; font-size: 14px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📦 Récapitulatif</h3>
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF;">
                        ${itemsHtml}
                        <tr>
                          <td colspan="2" style="padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Sous-total</td>
                                <td style="padding: 8px 0; text-align: right; color: #374151; font-size: 14px;">${sampleOrderData.subtotal.toFixed(2)} €</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Livraison</td>
                                <td style="padding: 8px 0; text-align: right; color: #10B981; font-size: 14px; font-weight: 600;">${sampleOrderData.shipping === 0 ? '✓ Gratuite' : sampleOrderData.shipping.toFixed(2) + ' €'}</td>
                              </tr>
                              <tr>
                                <td style="padding: 16px 0 0; border-top: 2px solid #2D5A4A; font-size: 18px; font-weight: 700; color: #1F2937;">Total</td>
                                <td style="padding: 16px 0 0; border-top: 2px solid #2D5A4A; text-align: right; font-size: 22px; font-weight: 800; color: #2D5A4A;">${sampleOrderData.total.toFixed(2)} €</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                
                ${sampleOrderData.hasSubscription ? `
                <!-- Subscription Info -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 16px; padding: 24px; border-left: 5px solid #F59E0B;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align: top; padding-right: 16px;">
                            <div style="width: 48px; height: 48px; background: rgba(245, 158, 11, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                              <span style="font-size: 24px;">🔄</span>
                            </div>
                          </td>
                          <td>
                            <h4 style="color: #92400E; font-size: 16px; margin: 0 0 8px; font-weight: 700;">Abonnement activé !</h4>
                            <p style="color: #78350F; font-size: 14px; margin: 0; line-height: 1.5;">Recevez vos produits automatiquement chaque mois avec <strong>15% de réduction</strong>. Modifiable ou annulable à tout moment.</p>
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
                    <div style="background-color: #F8FAF9; border-radius: 16px; padding: 24px; border: 1px solid #E8EBE9;">
                      <h3 style="color: #2D5A4A; font-size: 14px; margin: 0 0 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📍 Adresse de livraison</h3>
                      <p style="margin: 0; color: #374151; line-height: 1.8; font-size: 15px;">
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
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2D5A4A 0%, #3A7464 100%); color: #FFFFFF; text-decoration: none; padding: 18px 48px; border-radius: 60px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(45, 90, 74, 0.3); transition: all 0.3s;">
                      Suivre ma commande →
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(180deg, #F8FAF9 0%, #F0F4F2 100%); padding: 32px 40px; text-align: center; border-top: 1px solid #E8EBE9;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 12px;">Une question sur votre commande ?</p>
                    <p style="margin: 0;">
                      <a href="mailto:orders@serencare.be" style="color: #2D5A4A; text-decoration: none; font-weight: 600;">orders@serencare.be</a>
                      <span style="color: #D1D5DB; margin: 0 12px;">|</span>
                      <a href="tel:+3202648422" style="color: #2D5A4A; text-decoration: none; font-weight: 600;">+32 02 648 42 22</a>
                    </p>
                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E8EBE9;">
                      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
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
      `<li style="padding: 8px 0; border-bottom: 1px solid #E8EBE9;">${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ''} - ${(item.price * item.quantity).toFixed(2)}€</li>`
    ).join('');
    
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F0F4F2;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0F4F2; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
                
                <!-- Alert Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px; text-align: center;">
                    <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 50px; margin-bottom: 12px;">
                      <span style="font-size: 20px;">🛒</span>
                      <span style="color: #FFFFFF; font-weight: 700; margin-left: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Nouvelle Commande</span>
                    </div>
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: 800;">${sampleOrderData.total.toFixed(2)} €</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 32px;">
                    <!-- Order Badge -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <span style="background-color: #F0F4F2; padding: 8px 16px; border-radius: 8px; font-family: monospace; font-size: 16px; font-weight: 700; color: #2D5A4A;">${sampleOrderData.orderNumber}</span>
                    </div>
                    
                    <!-- Customer Info -->
                    <div style="background: linear-gradient(135deg, #EBF4FF 0%, #DBEAFE 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                      <h3 style="color: #1E40AF; font-size: 13px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">👤 Client</h3>
                      <p style="margin: 0; color: #1F2937; font-size: 16px; font-weight: 600;">${addr.firstName} ${addr.lastName}</p>
                      <p style="margin: 4px 0 0; color: #4B5563; font-size: 14px;">${addr.email}</p>
                      <p style="margin: 4px 0 0; color: #4B5563; font-size: 14px;">${addr.phone}</p>
                    </div>
                    
                    <!-- Shipping Address -->
                    <div style="background-color: #F8FAF9; border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid #E8EBE9;">
                      <h3 style="color: #2D5A4A; font-size: 13px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">📦 Livraison</h3>
                      <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 14px;">
                        ${addr.address}<br>
                        ${addr.postalCode} ${addr.city}<br>
                        ${addr.country}
                      </p>
                    </div>
                    
                    <!-- Order Items -->
                    <div style="background-color: #F8FAF9; border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid #E8EBE9;">
                      <h3 style="color: #2D5A4A; font-size: 13px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">🛍️ Articles</h3>
                      <ul style="margin: 0; padding: 0; list-style: none; color: #374151; font-size: 14px;">
                        ${itemsList}
                      </ul>
                    </div>
                    
                    ${sampleOrderData.hasSubscription ? `
                    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; padding: 16px; text-align: center; border: 2px solid #F59E0B;">
                      <span style="font-size: 16px;">🔄</span>
                      <span style="color: #92400E; font-weight: 700; margin-left: 8px;">Abonnement inclus</span>
                    </div>
                    ` : ''}
                  </td>
                </tr>
                
                <!-- CTA -->
                <tr>
                  <td style="background-color: #F8FAF9; padding: 24px; text-align: center; border-top: 1px solid #E8EBE9;">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2D5A4A 0%, #3A7464 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px;">
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
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F0F4F2;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0F4F2; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px rgba(45, 90, 74, 0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2D5A4A 0%, #3A7464 100%); padding: 48px 40px; text-align: center;">
                    <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.15); border-radius: 20px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 32px;">🌿</span>
                    </div>
                    <h1 style="color: #FFFFFF; font-size: 32px; margin: 0; font-weight: 800;">SerenCare</h1>
                  </td>
                </tr>
                
                <!-- Shipping Icon & Message -->
                <tr>
                  <td style="padding: 48px 40px 32px; text-align: center;">
                    <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);">
                      <span style="font-size: 48px;">🚚</span>
                    </div>
                    <h2 style="color: #2D5A4A; font-size: 26px; margin: 0 0 12px; font-weight: 700;">Votre colis est en route !</h2>
                    <p style="color: #6B7280; font-size: 16px; margin: 0;">Commande <strong style="color: #2D5A4A;">${sampleOrderData.orderNumber}</strong></p>
                  </td>
                </tr>
                
                <!-- Tracking Info -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background: linear-gradient(135deg, #EBF4FF 0%, #DBEAFE 100%); border-radius: 20px; padding: 28px; text-align: center; border: 2px solid #93C5FD;">
                      <p style="color: #1E40AF; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Numéro de suivi</p>
                      <p style="color: #1E3A8A; font-size: 22px; font-weight: 800; margin: 0 0 20px; font-family: monospace;">${sampleOrderData.trackingNumber}</p>
                      <a href="${sampleOrderData.trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);">
                        📍 Suivre mon colis
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Timeline -->
                <tr>
                  <td style="padding: 0 40px 32px;">
                    <div style="background-color: #F8FAF9; border-radius: 16px; padding: 24px; border: 1px solid #E8EBE9;">
                      <h3 style="color: #2D5A4A; font-size: 14px; margin: 0 0 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">📋 Suivi de commande</h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-bottom: 16px;">
                            <div style="width: 32px; height: 32px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                              <span style="color: white; font-size: 14px;">✓</span>
                            </div>
                          </td>
                          <td style="padding-bottom: 16px;">
                            <p style="margin: 0; font-weight: 600; color: #1F2937; font-size: 14px;">Commande confirmée</p>
                            <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">06/01/2026 à 14:30</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-bottom: 16px;">
                            <div style="width: 32px; height: 32px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                              <span style="color: white; font-size: 14px;">✓</span>
                            </div>
                          </td>
                          <td style="padding-bottom: 16px;">
                            <p style="margin: 0; font-weight: 600; color: #1F2937; font-size: 14px;">En préparation</p>
                            <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">06/01/2026 à 15:00</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="width: 40px; vertical-align: top; padding-bottom: 16px;">
                            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4px #DBEAFE;">
                              <span style="color: white; font-size: 12px;">🚚</span>
                            </div>
                          </td>
                          <td style="padding-bottom: 16px;">
                            <p style="margin: 0; font-weight: 700; color: #2563EB; font-size: 14px;">Expédié</p>
                            <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">Aujourd'hui</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <div style="width: 32px; height: 32px; background: #E5E7EB; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                              <span style="color: #9CA3AF; font-size: 14px;">📦</span>
                            </div>
                          </td>
                          <td>
                            <p style="margin: 0; font-weight: 600; color: #9CA3AF; font-size: 14px;">Livré</p>
                            <p style="margin: 4px 0 0; color: #9CA3AF; font-size: 13px;">Estimation: 08-09/01/2026</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(180deg, #F8FAF9 0%, #F0F4F2 100%); padding: 32px 40px; text-align: center; border-top: 1px solid #E8EBE9;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 12px;">Questions sur votre livraison ?</p>
                    <p style="margin: 0;">
                      <a href="mailto:orders@serencare.be" style="color: #2D5A4A; text-decoration: none; font-weight: 600;">orders@serencare.be</a>
                    </p>
                    <p style="color: #9CA3AF; font-size: 12px; margin: 24px 0 0;">© ${new Date().getFullYear()} SerenCare</p>
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
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin" className="p-2 rounded-full hover:bg-sage-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-sage-600" />
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
            <TabsList className="mb-6 bg-white shadow-sm">
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
              <CardContent className="p-0 bg-gray-100">
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