import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Helper function to send emails via the send-email edge function
async function sendEmail(
  supabaseUrl: string,
  serviceRoleKey: string,
  template: string,
  to: string,
  data: Record<string, unknown>
) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ to, template, data }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      logStep("Email send failed", { template, to, error });
    } else {
      logStep("Email sent successfully", { template, to });
    }
  } catch (error) {
    logStep("Email send error", { template, to, error: String(error) });
  }
}

serve(async (req) => {
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No stripe-signature header");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { 
          mode: session.mode, 
          customerId: session.customer,
          subscriptionId: session.subscription 
        });

        if (session.mode === "subscription") {
          // Handle subscription checkout
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = session.metadata?.user_id;

          if (userId) {
            // Create/update stripe_subscriptions
            await supabase
              .from("stripe_subscriptions")
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionId,
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
              }, {
                onConflict: "stripe_subscription_id",
              });

            // Update profile with stripe_customer_id
            const isActive = ["active", "trialing"].includes(subscription.status);
            await supabase
              .from("profiles")
              .update({
                is_member_active: isActive,
                subscription_status: subscription.status,
                subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                stripe_customer_id: session.customer as string,
              })
              .eq("id", userId);

            // Clear subscription cart after successful checkout
            const cartId = session.metadata?.cart_id;
            if (cartId) {
              await supabase
                .from("subscription_cart_items")
                .delete()
                .eq("cart_id", cartId);
            }

            logStep("Subscription activated", { userId, subscriptionId, status: subscription.status });

            // Fetch user email to send confirmation
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, first_name")
              .eq("id", userId)
              .single();

            if (profile?.email) {
              const nextDeliveryDate = new Date(subscription.current_period_end * 1000);
              await sendEmail(supabaseUrl, serviceRoleKey, "subscription_created", profile.email, {
                firstName: profile.first_name || "Cher client",
                frequency: "Mensuel",
                nextDeliveryDate: nextDeliveryDate.toLocaleDateString("fr-BE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
                ctaUrl: `${session.metadata?.origin || 'https://serencare.be'}/compte`,
              });
            }
          }
        } else if (session.mode === "payment") {
          // Handle one-shot payment
          await supabase
            .from("stripe_orders")
            .upsert({
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              user_id: session.metadata?.user_id || null,
              amount_total: session.amount_total || 0,
              currency: session.currency || "eur",
              status: "paid",
            }, {
              onConflict: "stripe_checkout_session_id",
            });

          logStep("One-shot payment recorded", { sessionId: session.id });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });

        // Find user by customer ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email, first_name")
          .eq("stripe_customer_id", subscription.customer as string)
          .single();

        if (profile) {
          const isActive = ["active", "trialing"].includes(subscription.status);
          
          await supabase
            .from("stripe_subscriptions")
            .upsert({
              user_id: profile.id,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            }, {
              onConflict: "stripe_subscription_id",
            });

          await supabase
            .from("profiles")
            .update({
              is_member_active: isActive,
              subscription_status: subscription.status,
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", profile.id);

          logStep("Profile updated", { userId: profile.id, isActive });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email, first_name")
          .eq("stripe_customer_id", subscription.customer as string)
          .single();

        if (profile) {
          await supabase
            .from("stripe_subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", subscription.id);

          await supabase
            .from("profiles")
            .update({
              is_member_active: false,
              subscription_status: "canceled",
            })
            .eq("id", profile.id);

          logStep("Subscription canceled", { userId: profile.id });

          // Send cancellation email
          if (profile.email) {
            await sendEmail(supabaseUrl, serviceRoleKey, "subscription_cancelled", profile.email, {
              firstName: profile.first_name || "Cher client",
              ctaUrl: "https://serencare.be/boutique",
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id, subscriptionId: invoice.subscription });

        if (invoice.subscription) {
          const { data: sub } = await supabase
            .from("stripe_subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single();

          if (sub) {
            await supabase
              .from("profiles")
              .update({
                is_member_active: false,
                subscription_status: "past_due",
              })
              .eq("id", sub.user_id);

            logStep("Marked as past_due", { userId: sub.user_id });

            // Fetch user and send payment failed email
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, first_name")
              .eq("id", sub.user_id)
              .single();

            if (profile?.email) {
              await sendEmail(supabaseUrl, serviceRoleKey, "payment_failed", profile.email, {
                firstName: profile.first_name || "Cher client",
                reason: "Le paiement de votre abonnement a échoué. Veuillez mettre à jour vos informations de paiement.",
              });
            }
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { invoiceId: invoice.id, subscriptionId: invoice.subscription });

        // Only for subscription invoices (not first invoice which is handled by checkout.session.completed)
        if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
          const { data: sub } = await supabase
            .from("stripe_subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single();

          if (sub) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, first_name")
              .eq("id", sub.user_id)
              .single();

            if (profile?.email) {
              const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
              const nextDeliveryDate = new Date(subscription.current_period_end * 1000);
              
              await sendEmail(supabaseUrl, serviceRoleKey, "subscription_renewed", profile.email, {
                firstName: profile.first_name || "Cher client",
                amount: (invoice.amount_paid || 0) / 100,
                nextDeliveryDate: nextDeliveryDate.toLocaleDateString("fr-BE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
                ctaUrl: "https://serencare.be/compte",
              });
            }
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
