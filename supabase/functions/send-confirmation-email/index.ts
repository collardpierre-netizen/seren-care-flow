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

const getEmailContent = (type: string, data: EmailRequest["data"]) => {
  switch (type) {
    case "callback":
      return {
        subject: "Demande de rappel reçue - SerenCare",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2D5A4A;">Demande de rappel reçue</h1>
            <p>Bonjour ${data.firstName},</p>
            <p>Nous avons bien reçu votre demande de rappel et nous vous contacterons dans les plus brefs délais.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Récapitulatif :</h3>
              <p><strong>Nom :</strong> ${data.firstName} ${data.lastName}</p>
              <p><strong>Téléphone :</strong> ${data.phone}</p>
              ${data.preferredDay ? `<p><strong>Jour préféré :</strong> ${data.preferredDay}</p>` : ""}
              ${data.preferredTime ? `<p><strong>Créneau préféré :</strong> ${data.preferredTime}</p>` : ""}
              ${data.message ? `<p><strong>Message :</strong> ${data.message}</p>` : ""}
            </div>
            <p>L'équipe SerenCare</p>
          </div>
        `,
      };
    case "appointment":
      return {
        subject: "Confirmation de rendez-vous - SerenCare",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2D5A4A;">Demande de rendez-vous reçue</h1>
            <p>Bonjour ${data.firstName},</p>
            <p>Nous avons bien reçu votre demande de rendez-vous. Nous vous contacterons prochainement pour confirmer le créneau.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Récapitulatif :</h3>
              <p><strong>Nom :</strong> ${data.firstName} ${data.lastName}</p>
              <p><strong>Téléphone :</strong> ${data.phone}</p>
              ${data.preferredDay ? `<p><strong>Date souhaitée :</strong> ${data.preferredDay}</p>` : ""}
              ${data.preferredTime ? `<p><strong>Horaire souhaité :</strong> ${data.preferredTime}</p>` : ""}
            </div>
            <p>L'équipe SerenCare</p>
          </div>
        `,
      };
    case "order":
      return {
        subject: `Confirmation de commande ${data.orderNumber} - SerenCare`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2D5A4A;">Merci pour votre commande !</h1>
            <p>Bonjour ${data.firstName},</p>
            <p>Votre commande <strong>${data.orderNumber}</strong> a bien été enregistrée.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Détails :</h3>
              <p><strong>Numéro de commande :</strong> ${data.orderNumber}</p>
              <p><strong>Total :</strong> ${data.orderTotal?.toFixed(2)} €</p>
            </div>
            <p>Vous recevrez un email de suivi dès l'expédition de votre colis.</p>
            <p>L'équipe SerenCare</p>
          </div>
        `,
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
        from: "SerenCare <noreply@serencare.fr>",
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
