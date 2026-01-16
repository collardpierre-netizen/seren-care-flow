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

    const { orderId, token, message, senderName, action } = await req.json();

    // Verify token
    const { data: tokenData, error: tokenError } = await supabase
      .from('order_access_tokens')
      .select('*')
      .eq('order_id', orderId)
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Invalid token:', tokenError);
      return new Response(
        JSON.stringify({ success: false, error: 'Token invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check token expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Lien expiré' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Log the action
    if (action) {
      await supabase.from('order_preparer_logs').insert({
        order_id: orderId,
        action,
        preparer_name: senderName || 'Préparateur',
        details: message || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent'),
      });
    }

    // If there's a message, insert it
    if (message) {
      const { error: messageError } = await supabase.from('order_messages').insert({
        order_id: orderId,
        sender_type: 'preparer',
        sender_name: senderName || 'Préparateur',
        message,
      });

      if (messageError) {
        console.error('Error inserting message:', messageError);
        throw new Error('Erreur lors de l\'envoi du message');
      }
    }

    // Fetch all messages for this order
    const { data: messages } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    console.log('Message/action processed for order:', orderId);

    return new Response(
      JSON.stringify({ success: true, messages }),
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
