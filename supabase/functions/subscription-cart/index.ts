import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-CART] ${step}${detailsStr}`);
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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const url = new URL(req.url);
    const method = req.method;

    // GET - Retrieve cart
    if (method === "GET") {
      logStep("GET cart", { userId: user.id });

      // Get or create cart
      let { data: cart, error: cartError } = await supabase
        .from("subscription_carts")
        .select(`
          id,
          subscription_cart_items (
            id,
            product_id,
            product_size,
            quantity,
            unit_price_cents,
            stripe_price_id,
            products (id, name, slug, price, subscription_price, product_images(image_url, is_primary))
          )
        `)
        .eq("user_id", user.id)
        .single();

      if (cartError && cartError.code === "PGRST116") {
        // Cart doesn't exist, create it
        const { data: newCart, error: createError } = await supabase
          .from("subscription_carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();

        if (createError) throw createError;
        cart = { id: newCart.id, subscription_cart_items: [] };
      } else if (cartError) {
        throw cartError;
      }

      const items = cart?.subscription_cart_items || [];
      const totalCents = items.reduce((sum: number, item: any) => {
        return sum + (item.unit_price_cents * item.quantity);
      }, 0);

      return new Response(JSON.stringify({
        cart_id: cart?.id,
        items: items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_size: item.product_size,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          stripe_price_id: item.stripe_price_id,
          product: item.products,
        })),
        total_cents: totalCents,
        total_formatted: `${(totalCents / 100).toFixed(2)}€`,
        minimum_cents: 6900,
        is_valid: totalCents >= 6900,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST - Add/update item
    if (method === "POST") {
      const { product_id, product_size, quantity } = await req.json();
      logStep("POST add item", { product_id, product_size, quantity });

      if (!product_id || !quantity) {
        throw new Error("product_id and quantity are required");
      }

      // Get or create cart
      let { data: cart } = await supabase
        .from("subscription_carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from("subscription_carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();
        if (createError) throw createError;
        cart = newCart;
      }

      // Get stripe price for this product
      const { data: priceMap, error: priceError } = await supabase
        .from("stripe_price_map")
        .select("stripe_price_id, unit_amount")
        .eq("product_id", product_id)
        .eq("type", "subscription")
        .eq("is_active", true)
        .maybeSingle();

      if (!priceMap) {
        // Fall back to product subscription price if no Stripe price exists
        const { data: product } = await supabase
          .from("products")
          .select("subscription_price, price")
          .eq("id", product_id)
          .single();

        if (!product) throw new Error("Produit non trouvé");

        const priceCents = Math.round((product.subscription_price || product.price) * 100);
        
        // For now, we'll need to create Stripe prices dynamically or require admin setup
        throw new Error("Ce produit n'a pas encore de prix d'abonnement Stripe configuré. Contactez l'administrateur.");
      }

      // Upsert cart item
      const { error: upsertError } = await supabase
        .from("subscription_cart_items")
        .upsert({
          cart_id: cart.id,
          product_id,
          product_size: product_size || null,
          quantity,
          unit_price_cents: priceMap.unit_amount,
          stripe_price_id: priceMap.stripe_price_id,
        }, {
          onConflict: "cart_id,product_id,product_size",
        });

      if (upsertError) throw upsertError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE - Remove item
    if (method === "DELETE") {
      const { product_id, product_size } = await req.json();
      logStep("DELETE item", { product_id, product_size });

      const { data: cart } = await supabase
        .from("subscription_carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!cart) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let query = supabase
        .from("subscription_cart_items")
        .delete()
        .eq("cart_id", cart.id)
        .eq("product_id", product_id);

      if (product_size) {
        query = query.eq("product_size", product_size);
      } else {
        query = query.is("product_size", null);
      }

      const { error: deleteError } = await query;
      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Method not allowed");

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
