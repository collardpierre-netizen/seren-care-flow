import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Non autorisé");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !adminUser) {
      throw new Error("Non autorisé");
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id);

    const isAdmin = roles?.some(r => r.role === "admin");
    if (!isAdmin) {
      throw new Error("Accès refusé - droits administrateur requis");
    }

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error("ID utilisateur requis");
    }

    // Prevent self-deletion
    if (user_id === adminUser.id) {
      throw new Error("Vous ne pouvez pas supprimer votre propre compte");
    }

    // Delete user from auth (this will cascade to profiles via trigger if set up)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user_id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }

    // Clean up related data that might not cascade
    // Delete from profiles (should cascade but let's be sure)
    await supabase.from("profiles").delete().eq("id", user_id);
    
    // Delete from user_roles
    await supabase.from("user_roles").delete().eq("user_id", user_id);

    // Delete from subscriptions
    await supabase.from("subscriptions").delete().eq("user_id", user_id);

    // Delete from subscription_carts
    await supabase.from("subscription_carts").delete().eq("user_id", user_id);

    // Delete from cart_items
    await supabase.from("cart_items").delete().eq("user_id", user_id);

    return new Response(
      JSON.stringify({ success: true, message: "Utilisateur supprimé avec succès" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
