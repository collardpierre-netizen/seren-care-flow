import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[SCHEDULED-EMAILS] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting scheduled email processing");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");
    const resend = new Resend(resendKey);

    // Find pending emails that are due
    const now = new Date().toISOString();
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from("scheduled_emails")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;
    logStep("Found pending emails", { count: pendingEmails?.length || 0 });

    let processedCount = 0;
    let errorCount = 0;

    for (const email of pendingEmails || []) {
      try {
        const recipients = email.recipient_emails as string[];
        
        if (recipients.length === 0) {
          logStep("No recipients for email", { id: email.id });
          await supabaseClient
            .from("scheduled_emails")
            .update({ status: "failed", error_message: "No recipients" })
            .eq("id", email.id);
          errorCount++;
          continue;
        }

        // Send to each recipient
        let sentCount = 0;
        let failedRecipients: string[] = [];

        for (const recipient of recipients) {
          const { error: sendError } = await resend.emails.send({
            from: "SerenCare <notifications@serencare.be>",
            to: [recipient],
            subject: email.subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 24px; text-align: center;">
                  <img src="https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/email-assets/serencare-logo-email.png" alt="SerenCare" style="height: 40px;" />
                </div>
                <div style="padding: 32px 24px; background: #ffffff;">
                  ${email.message.split('\n').map((p: string) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #333;">${p}</p>`).join('')}
                </div>
                <div style="background: #f8f9fa; padding: 24px; text-align: center; font-size: 12px; color: #666;">
                  <p style="margin: 0;">SerenCare - Votre partenaire bien-être</p>
                </div>
              </div>
            `,
          });

          if (sendError) {
            logStep("Failed to send to recipient", { recipient, error: sendError });
            failedRecipients.push(recipient);
          } else {
            sentCount++;
          }
        }

        // Update email status
        if (sentCount === recipients.length) {
          await supabaseClient
            .from("scheduled_emails")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", email.id);
          processedCount++;
        } else if (sentCount > 0) {
          await supabaseClient
            .from("scheduled_emails")
            .update({ 
              status: "sent", 
              sent_at: new Date().toISOString(),
              error_message: `Failed for: ${failedRecipients.join(", ")}`
            })
            .eq("id", email.id);
          processedCount++;
        } else {
          await supabaseClient
            .from("scheduled_emails")
            .update({ status: "failed", error_message: "All sends failed" })
            .eq("id", email.id);
          errorCount++;
        }

        logStep("Email processed", { id: email.id, sent: sentCount, failed: failedRecipients.length });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        await supabaseClient
          .from("scheduled_emails")
          .update({ status: "failed", error_message: msg })
          .eq("id", email.id);
        errorCount++;
        logStep("Email processing error", { id: email.id, error: msg });
      }
    }

    logStep("Job completed", { processed: processedCount, errors: errorCount });

    return new Response(
      JSON.stringify({ success: true, processed: processedCount, errors: errorCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logStep("Error", { message });
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
