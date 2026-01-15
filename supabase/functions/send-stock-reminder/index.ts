import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for stock reminder candidates...");

    // Find alerts that were notified 24+ hours ago
    // and where the product is still in stock
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get notified alerts from the past 24-48 hours (to avoid spamming)
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const { data: alerts, error: alertsError } = await supabase
      .from("stock_alerts")
      .select(`
        id,
        email,
        size,
        notified_at,
        unsubscribe_token,
        products (id, name, slug, stock_status)
      `)
      .eq("is_active", false)
      .not("notified_at", "is", null)
      .gte("notified_at", fortyEightHoursAgo.toISOString())
      .lte("notified_at", twentyFourHoursAgo.toISOString());

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      throw alertsError;
    }

    if (!alerts || alerts.length === 0) {
      console.log("No reminder candidates found");
      return new Response(
        JSON.stringify({ message: "No reminders to send", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${alerts.length} potential reminder candidates`);

    const siteUrl = Deno.env.get("SITE_URL") || "https://seren-care-flow.lovable.app";
    let successCount = 0;
    const failedEmails: string[] = [];
    const sentTo: string[] = [];

    for (const alert of alerts) {
      // Skip if product is no longer in stock
      const product = alert.products as any;
      if (!product || product.stock_status !== "in_stock") {
        console.log(`Skipping ${alert.email} - product not in stock anymore`);
        continue;
      }

      // Check if size is in stock (if size-specific alert)
      if (alert.size) {
        const { data: sizeData } = await supabase
          .from("product_sizes")
          .select("stock_quantity, is_active")
          .eq("product_id", product.id)
          .eq("size", alert.size)
          .single();

        if (!sizeData || !sizeData.is_active || (sizeData.stock_quantity !== null && sizeData.stock_quantity <= 0)) {
          console.log(`Skipping ${alert.email} - size ${alert.size} not in stock`);
          continue;
        }
      }

      // Skip if we already sent a reminder to this email for this product
      if (sentTo.includes(`${alert.email}-${product.id}`)) {
        continue;
      }

      try {
        const sizeText = alert.size ? ` (taille ${alert.size})` : "";
        const productUrl = `${siteUrl}/produit/${product.slug}`;
        const unsubscribeUrl = `${siteUrl}/desinscription-alerte?token=${alert.unsubscribe_token}`;

        const emailResult = await resend.emails.send({
          from: "SerenCare <notifications@serencare.be>",
          to: [alert.email],
          subject: `⏰ Rappel : ${product.name} est toujours disponible !`,
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
                      <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
                      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">
                        N'oubliez pas !
                      </h1>
                      <p style="color: #666; font-size: 16px; margin: 0;">
                        Le produit que vous attendiez est toujours disponible
                      </p>
                    </div>
                    
                    <!-- Product -->
                    <div style="background-color: #fef3c7; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
                      <h2 style="color: #92400e; font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">
                        ${product.name}${sizeText}
                      </h2>
                      <p style="color: #b45309; font-size: 14px; margin: 0;">
                        Encore en stock - Commandez avant qu'il ne soit trop tard !
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
                      Se désinscrire des rappels
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
          console.error(`Failed to send reminder to ${alert.email}:`, emailResult.error);
          failedEmails.push(alert.email);
        } else {
          console.log(`Reminder sent successfully to ${alert.email}`);
          sentTo.push(`${alert.email}-${product.id}`);
          successCount++;
        }
      } catch (emailError) {
        console.error(`Error sending reminder to ${alert.email}:`, emailError);
        failedEmails.push(alert.email);
      }
    }

    console.log(`Stock reminders processed: ${successCount} sent, ${failedEmails.length} failed`);

    return new Response(
      JSON.stringify({
        message: "Stock reminders processed",
        sent: successCount,
        failed: failedEmails.length,
        failedEmails,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-stock-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
