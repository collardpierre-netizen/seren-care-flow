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

    const { orderId, orderItemId, isAvailable, preparedQuantity, notes, preparerName, password } = await req.json();
    console.log('Updating preparation status:', { orderId, orderItemId, isAvailable, preparedQuantity });

    if (!orderId || !orderItemId) {
      return new Response(
        JSON.stringify({ error: 'Missing orderId or orderItemId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify access - either by password or check if user is admin
    const authHeader = req.headers.get('Authorization');
    let isAdmin = false;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'manager']);
        
        isAdmin = (roles?.length || 0) > 0;
      }
    }

    // If not admin, verify password
    if (!isAdmin && password) {
      const { data: token } = await supabase
        .from('order_access_tokens')
        .select('*')
        .eq('order_id', orderId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired access' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      // Simple password check (in production, use proper hashing)
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (token.password_hash !== hashHex) {
        return new Response(
          JSON.stringify({ error: 'Invalid password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    } else if (!isAdmin && !password) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Upsert preparation status
    const { data, error } = await supabase
      .from('order_item_preparation')
      .upsert({
        order_id: orderId,
        order_item_id: orderItemId,
        is_available: isAvailable,
        prepared_quantity: preparedQuantity,
        notes: notes || null,
        prepared_by: preparerName || 'Préparateur',
        prepared_at: new Date().toISOString(),
      }, {
        onConflict: 'order_item_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating preparation:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Preparation status updated:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
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
