import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Mail, CheckCircle, Package, Truck, User, AlertTriangle, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmailPreview = () => {
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const { toast } = useToast();

  // Sample data for previews
  const sampleData: Record<string, Record<string, unknown>> = {
    welcome: {
      firstName: "Marie",
      ctaUrl: "https://serencare.be/compte",
    },
    order_confirmation: {
      firstName: "Marie",
      orderNumber: "SC-2026-001234",
      items: [
        { name: "TENA Pants Plus", size: "Medium", quantity: 2, unitPrice: 24.90 },
        { name: "TENA Bed Plus", size: null, quantity: 1, unitPrice: 18.50 },
      ],
      subtotal: 68.30,
      shippingFee: 0,
      discount: 5.00,
      total: 63.30,
      shippingAddress: {
        firstName: "Marie",
        lastName: "Dupont",
        address: "123 Rue de la Paix",
        postalCode: "1000",
        city: "Bruxelles",
        country: "Belgique",
      },
      estimatedDelivery: "Lundi 13 janvier 2026",
    },
    order_shipped: {
      firstName: "Marie",
      orderNumber: "SC-2026-001234",
      trackingNumber: "BE123456789",
      trackingUrl: "https://track.bpost.be/BE123456789",
      carrier: "bpost",
      estimatedDelivery: "Lundi 13 janvier 2026",
    },
    order_delivered: {
      firstName: "Marie",
      orderNumber: "SC-2026-001234",
    },
    order_status: {
      firstName: "Marie",
      orderNumber: "SC-2026-001234",
      status: "preparing",
      message: "Votre commande est en cours de préparation dans notre entrepôt.",
    },
    subscription_created: {
      firstName: "Marie",
      nextDeliveryDate: "15 février 2026",
      frequency: "mensuelle",
    },
    team_order_notification: {
      orderNumber: "SC-2026-001234",
      customerEmail: "marie.dupont@example.com",
      total: 63.30,
      items: [
        { name: "TENA Pants Plus", size: "Medium", quantity: 2 },
        { name: "TENA Bed Plus", size: null, quantity: 1 },
      ],
      isSubscription: true,
    },
    password_reset: {
      firstName: "Marie",
      resetUrl: "https://serencare.be/reset-password?token=abc123",
    },
    email_verification: {
      firstName: "Marie",
      verificationUrl: "https://serencare.be/verify?token=abc123",
    },
  };

  const templates = [
    { id: "welcome", name: "Bienvenue", icon: User, description: "Email de bienvenue après inscription" },
    { id: "order_confirmation", name: "Confirmation commande", icon: CheckCircle, description: "Confirmation après paiement" },
    { id: "order_shipped", name: "Colis expédié", icon: Truck, description: "Notification d'expédition" },
    { id: "order_delivered", name: "Colis livré", icon: Package, description: "Confirmation de livraison" },
    { id: "order_status", name: "Statut commande", icon: AlertTriangle, description: "Mise à jour du statut" },
    { id: "subscription_created", name: "Abonnement créé", icon: Mail, description: "Confirmation d'abonnement" },
    { id: "team_order_notification", name: "Notification équipe", icon: Mail, description: "Alerte interne nouvelle commande" },
    { id: "password_reset", name: "Mot de passe", icon: Mail, description: "Réinitialisation mot de passe" },
    { id: "email_verification", name: "Vérification email", icon: Mail, description: "Confirmation adresse email" },
  ];

  // Generate real HTML preview by calling edge function with preview mode
  const generatePreview = async () => {
    setIsLoadingPreview(true);
    try {
      const templateData = sampleData[selectedTemplate] || {};
      
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: "preview@example.com",
          template: selectedTemplate,
          data: templateData,
          preview: true, // Request preview mode - don't actually send
        },
      });

      if (error) throw error;
      
      if (data?.html) {
        setPreviewHtml(data.html);
      }
    } catch (error: unknown) {
      console.error("Error generating preview:", error);
      // Fallback: show placeholder
      setPreviewHtml(`
        <div style="padding: 40px; text-align: center; font-family: sans-serif;">
          <p style="color: #666;">Impossible de charger l'aperçu.</p>
          <p style="color: #999; font-size: 14px;">Envoyez un email de test pour voir le rendu réel.</p>
        </div>
      `);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Load preview when template changes
  useEffect(() => {
    generatePreview();
  }, [selectedTemplate]);

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer une adresse email de test.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const templateData = sampleData[selectedTemplate] || {};
      
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: testEmail,
          template: selectedTemplate,
          data: templateData,
        },
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: `L'email de test "${templates.find(t => t.id === selectedTemplate)?.name}" a été envoyé à ${testEmail}.`,
      });
    } catch (error: unknown) {
      console.error("Error sending test email:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer l'email de test.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Prévisualisation des emails - Admin SerenCare</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Système d'emails SerenCare</h1>
              <p className="text-muted-foreground">Prévisualisez et testez les templates d'emails</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Sidebar - Template List */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Templates disponibles</CardTitle>
                  <CardDescription>Sélectionnez un template à prévisualiser</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                        selectedTemplate === template.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <template.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className={`text-xs ${selectedTemplate === template.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {template.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Test Email Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Envoyer un test</CardTitle>
                  <CardDescription>Testez le template sélectionné</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleSendTest}
                    disabled={isSending || !testEmail}
                    className="w-full"
                  >
                    {isSending ? (
                      <>Envoi en cours...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer le test
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Prévisualisation HTML réelle</CardTitle>
                  <CardDescription>
                    Aperçu du template "{templates.find(t => t.id === selectedTemplate)?.name}"
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePreview}
                  disabled={isLoadingPreview}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingPreview ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="desktop">
                  <TabsList className="mb-4">
                    <TabsTrigger value="desktop">
                      <Eye className="h-4 w-4 mr-2" />
                      Desktop
                    </TabsTrigger>
                    <TabsTrigger value="mobile">Mobile</TabsTrigger>
                    <TabsTrigger value="data">Données</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="desktop">
                    <div className="border rounded-lg overflow-hidden bg-muted/50">
                      <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {templates.find(t => t.id === selectedTemplate)?.name} - Preview
                        </span>
                      </div>
                      <div className="bg-[#f8f9fc] min-h-[600px]">
                        {isLoadingPreview ? (
                          <div className="flex items-center justify-center h-[600px]">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <iframe
                            srcDoc={previewHtml}
                            className="w-full h-[700px] border-0"
                            title="Email Preview"
                            sandbox="allow-same-origin"
                          />
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mobile">
                    <div className="flex justify-center">
                      <div className="w-[375px] border rounded-[2rem] overflow-hidden bg-muted/50 shadow-xl">
                        <div className="bg-black h-8 flex items-center justify-center">
                          <div className="w-20 h-4 bg-black rounded-full" />
                        </div>
                        <div className="h-[667px] overflow-auto bg-[#f8f9fc]">
                          {isLoadingPreview ? (
                            <div className="flex items-center justify-center h-full">
                              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <iframe
                              srcDoc={previewHtml}
                              className="w-full h-full border-0"
                              title="Email Preview Mobile"
                              sandbox="allow-same-origin"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="data">
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-medium mb-2">Données du template</h4>
                      <pre className="text-sm overflow-auto bg-background p-4 rounded border max-h-[500px]">
                        {JSON.stringify(sampleData[selectedTemplate] || {}, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailPreview;