import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[SUBSCRIPTION-REMINDER] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting subscription reminder job");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");
    const resend = new Resend(resendKey);

    // Find paused subscriptions older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: pausedSubs, error: subsError } = await supabaseClient
      .from("subscriptions")
      .select("id, user_id, status, created_at, updated_at")
      .eq("status", "paused")
      .lt("updated_at", thirtyDaysAgo.toISOString());

    if (subsError) throw subsError;
    logStep("Found paused subscriptions", { count: pausedSubs?.length || 0 });

    // Get profiles for these subscriptions
    const userIds = [...new Set(pausedSubs?.map(s => s.user_id).filter(Boolean))];
    const { data: profiles } = await supabaseClient
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]));

    let sentCount = 0;
    let skippedCount = 0;

    for (const sub of pausedSubs || []) {
      // Check if we already sent a reminder for this subscription
      const { data: existingReminder } = await supabaseClient
        .from("subscription_reminders")
        .select("id")
        .eq("subscription_id", sub.id)
        .eq("reminder_type", "paused_30d")
        .single();

      if (existingReminder) {
        skippedCount++;
        continue;
      }

      const profile = profileMap.get(sub.user_id);
      if (!profile?.email) {
        logStep("Skipping subscription - no email", { subId: sub.id });
        continue;
      }

      const firstName = profile.first_name || "Cher client";

      // Send reminder email
      const { error: emailError } = await resend.emails.send({
        from: "SerenCare <notifications@serencare.be>",
        to: [profile.email],
        subject: "Votre abonnement SerenCare vous attend 💙",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 24px; text-align: center;">
              <img src="https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/email-assets/serencare-logo-email.png" alt="SerenCare" style="height: 40px;" />
            </div>
            <div style="padding: 32px 24px; background: #ffffff;">
              <h1 style="color: #1a365d; margin: 0 0 24px 0;">Bonjour ${firstName},</h1>
              <p style="margin: 0 0 16px 0; line-height: 1.6; color: #333;">
                Nous avons remarqué que votre abonnement est en pause depuis plus de 30 jours.
              </p>
              <p style="margin: 0 0 16px 0; line-height: 1.6; color: #333;">
                Nous espérons que tout va bien ! Si vous avez mis votre abonnement en pause pour une raison particulière, 
                n'hésitez pas à nous contacter. Notre équipe est là pour vous aider.
              </p>
              <p style="margin: 0 0 24px 0; line-height: 1.6; color: #333;">
                Réactivez votre abonnement en un clic pour continuer à recevoir vos produits préférés.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://seren-care-flow.lovable.app/mon-compte" 
                   style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); 
                          color: white; padding: 14px 32px; text-decoration: none; 
                          border-radius: 8px; font-weight: 600; display: inline-block;">
                  Réactiver mon abonnement
                </a>
              </div>
              <p style="margin: 24px 0 0 0; line-height: 1.6; color: #666; font-size: 14px;">
                Vous avez des questions ? Répondez directement à cet email ou contactez-nous à 
                <a href="mailto:contact@serencare.be" style="color: #1a365d;">contact@serencare.be</a>
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 24px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0;">SerenCare - Votre partenaire bien-être</p>
            </div>
          </div>
        `,
      });

      if (emailError) {
        logStep("Email error", { subId: sub.id, error: emailError });
        continue;
      }

      // Record the reminder
      await supabaseClient.from("subscription_reminders").insert({
        subscription_id: sub.id,
        reminder_type: "paused_30d",
        email_sent_to: profile.email,
      });

      sentCount++;
      logStep("Reminder sent", { subId: sub.id, email: profile.email });
    }

    logStep("Job completed", { sent: sentCount, skipped: skippedCount });

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, skipped: skippedCount }),
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
