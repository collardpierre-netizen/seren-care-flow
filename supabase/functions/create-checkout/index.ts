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

    if (!Array.isArray(items) || items.length === 0 || !orderId) {
      return new Response(JSON.stringify({ error: "items and orderId required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

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

    // CRITICAL: never trust client-supplied prices. Resolve authoritative
    // prices from the database for every line item before creating the
    // Stripe session, otherwise a malicious client could pay $0.01 for an
    // expensive order.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const productIds = Array.from(new Set(items.map(i => i.productId)));
    const { data: dbProducts, error: dbProductsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, subscription_price, subscription_discount_percent, is_active, is_subscription_eligible")
      .in("id", productIds);

    if (dbProductsError || !dbProducts) {
      logStep("Failed to load products for pricing", { error: dbProductsError?.message });
      return new Response(JSON.stringify({ error: "Pricing lookup failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { data: dbSizes } = await supabaseAdmin
      .from("product_sizes")
      .select("product_id, size, price_adjustment, sale_price, is_active")
      .in("product_id", productIds);

    const productsById = new Map(dbProducts.map(p => [p.id, p]));
    const sizeKey = (productId: string, size: string | undefined) => `${productId}::${size ?? ""}`;
    const sizesByKey = new Map(
      (dbSizes ?? []).map(s => [sizeKey(s.product_id, s.size), s])
    );

    const resolvePrice = (item: CartItem): { unitAmountCents: number; productName: string } | null => {
      const product = productsById.get(item.productId);
      if (!product || !product.is_active) return null;

      const sizeRow = item.size ? sizesByKey.get(sizeKey(item.productId, item.size)) : undefined;
      // Sale price (per size) takes priority, otherwise product.price plus
      // optional size-level adjustment.
      let basePrice: number;
      if (sizeRow?.sale_price != null && Number(sizeRow.sale_price) > 0) {
        basePrice = Number(sizeRow.sale_price);
      } else {
        basePrice = Number(product.price) + Number(sizeRow?.price_adjustment ?? 0);
      }

      let finalPrice = basePrice;
      if (item.isSubscription) {
        if (!product.is_subscription_eligible) return null;
        if (product.subscription_price != null && Number(product.subscription_price) > 0) {
          finalPrice = Number(product.subscription_price);
        } else {
          const discount = Number(product.subscription_discount_percent ?? 10);
          finalPrice = basePrice * (1 - discount / 100);
        }
      }

      const unitAmountCents = Math.round(finalPrice * 100);
      if (!Number.isFinite(unitAmountCents) || unitAmountCents <= 0) return null;

      return { unitAmountCents, productName: product.name };
    };

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

    // Add one-time items (server-side authoritative pricing)
    for (const item of oneTimeItems) {
      const resolved = resolvePrice(item);
      if (!resolved) {
        logStep("Skipping invalid one-time item", { productId: item.productId, size: item.size });
        return new Response(JSON.stringify({ error: `Invalid product: ${item.productId}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: resolved.productName + (item.size ? ` - Taille ${item.size}` : ''),
            images: getValidImageUrl(item.productImage),
            metadata: {
              product_id: item.productId,
              size: item.size || '',
            },
          },
          unit_amount: resolved.unitAmountCents,
        },
        quantity: item.quantity,
      });
    }

    // Add subscription items as one-time for now (mixed cart handling)
    // Note: For pure subscriptions, we could use mode: "subscription"
    for (const item of subscriptionItems) {
      const resolved = resolvePrice(item);
      if (!resolved) {
        logStep("Skipping invalid subscription item", { productId: item.productId, size: item.size });
        return new Response(JSON.stringify({ error: `Invalid subscription product: ${item.productId}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: resolved.productName + (item.size ? ` - Taille ${item.size}` : '') + ' (Abonnement)',
            description: 'Livraison mensuelle automatique avec -10%',
            images: getValidImageUrl(item.productImage),
            metadata: {
              product_id: item.productId,
              size: item.size || '',
              is_subscription: 'true',
            },
          },
          unit_amount: resolved.unitAmountCents,
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
