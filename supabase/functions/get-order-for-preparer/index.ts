import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://serencare.be',
  'https://www.serencare.be',
  'https://seren-care-flow.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId, token } = await req.json();
    console.log('Fetching order for preparer:', orderId);

    if (!orderId || !token) {
      return new Response(
        JSON.stringify({ error: 'Missing orderId or token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify the magic link token
    const { data: tokenData, error: tokenError } = await supabase
      .from('order_access_tokens')
      .select('*')
      .eq('order_id', orderId)
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token not found:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Lien invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Ce lien a expiré' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if token was already used - allow 24h window
    if (tokenData.used_at) {
      const usedAt = new Date(tokenData.used_at);
      const hoursElapsed = (Date.now() - usedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursElapsed > 24) {
        return new Response(
          JSON.stringify({ error: 'Ce lien a déjà été utilisé et la session a expiré' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
    }

    // Fetch order with items
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Commande introuvable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get customer info from profiles if user_id exists
    let customerName = 'Client';
    let customerPhone = null;
    
    if (orderData.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('id', orderData.user_id)
        .single();
        
      if (profileData) {
        customerName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Client';
        customerPhone = profileData.phone;
      }
    }

    // Parse shipping address
    const shippingAddress = orderData.shipping_address as any;
    if (shippingAddress) {
      customerName = `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || customerName;
      customerPhone = shippingAddress.phone || customerPhone;
    }

    // Format response
    const response = {
      id: orderData.id,
      order_number: orderData.order_number,
      status: orderData.status,
      created_at: orderData.created_at,
      eta_date: orderData.eta_date,
      tracking_number: orderData.tracking_number,
      tracking_url: orderData.tracking_url,
      carrier: orderData.carrier,
      customer_name: customerName,
      customer_phone: customerPhone,
      shipping_address: shippingAddress ? {
        address_line1: shippingAddress.address,
        address_line2: shippingAddress.address2,
        postal_code: shippingAddress.postalCode,
        city: shippingAddress.city,
      } : null,
      items: orderData.order_items,
    };

    console.log('Order data fetched for preparer');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching order:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
