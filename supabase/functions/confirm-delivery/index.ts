import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, status, issueType, issueDescription, customerEmail, customerPhone } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token manquant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Find the confirmation by token
    const { data: confirmation, error: findError } = await supabase
      .from('delivery_confirmations')
      .select('*, orders(order_number, status, shipping_address, user_id)')
      .eq('confirmation_token', token)
      .single();

    // Handle check status request
    if (status === 'check') {
      if (findError || !confirmation) {
        return new Response(
          JSON.stringify({ error: 'Lien de confirmation invalide' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      return new Response(
        JSON.stringify({ success: true, confirmation }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (findError || !confirmation) {
      return new Response(
        JSON.stringify({ error: 'Lien de confirmation invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if already confirmed
    if (confirmation.status !== 'pending') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Cette livraison a déjà été traitée',
          confirmation 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update confirmation
    const updateData: Record<string, unknown> = {
      status: status === 'issue' ? 'issue_reported' : 'confirmed',
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (status === 'issue') {
      updateData.issue_type = issueType;
      updateData.issue_description = issueDescription;
      updateData.customer_email = customerEmail;
      updateData.customer_phone = customerPhone;
    }

    const { data: updated, error: updateError } = await supabase
      .from('delivery_confirmations')
      .update(updateData)
      .eq('id', confirmation.id)
      .select()
      .single();

    if (updateError) throw updateError;

    const orderNumber = confirmation.orders?.order_number || '';
    const shippingAddress = confirmation.orders?.shipping_address as any;
    const customerName = shippingAddress 
      ? `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() 
      : '';

    // If issue reported, send alert email and create notification
    if (status === 'issue') {
      await supabase.from('order_preparer_logs').insert({
        order_id: confirmation.order_id,
        action: 'delivery_issue_reported',
        details: `Problème signalé: ${issueType} - ${issueDescription}`,
      });

      // Call the alert email function
      try {
        await supabase.functions.invoke('send-delivery-issue-alert', {
          body: {
            orderId: confirmation.order_id,
            orderNumber,
            issueType,
            issueDescription,
            customerName,
            customerEmail,
            customerPhone,
          },
        });
        console.log('Delivery issue alert email sent');
      } catch (emailError) {
        console.error('Failed to send alert email:', emailError);
      }

      // Update order status to on_hold
      await supabase
        .from('orders')
        .update({ status: 'on_hold' })
        .eq('id', confirmation.order_id);

      // Add status event
      await supabase.from('order_status_events').insert({
        order_id: confirmation.order_id,
        status: 'on_hold',
        message_public: 'Un problème a été signalé avec cette livraison.',
        message_internal: `Type: ${issueType}. Description: ${issueDescription}. Contact: ${customerEmail || customerPhone || 'Non fourni'}`,
        is_visible_to_customer: false,
      });
    } else {
      // If confirmed, update order status to closed
      await supabase
        .from('orders')
        .update({ status: 'closed' })
        .eq('id', confirmation.order_id);

      await supabase.from('order_preparer_logs').insert({
        order_id: confirmation.order_id,
        action: 'delivery_confirmed',
        details: 'Livraison confirmée par le client via QR code',
      });

      await supabase.from('order_status_events').insert({
        order_id: confirmation.order_id,
        status: 'closed',
        message_public: 'Livraison confirmée par le client.',
        is_visible_to_customer: true,
      });
    }

    console.log('Delivery confirmation processed:', updated);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: status === 'issue' ? 'Votre signalement a été enregistré' : 'Livraison confirmée',
        confirmation: updated 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
