import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SEND_EMAIL_HOOK_SECRET = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ============================================
// SERENCARE BRAND CONFIGURATION
// ============================================

const brand = {
  name: "SerenCare",
  colors: {
    primary: "#1a5f4a",
    primaryLight: "#e8f5f0",
    text: "#2d3748",
    textMuted: "#718096",
    background: "#fafafa",
    white: "#ffffff",
    border: "#e2e8f0",
  },
  fonts: {
    primary: "Georgia, 'Times New Roman', serif",
    secondary: "Arial, Helvetica, sans-serif",
  },
  logo: "https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/media/serencare-logo.png",
  supportEmail: "contact@serencare.be",
  supportPhone: "+32 2 123 45 67",
  website: "https://serencare.be",
  senderEmail: "noreply@send.serencare.be",
  senderName: "SerenCare",
};

// ============================================
// EMAIL STYLES
// ============================================

function getBaseStyles(): string {
  return `
    body {
      margin: 0;
      padding: 0;
      font-family: ${brand.fonts.secondary};
      font-size: 16px;
      line-height: 1.6;
      color: ${brand.colors.text};
      background-color: ${brand.colors.background};
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: ${brand.colors.background};
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${brand.colors.white};
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background-color: ${brand.colors.primary};
      padding: 32px 40px;
      text-align: center;
    }
    .email-header img {
      max-height: 48px;
      width: auto;
    }
    .email-header h1 {
      color: ${brand.colors.white};
      font-family: ${brand.fonts.primary};
      font-size: 24px;
      font-weight: normal;
      margin: 16px 0 0 0;
    }
    .email-body {
      padding: 40px;
    }
    .greeting {
      font-family: ${brand.fonts.primary};
      font-size: 22px;
      color: ${brand.colors.primary};
      margin-bottom: 24px;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 1.7;
    }
    .cta-section {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: ${brand.colors.primary};
      color: ${brand.colors.white} !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
    }
    .info-box {
      background-color: ${brand.colors.primaryLight};
      border-left: 4px solid ${brand.colors.primary};
      padding: 20px 24px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    .info-box p {
      margin: 0;
      color: ${brand.colors.text};
    }
    .email-footer {
      background-color: ${brand.colors.background};
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid ${brand.colors.border};
    }
    .footer-support p {
      margin: 4px 0;
      font-size: 14px;
      color: ${brand.colors.textMuted};
    }
    .footer-support a {
      color: ${brand.colors.primary};
      text-decoration: none;
    }
    .footer-legal {
      font-size: 12px;
      color: ${brand.colors.textMuted};
      line-height: 1.5;
    }
    .signature {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid ${brand.colors.border};
    }
    .signature p {
      margin: 4px 0;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 20px 10px; }
      .email-header, .email-body, .email-footer { padding: 24px 20px; }
      .greeting { font-size: 20px; }
      .cta-button { display: block; padding: 14px 24px; }
    }
  `;
}

function wrapEmail(content: string, headerTitle?: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name}</title>
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <img src="${brand.logo}" alt="${brand.name}" onerror="this.style.display='none'">
        ${headerTitle ? `<h1>${headerTitle}</h1>` : ''}
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <div class="footer-support">
          <p><strong>Besoin d'aide ?</strong></p>
          <p>Notre équipe est à votre écoute</p>
          <p>
            <a href="mailto:${brand.supportEmail}">${brand.supportEmail}</a> | 
            <a href="tel:${brand.supportPhone}">${brand.supportPhone}</a>
          </p>
        </div>
        <div class="footer-legal">
          <p>
            Cet email vous a été envoyé par ${brand.name}.<br>
            <a href="${brand.website}/mentions-legales">Mentions légales</a> | 
            <a href="${brand.website}/confidentialite">Politique de confidentialité</a>
          </p>
          <p style="margin-top: 12px;">
            ${brand.name} – Des soins livrés avec attention.<br>
            © ${new Date().getFullYear()} ${brand.name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================
// AUTH EMAIL TEMPLATES
// ============================================

interface AuthEmailData {
  email_action_type: string;
  token: string;
  token_hash: string;
  redirect_to: string;
  site_url: string;
  token_new?: string;
  token_hash_new?: string;
}

interface UserData {
  email: string;
  user_metadata?: {
    first_name?: string;
    full_name?: string;
  };
}

function getFirstName(user: UserData): string {
  return user.user_metadata?.first_name || 
         user.user_metadata?.full_name?.split(' ')[0] || 
         "Cher client";
}

function generateSignupEmail(user: UserData, emailData: AuthEmailData): { subject: string; html: string; text: string } {
  const firstName = getFirstName(user);
  const confirmUrl = `${SUPABASE_URL}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${emailData.redirect_to}`;
  
  const content = `
    <p class="greeting">Bienvenue, ${firstName}</p>
    
    <div class="content">
      <p>Nous sommes heureux de vous accueillir au sein de la famille ${brand.name}.</p>
      
      <p>Pour activer votre compte et profiter de tous nos services, veuillez confirmer votre adresse email :</p>
      
      <div class="cta-section">
        <a href="${confirmUrl}" class="cta-button">Confirmer mon email</a>
      </div>
      
      <div class="info-box">
        <p>Ce lien est valable pendant 24 heures.</p>
        <p style="margin-top: 8px;">Si vous n'avez pas créé de compte chez ${brand.name}, vous pouvez ignorer cet email.</p>
      </div>
    </div>
    
    <div class="signature">
      <p>À très bientôt,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Bienvenue chez ${brand.name} – Confirmez votre email`,
    html: wrapEmail(content, "Bienvenue"),
    text: `Bienvenue chez ${brand.name}, ${firstName}!\n\nConfirmez votre email: ${confirmUrl}\n\nCe lien expire dans 24 heures.\n\nL'équipe ${brand.name}`
  };
}

