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

// Logo SerenCare - Base64 encodé pour affichage direct dans les emails
const LOGO_BASE64 = "data:image/png;base64,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";

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
  logo: "https://obkfkygjisxvgrmclhnb.supabase.co/storage/v1/object/public/email-assets/serencare-logo-email.png",
  supportEmail: "support@serencare.be",      // Familles
  supportEmailPro: "pro@serencare.be",        // Professionnels
  supportPhone: "+32 2 123 45 67",
  website: "https://serencare.be",
  senderEmail: "noreply@serencare.be", // Domaine Resend vérifié
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

// ============================================
// AUTH TEMPLATES - FAMILIES (B2C)
// ============================================

function getWelcomeEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const ctaUrl = data.ctaUrl || `${brand.website}/compte`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Bienvenue chez ${brand.name}.</p>
      
      <p>Vous avez créé un compte afin de faciliter la gestion des produits de protection et de soins au quotidien. Notre objectif est simple : vous apporter de la clarté, de la continuité et de la tranquillité d'esprit.</p>
      
      <div class="info-box">
        <p>Depuis votre espace personnel, vous pouvez :</p>
        <p>• retrouver vos commandes et livraisons</p>
        <p>• gérer facilement vos réapprovisionnements</p>
        <p>• adapter les produits si les besoins évoluent</p>
      </div>
      
      <p>Si vous avez la moindre question, notre équipe est disponible pour vous aider, sans automatisme inutile.</p>
      
      <div class="cta-section">
        <a href="${ctaUrl}" class="cta-button">Accéder à mon espace SerenCare</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Bien cordialement,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Bienvenue chez ${brand.name} – nous sommes là pour vous accompagner`,
    html: wrapEmail(content, "Bienvenue"),
    text: `Bonjour ${firstName},\n\nBienvenue chez ${brand.name}.\n\nVous avez créé un compte afin de faciliter la gestion des produits de protection et de soins au quotidien.\n\nDepuis votre espace personnel, vous pouvez :\n- retrouver vos commandes et livraisons\n- gérer facilement vos réapprovisionnements\n- adapter les produits si les besoins évoluent\n\nAccéder à mon espace : ${ctaUrl}\n\nBien cordialement,\nL'équipe ${brand.name}`
  };
}

// ============================================
// AUTH TEMPLATES - PROFESSIONALS (B2B)
// ============================================

function getWelcomeProEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const lastName = data.lastName || "Cher partenaire";
  const ctaUrl = data.ctaUrl || `${brand.website}/compte`;
  
  const content = `
    <p class="greeting">Bonjour, ${lastName}</p>
    
    <div class="content">
      <p>Votre compte professionnel ${brand.name} est désormais actif.</p>
      
      <div class="info-box">
        <p>La plateforme vous permet de :</p>
        <p>• commander et suivre les livraisons</p>
        <p>• gérer les récurrences</p>
        <p>• centraliser les documents (factures, avoirs)</p>
        <p>• simplifier la continuité des soins pour vos patients</p>
      </div>
      
      <p>L'ensemble des échanges est sécurisé et tracé.</p>
      
      <div class="cta-section">
        <a href="${ctaUrl}" class="cta-button">Accéder à l'espace professionnel</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Cordialement,</p>
      <p><strong>${brand.name} – Services professionnels</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre compte professionnel ${brand.name} est activé`,
    html: wrapEmail(content, "Compte professionnel"),
    text: `Bonjour ${lastName},\n\nVotre compte professionnel ${brand.name} est désormais actif.\n\nLa plateforme vous permet de :\n- commander et suivre les livraisons\n- gérer les récurrences\n- centraliser les documents (factures, avoirs)\n- simplifier la continuité des soins pour vos patients\n\nAccéder à l'espace professionnel : ${ctaUrl}\n\nCordialement,\n${brand.name} – Services professionnels`
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
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Votre commande a été expédiée.</p>
      
      <div class="order-details">
        <div class="order-item">
          <span>Transporteur</span>
          <span>${carrier}</span>
        </div>
        ${trackingNumber ? `
        <div class="order-item">
          <span>Numéro de suivi</span>
          <span>${trackingNumber}</span>
        </div>
        ` : ''}
      </div>
      
      ${trackingUrl ? `
      <div class="cta-section">
        <a href="${trackingUrl}" class="cta-button">Suivre la livraison</a>
      </div>
      ` : ''}
      
      <p>Nous espérons que cette livraison contribuera à plus de sérénité au quotidien.</p>
    </div>
    
    <div class="signature">
      <p>Bien cordialement,</p>
      <p><strong>${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre commande ${brand.name} est en route`,
    html: wrapEmail(content, "Colis expédié"),
    text: `Bonjour ${firstName},\n\nVotre commande a été expédiée.\n\nTransporteur : ${carrier}\n${trackingNumber ? `Numéro de suivi : ${trackingNumber}` : ''}\n${trackingUrl ? `Suivre la livraison : ${trackingUrl}` : ''}\n\nNous espérons que cette livraison contribuera à plus de sérénité au quotidien.\n\nBien cordialement,\n${brand.name}`
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
  const nextDeliveryDate = data.nextDeliveryDate || data.renewalDate || "";
  const ctaUrl = data.ctaUrl || `${brand.website}/compte/abonnement`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Nous vous informons que votre prochaine livraison ${brand.name} est prévue le <strong>${nextDeliveryDate}</strong>.</p>
      
      <p>Aucune action n'est requise de votre part.</p>
      
      <p>Si vous souhaitez ajuster les produits ou la fréquence, cela reste possible à tout moment.</p>
      
      <div class="cta-section">
        <a href="${ctaUrl}" class="cta-button">Accéder à mon abonnement</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Bien à vous,</p>
      <p><strong>L'équipe ${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Information concernant votre prochaine livraison ${brand.name}`,
    html: wrapEmail(content, "Rappel"),
    text: `Bonjour ${firstName},\n\nNous vous informons que votre prochaine livraison ${brand.name} est prévue le ${nextDeliveryDate}.\n\nAucune action n'est requise de votre part.\n\nSi vous souhaitez ajuster les produits ou la fréquence, cela reste possible à tout moment.\n\nAccéder à mon abonnement : ${ctaUrl}\n\nBien à vous,\nL'équipe ${brand.name}`
  };
}

