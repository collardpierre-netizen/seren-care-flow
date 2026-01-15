import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StockAlertRequest {
  product_id: string;
  size?: string;
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

    const { product_id, size }: StockAlertRequest = await req.json();

    console.log(`Processing stock alerts for product: ${product_id}, size: ${size || 'all'}`);

    // Get product info
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("name, slug")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      console.error("Product not found:", productError);
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get active stock alerts for this product
    let alertsQuery = supabase
      .from("stock_alerts")
      .select("id, email, size, unsubscribe_token")
      .eq("product_id", product_id)
      .eq("is_active", true)
      .is("notified_at", null);

    // If size is specified, only get alerts for that size or alerts without size
    if (size) {
      alertsQuery = alertsQuery.or(`size.eq.${size},size.is.null`);
    }

    const { data: alerts, error: alertsError } = await alertsQuery;

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      console.log("No active alerts found for this product");
      return new Response(
        JSON.stringify({ message: "No alerts to send", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${alerts.length} alerts to process`);

    const siteUrl = Deno.env.get("SITE_URL") || "https://seren-care-flow.lovable.app";
    const productUrl = `${siteUrl}/produit/${product.slug}`;
    let successCount = 0;
    const failedEmails: string[] = [];

    for (const alert of alerts) {
      try {
        const sizeText = alert.size ? ` (taille ${alert.size})` : "";
        const unsubscribeUrl = `${siteUrl}/desinscription-alerte?token=${alert.unsubscribe_token}`;
        
        const emailResult = await resend.emails.send({
          from: "SerenCare <notifications@serencare.be>",
          to: [alert.email],
          subject: `🎉 ${product.name} est de nouveau disponible !`,
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
                      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
                        Bonne nouvelle !
                      </h1>
                      <p style="color: #666; font-size: 16px; margin: 0;">
                        Le produit que vous attendiez est de retour
                      </p>
                    </div>
                    
                    <!-- Product -->
                    <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
                      <h2 style="color: #166534; font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">
                        ${product.name}${sizeText}
                      </h2>
                      <p style="color: #15803d; font-size: 14px; margin: 0;">
                        Disponible dès maintenant
                      </p>
                    </div>
                    
                    <!-- CTA -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="${productUrl}" style="display: inline-block; background-color: #166534; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Commander maintenant
                      </a>
                    </div>
                    
                    <!-- Note -->
                    <p style="color: #999; font-size: 13px; text-align: center; margin: 0;">
                      Les stocks sont limités, ne tardez pas !
                    </p>
                  </div>
                  
                  <!-- Footer -->
                  <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">
                      Vous avez reçu cet email car vous vous êtes inscrit(e) à une alerte de disponibilité.
                    </p>
                    <a href="${unsubscribeUrl}" style="color: #666; font-size: 12px; display: block; margin-bottom: 8px;">
                      Se désinscrire de cette alerte
                    </a>
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} SerenCare. Tous droits réservés.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        if (emailResult.error) {
          console.error(`Failed to send email to ${alert.email}:`, emailResult.error);
          failedEmails.push(alert.email);
        } else {
          console.log(`Email sent successfully to ${alert.email}`);
          
          // Mark alert as notified
          await supabase
            .from("stock_alerts")
            .update({ 
              notified_at: new Date().toISOString(),
              is_active: false 
            })
            .eq("id", alert.id);
          
          successCount++;
        }
      } catch (emailError) {
        console.error(`Error sending email to ${alert.email}:`, emailError);
        failedEmails.push(alert.email);
      }
    }

    console.log(`Stock alerts processed: ${successCount} sent, ${failedEmails.length} failed`);

    return new Response(
      JSON.stringify({ 
        message: "Stock alerts processed",
        sent: successCount,
        failed: failedEmails.length,
        failedEmails 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-stock-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