function generateMagicLinkEmail(user: UserData, emailData: AuthEmailData): { subject: string; html: string; text: string } {
  const firstName = getFirstName(user);
  const magicLinkUrl = `${SUPABASE_URL}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${emailData.redirect_to}`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Vous avez demandé à vous connecter à votre compte ${brand.name}.</p>
      
      <p>Cliquez sur le bouton ci-dessous pour accéder à votre espace personnel :</p>
      
      <div class="cta-section">
        <a href="${magicLinkUrl}" class="cta-button">Accéder à mon compte</a>
      </div>
      
      <div class="info-box">
        <p>Ce lien de connexion est à usage unique et expire dans 10 minutes.</p>
      </div>
      
      <p style="font-size: 14px; color: ${brand.colors.textMuted};">Vous pouvez également copier ce code de connexion : <strong>${emailData.token}</strong></p>
    </div>
    
    <div class="signature">
      <p>À très bientôt,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre lien de connexion ${brand.name}`,
    html: wrapEmail(content, "Connexion sécurisée"),
    text: `Bonjour ${firstName},\n\nConnectez-vous: ${magicLinkUrl}\n\nCode: ${emailData.token}\n\nExpire dans 10 minutes.\n\nL'équipe ${brand.name}`
  };
}

function generateRecoveryEmail(user: UserData, emailData: AuthEmailData): { subject: string; html: string; text: string } {
  const firstName = getFirstName(user);
  const resetUrl = `${SUPABASE_URL}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${emailData.redirect_to}`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Vous avez demandé à réinitialiser votre mot de passe ${brand.name}.</p>
      
      <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
      
      <div class="cta-section">
        <a href="${resetUrl}" class="cta-button">Réinitialiser mon mot de passe</a>
      </div>
      
      <div class="info-box">
        <p><strong>Vous n'avez pas demandé cette réinitialisation ?</strong></p>
        <p style="margin-top: 8px;">Ignorez simplement cet email. Votre mot de passe actuel reste inchangé et votre compte est en sécurité.</p>
      </div>
      
      <p style="font-size: 14px; color: ${brand.colors.textMuted};">Ce lien est valable pendant 1 heure.</p>
    </div>
    
    <div class="signature">
      <p>À votre service,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Réinitialisation de votre mot de passe ${brand.name}`,
    html: wrapEmail(content, "Mot de passe"),
    text: `Bonjour ${firstName},\n\nRéinitialisez votre mot de passe: ${resetUrl}\n\nCe lien expire dans 1 heure.\n\nL'équipe ${brand.name}`
  };
}

