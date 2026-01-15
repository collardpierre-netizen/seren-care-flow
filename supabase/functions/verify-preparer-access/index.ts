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
    console.log('Verifying magic link access for order:', orderId);

    if (!orderId || !token) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing orderId or token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get access token from database - match by both order_id and token
    const { data: tokenData, error: tokenError } = await supabase
      .from('order_access_tokens')
      .select('*')
      .eq('order_id', orderId)
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token not found:', tokenError);
      return new Response(
        JSON.stringify({ valid: false, error: 'Lien invalide ou expiré' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Ce lien a expiré' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if token was already used (one-time use)
    if (tokenData.used_at) {
      // Allow continued access for 24 hours after first use
      const usedAt = new Date(tokenData.used_at);
      const hoursElapsed = (Date.now() - usedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursElapsed > 24) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Ce lien a déjà été utilisé et la session a expiré' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      // Within 24h window, update accessed_at and allow access
      await supabase
        .from('order_access_tokens')
        .update({ accessed_at: new Date().toISOString() })
        .eq('id', tokenData.id);
    } else {
      // First use - mark as used and update accessed_at
      await supabase
        .from('order_access_tokens')
        .update({ 
          used_at: new Date().toISOString(),
          accessed_at: new Date().toISOString() 
        })
        .eq('id', tokenData.id);
    }

    console.log('Magic link access verified for order:', orderId);

    return new Response(
      JSON.stringify({ valid: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error verifying access:', error);
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
