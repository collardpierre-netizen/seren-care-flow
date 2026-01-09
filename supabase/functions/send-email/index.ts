import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendWithResend(emailData: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      reply_to: emailData.reply_to,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  return await response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// SERENCARE EMAIL DESIGN SYSTEM
// ============================================

// Logo SerenCare - URL publique du site déployé
const LOGO_URL = "https://serencare.be/images/serencare-logo-email.png";

const brand = {
  name: "SerenCare",
  colors: {
    primary: "#3366FF",      // Deep confident blue (HSL 220 70% 45%)
    primaryLight: "#EEF2FF", // Light blue tint (HSL 220 60% 95%)
    secondary: "#52A37A",    // Soft sage green (HSL 160 30% 50%)
    accent: "#E86B4A",       // Warm coral-peach for CTAs (HSL 15 80% 60%)
    text: "#1A2233",         // Dark foreground (HSL 220 30% 12%)
    textMuted: "#6B7A8F",    // Muted text (HSL 220 15% 45%)
    background: "#F8F9FC",   // Light background (HSL 220 20% 98%)
    white: "#ffffff",
    border: "#E4E8EF",       // Subtle border (HSL 220 15% 90%)
    success: "#52A37A",      // Same as secondary
    warning: "#E8A74A",      // Warm amber
    error: "#E85454",        // Muted red
  },
  fonts: {
    primary: "'Plus Jakarta Sans', system-ui, sans-serif",
    secondary: "'Inter', system-ui, sans-serif",
  },
  logo: LOGO_URL,
  supportEmail: "contact@serencare.be",
  supportPhone: "+32 2 123 45 67",
  website: "https://serencare.be",
  senderEmail: "onboarding@resend.dev", // TODO: Changer pour noreply@send.serencare.be une fois le domaine vérifié
  senderName: "SerenCare",
};

// ============================================
// BASE EMAIL LAYOUT
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
      transition: background-color 0.2s;
    }
    .cta-button:hover {
      background-color: ${brand.colors.secondary};
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
    .reassurance-block {
      background-color: ${brand.colors.primaryLight};
      padding: 24px;
      margin: 32px 0;
      border-radius: 8px;
      text-align: center;
    }
    .reassurance-block p {
      margin: 0;
      font-style: italic;
      color: ${brand.colors.primary};
    }
    .order-details {
      background-color: ${brand.colors.background};
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
    }
    .order-details h3 {
      margin: 0 0 16px 0;
      color: ${brand.colors.primary};
      font-family: ${brand.fonts.primary};
      font-size: 18px;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid ${brand.colors.border};
    }
    .order-item:last-child {
      border-bottom: none;
    }
    .order-total {
      display: flex;
      justify-content: space-between;
      padding: 16px 0 0 0;
      margin-top: 16px;
      border-top: 2px solid ${brand.colors.primary};
      font-weight: 600;
      font-size: 18px;
    }
    .email-footer {
      background-color: ${brand.colors.background};
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid ${brand.colors.border};
    }
    .footer-support {
      margin-bottom: 24px;
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
    .footer-legal a {
      color: ${brand.colors.textMuted};
      text-decoration: underline;
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
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .status-success {
      background-color: #c6f6d5;
      color: #22543d;
    }
    .status-warning {
      background-color: #fefcbf;
      color: #744210;
    }
    .status-info {
      background-color: ${brand.colors.primaryLight};
      color: ${brand.colors.primary};
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-header, .email-body, .email-footer {
        padding: 24px 20px;
      }
      .greeting {
        font-size: 20px;
      }
      .cta-button {
        display: block;
        padding: 14px 24px;
      }
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
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
// EMAIL TEMPLATES
// ============================================

interface TemplateData {
  [key: string]: any;
}

// AUTH TEMPLATES

function getWelcomeEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  
  const content = `
    <p class="greeting">Bienvenue, ${firstName}</p>
    
    <div class="content">
      <p>Nous sommes heureux de vous accueillir au sein de la famille ${brand.name}.</p>
      
      <p>Vous avez fait le choix d'une solution pensée pour votre confort et votre tranquillité d'esprit. Notre mission : vous accompagner avec discrétion, respect et professionnalisme.</p>
      
      <div class="info-box">
        <p><strong>Ce que nous vous offrons :</strong></p>
        <p>• Des produits de qualité, sélectionnés avec soin</p>
        <p>• Une livraison discrète à votre domicile</p>
        <p>• Un service client à votre écoute</p>
      </div>
      
      <div class="cta-section">
        <a href="${brand.website}/boutique" class="cta-button">Découvrir nos produits</a>
      </div>
      
      <div class="reassurance-block">
        <p>"Vous n'êtes pas seul. Nous sommes là pour vous accompagner, étape par étape."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Avec toute notre attention,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Bienvenue chez ${brand.name}`,
    html: wrapEmail(content, "Bienvenue"),
    text: `Bienvenue chez ${brand.name}, ${firstName}!\n\nNous sommes heureux de vous accueillir. Notre mission est de vous accompagner avec discrétion et professionnalisme.\n\nL'équipe ${brand.name}`
  };
}

function getEmailVerificationEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const verificationUrl = data.verificationUrl || data.confirmationUrl || "#";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Pour finaliser la création de votre compte ${brand.name}, veuillez confirmer votre adresse email.</p>
      
      <p>Cette étape nous permet de garantir la sécurité de votre compte et de nos échanges.</p>
      
      <div class="cta-section">
        <a href="${verificationUrl}" class="cta-button">Confirmer mon adresse email</a>
      </div>
      
      <div class="info-box">
        <p>Si vous n'avez pas créé de compte chez ${brand.name}, vous pouvez ignorer cet email en toute sécurité.</p>
      </div>
      
      <p style="font-size: 14px; color: ${brand.colors.textMuted};">Ce lien est valable pendant 24 heures.</p>
    </div>
    
    <div class="signature">
      <p>Cordialement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Confirmez votre adresse email - ${brand.name}`,
    html: wrapEmail(content, "Confirmation"),
    text: `Bonjour ${firstName},\n\nPour confirmer votre adresse email, rendez-vous sur : ${verificationUrl}\n\nCe lien est valable 24 heures.\n\nL'équipe ${brand.name}`
  };
}

function getPasswordResetEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const resetUrl = data.resetUrl || data.confirmationUrl || "#";
  
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
        <p>Ignorez simplement cet email. Votre mot de passe actuel reste inchangé et votre compte est en sécurité.</p>
      </div>
      
      <p style="font-size: 14px; color: ${brand.colors.textMuted};">Ce lien est valable pendant 1 heure pour des raisons de sécurité.</p>
    </div>
    
    <div class="signature">
      <p>À votre service,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Réinitialisation de votre mot de passe - ${brand.name}`,
    html: wrapEmail(content, "Mot de passe"),
    text: `Bonjour ${firstName},\n\nPour réinitialiser votre mot de passe, rendez-vous sur : ${resetUrl}\n\nCe lien est valable 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\nL'équipe ${brand.name}`
  };
}

function getMagicLinkEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const magicLinkUrl = data.magicLinkUrl || data.confirmationUrl || "#";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Vous avez demandé à vous connecter à votre compte ${brand.name}.</p>
      
      <p>Cliquez sur le bouton ci-dessous pour accéder à votre espace personnel en toute sécurité :</p>
      
      <div class="cta-section">
        <a href="${magicLinkUrl}" class="cta-button">Accéder à mon compte</a>
      </div>
      
      <div class="info-box">
        <p>Ce lien de connexion est à usage unique et expire dans 10 minutes.</p>
      </div>
    </div>
    
    <div class="signature">
      <p>À très bientôt,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre lien de connexion - ${brand.name}`,
    html: wrapEmail(content, "Connexion sécurisée"),
    text: `Bonjour ${firstName},\n\nPour vous connecter à votre compte ${brand.name}, rendez-vous sur : ${magicLinkUrl}\n\nCe lien expire dans 10 minutes.\n\nL'équipe ${brand.name}`
  };
}

// ORDER TEMPLATES

function getOrderConfirmationEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || data.customerName || "Cher client";
  const orderNumber = data.orderNumber || "N/A";
  const items = data.items || [];
  const subtotal = data.subtotal || 0;
  const shippingFee = data.shippingFee || 0;
  const discount = data.discount || 0;
  const total = data.total || subtotal + shippingFee - discount;
  const shippingAddress = data.shippingAddress || {};
  const estimatedDelivery = data.estimatedDelivery || "3-5 jours ouvrés";
  
  let itemsHtml = "";
  items.forEach((item: any) => {
    itemsHtml += `
      <div class="order-item">
        <span>${item.name}${item.size ? ` (${item.size})` : ''} × ${item.quantity}</span>
        <span>${(item.unitPrice * item.quantity).toFixed(2)} €</span>
      </div>
    `;
  });
  
  const addressHtml = shippingAddress.firstName ? `
    <p style="margin: 0; font-size: 14px;">
      ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
      ${shippingAddress.address}<br>
      ${shippingAddress.postalCode} ${shippingAddress.city}<br>
      ${shippingAddress.country || 'Belgique'}
    </p>
  ` : '';
  
  const content = `
    <p class="greeting">Merci pour votre commande, ${firstName}</p>
    
    <div class="content">
      <p>Nous avons bien reçu votre commande et nous la préparons avec le plus grand soin.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge status-success">Commande confirmée</span>
      </div>
      
      <div class="order-details">
        <h3>Commande n° ${orderNumber}</h3>
        ${itemsHtml}
        <div class="order-item">
          <span>Sous-total</span>
          <span>${subtotal.toFixed(2)} €</span>
        </div>
        ${shippingFee > 0 ? `
        <div class="order-item">
          <span>Livraison</span>
          <span>${shippingFee.toFixed(2)} €</span>
        </div>
        ` : `
        <div class="order-item">
          <span>Livraison</span>
          <span style="color: ${brand.colors.success};">Offerte</span>
        </div>
        `}
        ${discount > 0 ? `
        <div class="order-item">
          <span>Réduction</span>
          <span style="color: ${brand.colors.success};">-${discount.toFixed(2)} €</span>
        </div>
        ` : ''}
        <div class="order-total">
          <span>Total</span>
          <span>${total.toFixed(2)} €</span>
        </div>
      </div>
      
      ${addressHtml ? `
      <div class="info-box">
        <p><strong>Adresse de livraison :</strong></p>
        ${addressHtml}
      </div>
      ` : ''}
      
      <div class="info-box">
        <p><strong>Livraison estimée :</strong> ${estimatedDelivery}</p>
        <p style="margin-top: 8px; font-size: 14px;">Vous recevrez un email dès que votre colis sera expédié.</p>
      </div>
      
      <div class="cta-section">
        <a href="${brand.website}/compte/commandes" class="cta-button">Suivre ma commande</a>
      </div>
      
      <div class="reassurance-block">
        <p>"Votre colis sera préparé et emballé avec discrétion, pour votre tranquillité."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Avec toute notre attention,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  let itemsText = items.map((item: any) => 
    `- ${item.name}${item.size ? ` (${item.size})` : ''} × ${item.quantity}: ${(item.unitPrice * item.quantity).toFixed(2)} €`
  ).join('\n');
  
  return {
    subject: `Confirmation de commande n° ${orderNumber} - ${brand.name}`,
    html: wrapEmail(content, "Commande confirmée"),
    text: `Merci pour votre commande, ${firstName}!\n\nCommande n° ${orderNumber}\n\n${itemsText}\n\nTotal: ${total.toFixed(2)} €\n\nLivraison estimée: ${estimatedDelivery}\n\nL'équipe ${brand.name}`
  };
}

function getOrderShippedEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || data.customerName || "Cher client";
  const orderNumber = data.orderNumber || "N/A";
  const trackingNumber = data.trackingNumber || "";
  const trackingUrl = data.trackingUrl || "";
  const carrier = data.carrier || "notre transporteur";
  const estimatedDelivery = data.estimatedDelivery || data.etaDate || "";
  
  const content = `
    <p class="greeting">Bonne nouvelle, ${firstName}</p>
    
    <div class="content">
      <p>Votre commande n° <strong>${orderNumber}</strong> est en route vers vous.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge status-info">En cours de livraison</span>
      </div>
      
      ${trackingNumber ? `
      <div class="order-details">
        <h3>Informations de suivi</h3>
        <div class="order-item">
          <span>Transporteur</span>
          <span>${carrier}</span>
        </div>
        <div class="order-item">
          <span>Numéro de suivi</span>
          <span>${trackingNumber}</span>
        </div>
        ${estimatedDelivery ? `
        <div class="order-item">
          <span>Livraison estimée</span>
          <span>${estimatedDelivery}</span>
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      ${trackingUrl ? `
      <div class="cta-section">
        <a href="${trackingUrl}" class="cta-button">Suivre mon colis</a>
      </div>
      ` : ''}
      
      <div class="info-box">
        <p>Votre colis a été emballé avec soin et en toute discrétion. Aucune indication sur le contenu n'apparaît sur l'emballage.</p>
      </div>
    </div>
    
    <div class="signature">
      <p>À très bientôt,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre commande n° ${orderNumber} est expédiée - ${brand.name}`,
    html: wrapEmail(content, "Colis expédié"),
    text: `Bonne nouvelle, ${firstName}!\n\nVotre commande n° ${orderNumber} est en route.\n\n${trackingNumber ? `Numéro de suivi: ${trackingNumber}` : ''}\n${trackingUrl ? `Suivre le colis: ${trackingUrl}` : ''}\n\nL'équipe ${brand.name}`
  };
}

function getOrderDeliveredEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || data.customerName || "Cher client";
  const orderNumber = data.orderNumber || "N/A";
  
  const content = `
    <p class="greeting">Votre colis est arrivé, ${firstName}</p>
    
    <div class="content">
      <p>Votre commande n° <strong>${orderNumber}</strong> a été livrée avec succès.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge status-success">Livré</span>
      </div>
      
      <p>Nous espérons que les produits vous conviennent parfaitement. N'hésitez pas à nous contacter si vous avez la moindre question.</p>
      
      <div class="info-box">
        <p><strong>Un souci avec votre commande ?</strong></p>
        <p>Notre équipe est là pour vous aider. Contactez-nous et nous trouverons ensemble une solution.</p>
      </div>
      
      <div class="cta-section">
        <a href="${brand.website}/boutique" class="cta-button">Commander à nouveau</a>
      </div>
      
      <div class="reassurance-block">
        <p>"Merci de votre confiance. Nous sommes là pour vous accompagner au quotidien."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Chaleureusement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre commande n° ${orderNumber} a été livrée - ${brand.name}`,
    html: wrapEmail(content, "Colis livré"),
    text: `Votre colis est arrivé, ${firstName}!\n\nVotre commande n° ${orderNumber} a été livrée.\n\nMerci de votre confiance.\n\nL'équipe ${brand.name}`
  };
}

function getOrderStatusEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || data.customerName || "Cher client";
  const orderNumber = data.orderNumber || "N/A";
  const status = data.status || "processing";
  const message = data.message || "";
  
  const statusConfig: { [key: string]: { title: string; badge: string; badgeClass: string } } = {
    order_received: { title: "Commande reçue", badge: "Reçue", badgeClass: "status-info" },
    payment_confirmed: { title: "Paiement confirmé", badge: "Confirmée", badgeClass: "status-success" },
    processing: { title: "En traitement", badge: "En cours", badgeClass: "status-info" },
    preparing: { title: "En préparation", badge: "En préparation", badgeClass: "status-info" },
    packed: { title: "Colis prêt", badge: "Prêt", badgeClass: "status-success" },
    shipped: { title: "Expédié", badge: "Expédié", badgeClass: "status-success" },
    delivered: { title: "Livré", badge: "Livré", badgeClass: "status-success" },
    on_hold: { title: "En attente", badge: "En attente", badgeClass: "status-warning" },
    delayed: { title: "Retard de livraison", badge: "Retardé", badgeClass: "status-warning" },
    cancelled: { title: "Annulée", badge: "Annulée", badgeClass: "status-warning" },
  };
  
  const config = statusConfig[status] || statusConfig.processing;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Le statut de votre commande n° <strong>${orderNumber}</strong> a été mis à jour.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge ${config.badgeClass}">${config.badge}</span>
      </div>
      
      ${message ? `
      <div class="info-box">
        <p>${message}</p>
      </div>
      ` : ''}
      
      <div class="cta-section">
        <a href="${brand.website}/compte/commandes" class="cta-button">Voir ma commande</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Cordialement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `${config.title} - Commande n° ${orderNumber} - ${brand.name}`,
    html: wrapEmail(content, config.title),
    text: `Bonjour ${firstName},\n\nLe statut de votre commande n° ${orderNumber} a été mis à jour: ${config.badge}\n\n${message}\n\nL'équipe ${brand.name}`
  };
}

// ============================================
// PHASE 2: PAYMENT & INVOICE TEMPLATES
// ============================================

function getPaymentFailedEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const reason = data.reason || "Votre banque a refusé la transaction.";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Nous n'avons malheureusement pas pu traiter votre paiement${orderNumber ? ` pour la commande n° ${orderNumber}` : ''}.</p>
      
      <div class="info-box" style="border-left-color: ${brand.colors.warning};">
        <p><strong>Raison :</strong> ${reason}</p>
      </div>
      
      <p>Pas d'inquiétude, cela peut arriver. Voici quelques solutions :</p>
      
      <ul style="margin: 16px 0; padding-left: 20px;">
        <li>Vérifiez que votre carte est valide et dispose de fonds suffisants</li>
        <li>Essayez une autre méthode de paiement</li>
        <li>Contactez votre banque si le problème persiste</li>
      </ul>
      
      <div class="cta-section">
        <a href="${brand.website}/checkout" class="cta-button">Réessayer le paiement</a>
      </div>
      
      <p style="font-size: 14px; color: ${brand.colors.textMuted};">Votre panier a été sauvegardé. Vous pouvez reprendre votre commande à tout moment.</p>
    </div>
    
    <div class="signature">
      <p>À votre service,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Paiement non abouti${orderNumber ? ` - Commande ${orderNumber}` : ''} - ${brand.name}`,
    html: wrapEmail(content, "Paiement"),
    text: `Bonjour ${firstName},\n\nNous n'avons pas pu traiter votre paiement.\n\nRaison: ${reason}\n\nRéessayez sur: ${brand.website}/checkout\n\nL'équipe ${brand.name}`
  };
}

function getInvoiceAvailableEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const invoiceNumber = data.invoiceNumber || "";
  const invoiceUrl = data.invoiceUrl || `${brand.website}/compte/factures`;
  const total = data.total || 0;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Votre facture${invoiceNumber ? ` n° ${invoiceNumber}` : ''} est disponible.</p>
      
      <div class="order-details">
        <h3>Détails de la facture</h3>
        ${orderNumber ? `
        <div class="order-item">
          <span>Commande</span>
          <span>n° ${orderNumber}</span>
        </div>
        ` : ''}
        ${invoiceNumber ? `
        <div class="order-item">
          <span>Facture</span>
          <span>n° ${invoiceNumber}</span>
        </div>
        ` : ''}
        ${total > 0 ? `
        <div class="order-total">
          <span>Montant</span>
          <span>${total.toFixed(2)} €</span>
        </div>
        ` : ''}
      </div>
      
      <div class="cta-section">
        <a href="${invoiceUrl}" class="cta-button">Télécharger ma facture</a>
      </div>
      
      <div class="info-box">
        <p>Vos factures sont conservées dans votre espace client pendant 10 ans.</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Cordialement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre facture${invoiceNumber ? ` n° ${invoiceNumber}` : ''} est disponible - ${brand.name}`,
    html: wrapEmail(content, "Facture"),
    text: `Bonjour ${firstName},\n\nVotre facture${invoiceNumber ? ` n° ${invoiceNumber}` : ''} est disponible.\n\nTéléchargez-la: ${invoiceUrl}\n\nL'équipe ${brand.name}`
  };
}

function getRefundConfirmationEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const refundAmount = data.refundAmount || 0;
  const reason = data.reason || "";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Nous vous confirmons le remboursement de votre commande${orderNumber ? ` n° ${orderNumber}` : ''}.</p>
      
      <div class="order-details">
        <h3>Détails du remboursement</h3>
        <div class="order-total">
          <span>Montant remboursé</span>
          <span style="color: ${brand.colors.success};">${refundAmount.toFixed(2)} €</span>
        </div>
      </div>
      
      ${reason ? `
      <div class="info-box">
        <p><strong>Motif :</strong> ${reason}</p>
      </div>
      ` : ''}
      
      <p>Le remboursement sera crédité sur votre moyen de paiement d'origine sous 5 à 10 jours ouvrés, selon votre banque.</p>
      
      <div class="reassurance-block">
        <p>"Nous espérons vous revoir bientôt. N'hésitez pas à nous contacter pour toute question."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>À votre service,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Confirmation de remboursement${orderNumber ? ` - Commande ${orderNumber}` : ''} - ${brand.name}`,
    html: wrapEmail(content, "Remboursement"),
    text: `Bonjour ${firstName},\n\nVotre remboursement de ${refundAmount.toFixed(2)} € a été effectué.\n\nIl sera crédité sous 5-10 jours ouvrés.\n\nL'équipe ${brand.name}`
  };
}

// ============================================
// PHASE 2: DELIVERY ISSUE TEMPLATES
// ============================================

function getDeliveryDelayEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const originalDate = data.originalDate || "";
  const newDate = data.newDate || "";
  const reason = data.reason || "Un imprévu logistique";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Nous devons vous informer d'un retard concernant votre commande${orderNumber ? ` n° ${orderNumber}` : ''}.</p>
      
      <div class="info-box" style="border-left-color: ${brand.colors.warning};">
        <p><strong>Raison :</strong> ${reason}</p>
        ${originalDate ? `<p style="margin-top: 8px;">Date initiale : ${originalDate}</p>` : ''}
        ${newDate ? `<p><strong>Nouvelle date estimée : ${newDate}</strong></p>` : ''}
      </div>
      
      <p>Nous sommes sincèrement désolés pour ce désagrément. Soyez assuré(e) que nous faisons tout notre possible pour vous livrer dans les meilleurs délais.</p>
      
      <div class="cta-section">
        <a href="${brand.website}/compte/commandes" class="cta-button">Suivre ma commande</a>
      </div>
      
      <div class="reassurance-block">
        <p>"Votre satisfaction est notre priorité. Nous vous remercions pour votre patience."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Avec toutes nos excuses,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Information livraison - Commande ${orderNumber} - ${brand.name}`,
    html: wrapEmail(content, "Livraison"),
    text: `Bonjour ${firstName},\n\nNous vous informons d'un retard pour votre commande ${orderNumber}.\n\nRaison: ${reason}\n${newDate ? `Nouvelle date: ${newDate}` : ''}\n\nL'équipe ${brand.name}`
  };
}

function getPartialDeliveryEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const deliveredItems = data.deliveredItems || [];
  const pendingItems = data.pendingItems || [];
  const pendingDeliveryDate = data.pendingDeliveryDate || "";
  
  let deliveredHtml = deliveredItems.map((item: any) => 
    `<li>${item.name}${item.size ? ` (${item.size})` : ''} × ${item.quantity}</li>`
  ).join('');
  
  let pendingHtml = pendingItems.map((item: any) => 
    `<li>${item.name}${item.size ? ` (${item.size})` : ''} × ${item.quantity}</li>`
  ).join('');
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Une partie de votre commande${orderNumber ? ` n° ${orderNumber}` : ''} est en cours de livraison.</p>
      
      ${deliveredItems.length > 0 ? `
      <div class="order-details">
        <h3 style="color: ${brand.colors.success};">Articles livrés / en livraison</h3>
        <ul style="margin: 12px 0; padding-left: 20px;">${deliveredHtml}</ul>
      </div>
      ` : ''}
      
      ${pendingItems.length > 0 ? `
      <div class="info-box" style="border-left-color: ${brand.colors.warning};">
        <p><strong>Articles en attente :</strong></p>
        <ul style="margin: 12px 0 0 0; padding-left: 20px;">${pendingHtml}</ul>
        ${pendingDeliveryDate ? `<p style="margin-top: 12px;">Livraison prévue : ${pendingDeliveryDate}</p>` : ''}
      </div>
      ` : ''}
      
      <p>Vous serez notifié(e) dès l'expédition des articles restants.</p>
      
      <div class="cta-section">
        <a href="${brand.website}/compte/commandes" class="cta-button">Voir ma commande</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Cordialement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Livraison partielle - Commande ${orderNumber} - ${brand.name}`,
    html: wrapEmail(content, "Livraison partielle"),
    text: `Bonjour ${firstName},\n\nUne partie de votre commande ${orderNumber} est en cours de livraison.\n\nL'équipe ${brand.name}`
  };
}

function getOrderCancelledEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const reason = data.reason || "";
  const cancelledBy = data.cancelledBy || "serencare"; // "serencare" or "customer"
  const refundInfo = data.refundInfo || "";
  
  const isCustomerCancel = cancelledBy === "customer";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>${isCustomerCancel 
        ? `Nous confirmons l'annulation de votre commande n° ${orderNumber}, comme vous l'avez demandé.`
        : `Nous sommes au regret de vous informer que votre commande n° ${orderNumber} a été annulée.`
      }</p>
      
      ${reason ? `
      <div class="info-box">
        <p><strong>Raison :</strong> ${reason}</p>
      </div>
      ` : ''}
      
      ${refundInfo ? `
      <div class="order-details">
        <h3>Remboursement</h3>
        <p>${refundInfo}</p>
      </div>
      ` : `
      <p>Si un paiement a été effectué, vous serez remboursé(e) sous 5 à 10 jours ouvrés.</p>
      `}
      
      ${!isCustomerCancel ? `
      <div class="reassurance-block">
        <p>"Nous sommes sincèrement désolés pour ce désagrément et restons à votre disposition."</p>
      </div>
      ` : ''}
      
      <div class="cta-section">
        <a href="${brand.website}/boutique" class="cta-button">Voir nos produits</a>
      </div>
    </div>
    
    <div class="signature">
      <p>${isCustomerCancel ? 'À bientôt,' : 'Avec toutes nos excuses,'}</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Annulation de commande n° ${orderNumber} - ${brand.name}`,
    html: wrapEmail(content, "Commande annulée"),
    text: `Bonjour ${firstName},\n\nVotre commande n° ${orderNumber} a été annulée.\n\n${reason ? `Raison: ${reason}\n\n` : ''}L'équipe ${brand.name}`
  };
}

// ============================================
// PHASE 2: SUBSCRIPTION TEMPLATES
// ============================================

function getSubscriptionRenewalReminderEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const renewalDate = data.renewalDate || "";
  const amount = data.amount || 0;
  const items = data.items || [];
  
  let itemsHtml = items.map((item: any) => 
    `<li>${item.name}${item.size ? ` (${item.size})` : ''} × ${item.quantity}</li>`
  ).join('');
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Votre prochaine livraison ${brand.name} approche.</p>
      
      <div class="order-details">
        <h3>Prochain renouvellement</h3>
        <div class="order-item">
          <span>Date</span>
          <span>${renewalDate}</span>
        </div>
        ${amount > 0 ? `
        <div class="order-total">
          <span>Montant</span>
          <span>${amount.toFixed(2)} €</span>
        </div>
        ` : ''}
      </div>
      
      ${items.length > 0 ? `
      <div class="info-box">
        <p><strong>Articles inclus :</strong></p>
        <ul style="margin: 12px 0 0 0; padding-left: 20px;">${itemsHtml}</ul>
      </div>
      ` : ''}
      
      <p>Vous souhaitez modifier votre abonnement ou les produits ? C'est simple et rapide depuis votre espace client.</p>
      
      <div class="cta-section">
        <a href="${brand.website}/compte/abonnement" class="cta-button">Gérer mon abonnement</a>
      </div>
    </div>
    
    <div class="signature">
      <p>À très bientôt,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre prochaine livraison le ${renewalDate} - ${brand.name}`,
    html: wrapEmail(content, "Rappel"),
    text: `Bonjour ${firstName},\n\nVotre prochaine livraison ${brand.name} est prévue le ${renewalDate}.\n\nMontant: ${amount.toFixed(2)} €\n\nGérer: ${brand.website}/compte/abonnement\n\nL'équipe ${brand.name}`
  };
}

function getSubscriptionRenewedEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const nextDeliveryDate = data.nextDeliveryDate || "";
  const amount = data.amount || 0;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Votre abonnement ${brand.name} a été renouvelé avec succès.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge status-success">Renouvellement confirmé</span>
      </div>
      
      <div class="order-details">
        <h3>Détails</h3>
        ${orderNumber ? `
        <div class="order-item">
          <span>Commande</span>
          <span>n° ${orderNumber}</span>
        </div>
        ` : ''}
        ${amount > 0 ? `
        <div class="order-item">
          <span>Montant</span>
          <span>${amount.toFixed(2)} €</span>
        </div>
        ` : ''}
        ${nextDeliveryDate ? `
        <div class="order-item">
          <span>Prochaine livraison</span>
          <span>${nextDeliveryDate}</span>
        </div>
        ` : ''}
      </div>
      
      <p>Votre colis sera préparé et expédié dans les plus brefs délais.</p>
      
      <div class="cta-section">
        <a href="${brand.website}/compte/commandes" class="cta-button">Suivre ma commande</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Merci pour votre confiance,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Renouvellement confirmé${orderNumber ? ` - Commande ${orderNumber}` : ''} - ${brand.name}`,
    html: wrapEmail(content, "Renouvellement"),
    text: `Bonjour ${firstName},\n\nVotre abonnement a été renouvelé.\n\n${orderNumber ? `Commande: ${orderNumber}\n` : ''}${amount > 0 ? `Montant: ${amount.toFixed(2)} €\n` : ''}\n\nL'équipe ${brand.name}`
  };
}

function getSubscriptionPausedEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const resumeDate = data.resumeDate || "";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Votre abonnement ${brand.name} est maintenant en pause.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge status-warning">Abonnement en pause</span>
      </div>
      
      ${resumeDate ? `
      <div class="info-box">
        <p>Votre abonnement reprendra automatiquement le <strong>${resumeDate}</strong>.</p>
      </div>
      ` : `
      <div class="info-box">
        <p>Vous pouvez réactiver votre abonnement à tout moment depuis votre espace client.</p>
      </div>
      `}
      
      <p>Pendant cette pause, vous ne serez pas débité(e) et aucune livraison ne sera effectuée.</p>
      
      <div class="cta-section">
        <a href="${brand.website}/compte/abonnement" class="cta-button">Gérer mon abonnement</a>
      </div>
      
      <div class="reassurance-block">
        <p>"Nous restons à votre disposition. N'hésitez pas à nous contacter si vous avez des questions."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>À bientôt,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre abonnement est en pause - ${brand.name}`,
    html: wrapEmail(content, "Pause"),
    text: `Bonjour ${firstName},\n\nVotre abonnement ${brand.name} est en pause.\n\n${resumeDate ? `Reprise prévue: ${resumeDate}\n` : ''}\n\nL'équipe ${brand.name}`
  };
}

function getSubscriptionCancelledEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const reason = data.reason || "";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Nous confirmons la résiliation de votre abonnement ${brand.name}.</p>
      
      ${reason ? `
      <div class="info-box">
        <p>${reason}</p>
      </div>
      ` : ''}
      
      <p>Nous sommes sincèrement désolés de vous voir partir. Si vous changez d'avis, vous pourrez toujours créer un nouvel abonnement depuis notre site.</p>
      
      <p>Vos informations de compte restent accessibles si vous souhaitez effectuer des commandes ponctuelles.</p>
      
      <div class="cta-section">
        <a href="${brand.website}/boutique" class="cta-button">Voir nos produits</a>
      </div>
      
      <div class="reassurance-block">
        <p>"Merci pour la confiance que vous nous avez accordée. Nous espérons vous revoir bientôt."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Avec toute notre gratitude,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Confirmation de résiliation - ${brand.name}`,
    html: wrapEmail(content, "Résiliation"),
    text: `Bonjour ${firstName},\n\nVotre abonnement ${brand.name} a été résilié.\n\nMerci pour votre confiance.\n\nL'équipe ${brand.name}`
  };
}

function getSubscriptionModifiedEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const changes = data.changes || "";
  const nextDeliveryDate = data.nextDeliveryDate || "";
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Les modifications apportées à votre abonnement ${brand.name} ont été enregistrées.</p>
      
      ${changes ? `
      <div class="info-box">
        <p><strong>Modifications :</strong></p>
        <p>${changes}</p>
      </div>
      ` : ''}
      
      ${nextDeliveryDate ? `
      <p>Ces changements prendront effet à partir de votre prochaine livraison le <strong>${nextDeliveryDate}</strong>.</p>
      ` : ''}
      
      <div class="cta-section">
        <a href="${brand.website}/compte/abonnement" class="cta-button">Voir mon abonnement</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Cordialement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Modification de votre abonnement - ${brand.name}`,
    html: wrapEmail(content, "Modification"),
    text: `Bonjour ${firstName},\n\nVotre abonnement a été modifié.\n\n${changes ? `Modifications: ${changes}\n` : ''}\n\nL'équipe ${brand.name}`
  };
}

// ============================================
// PHASE 2: SUPPORT & CARE TEMPLATES
// ============================================

function getOutOfStockNotificationEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const outOfStockItems = data.outOfStockItems || [];
  const alternatives = data.alternatives || [];
  const proposedAction = data.proposedAction || "";
  
  let itemsHtml = outOfStockItems.map((item: any) => 
    `<li>${item.name}${item.size ? ` (${item.size})` : ''}</li>`
  ).join('');
  
  let alternativesHtml = alternatives.map((item: any) => 
    `<li><strong>${item.name}</strong> - ${item.description || ''}</li>`
  ).join('');
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Nous vous contactons concernant votre commande${orderNumber ? ` n° ${orderNumber}` : ''}.</p>
      
      <div class="info-box" style="border-left-color: ${brand.colors.warning};">
        <p><strong>Article(s) temporairement indisponible(s) :</strong></p>
        <ul style="margin: 12px 0 0 0; padding-left: 20px;">${itemsHtml}</ul>
      </div>
      
      ${alternatives.length > 0 ? `
      <div class="order-details">
        <h3>Alternatives proposées</h3>
        <ul style="margin: 12px 0; padding-left: 20px;">${alternativesHtml}</ul>
      </div>
      ` : ''}
      
      ${proposedAction ? `
      <p><strong>Notre proposition :</strong> ${proposedAction}</p>
      ` : ''}
      
      <p>Notre équipe va vous contacter prochainement pour trouver ensemble la meilleure solution.</p>
      
      <div class="reassurance-block">
        <p>"Votre satisfaction est notre priorité. Nous ferons tout pour que vous receviez les produits adaptés à vos besoins."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>À votre service,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Information importante - Commande ${orderNumber} - ${brand.name}`,
    html: wrapEmail(content, "Information"),
    text: `Bonjour ${firstName},\n\nCertains articles de votre commande ${orderNumber} sont temporairement indisponibles.\n\nNotre équipe vous contactera prochainement.\n\nL'équipe ${brand.name}`
  };
}

function getCareFollowUpEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const message = data.message || "";
  const ctaText = data.ctaText || "Voir les conseils";
  const ctaUrl = data.ctaUrl || `${brand.website}/guides`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      ${message ? `<p>${message}</p>` : `
      <p>Nous espérons que les produits reçus répondent à vos attentes.</p>
      
      <p>Notre équipe de conseillers spécialisés est à votre disposition pour vous accompagner et répondre à toutes vos questions concernant l'utilisation de vos produits.</p>
      `}
      
      <div class="info-box">
        <p><strong>Nos ressources pour vous :</strong></p>
        <p>• Guides d'utilisation détaillés</p>
        <p>• Conseils personnalisés</p>
        <p>• Assistance téléphonique dédiée</p>
      </div>
      
      <div class="cta-section">
        <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
      </div>
      
      <div class="reassurance-block">
        <p>"Vous n'êtes pas seul(e). Notre équipe est là pour vous accompagner au quotidien."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Avec toute notre attention,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Nous sommes là pour vous - ${brand.name}`,
    html: wrapEmail(content, "Suivi"),
    text: `Bonjour ${firstName},\n\n${message || 'Nous espérons que les produits reçus vous conviennent.'}\n\nN'hésitez pas à consulter nos guides: ${ctaUrl}\n\nL'équipe ${brand.name}`
  };
}

function getSatisfactionCheckEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const orderNumber = data.orderNumber || "";
  const feedbackUrl = data.feedbackUrl || `${brand.website}/avis`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Nous espérons que votre expérience avec ${brand.name} a été à la hauteur de vos attentes.</p>
      
      <p>Votre avis compte beaucoup pour nous et nous aide à améliorer nos services. Seriez-vous disponible pour partager brièvement votre ressenti ?</p>
      
      <div class="cta-section">
        <a href="${feedbackUrl}" class="cta-button">Donner mon avis</a>
      </div>
      
      <div class="info-box">
        <p><strong>Un souci avec votre commande${orderNumber ? ` n° ${orderNumber}` : ''} ?</strong></p>
        <p style="margin-top: 8px;">Contactez-nous directement, notre équipe fera le nécessaire pour vous satisfaire.</p>
      </div>
      
      <div class="reassurance-block">
        <p>"Chaque retour nous aide à mieux vous servir. Merci de prendre quelques instants."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Avec gratitude,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre avis nous intéresse - ${brand.name}`,
    html: wrapEmail(content, "Votre avis"),
    text: `Bonjour ${firstName},\n\nVotre avis nous intéresse. Partagez votre expérience: ${feedbackUrl}\n\nMerci!\n\nL'équipe ${brand.name}`
  };
}

function getFirstDeliveryReassuranceEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  
  const content = `
    <p class="greeting">Bienvenue dans la famille ${brand.name}, ${firstName}</p>
    
    <div class="content">
      <p>Vous venez de recevoir votre première commande, et nous voulions prendre un moment pour vous accompagner.</p>
      
      <p>Nous comprenons que choisir les bons produits peut parfois sembler complexe. C'est pourquoi nous sommes là pour vous guider à chaque étape.</p>
      
      <div class="info-box">
        <p><strong>Vous avez des questions ?</strong></p>
        <p>• Sur l'utilisation des produits</p>
        <p>• Sur les tailles ou l'ajustement</p>
        <p>• Sur la fréquence des changements</p>
        <p style="margin-top: 12px;">Notre équipe spécialisée est là pour vous répondre avec bienveillance.</p>
      </div>
      
      <div class="cta-section">
        <a href="${brand.website}/guides" class="cta-button">Consulter nos guides</a>
      </div>
      
      <p style="text-align: center; margin-top: 24px;">
        <a href="tel:${brand.supportPhone}" style="color: ${brand.colors.primary}; text-decoration: none;">
          Ou appelez-nous : ${brand.supportPhone}
        </a>
      </p>
      
      <div class="reassurance-block">
        <p>"Vous n'êtes pas seul(e). Des milliers de familles nous font confiance chaque jour."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Chaleureusement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Bienvenue - Nous sommes là pour vous - ${brand.name}`,
    html: wrapEmail(content, "Bienvenue"),
    text: `Bienvenue ${firstName}!\n\nVous venez de recevoir votre première commande ${brand.name}.\n\nN'hésitez pas à consulter nos guides: ${brand.website}/guides\n\nOu appelez-nous: ${brand.supportPhone}\n\nL'équipe ${brand.name}`
  };
}

function getAccountApprovedEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher partenaire";
  const organizationName = data.organizationName || "";
  const loginUrl = data.loginUrl || `${brand.website}/connexion`;
  
  const content = `
    <p class="greeting">Félicitations, ${firstName}</p>
    
    <div class="content">
      <p>Votre demande de compte professionnel ${brand.name}${organizationName ? ` pour ${organizationName}` : ''} a été approuvée.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge status-success">Compte activé</span>
      </div>
      
      <div class="info-box">
        <p><strong>Vos avantages professionnels :</strong></p>
        <p>• Tarifs préférentiels sur tout notre catalogue</p>
        <p>• Accès à votre espace dédié</p>
        <p>• Suivi des commissions et parrainages</p>
        <p>• Support prioritaire</p>
      </div>
      
      <div class="cta-section">
        <a href="${loginUrl}" class="cta-button">Accéder à mon espace pro</a>
      </div>
      
      <p>Un conseiller dédié vous contactera prochainement pour vous présenter l'ensemble de nos services.</p>
    </div>
    
    <div class="signature">
      <p>Bienvenue dans notre réseau,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre compte professionnel est activé - ${brand.name}`,
    html: wrapEmail(content, "Compte approuvé"),
    text: `Félicitations ${firstName}!\n\nVotre compte professionnel ${brand.name} a été approuvé.\n\nConnectez-vous: ${loginUrl}\n\nL'équipe ${brand.name}`
  };
}

// INTERNAL TEAM NOTIFICATION

function getTeamOrderNotificationEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const orderNumber = data.orderNumber || "N/A";
  const customerEmail = data.customerEmail || "";
  const total = data.total || 0;
  const items = data.items || [];
  const isSubscription = data.isSubscription || false;
  
  let itemsHtml = items.map((item: any) => 
    `<li>${item.name}${item.size ? ` (${item.size})` : ''} × ${item.quantity}</li>`
  ).join('');
  
  const content = `
    <p class="greeting">Nouvelle commande reçue</p>
    
    <div class="content">
      <div class="order-details">
        <h3>Commande n° ${orderNumber}</h3>
        <div class="order-item">
          <span>Client</span>
          <span>${customerEmail}</span>
        </div>
        <div class="order-item">
          <span>Type</span>
          <span>${isSubscription ? 'Abonnement' : 'Commande unique'}</span>
        </div>
        <div class="order-total">
          <span>Total</span>
          <span>${total.toFixed(2)} €</span>
        </div>
      </div>
      
      <div class="info-box">
        <p><strong>Articles :</strong></p>
        <ul>${itemsHtml}</ul>
      </div>
      
      <div class="cta-section">
        <a href="${brand.website}/admin/orders" class="cta-button">Voir dans l'admin</a>
      </div>
    </div>
  `;
  
  return {
    subject: `[SerenCare] Nouvelle commande n° ${orderNumber} - ${total.toFixed(2)} €`,
    html: wrapEmail(content, "Nouvelle commande"),
    text: `Nouvelle commande n° ${orderNumber}\n\nClient: ${customerEmail}\nTotal: ${total.toFixed(2)} €\n\n${items.map((item: any) => `- ${item.name} × ${item.quantity}`).join('\n')}`
  };
}


// ============================================
// TEMPLATE REGISTRY
// ============================================

const templates: { [key: string]: (data: TemplateData) => { subject: string; html: string; text: string } } = {
  // Auth
  welcome: getWelcomeEmail,
  email_verification: getEmailVerificationEmail,
  password_reset: getPasswordResetEmail,
  magic_link: getMagicLinkEmail,
  
  // Orders
  order_confirmation: getOrderConfirmationEmail,
  order_shipped: getOrderShippedEmail,
  order_delivered: getOrderDeliveredEmail,
  order_status: getOrderStatusEmail,
  order_cancelled: getOrderCancelledEmail,
  
  // Payment
  payment_failed: getPaymentFailedEmail,
  invoice_available: getInvoiceAvailableEmail,
  refund_confirmation: getRefundConfirmationEmail,
  
  // Delivery
  delivery_delay: getDeliveryDelayEmail,
  partial_delivery: getPartialDeliveryEmail,
  
  // Subscriptions
  subscription_created: getSubscriptionRenewedEmail,
  subscription_renewal_reminder: getSubscriptionRenewalReminderEmail,
  subscription_renewed: getSubscriptionRenewedEmail,
  subscription_paused: getSubscriptionPausedEmail,
  subscription_cancelled: getSubscriptionCancelledEmail,
  subscription_modified: getSubscriptionModifiedEmail,
  
  // Support & Care
  out_of_stock: getOutOfStockNotificationEmail,
  care_followup: getCareFollowUpEmail,
  satisfaction_check: getSatisfactionCheckEmail,
  first_delivery_reassurance: getFirstDeliveryReassuranceEmail,
  account_approved: getAccountApprovedEmail,
  
  // Internal
  team_order_notification: getTeamOrderNotificationEmail,
};

// ============================================
// MAIN HANDLER
// ============================================

interface EmailRequest {
  to: string | string[];
  template: string;
  data?: TemplateData;
  // For custom/direct emails
  subject?: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: EmailRequest = await req.json();
    const { to, template, data = {}, subject, html, text, replyTo } = request;

    console.log(`[SerenCare Email] Sending ${template || 'custom'} email to ${Array.isArray(to) ? to.join(', ') : to}`);

    let emailSubject: string;
    let emailHtml: string;
    let emailText: string;

    // Check if using a template or direct content
    if (template && templates[template]) {
      const templateFn = templates[template];
      const result = templateFn(data);
      emailSubject = result.subject;
      emailHtml = result.html;
      emailText = result.text;
    } else if (subject && html) {
      // Direct content mode
      emailSubject = subject;
      emailHtml = html;
      emailText = text || "";
    } else {
      throw new Error(`Invalid request: template '${template}' not found and no direct content provided`);
    }

    const emailResponse = await sendWithResend({
      from: `${brand.senderName} <${brand.senderEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      reply_to: replyTo || brand.supportEmail,
    });

    console.log(`[SerenCare Email] Email sent successfully:`, emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[SerenCare Email] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
