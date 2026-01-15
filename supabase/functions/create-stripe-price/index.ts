import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-PRICE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .in("role", ["admin", "manager"]);

    if (!roles || roles.length === 0) {
      throw new Error("Admin access required");
    }

    logStep("Admin verified", { userId: userData.user.id });

    const body = await req.json();
    const { product_id, product_size, price_cents } = body;

    if (!product_id || !price_cents) {
      throw new Error("product_id and price_cents are required");
    }

    logStep("Request data", { product_id, product_size, price_cents });

    // Get product info
    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select("id, name, slug, price, subscription_price")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    logStep("Product found", { name: product.name });

    // Check if mapping already exists
    const { data: existingMapping } = await supabaseClient
      .from("stripe_price_map")
      .select("id, stripe_price_id")
      .eq("product_id", product_id)
      .eq("product_size", product_size || null)
      .eq("type", "subscription")
      .maybeSingle();

    if (existingMapping?.stripe_price_id) {
      logStep("Mapping already exists", { stripe_price_id: existingMapping.stripe_price_id });
      return new Response(
        JSON.stringify({ 
          success: true, 
          stripe_price_id: existingMapping.stripe_price_id,
          message: "Mapping already exists"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create Stripe price
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create or find Stripe product
    const productName = product_size 
      ? `${product.name} - ${product_size} (Abonnement)`
      : `${product.name} (Abonnement)`;

    logStep("Creating Stripe product", { productName });

    const stripeProduct = await stripe.products.create({
      name: productName,
      metadata: {
        serencare_product_id: product_id,
        serencare_product_size: product_size || "",
        serencare_slug: product.slug,
      },
    });

    logStep("Stripe product created", { stripeProductId: stripeProduct.id });

    // Create recurring price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: price_cents,
      currency: "eur",
      recurring: {
        interval: "month",
      },
      metadata: {
        serencare_product_id: product_id,
        serencare_product_size: product_size || "",
      },
    });

    logStep("Stripe price created", { stripePriceId: stripePrice.id });

    // Save mapping in Supabase
    const { error: insertError } = await supabaseClient
      .from("stripe_price_map")
      .upsert({
        product_id,
        product_size: product_size || null,
        stripe_price_id: stripePrice.id,
        type: "subscription",
        unit_amount: price_cents,
        currency: "eur",
        is_active: true,
      }, {
        onConflict: "product_id,product_size,type",
      });

    if (insertError) {
      logStep("Error saving mapping", { error: insertError.message });
      throw new Error("Failed to save mapping: " + insertError.message);
    }

    logStep("Mapping saved successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        stripe_price_id: stripePrice.id,
        stripe_product_id: stripeProduct.id,
        message: "Stripe price created successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
