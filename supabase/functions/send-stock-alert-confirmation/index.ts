import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  alert_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alert_id }: ConfirmationRequest = await req.json();

    if (!alert_id) {
      return new Response(
        JSON.stringify({ error: "alert_id manquant" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending confirmation for alert: ${alert_id}`);

    // Get alert with product info
    const { data: alert, error: alertError } = await supabase
      .from("stock_alerts")
      .select("id, email, size, unsubscribe_token, product_id, products(name, slug)")
      .eq("id", alert_id)
      .single();

    if (alertError || !alert) {
      console.error("Alert not found:", alertError);
      return new Response(
        JSON.stringify({ error: "Alerte non trouvée" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const product = (alert as any).products;
    const siteUrl = Deno.env.get("SITE_URL") || "https://seren-care-flow.lovable.app";
    const productUrl = `${siteUrl}/produit/${product.slug}`;
    const unsubscribeUrl = `${siteUrl}/desinscription-alerte?token=${alert.unsubscribe_token}`;
    const sizeText = alert.size ? ` (taille ${alert.size})` : "";

    const emailResult = await resend.emails.send({
      from: "SerenCare <notifications@serencare.be>",
      to: [alert.email],
      subject: `✅ Alerte confirmée pour ${product.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <!-- Logo -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/email-assets/serencare-logo-email.png" alt="SerenCare" style="height: 40px;">
                </div>
                
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                  <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
                    Alerte confirmée !
                  </h1>
                  <p style="color: #666; font-size: 16px; margin: 0;">
                    Vous serez prévenu(e) dès que ce produit sera disponible
                  </p>
                </div>
                
                <!-- Product -->
                <div style="background-color: #f0f9ff; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
                  <h2 style="color: #0369a1; font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">
                    ${product.name}${sizeText}
                  </h2>
                  <p style="color: #0284c7; font-size: 14px; margin: 0;">
                    Nous vous enverrons un email dès le retour en stock
                  </p>
                </div>
                
                <!-- Info -->
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
                  <p style="color: #666; font-size: 14px; margin: 0; text-align: center;">
                    💡 Vous pouvez continuer à naviguer sur notre boutique en attendant
                  </p>
                </div>
                
                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${productUrl}" style="display: inline-block; background-color: #166534; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    Voir le produit
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">
                  Vous ne souhaitez plus recevoir cette alerte ?
                </p>
                <a href="${unsubscribeUrl}" style="color: #666; font-size: 12px;">
                  Se désinscrire
                </a>
                <p style="color: #999; font-size: 12px; margin: 16px 0 0 0;">
                  © ${new Date().getFullYear()} SerenCare. Tous droits réservés.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (emailResult.error) {
      console.error("Failed to send confirmation email:", emailResult.error);
      throw emailResult.error;
    }

    console.log(`Confirmation email sent to ${alert.email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-stock-alert-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