function generateEmailChangeEmail(user: UserData, emailData: AuthEmailData): { subject: string; html: string; text: string } {
  const firstName = getFirstName(user);
  const confirmUrl = `${SUPABASE_URL}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${emailData.redirect_to}`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Vous avez demandé à modifier l'adresse email associée à votre compte ${brand.name}.</p>
      
      <p>Pour confirmer ce changement, cliquez sur le bouton ci-dessous :</p>
      
      <div class="cta-section">
        <a href="${confirmUrl}" class="cta-button">Confirmer le changement</a>
      </div>
      
      <div class="info-box">
        <p><strong>Vous n'avez pas demandé ce changement ?</strong></p>
        <p style="margin-top: 8px;">Contactez immédiatement notre équipe support pour sécuriser votre compte.</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Cordialement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Confirmez votre nouvelle adresse email - ${brand.name}`,
    html: wrapEmail(content, "Changement d'email"),
    text: `Bonjour ${firstName},\n\nConfirmez le changement d'email: ${confirmUrl}\n\nL'équipe ${brand.name}`
  };
}

function generateInviteEmail(user: UserData, emailData: AuthEmailData): { subject: string; html: string; text: string } {
  const confirmUrl = `${SUPABASE_URL}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${emailData.redirect_to}`;
  
  const content = `
    <p class="greeting">Vous êtes invité(e)</p>
    
    <div class="content">
      <p>Vous avez été invité(e) à rejoindre ${brand.name}, votre partenaire de confiance pour les soins à domicile.</p>
      
      <p>Cliquez ci-dessous pour créer votre compte et accéder à votre espace personnel :</p>
      
      <div class="cta-section">
        <a href="${confirmUrl}" class="cta-button">Accepter l'invitation</a>
      </div>
      
      <div class="info-box">
        <p>Ce lien est valable pendant 7 jours.</p>
      </div>
    </div>
    
    <div class="signature">
      <p>À très bientôt,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Invitation à rejoindre ${brand.name}`,
    html: wrapEmail(content, "Invitation"),
    text: `Vous êtes invité(e) à rejoindre ${brand.name}!\n\nAcceptez l'invitation: ${confirmUrl}\n\nL'équipe ${brand.name}`
  };
}

function generateReauthenticationEmail(user: UserData, emailData: AuthEmailData): { subject: string; html: string; text: string } {
  const firstName = getFirstName(user);
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Pour des raisons de sécurité, nous avons besoin de vérifier votre identité.</p>
      
      <p>Voici votre code de vérification :</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; background-color: ${brand.colors.primaryLight}; padding: 16px 32px; font-size: 28px; font-family: monospace; letter-spacing: 4px; border-radius: 8px; color: ${brand.colors.primary};">
          ${emailData.token}
        </span>
      </div>
      
      <div class="info-box">
        <p>Ce code expire dans 10 minutes. Ne le partagez avec personne.</p>
      </div>
    </div>
    
    <div class="signature">
      <p>L'équipe ${brand.name}</p>
    </div>
  `;
  
  return {
    subject: `Votre code de vérification ${brand.name}`,
    html: wrapEmail(content, "Vérification"),
    text: `Bonjour ${firstName},\n\nVotre code de vérification: ${emailData.token}\n\nExpire dans 10 minutes.\n\nL'équipe ${brand.name}`
  };
}

// ============================================
// EMAIL GENERATOR
// ============================================

function generateAuthEmail(user: UserData, emailData: AuthEmailData): { subject: string; html: string; text: string } {
  const emailType = emailData.email_action_type;
  
  console.log(`[Auth Email Hook] Generating email for type: ${emailType}`);
  
  switch (emailType) {
    case 'signup':
    case 'email':
      return generateSignupEmail(user, emailData);
    case 'magiclink':
      return generateMagicLinkEmail(user, emailData);
    case 'recovery':
      return generateRecoveryEmail(user, emailData);
    case 'email_change':
    case 'email_change_new':
    case 'email_change_current':
      return generateEmailChangeEmail(user, emailData);
    case 'invite':
      return generateInviteEmail(user, emailData);
    case 'reauthentication':
      return generateReauthenticationEmail(user, emailData);
    default:
      console.log(`[Auth Email Hook] Unknown email type: ${emailType}, using default signup template`);
      return generateSignupEmail(user, emailData);
  }
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log("[Auth Email Hook] Received webhook request");
    
    // Verify webhook signature if secret is configured
    let webhookData: { user: UserData; email_data: AuthEmailData };
    
    if (SEND_EMAIL_HOOK_SECRET) {
      try {
        const wh = new Webhook(SEND_EMAIL_HOOK_SECRET);
        webhookData = wh.verify(payload, headers) as { user: UserData; email_data: AuthEmailData };
        console.log("[Auth Email Hook] Webhook signature verified");
      } catch (verifyError) {
        console.error("[Auth Email Hook] Webhook verification failed:", verifyError);
        return new Response(
          JSON.stringify({ error: { http_code: 401, message: "Invalid webhook signature" } }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      // If no secret configured, parse directly (for testing)
      webhookData = JSON.parse(payload);
      console.log("[Auth Email Hook] No webhook secret configured, parsing payload directly");
    }
    
    const { user, email_data } = webhookData;
    
    console.log(`[Auth Email Hook] Processing email for: ${user.email}, type: ${email_data.email_action_type}`);
    
    // Generate the email
    const { subject, html, text } = generateAuthEmail(user, email_data);
    
    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${brand.senderName} <${brand.senderEmail}>`,
        to: [user.email],
        subject,
        html,
        text,
        reply_to: brand.supportEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Auth Email Hook] Resend error:", error);
      throw new Error(error.message || "Failed to send email");
    }

    const result = await response.json();
    console.log("[Auth Email Hook] Email sent successfully:", result);

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[Auth Email Hook] Error:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