function getSubscriptionCreatedEmail(data: TemplateData): { subject: string; html: string; text: string } {
  const firstName = data.firstName || "Cher client";
  const frequency = data.frequency || "";
  const nextDeliveryDate = data.nextDeliveryDate || "";
  const ctaUrl = data.ctaUrl || `${brand.website}/compte/abonnement`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Votre abonnement ${brand.name} est désormais actif.</p>
      
      <div class="order-details">
        ${frequency ? `
        <div class="order-item">
          <span>Fréquence</span>
          <span>${frequency}</span>
        </div>
        ` : ''}
        ${nextDeliveryDate ? `
        <div class="order-item">
          <span>Prochaine livraison prévue</span>
          <span>${nextDeliveryDate}</span>
        </div>
        ` : ''}
      </div>
      
      <p>Vous pouvez modifier ou suspendre cet abonnement à tout moment depuis votre espace personnel.</p>
      
      <div class="cta-section">
        <a href="${ctaUrl}" class="cta-button">Gérer mon abonnement</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Nous restons à vos côtés,</p>
      <p><strong>${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Votre abonnement ${brand.name} est en place`,
    html: wrapEmail(content, "Abonnement actif"),
    text: `Bonjour ${firstName},\n\nVotre abonnement ${brand.name} est désormais actif.\n\n${frequency ? `Fréquence : ${frequency}\n` : ''}${nextDeliveryDate ? `Prochaine livraison prévue : ${nextDeliveryDate}\n` : ''}\n\nVous pouvez modifier ou suspendre cet abonnement à tout moment depuis votre espace personnel.\n\nGérer mon abonnement : ${ctaUrl}\n\nNous restons à vos côtés,\n${brand.name}`
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
  const proposedSolution = data.proposedSolution || data.proposedAction || "";
  const supportUrl = data.supportUrl || `${brand.website}/contact`;
  
  const content = `
    <p class="greeting">Bonjour, ${firstName}</p>
    
    <div class="content">
      <p>Nous souhaitions vous informer qu'un article de votre commande${orderNumber ? ` n° ${orderNumber}` : ''} est momentanément indisponible.</p>
      
      ${proposedSolution ? `
      <div class="info-box">
        <p><strong>Solution proposée :</strong></p>
        <p>${proposedSolution}</p>
      </div>
      ` : ''}
      
      <p>Notre équipe reste disponible pour vous accompagner.</p>
      
      <div class="cta-section">
        <a href="${supportUrl}" class="cta-button">Contacter le support</a>
      </div>
    </div>
    
    <div class="signature">
      <p>Avec toute notre attention,</p>
      <p><strong>${brand.name}</strong></p>
    </div>
  `;
  
  return {
    subject: `Information concernant votre commande ${brand.name}`,
    html: wrapEmail(content, "Information"),
    text: `Bonjour ${firstName},\n\nNous souhaitions vous informer qu'un article de votre commande${orderNumber ? ` n° ${orderNumber}` : ''} est momentanément indisponible.\n\n${proposedSolution ? `Solution proposée : ${proposedSolution}\n\n` : ''}Notre équipe reste disponible pour vous accompagner.\n\nContacter le support : ${supportUrl}\n\nAvec toute notre attention,\n${brand.name}`
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
  // Auth - Families (B2C)
  welcome: getWelcomeEmail,
  auth_welcome_family: getWelcomeEmail,
  email_verification: getEmailVerificationEmail,
  password_reset: getPasswordResetEmail,
  magic_link: getMagicLinkEmail,
  
  // Auth - Professionals (B2B)
  welcome_pro: getWelcomeProEmail,
  auth_welcome_pro: getWelcomeProEmail,
  
  // Orders
  order_confirmation: getOrderConfirmationEmail,
  order_confirmation_family: getOrderConfirmationEmail,
  order_shipped: getOrderShippedEmail,
  order_shipped_family: getOrderShippedEmail,
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
  subscription_created: getSubscriptionCreatedEmail,
  subscription_created_family: getSubscriptionCreatedEmail,
  subscription_renewal_reminder: getSubscriptionRenewalReminderEmail,
  subscription_renewal_reminder_family: getSubscriptionRenewalReminderEmail,
  subscription_renewed: getSubscriptionRenewedEmail,
  subscription_paused: getSubscriptionPausedEmail,
  subscription_cancelled: getSubscriptionCancelledEmail,
  subscription_modified: getSubscriptionModifiedEmail,
  
  // Support & Care
  out_of_stock: getOutOfStockNotificationEmail,
  stock_issue_family: getOutOfStockNotificationEmail,
  care_followup: getCareFollowUpEmail,
  satisfaction_check: getSatisfactionCheckEmail,
  first_delivery_reassurance: getFirstDeliveryReassuranceEmail,
  account_approved: getAccountApprovedEmail,
  
  // Internal
  team_order_notification: getTeamOrderNotificationEmail,
};

// Templates for professionals (B2B) - use different Reply-To
const proTemplates = [
  'welcome_pro',
  'auth_welcome_pro',
  'account_approved',
];

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

    // Determine Reply-To based on template type (B2B vs B2C)
    const isProfessionalTemplate = proTemplates.includes(template || '');
    const defaultReplyTo = isProfessionalTemplate ? brand.supportEmailPro : brand.supportEmail;

    const emailResponse = await sendWithResend({
      from: `${brand.senderName} <${brand.senderEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      reply_to: replyTo || defaultReplyTo,
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
