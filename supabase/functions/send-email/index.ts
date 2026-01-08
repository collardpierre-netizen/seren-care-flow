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

const brand = {
  name: "SerenCare",
  colors: {
    primary: "#1a5f4a",      // Calm forest green
    primaryLight: "#e8f5f0", // Soft mint background
    secondary: "#2d7a62",    // Slightly lighter green
    text: "#2d3748",         // Dark gray for readability
    textMuted: "#718096",    // Muted gray
    background: "#fafafa",   // Warm off-white
    white: "#ffffff",
    border: "#e2e8f0",       // Subtle border
    success: "#38a169",      // Confirmation green
    warning: "#d69e2e",      // Soft amber
    error: "#c53030",        // Muted red
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

// SUBSCRIPTION TEMPLATES

function getSubscriptionCreatedEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const nextDeliveryDate = data.nextDeliveryDate || "";
  const frequency = data.frequency || "mensuelle";
  
  const content = `
    <p class="greeting">Merci, ${firstName}</p>
    
    <div class="content">
      <p>Votre abonnement ${brand.name} est maintenant actif. Vous n'aurez plus à vous soucier de vos commandes – nous nous occupons de tout.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status-badge status-success">Abonnement actif</span>
      </div>
      
      <div class="info-box">
        <p><strong>Ce que cela signifie pour vous :</strong></p>
        <p>• Livraison automatique ${frequency}</p>
        <p>• Tarifs préférentiels sur tous vos produits</p>
        <p>• Possibilité de modifier ou suspendre à tout moment</p>
        ${nextDeliveryDate ? `<p>• Prochaine livraison prévue : ${nextDeliveryDate}</p>` : ''}
      </div>
      
      <div class="cta-section">
        <a href="${brand.website}/compte/abonnement" class="cta-button">Gérer mon abonnement</a>
      </div>
      
      <div class="reassurance-block">
        <p>"La tranquillité d'esprit, c'est de ne plus avoir à y penser."</p>
      </div>
    </div>
    
    <div class="signature">
      <p>Avec toute notre attention,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre abonnement ${brand.name} est actif`,
    html: wrapEmail(content, "Abonnement activé"),
    text: `Merci ${firstName}!\n\nVotre abonnement ${brand.name} est maintenant actif.\n\nLivraison ${frequency}${nextDeliveryDate ? `, prochaine livraison: ${nextDeliveryDate}` : ''}.\n\nL'équipe ${brand.name}`
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
  
  // Subscriptions
  subscription_created: getSubscriptionCreatedEmail,
  
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
