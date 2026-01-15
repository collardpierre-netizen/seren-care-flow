import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  type: "INSERT";
  table: "stock_notifications";
  record: {
    id: string;
    product_id: string;
    product_size: string | null;
    notification_type: string;
    message: string | null;
    created_at: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: WebhookPayload = await req.json();
    console.log("Received webhook payload:", payload);

    // Only process back_in_stock and size_back_in_stock notifications
    if (!["back_in_stock", "size_back_in_stock"].includes(payload.record.notification_type)) {
      console.log("Skipping non-restock notification type:", payload.record.notification_type);
      return new Response(
        JSON.stringify({ message: "Skipped - not a restock notification" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { product_id, product_size, notification_type } = payload.record;

    console.log(`Auto-sending stock alerts for product: ${product_id}, size: ${product_size || "all"}`);

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
      .select("id, email, size")
      .eq("product_id", product_id)
      .eq("is_active", true)
      .is("notified_at", null);

    // If it's a size-specific restock, get alerts for that size or no size specified
    if (product_size && notification_type === "size_back_in_stock") {
      alertsQuery = alertsQuery.or(`size.eq.${product_size},size.is.null`);
    }

    const { data: alerts, error: alertsError } = await alertsQuery;

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      console.log("No active alerts found for this product");
      
      // Mark the notification as processed anyway
      await supabase
        .from("stock_notifications")
        .update({ is_read: true, resolved_at: new Date().toISOString() })
        .eq("id", payload.record.id);
        
      return new Response(
        JSON.stringify({ message: "No alerts to send", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${alerts.length} alerts to process automatically`);

    const siteUrl = Deno.env.get("SITE_URL") || "https://seren-care-flow.lovable.app";
    const productUrl = `${siteUrl}/produit/${product.slug}`;
    let successCount = 0;
    const failedEmails: string[] = [];

    for (const alert of alerts) {
      try {
        const sizeText = alert.size ? ` (taille ${alert.size})` : "";
        
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
                        Est de nouveau disponible sur SerenCare
                      </p>
                    </div>
                    
                    <!-- CTA -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="${productUrl}" style="display: inline-block; background-color: #166534; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Voir le produit
                      </a>
                    </div>
                    
                    <!-- Footer -->
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
                        Vous recevez cet email car vous avez demandé à être alerté de la disponibilité de ce produit.
                      </p>
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} SerenCare. Tous droits réservés.
                      </p>
                    </div>
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
              is_active: false,
            })
            .eq("id", alert.id);

          successCount++;
        }
      } catch (emailError) {
        console.error(`Error sending email to ${alert.email}:`, emailError);
        failedEmails.push(alert.email);
      }
    }

    // Mark the notification as processed
    await supabase
      .from("stock_notifications")
      .update({ 
        is_read: true, 
        resolved_at: new Date().toISOString(),
        message: `Alertes automatiques envoyées: ${successCount}/${alerts.length} emails`
      })
      .eq("id", payload.record.id);

    console.log(`Auto stock alert complete. Sent: ${successCount}, Failed: ${failedEmails.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedEmails.length,
        failedEmails: failedEmails,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in auto-stock-alert:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
