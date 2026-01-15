import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://serencare.be',
  'https://www.serencare.be',
  'https://seren-care-flow.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface SendToPreparerRequest {
  orderId: string;
  orderNumber: string;
  preparerEmail: string;
  includePdf: boolean;
  orderItems: Array<{
    product_name: string;
    product_size?: string;
    quantity: number;
  }>;
  shippingAddress?: {
    address_line1?: string;
    address_line2?: string;
    postal_code?: string;
    city?: string;
  };
  customerName: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const data: SendToPreparerRequest = await req.json();
    console.log('Sending order to preparer:', data.orderNumber);

    // Generate a unique magic link token (no password needed)
    const magicToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save magic link token to database (no password_hash needed)
    const { error: tokenError } = await supabase
      .from('order_access_tokens')
      .insert({
        order_id: data.orderId,
        token: magicToken,
        password_hash: 'magic_link', // Marker to indicate this is a magic link
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error saving token:', tokenError);
      throw new Error('Failed to create access token');
    }

    // Build preparation URL with magic token embedded
    // Use the custom domain if available, otherwise fall back to Lovable preview URL
    const baseUrl = Deno.env.get('SITE_URL') || 'https://seren-care-flow.lovable.app';
    const preparationUrl = `${baseUrl}/commande-preparation/${data.orderId}?token=${magicToken}`;

    // Build items HTML for email
    const itemsHtml = data.orderItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.product_name}</strong>
          ${item.product_size ? `<br><span style="color: #6b7280; font-size: 13px;">Taille: ${item.product_size}</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600; font-size: 18px;">
          ${item.quantity}
        </td>
      </tr>
    `).join('');

    // Build shipping address HTML
    const addressHtml = data.shippingAddress ? `
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h3 style="margin: 0 0 8px; color: #374151; font-size: 14px; text-transform: uppercase;">Adresse de livraison</h3>
        <p style="margin: 0; color: #111827;">
          <strong>${data.customerName}</strong><br>
          ${data.shippingAddress.address_line1 || ''}<br>
          ${data.shippingAddress.address_line2 ? data.shippingAddress.address_line2 + '<br>' : ''}
          ${data.shippingAddress.postal_code || ''} ${data.shippingAddress.city || ''}
        </p>
      </div>
    ` : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">📦 Nouvelle commande à préparer</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 32px;">
                <div style="background: #dbeafe; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                  <p style="margin: 0 0 4px; color: #1e40af; font-size: 14px;">N° de commande</p>
                  <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1e3a8a; font-family: monospace;">${data.orderNumber}</p>
                </div>

                ${addressHtml}
                
                <h2 style="margin: 24px 0 16px; color: #374151; font-size: 18px;">Articles à préparer</h2>
                
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
                  <thead>
                    <tr style="background: #f9fafb;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Produit</th>
                      <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qté</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <!-- Security Info -->
                <div style="background: #d1fae5; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #6ee7b7;">
                  <h3 style="margin: 0 0 12px; color: #065f46; font-size: 16px;">🔐 Lien sécurisé à usage unique</h3>
                  <p style="margin: 0; color: #047857; font-size: 14px;">
                    Ce lien vous permet d'accéder directement à la commande.<br>
                    <strong>Important :</strong> Il expire dans 7 jours et ne peut être utilisé qu'une seule fois.
                  </p>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin-top: 32px;">
                  <a href="${preparationUrl}" style="
                    display: inline-block;
                    background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
                    color: white;
                    padding: 16px 40px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 16px;
                  ">Accéder à la commande</a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} SerenCare - Cet email est destiné au préparateur de commandes
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SerenCare <commandes@serencare.be>',
        to: [data.preparerEmail],
        subject: `📦 Commande ${data.orderNumber} à préparer`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log('Preparer email sent successfully to:', data.preparerEmail);

    return new Response(
      JSON.stringify({ success: true, preparationUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending to preparer:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
