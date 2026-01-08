import { supabase } from "@/integrations/supabase/client";

export type EmailTemplate =
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "magic_link"
  | "order_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "order_status"
  | "subscription_created"
  | "team_order_notification";

interface EmailData {
  // Common fields
  firstName?: string;
  lastName?: string;
  customerName?: string;
  customerEmail?: string;
  
  // Auth fields
  verificationUrl?: string;
  confirmationUrl?: string;
  resetUrl?: string;
  magicLinkUrl?: string;
  
  // Order fields
  orderNumber?: string;
  items?: Array<{
    name: string;
    size?: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  total?: number;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  estimatedDelivery?: string;
  
  // Shipping fields
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  etaDate?: string;
  
  // Status fields
  status?: string;
  message?: string;
  
  // Subscription fields
  nextDeliveryDate?: string;
  frequency?: string;
  
  // Misc
  isSubscription?: boolean;
  [key: string]: unknown;
}

interface SendEmailParams {
  to: string | string[];
  template: EmailTemplate;
  data?: EmailData;
  replyTo?: string;
}

interface SendCustomEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export function useEmail() {
  /**
   * Send an email using a predefined template
   */
  const sendTemplateEmail = async ({
    to,
    template,
    data = {},
    replyTo,
  }: SendEmailParams): Promise<EmailResult> => {
    try {
      console.log(`[Email] Sending ${template} email to ${to}`);
      
      const { data: result, error } = await supabase.functions.invoke("send-email", {
        body: {
          to,
          template,
          data,
          replyTo,
        },
      });

      if (error) {
        console.error("[Email] Error:", error);
        return { success: false, error: error.message };
      }

      console.log("[Email] Success:", result);
      return { success: true, data: result };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[Email] Exception:", err);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Send a custom email with direct HTML content
   */
  const sendCustomEmail = async ({
    to,
    subject,
    html,
    text,
    replyTo,
  }: SendCustomEmailParams): Promise<EmailResult> => {
    try {
      console.log(`[Email] Sending custom email to ${to}`);
      
      const { data: result, error } = await supabase.functions.invoke("send-email", {
        body: {
          to,
          template: null,
          subject,
          html,
          text,
          replyTo,
        },
      });

      if (error) {
        console.error("[Email] Error:", error);
        return { success: false, error: error.message };
      }

      console.log("[Email] Success:", result);
      return { success: true, data: result };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[Email] Exception:", err);
      return { success: false, error: errorMessage };
    }
  };

  // Convenience methods for common emails
  
  const sendWelcomeEmail = (to: string, firstName?: string) =>
    sendTemplateEmail({ to, template: "welcome", data: { firstName } });

  const sendOrderConfirmation = (
    to: string,
    orderData: {
      orderNumber: string;
      firstName?: string;
      items: Array<{ name: string; size?: string; quantity: number; unitPrice: number }>;
      subtotal: number;
      shippingFee?: number;
      discount?: number;
      total: number;
      shippingAddress?: EmailData["shippingAddress"];
      estimatedDelivery?: string;
    }
  ) => sendTemplateEmail({ to, template: "order_confirmation", data: orderData });

  const sendOrderShipped = (
    to: string,
    data: {
      orderNumber: string;
      firstName?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      carrier?: string;
      estimatedDelivery?: string;
    }
  ) => sendTemplateEmail({ to, template: "order_shipped", data });

  const sendOrderDelivered = (
    to: string,
    data: { orderNumber: string; firstName?: string }
  ) => sendTemplateEmail({ to, template: "order_delivered", data });

  const sendTeamNotification = (
    to: string | string[],
    orderData: {
      orderNumber: string;
      customerEmail: string;
      total: number;
      items: Array<{ name: string; size?: string; quantity: number; unitPrice?: number }>;
      isSubscription?: boolean;
    }
  ) => sendTemplateEmail({ to, template: "team_order_notification", data: orderData as EmailData });

  return {
    sendTemplateEmail,
    sendCustomEmail,
    // Convenience methods
    sendWelcomeEmail,
    sendOrderConfirmation,
    sendOrderShipped,
    sendOrderDelivered,
    sendTeamNotification,
  };
}
