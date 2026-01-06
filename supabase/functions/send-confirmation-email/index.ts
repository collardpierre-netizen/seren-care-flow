import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "callback" | "appointment" | "order";
  to: string;
  data: {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    preferredDay?: string;
    preferredTime?: string;
    message?: string;
    orderNumber?: string;
    orderTotal?: number;
  };
}

const getEmailStyles = () => `
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F7F6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); padding: 40px; text-align: center; }
    .header h1 { color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    .content { padding: 40px; }
    .content h2 { color: #2D5A4A; font-size: 24px; margin: 0 0 20px; }
    .content p { color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px; }
    .info-box { background-color: #F5F7F6; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #2D5A4A; }
    .info-box h3 { color: #2D5A4A; font-size: 16px; margin: 0 0 15px; }
    .info-box p { margin: 0 0 8px; color: #374151; font-size: 14px; }
    .info-box strong { color: #2D5A4A; }
    .footer { background-color: #F5F7F6; padding: 30px 40px; text-align: center; }
    .footer p { color: #6B7280; font-size: 14px; margin: 0 0 10px; }
    .footer a { color: #2D5A4A; text-decoration: none; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #2D5A4A 0%, #3D7A6A 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; margin: 20px 0; }
  </style>
`;

const getEmailContent = (type: string, data: EmailRequest["data"]) => {
  const baseWrapper = (content: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${getEmailStyles()}
    </head>
    <body style="margin: 0; padding: 0; background-color: #F5F7F6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <div class="container">
              <div class="header">
                <h1>SerenCare</h1>
                <p>Votre bien-être, notre priorité</p>
              </div>
              ${content}
              <div class="footer">
                <p>Des questions ? Contactez-nous !</p>
                <p><a href="mailto:info@serencare.be">info@serencare.be</a> | <a href="tel:+3202648422">+32 02 648 42 22</a></p>
                <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">© ${new Date().getFullYear()} SerenCare. Tous droits réservés.</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  switch (type) {
    case "callback":
      return {
        subject: "Demande de rappel reçue - SerenCare",
        html: baseWrapper(`
          <div class="content">
            <h2>✅ Demande de rappel reçue</h2>
            <p>Bonjour ${data.firstName},</p>
            <p>Nous avons bien reçu votre demande de rappel et nous vous contacterons dans les plus brefs délais.</p>
            <div class="info-box">
              <h3>Récapitulatif de votre demande</h3>
              <p><strong>Nom :</strong> ${data.firstName} ${data.lastName}</p>
              <p><strong>Téléphone :</strong> ${data.phone}</p>
              ${data.preferredDay ? `<p><strong>Jour préféré :</strong> ${data.preferredDay}</p>` : ""}
              ${data.preferredTime ? `<p><strong>Créneau préféré :</strong> ${data.preferredTime}</p>` : ""}
              ${data.message ? `<p><strong>Message :</strong> ${data.message}</p>` : ""}
            </div>
            <p>Un conseiller SerenCare vous rappellera très prochainement pour répondre à toutes vos questions.</p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">Cordialement,<br><strong>L'équipe SerenCare</strong></p>
          </div>
        `),
      };
    case "appointment":
      return {
        subject: "Confirmation de rendez-vous - SerenCare",
        html: baseWrapper(`
          <div class="content">
            <h2>📅 Demande de rendez-vous reçue</h2>
            <p>Bonjour ${data.firstName},</p>
            <p>Nous avons bien reçu votre demande de rendez-vous. Nous vous contacterons prochainement pour confirmer le créneau.</p>
            <div class="info-box">
              <h3>Récapitulatif de votre demande</h3>
              <p><strong>Nom :</strong> ${data.firstName} ${data.lastName}</p>
              <p><strong>Téléphone :</strong> ${data.phone}</p>
              ${data.preferredDay ? `<p><strong>Date souhaitée :</strong> ${data.preferredDay}</p>` : ""}
              ${data.preferredTime ? `<p><strong>Horaire souhaité :</strong> ${data.preferredTime}</p>` : ""}
            </div>
            <p>Un conseiller SerenCare vous contactera très prochainement pour confirmer votre rendez-vous.</p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">Cordialement,<br><strong>L'équipe SerenCare</strong></p>
          </div>
        `),
      };
    case "order":
      return {
        subject: `Confirmation de commande ${data.orderNumber} - SerenCare`,
        html: baseWrapper(`
          <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background-color: #E8F5E9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✓</span>
              </div>
            </div>
            <h2 style="text-align: center;">Merci pour votre commande !</h2>
            <p>Bonjour ${data.firstName},</p>
            <p>Votre commande a bien été enregistrée et sera traitée dans les plus brefs délais.</p>
            <div class="info-box">
              <h3>Détails de la commande</h3>
              <p><strong>Numéro de commande :</strong> ${data.orderNumber}</p>
              <p><strong>Total :</strong> ${data.orderTotal?.toFixed(2)} €</p>
            </div>
            <p>Vous recevrez un email de suivi dès l'expédition de votre colis.</p>
            <div style="text-align: center;">
              <a href="https://serencare.lovable.app/compte" class="cta-button">Suivre ma commande</a>
            </div>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">Cordialement,<br><strong>L'équipe SerenCare</strong></p>
          </div>
        `),
      };
    default:
      return { subject: "", html: "" };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();
    
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped - no API key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getEmailContent(type, data);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SerenCare <noreply@serencare.be>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
