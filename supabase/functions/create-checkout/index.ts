import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subscriptionPrice?: number;
  size?: string;
  isSubscription: boolean;
}

interface CheckoutRequest {
  items: CartItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };
  shippingCost: number;
  referralCode?: string;
  orderId: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { items, shippingAddress, shippingCost, referralCode, orderId }: CheckoutRequest = await req.json();
    logStep("Request parsed", { itemsCount: items.length, orderId });

    // Check for authenticated user (optional for guest checkout)
    let userId = null;
    let userEmail = shippingAddress.email;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user) {
        userId = data.user.id;
        userEmail = data.user.email || shippingAddress.email;
        logStep("User authenticated", { userId, email: userEmail });
      }
    }

    // Check if customer exists in Stripe
    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Separate one-time items from subscription items
    const oneTimeItems = items.filter(item => !item.isSubscription);
    const subscriptionItems = items.filter(item => item.isSubscription);
    
    logStep("Items categorized", { 
      oneTimeCount: oneTimeItems.length, 
      subscriptionCount: subscriptionItems.length 
    });

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Helper to validate and fix image URLs
    const getValidImageUrl = (imageUrl: string | undefined): string[] | undefined => {
      if (!imageUrl) return undefined;
      // Skip placeholder images and relative URLs
      if (imageUrl.includes('placeholder') || imageUrl.startsWith('/')) {
        return undefined;
      }
      // Only use absolute URLs
      try {
        new URL(imageUrl);
        return [imageUrl];
      } catch {
        return undefined;
      }
    };

    // Add one-time items
    for (const item of oneTimeItems) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.productName + (item.size ? ` - Taille ${item.size}` : ''),
            images: getValidImageUrl(item.productImage),
            metadata: {
              product_id: item.productId,
              size: item.size || '',
            },
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      });
    }

    // Add subscription items as one-time for now (mixed cart handling)
    // Note: For pure subscriptions, we could use mode: "subscription"
    for (const item of subscriptionItems) {
      const price = item.subscriptionPrice || item.unitPrice;
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.productName + (item.size ? ` - Taille ${item.size}` : '') + ' (Abonnement)',
            description: 'Livraison mensuelle automatique avec -10%',
            images: getValidImageUrl(item.productImage),
            metadata: {
              product_id: item.productId,
              size: item.size || '',
              is_subscription: 'true',
            },
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Add shipping as a line item if not free
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Frais de livraison",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    logStep("Line items created", { count: lineItems.length });

    // Create checkout session
    const origin = req.headers.get("origin") || "https://serencare.lovable.app";
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/commande-confirmee?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      payment_method_types: ["card", "bancontact"],
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["BE", "FR", "LU", "NL", "DE"],
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        order_id: orderId,
        referral_code: referralCode || '',
        has_subscription: subscriptionItems.length > 0 ? 'true' : 'false',
      },
      locale: "fr",
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Update order with Stripe session ID
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("orders")
      .update({ stripe_payment_intent_id: session.id })
      .eq("id", orderId);
    
    logStep("Order updated with session ID");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
