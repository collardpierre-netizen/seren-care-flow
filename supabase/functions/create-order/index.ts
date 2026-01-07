import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
}

interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  shippingCost: number;
  subtotal: number;
  total: number;
  referralCode?: string | null;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { items, shippingAddress, shippingCost, subtotal, total, referralCode }: CreateOrderRequest = await req.json();
    logStep("Request parsed", { itemsCount: items.length });

    // Validate input
    if (!items || items.length === 0) {
      throw new Error("Le panier est vide");
    }

    if (!shippingAddress || !shippingAddress.email || !shippingAddress.firstName) {
      throw new Error("Adresse de livraison incomplète");
    }

    // Get user from auth header (optional - supports guest checkout)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      if (userData.user) {
        userId = userData.user.id;
        logStep("User authenticated", { userId });
      }
    }

    // Validate referral code if provided
    let validReferralCode: string | null = null;
    if (referralCode) {
      const { data: prescriber } = await supabaseAdmin
        .from("prescribers")
        .select("id, referral_code")
        .eq("referral_code", referralCode.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (prescriber) {
        validReferralCode = prescriber.referral_code;
        logStep("Referral code validated", { code: validReferralCode });
      }
    }

    // Validate product prices from database to prevent price manipulation
    const productIds = [...new Set(items.map(item => item.productId))];
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, price, subscription_price, name")
      .in("id", productIds);

    if (productsError) {
      logStep("Error fetching products", { error: productsError.message });
      throw new Error("Erreur lors de la validation des produits");
    }

    // Create product price map
    const productPriceMap = new Map(products?.map(p => [p.id, { price: p.price, subscriptionPrice: p.subscription_price, name: p.name }]));

    // Validate each item price
    let calculatedSubtotal = 0;
    const validatedItems = items.map(item => {
      const dbProduct = productPriceMap.get(item.productId);
      if (!dbProduct) {
        throw new Error(`Produit non trouvé: ${item.productId}`);
      }

      // Use database price, not client-provided price
      const itemPrice = item.isSubscription && dbProduct.subscriptionPrice 
        ? dbProduct.subscriptionPrice 
        : dbProduct.price;
      
      calculatedSubtotal += itemPrice * item.quantity;

      return {
        productId: item.productId,
        productName: dbProduct.name,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: itemPrice,
        size: item.size,
        isSubscription: item.isSubscription,
      };
    });

    // Verify subtotal matches (with small tolerance for rounding)
    if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
      logStep("Price mismatch detected", { calculated: calculatedSubtotal, provided: subtotal });
      // Use calculated subtotal for security
    }

    const finalTotal = calculatedSubtotal + shippingCost;
    const hasSubscription = items.some(item => item.isSubscription);

    // Generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `SC-${dateStr}-${random}`;

    logStep("Creating order", { orderNumber, finalTotal });

    // Create order with service role (bypasses RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        subtotal: calculatedSubtotal,
        shipping_fee: shippingCost,
        total: finalTotal,
        status: 'order_received',
        referral_code: validReferralCode,
        is_subscription_order: hasSubscription,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError) {
      logStep("Order creation error", { error: orderError.message });
      throw new Error("Erreur lors de la création de la commande");
    }

    logStep("Order created", { orderId: order.id });

    // Create order items atomically
    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_size: item.size || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      logStep("Order items creation error", { error: itemsError.message });
      // Rollback order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("Erreur lors de l'ajout des articles");
    }

    logStep("Order items created", { count: orderItems.length });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        total: finalTotal,
        items: validatedItems,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
