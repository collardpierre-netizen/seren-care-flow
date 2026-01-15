import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token manquant" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing unsubscribe for token: ${token}`);

    // Find and deactivate the stock alert
    const { data: alert, error: fetchError } = await supabase
      .from("stock_alerts")
      .select("id, email, product_id, products(name)")
      .eq("unsubscribe_token", token)
      .eq("is_active", true)
      .single();

    if (fetchError || !alert) {
      console.error("Alert not found or already unsubscribed:", fetchError);
      return new Response(
        JSON.stringify({ error: "Alerte non trouvée ou déjà désactivée" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Deactivate the alert
    const { error: updateError } = await supabase
      .from("stock_alerts")
      .update({ is_active: false })
      .eq("id", alert.id);

    if (updateError) {
      console.error("Error deactivating alert:", updateError);
      throw updateError;
    }

    console.log(`Successfully unsubscribed alert ${alert.id} for ${alert.email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Désinscription réussie",
        email: alert.email,
        productName: (alert as any).products?.name
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in unsubscribe-stock-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
