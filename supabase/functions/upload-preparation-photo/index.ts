import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const orderItemId = formData.get('orderItemId') as string | null;
    const caption = formData.get('caption') as string | null;
    const uploadedBy = formData.get('uploadedBy') as string | null;
    const token = formData.get('token') as string | null;

    if (!file || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or orderId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify token access
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

    // If not admin, verify magic link token
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
          JSON.stringify({ error: 'Token invalide ou expiré' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    } else if (!isAdmin && !token) {
      return new Response(
        JSON.stringify({ error: 'Authentification requise' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('preparation-photos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Create bucket if it doesn't exist
      if (uploadError.message.includes('not found')) {
        const { error: bucketError } = await supabase.storage.createBucket('preparation-photos', {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (bucketError && !bucketError.message.includes('already exists')) {
          throw bucketError;
        }
        
        // Retry upload
        const { error: retryError } = await supabase.storage
          .from('preparation-photos')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });
        
        if (retryError) throw retryError;
      } else {
        throw uploadError;
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('preparation-photos')
      .getPublicUrl(fileName);

    // Save to database
    const { data, error: dbError } = await supabase
      .from('order_preparation_photos')
      .insert({
        order_id: orderId,
        order_item_id: orderItemId || null,
        photo_url: publicUrl,
        caption: caption || null,
        uploaded_by: uploadedBy || 'Préparateur',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Log the action
    await supabase.from('order_preparer_logs').insert({
      order_id: orderId,
      action: 'photo_uploaded',
      details: caption || 'Photo ajoutée',
      preparer_name: uploadedBy || 'Préparateur',
    });

    console.log('Photo uploaded:', publicUrl);

    return new Response(
      JSON.stringify({ success: true, data, url: publicUrl }),
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
