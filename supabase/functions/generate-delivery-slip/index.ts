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

    const { orderId, token } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId manquant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify access
    const authHeader = req.headers.get('Authorization');
    let isAdmin = false;

    if (authHeader) {
      const authToken = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(authToken);
      
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'manager']);
        
        isAdmin = (roles?.length || 0) > 0;
      }
    }

    if (!isAdmin && token) {
      const { data: tokenData } = await supabase
        .from('order_access_tokens')
        .select('*')
        .eq('order_id', orderId)
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!tokenData) {
        return new Response(
          JSON.stringify({ error: 'Token invalide' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    } else if (!isAdmin && !token) {
      return new Response(
        JSON.stringify({ error: 'Authentification requise' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Get order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Commande non trouvée' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check or create delivery confirmation token
    let { data: confirmation } = await supabase
      .from('delivery_confirmations')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (!confirmation) {
      const { data: newConfirmation, error: createError } = await supabase
        .from('delivery_confirmations')
        .insert({ order_id: orderId })
        .select()
        .single();

      if (createError) throw createError;
      confirmation = newConfirmation;
    }

    const baseUrl = Deno.env.get('SITE_URL') || 'https://serencare.be';
    const confirmationUrl = `${baseUrl}/confirmation-livraison?token=${confirmation.confirmation_token}`;

    // Generate HTML for the delivery slip
    const shippingAddress = order.shipping_address as {
      firstName?: string;
      lastName?: string;
      address?: string;
      address2?: string;
      postalCode?: string;
      city?: string;
      phone?: string;
    } | null;

    const deliverySlipData = {
      order,
      items: order.order_items,
      shippingAddress,
      confirmationUrl,
      confirmationToken: confirmation.confirmation_token,
      generatedAt: new Date().toISOString(),
    };

    console.log('Delivery slip generated for order:', order.order_number);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: deliverySlipData 
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
