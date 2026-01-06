import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { sessionId, orderId } = await req.json();
    logStep("Request parsed", { sessionId, orderId });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { 
      status: session.status, 
      paymentStatus: session.payment_status 
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update order status in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: "paid",
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      logStep("Order update error", { error: updateError.message });
      throw updateError;
    }

    logStep("Order updated to paid", { orderId: order.id, orderNumber: order.order_number });

    // Check if this order has subscription items and create subscription record
    const hasSubscription = session.metadata?.has_subscription === 'true';
    if (hasSubscription && order.user_id) {
      logStep("Creating subscription record");
      
      // Get order items for subscription
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      // Create subscription
      const nextDelivery = new Date();
      nextDelivery.setMonth(nextDelivery.getMonth() + 1);

      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: order.user_id,
          status: "active",
          frequency_days: 30,
          next_delivery_date: nextDelivery.toISOString().split('T')[0],
          shipping_address: order.shipping_address,
          referral_code: order.referral_code,
        })
        .select()
        .single();

      if (subError) {
        logStep("Subscription creation error", { error: subError.message });
      } else if (orderItems && subscription) {
        // Create subscription items
        const subItems = orderItems.map(item => ({
          subscription_id: subscription.id,
          product_id: item.product_id,
          product_size: item.product_size,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        await supabase.from("subscription_items").insert(subItems);
        logStep("Subscription created", { subscriptionId: subscription.id });

        // Update order with subscription reference
        await supabase
          .from("orders")
          .update({ subscription_id: subscription.id })
          .eq("id", orderId);
      }
    }

    // Handle prescriber commission if referral code exists
    if (order.referral_code) {
      const { data: prescriber } = await supabase
        .from("prescribers")
        .select("id, commission_rate")
        .eq("referral_code", order.referral_code)
        .eq("is_active", true)
        .single();

      if (prescriber) {
        const commissionAmount = order.subtotal * (prescriber.commission_rate / 100);
        
        await supabase.from("commissions").insert({
          prescriber_id: prescriber.id,
          order_id: orderId,
          amount: commissionAmount,
          status: "pending",
        });
        
        // Update order with prescriber reference
        await supabase
          .from("orders")
          .update({ prescriber_id: prescriber.id })
          .eq("id", orderId);

        logStep("Commission created", { 
          prescriberId: prescriber.id, 
          amount: commissionAmount 
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      orderNumber: order.order_number,
      status: order.status 
    }), {
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
