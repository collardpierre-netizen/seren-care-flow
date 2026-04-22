import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

const getOrderConfirmationEmail = (data: {
  firstName: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number; size?: string }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: any;
  hasSubscription: boolean;
}) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5;">
        <strong>${item.name}</strong>${item.size ? ` - Taille ${item.size}` : ''}
        <br><span style="color: #6B7280; font-size: 14px;">Qté: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E5E5; text-align: right; font-weight: 600;">
        ${(item.price * item.quantity).toFixed(2)} €
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F7F6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); padding: 40px 40px 30px; text-align: center;">
                  <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700;">SerenCare</h1>
                  <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">Votre bien-être, notre priorité</p>
                </td>
              </tr>
              
              <!-- Success Icon -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <div style="width: 80px; height: 80px; background-color: #E8F5E9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">✓</span>
                  </div>
                  <h2 style="color: #2D5A4A; font-size: 24px; margin: 0 0 10px;">Merci pour votre commande !</h2>
                  <p style="color: #6B7280; font-size: 16px; margin: 0;">Bonjour ${data.firstName},</p>
                </td>
              </tr>
              
              <!-- Order Number -->
              <tr>
                <td style="padding: 0 40px 30px; text-align: center;">
                  <div style="background-color: #F5F7F6; border-radius: 12px; padding: 20px; display: inline-block;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 5px;">Numéro de commande</p>
                    <p style="color: #2D5A4A; font-size: 24px; font-weight: 700; margin: 0; font-family: monospace;">${data.orderNumber}</p>
                  </div>
                </td>
              </tr>
              
              <!-- Order Items -->
              <tr>
                <td style="padding: 0 40px 30px;">
                  <h3 style="color: #2D5A4A; font-size: 18px; margin: 0 0 15px; border-bottom: 2px solid #2D5A4A; padding-bottom: 10px;">Récapitulatif de votre commande</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${itemsHtml}
                    <tr>
                      <td style="padding: 15px 0 5px; color: #6B7280;">Sous-total</td>
                      <td style="padding: 15px 0 5px; text-align: right; color: #6B7280;">${data.subtotal.toFixed(2)} €</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #6B7280;">Livraison</td>
                      <td style="padding: 5px 0; text-align: right; color: #6B7280;">${data.shipping === 0 ? 'Gratuite' : data.shipping.toFixed(2) + ' €'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 15px 0; border-top: 2px solid #2D5A4A; font-size: 18px; font-weight: 700; color: #2D5A4A;">Total</td>
                      <td style="padding: 15px 0; border-top: 2px solid #2D5A4A; text-align: right; font-size: 18px; font-weight: 700; color: #2D5A4A;">${data.total.toFixed(2)} €</td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              ${data.hasSubscription ? `
              <!-- Subscription Info -->
              <tr>
                <td style="padding: 0 40px 30px;">
                  <div style="background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #F9A825;">
                    <h4 style="color: #F57F17; font-size: 16px; margin: 0 0 10px;">🔄 Abonnement activé</h4>
                    <p style="color: #5D4037; font-size: 14px; margin: 0;">Votre abonnement mensuel est maintenant actif. Vous recevrez automatiquement vos produits chaque mois avec 15% de réduction.</p>
                  </div>
                </td>
              </tr>
              ` : ''}
              
              <!-- Shipping Address -->
              <tr>
                <td style="padding: 0 40px 30px;">
                  <h3 style="color: #2D5A4A; font-size: 18px; margin: 0 0 15px;">Adresse de livraison</h3>
                  <div style="background-color: #F5F7F6; border-radius: 12px; padding: 20px;">
                    <p style="margin: 0; color: #374151; line-height: 1.6;">
                      ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
                      ${data.shippingAddress.address}<br>
                      ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
                      ${data.shippingAddress.country}
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 40px 40px; text-align: center;">
                  <a href="https://serencare.lovable.app/compte" style="display: inline-block; background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                    Suivre ma commande
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F5F7F6; padding: 30px 40px; text-align: center;">
                  <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px;">Des questions sur votre commande ?</p>
                  <p style="color: #2D5A4A; font-size: 14px; margin: 0;">
                    <a href="mailto:orders@serencare.be" style="color: #2D5A4A; text-decoration: none;">orders@serencare.be</a> |
                    <a href="tel:+32123456789" style="color: #2D5A4A; text-decoration: none;">+32 123 456 789</a>
                  </p>
                  <p style="color: #9CA3AF; font-size: 12px; margin: 20px 0 0;">
                    © ${new Date().getFullYear()} SerenCare. Tous droits réservés.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
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

    if (!sessionId || !orderId || typeof sessionId !== "string" || typeof orderId !== "string") {
      return new Response(JSON.stringify({ success: false, error: "sessionId and orderId required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { 
      status: session.status, 
      paymentStatus: session.payment_status,
      metadataOrderId: session.metadata?.order_id,
    });

    // CRITICAL: ensure the Stripe session was actually created for this order.
    // Without this check, an attacker could pay for a cheap order and use that
    // session to confirm any other order (payment bypass).
    if (session.metadata?.order_id !== orderId) {
      logStep("Session/order mismatch", {
        expected: orderId,
        gotInSession: session.metadata?.order_id,
      });
      return new Response(JSON.stringify({
        success: false,
        error: "Session does not match this order",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

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
        status: "payment_confirmed",
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

    // Update user profile with shipping address from order if user is logged in
    if (order.user_id && order.shipping_address) {
      const addr = order.shipping_address as any;
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          first_name: addr.firstName || undefined,
          last_name: addr.lastName || undefined,
          phone: addr.phone || undefined,
          address_line1: addr.address || undefined,
          postal_code: addr.postalCode || undefined,
          city: addr.city || undefined,
          country: addr.country || undefined,
        })
        .eq("id", order.user_id);
      
      if (profileUpdateError) {
        logStep("Profile update warning", { error: profileUpdateError.message });
      } else {
        logStep("Profile updated with shipping address", { userId: order.user_id });
      }
    }

    // Get order items for email
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    // Check if this order has subscription items and create subscription record
    const hasSubscription = session.metadata?.has_subscription === 'true';
    if (hasSubscription && order.user_id) {
      logStep("Creating subscription record");

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
        // Filter only subscription items (those with "(Abonnement)" in name or is_subscription order)
        // Since we can't know for sure which items are subscription from order_items,
        // we need to check the product name which includes "(Abonnement)" suffix
        const subscriptionOrderItems = orderItems.filter(item => 
          item.product_name?.includes('(Abonnement)') || item.product_name?.includes('Abonnement')
        );

        if (subscriptionOrderItems.length > 0) {
          const subItems = subscriptionOrderItems.map(item => ({
            subscription_id: subscription.id,
            product_id: item.product_id,
            product_size: item.product_size,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }));

          await supabase.from("subscription_items").insert(subItems);
          logStep("Subscription items created", { count: subItems.length, subscriptionId: subscription.id });
        } else {
          logStep("No subscription items found in order, adding all items to subscription");
          // Fallback: if no items have (Abonnement) in name, add all items (legacy behavior)
          const subItems = orderItems.map(item => ({
            subscription_id: subscription.id,
            product_id: item.product_id,
            product_size: item.product_size,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }));
          await supabase.from("subscription_items").insert(subItems);
        }

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

    // Send confirmation email
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey && order.shipping_address) {
      try {
        const resend = new Resend(resendKey);
        const shippingAddress = order.shipping_address as any;
        
        const emailHtml = getOrderConfirmationEmail({
          firstName: shippingAddress.firstName || 'Client',
          orderNumber: order.order_number,
          items: orderItems?.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
            size: item.product_size,
          })) || [],
          subtotal: order.subtotal,
          shipping: order.shipping_fee || 0,
          total: order.total,
          shippingAddress,
          hasSubscription,
        });

        await resend.emails.send({
          from: "SerenCare <orders@serencare.be>",
          to: [shippingAddress.email],
          subject: `Confirmation de commande ${order.order_number} - SerenCare`,
          html: emailHtml,
        });

        logStep("Confirmation email sent", { email: shippingAddress.email });

        // Send notification to the team
        const notificationHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F7F6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F6; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <tr>
                      <td style="background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; font-size: 24px; margin: 0;">🛒 Nouvelle commande !</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px;">
                        <h2 style="color: #2D5A4A; margin: 0 0 20px;">Commande ${order.order_number}</h2>
                        
                        <div style="background-color: #F5F7F6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                          <h3 style="color: #2D5A4A; margin: 0 0 15px; font-size: 16px;">📦 Client</h3>
                          <p style="margin: 0; color: #374151; line-height: 1.6;">
                            <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br>
                            ${shippingAddress.email}<br>
                            ${shippingAddress.phone || 'Non renseigné'}
                          </p>
                        </div>
                        
                        <div style="background-color: #F5F7F6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                          <h3 style="color: #2D5A4A; margin: 0 0 15px; font-size: 16px;">📍 Adresse de livraison</h3>
                          <p style="margin: 0; color: #374151; line-height: 1.6;">
                            ${shippingAddress.address}<br>
                            ${shippingAddress.postalCode} ${shippingAddress.city}<br>
                            ${shippingAddress.country}
                          </p>
                        </div>
                        
                        <div style="background-color: #E8F5E9; border-radius: 12px; padding: 20px; border-left: 4px solid #2D5A4A;">
                          <h3 style="color: #2D5A4A; margin: 0 0 10px; font-size: 16px;">💰 Montant</h3>
                          <p style="margin: 0; color: #2D5A4A; font-size: 24px; font-weight: bold;">${order.total.toFixed(2)} €</p>
                          ${hasSubscription ? '<p style="margin: 10px 0 0; color: #F57F17; font-size: 14px;">🔄 Inclut un abonnement</p>' : ''}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #F5F7F6; padding: 20px; text-align: center;">
                        <a href="https://serencare.lovable.app/admin/orders" style="display: inline-block; background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 600;">Voir la commande</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: "SerenCare <orders@serencare.be>",
          to: ["orders@serencare.be"],
          subject: `🛒 Nouvelle commande ${order.order_number} - ${order.total.toFixed(2)} €`,
          html: notificationHtml,
        });

        logStep("Team notification email sent");
      } catch (emailError) {
        logStep("Email sending failed", { error: emailError instanceof Error ? emailError.message : String(emailError) });
        // Don't throw - email failure shouldn't break the payment flow
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
