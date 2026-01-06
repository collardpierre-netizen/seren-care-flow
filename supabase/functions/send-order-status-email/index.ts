import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface StatusEmailRequest {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  newStatus: string;
  orderTotal: number;
}

const statusConfig: Record<string, { title: string; message: string; emoji: string; color: string }> = {
  pending: {
    title: 'Commande en attente',
    message: 'Votre commande a été reçue et est en cours de traitement.',
    emoji: '⏳',
    color: '#f59e0b'
  },
  paid: {
    title: 'Paiement confirmé',
    message: 'Votre paiement a été confirmé. Nous préparons votre commande.',
    emoji: '✅',
    color: '#10b981'
  },
  shipped: {
    title: 'Commande expédiée',
    message: 'Votre commande est en route ! Vous la recevrez très bientôt.',
    emoji: '🚚',
    color: '#3b82f6'
  },
  delivered: {
    title: 'Commande livrée',
    message: 'Votre commande a été livrée. Merci pour votre confiance !',
    emoji: '📦',
    color: '#22c55e'
  },
  cancelled: {
    title: 'Commande annulée',
    message: 'Votre commande a été annulée. Si vous avez des questions, contactez-nous.',
    emoji: '❌',
    color: '#ef4444'
  }
};

const getStatusTimeline = (currentStatus: string) => {
  const statuses = ['pending', 'paid', 'shipped', 'delivered'];
  const currentIndex = statuses.indexOf(currentStatus);
  
  if (currentStatus === 'cancelled') {
    return `
      <div style="display: flex; justify-content: center; gap: 8px; margin: 24px 0;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">❌</div>
          <span style="font-size: 12px; margin-top: 4px; color: #ef4444;">Annulée</span>
        </div>
      </div>
    `;
  }
  
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 24px 0; max-width: 400px; margin-left: auto; margin-right: auto;">
      ${statuses.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const config = statusConfig[status];
        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
            <div style="
              width: 40px; 
              height: 40px; 
              border-radius: 50%; 
              background: ${isCompleted ? config.color : '#e5e7eb'}; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-size: 18px;
              ${isCurrent ? 'box-shadow: 0 0 0 4px ' + config.color + '33;' : ''}
            ">${isCompleted ? config.emoji : '○'}</div>
            <span style="font-size: 11px; margin-top: 4px; color: ${isCompleted ? '#374151' : '#9ca3af'}; text-align: center;">${
              status === 'pending' ? 'Reçue' :
              status === 'paid' ? 'Confirmée' :
              status === 'shipped' ? 'Expédiée' : 'Livrée'
            }</span>
          </div>
          ${index < statuses.length - 1 ? `
            <div style="flex: 0.5; height: 3px; background: ${index < currentIndex ? statusConfig[statuses[index + 1]].color : '#e5e7eb'}; margin-bottom: 20px;"></div>
          ` : ''}
        `;
      }).join('')}
    </div>
  `;
};

const getEmailHtml = (data: StatusEmailRequest) => {
  const config = statusConfig[data.newStatus] || statusConfig.pending;
  const timeline = getStatusTimeline(data.newStatus);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">SerenCare</h1>
            </div>
            
            <!-- Status Banner -->
            <div style="background: ${config.color}15; padding: 24px; text-align: center; border-bottom: 3px solid ${config.color};">
              <div style="font-size: 48px; margin-bottom: 12px;">${config.emoji}</div>
              <h2 style="margin: 0; color: ${config.color}; font-size: 22px;">${config.title}</h2>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
                Bonjour ${data.customerName || 'cher client'},
              </p>
              
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 15px; line-height: 1.6;">
                ${config.message}
              </p>
              
              <!-- Timeline -->
              ${timeline}
              
              <!-- Order Info -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-top: 24px;">
                <h3 style="margin: 0 0 12px; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Détails de la commande</h3>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">N° de commande</p>
                    <p style="margin: 4px 0 0; color: #111827; font-weight: 600; font-family: monospace;">${data.orderNumber}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px;">Total</p>
                    <p style="margin: 4px 0 0; color: #111827; font-weight: 700; font-size: 18px;">${data.orderTotal.toFixed(2)} €</p>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://serencare.be/compte" style="
                  display: inline-block;
                  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
                  color: white;
                  padding: 14px 32px;
                  border-radius: 8px;
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 15px;
                ">Suivre ma commande</a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                Une question ? Contactez-nous à <a href="mailto:contact@serencare.be" style="color: #1e3a5f;">contact@serencare.be</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} SerenCare - Tous droits réservés
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: StatusEmailRequest = await req.json();
    console.log('Sending status email for order:', data.orderNumber, 'Status:', data.newStatus);

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const config = statusConfig[data.newStatus] || statusConfig.pending;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SerenCare <commandes@serencare.be>',
        to: [data.customerEmail],
        subject: `${config.emoji} ${config.title} - Commande ${data.orderNumber}`,
        html: getEmailHtml(data),
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log('Status email sent successfully to:', data.customerEmail);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending status email:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
