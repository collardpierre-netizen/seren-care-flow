import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECKOUT-SUBSCRIPTION] ${step}${detailsStr}`);
};

const MIN_SUBSCRIPTION_TOTAL_CENTS = 6900; // 69€ TTC minimum

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

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
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { success_url, cancel_url } = await req.json();

    // Get user's subscription cart
    const { data: cart, error: cartError } = await supabase
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
          products (name)
        )
      `)
      .eq("user_id", user.id)
      .single();

    if (cartError || !cart) {
      throw new Error("Panier abonnement non trouvé");
    }

    const items = cart.subscription_cart_items || [];
    if (items.length === 0) {
      throw new Error("Votre panier abonnement est vide");
    }

    // Calculate total
    const totalCents = items.reduce((sum: number, item: any) => {
      return sum + (item.unit_price_cents * item.quantity);
    }, 0);

    logStep("Cart loaded", { itemCount: items.length, totalCents });

    if (totalCents < MIN_SUBSCRIPTION_TOTAL_CENTS) {
      return new Response(JSON.stringify({ 
        error: `Minimum 69€/mois TTC pour activer l'abonnement. Total actuel: ${(totalCents / 100).toFixed(2)}€`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check for existing active subscription
    const { data: existingSub } = await supabase
      .from("stripe_subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .single();

    if (existingSub) {
      return new Response(JSON.stringify({ 
        error: "Vous avez déjà un abonnement actif. Utilisez le portail client pour le gérer.",
        has_active_subscription: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get or create Stripe customer
    let customerId: string | undefined;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
      logStep("Found existing customer", { customerId });
    } else {
      // Check if customer exists in Stripe
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
      }
      
      // Save to profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      
      logStep("Customer created/found", { customerId });
    }

    // Build line items for Stripe subscription
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price: item.stripe_price_id,
      quantity: item.quantity,
    }));

    logStep("Line items prepared", { count: lineItems.length });

    const origin = req.headers.get("origin") || "https://serencare.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "subscription",
      success_url: success_url || `${origin}/compte?subscription=success`,
      cancel_url: cancel_url || `${origin}/abonnement?cancelled=true`,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      locale: "fr",
      metadata: {
        user_id: user.id,
        cart_id: cart.id,
        origin: origin,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
