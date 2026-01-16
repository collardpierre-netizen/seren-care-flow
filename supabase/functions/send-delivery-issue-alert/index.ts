import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliveryIssueAlertRequest {
  orderId: string;
  orderNumber: string;
  issueType: string;
  issueDescription: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

serve(async (req): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      orderId, 
      orderNumber, 
      issueType, 
      issueDescription, 
      customerName,
      customerEmail,
      customerPhone 
    }: DeliveryIssueAlertRequest = await req.json();

    // Get admin emails
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'manager']);

    const adminIds = admins?.map(a => a.user_id) || [];
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('email')
      .in('id', adminIds)
      .not('email', 'is', null);

    const adminEmails = profiles?.map(p => p.email).filter(Boolean) as string[] || [];

    // Fallback if no admin emails found
    if (adminEmails.length === 0) {
      adminEmails.push('contact@serencare.be');
    }

    // Format issue type
    const issueTypeLabels: Record<string, string> = {
      damaged: '📦 Colis endommagé',
      missing: '❌ Produit manquant',
      wrong: '🔄 Mauvais produit',
      other: '❓ Autre problème',
    };

    const issueLabel = issueTypeLabels[issueType] || issueType;

    // Send alert email
    const emailResponse = await resend.emails.send({
      from: "SerenCare Alertes <alertes@serencare.be>",
      to: adminEmails,
      subject: `🚨 ALERTE: Problème de livraison - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .alert-box { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
            .alert-box h2 { margin: 0 0 10px 0; color: #dc2626; font-size: 18px; }
            .alert-box p { margin: 0; color: #7f1d1d; }
            .info-section { margin-bottom: 25px; }
            .info-section h3 { color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .info-row:last-child { border-bottom: none; }
            .info-label { color: #6b7280; }
            .info-value { color: #111827; font-weight: 500; }
            .description-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 10px; }
            .description-box p { margin: 0; color: #374151; white-space: pre-wrap; }
            .cta-button { display: block; background: #0F4C81; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; text-align: center; font-weight: 600; margin: 25px 0; }
            .cta-button:hover { background: #0d3d68; }
            .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Alerte Problème Livraison</h1>
              <p>Un client a signalé un problème</p>
            </div>
            
            <div class="content">
              <div class="alert-box">
                <h2>${issueLabel}</h2>
                <p>Commande <strong>${orderNumber}</strong></p>
              </div>

              <div class="info-section">
                <h3>📋 Détails du signalement</h3>
                <div class="info-row">
                  <span class="info-label">Type de problème</span>
                  <span class="info-value">${issueLabel}</span>
                </div>
                ${customerName ? `
                <div class="info-row">
                  <span class="info-label">Client</span>
                  <span class="info-value">${customerName}</span>
                </div>
                ` : ''}
                ${customerEmail ? `
                <div class="info-row">
                  <span class="info-label">Email</span>
                  <span class="info-value"><a href="mailto:${customerEmail}">${customerEmail}</a></span>
                </div>
                ` : ''}
                ${customerPhone ? `
                <div class="info-row">
                  <span class="info-label">Téléphone</span>
                  <span class="info-value"><a href="tel:${customerPhone}">${customerPhone}</a></span>
                </div>
                ` : ''}
              </div>

              <div class="info-section">
                <h3>💬 Description du problème</h3>
                <div class="description-box">
                  <p>${issueDescription || 'Aucune description fournie'}</p>
                </div>
              </div>

              <a href="https://serencare.be/admin/commandes" class="cta-button">
                Voir la commande dans l'admin
              </a>

              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                ⏰ Ce signalement a été reçu le ${new Date().toLocaleDateString('fr-BE', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div class="footer">
              <p>Cet email a été envoyé automatiquement par le système SerenCare.</p>
              <p>Merci de traiter ce signalement dans les plus brefs délais.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Delivery issue alert sent to:", adminEmails, emailResponse);

    // Update notification_outbox status if applicable
    await supabase
      .from('notification_outbox')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
      .eq('order_id', orderId)
      .eq('template', 'delivery_issue_reported');

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending delivery issue alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
