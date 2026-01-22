import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[MONTHLY-REPORT] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting monthly report generation");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");
    const resend = new Resend(resendKey);

    // Get current date info
    const now = new Date();
    const currentMonth = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Fetch all subscriptions with items
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from("subscriptions")
      .select(`
        id,
        user_id,
        status,
        created_at,
        subscription_items (quantity, unit_price)
      `);

    if (subsError) throw subsError;

    // Calculate KPIs
    const activeCount = subscriptions?.filter(s => s.status === "active").length || 0;
    const pausedCount = subscriptions?.filter(s => s.status === "paused").length || 0;
    const cancelledCount = subscriptions?.filter(s => s.status === "cancelled").length || 0;

    // Current MRR
    const currentMRR = subscriptions
      ?.filter(s => s.status === "active")
      .reduce((sum, sub) => {
        const items = sub.subscription_items as { quantity: number; unit_price: number }[] || [];
        return sum + items.reduce((t, item) => t + (item.unit_price * item.quantity), 0);
      }, 0) || 0;

    // New subscribers last month
    const newLastMonth = subscriptions?.filter(s => {
      const created = new Date(s.created_at);
      return created >= lastMonth && created <= lastMonthEnd;
    }).length || 0;

    // New subscribers two months ago (for comparison)
    const newTwoMonthsAgo = subscriptions?.filter(s => {
      const created = new Date(s.created_at);
      return created >= twoMonthsAgo && created < lastMonth;
    }).length || 0;

    // Growth percentage
    const growthPercent = newTwoMonthsAgo > 0 
      ? ((newLastMonth - newTwoMonthsAgo) / newTwoMonthsAgo * 100).toFixed(1)
      : newLastMonth > 0 ? "+100" : "0";

    // Churn rate (cancelled last month / active at start of last month)
    const cancelledLastMonth = subscriptions?.filter(s => {
      const created = new Date(s.created_at);
      return s.status === "cancelled" && created >= lastMonth && created <= lastMonthEnd;
    }).length || 0;

    const activeAtStartOfLastMonth = subscriptions?.filter(s => {
      const created = new Date(s.created_at);
      return created < lastMonth && s.status !== "cancelled";
    }).length || 1;

    const churnRate = ((cancelledLastMonth / activeAtStartOfLastMonth) * 100).toFixed(1);

    // Average subscription value
    const avgValue = activeCount > 0 ? (currentMRR / activeCount).toFixed(2) : "0";

    logStep("KPIs calculated", { 
      activeCount, pausedCount, cancelledCount, currentMRR, 
      newLastMonth, churnRate, avgValue 
    });

    // Get admin emails
    const { data: admins } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "manager"]);

    const adminIds = admins?.map(a => a.user_id) || [];
    
    const { data: adminProfiles } = await supabaseClient
      .from("profiles")
      .select("email")
      .in("id", adminIds);

    const adminEmails = adminProfiles?.map(p => p.email).filter(Boolean) || [];

    if (adminEmails.length === 0) {
      logStep("No admin emails found, skipping send");
      return new Response(
        JSON.stringify({ success: true, message: "No admin emails configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Send report email
    const { error: emailError } = await resend.emails.send({
      from: "SerenCare <rapports@serencare.be>",
      to: adminEmails,
      subject: `📊 Rapport mensuel abonnements - ${currentMonth}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 32px; text-align: center;">
            <img src="https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/email-assets/serencare-logo-email.png" alt="SerenCare" style="height: 40px;" />
            <h1 style="color: white; margin: 16px 0 0 0; font-size: 24px;">Rapport Mensuel Abonnements</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">${currentMonth}</p>
          </div>
          
          <div style="padding: 32px;">
            <!-- KPI Cards -->
            <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 32px;">
              <div style="flex: 1; min-width: 140px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">MRR</p>
                <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: bold; color: #1a365d;">${currentMRR.toFixed(0)} €</p>
              </div>
              <div style="flex: 1; min-width: 140px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">Abonnés actifs</p>
                <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: bold; color: #22c55e;">${activeCount}</p>
              </div>
              <div style="flex: 1; min-width: 140px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">Panier moyen</p>
                <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: bold; color: #1a365d;">${avgValue} €</p>
              </div>
            </div>

            <!-- Stats Table -->
            <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h2 style="margin: 0 0 20px 0; color: #1a365d; font-size: 18px;">Statistiques du mois</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px 0; color: #666;">Nouveaux abonnés</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #22c55e;">+${newLastMonth}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px 0; color: #666;">Croissance vs mois précédent</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; color: ${Number(growthPercent) >= 0 ? '#22c55e' : '#ef4444'};">${growthPercent}%</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px 0; color: #666;">Taux de churn</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; color: ${Number(churnRate) <= 5 ? '#22c55e' : '#ef4444'};">${churnRate}%</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px 0; color: #666;">Abonnements en pause</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #f59e0b;">${pausedCount}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666;">Abonnements annulés</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #ef4444;">${cancelledCount}</td>
                </tr>
              </table>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://seren-care-flow.lovable.app/admin/abonnements" 
                 style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); 
                        color: white; padding: 14px 32px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; display: inline-block;">
                Voir le tableau de bord complet
              </a>
            </div>
          </div>

          <div style="background: #1a365d; padding: 24px; text-align: center;">
            <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 12px;">
              Ce rapport est généré automatiquement le 1er de chaque mois.
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      logStep("Email error", { error: emailError });
      throw emailError;
    }

    logStep("Report sent successfully", { recipients: adminEmails.length });

    return new Response(
      JSON.stringify({ success: true, recipients: adminEmails.length }),
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
