import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { orderId, token, action, details, preparerName } = await req.json();

    // Verify token
    const { data: tokenData, error: tokenError } = await supabase
      .from('order_access_tokens')
      .select('*')
      .eq('order_id', orderId)
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Invalid token');
      return new Response(
        JSON.stringify({ success: false, error: 'Token invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Log the access/action
    const { error: logError } = await supabase.from('order_preparer_logs').insert({
      order_id: orderId,
      action,
      details,
      preparer_name: preparerName || 'Préparateur',
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
      user_agent: req.headers.get('user-agent'),
    });

    if (logError) {
      console.error('Error logging:', logError);
      throw new Error('Erreur de logging');
    }

    // If action is 'link_opened', update the accessed_at field
    if (action === 'link_opened') {
      await supabase
        .from('order_access_tokens')
        .update({ accessed_at: new Date().toISOString() })
        .eq('id', tokenData.id);
    }

    console.log('Preparer action logged:', action, 'for order:', orderId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
