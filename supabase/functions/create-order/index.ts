import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://esm.sh/zod@3.23.8";

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

const CartItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(300),
  productImage: z.string().max(2000).optional().nullable(),
  quantity: z.number().int().positive().max(999),
  unitPrice: z.number().nonnegative().max(100000),
  subscriptionPrice: z.number().nonnegative().max(100000).optional().nullable(),
  size: z.string().max(100).optional().nullable(),
  isSubscription: z.boolean(),
});

const ShippingAddressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(1).max(40),
  address: z.string().min(1).max(300),
  postalCode: z.string().min(1).max(20),
  city: z.string().min(1).max(120),
  country: z.string().min(1).max(100),
});

const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(100),
  shippingAddress: ShippingAddressSchema,
  shippingCost: z.number().nonnegative().max(10000),
  subtotal: z.number().nonnegative().max(1000000),
  total: z.number().nonnegative().max(1000000),
  referralCode: z.string().max(50).optional().nullable(),
});

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

    // Parse and validate request body
    const parsed = CreateOrderSchema.safeParse(await req.json());
    if (!parsed.success) {
      logStep("Validation failed", parsed.error.flatten().fieldErrors);
      return new Response(
        JSON.stringify({ success: false, error: "Données de commande invalides", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { items, shippingAddress, shippingCost, subtotal, total, referralCode } =
      parsed.data as unknown as CreateOrderRequest;
    logStep("Request parsed", { itemsCount: items.length });

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
